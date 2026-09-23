export interface CropAdvisoryRequest {
  soil_type?: string;
  irrigation_type?: string;
  location?: string;
  farm_size?: string;
  primary_crop?: string;
}

export interface RecommendationItem {
  crop: string;
  match_score: number;
  confidence: string;
  reasons: string[];
  water_requirement: string;
  season?: string | null;
  cultivation_note: string;
}

export interface CropAdvisoryInputSummary {
  farmer_name: string;
  location: string;
  farm_size: string;
  soil_type: string;
  irrigation_type: string;
  primary_crop: string;
}

export interface CropAdvisoryResponse {
  success: boolean;
  recommendations: RecommendationItem[];
  input_summary: CropAdvisoryInputSummary;
  missing_parameters: string[];
  notes?: string;
}
