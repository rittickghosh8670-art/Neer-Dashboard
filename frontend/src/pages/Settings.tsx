import { useEffect, useState } from 'react';
import axios from 'axios';
import { createBackup, getBackupDownloadUrl, listBackups, restoreBackup } from '../api/backup';
import type { BackupInfo } from '../api/backup';

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | string | undefined;
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return err.message;
  }
  return err instanceof Error ? err.message : fallback;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString();
}

function Settings() {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBackups = () => {
    listBackups().then(setBackups).catch(() => setBackups([]));
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    setMessage(null);
    try {
      const result = await createBackup();
      setMessage(`Backup created: ${result.fileName}`);
      fetchBackups();
    } catch (err) {
      setError(extractErrorMessage(err, 'Backup failed.'));
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      'Restoring will overwrite existing data with the contents of this backup file. Continue?'
    );
    if (!confirmed) {
      e.target.value = '';
      return;
    }

    setRestoring(true);
    setError(null);
    setMessage(null);
    try {
      await restoreBackup(file);
      setMessage('Database restored successfully. Refresh the app to see restored data.');
    } catch (err) {
      setError(extractErrorMessage(err, 'Restore failed.'));
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="settings-page">
      <h2>Settings — Backup & Restore</h2>
      <p className="page-subtitle">
        Backups are plain SQL dumps of the full database (all trades, sessions, notes).
        Use this to move data between your office and personal laptop.
      </p>

      <div className="settings-section">
        <h3>Create Backup</h3>
        <button onClick={handleCreate} disabled={creating}>
          {creating ? 'Creating...' : 'Create Backup Now'}
        </button>
      </div>

      <div className="settings-section">
        <h3>Restore from Backup</h3>
        <input type="file" accept=".sql" onChange={handleRestore} disabled={restoring} />
        {restoring && <p>Restoring...</p>}
      </div>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="settings-section">
        <h3>Existing Backups</h3>
        {backups.length === 0 ? (
          <p className="empty-state">No backups yet.</p>
        ) : (
          <table className="backup-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Size</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.fileName}>
                  <td>{b.fileName}</td>
                  <td>{formatSize(b.sizeBytes)}</td>
                  <td>{formatDate(b.lastModified)}</td>
                  <td>
                    <a href={getBackupDownloadUrl(b.fileName)} download>
                      Download
                    </a>
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

export default Settings;
