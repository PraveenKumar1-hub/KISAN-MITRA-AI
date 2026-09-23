"""
Farm Intelligence Orchestration Service.
Aggregates real-time outputs from existing backend services:
- Weather Service (Open-Meteo)
- Smart Irrigation Advisory
- Crop Advisory Engine
- Plant Disease ML Engine
- Market / Mandi Price Service
Converts data into actionable, prioritized, farmer-friendly insights and summaries.
Zero fake data, zero hallucinations.
"""

import time
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.services.weather_service import fetch_weather_for_location
from app.services.irrigation_service import generate_irrigation_advisory
from app.services.crop_recommendation import generate_crop_recommendations
from app.services.disease_model import disease_model_engine
from app.services.market_service import fetch_market_prices


PRIORITY_WEIGHTS = {
    "high": 0,
    "medium": 1,
    "low": 2,
    "info": 3,
}


def generate_farm_intelligence(user: Any, db: Optional[Session] = None) -> Dict[str, Any]:
    """
    Central orchestration function to aggregate all active modules and
    produce a prioritized Farm Intelligence report for the farmer's dashboard.
    """
    farmer_name = getattr(user, "full_name", "Farmer")
    location = getattr(user, "location", None)
    primary_crop = getattr(user, "primary_crop", None)
    soil_type = getattr(user, "soil_type", None)
    irrigation_type = getattr(user, "irrigation_type", None)

    insights: List[Dict[str, Any]] = []
    actions: List[Dict[str, Any]] = []
    data_sources: Dict[str, Dict[str, Any]] = {}

    summary_parts: List[str] = []

    # ---------------------------------------------------------
    # 1. Weather Intelligence
    # ---------------------------------------------------------
    weather_data: Optional[Dict[str, Any]] = None
    if not location or not str(location).strip():
        data_sources["weather"] = {
            "name": "Weather Intelligence",
            "status": "not_configured",
            "label": "Not Configured",
            "last_updated": None,
            "details": "Farm location is missing in your profile."
        }
        insights.append({
            "id": "weather-missing-loc",
            "type": "weather",
            "priority": "info",
            "title": "Set Farm Location",
            "message": "Add your district or farm location to your profile to receive localized agro-meteorological advisories.",
            "action_label": "Update Location",
            "action_route": "/profile",
            "source_name": "Open-Meteo",
            "reasons": ["Location field is empty in profile"]
        })
    else:
        try:
            weather_data = fetch_weather_for_location(str(location).strip())
            if weather_data and weather_data.get("success"):
                data_sources["weather"] = {
                    "name": "Weather Intelligence",
                    "status": "available",
                    "label": "Live Forecast Available",
                    "last_updated": weather_data.get("updated_at"),
                    "details": f"{weather_data.get('resolved_location', location)}"
                }
                curr = weather_data.get("current", {})
                forecast = weather_data.get("forecast", [])
                temp = curr.get("temperature")
                cond = curr.get("weather_condition", "Normal")

                # Analyze rain in next 48 hours
                upcoming_rain_mm = sum(item.get("precipitation_sum", 0.0) for item in forecast[:2])
                max_rain_prob = max((item.get("precipitation_probability", 0) for item in forecast[:2]), default=0)

                if max_rain_prob >= 60 or upcoming_rain_mm >= 10.0:
                    insights.append({
                        "id": "weather-heavy-rain",
                        "type": "weather",
                        "priority": "high",
                        "title": "Rain Forecasted in Next 48 Hours",
                        "message": f"{upcoming_rain_mm:.1f} mm rain expected with {max_rain_prob}% probability. Hold pesticide sprays and secure field drainage channels.",
                        "action_label": "View Weather Forecast",
                        "action_route": "/weather",
                        "source_name": "Open-Meteo",
                        "reasons": [f"Precipitation probability: {max_rain_prob}%", f"Rain volume: {upcoming_rain_mm:.1f} mm"]
                    })
                    summary_parts.append(f"Rainfall ({upcoming_rain_mm:.1f} mm, {max_rain_prob}% probability) is expected in {location} over the next 48 hours.")
                elif max_rain_prob >= 35 or upcoming_rain_mm >= 3.0:
                    insights.append({
                        "id": "weather-moderate-rain",
                        "type": "weather",
                        "priority": "medium",
                        "title": "Light Rain or Showers Likely",
                        "message": f"Precipitation probability is {max_rain_prob}% ({upcoming_rain_mm:.1f} mm). Plan field spraying operations during clear intervals.",
                        "action_label": "View Hourly Weather",
                        "action_route": "/weather",
                        "source_name": "Open-Meteo",
                        "reasons": [f"Rain probability: {max_rain_prob}%"]
                    })
                    summary_parts.append(f"Scattered showers ({max_rain_prob}% chance) are possible in {location}.")
                else:
                    insights.append({
                        "id": "weather-favorable",
                        "type": "weather",
                        "priority": "low",
                        "title": f"Favorable Weather ({cond}, {temp}°C)",
                        "message": f"Dry conditions and stable temperatures in {location} offer a good operational window for intercultural operations.",
                        "action_label": "Check Weather Details",
                        "action_route": "/weather",
                        "source_name": "Open-Meteo",
                        "reasons": ["No adverse rain or thermal stress detected"]
                    })
                    summary_parts.append(f"Current weather in {location} is {cond} ({temp}°C) with dry field conditions.")
            else:
                data_sources["weather"] = {
                    "name": "Weather Intelligence",
                    "status": "unavailable",
                    "label": "Temporarily Unavailable",
                    "last_updated": None,
                    "details": weather_data.get("message") if weather_data else "Unable to query weather service."
                }
        except Exception as e:
            print(f"[InsightsService] Weather fetch failed: {e}")
            data_sources["weather"] = {
                "name": "Weather Intelligence",
                "status": "unavailable",
                "label": "Service Offline",
                "last_updated": None,
                "details": "Weather feed could not be reached."
            }

    # ---------------------------------------------------------
    # 2. Smart Irrigation Advisory
    # ---------------------------------------------------------
    try:
        irrigation_res = generate_irrigation_advisory(user=user, db=db)
        if irrigation_res and irrigation_res.get("success"):
            data_sources["irrigation"] = {
                "name": "Smart Irrigation",
                "status": "available",
                "label": "Advisory Active",
                "last_updated": irrigation_res.get("generated_at"),
                "details": f"Status: {irrigation_res.get('status_label')}"
            }
            status = irrigation_res.get("status", "normal")
            status_label = irrigation_res.get("status_label", "Irrigation Advisory")
            rec = irrigation_res.get("recommendation", "")
            reasons = irrigation_res.get("reasons", [])
            priority = irrigation_res.get("priority", "medium")

            # Map irrigation priority
            insight_priority = "high" if priority == "high" or status in ("critical", "hold_rain") else ("medium" if priority == "medium" else "low")

            insights.append({
                "id": "irrigation-advisory-insight",
                "type": "irrigation",
                "priority": insight_priority,
                "title": status_label,
                "message": rec,
                "action_label": "View Irrigation Schedule",
                "action_route": "/irrigation",
                "source_name": "Rule-Based Smart Irrigation",
                "reasons": reasons[:3] if reasons else None
            })

            if status == "hold_rain":
                summary_parts.append("Irrigation should be postponed due to expected rainfall.")
            elif status == "critical":
                summary_parts.append("Irrigation is urgently required to maintain soil moisture.")
            else:
                summary_parts.append("Soil moisture conditions remain within normal thresholds for scheduled irrigation.")
        else:
            data_sources["irrigation"] = {
                "name": "Smart Irrigation",
                "status": "unavailable",
                "label": "Incomplete Profile",
                "last_updated": None,
                "details": "Missing required soil or irrigation parameters."
            }
    except Exception as e:
        print(f"[InsightsService] Irrigation advisory failed: {e}")
        data_sources["irrigation"] = {
            "name": "Smart Irrigation",
            "status": "unavailable",
            "label": "Service Offline",
            "last_updated": None,
            "details": "Irrigation module encountered an error."
        }

    # ---------------------------------------------------------
    # 3. Crop Advisory
    # ---------------------------------------------------------
    try:
        crop_res = generate_crop_recommendations(user=user)
        if crop_res and crop_res.get("success"):
            data_sources["crop_advisory"] = {
                "name": "Crop Advisory",
                "status": "available",
                "label": "Recommendations Active",
                "last_updated": "Based on current profile",
                "details": f"{len(crop_res.get('recommendations', []))} crops evaluated"
            }
            recs = crop_res.get("recommendations", [])
            if recs:
                top = recs[0]
                top_name = top.get("crop") or top.get("name", "Recommended Crop")
                match_pct = top.get("match_score", 0)

                # Check if top crop matches farmer's primary crop
                is_primary = primary_crop and (primary_crop.lower() in top_name.lower() or top_name.lower() in primary_crop.lower())

                if is_primary:
                    insights.append({
                        "id": "crop-primary-match",
                        "type": "crop",
                        "priority": "low",
                        "title": f"Primary Crop ({primary_crop}) Highly Compatible",
                        "message": f"Your registered crop ({primary_crop}) has a {match_pct}% compatibility match with your {soil_type or 'farm'} soil and {irrigation_type or 'water'} setup.",
                        "action_label": "Explore Crop Advisory",
                        "action_route": "/crop-advisory",
                        "source_name": "Crop Recommendation Engine",
                        "reasons": [f"Match score: {match_pct}%", f"Soil compatibility: {soil_type or 'Confirmed'}"]
                    })
                    summary_parts.append(f"Your primary crop ({primary_crop}) aligns well with your soil and water resources.")
                else:
                    insights.append({
                        "id": "crop-top-recommendation",
                        "type": "crop",
                        "priority": "medium",
                        "title": f"Top Alternative: {top_name} ({match_pct}% Match)",
                        "message": f"Agronomic matching indicates high suitability for {top_name} in {location or 'your region'} with your current soil texture.",
                        "action_label": "Compare Crop Matches",
                        "action_route": "/crop-advisory",
                        "source_name": "Crop Recommendation Engine",
                        "reasons": [top.get("soil_match", ""), top.get("water_match", "")]
                    })
                    summary_parts.append(f"Crop advisory highlights strong agronomic suitability for {top_name} ({match_pct}% match).")
        else:
            data_sources["crop_advisory"] = {
                "name": "Crop Advisory",
                "status": "unavailable",
                "label": "Incomplete Profile",
                "last_updated": None,
                "details": "Profile lacks soil or irrigation information."
            }
    except Exception as e:
        print(f"[InsightsService] Crop recommendation failed: {e}")
        data_sources["crop_advisory"] = {
            "name": "Crop Advisory",
            "status": "unavailable",
            "label": "Service Offline",
            "last_updated": None,
            "details": "Crop engine encountered an error."
        }

    # ---------------------------------------------------------
    # 4. Plant Health (Honest ML model state)
    # ---------------------------------------------------------
    try:
        model_available = disease_model_engine.is_available()
        if model_available:
            data_sources["plant_health"] = {
                "name": "Plant Health",
                "status": "not_analyzed",
                "label": "Model Ready / No Scan",
                "last_updated": None,
                "details": "Inference engine active; upload leaf photo for analysis."
            }
            insights.append({
                "id": "plant-health-ready",
                "type": "plant_health",
                "priority": "info",
                "title": "Plant Health Scanning Active",
                "message": "No leaf disease scans performed today. If you notice leaf discoloration, wilting, or lesions, upload a clear photo for diagnosis.",
                "action_label": "Upload Leaf Photo",
                "action_route": "/plant-health",
                "source_name": "Vision ML Engine",
                "reasons": ["Model weights loaded and ready"]
            })
        else:
            data_sources["plant_health"] = {
                "name": "Plant Health",
                "status": "not_configured",
                "label": "Model Standby",
                "last_updated": None,
                "details": "Trained weights not loaded in backend/models/plant_disease/."
            }
            insights.append({
                "id": "plant-health-standby",
                "type": "plant_health",
                "priority": "info",
                "title": "Plant Disease Model in Standby",
                "message": "Detection engine is ready for weights. In accordance with safety principles, no simulated disease predictions are presented.",
                "action_label": "View Detection Module",
                "action_route": "/plant-health",
                "source_name": "Vision ML Engine",
                "reasons": ["Zero fake predictions policy"]
            })
            summary_parts.append("Plant disease detection is in standby mode.")
    except Exception as e:
        print(f"[InsightsService] Plant health status check failed: {e}")
        data_sources["plant_health"] = {
            "name": "Plant Health",
            "status": "unavailable",
            "label": "Service Offline",
            "last_updated": None,
            "details": "Plant health module could not be checked."
        }

    # ---------------------------------------------------------
    # 5. Market / Mandi Prices (Honest APMC configuration state)
    # ---------------------------------------------------------
    try:
        market_res = fetch_market_prices(user_crop=primary_crop, location=location)
        if market_res.get("configured") and market_res.get("results"):
            results = market_res.get("results", [])
            summary = market_res.get("summary")
            data_sources["market"] = {
                "name": "Market Prices",
                "status": "available",
                "label": "Live APMC Rates",
                "last_updated": market_res.get("last_updated"),
                "details": f"{len(results)} records found"
            }
            avg_price = summary.get("modal_price_avg") if summary else None
            price_str = f"averaging Rs {avg_price:,.0f}/quintal" if avg_price else "available across local mandis"
            insights.append({
                "id": "market-rates-available",
                "type": "market",
                "priority": "low",
                "title": f"Mandi Rates for {primary_crop or 'Crops'}",
                "message": f"Real-time mandi records retrieved from official Agmarknet feed {price_str}.",
                "action_label": "View Mandi Prices",
                "action_route": "/market-prices",
                "source_name": "data.gov.in / Agmarknet",
                "reasons": [f"Records found: {len(results)}"]
            })
            summary_parts.append(f"Official mandi rates are available for {primary_crop or 'your crop'}.")
        elif market_res.get("configured") and not market_res.get("results"):
            data_sources["market"] = {
                "name": "Market Prices",
                "status": "unavailable",
                "label": "No Recent Mandi Arrivals",
                "last_updated": None,
                "details": "No commodity arrival entries for current date filter."
            }
            insights.append({
                "id": "market-no-data",
                "type": "market",
                "priority": "info",
                "title": "No Mandi Arrivals Today",
                "message": f"No active auction or arrival records reported for {primary_crop or 'your commodity'} today in {location or 'local APMCs'}.",
                "action_label": "Search Other Mandis",
                "action_route": "/market-prices",
                "source_name": "Agmarknet Network",
                "reasons": ["No daily records returned"]
            })
        else:
            # Unconfigured state
            data_sources["market"] = {
                "name": "Market Prices",
                "status": "not_configured",
                "label": "Unconfigured",
                "last_updated": None,
                "details": "DATA_GOV_IN_API_KEY required for live Agmarknet prices."
            }
            insights.append({
                "id": "market-unconfigured",
                "type": "market",
                "priority": "info",
                "title": "Mandi Integration Available",
                "message": "Official Government mandi prices can be activated by configuring the data.gov.in API key in the backend. Zero simulated prices are displayed.",
                "action_label": "Check Market Section",
                "action_route": "/market-prices",
                "source_name": "Government Mandi Network",
                "reasons": ["API key required for live data"]
            })
            summary_parts.append("Official mandi prices remain unconfigured.")
    except Exception as e:
        print(f"[InsightsService] Market prices fetch failed: {e}")
        data_sources["market"] = {
            "name": "Market Prices",
            "status": "unavailable",
            "label": "Service Offline",
            "last_updated": None,
            "details": "Market price feed could not be queried."
        }

    # ---------------------------------------------------------
    # 6. Priority Sorting of Insights
    # ---------------------------------------------------------
    insights.sort(key=lambda item: PRIORITY_WEIGHTS.get(item.get("priority", "info"), 3))

    # ---------------------------------------------------------
    # 7. Synthesize Daily Farm Summary
    # ---------------------------------------------------------
    if summary_parts:
        daily_summary = f"Namaste {farmer_name}. " + " ".join(summary_parts)
    else:
        daily_summary = f"Namaste {farmer_name}. Farm intelligence will update as more farm parameters and external feeds become active."

    # ---------------------------------------------------------
    # 8. Synthesize Top Recommended Actions (Max 3-5)
    # ---------------------------------------------------------
    # Derive unique actions from insights in priority order
    seen_routes = set()
    category_map = {
        "irrigation": "Irrigation",
        "weather": "Weather Alert",
        "crop": "Crop Planning",
        "plant_health": "Plant Protection",
        "market": "Market Watch"
    }

    for ins in insights:
        route = ins.get("action_route")
        if route and route not in seen_routes:
            seen_routes.add(route)
            actions.append({
                "id": f"action-{ins.get('id')}",
                "category": category_map.get(ins.get("type"), "Field Operation"),
                "priority": ins.get("priority", "info"),
                "title": ins.get("title"),
                "short_explanation": ins.get("message"),
                "action_label": ins.get("action_label", "View Details"),
                "action_route": route
            })
        if len(actions) >= 4:
            break

    # If no actions yet, provide default setup actions
    if not actions:
        actions.append({
            "id": "action-setup-profile",
            "category": "Farm Setup",
            "priority": "info",
            "title": "Complete Farm Profile",
            "short_explanation": "Add soil type, primary crop, and irrigation system to unlock precision recommendations.",
            "action_label": "Update Farm Profile",
            "action_route": "/my-farm"
        })

    return {
        "status": "success",
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "farmer_name": farmer_name,
        "location": location,
        "summary": daily_summary,
        "insights": insights,
        "actions": actions,
        "data_sources": data_sources
    }
