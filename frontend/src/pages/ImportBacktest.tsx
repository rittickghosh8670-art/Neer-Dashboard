import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CSVUploader from '../components/CSVUploader';
import { deleteBacktestSession, listBacktestSessions } from '../api/trades';
import type { BacktestSession } from '../api/trades';
import type { ImportResult } from '../types/trade';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ImportBacktest() {
  const [importSummary, setImportSummary] = useState<ImportResult | null>(null);
  const [sessions, setSessions] = useState<BacktestSession[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSessions = () => {
    listBacktestSessions().then(setSessions).catch(() => setSessions([]));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleImported = (result: ImportResult) => {
    setImportSummary(result);
    fetchSessions();
  };

  const handleDeleteSession = async (session: BacktestSession) => {
    const confirmed = window.confirm(
      `Delete session "${session.name}" and all ${session.tradeCount} trade(s) in it? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(session.id);
    setError(null);
    try {
      await deleteBacktestSession(session.id);
      fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="import-backtest">
      <h2>Import Backtest CSV</h2>
      <p className="page-subtitle">
        Upload an FX Replay CSV export. Raw trade fields are imported automatically;
        session window is auto-classified from trade time. Enrichment (signature, IB
        type, notes, etc.) can be done afterward in the Backtest Journal.
      </p>

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
          <div className="import-summary-actions">
            <button onClick={() => navigate('/')}>Go to Backtest Journal</button>
          </div>
        </div>
      )}

      <div className="sessions-section">
        <h3>Imported Sessions</h3>
        {error && <p className="error-text">{error}</p>}
        {sessions.length === 0 ? (
          <p className="empty-state">No sessions imported yet.</p>
        ) : (
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Instrument</th>
                <th>Imported</th>
                <th>Trades</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.instrument}</td>
                  <td>{formatDate(s.importedAt)}</td>
                  <td>{s.tradeCount}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteSession(s)}
                      disabled={deletingId === s.id}
                    >
                      {deletingId === s.id ? 'Deleting...' : 'Delete Session'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ImportBacktest;
