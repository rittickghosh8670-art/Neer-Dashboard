export interface EquityPoint {
  date: string;
  cumulativePnl: number;
}

export interface Metrics {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  avgRiskReward: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  equityCurve: EquityPoint[];
  pnlByDay: Record<string, number>;
  breakdownBySessionWindow?: Record<string, Metrics>;
  breakdownBySignature?: Record<string, Metrics>;
  breakdownByRegime?: Record<string, Metrics>;
}
