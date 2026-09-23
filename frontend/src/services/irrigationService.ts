import api from './api';
import type { IrrigationAdvisoryResponse } from '../types/irrigation';

export async function fetchIrrigationAdvisory(): Promise<IrrigationAdvisoryResponse> {
  const response = await api.get<IrrigationAdvisoryResponse>('/api/irrigation/advisory');
  return response.data;
}
