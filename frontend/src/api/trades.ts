import client from './client';
import type { ImportResult, Trade, TradeEnrichment } from '../types/trade';

export async function importCsv(
  file: File,
  sessionName: string,
  instrument: string
): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sessionName', sessionName);
  formData.append('instrument', instrument);

  const res = await client.post<ImportResult>('/backtest/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function listTrades(params: {
  isLive?: boolean;
  instrument?: string;
  sessionWindow?: string;
  signature?: string;
  regime?: string;
  year?: number;
  quarter?: number;
}): Promise<Trade[]> {
  const res = await client.get<Trade[]>('/trades', { params });
  return res.data;
}

export async function getTrade(id: number): Promise<Trade> {
  const res = await client.get<Trade>(`/trades/${id}`);
  return res.data;
}

export async function enrichTrade(id: number, data: TradeEnrichment): Promise<Trade> {
  const res = await client.patch<Trade>(`/trades/${id}`, data);
  return res.data;
}

export async function uploadTradeImage(id: number, file: File): Promise<Trade> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await client.post<Trade>(`/trades/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export function getTradeImageUrl(id: number): string {
  return `/api/trades/${id}/image`;
}

export async function deleteTrade(id: number): Promise<void> {
  await client.delete(`/trades/${id}`);
}
