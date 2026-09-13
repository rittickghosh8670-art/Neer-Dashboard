import { useCallback, useEffect, useState } from 'react';
import LiveTradeForm from '../components/LiveTradeForm';
import TradeTable from '../components/TradeTable';
import TradeEnrichmentForm from '../components/TradeEnrichmentForm';
import MetricsCard from '../components/MetricsCard';
import EquityCurve from '../components/EquityCurve';
import PnLCalendar from '../components/PnLCalendar';
import { listLiveTrades } from '../api/liveTrades';
import { getMetrics } from '../api/metrics';
import type { Trade } from '../types/trade';
import type { Metrics } from '../types/metrics';

function LiveTracker() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tradeData, metricsData] = await Promise.all([
        listLiveTrades(),
        getMetrics(true, {}),
      ]);
      setTrades(tradeData);
      setMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load live trades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreated = () => {
    fetchData();
  };

  const handleTradeUpdated = (updated: Trade) => {
    setTrades((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTrade(updated);
    fetchData();
  };

  return (
    <div className="live-tracker">
      <h2>Live Trade Tracker</h2>

      {metrics && (
        <div className="metrics-grid">
          <MetricsCard label="Total Trades" value={String(metrics.totalTrades)} />
          <MetricsCard
            label="Win Rate"
            value={`${metrics.winRate.toFixed(1)}%`}
            positive={metrics.winRate >= 50}
            negative={metrics.winRate < 50}
          />
          <MetricsCard label="Profit Factor" value={metrics.profitFactor.toFixed(2)} />
          <MetricsCard label="Expectancy" value={metrics.expectancy.toFixed(2)} />
          <MetricsCard label="Sharpe Ratio" value={metrics.sharpeRatio.toFixed(2)} />
          <MetricsCard
            label="Max Drawdown"
            value={`${metrics.maxDrawdown.toFixed(2)} (${metrics.maxDrawdownPct.toFixed(1)}%)`}
            negative
          />
          <MetricsCard
            label="Total PnL"
            value={metrics.totalPnl.toFixed(2)}
            positive={metrics.totalPnl >= 0}
            negative={metrics.totalPnl < 0}
          />
        </div>
      )}

      <LiveTradeForm onCreated={handleCreated} />

      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {metrics && metrics.equityCurve.length > 0 && (
        <div className="analytics-section">
          <h3>Equity Curve</h3>
          <EquityCurve data={metrics.equityCurve} />
        </div>
      )}

      {metrics && (
        <div className="analytics-section">
          <h3>PnL Calendar</h3>
          <PnLCalendar pnlByDay={metrics.pnlByDay} />
        </div>
      )}

      <div className="journal-layout">
        <TradeTable trades={trades} onSelect={setSelectedTrade} selectedId={selectedTrade?.id} />

        {selectedTrade && (
          <TradeEnrichmentForm
            trade={selectedTrade}
            onUpdated={handleTradeUpdated}
            onClose={() => setSelectedTrade(null)}
          />
        )}
      </div>
    </div>
  );
}

export default LiveTracker;
