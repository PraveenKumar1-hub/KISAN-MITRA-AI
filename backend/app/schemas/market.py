from typing import List, Optional
from pydantic import BaseModel

class MarketPriceItem(BaseModel):
    crop: str
    variety: Optional[str] = None
    market: str
    district: Optional[str] = None
    state: Optional[str] = None
    price: float
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    modal_price: Optional[float] = None
    unit: str = "Rs/Quintal"
    date: Optional[str] = None
    source: Optional[str] = None

class PriceSummary(BaseModel):
    lowest_price: float
    highest_price: float
    average_price: float
    unit: str = "Rs/Quintal"
    total_records: int

class MarketPriceResponse(BaseModel):
    success: bool
    configured: bool
    status: str  # "success" | "no_data" | "unconfigured" | "error"
    source: str
    last_updated: Optional[str] = None
    selected_crop: Optional[str] = None
    selected_location: Optional[str] = None
    results: List[MarketPriceItem] = []
    summary: Optional[PriceSummary] = None
    message: Optional[str] = None
