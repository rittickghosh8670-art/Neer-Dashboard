import { useState } from 'react';
import { importCsv } from '../api/trades';
import { INSTRUMENTS } from '../types/trade';
import type { ImportResult } from '../types/trade';

interface Props {
  onImported: (result: ImportResult) => void;
}

function CSVUploader({ onImported }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [instrument, setInstrument] = useState<string>(INSTRUMENTS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Select a CSV file first.');
      return;
    }
    if (!sessionName.trim()) {
      setError('Session name is required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await importCsv(file, sessionName.trim(), instrument);
      onImported(result);
      setFile(null);
      setSessionName('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="csv-uploader" onSubmit={handleSubmit}>
      <h3>Import FX Replay CSV</h3>

      <div className="form-row">
        <label htmlFor="sessionName">Session Name</label>
        <input
          id="sessionName"
          type="text"
          placeholder="e.g. MNQ Backtest Batch 3"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label htmlFor="instrument">Instrument</label>
        <select id="instrument" value={instrument} onChange={(e) => setInstrument(e.target.value)}>
          {INSTRUMENTS.map((inst) => (
            <option key={inst} value={inst}>
              {inst}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="csvFile">CSV File</label>
        <input
          id="csvFile"
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Importing...' : 'Import'}
      </button>
    </form>
  );
}

export default CSVUploader;
