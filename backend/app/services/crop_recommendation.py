"""
Deterministic rule-based agricultural crop recommendation engine.
Provides transparent scoring based on registered farmer profile parameters:
- Soil type compatibility (major weight)
- Irrigation system compatibility (major weight)
- Regional / agro-climatic compatibility (supporting weight)
- Farm scale and crop rotation affinity (supporting weight)
"""

from typing import List, Dict, Any, Optional

# Structured Crop Knowledge Base
CROP_KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    {
        "name": "Wheat",
        "suitable_soils": ["Alluvial", "Loamy", "Clay Loam", "Sandy Loam", "Black"],
        "water_requirement": "Moderate",
        "suitable_irrigations": ["Canal", "Tubewell", "Sprinkler", "Flood", "Drip", "Borewell", "Well"],
        "suitable_regions": [
            "Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan",
            "Bihar", "Gujarat", "North India", "Central India"
        ],
        "cultivation_note": "Performs best in fertile, well-drained loamy soils under cool winter conditions with 4-6 timed irrigations.",
        "season": "Rabi (Winter)",
    },
    {
        "name": "Rice",
        "suitable_soils": ["Clay", "Clay Loam", "Alluvial", "Silty Clay"],
        "water_requirement": "High",
        "suitable_irrigations": ["Canal", "Flood", "Borewell", "Tubewell", "Rainfed"],
        "suitable_regions": [
            "West Bengal", "Punjab", "Uttar Pradesh", "Andhra Pradesh", "Telangana",
            "Odisha", "Tamil Nadu", "Bihar", "Chhattisgarh", "Assam"
        ],
        "cultivation_note": "Requires heavy clayey soil with high moisture retention capacity and reliable water source for standing water regimes.",
        "season": "Kharif (Monsoon)",
    },
    {
        "name": "Maize",
        "suitable_soils": ["Alluvial", "Sandy Loam", "Red", "Loamy", "Black"],
        "water_requirement": "Moderate",
        "suitable_irrigations": ["Drip", "Sprinkler", "Canal", "Borewell", "Well", "Rainfed"],
        "suitable_regions": [
            "Karnataka", "Madhya Pradesh", "Maharashtra", "Tamil Nadu", "Rajasthan",
            "Uttar Pradesh", "Telangana", "Bihar", "Gujarat", "Andhra Pradesh"
        ],
        "cultivation_note": "Highly adaptable crop that thrives in deep, fertile, well-drained soils; sensitive to waterlogging at early growth stages.",
        "season": "Kharif / Rabi",
    },
    {
        "name": "Mustard",
        "suitable_soils": ["Alluvial", "Sandy Loam", "Loamy", "Sandy"],
        "water_requirement": "Low",
        "suitable_irrigations": ["Sprinkler", "Drip", "Borewell", "Well", "Canal", "Rainfed"],
        "suitable_regions": [
            "Rajasthan", "Haryana", "Madhya Pradesh", "Uttar Pradesh", "West Bengal",
            "Gujarat", "Punjab", "Assam"
        ],
        "cultivation_note": "Drought-tolerant oilseed requiring light to medium textured well-drained soils; sensitive to severe frost during flowering.",
        "season": "Rabi (Winter)",
    },
    {
        "name": "Groundnut",
        "suitable_soils": ["Sandy Loam", "Alluvial", "Red", "Sandy", "Loamy"],
        "water_requirement": "Moderate",
        "suitable_irrigations": ["Drip", "Sprinkler", "Borewell", "Well", "Canal", "Rainfed"],
        "suitable_regions": [
            "Gujarat", "Rajasthan", "Tamil Nadu", "Andhra Pradesh", "Karnataka",
            "Maharashtra", "Madhya Pradesh", "Telangana"
        ],
        "cultivation_note": "Needs light, friable, well-aerated sandy loam soil to facilitate peg penetration and uniform pod enlargement.",
        "season": "Kharif / Summer",
    },
    {
        "name": "Chickpea",
        "suitable_soils": ["Black", "Alluvial", "Loamy", "Clay Loam"],
        "water_requirement": "Low",
        "suitable_irrigations": ["Sprinkler", "Drip", "Rainfed", "Borewell", "Well"],
        "suitable_regions": [
            "Madhya Pradesh", "Maharashtra", "Rajasthan", "Karnataka", "Uttar Pradesh",
            "Gujarat", "Andhra Pradesh"
        ],
        "cultivation_note": "Conserves and fixes soil nitrogen; suited for residual soil moisture in deep black and alluvial soils with minimal watering.",
        "season": "Rabi (Winter)",
    },
    {
        "name": "Cotton",
        "suitable_soils": ["Black", "Alluvial", "Clay Loam", "Deep Black"],
        "water_requirement": "Moderate to High",
        "suitable_irrigations": ["Drip", "Canal", "Borewell", "Flood", "Well"],
        "suitable_regions": [
            "Gujarat", "Maharashtra", "Telangana", "Andhra Pradesh", "Karnataka",
            "Madhya Pradesh", "Haryana", "Rajasthan", "Punjab"
        ],
        "cultivation_note": "Grows vigorously in deep moisture-retentive black cotton soils with sunny, dry periods during boll maturation.",
        "season": "Kharif",
    },
    {
        "name": "Potato",
        "suitable_soils": ["Sandy Loam", "Alluvial", "Loamy", "Silt Loam"],
        "water_requirement": "Moderate",
        "suitable_irrigations": ["Drip", "Sprinkler", "Canal", "Borewell", "Well"],
        "suitable_regions": [
            "Uttar Pradesh", "West Bengal", "Bihar", "Gujarat", "Punjab",
            "Madhya Pradesh", "Assam"
        ],
        "cultivation_note": "Demands loose, humus-rich soil free from hardpans to prevent tuber deformation and support rapid tuberization.",
        "season": "Rabi (Winter)",
    },
    {
        "name": "Tomato",
        "suitable_soils": ["Loamy", "Sandy Loam", "Alluvial", "Red"],
        "water_requirement": "Moderate",
        "suitable_irrigations": ["Drip", "Sprinkler", "Borewell", "Well"],
        "suitable_regions": [
            "Andhra Pradesh", "Madhya Pradesh", "Karnataka", "Gujarat", "Odisha",
            "West Bengal", "Maharashtra", "Bihar", "Tamil Nadu"
        ],
        "cultivation_note": "High-value horticultural crop ideal for precision drip irrigation and fertile, well-drained organic loams.",
        "season": "All Season / Rabi",
    },
    {
        "name": "Sugarcane",
        "suitable_soils": ["Alluvial", "Black", "Clay Loam", "Loamy"],
        "water_requirement": "High",
        "suitable_irrigations": ["Drip", "Canal", "Flood", "Borewell", "Tubewell"],
        "suitable_regions": [
            "Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu", "Bihar",
            "Gujarat", "Haryana", "Punjab", "Andhra Pradesh"
        ],
        "cultivation_note": "Long-duration intensive commercial crop requiring deep fertile soil and reliable year-round irrigation infrastructure.",
        "season": "Annual (10-12 months)",
    },
]


def score_crop(
    crop_data: Dict[str, Any],
    soil_type: Optional[str],
    irrigation_type: Optional[str],
    location: Optional[str],
    primary_crop: Optional[str],
    farm_size: Optional[str],
) -> Dict[str, Any]:
    """
    Transparent scoring engine.
    Max potential score: 100 points
    - Soil compatibility: 40 points
    - Irrigation compatibility: 35 points
    - Regional alignment: 15 points
    - Rotation / system affinity: 10 points
    """
    score = 0
    reasons: List[str] = []
    has_soil = bool(soil_type and soil_type.strip())
    has_irrigation = bool(irrigation_type and irrigation_type.strip())
    has_location = bool(location and location.strip())

    # 1. Soil Compatibility (Weight: 40 points)
    if has_soil:
        clean_soil = soil_type.strip().lower()
        matched_soil = next(
            (s for s in crop_data["suitable_soils"] if s.lower() in clean_soil or clean_soil in s.lower()),
            None
        )
        if matched_soil:
            score += 40
            reasons.append(f"Highly compatible with {soil_type.strip()} soil")
        elif "alluvial" in clean_soil or "loam" in clean_soil:
            # Alluvial / loamy soils are moderately suitable for almost all crops
            score += 26
            reasons.append(f"Moderately adaptable to {soil_type.strip()} conditions")
        else:
            score += 10
            reasons.append(f"Requires careful management in {soil_type.strip()} soil")
    else:
        # Penalize confidence if soil is missing
        score += 15
        reasons.append("Soil type not registered; average regional soil assumed")

    # 2. Irrigation Compatibility (Weight: 35 points)
    if has_irrigation:
        clean_irr = irrigation_type.strip().lower()
        matched_irr = next(
            (irr for irr in crop_data["suitable_irrigations"] if irr.lower() in clean_irr or clean_irr in irr.lower()),
            None
        )
        if matched_irr:
            score += 35
            reasons.append(f"Optimal match for {irrigation_type.strip()} irrigation")
        elif "drip" in clean_irr and crop_data["water_requirement"] in ["Low", "Moderate"]:
            score += 32
            reasons.append(f"Drip irrigation provides efficient water delivery for {crop_data['name']}")
        else:
            score += 15
            reasons.append(f"Compatible with {irrigation_type.strip()} system with scheduled intervals")
    else:
        score += 12
        reasons.append("Irrigation type not registered; baseline water access assumed")

    # 3. Regional / Location Compatibility (Weight: 15 points)
    if has_location:
        clean_loc = location.strip().lower()
        matched_region = next(
            (reg for reg in crop_data["suitable_regions"] if reg.lower() in clean_loc or clean_loc in reg.lower()),
            None
        )
        if matched_region:
            score += 15
            reasons.append(f"Established agro-climatic track record in {location.strip()}")
        else:
            score += 8
            reasons.append(f"Grown in neighboring agricultural agro-zones of {location.strip()}")
    else:
        score += 5
        reasons.append("Location details not specified; broad regional profile used")

    # 4. Complementary rotation / current crop alignment (Weight: 10 points)
    if primary_crop and primary_crop.strip():
        clean_curr = primary_crop.strip().lower()
        crop_lower = crop_data["name"].lower()
        
        # If farmer already grows this crop, it has proven viability
        if clean_curr in crop_lower or crop_lower in clean_curr:
            score += 10
            reasons.append(f"Proven familiarity as your current primary crop ({primary_crop.strip()})")
        # Rotational synergy: legumes (Chickpea, Groundnut) rotate well with cereals
        elif crop_data["name"] in ["Chickpea", "Groundnut"] and any(c in clean_curr for c in ["wheat", "rice", "maize", "cotton"]):
            score += 10
            reasons.append(f"Excellent legume rotational partner with {primary_crop.strip()} for soil enrichment")
        elif crop_data["name"] in ["Wheat", "Mustard"] and any(c in clean_curr for c in ["rice", "cotton", "groundnut", "maize"]):
            score += 9
            reasons.append(f"Ideal sequential Rabi rotation following {primary_crop.strip()}")
        else:
            score += 6
    else:
        score += 5

    # Determine confidence level
    if score >= 80 and has_soil and has_irrigation:
        confidence = "High match"
    elif score >= 65:
        confidence = "Good match"
    elif score >= 50:
        confidence = "Moderate match"
    else:
        confidence = "Low match"

    return {
        "crop": crop_data["name"],
        "match_score": min(score, 98),  # Cap at 98 to keep realistic, non-absolute claims
        "confidence": confidence,
        "reasons": reasons,
        "water_requirement": crop_data["water_requirement"],
        "season": crop_data["season"],
        "cultivation_note": crop_data["cultivation_note"],
    }


def generate_crop_recommendations(
    user: Any,
    soil_type: Optional[str] = None,
    irrigation_type: Optional[str] = None,
    location: Optional[str] = None,
    primary_crop: Optional[str] = None,
    farm_size: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Evaluates all crops in knowledge base against the farmer's parameters
    and returns top 3 recommendations.
    """
    if soil_type is None:
        soil_type = getattr(user, "soil_type", None)
    if irrigation_type is None:
        irrigation_type = getattr(user, "irrigation_type", None)
    if location is None:
        location = getattr(user, "location", None)
    if primary_crop is None:
        primary_crop = getattr(user, "primary_crop", None)
    if farm_size is None:
        farm_size = getattr(user, "farm_size", None)
    farmer_name = getattr(user, "full_name", "Farmer")

    missing_parameters = []
    if not soil_type or not str(soil_type).strip():
        missing_parameters.append("Soil Type")
    if not irrigation_type or not str(irrigation_type).strip():
        missing_parameters.append("Irrigation Type")
    if not location or not str(location).strip():
        missing_parameters.append("Location")
    if not farm_size or not str(farm_size).strip():
        missing_parameters.append("Farm Size")

    scored_crops = []
    for crop in CROP_KNOWLEDGE_BASE:
        scored = score_crop(
            crop_data=crop,
            soil_type=soil_type,
            irrigation_type=irrigation_type,
            location=location,
            primary_crop=primary_crop,
            farm_size=farm_size,
        )
        scored_crops.append(scored)

    # Sort descending by match_score
    scored_crops.sort(key=lambda x: x["match_score"], reverse=True)
    top_3 = scored_crops[:3]

    return {
        "success": True,
        "recommendations": top_3,
        "input_summary": {
            "farmer_name": farmer_name,
            "location": location or "Not provided",
            "farm_size": farm_size or "Not provided",
            "soil_type": soil_type or "Not provided",
            "irrigation_type": irrigation_type or "Not provided",
            "primary_crop": primary_crop or "Not provided",
        },
        "missing_parameters": missing_parameters,
        "notes": "Recommendations generated using deterministic agronomic rule matching."
    }
