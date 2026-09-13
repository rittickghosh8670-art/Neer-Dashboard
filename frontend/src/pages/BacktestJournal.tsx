import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TradeTable from '../components/TradeTable';
import TradeEnrichmentForm from '../components/TradeEnrichmentForm';
import TradeFilters from '../components/TradeFilters';
import TradeReviewModal from '../components/TradeReviewModal';
import type { FilterState } from '../components/TradeFilters';
import { listTrades } from '../api/trades';
import type { Trade } from '../types/trade';

function BacktestJournal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
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

  const handleTradeDeleted = (tradeId: number) => {
    setTrades((prev) => prev.filter((t) => t.id !== tradeId));
    setSelectedTrade(null);
  };

  const handleEditFromReview = (trade: Trade) => {
    setReviewIndex(null);
    setSelectedTrade(trade);
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
        <TradeTable
          trades={trades}
          onSelect={setSelectedTrade}
          onView={setReviewIndex}
          selectedId={selectedTrade?.id}
        />
      </div>

      {selectedTrade && (
        <div className="enrichment-drawer-backdrop" onClick={() => setSelectedTrade(null)}>
          <div className="enrichment-drawer" onClick={(e) => e.stopPropagation()}>
            <TradeEnrichmentForm
              trade={selectedTrade}
              onUpdated={handleTradeUpdated}
              onClose={() => setSelectedTrade(null)}
              onDeleted={handleTradeDeleted}
            />
          </div>
        </div>
      )}

      {reviewIndex !== null && (
        <TradeReviewModal
          trades={trades}
          currentIndex={reviewIndex}
          onClose={() => setReviewIndex(null)}
          onNavigate={setReviewIndex}
          onEdit={handleEditFromReview}
        />
      )}
    </div>
  );
}

export default BacktestJournal;
