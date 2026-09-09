export interface Trade {
  id: number;
  backtestSessionId?: number;
  isLive: boolean;

  externalId?: string;
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
  rawTags?: string;

  sessionWindow?: string;
  ibType?: 'single_break' | 'double_break' | 'none';
  ibLevel?: number;
  vwapSide?: 'above' | 'below';
  msDirection?: 'uptrend' | 'downtrend' | 'range';
  signature?: 'bull180' | 'bear180' | 'torpedo' | 'power_bar';
  setupGrade?: 'A' | 'B' | 'C';
  confluenceCount?: number;
  srZoneLow?: number;
  srZoneHigh?: number;
  classicLevel?: number;

  regime?: string;
  regimeConfidence?: number;

  imagePath?: string;
  notes?: string;
}

export interface TradeEnrichment {
  sessionWindow?: string;
  ibType?: string;
  ibLevel?: number;
  vwapSide?: string;
  msDirection?: string;
  signature?: string;
  setupGrade?: string;
  confluenceCount?: number;
  srZoneLow?: number;
  srZoneHigh?: number;
  classicLevel?: number;
  notes?: string;
}

export interface ImportResult {
  backtestSessionId: number;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  warnings: string[];
}

export const SESSION_WINDOWS = ['01:30-02:30', '03:00-04:30', '14:00-16:00'] as const;
export const IB_TYPES = ['single_break', 'double_break', 'none'] as const;
export const VWAP_SIDES = ['above', 'below'] as const;
export const MS_DIRECTIONS = ['uptrend', 'downtrend', 'range'] as const;
export const SIGNATURES = ['bull180', 'bear180', 'torpedo', 'power_bar'] as const;
export const SETUP_GRADES = ['A', 'B', 'C'] as const;
export const INSTRUMENTS = ['CME_MINI:MNQ', 'CME_MINI:MGC'] as const;
