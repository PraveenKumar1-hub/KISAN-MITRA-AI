import api from './api';
import type { CropAdvisoryResponse, CropAdvisoryRequest } from '../types/cropAdvisory';

export async function fetchCropRecommendations(payload?: CropAdvisoryRequest): Promise<CropAdvisoryResponse> {
  const response = await api.post<CropAdvisoryResponse>('/api/crop-advisory/recommend', payload ?? {});
  return response.data;
}
