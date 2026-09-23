export interface ImageDetails {
  filename: string;
  format: string;
  width: number;
  height: number;
  size_kb: number;
}

export interface DiseaseAdvisory {
  symptoms?: string | null;
  prevention?: string | null;
  general_management?: string | null;
  treatment_guidance?: string | null;
  severity?: string | null;
}

export interface PlantDiseasePrediction {
  status: 'success' | 'low_confidence';
  plant: string;
  disease: string;
  confidence: number;
  recommendation: string;
  advisory?: DiseaseAdvisory | null;
}

export interface ModelMetadata {
  model_available: boolean;
  model_type: string;
  model_path: string;
  confidence_threshold: number;
  input_resolution: string;
  supported_formats: string[];
  max_file_size_mb: number;
}

export interface PlantHealthAnalysisResponse {
  status: 'model_unavailable' | 'success' | 'low_confidence' | 'invalid_image' | 'processing_error';
  message: string;
  image_valid: boolean;
  image_details?: ImageDetails | null;
  result?: PlantDiseasePrediction | null;
  model_info?: ModelMetadata | null;
}
