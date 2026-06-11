"""Dashboard overview metrics — envelope so the UI can swap a stub for a real
source (CloudFront logs / Plausible) later without changing the contract.
"""

from pydantic import BaseModel


class OverviewMetrics(BaseModel):
    project_count: int = 0
    contact_count: int = 0
    # Reserved for a future analytics source.
    visitors_30d: int | None = None
