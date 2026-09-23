import api from './api';

export interface InsightItem {
  id: string;
  type: 'weather' | 'irrigation' | 'crop' | 'plant_health' | 'market';
  priority: 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  action_label?: string;
  action_route?: string;
  source_name: string;
  reasons?: string[];
}

export interface RecommendedAction {
  id: string;
  category: string;
  priority: 'high' | 'medium' | 'low' | 'info';
  title: string;
  short_explanation: string;
  action_label: string;
  action_route: string;
}

export interface DataSourceStatus {
  name: string;
  status: 'available' | 'unavailable' | 'not_analyzed' | 'not_configured';
  label: string;
  last_updated?: string | null;
  details?: string | null;
}

export interface FarmIntelligenceResponse {
  status: 'success' | 'partial';
  generated_at: string;
  farmer_name: string;
  location?: string | null;
  summary: string;
  insights: InsightItem[];
  actions: RecommendedAction[];
  data_sources: Record<string, DataSourceStatus>;
}

export async function fetchFarmInsights(): Promise<FarmIntelligenceResponse> {
  const response = await api.get<FarmIntelligenceResponse>('/api/insights');
  return response.data;
}
