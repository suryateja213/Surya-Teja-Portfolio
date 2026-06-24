"""Tests for the public skill-graph endpoint and its matching logic."""

from app.content import portfolio
from app.services.skill_graph_service import build_skill_graph


def test_skill_graph_endpoint_returns_nodes_and_edges(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.get("/v1/skill-graph")
    assert resp.status_code == 200
    body = resp.json()
    assert "nodes" in body and "edges" in body
    # Every flattened skill is a node, plus the two experiences.
    skill_count = len(portfolio.all_skills())
    kinds = [n["kind"] for n in body["nodes"]]
    assert kinds.count("skill") == skill_count
    assert kinds.count("experience") == len(portfolio.EXPERIENCE)


def test_skill_graph_is_public(client) -> None:  # type: ignore[no-untyped-def]
    # No auth/origin needed — it's a public read. (`client` provides the
    # moto-mocked table that the project lookup queries.)
    resp = client.get("/v1/skill-graph")
    assert resp.status_code == 200


def test_kafka_skill_connects_to_ge_experience(dynamodb_table) -> None:  # type: ignore[no-untyped-def]
    """The 'Apache Kafka' skill should edge to GE HealthCare via its 'Kafka' stack tag."""
    graph = build_skill_graph()
    kafka_id = "skill:apache-kafka"
    ge_id = "experience:ge-healthcare"
    pairs = {(e.source, e.target) for e in graph.edges}
    assert (kafka_id, ge_id) in pairs


def test_aws_skill_matches_aws_eks_stack_tag(dynamodb_table) -> None:  # type: ignore[no-untyped-def]
    """The combined 'AWS (EKS, ...)' skill should match the 'AWS EKS' stack tag."""
    graph = build_skill_graph()
    aws_node = next(n for n in graph.nodes if n.label.startswith("AWS ("))
    ge_id = "experience:ge-healthcare"
    pairs = {(e.source, e.target) for e in graph.edges}
    assert (aws_node.id, ge_id) in pairs


def test_unrelated_skill_has_no_false_edge(dynamodb_table) -> None:  # type: ignore[no-untyped-def]
    """GraphQL appears in no stack, so it should connect to no experience."""
    graph = build_skill_graph()
    graphql_id = "skill:graphql"
    # GraphQL may legitimately have zero edges; assert it has no experience edge.
    exp_targets = {
        e.target
        for e in graph.edges
        if e.source == graphql_id and e.target.startswith("experience:")
    }
    assert exp_targets == set()
