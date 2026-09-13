import client from './client';
import type { Metrics } from '../types/metrics';

export interface MetricsFilters {
  instrument?: string;
  sessionWindow?: string;
  signature?: string;
  year?: number;
  quarter?: number;
}

export async function getMetrics(isLive: boolean, filters: MetricsFilters = {}): Promise<Metrics> {
  const res = await client.get<Metrics>('/metrics', { params: { isLive, ...filters } });
  return res.data;
}
