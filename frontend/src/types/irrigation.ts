export interface FarmSummary {
  crop: string;
  soil_type: string;
  irrigation_type: string;
  farm_size: string;
  location: string;
}

export interface WeatherSummary {
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  rain_probability: number;
  expected_rainfall_48h: number;
  weather_condition: string;
}

export interface IrrigationHistoryItem {
  id: number;
  status: string;
  status_label: string;
  recommendation: string;
  priority: string;
  created_at: string;
}

export interface IrrigationAdvisoryResponse {
  success: boolean;
  status: 'delay' | 'needed' | 'check_moisture' | 'insufficient_data';
  status_label: string;
  priority: 'Low' | 'Medium' | 'High';
  recommendation: string;
  reasons: string[];
  farm_summary: FarmSummary;
  weather_summary?: WeatherSummary | null;
  missing_parameters: string[];
  history: IrrigationHistoryItem[];
  generated_at?: string | null;
}
