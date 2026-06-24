from fastapi import APIRouter

from app.schemas.skill_graph import SkillGraph
from app.services import skill_graph_service

router = APIRouter()


@router.get(
    "/skill-graph",
    response_model=SkillGraph,
    summary="Skill knowledge graph (skills ↔ experience ↔ projects)",
)
def get_skill_graph() -> SkillGraph:
    return skill_graph_service.build_skill_graph()
