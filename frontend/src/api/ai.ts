import client from './client';

export interface InsightResult {
  insight: string;
  model: string;
}

export async function getAIInsight(
  tradeIds: number[],
  question?: string,
  includeImageFromTradeId?: boolean
): Promise<InsightResult> {
  const res = await client.post<InsightResult>('/ai/insight', {
    tradeIds,
    question,
    includeImageFromTradeId: includeImageFromTradeId ?? false,
  });
  return res.data;
}
