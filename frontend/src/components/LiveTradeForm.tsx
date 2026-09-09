import { useState } from 'react';
import { createLiveTrade } from '../api/liveTrades';
import {
  IB_TYPES,
  INSTRUMENTS,
  MS_DIRECTIONS,
  SESSION_WINDOWS,
  SETUP_GRADES,
  SIGNATURES,
  VWAP_SIDES,
} from '../types/trade';
import type { Trade } from '../types/trade';
import type { LiveTradeInput } from '../api/liveTrades';

interface Props {
  onCreated: (trade: Trade) => void;
}

const emptyForm: LiveTradeInput = {
  dateStart: '',
  instrument: INSTRUMENTS[0],
  side: 'buy',
  entryPrice: 0,
};

function LiveTradeForm({ onCreated }: Props) {
  const [form, setForm] = useState<LiveTradeInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof LiveTradeInput>(key: K, value: LiveTradeInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dateStart || !form.entryPrice) {
      setError('Date/time and entry price are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createLiveTrade(form);
      onCreated(created);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log trade.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="live-trade-form" onSubmit={handleSubmit}>
      <h3>Log Live Trade</h3>

      <div className="enrichment-grid">
        <div className="form-row">
          <label>Date/Time *</label>
          <input
            type="datetime-local"
            value={form.dateStart}
            onChange={(e) => update('dateStart', e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Instrument</label>
          <select value={form.instrument} onChange={(e) => update('instrument', e.target.value)}>
            {INSTRUMENTS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Side</label>
          <select value={form.side} onChange={(e) => update('side', e.target.value as 'buy' | 'sell')}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        <div className="form-row">
          <label>Entry Price *</label>
          <input
            type="number"
            step="0.01"
            value={form.entryPrice || ''}
            onChange={(e) => update('entryPrice', Number(e.target.value))}
          />
        </div>

        <div className="form-row">
          <label>Initial SL</label>
          <input
            type="number"
            step="0.01"
            value={form.initialSl ?? ''}
            onChange={(e) => update('initialSl', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>Ideal TP</label>
          <input
            type="number"
            step="0.01"
            value={form.idealTp ?? ''}
            onChange={(e) => update('idealTp', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>Avg Close Price</label>
          <input
            type="number"
            step="0.01"
            value={form.avgClosePrice ?? ''}
            onChange={(e) => update('avgClosePrice', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>Realized PnL</label>
          <input
            type="number"
            step="0.01"
            value={form.realizedPnl ?? ''}
            onChange={(e) => update('realizedPnl', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>Avg RR</label>
          <input
            type="number"
            step="0.01"
            value={form.avgRiskReward ?? ''}
            onChange={(e) => update('avgRiskReward', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>Session Window</label>
          <select
            value={form.sessionWindow ?? ''}
            onChange={(e) => update('sessionWindow', e.target.value || undefined)}
          >
            <option value="">Auto-detect</option>
            {SESSION_WINDOWS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>IB Type</label>
          <select value={form.ibType ?? ''} onChange={(e) => update('ibType', e.target.value || undefined)}>
            <option value="">-</option>
            {IB_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>VWAP Side</label>
          <select value={form.vwapSide ?? ''} onChange={(e) => update('vwapSide', e.target.value || undefined)}>
            <option value="">-</option>
            {VWAP_SIDES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>5min MS Direction</label>
          <select value={form.msDirection ?? ''} onChange={(e) => update('msDirection', e.target.value || undefined)}>
            <option value="">-</option>
            {MS_DIRECTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Entry Signature</label>
          <select value={form.signature ?? ''} onChange={(e) => update('signature', e.target.value || undefined)}>
            <option value="">-</option>
            {SIGNATURES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Setup Grade</label>
          <select value={form.setupGrade ?? ''} onChange={(e) => update('setupGrade', e.target.value || undefined)}>
            <option value="">-</option>
            {SETUP_GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <label>Notes</label>
        <textarea
          rows={3}
          value={form.notes ?? ''}
          onChange={(e) => update('notes', e.target.value || undefined)}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Log Trade'}
      </button>
    </form>
  );
}

export default LiveTradeForm;
