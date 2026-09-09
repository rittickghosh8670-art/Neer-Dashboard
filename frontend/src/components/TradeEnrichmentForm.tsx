import { useEffect, useState } from 'react';
import {
  IB_TYPES,
  MS_DIRECTIONS,
  SESSION_WINDOWS,
  SETUP_GRADES,
  SIGNATURES,
  VWAP_SIDES,
} from '../types/trade';
import type { Trade, TradeEnrichment } from '../types/trade';
import { enrichTrade, getTradeImageUrl, uploadTradeImage } from '../api/trades';

interface Props {
  trade: Trade;
  onUpdated: (trade: Trade) => void;
  onClose: () => void;
}

function TradeEnrichmentForm({ trade, onUpdated, onClose }: Props) {
  const [form, setForm] = useState<TradeEnrichment>({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      sessionWindow: trade.sessionWindow,
      ibType: trade.ibType,
      ibLevel: trade.ibLevel,
      vwapSide: trade.vwapSide,
      msDirection: trade.msDirection,
      signature: trade.signature,
      setupGrade: trade.setupGrade,
      confluenceCount: trade.confluenceCount,
      srZoneLow: trade.srZoneLow,
      srZoneHigh: trade.srZoneHigh,
      classicLevel: trade.classicLevel,
      notes: trade.notes,
    });
    setError(null);
  }, [trade]);

  const update = <K extends keyof TradeEnrichment>(key: K, value: TradeEnrichment[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await enrichTrade(trade.id, form);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError(null);
    try {
      const updated = await uploadTradeImage(trade.id, file);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="enrichment-panel">
      <div className="enrichment-header">
        <h3>Trade #{trade.id} — {trade.instrument} — {trade.side}</h3>
        <button onClick={onClose}>Close</button>
      </div>

      <div className="enrichment-grid">
        <div className="form-row">
          <label>Session Window</label>
          <select
            value={form.sessionWindow ?? ''}
            onChange={(e) => update('sessionWindow', e.target.value || undefined)}
          >
            <option value="">-</option>
            {SESSION_WINDOWS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>IB Type</label>
          <select
            value={form.ibType ?? ''}
            onChange={(e) => update('ibType', e.target.value || undefined)}
          >
            <option value="">-</option>
            {IB_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>IB Level</label>
          <input
            type="number"
            step="0.01"
            value={form.ibLevel ?? ''}
            onChange={(e) => update('ibLevel', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>VWAP Side</label>
          <select
            value={form.vwapSide ?? ''}
            onChange={(e) => update('vwapSide', e.target.value || undefined)}
          >
            <option value="">-</option>
            {VWAP_SIDES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>5min MS Direction</label>
          <select
            value={form.msDirection ?? ''}
            onChange={(e) => update('msDirection', e.target.value || undefined)}
          >
            <option value="">-</option>
            {MS_DIRECTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Entry Signature</label>
          <select
            value={form.signature ?? ''}
            onChange={(e) => update('signature', e.target.value || undefined)}
          >
            <option value="">-</option>
            {SIGNATURES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Setup Grade</label>
          <select
            value={form.setupGrade ?? ''}
            onChange={(e) => update('setupGrade', e.target.value || undefined)}
          >
            <option value="">-</option>
            {SETUP_GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Confluence Count</label>
          <input
            type="number"
            min="0"
            max="10"
            value={form.confluenceCount ?? ''}
            onChange={(e) => update('confluenceCount', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>S/R Zone Low</label>
          <input
            type="number"
            step="0.01"
            value={form.srZoneLow ?? ''}
            onChange={(e) => update('srZoneLow', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>S/R Zone High</label>
          <input
            type="number"
            step="0.01"
            value={form.srZoneHigh ?? ''}
            onChange={(e) => update('srZoneHigh', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>Classic Level</label>
          <input
            type="number"
            step="0.01"
            value={form.classicLevel ?? ''}
            onChange={(e) => update('classicLevel', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div className="form-row">
        <label>Notes</label>
        <textarea
          rows={4}
          value={form.notes ?? ''}
          onChange={(e) => update('notes', e.target.value || undefined)}
          placeholder="Trade rationale, mistakes, observations..."
        />
      </div>

      <div className="form-row">
        <label>Trade Screenshot</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
        {trade.imagePath && (
          <img
            className="trade-image-preview"
            src={getTradeImageUrl(trade.id)}
            alt={`Trade ${trade.id} screenshot`}
          />
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Trade'}
      </button>
    </div>
  );
}

export default TradeEnrichmentForm;
