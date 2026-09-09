import { useCallback, useEffect, useState } from 'react';
import CSVUploader from '../components/CSVUploader';
import TradeTable from '../components/TradeTable';
import TradeEnrichmentForm from '../components/TradeEnrichmentForm';
import TradeFilters from '../components/TradeFilters';
import type { FilterState } from '../components/TradeFilters';
import { listTrades } from '../api/trades';
import type { ImportResult, Trade } from '../types/trade';

function BacktestJournal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [importSummary, setImportSummary] = useState<ImportResult | null>(null);
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

  const handleImported = (result: ImportResult) => {
    setImportSummary(result);
    fetchTrades();
  };

  const handleTradeUpdated = (updated: Trade) => {
    setTrades((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTrade(updated);
  };

  return (
    <div className="backtest-journal">
      <h2>Backtest Journal</h2>

      <CSVUploader onImported={handleImported} />

      {importSummary && (
        <div className="import-summary">
          Imported {importSummary.importedCount} / {importSummary.totalRows} rows
          {importSummary.skippedCount > 0 && ` (${importSummary.skippedCount} skipped)`}.
          {importSummary.warnings.length > 0 && (
            <ul>
              {importSummary.warnings.slice(0, 10).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}

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
