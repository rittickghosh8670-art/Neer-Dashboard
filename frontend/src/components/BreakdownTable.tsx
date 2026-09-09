import type { Metrics } from '../types/metrics';

interface Props {
  title: string;
  breakdown?: Record<string, Metrics>;
}

function BreakdownTable({ title, breakdown }: Props) {
  const entries = breakdown ? Object.entries(breakdown) : [];

  if (entries.length === 0) {
    return (
      <div className="breakdown-table">
        <h4>{title}</h4>
        <p className="empty-state">No data yet.</p>
      </div>
    );
  }

  return (
    <div className="breakdown-table">
      <h4>{title}</h4>
      <table>
        <thead>
          <tr>
            <th>Group</th>
            <th>Trades</th>
            <th>Win Rate</th>
            <th>Profit Factor</th>
            <th>Expectancy</th>
            <th>Total PnL</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, m]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{m.totalTrades}</td>
              <td>{m.winRate.toFixed(1)}%</td>
              <td>{m.profitFactor.toFixed(2)}</td>
              <td>{m.expectancy.toFixed(2)}</td>
              <td className={m.totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>
                {m.totalPnl.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BreakdownTable;
