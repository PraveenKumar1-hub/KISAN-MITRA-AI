"""
Smart Irrigation Advisory Service.
Generates transparent, rule-based irrigation guidance by evaluating:
- Real-time and forecasted weather parameters (from Open-Meteo)
- Farmer's registered soil type, irrigation infrastructure, and primary crop
- Rotational and crop-specific water requirements
"""

import time
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.services.weather_service import fetch_weather_for_location
from app.db.models import IrrigationLog

from datetime import datetime, timezone

# Structured crop water demand characteristics
CROP_WATER_PROFILES: Dict[str, Dict[str, Any]] = {
    "rice": {"water_requirement": "High", "sensitivity": "High", "label": "Rice"},
    "paddy": {"water_requirement": "High", "sensitivity": "High", "label": "Paddy (Rice)"},
    "sugarcane": {"water_requirement": "High", "sensitivity": "High", "label": "Sugarcane"},
    "wheat": {"water_requirement": "Moderate", "sensitivity": "Medium", "label": "Wheat"},
    "maize": {"water_requirement": "Moderate", "sensitivity": "Medium", "label": "Maize"},
    "cotton": {"water_requirement": "Moderate to High", "sensitivity": "Medium", "label": "Cotton"},
    "groundnut": {"water_requirement": "Moderate", "sensitivity": "Medium", "label": "Groundnut"},
    "soybean": {"water_requirement": "Moderate", "sensitivity": "Medium", "label": "Soybean"},
    "potato": {"water_requirement": "Moderate", "sensitivity": "Medium", "label": "Potato"},
    "tomato": {"water_requirement": "Moderate", "sensitivity": "High", "label": "Tomato"},
    "onion": {"water_requirement": "Moderate", "sensitivity": "Medium", "label": "Onion"},
    "mustard": {"water_requirement": "Low", "sensitivity": "Low", "label": "Mustard"},
    "chickpea": {"water_requirement": "Low", "sensitivity": "Low", "label": "Chickpea"},
    "gram": {"water_requirement": "Low", "sensitivity": "Low", "label": "Gram / Chickpea"},
    "bajra": {"water_requirement": "Low", "sensitivity": "Low", "label": "Bajra (Pearl Millet)"},
    "millet": {"water_requirement": "Low", "sensitivity": "Low", "label": "Millet"},
    "barley": {"water_requirement": "Low", "sensitivity": "Low", "label": "Barley"},
}

def get_crop_profile(crop_name: Optional[str]) -> Optional[Dict[str, Any]]:
    if not crop_name or not crop_name.strip():
        return None
    clean = crop_name.strip().lower()
    for key, profile in CROP_WATER_PROFILES.items():
        if key in clean or clean in key:
            return profile
    return None


def generate_irrigation_advisory(user: Any, db: Optional[Session] = None) -> Dict[str, Any]:
    """
    Evaluates real weather data and farm profile parameters to generate
    an honest, deterministic irrigation recommendation.
    """
    location = getattr(user, "location", None)
    soil_type = getattr(user, "soil_type", None)
    irrigation_type = getattr(user, "irrigation_type", None)
    primary_crop = getattr(user, "primary_crop", None)
    farm_size = getattr(user, "farm_size", None)
    user_id = getattr(user, "id", None)

    # 1. Identify missing parameters
    missing_parameters: List[str] = []
    if not location or not str(location).strip():
        missing_parameters.append("Location")
    if not soil_type or not str(soil_type).strip():
        missing_parameters.append("Soil Type")
    if not irrigation_type or not str(irrigation_type).strip():
        missing_parameters.append("Irrigation Type")
    if not primary_crop or not str(primary_crop).strip():
        missing_parameters.append("Primary Crop")

    # 2. Fetch real weather data
    if not location or not str(location).strip():
        return {
            "success": False,
            "status": "insufficient_data",
            "status_label": "Insufficient information",
            "priority": "Low",
            "recommendation": "Complete your farm profile with your farm location to receive localized irrigation guidance.",
            "reasons": [
                "Farm location is not registered in your profile",
                "Weather coordinates cannot be determined without a location"
            ],
            "farm_summary": _build_farm_summary(user),
            "weather_summary": None,
            "missing_parameters": missing_parameters,
            "history": _get_history(user_id, db),
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }

    weather = fetch_weather_for_location(str(location).strip())

    if not weather.get("success") or not weather.get("current"):
        return {
            "success": False,
            "status": "insufficient_data",
            "status_label": "Insufficient information",
            "priority": "Low",
            "recommendation": "Insufficient weather information for a reliable irrigation advisory.",
            "reasons": [
                weather.get("message", "Weather data is currently unreachable"),
                "Localized weather forecast is required to compute moisture balance"
            ],
            "farm_summary": _build_farm_summary(user),
            "weather_summary": None,
            "missing_parameters": missing_parameters,
            "history": _get_history(user_id, db),
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }

    curr_weather = weather["current"]
    forecast = weather.get("forecast", [])

    # Extract real weather metrics
    current_temp = curr_weather["temperature"]
    humidity = curr_weather["humidity"]
    curr_rain = curr_weather["rainfall"]
    wind_speed = curr_weather["wind_speed"]
    condition = curr_weather["weather_condition"]

    # 48-hour rainfall projection from forecast
    upcoming_rain_48h = sum(f.get("precipitation_sum", 0.0) for f in forecast[:2])
    max_rain_prob_48h = max((f.get("precipitation_probability", 0) for f in forecast[:2]), default=0)

    weather_summary = {
        "temperature": current_temp,
        "humidity": humidity,
        "rainfall": curr_rain,
        "wind_speed": wind_speed,
        "rain_probability": max_rain_prob_48h,
        "expected_rainfall_48h": round(upcoming_rain_48h, 1),
        "weather_condition": condition
    }

    # 3. Crop profile lookup
    crop_info = get_crop_profile(primary_crop)
    water_req = crop_info["water_requirement"] if crop_info else "Moderate"

    # 4. Evaluate transparent rule engine
    reasons: List[str] = []
    status: str
    status_label: str
    priority: str
    recommendation: str

    clean_soil = str(soil_type).lower() if soil_type else ""
    clean_irr = str(irrigation_type).lower() if irrigation_type else ""

    # RULE A: Significant rainfall expected soon (>= 5.0 mm or >= 2.5 mm with >= 45% prob)
    if upcoming_rain_48h >= 5.0 or (upcoming_rain_48h >= 2.5 and max_rain_prob_48h >= 45):
        status = "delay"
        status_label = "Consider delaying irrigation"
        priority = "High" if upcoming_rain_48h >= 10.0 else "Medium"
        recommendation = "Rain is expected soon. Consider delaying irrigation and check soil moisture before watering."
        reasons.append(f"Forecast indicates upcoming precipitation ({upcoming_rain_48h:.1f} mm expected with {max_rain_prob_48h}% probability).")
        reasons.append("Delaying irrigation utilizes natural rainfall, prevents nutrient leaching, and saves water.")
        if "clay" in clean_soil or "black" in clean_soil:
            reasons.append(f"Your registered {soil_type} soil has high water retention; additional watering risks root waterlogging.")
        if "drip" in clean_irr:
            reasons.append("Precision drip lines can be quickly reactivated post-rain if soil moisture levels drop.")

    # RULE B: Recent rainfall detected (> 1.5 mm current or recent showers)
    elif curr_rain >= 1.5 or (forecast and forecast[0].get("precipitation_sum", 0) >= 3.0):
        status = "check_moisture"
        status_label = "Check soil moisture"
        priority = "Medium"
        recommendation = "Recent precipitation detected. Check soil moisture before applying additional irrigation."
        reasons.append("Recent localized rainfall has replenished topsoil moisture.")
        reasons.append("Conduct a physical soil squeeze test or sensor check at root depth before operating pumps.")
        if crop_info:
            reasons.append(f"Avoid over-saturating root zones for {crop_info['label']}.")

    # RULE C: Light rain or scattered showers forecast (< 2.5 mm but prob >= 45%)
    elif max_rain_prob_48h >= 45 or upcoming_rain_48h >= 1.0:
        status = "check_moisture"
        status_label = "Check soil moisture"
        priority = "Low"
        recommendation = "Light rain or scattered showers possible. Check localized soil moisture before applying scheduled water."
        reasons.append(f"Isolated moisture possible ({upcoming_rain_48h:.1f} mm forecast, {max_rain_prob_48h}% probability).")
        reasons.append("Assess local topsoil dampness to determine whether top-up watering is needed.")
        if crop_info:
            reasons.append(f"Align moisture levels with {crop_info['label']} growth stage requirements.")

    # RULE D: Dry conditions and warm temperatures (>= 30°C and upcoming rain < 1 mm)
    elif current_temp >= 30.0 and upcoming_rain_48h < 1.0 and max_rain_prob_48h < 35:
        status = "needed"
        status_label = "Irrigation may be needed"
        priority = "High" if current_temp >= 36.0 or water_req == "High" else "Medium"
        recommendation = "Dry conditions and elevated temperatures detected. Verify soil moisture and schedule irrigation."
        reasons.append(f"Warm temperature ({current_temp}°C) accelerates crop evapotranspiration.")
        reasons.append(f"Minimal rainfall ({upcoming_rain_48h:.1f} mm, {max_rain_prob_48h}% prob) projected over the next 48 hours.")
        if crop_info:
            reasons.append(f"{crop_info['label']} has {water_req.lower()} water requirements during active growth.")
        if "sand" in clean_soil:
            reasons.append(f"{soil_type} soil drains rapidly; monitor root zones more frequently.")
        if "drip" in clean_irr:
            reasons.append("Schedule drip irrigation during early morning or late afternoon to minimize evaporation.")

    # RULE E: Mild weather conditions
    else:
        status = "check_moisture"
        status_label = "Check soil moisture"
        priority = "Low"
        recommendation = "Weather conditions are currently mild. Check soil moisture before proceeding with scheduled irrigation."
        reasons.append(f"Moderate temperature ({current_temp}°C) and stable relative humidity ({humidity}%).")
        reasons.append("Atmospheric evaporative demand is within normal seasonal bounds.")
        if crop_info:
            reasons.append(f"Maintain routine moisture intervals appropriate for {crop_info['label']}.")

    # RULE F: Note missing parameters if any
    if missing_parameters:
        reasons.append(
            f"Advisory confidence adjusted: Missing {', '.join(missing_parameters)}. Complete your farm profile for deeper precision."
        )

    # 5. Log advisory into database if db session provided (deduplicate rapid refreshes)
    if db is not None and user_id is not None:
        try:
            latest_log = (
                db.query(IrrigationLog)
                .filter(IrrigationLog.user_id == user_id)
                .order_by(IrrigationLog.created_at.desc())
                .first()
            )
            should_log = True
            if latest_log and latest_log.status == status and latest_log.recommendation == recommendation:
                if latest_log.created_at:
                    now_dt = datetime.now(timezone.utc) if latest_log.created_at.tzinfo else datetime.utcnow()
                    if (now_dt - latest_log.created_at).total_seconds() < 7200:
                        should_log = False

            if should_log:
                log_entry = IrrigationLog(
                    user_id=user_id,
                    status=status,
                    status_label=status_label,
                    recommendation=recommendation,
                    priority=priority
                )
                db.add(log_entry)
                db.commit()
        except Exception as e:
            print(f"[IrrigationService] Could not record advisory history: {e}")
            db.rollback()

    # 6. Retrieve recent history
    history = _get_history(user_id, db)

    return {
        "success": True,
        "status": status,
        "status_label": status_label,
        "priority": priority,
        "recommendation": recommendation,
        "reasons": reasons,
        "farm_summary": _build_farm_summary(user),
        "weather_summary": weather_summary,
        "missing_parameters": missing_parameters,
        "history": history,
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }


def _build_farm_summary(user: Any) -> Dict[str, str]:
    return {
        "crop": getattr(user, "primary_crop", None) or "Not provided",
        "soil_type": getattr(user, "soil_type", None) or "Not provided",
        "irrigation_type": getattr(user, "irrigation_type", None) or "Not provided",
        "farm_size": getattr(user, "farm_size", None) or "Not provided",
        "location": getattr(user, "location", None) or "Not provided",
    }


def _get_history(user_id: Optional[int], db: Optional[Session]) -> List[Dict[str, Any]]:
    if not db or not user_id:
        return []
    try:
        logs = (
            db.query(IrrigationLog)
            .filter(IrrigationLog.user_id == user_id)
            .order_by(IrrigationLog.created_at.desc())
            .limit(5)
            .all()
        )
        return [
            {
                "id": log.id,
                "status": log.status,
                "status_label": log.status_label,
                "recommendation": log.recommendation,
                "priority": log.priority,
                "created_at": log.created_at.strftime("%Y-%m-%d %H:%M") if log.created_at else "Recently"
            }
            for log in logs
        ]
    except Exception as e:
        print(f"[IrrigationService] Error fetching history: {e}")
        return []
