import api from './api';

export interface FarmDetails {
  full_name: string;
  farm_size: string;
  location: string;
  soil_type?: string | null;
  irrigation_type?: string | null;
  primary_crop?: string | null;
}

export interface FarmUpdatePayload {
  farm_size?: string;
  location?: string;
  soil_type?: string;
  irrigation_type?: string;
  primary_crop?: string;
}

export async function fetchFarmDetails(): Promise<FarmDetails> {
  const response = await api.get<FarmDetails>('/api/farm');
  return response.data;
}

export async function updateFarmDetails(payload: FarmUpdatePayload): Promise<FarmDetails> {
  const response = await api.put<FarmDetails>('/api/farm', payload);
  return response.data;
}
