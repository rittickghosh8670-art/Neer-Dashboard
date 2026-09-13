import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TradeTable from '../components/TradeTable';
import TradeEnrichmentForm from '../components/TradeEnrichmentForm';
import TradeFilters from '../components/TradeFilters';
import type { FilterState } from '../components/TradeFilters';
import { listTrades } from '../api/trades';
import type { Trade } from '../types/trade';

function BacktestJournal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTrades({ isLive: false, ...filters });
      setTrades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const handleTradeUpdated = (updated: Trade) => {
    setTrades((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTrade(updated);
  };

  return (
    <div className="backtest-journal">
      <div className="journal-header">
        <h2>Backtest Journal</h2>
        <Link to="/import" className="import-link-btn">Import CSV</Link>
      </div>

      <TradeFilters filters={filters} onChange={setFilters} />

      {loading && <p>Loading trades...</p>}
      {error && <p className="error-text">{error}</p>}

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

export default BacktestJournal;
