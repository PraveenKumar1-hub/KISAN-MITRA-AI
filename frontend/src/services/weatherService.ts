import api from './api';
import type { WeatherResponse } from '../types/weather';

export async function fetchCurrentWeather(): Promise<WeatherResponse> {
  const response = await api.get<WeatherResponse>('/api/weather/current');
  return response.data;
}
