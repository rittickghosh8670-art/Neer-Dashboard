import { useEffect, useState } from 'react';
import {
  ENTRY_BASES,
  IB_TYPES,
  MS_DIRECTIONS,
  SESSION_WINDOWS,
  SETUP_GRADES,
  SIGNATURES,
  SL_PLACEMENTS,
  SR_FAILURE_COUNTS,
  SR_TOUCH_COUNTS,
  SR_TYPES,
  VWAP_SIDES,
} from '../types/trade';
import type { Trade, TradeEnrichment } from '../types/trade';
import { deleteTrade, enrichTrade, getTradeImageUrl, uploadTradeImage } from '../api/trades';

interface Props {
  trade: Trade;
  onUpdated: (trade: Trade) => void;
  onClose: () => void;
  onDeleted?: (tradeId: number) => void;
}

function TradeEnrichmentForm({ trade, onUpdated, onClose, onDeleted }: Props) {
  const [form, setForm] = useState<TradeEnrichment>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      sessionWindow: trade.sessionWindow,
      ibType: trade.ibType,
      vwapSide: trade.vwapSide,
      msDirection: trade.msDirection,
      signature: trade.signature,
      setupGrade: trade.setupGrade,
      srZoneLow: trade.srZoneLow,
      srZoneHigh: trade.srZoneHigh,
      classicLevel: trade.classicLevel,
      entryBasis: trade.entryBasis,
      srType: trade.srType,
      srTouchCount: trade.srTouchCount,
      srFailureCount: trade.srFailureCount,
      slPlacement: trade.slPlacement,
      targetClassicLevelR: trade.targetClassicLevelR,
      targetFurtherSrR: trade.targetFurtherSrR,
      targetIbHighLowR: trade.targetIbHighLowR,
      mgmtNoMoveR: trade.mgmtNoMoveR,
      mgmtExtendedTargetR: trade.mgmtExtendedTargetR,
      mgmtPartialBookTrailR: trade.mgmtPartialBookTrailR,
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
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete trade #${trade.id} (${trade.instrument} ${trade.side})? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      await deleteTrade(trade.id);
      onDeleted?.(trade.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
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

        <div className="form-row">
          <label>Entry Basis</label>
          <select
            value={form.entryBasis ?? ''}
            onChange={(e) => update('entryBasis', e.target.value || undefined)}
          >
            <option value="">-</option>
            {ENTRY_BASES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>S/R Type</label>
          <select
            value={form.srType ?? ''}
            onChange={(e) => update('srType', e.target.value || undefined)}
          >
            <option value="">-</option>
            {SR_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>S/R Touch Count</label>
          <select
            value={form.srTouchCount ?? ''}
            onChange={(e) => update('srTouchCount', e.target.value || undefined)}
          >
            <option value="">-</option>
            {SR_TOUCH_COUNTS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>S/R Failure Count</label>
          <select
            value={form.srFailureCount ?? ''}
            onChange={(e) => update('srFailureCount', e.target.value || undefined)}
          >
            <option value="">-</option>
            {SR_FAILURE_COUNTS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>SL Placement</label>
          <select
            value={form.slPlacement ?? ''}
            onChange={(e) => update('slPlacement', e.target.value || undefined)}
          >
            <option value="">-</option>
            {SL_PLACEMENTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="enrichment-section-label">Target R (fill the target type used; positive = hit, negative = stopped out, e.g. -1)</div>
      <div className="enrichment-grid">
        <div className="form-row">
          <label>Classic Level R</label>
          <input
            type="number"
            step="0.01"
            value={form.targetClassicLevelR ?? ''}
            onChange={(e) => update('targetClassicLevelR', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>Further S/R R</label>
          <input
            type="number"
            step="0.01"
            value={form.targetFurtherSrR ?? ''}
            onChange={(e) => update('targetFurtherSrR', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>IB High/Low R</label>
          <input
            type="number"
            step="0.01"
            value={form.targetIbHighLowR ?? ''}
            onChange={(e) => update('targetIbHighLowR', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div className="enrichment-section-label">Management R (actual + hypothetical, multiple allowed)</div>
      <div className="enrichment-grid">
        <div className="form-row">
          <label>No Move R</label>
          <input
            type="number"
            step="0.01"
            value={form.mgmtNoMoveR ?? ''}
            onChange={(e) => update('mgmtNoMoveR', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>Extended Target R</label>
          <input
            type="number"
            step="0.01"
            value={form.mgmtExtendedTargetR ?? ''}
            onChange={(e) => update('mgmtExtendedTargetR', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="form-row">
          <label>Partial Book + Trail R</label>
          <input
            type="number"
            step="0.01"
            value={form.mgmtPartialBookTrailR ?? ''}
            onChange={(e) => update('mgmtPartialBookTrailR', e.target.value ? Number(e.target.value) : undefined)}
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

      <div className="enrichment-footer-actions">
        <button onClick={handleSave} disabled={saving || deleting}>
          {saving ? 'Saving...' : 'Save Trade'}
        </button>
        <button className="delete-btn" onClick={handleDelete} disabled={saving || deleting}>
          {deleting ? 'Deleting...' : 'Delete Trade'}
        </button>
      </div>
    </div>
  );
}

export default TradeEnrichmentForm;
