import { INSTRUMENTS, SESSION_WINDOWS, SIGNATURES } from '../types/trade';

export interface FilterState {
  instrument?: string;
  sessionWindow?: string;
  signature?: string;
  year?: number;
  quarter?: number;
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  showInstrument?: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);
const QUARTER_OPTIONS = [1, 2, 3, 4];

function TradeFilters({ filters, onChange, showInstrument = true }: Props) {
  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const updateNumber = (key: 'year' | 'quarter', value: string) => {
    onChange({ ...filters, [key]: value ? Number(value) : undefined });
  };

  return (
    <div className="trade-filters">
      {showInstrument && (
        <select value={filters.instrument ?? ''} onChange={(e) => update('instrument', e.target.value)}>
          <option value="">All Instruments</option>
          {INSTRUMENTS.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      )}

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

      <select value={filters.year ?? ''} onChange={(e) => updateNumber('year', e.target.value)}>
        <option value="">All Years</option>
        {YEAR_OPTIONS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select
        value={filters.quarter ?? ''}
        onChange={(e) => updateNumber('quarter', e.target.value)}
        disabled={!filters.year}
        title={!filters.year ? 'Select a year first' : undefined}
      >
        <option value="">All Quarters</option>
        {QUARTER_OPTIONS.map((q) => (
          <option key={q} value={q}>Q{q}</option>
        ))}
      </select>
    </div>
  );
}

export default TradeFilters;
