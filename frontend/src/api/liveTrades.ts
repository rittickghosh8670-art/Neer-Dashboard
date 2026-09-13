import client from './client';
import type { Trade } from '../types/trade';

export interface LiveTradeInput {
  dateStart: string;
  dateEnd?: string;
  instrument: string;
  side: 'buy' | 'sell';
  entryPrice: number;
  initialSl?: number;
  maxTp?: number;
  idealTp?: number;
  avgClosePrice?: number;
  amount?: number;
  amountClosed?: number;
  status?: string;
  realizedPnl?: number;
  unrealizedPnl?: number;
  avgRiskReward?: number;
  maxRiskReward?: number;
  sessionWindow?: string;
  ibType?: string;
  vwapSide?: string;
  msDirection?: string;
  signature?: string;
  setupGrade?: string;
  srZoneLow?: number;
  srZoneHigh?: number;
  classicLevel?: number;

  srType?: string;
  srTouchCount?: string;
  srFailureCount?: string;

  slPlacement?: string;

  targetClassicLevelR?: number;
  targetFurtherSrR?: number;
  targetIbHighLowR?: number;

  mgmtNoMoveR?: number;
  mgmtExtendedTargetR?: number;
  mgmtPartialBookTrailR?: number;

  notes?: string;
}

export async function listLiveTrades(): Promise<Trade[]> {
  const res = await client.get<Trade[]>('/live');
  return res.data;
}

export async function createLiveTrade(data: LiveTradeInput): Promise<Trade> {
  const res = await client.post<Trade>('/live', data);
  return res.data;
}

export async function updateLiveTrade(id: number, data: Partial<LiveTradeInput>): Promise<Trade> {
  const res = await client.put<Trade>(`/live/${id}`, data);
  return res.data;
}

export async function deleteLiveTrade(id: number): Promise<void> {
  await client.delete(`/live/${id}`);
}
