export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  apparent_temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  weather_code: number;
  weather_condition: string;
}

export interface ForecastItem {
  date: string;
  day_index: number;
  temp_max?: number | null;
  temp_min?: number | null;
  weather_code: number;
  weather_condition: string;
  precipitation_sum: number;
  precipitation_probability: number;
}

export interface WeatherResponse {
  success: boolean;
  location?: string | null;
  resolved_location?: string | null;
  coordinates?: Coordinates | null;
  current?: CurrentWeather | null;
  forecast?: ForecastItem[] | null;
  farming_insights?: string[] | null;
  irrigation_advisory?: string | null;
  updated_at?: string | null;
  error_type?: string | null;
  message?: string | null;
}
