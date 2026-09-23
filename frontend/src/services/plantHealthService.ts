import api from './api';
import type { PlantHealthAnalysisResponse, ModelMetadata } from '../types/plantHealth';

export async function analyzePlantHealth(file: File): Promise<PlantHealthAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<PlantHealthAnalysisResponse>(
    '/api/plant-health/analyze',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

export async function fetchModelInfo(): Promise<ModelMetadata> {
  const response = await api.get<ModelMetadata>('/api/plant-health/model-info');
  return response.data;
}
