// src/types/index.ts

export interface Indicator {
  id: number;
  name: string;
  display_name: string;
  category: string;
  unit: string;
  source?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface TimeSeriesResponse {
  indicator: Indicator;
  data: TimeSeriesPoint[];
}

export interface LatestValue {
  indicator_id: number;
  name: string;
  display_name: string;
  category: string;
  unit: string;
  value: number;
  date: string;
  fetched_at: string;
}

export interface LatestValuesResponse {
  items: LatestValue[];
  fetched_at: string;
}

export interface PredictionPoint {
  date: string;
  value: number;
  lower: number;
  upper: number;
  model: string;
}

export interface InflationPredictionResponse {
  historical: { date: string; value: number }[];
  predictions: PredictionPoint[];
  model_info: Record<string, unknown>;
}

export interface HealthResponse {
  status: string;
  db: string;
  scheduler: string;
  timestamp: string;
}
