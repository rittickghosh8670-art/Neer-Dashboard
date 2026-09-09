import { INSTRUMENTS, SESSION_WINDOWS, SIGNATURES } from '../types/trade';

export interface FilterState {
  instrument?: string;
  sessionWindow?: string;
  signature?: string;
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

function TradeFilters({ filters, onChange }: Props) {
  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="trade-filters">
      <select value={filters.instrument ?? ''} onChange={(e) => update('instrument', e.target.value)}>
        <option value="">All Instruments</option>
        {INSTRUMENTS.map((i) => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>

      <select value={filters.sessionWindow ?? ''} onChange={(e) => update('sessionWindow', e.target.value)}>
        <option value="">All Sessions</option>
        {SESSION_WINDOWS.map((w) => (
          <option key={w} value={w}>{w}</option>
        ))}
      </select>

      <select value={filters.signature ?? ''} onChange={(e) => update('signature', e.target.value)}>
        <option value="">All Signatures</option>
        {SIGNATURES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

export default TradeFilters;
