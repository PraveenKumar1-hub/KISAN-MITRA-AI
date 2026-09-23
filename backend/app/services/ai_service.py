"""
AI Agricultural Assistant Service
Provides multilingual, context-aware agricultural assistance for farmers.

Architecture:
- Detects / infers query language (English, Hindi, Hinglish)
- Reuses authenticated farmer profile (Crop, Soil, Irrigation, Location, Size)
- Reuses Weather, Smart Irrigation, and Crop Advisory contexts where relevant
- Formulates strict agronomic system prompt (No yield guarantees, no emojis, no fake data)
- Dispatches request to backend-configured LLM provider (Gemini or OpenAI-compatible)
- Handles missing keys, API timeouts, and errors safely without exposing credentials
"""

import json
import re
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import User
from app.services.weather_service import fetch_weather_for_location
from app.services.irrigation_service import generate_irrigation_advisory


def detect_language(text: str) -> str:
    """
    Detects whether the query is in Hindi (Devanagari), Hinglish (Romanized Hindi), or English.
    """
    if not text:
        return "English"

    # Check for Devanagari Unicode block (U+0900 to U+097F)
    devanagari_count = len(re.findall(r"[\u0900-\u097F]", text))
    if devanagari_count > 3 or (len(text) > 0 and devanagari_count / len(text) > 0.2):
        return "Hindi"

    # Common Hinglish marker words
    hinglish_markers = {
        "bhai", "kare", "karna", "kaunsi", "kaun", "khaad", "paani", "pani",
        "fasal", "kheti", "gehu", "chahiye", "kab", "kya", "kaise", "kisko",
        "kitna", "de", "dawa", "kheton", "mitti", "khad", "rog", "beemari",
        "lag", "gaya", "karo", "bataye", "batado", "batao", "sir", "namaste",
        "kisan", "mitra", "accha", "achha", "daalna", "sahi", "hoga"
    }

    words = set(re.findall(r"\b[a-zA-Z]+\b", text.lower()))
    matches = words.intersection(hinglish_markers)
    if len(matches) >= 2 or (len(words) <= 5 and len(matches) >= 1):
        return "Hinglish"

    return "English"


def _build_context(message: str, user: User, db: Optional[Session] = None) -> Dict[str, Any]:
    """
    Gathers safe, non-sensitive farmer profile details and pulls live agronomic
    context (Weather, Irrigation) if relevant to the farmer's question.
    """
    # 1. Base Farmer Profile
    profile_ctx = {
        "location": getattr(user, "location", "Not specified"),
        "primary_crop": getattr(user, "primary_crop", "Not specified"),
        "soil_type": getattr(user, "soil_type", "Not specified"),
        "irrigation_type": getattr(user, "irrigation_type", "Not specified"),
        "farm_size": f"{getattr(user, 'farm_size', 'Not specified')} Acres" if getattr(user, "farm_size", None) else "Not specified"
    }

    # 2. Check query intent for relevant dynamic context
    msg_lower = message.lower()
    weather_ctx = None
    irrigation_ctx = None

    # Weather intent keywords
    if any(k in msg_lower for k in ["weather", "rain", "temperature", "forecast", "mausam", "barish", "baarish", "garmi"]):
        user_loc = getattr(user, "location", None)
        if user_loc:
            try:
                w_data = fetch_weather_for_location(str(user_loc).strip())
                if w_data.get("success") and w_data.get("current"):
                    curr = w_data["current"]
                    weather_ctx = {
                        "location": w_data.get("resolved_location", user_loc),
                        "temperature_c": curr.get("temperature"),
                        "humidity_percent": curr.get("humidity"),
                        "rainfall_mm": curr.get("rainfall"),
                        "condition": curr.get("weather_condition"),
                        "farming_insights": w_data.get("farming_insights", [])
                    }
            except Exception as e:
                print(f"[AIService] Weather context fetch error: {e}")

    # Irrigation intent keywords
    if any(k in msg_lower for k in ["irrigate", "irrigation", "water", "watering", "sinchai", "paani", "pani"]):
        if db:
            try:
                irr_data = generate_irrigation_advisory(user=user, db=db)
                if irr_data.get("success"):
                    irrigation_ctx = {
                        "status": irr_data.get("status_label"),
                        "recommendation": irr_data.get("recommendation"),
                        "priority": irr_data.get("priority"),
                        "reasons": irr_data.get("reasons", [])
                    }
            except Exception as e:
                print(f"[AIService] Irrigation context fetch error: {e}")

    return {
        "profile": profile_ctx,
        "weather": weather_ctx,
        "irrigation": irrigation_ctx
    }


def _build_system_prompt(context: Dict[str, Any], language: str) -> str:
    """
    Constructs the agronomic assistant system prompt enforcing tone, language,
    safety, and contextual awareness.
    """
    prof = context["profile"]
    weather = context.get("weather")
    irrigation = context.get("irrigation")

    prompt = [
        "You are 'Kisan Mitra AI', an expert, respectful, and practical agricultural assistant for Indian farmers.",
        "",
        "FARMER PROFILE CONTEXT:",
        f"- Registered Location: {prof['location']}",
        f"- Primary Crop: {prof['primary_crop']}",
        f"- Soil Type: {prof['soil_type']}",
        f"- Irrigation System: {prof['irrigation_type']}",
        f"- Farm Size: {prof['farm_size']}",
        ""
    ]

    if weather:
        prompt.extend([
            "REAL-TIME LOCAL WEATHER CONTEXT:",
            f"- Location: {weather['location']}",
            f"- Temperature: {weather['temperature_c']}°C",
            f"- Humidity: {weather['humidity_percent']}%",
            f"- Recent Rainfall: {weather['rainfall_mm']} mm",
            f"- Condition: {weather['condition']}",
            f"- Agronomic Insights: {'; '.join(weather.get('farming_insights', []))}",
            ""
        ])

    if irrigation:
        prompt.extend([
            "REAL-TIME SMART IRRIGATION ADVISORY CONTEXT:",
            f"- Current Status: {irrigation['status']}",
            f"- Recommendation: {irrigation['recommendation']}",
            f"- Priority: {irrigation['priority']}",
            f"- Agronomic Reasons: {'; '.join(irrigation.get('reasons', []))}",
            ""
        ])

    prompt.extend([
        "CORE RULES & SAFETY CONSTRAINTS:",
        "1. LANGUAGE: Respond strictly in the language used by the farmer.",
        f"   - Detected Language: {language}.",
        "   - If Hindi, reply in clear, natural Hindi (Devanagari script).",
        "   - If Hinglish, reply in natural Romanized Hindi (Hinglish) as spoken by Indian farmers.",
        "   - If English, reply in clean, concise English.",
        "2. PRACTICAL GUIDANCE: Give clear, actionable, farmer-friendly agricultural guidance tailored to their crop, soil, and irrigation setup.",
        "3. NO YIELD GUARANTEES: Never guarantee crop yield, financial returns, or 100% pest eradication.",
        "4. PLANT HEALTH / DISEASES: You cannot diagnose plant diseases from text alone with certainty. If the farmer describes leaf spots, pests, or yellowing, explain potential causes and advise them to upload a photo to the Kisan Mitra 'Plant Health' vision module for leaf analysis.",
        "5. CHEMICAL & FERTILIZER SAFETY: Do not recommend lethal or banned pesticides. Advise farmers to check package labels and consult their local Krishi Vigyan Kendra (KVK) or Block Agriculture Officer for exact dosage based on field tests.",
        "6. DATA INTEGRITY: Never invent fake weather, fake mandi rates, or fake sources. If weather or data is not provided, state that it is unavailable.",
        "7. TONE & STYLE: Direct, humble, supportive, and concise. Do NOT add unnecessary emojis.",
        "8. No conversational filler or repetitive greetings. Answer the farmer's question directly."
    ])

    return "\n".join(prompt)


def generate_ai_chat_response(
    message: str,
    user: User,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Main orchestration entrypoint for AI chat.
    Validates input, builds agronomic context, and calls configured LLM API.
    """
    clean_msg = message.strip()
    if not clean_msg:
        return {
            "success": False,
            "answer": "Please enter a valid agricultural question.",
            "language": "English",
            "sources": [],
            "message": "Empty message"
        }

    if len(clean_msg) > 2000:
        return {
            "success": False,
            "answer": "Your message is too long (maximum 2000 characters). Please summarize your question.",
            "language": "English",
            "sources": [],
            "message": "Message exceeds 2000 characters limit"
        }

    language = detect_language(clean_msg)
    api_key = settings.AI_API_KEY.strip() if settings.AI_API_KEY else ""

    # Check if AI provider API key is configured
    if not api_key:
        return {
            "success": False,
            "answer": "AI Assistant is temporarily unavailable. Please configure AI_API_KEY in the backend to enable live conversational assistance.",
            "language": language,
            "sources": [],
            "message": "AI_API_KEY is not configured"
        }

    # Gather safe context & build system prompt
    context = _build_context(clean_msg, user, db)
    system_prompt = _build_system_prompt(context, language)

    # Dispatch to LLM Provider
    provider = settings.AI_PROVIDER.lower().strip()
    try:
        if provider == "openai":
            answer = _call_openai(clean_msg, system_prompt, api_key)
        else:
            # Default: Gemini API
            answer = _call_gemini(clean_msg, system_prompt, api_key)

        return {
            "success": True,
            "answer": answer,
            "language": language,
            "sources": []  # Zero fabricated sources per Section 18
        }
    except urllib.error.HTTPError as he:
        print(f"[AIService] HTTP Error from LLM provider: {he.code} {he.reason}")
        return {
            "success": False,
            "answer": "AI Assistant is temporarily unavailable. Please try again.",
            "language": language,
            "sources": [],
            "message": f"Provider error: HTTP {he.code}"
        }
    except Exception as e:
        print(f"[AIService] Error calling LLM provider: {e}")
        return {
            "success": False,
            "answer": "AI Assistant is temporarily unavailable. Please try again.",
            "language": language,
            "sources": [],
            "message": "Temporary service disruption"
        }


def _call_gemini(user_message: str, system_prompt: str, api_key: str) -> str:
    """
    Calls Google Gemini API (gemini-1.5-flash) via standard HTTPS request.
    """
    model = settings.AI_MODEL or "gemini-1.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    payload = {
        "system_instruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_message}]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1000
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=18) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        candidates = data.get("candidates", [])
        if candidates and len(candidates) > 0:
            content = candidates[0].get("content", {})
            parts = content.get("parts", [])
            if parts and len(parts) > 0:
                return str(parts[0].get("text", "")).strip()

    raise ValueError("Empty or invalid candidate response from Gemini API")


def _call_openai(user_message: str, system_prompt: str, api_key: str) -> str:
    """
    Calls OpenAI-compatible /v1/chat/completions endpoint.
    """
    model = settings.AI_MODEL or "gpt-4o-mini"
    url = "https://api.openai.com/v1/chat/completions"

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.3,
        "max_tokens": 1000
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=18) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        choices = data.get("choices", [])
        if choices and len(choices) > 0:
            msg = choices[0].get("message", {})
            return str(msg.get("content", "")).strip()

    raise ValueError("Empty or invalid response from OpenAI-compatible API")
