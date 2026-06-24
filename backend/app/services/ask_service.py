"""Ask Surya AI — RAG over the portfolio content, answered by Claude.

Flow per question:
  1. Reserve budget atomically (a DynamoDB daily counter) — hard-caps spend.
  2. Retrieve the top chunks with BM25 (in-memory, instant).
  3. Call Claude once with the retrieved context as a grounded system prompt.
  4. Map the cited chunks to citations + related skill-graph nodes.
  5. Log an AIQUERY item (no answer text) for later observability.

The Anthropic call is isolated in `_generate_answer` so the rest is testable
without a key or network. With no key configured the endpoint raises
`AiUnavailable`, which the API turns into a graceful 503.
"""

from __future__ import annotations

import logging
import re
import time
from datetime import UTC, datetime, timedelta
from functools import lru_cache
from typing import Any

from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

from app.content import portfolio
from app.core.config import get_settings
from app.db.dynamodb import GSI1_NAME, META_SK, aibudget_pk, get_table
from app.models.ai_query import item_to_ai_query_read, new_ai_query_item
from app.rag.retriever import RetrievedChunk, retrieve
from app.schemas.ask import AiQueryRead, AskCitation, AskResponse
from app.schemas.common import Page, decode_cursor, encode_cursor

logger = logging.getLogger(__name__)

_GSI1PK_AIQUERY = "AIQUERY"
_BUDGET_TTL_DAYS = 2

_SYSTEM_PROMPT = (
    "You are an assistant on Surya Teja Kommuguri's portfolio site. You answer "
    "recruiters' and hiring managers' questions about Surya's engineering "
    "background, using ONLY the context provided. Be concise (2-4 sentences), "
    "specific, and lead with concrete facts and numbers. If the context doesn't "
    "cover the question, say so briefly and suggest contacting Surya directly. "
    "Refer to him as 'Surya'. Never invent experience that isn't in the context."
)


class AiUnavailable(Exception):
    """Raised when the AI feature is not configured (no API key)."""


class AiRateLimited(Exception):
    """Raised when today's AI question cap has been reached."""


def _today() -> str:
    return datetime.now(UTC).strftime("%Y-%m-%d")


def _reserve_budget(cap: int) -> None:
    """Atomically claim one unit of today's AI budget, or raise AiRateLimited.

    A single conditional UpdateItem increments the day's counter only while it's
    below the cap — so spend is hard-capped regardless of concurrency, with no
    Redis needed. The item self-expires via TTL.
    """
    expires_at = int((datetime.now(UTC) + timedelta(days=_BUDGET_TTL_DAYS)).timestamp())
    try:
        get_table().update_item(
            Key={"PK": aibudget_pk(_today()), "SK": META_SK},
            UpdateExpression=(
                "SET expiresAt = if_not_exists(expiresAt, :exp), entity = :entity " "ADD #c :one"
            ),
            ConditionExpression="attribute_not_exists(#c) OR #c < :cap",
            ExpressionAttributeNames={"#c": "count"},
            ExpressionAttributeValues={
                ":one": 1,
                ":cap": cap,
                ":exp": expires_at,
                ":entity": "AIBUDGET",
            },
        )
    except ClientError as err:
        if err.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise AiRateLimited from None
        raise


def _related_skills(chunks: list[RetrievedChunk]) -> list[str]:
    """Skill-graph node ids implied by the retrieved chunks.

    Skill-group chunks map to their member skills; other chunks contribute the
    skills whose label appears in the chunk text. Returns `skill:<slug>` ids that
    line up with the skill-graph nodes so the frontend can highlight/jump.
    """
    skills = portfolio.all_skills()
    found: list[str] = []
    seen: set[str] = set()
    text_blob = " ".join(c.text.lower() for c in chunks)
    for skill in skills:
        # Match the bare label, or the first word for multi-word labels.
        label = skill.label.lower()
        primary = re.split(r"[^a-z0-9]+", label)[0]
        if (
            label in text_blob or (len(primary) > 3 and primary in text_blob)
        ) and skill.id not in seen:
            seen.add(skill.id)
            found.append(f"skill:{skill.id}")
    return found[:8]


def _citations(chunks: list[RetrievedChunk]) -> list[AskCitation]:
    return [
        AskCitation(
            ref=c.source_ref,
            title=c.source_title,
            snippet=(c.text[:160] + "…") if len(c.text) > 160 else c.text,
            href=c.href,
        )
        for c in chunks
    ]


@lru_cache(maxsize=1)
def _client() -> Any:
    """Cached Anthropic client (reused across warm invocations)."""
    from anthropic import Anthropic

    settings = get_settings()
    return Anthropic(api_key=settings.anthropic_api_key)


def _generate_answer(question: str, chunks: list[RetrievedChunk]) -> tuple[str, int, int]:
    """Call Claude with the retrieved context. Returns (answer, in_tok, out_tok).

    Isolated so the surrounding orchestration is testable without a network call.
    """
    settings = get_settings()
    context = "\n\n".join(f"[{c.source_title}]\n{c.text}" for c in chunks)
    message = _client().messages.create(
        model=settings.anthropic_model,
        max_tokens=1024,
        system=_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Context about Surya:\n\n{context}\n\nQuestion: {question}",
            }
        ],
    )
    answer = "".join(block.text for block in message.content if block.type == "text").strip()
    usage = getattr(message, "usage", None)
    in_tok = getattr(usage, "input_tokens", 0) if usage else 0
    out_tok = getattr(usage, "output_tokens", 0) if usage else 0
    return answer, in_tok, out_tok


def ask(question: str) -> AskResponse:
    """Answer a question over the portfolio content. The public entry point."""
    settings = get_settings()
    if not settings.anthropic_api_key:
        raise AiUnavailable

    _reserve_budget(settings.ai_daily_cap)

    started = time.perf_counter()
    chunks = retrieve(question, k=4)
    answer, in_tok, out_tok = _generate_answer(question, chunks)
    latency_ms = int((time.perf_counter() - started) * 1000)

    citations = _citations(chunks)
    related = _related_skills(chunks)

    # Log the query (best-effort — never fail the answer on a logging error).
    try:
        get_table().put_item(
            Item=new_ai_query_item(
                question=question,
                sources=[c.source_ref for c in chunks],
                answer_chars=len(answer),
                latency_ms=latency_ms,
                model=settings.anthropic_model,
                input_tokens=in_tok,
                output_tokens=out_tok,
            )
        )
    except ClientError:
        logger.exception("failed to log AI query")

    return AskResponse(answer=answer, sources=citations, relatedSkills=related)


def list_ai_queries(limit: int = 25, cursor: str | None = None) -> Page[AiQueryRead]:
    """A page of past AI queries, newest first (admin only)."""
    table = get_table()
    query_args: dict[str, Any] = {
        "IndexName": GSI1_NAME,
        "KeyConditionExpression": Key("GSI1PK").eq(_GSI1PK_AIQUERY),
        "ScanIndexForward": False,
        "Limit": limit,
    }
    start_key = decode_cursor(cursor)
    if start_key:
        query_args["ExclusiveStartKey"] = start_key

    response = table.query(**query_args)
    items = [item_to_ai_query_read(item) for item in response.get("Items", [])]
    return Page(items=items, next_cursor=encode_cursor(response.get("LastEvaluatedKey")))
