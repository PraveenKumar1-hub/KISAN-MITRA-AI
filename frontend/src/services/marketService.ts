import api from './api';
import type { MarketPriceResponse } from '../types/market';

export async function fetchMarketPrices(
  crop?: string,
  location?: string
): Promise<MarketPriceResponse> {
  const params: Record<string, string> = {};
  if (crop && crop.trim()) {
    params.crop = crop.trim();
  }
  if (location && location.trim()) {
    params.location = location.trim();
  }

  const response = await api.get<MarketPriceResponse>('/api/market-prices', { params });
  return response.data;
}
