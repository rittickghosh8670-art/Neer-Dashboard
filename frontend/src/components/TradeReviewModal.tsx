import { useEffect } from 'react';
import type { Trade } from '../types/trade';
import { getTradeImageUrl } from '../api/trades';

interface Props {
  trades: Trade[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onEdit: (trade: Trade) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Badge({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <span className="review-badge">
      <span className="review-badge-label">{label}</span>
      <span className="review-badge-value">{value}</span>
    </span>
  );
}

function TradeReviewModal({ trades, currentIndex, onClose, onNavigate, onEdit }: Props) {
  const trade = trades[currentIndex];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < trades.length - 1) onNavigate(currentIndex + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, trades.length, onClose, onNavigate]);

  if (!trade) return null;

  const pnlClass = trade.realizedPnl === undefined || trade.realizedPnl === null
    ? ''
    : trade.realizedPnl > 0 ? 'pnl-positive' : trade.realizedPnl < 0 ? 'pnl-negative' : '';

  const srSummary = trade.srType
    ? `${trade.srType}${trade.srTouchCount ? `, ${trade.srTouchCount} touch` : ''}${trade.srFailureCount ? `, ${trade.srFailureCount} failure` : ''}`
    : undefined;

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h3>
            Trade #{trade.id} — {trade.instrument} — <span className={trade.side === 'buy' ? 'side-buy' : 'side-sell'}>{trade.side}</span>
          </h3>
          <div className="review-modal-nav">
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              title="Previous (Left arrow)"
            >
              &larr; Prev
            </button>
            <span className="review-modal-counter">{currentIndex + 1} / {trades.length}</span>
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={currentIndex === trades.length - 1}
              title="Next (Right arrow)"
            >
              Next &rarr;
            </button>
            <button className="review-close-btn" onClick={onClose} title="Close (Esc)">Close</button>
          </div>
        </div>

        <div className="review-modal-body">
          <div className="review-image-section">
            {trade.imagePath ? (
              <img
                className="review-image"
                src={getTradeImageUrl(trade.id)}
                alt={`Trade ${trade.id} screenshot`}
              />
            ) : (
              <div className="review-image-placeholder">No screenshot uploaded</div>
            )}
          </div>

          <div className="review-stats-row">
            <div className="review-stat">
              <span className="review-stat-label">Date</span>
              <span className="review-stat-value">{formatDate(trade.dateStart)}</span>
            </div>
            <div className="review-stat">
              <span className="review-stat-label">Entry</span>
              <span className="review-stat-value">{trade.entryPrice}</span>
            </div>
            <div className="review-stat">
              <span className="review-stat-label">PnL</span>
              <span className={`review-stat-value ${pnlClass}`}>
                {trade.realizedPnl !== undefined ? trade.realizedPnl.toFixed(2) : '-'}
              </span>
            </div>
            <div className="review-stat">
              <span className="review-stat-label">Avg RR</span>
              <span className="review-stat-value">
                {trade.avgRiskReward !== undefined ? trade.avgRiskReward.toFixed(2) : '-'}
              </span>
            </div>
          </div>

          <div className="review-badge-group">
            <Badge label="Session" value={trade.sessionWindow} />
            <Badge label="Signature" value={trade.signature} />
            <Badge label="IB Type" value={trade.ibType} />
            <Badge label="VWAP" value={trade.vwapSide} />
            <Badge label="MS Direction" value={trade.msDirection} />
            <Badge label="Grade" value={trade.setupGrade} />
            <Badge label="S/R" value={srSummary} />
            <Badge label="SL Placement" value={trade.slPlacement} />
          </div>

          {(trade.srZoneLow || trade.srZoneHigh || trade.classicLevel) && (
            <div className="review-badge-group">
              <Badge label="S/R Zone Low" value={trade.srZoneLow} />
              <Badge label="S/R Zone High" value={trade.srZoneHigh} />
              <Badge label="Classic Level" value={trade.classicLevel} />
            </div>
          )}

          {(trade.targetClassicLevelR !== undefined || trade.targetFurtherSrR !== undefined || trade.targetIbHighLowR !== undefined) && (
            <>
              <div className="review-section-label">Target R</div>
              <div className="review-badge-group">
                <Badge label="Classic Level" value={trade.targetClassicLevelR} />
                <Badge label="Further S/R" value={trade.targetFurtherSrR} />
                <Badge label="IB High/Low" value={trade.targetIbHighLowR} />
              </div>
            </>
          )}

          {(trade.mgmtNoMoveR !== undefined || trade.mgmtExtendedTargetR !== undefined || trade.mgmtPartialBookTrailR !== undefined) && (
            <>
              <div className="review-section-label">Management R</div>
              <div className="review-badge-group">
                <Badge label="No Move" value={trade.mgmtNoMoveR} />
                <Badge label="Extended Target" value={trade.mgmtExtendedTargetR} />
                <Badge label="Partial Book + Trail" value={trade.mgmtPartialBookTrailR} />
              </div>
            </>
          )}

          {trade.regime && (
            <div className="review-badge-group">
              <Badge label="Regime" value={trade.regime} />
            </div>
          )}

          {trade.notes && (
            <div className="review-notes-section">
              <div className="review-section-label">Notes</div>
              <p className="review-notes-text">{trade.notes}</p>
            </div>
          )}
        </div>

        <div className="review-modal-footer">
          <button onClick={() => onEdit(trade)}>Edit This Trade</button>
        </div>
      </div>
    </div>
  );
}

export default TradeReviewModal;
