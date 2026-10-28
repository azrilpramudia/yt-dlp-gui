import { useCallback, useEffect, useState } from 'react';
import { CancelDownload, StartDownload } from '../../wailsjs/go/app/App';
import { EventsOn } from '../../wailsjs/runtime/runtime';
import type { DownloadFailure, DownloadProgress } from '../types';

const emptyProgress = (): DownloadProgress => ({
  phase: 'queued', stage: 0, stageCount: 0, downloadedBytes: 0, totalBytes: 0,
  estimated: false, indeterminate: true, stagePercent: 0, percent: 0, speed: 0, eta: -1,
});

export function useDownloader() {
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState('');
  const active = progress?.phase === 'queued' || progress?.phase === 'downloading' || progress?.phase === 'processing';

  useEffect(() => {
    const offProgress = EventsOn('download:progress', (next: DownloadProgress) => setProgress(next));
    const offError = EventsOn('download:error', (failure: DownloadFailure) => {
      setError(failure?.message || 'Unduhan gagal');
      setProgress((current) => current ? { ...current, phase: 'failed' } : { ...emptyProgress(), phase: 'failed' });
    });
    return () => { offProgress(); offError(); };
  }, []);

  const start = useCallback(async (url: string) => {
    setError('');
    setProgress(emptyProgress());
    try {
      await StartDownload({ url: url.trim(), outputDir: '', outputTemplate: '', format: '' });
    } catch (failure) {
      setProgress((current) => current ? { ...current, phase: 'failed' } : null);
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  }, []);

  const cancel = useCallback(async () => {
    try {
      await CancelDownload();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  }, []);

  return { progress, error, active, start, cancel, clearError: () => setError('') };
}
