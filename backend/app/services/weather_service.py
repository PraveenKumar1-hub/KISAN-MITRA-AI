"""
Weather Service using Open-Meteo API.
Provides:
- Geocoding farmer location to geographic coordinates
- Fetching real-time current weather & 5-day daily forecast
- WMO weather code mapping to human-readable agricultural conditions
- Rule-based farming insights & irrigation advisory derived from real weather data
- In-memory short-lived cache (10 minutes) to minimize external requests
"""

import time
import urllib.request
import urllib.parse
import json
from typing import Optional, Dict, Any, List

# Cache storage: { location_key: (timestamp, data) }
_WEATHER_CACHE: Dict[str, tuple[float, Dict[str, Any]]] = {}
CACHE_TTL_SECONDS = 600  # 10 minutes

# WMO Weather Code Mapping
WMO_CODES: Dict[int, str] = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    56: "Light Freezing Drizzle",
    57: "Dense Freezing Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    66: "Light Freezing Rain",
    67: "Heavy Freezing Rain",
    71: "Slight Snow Fall",
    73: "Moderate Snow Fall",
    75: "Heavy Snow Fall",
    77: "Snow Grains",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Slight Hail",
    99: "Thunderstorm with Heavy Hail",
}

# Standard coordinates for Indian States & Union Territories
# Open-Meteo geocoding search only indexes populated places/cities, not admin1 states.
# This mapping ensures farmers registered with their State name get real weather data.
INDIAN_STATES_COORDINATES: Dict[str, tuple[float, float, str]] = {
    "andhra pradesh": (16.5062, 80.6480, "Amaravati, Andhra Pradesh"),
    "arunachal pradesh": (27.0844, 93.6053, "Itanagar, Arunachal Pradesh"),
    "assam": (26.1445, 91.7362, "Guwahati, Assam"),
    "bihar": (25.5941, 85.1376, "Patna, Bihar"),
    "chhattisgarh": (21.2514, 81.6296, "Raipur, Chhattisgarh"),
    "goa": (15.4909, 73.8278, "Panaji, Goa"),
    "gujarat": (23.2156, 72.6369, "Gandhinagar, Gujarat"),
    "haryana": (29.6857, 76.9905, "Karnal, Haryana"),
    "himachal pradesh": (31.1048, 77.1734, "Shimla, Himachal Pradesh"),
    "jharkhand": (23.3441, 85.3096, "Ranchi, Jharkhand"),
    "karnataka": (12.9716, 77.5946, "Bengaluru, Karnataka"),
    "kerala": (8.5241, 76.9366, "Thiruvananthapuram, Kerala"),
    "madhya pradesh": (23.2599, 77.4126, "Bhopal, Madhya Pradesh"),
    "maharashtra": (18.5204, 73.8567, "Pune, Maharashtra"),
    "manipur": (24.8170, 93.9368, "Imphal, Manipur"),
    "meghalaya": (25.5788, 91.8933, "Shillong, Meghalaya"),
    "mizoram": (23.7271, 92.7176, "Aizawl, Mizoram"),
    "nagaland": (25.6751, 94.1086, "Kohima, Nagaland"),
    "odisha": (20.2961, 85.8245, "Bhubaneswar, Odisha"),
    "orissa": (20.2961, 85.8245, "Bhubaneswar, Odisha"),
    "punjab": (30.9010, 75.8573, "Ludhiana, Punjab"),
    "rajasthan": (26.9124, 75.7873, "Jaipur, Rajasthan"),
    "sikkim": (27.3389, 88.6065, "Gangtok, Sikkim"),
    "tamil nadu": (13.0827, 80.2707, "Chennai, Tamil Nadu"),
    "telangana": (17.3850, 78.4867, "Hyderabad, Telangana"),
    "tripura": (23.8315, 91.2868, "Agartala, Tripura"),
    "uttar pradesh": (26.8467, 80.9462, "Lucknow, Uttar Pradesh"),
    "uttarakhand": (30.3165, 78.0322, "Dehradun, Uttarakhand"),
    "west bengal": (22.5726, 88.3639, "Kolkata, West Bengal"),
    "delhi": (28.6139, 77.2090, "New Delhi, Delhi"),
    "jammu and kashmir": (34.0837, 74.7973, "Srinagar, Jammu & Kashmir"),
    "ladakh": (34.1526, 77.5771, "Leh, Ladakh"),
    "puducherry": (11.9416, 79.8083, "Puducherry"),
    "chandigarh": (30.7333, 76.7794, "Chandigarh"),
}

def get_condition_name(code: Optional[int]) -> str:
    if code is None:
        return "Unknown"
    return WMO_CODES.get(code, "Variable Conditions")


def _try_parse_coordinates(loc_str: str) -> Optional[Dict[str, Any]]:
    """Checks if the user provided direct decimal coordinates like '28.61, 77.20'."""
    parts = loc_str.split(",")
    if len(parts) == 2:
        try:
            lat = float(parts[0].strip())
            lon = float(parts[1].strip())
            if -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0:
                return {
                    "name": f"Location ({lat:.2f}°, {lon:.2f}°)",
                    "latitude": round(lat, 4),
                    "longitude": round(lon, 4),
                    "admin1": None,
                    "country": "India"
                }
        except ValueError:
            pass
    return None


def geocode_location(location_str: str) -> Optional[Dict[str, Any]]:
    """
    Geocodes a farmer's registered location string.
    Resolution priority:
    1. Direct numeric coordinates (e.g. '28.61, 77.20')
    2. Indian State / UT mapping for direct state registrations (e.g. 'Uttar Pradesh')
    3. Open-Meteo Geocoding API with India prioritization
    4. Compound location parsing (e.g. 'Anand, Gujarat' -> city 'Anand', state 'Gujarat')
    5. Cleaned text parsing (stripping 'District', 'Nagar', 'Dist', etc.)
    """
    if not location_str or not location_str.strip():
        return None

    clean_loc = location_str.strip()
    norm_key = clean_loc.lower().replace("-", " ").replace(".", "")

    # 1. Direct coordinate check
    direct_coords = _try_parse_coordinates(clean_loc)
    if direct_coords:
        return direct_coords

    # 2. Check Indian State / UT dictionary
    if norm_key in INDIAN_STATES_COORDINATES:
        lat, lon, res_name = INDIAN_STATES_COORDINATES[norm_key]
        return {
            "name": clean_loc.title(),
            "latitude": round(lat, 4),
            "longitude": round(lon, 4),
            "admin1": clean_loc.title(),
            "country": "India"
        }

    # 3. Try exact string with Open-Meteo
    coords = _query_geocoding(clean_loc)
    if coords:
        return coords

    # 4. If compound (e.g. "Ludhiana, Punjab" or "Barabanki, Uttar Pradesh")
    if "," in clean_loc:
        parts = [p.strip() for p in clean_loc.split(",") if p.strip()]
        if parts:
            # Try primary city component first
            coords = _query_geocoding(parts[0])
            if coords:
                return coords

            # If city failed, check if the second component is a known state
            if len(parts) >= 2:
                state_key = parts[1].lower().replace("-", " ").replace(".", "")
                if state_key in INDIAN_STATES_COORDINATES:
                    lat, lon, res_name = INDIAN_STATES_COORDINATES[state_key]
                    return {
                        "name": parts[0].title(),
                        "latitude": round(lat, 4),
                        "longitude": round(lon, 4),
                        "admin1": parts[1].title(),
                        "country": "India"
                    }

    # 5. Try cleaning administrative suffixes like 'District', 'Nagar', 'Dist', 'Division'
    simplified = clean_loc
    for suffix in ["District", "district", "Nagar", "nagar", "Dist", "dist", "Division", "division", "Taluk", "taluk", "Tehsil", "tehsil"]:
        simplified = simplified.replace(suffix, "").strip()

    if simplified and simplified != clean_loc:
        norm_simp = simplified.lower()
        if norm_simp in INDIAN_STATES_COORDINATES:
            lat, lon, res_name = INDIAN_STATES_COORDINATES[norm_simp]
            return {
                "name": simplified.title(),
                "latitude": round(lat, 4),
                "longitude": round(lon, 4),
                "admin1": simplified.title(),
                "country": "India"
            }
        coords = _query_geocoding(simplified)
        if coords:
            return coords

    return None


def _query_geocoding(query: str) -> Optional[Dict[str, Any]]:
    """
    Queries Open-Meteo Geocoding API with multi-result lookup,
    prioritizing results in India (country_code == 'IN').
    """
    clean_q = query.strip()
    if not clean_q:
        return None

    encoded = urllib.parse.quote(clean_q)
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded}&count=10&language=en&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": "KisanMitraAI/1.0"})

    try:
        with urllib.request.urlopen(req, timeout=6) as response:
            if response.status == 200:
                payload = json.loads(response.read().decode("utf-8"))
                results = payload.get("results", [])
                if not results:
                    return None

                # Prioritize India matches
                top = None
                for candidate in results:
                    c_code = candidate.get("country_code", "").upper()
                    c_name = candidate.get("country", "")
                    if c_code == "IN" or "India" in c_name:
                        top = candidate
                        break

                # If no explicit India result, use the first result
                if not top and len(results) > 0:
                    top = results[0]

                if top:
                    return {
                        "name": top.get("name", clean_q),
                        "latitude": round(float(top["latitude"]), 4),
                        "longitude": round(float(top["longitude"]), 4),
                        "admin1": top.get("admin1"),
                        "country": top.get("country", "India")
                    }
    except Exception as e:
        print(f"[WeatherService] Geocoding error for '{query}': {e}")

    return None


def fetch_weather_for_location(location_str: str) -> Dict[str, Any]:
    """
    Fetches real weather from Open-Meteo using the farmer's registered location.
    Caches responses for 10 minutes per location to prevent redundant API calls.
    Returns structured real weather data, or clear error state if unavailable.
    """
    if not location_str or not location_str.strip():
        return {
            "success": False,
            "error_type": "missing_location",
            "message": "Please update your farm location to view local weather."
        }

    clean_key = location_str.strip().lower()

    # Check cache
    now = time.time()
    if clean_key in _WEATHER_CACHE:
        cached_time, cached_data = _WEATHER_CACHE[clean_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_data

    # 1. Geocode location
    geo = geocode_location(location_str)
    if not geo:
        return {
            "success": False,
            "error_type": "location_unresolved",
            "message": "Weather location could not be determined. Please update your farm location."
        }

    lat = geo["latitude"]
    lon = geo["longitude"]
    resolved_name = f"{geo['name']}"
    if geo.get("admin1") and geo["admin1"] != geo["name"]:
        resolved_name += f", {geo['admin1']}"

    # 2. Query Open-Meteo Weather Forecast API
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&"
        f"current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&"
        f"daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&"
        f"timezone=auto&forecast_days=6"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "KisanMitraAI/1.0"})

    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            if resp.status != 200:
                return {
                    "success": False,
                    "error_type": "api_error",
                    "message": "Weather information is temporarily unavailable."
                }
            raw = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"[WeatherService] Weather API request error: {e}")
        return {
            "success": False,
            "error_type": "api_error",
            "message": "Weather information is temporarily unavailable."
        }

    # 3. Parse Current Weather
    current_raw = raw.get("current", {})
    curr_weather_code = int(current_raw.get("weather_code", 0))
    current_weather = {
        "temperature": round(float(current_raw.get("temperature_2m", 0.0)), 1),
        "apparent_temperature": round(float(current_raw.get("apparent_temperature", 0.0)), 1),
        "humidity": int(current_raw.get("relative_humidity_2m", 0)),
        "rainfall": round(float(current_raw.get("precipitation", 0.0)), 1),
        "wind_speed": round(float(current_raw.get("wind_speed_10m", 0.0)), 1),
        "weather_code": curr_weather_code,
        "weather_condition": get_condition_name(curr_weather_code),
    }

    # 4. Parse Daily Forecast (Today + next 5 days)
    daily_raw = raw.get("daily", {})
    dates = daily_raw.get("time", [])
    weather_codes = daily_raw.get("weather_code", [])
    temps_max = daily_raw.get("temperature_2m_max", [])
    temps_min = daily_raw.get("temperature_2m_min", [])
    precip_sums = daily_raw.get("precipitation_sum", [])
    precip_probs = daily_raw.get("precipitation_probability_max", [])

    forecast_items: List[Dict[str, Any]] = []
    for i in range(len(dates)):
        w_code = int(weather_codes[i]) if i < len(weather_codes) and weather_codes[i] is not None else 0
        forecast_items.append({
            "date": dates[i],
            "day_index": i,  # 0 = Today, 1 = Tomorrow, etc.
            "temp_max": round(float(temps_max[i]), 1) if i < len(temps_max) and temps_max[i] is not None else None,
            "temp_min": round(float(temps_min[i]), 1) if i < len(temps_min) and temps_min[i] is not None else None,
            "weather_code": w_code,
            "weather_condition": get_condition_name(w_code),
            "precipitation_sum": round(float(precip_sums[i]), 1) if i < len(precip_sums) and precip_sums[i] is not None else 0.0,
            "precipitation_probability": int(precip_probs[i]) if i < len(precip_probs) and precip_probs[i] is not None else 0,
        })

    # 5. Generate Rule-Based Farming Insights & Irrigation Advisory from real data
    farming_insights, irrigation_advisory = generate_insights(current_weather, forecast_items)

    result_data = {
        "success": True,
        "location": location_str,
        "resolved_location": resolved_name,
        "coordinates": {
            "latitude": lat,
            "longitude": lon
        },
        "current": current_weather,
        "forecast": forecast_items,
        "farming_insights": farming_insights,
        "irrigation_advisory": irrigation_advisory,
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    # Cache result
    _WEATHER_CACHE[clean_key] = (now, result_data)
    return result_data


def generate_insights(current: Dict[str, Any], forecast: List[Dict[str, Any]]) -> tuple[List[str], str]:
    """
    Generates rule-based agricultural recommendations derived strictly from real weather values.
    Does not produce arbitrary or machine-learning claims; relies solely on measured parameters.
    """
    insights: List[str] = []
    irrigation_advisory = "Weather conditions are currently suitable for routine farm activities."

    # Look ahead 48 hours (indices 0 and 1)
    upcoming_rain_mm = sum(item.get("precipitation_sum", 0.0) for item in forecast[:2])
    max_rain_prob = max((item.get("precipitation_probability", 0) for item in forecast[:2]), default=0)

    curr_temp = current["temperature"]
    wind_speed = current["wind_speed"]

    # 1. Rain & Irrigation Analysis
    if upcoming_rain_mm >= 5.0:
        insights.append(
            f"Significant rainfall expected ({upcoming_rain_mm:.1f} mm forecast in next 48h). Review irrigation to prevent waterlogging and fertilizer leaching."
        )
        irrigation_advisory = "Significant rain expected. Consider delaying scheduled irrigation."
    elif max_rain_prob >= 50 or upcoming_rain_mm >= 1.0:
        insights.append(
            f"Light rain or scattered showers possible ({max_rain_prob}% probability, {upcoming_rain_mm:.1f} mm forecast). Monitor soil moisture before watering."
        )
        irrigation_advisory = "Showers possible. Check soil moisture before irrigation."
    elif upcoming_rain_mm <= 0.5 and max_rain_prob < 25:
        insights.append(
            "Dry conditions expected over the next 48 hours. Check soil moisture levels before scheduling irrigation."
        )
        irrigation_advisory = "Dry conditions expected. Check soil moisture before irrigation."
    else:
        insights.append(
            "Moderate or variable atmospheric conditions. Inspect local soil moisture before applying irrigation."
        )
        irrigation_advisory = "Inspect local soil moisture before applying scheduled irrigation."

    # 2. Temperature Analysis
    if curr_temp >= 38.0:
        insights.append(
            f"High temperature detected ({curr_temp}°C). Monitor crop water requirements and avoid chemical spraying during peak afternoon heat."
        )
    elif curr_temp <= 10.0:
        insights.append(
            f"Cool temperature detected ({curr_temp}°C). Monitor cold-sensitive crops and seedlings for frost risk."
        )
    else:
        insights.append(
            f"Current temperature ({curr_temp}°C) is within a favorable range for field operations."
        )

    # 3. Wind Speed Analysis
    if wind_speed >= 22.0:
        insights.append(
            f"Breezy conditions ({wind_speed} km/h wind speed). Postpone foliar spraying or drone operations to prevent chemical drift."
        )

    return insights, irrigation_advisory
