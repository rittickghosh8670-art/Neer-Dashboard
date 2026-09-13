import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CSVUploader from '../components/CSVUploader';
import type { ImportResult } from '../types/trade';

function ImportBacktest() {
  const [importSummary, setImportSummary] = useState<ImportResult | null>(null);
  const navigate = useNavigate();

  const handleImported = (result: ImportResult) => {
    setImportSummary(result);
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
    </div>
  );
}

export default ImportBacktest;
