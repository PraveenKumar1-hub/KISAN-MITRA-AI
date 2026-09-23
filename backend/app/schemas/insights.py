from typing import List, Optional, Dict
from pydantic import BaseModel


class InsightItem(BaseModel):
    id: str
    type: str  # "weather" | "irrigation" | "crop" | "plant_health" | "market"
    priority: str  # "high" | "medium" | "low" | "info"
    title: str
    message: str
    action_label: Optional[str] = None
    action_route: Optional[str] = None
    source_name: str
    reasons: Optional[List[str]] = None


class RecommendedAction(BaseModel):
    id: str
    category: str  # "Irrigation" | "Crop Planning" | "Plant Protection" | "Weather Alert" | "Market Watch"
    priority: str  # "high" | "medium" | "low" | "info"
    title: str
    short_explanation: str
    action_label: str
    action_route: str


class DataSourceStatus(BaseModel):
    name: str
    status: str  # "available" | "unavailable" | "not_analyzed" | "not_configured"
    label: str
    last_updated: Optional[str] = None
    details: Optional[str] = None


class FarmIntelligenceResponse(BaseModel):
    status: str  # "success" | "partial"
    generated_at: str
    farmer_name: str
    location: Optional[str] = None
    summary: str
    insights: List[InsightItem]
    actions: List[RecommendedAction]
    data_sources: Dict[str, DataSourceStatus]
