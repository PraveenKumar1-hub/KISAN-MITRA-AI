export interface MarketPriceItem {
  crop: string;
  variety?: string | null;
  market: string;
  district?: string | null;
  state?: string | null;
  price: number;
  min_price?: number | null;
  max_price?: number | null;
  modal_price?: number | null;
  unit: string;
  date?: string | null;
  source?: string | null;
}

export interface PriceSummary {
  lowest_price: number;
  highest_price: number;
  average_price: number;
  unit: string;
  total_records: number;
}

export interface MarketPriceResponse {
  success: boolean;
  configured: boolean;
  status: 'success' | 'no_data' | 'unconfigured' | 'error';
  source: string;
  last_updated?: string | null;
  selected_crop?: string | null;
  selected_location?: string | null;
  results: MarketPriceItem[];
  summary?: PriceSummary | null;
  message?: string | null;
}
