import client from './client';
import type { Metrics } from '../types/metrics';

export async function getMetrics(isLive: boolean, instrument?: string): Promise<Metrics> {
  const res = await client.get<Metrics>('/metrics', { params: { isLive, instrument } });
  return res.data;
}
