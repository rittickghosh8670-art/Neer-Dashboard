import client from './client';
import type { Trade } from '../types/trade';

export interface RegimeResult {
  regime: string;
  confidence: number;
  direction: string;
  avgConditionalVolatility: number;
  unconditionalVolatility: number;
  volatilityRatio: number;
  trendRSquared: number;
  isHighVol: boolean;
  isTrending: boolean;
}

export async function classifyRegimeForTrade(tradeId: number, prices: number[]): Promise<Trade> {
  const res = await client.post<Trade>(`/regime/classify/${tradeId}`, { prices });
  return res.data;
}

export async function previewRegime(prices: number[]): Promise<RegimeResult> {
  const res = await client.post<RegimeResult>('/regime/classify', { prices });
  return res.data;
}
