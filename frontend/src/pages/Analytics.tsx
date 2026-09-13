import { useEffect, useState } from 'react';
import MetricsCard from '../components/MetricsCard';
import EquityCurve from '../components/EquityCurve';
import PnLCalendar from '../components/PnLCalendar';
import BreakdownTable from '../components/BreakdownTable';
import TradeFilters from '../components/TradeFilters';
import type { FilterState } from '../components/TradeFilters';
import { getMetrics } from '../api/metrics';
import type { Metrics } from '../types/metrics';

function Analytics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getMetrics(false, filters)
      .then(setMetrics)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load metrics.'))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Analytics — Backtest</h2>
      </div>

      <TradeFilters filters={filters} onChange={setFilters} />

      {loading && <p>Loading metrics...</p>}
      {error && <p className="error-text">{error}</p>}

      {metrics && (
        <>
          <div className="metrics-grid">
            <MetricsCard label="Total Trades" value={String(metrics.totalTrades)} />
            <MetricsCard
              label="Win Rate"
              value={`${metrics.winRate.toFixed(1)}%`}
              positive={metrics.winRate >= 50}
              negative={metrics.winRate < 50}
            />
            <MetricsCard
              label="Profit Factor"
              value={metrics.profitFactor.toFixed(2)}
              positive={metrics.profitFactor >= 1.5}
              negative={metrics.profitFactor < 1}
            />
            <MetricsCard
              label="Expectancy"
              value={metrics.expectancy.toFixed(2)}
              positive={metrics.expectancy > 0}
              negative={metrics.expectancy < 0}
            />
            <MetricsCard
              label="Sharpe Ratio"
              value={metrics.sharpeRatio.toFixed(2)}
              positive={metrics.sharpeRatio > 1}
              negative={metrics.sharpeRatio < 0}
            />
            <MetricsCard
              label="Max Drawdown"
              value={`${metrics.maxDrawdown.toFixed(2)} (${metrics.maxDrawdownPct.toFixed(1)}%)`}
              negative
            />
            <MetricsCard label="Avg RR" value={metrics.avgRiskReward.toFixed(2)} />
            <MetricsCard
              label="Total PnL"
              value={metrics.totalPnl.toFixed(2)}
              positive={metrics.totalPnl >= 0}
              negative={metrics.totalPnl < 0}
            />
            <MetricsCard label="Avg Win" value={metrics.avgWin.toFixed(2)} positive />
            <MetricsCard label="Avg Loss" value={metrics.avgLoss.toFixed(2)} negative />
            <MetricsCard label="Largest Win" value={metrics.largestWin.toFixed(2)} positive />
            <MetricsCard label="Largest Loss" value={metrics.largestLoss.toFixed(2)} negative />
          </div>

          <div className="analytics-section">
            <h3>Equity Curve</h3>
            <EquityCurve data={metrics.equityCurve} />
          </div>

          <div className="analytics-section">
            <h3>PnL Calendar</h3>
            <PnLCalendar pnlByDay={metrics.pnlByDay} />
          </div>

          <div className="analytics-section breakdown-section">
            <BreakdownTable title="By Session Window" breakdown={metrics.breakdownBySessionWindow} />
            <BreakdownTable title="By Signature" breakdown={metrics.breakdownBySignature} />
            <BreakdownTable title="By Regime" breakdown={metrics.breakdownByRegime} />
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
