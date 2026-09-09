import client from './client';

export interface BackupInfo {
  fileName: string;
  sizeBytes: number;
  lastModified: number;
}

export async function createBackup(): Promise<{ fileName: string }> {
  const res = await client.post<{ fileName: string }>('/backup');
  return res.data;
}

export async function listBackups(): Promise<BackupInfo[]> {
  const res = await client.get<BackupInfo[]>('/backup');
  return res.data;
}

export function getBackupDownloadUrl(fileName: string): string {
  return `/api/backup/${encodeURIComponent(fileName)}/download`;
}

export async function restoreBackup(file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  await client.post('/backup/restore', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
