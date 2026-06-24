"""Build the BM25 RAG index from the portfolio content.

Run from `backend/`:  python scripts/build_rag_index.py

Writes `app/rag/index.json` (committed + bundled into the Lambda zip). CI runs
this and fails if the committed file drifts from the content, so the index is
always in sync with `app/content/portfolio.py`.
"""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

# Allow running as a plain script (python scripts/build_rag_index.py).
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.rag.chunks import build_chunks  # noqa: E402
from app.rag.retriever import tokenize  # noqa: E402

_OUTPUT = Path(__file__).resolve().parents[1] / "app" / "rag" / "index.json"


def build_index() -> dict:
    chunks = build_chunks()
    docs = []
    df: Counter[str] = Counter()
    total_len = 0

    for chunk in chunks:
        tokens = tokenize(chunk.text)
        tf = Counter(tokens)
        total_len += len(tokens)
        for term in tf:
            df[term] += 1
        docs.append(
            {
                "id": chunk.id,
                "text": chunk.text,
                "source_ref": chunk.source_ref,
                "source_title": chunk.source_title,
                "href": chunk.href,
                "tf": dict(tf),
                "len": len(tokens),
            }
        )

    avgdl = total_len / len(docs) if docs else 0.0
    return {"chunks": docs, "df": dict(df), "avgdl": avgdl}


def main() -> None:
    index = build_index()
    # Deterministic output (sorted keys) so the committed file is stable.
    _OUTPUT.write_text(
        json.dumps(index, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {_OUTPUT} ({len(index['chunks'])} chunks)")


if __name__ == "__main__":
    main()
