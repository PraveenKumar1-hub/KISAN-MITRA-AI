"""
Agricultural Market / Mandi Price Service
Integrates with the official Indian Government Open Government Data (data.gov.in)
Agmarknet Daily Mandi Prices API (Resource: 9ef84268-d588-465a-a308-a864a43d0070).

Features:
- Live APMC commodity rates when DATA_GOV_IN_API_KEY is configured
- Deterministic unconfigured state when API key is missing (Zero fake prices)
- Safe query filtering by commodity (crop) and state/district (location)
- 10-minute in-memory response cache to minimize rate-limit usage
- Real price summaries (lowest, highest, average) derived strictly from returned records
- Standardized error and no-data handling
"""

import time
import urllib.request
import urllib.parse
import json
from typing import Optional, Dict, Any, List
from app.core.config import settings

# In-memory cache: { cache_key: (timestamp, normalized_data) }
_MARKET_CACHE: Dict[str, tuple[float, Dict[str, Any]]] = {}
CACHE_TTL_SECONDS = 600  # 10 minutes


def fetch_market_prices(
    crop: Optional[str] = None,
    location: Optional[str] = None,
    user_crop: Optional[str] = None
) -> Dict[str, Any]:
    """
    Retrieves normalized agricultural mandi price data from the configured
    official data source.
    """
    # 1. Determine active crop filter (query crop or user's registered primary crop)
    active_crop = crop.strip() if crop and crop.strip() else (user_crop.strip() if user_crop and user_crop.strip() else None)
    active_location = location.strip() if location and location.strip() else None

    # 2. Check if API key is configured
    api_key = settings.DATA_GOV_IN_API_KEY.strip() if settings.DATA_GOV_IN_API_KEY else ""
    if not api_key:
        return {
            "success": True,
            "configured": False,
            "status": "unconfigured",
            "source": "Government Mandi Network (data.gov.in / Agmarknet)",
            "last_updated": None,
            "selected_crop": active_crop,
            "selected_location": active_location,
            "results": [],
            "summary": None,
            "message": "Market data source is not configured yet. Configure DATA_GOV_IN_API_KEY in the backend to access live APMC mandi rates."
        }

    # 3. Check in-memory cache
    clean_crop_key = active_crop.lower() if active_crop else "all"
    clean_loc_key = active_location.lower() if active_location else "all"
    cache_key = f"{clean_crop_key}:{clean_loc_key}"
    now = time.time()
    if cache_key in _MARKET_CACHE:
        cached_time, cached_data = _MARKET_CACHE[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_data

    # 4. Build query URL to data.gov.in APMC Mandi API
    params: Dict[str, str] = {
        "api-key": api_key,
        "format": "json",
        "limit": "100"
    }
    if active_crop:
        params["filters[commodity]"] = active_crop

    encoded_query = urllib.parse.urlencode(params)
    url = f"{settings.MANDI_API_URL}?{encoded_query}"

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "KisanMitraAI/1.0",
            "Accept": "application/json"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status != 200:
                return {
                    "success": False,
                    "configured": True,
                    "status": "error",
                    "source": "Government Mandi Network (data.gov.in / Agmarknet)",
                    "last_updated": None,
                    "selected_crop": active_crop,
                    "selected_location": active_location,
                    "results": [],
                    "summary": None,
                    "message": "Market data is temporarily unavailable. Please try again."
                }

            raw_bytes = response.read()
            payload = json.loads(raw_bytes.decode("utf-8"))

    except urllib.error.HTTPError as he:
        print(f"[MarketService] HTTP error from data.gov.in: {he.code} {he.reason}")
        return {
            "success": False,
            "configured": True,
            "status": "error",
            "source": "Government Mandi Network (data.gov.in / Agmarknet)",
            "last_updated": None,
            "selected_crop": active_crop,
            "selected_location": active_location,
            "results": [],
            "summary": None,
            "message": "Market data is temporarily unavailable."
        }
    except Exception as e:
        print(f"[MarketService] Connection or parsing error: {e}")
        return {
            "success": False,
            "configured": True,
            "status": "error",
            "source": "Government Mandi Network (data.gov.in / Agmarknet)",
            "last_updated": None,
            "selected_crop": active_crop,
            "selected_location": active_location,
            "results": [],
            "summary": None,
            "message": "Market data is temporarily unavailable."
        }

    # 5. Parse and normalize real records
    raw_records: List[Dict[str, Any]] = payload.get("records", [])
    if not raw_records:
        no_data_resp = {
            "success": True,
            "configured": True,
            "status": "no_data",
            "source": "Government Mandi Network (data.gov.in / Agmarknet)",
            "last_updated": payload.get("updated_date"),
            "selected_crop": active_crop,
            "selected_location": active_location,
            "results": [],
            "summary": None,
            "message": "No market data found for the selected crop/location."
        }
        _MARKET_CACHE[cache_key] = (now, no_data_resp)
        return no_data_resp

    normalized_results: List[Dict[str, Any]] = []
    prices: List[float] = []
    latest_date: Optional[str] = payload.get("updated_date")

    for rec in raw_records:
        # If location filter was provided, filter by state, district, or market
        if active_location:
            loc_lower = active_location.lower()
            rec_state = str(rec.get("state", "")).lower()
            rec_dist = str(rec.get("district", "")).lower()
            rec_mkt = str(rec.get("market", "")).lower()
            if loc_lower not in rec_state and loc_lower not in rec_dist and loc_lower not in rec_mkt:
                continue

        # Extract numerical price safely
        try:
            modal = float(rec.get("modal_price", 0))
        except (ValueError, TypeError):
            modal = 0.0

        try:
            min_p = float(rec.get("min_price", 0))
        except (ValueError, TypeError):
            min_p = 0.0

        try:
            max_p = float(rec.get("max_price", 0))
        except (ValueError, TypeError):
            max_p = 0.0

        # Primary display price is modal price, fallback to max or min
        disp_price = modal if modal > 0 else (max_p if max_p > 0 else min_p)
        if disp_price <= 0:
            # Per instruction: Do NOT show a price if the API did not provide it.
            continue

        prices.append(disp_price)

        arrival_date = rec.get("arrival_date")
        if arrival_date and not latest_date:
            latest_date = str(arrival_date)

        normalized_results.append({
            "crop": rec.get("commodity", active_crop or "General"),
            "variety": rec.get("variety", "General"),
            "market": rec.get("market", "APMC Mandi"),
            "district": rec.get("district", ""),
            "state": rec.get("state", ""),
            "price": round(disp_price, 2),
            "min_price": round(min_p, 2) if min_p > 0 else None,
            "max_price": round(max_p, 2) if max_p > 0 else None,
            "modal_price": round(modal, 2) if modal > 0 else None,
            "unit": "Rs/Quintal",
            "date": str(arrival_date) if arrival_date else None,
            "source": "Agmarknet (data.gov.in)"
        })

    if not normalized_results:
        no_match_resp = {
            "success": True,
            "configured": True,
            "status": "no_data",
            "source": "Government Mandi Network (data.gov.in / Agmarknet)",
            "last_updated": latest_date,
            "selected_crop": active_crop,
            "selected_location": active_location,
            "results": [],
            "summary": None,
            "message": "No market data found for the selected crop/location."
        }
        _MARKET_CACHE[cache_key] = (now, no_match_resp)
        return no_match_resp

    # 6. Calculate real summary metrics
    summary = None
    if prices:
        summary = {
            "lowest_price": round(min(prices), 2),
            "highest_price": round(max(prices), 2),
            "average_price": round(sum(prices) / len(prices), 2),
            "unit": "Rs/Quintal",
            "total_records": len(prices)
        }

    success_resp = {
        "success": True,
        "configured": True,
        "status": "success",
        "source": "Government Mandi Network (data.gov.in / Agmarknet)",
        "last_updated": latest_date,
        "selected_crop": active_crop,
        "selected_location": active_location,
        "results": normalized_results,
        "summary": summary,
        "message": None
    }

    _MARKET_CACHE[cache_key] = (now, success_resp)
    return success_resp
