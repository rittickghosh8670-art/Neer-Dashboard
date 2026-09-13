import type { Trade } from '../types/trade';

interface Props {
  trades: Trade[];
  onSelect: (trade: Trade) => void;
  selectedId?: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function pnlClass(pnl?: number): string {
  if (pnl === undefined || pnl === null) return '';
  return pnl > 0 ? 'pnl-positive' : pnl < 0 ? 'pnl-negative' : '';
}

function TradeTable({ trades, onSelect, selectedId }: Props) {
  if (trades.length === 0) {
    return <p className="empty-state">No trades found. Import a CSV or adjust filters.</p>;
  }

  return (
    <div className="trade-table-wrapper">
      <table className="trade-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Instrument</th>
            <th>Side</th>
            <th>Entry</th>
            <th>PnL</th>
            <th>RR</th>
            <th>Session</th>
            <th>Signature</th>
            <th>Grade</th>
            <th>Regime</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t, index) => (
            <tr
              key={t.id}
              className={t.id === selectedId ? 'row-selected' : ''}
              onClick={() => onSelect(t)}
            >
              <td className="row-index">{index + 1}</td>
              <td>{formatDate(t.dateStart)}</td>
              <td>{t.instrument}</td>
              <td className={t.side === 'buy' ? 'side-buy' : 'side-sell'}>{t.side}</td>
              <td>{t.entryPrice}</td>
              <td className={pnlClass(t.realizedPnl)}>
                {t.realizedPnl !== undefined ? t.realizedPnl.toFixed(2) : '-'}
              </td>
              <td>{t.avgRiskReward !== undefined ? t.avgRiskReward.toFixed(2) : '-'}</td>
              <td>{t.sessionWindow ?? '-'}</td>
              <td>{t.signature ?? '-'}</td>
              <td>{t.setupGrade ?? '-'}</td>
              <td>{t.regime ?? '-'}</td>
              <td>
                <button onClick={(e) => { e.stopPropagation(); onSelect(t); }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TradeTable;
