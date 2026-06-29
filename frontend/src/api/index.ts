// src/api/index.ts
import axios from 'axios';
import type {
  HealthResponse,
  InflationPredictionResponse,
  Indicator,
  LatestValuesResponse,
  TimeSeriesResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// ── Indicators ──────────────────────────────────────────────────

export async function fetchIndicators(): Promise<Indicator[]> {
  const { data } = await api.get<Indicator[]>('/api/indicators');
  return data;
}

export async function fetchTimeSeries(
  name: string,
  params?: { start_date?: string; end_date?: string; limit?: number }
): Promise<TimeSeriesResponse> {
  const { data } = await api.get<TimeSeriesResponse>(`/api/indicator/${name}`, { params });
  return data;
}

export async function fetchLatestValues(): Promise<LatestValuesResponse> {
  const { data } = await api.get<LatestValuesResponse>('/api/latest');
  return data;
}

// ── Prediction ──────────────────────────────────────────────────

export async function fetchInflationPrediction(
  years_ahead = 3
): Promise<InflationPredictionResponse> {
  const { data } = await api.get<InflationPredictionResponse>('/api/predict/inflation', {
    params: { years_ahead },
  });
  return data;
}

// ── Health ──────────────────────────────────────────────────────

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health');
  return data;
}

// ── Admin: manual refresh ──────────────────────────────────────

export async function triggerRefresh(): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/admin/refresh');
  return data;
}
