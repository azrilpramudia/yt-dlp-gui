import { useCallback, useEffect, useState } from 'react';
import {
  CancelDownload, PauseDownload, ResumeDownload, SelectDownloadFolder,
  SelectYtDlpBinary, GetSettings, SaveSettings, SetQueueConcurrency, StartDownload,
} from '../../wailsjs/go/app/App';
import { EventsOn } from '../../wailsjs/runtime/runtime';
import type { AppSettings, DownloadFailure, DownloadProgress, DownloadRequest, ProgressEvent, QueueFailure, QueueItem } from '../types';

const emptyProgress = (): DownloadProgress => ({
  phase: 'queued', stage: 0, stageCount: 0, downloadedBytes: 0, totalBytes: 0,
  estimated: false, indeterminate: true, stagePercent: 0, percent: 0, speed: 0, eta: -1,
});

const defaultSettings: AppSettings = {
  outputDir: '', outputTemplate: '%(title)s.%(ext)s', ytDlpPath: 'yt-dlp', maxConcurrent: 1,
};

export function useDownloader() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    void GetSettings().then((saved) => setSettings(saved)).catch((failure) => {
      setError(failure instanceof Error ? failure.message : String(failure));
    });
    const offQueue = EventsOn('download:queue', (next: QueueItem[]) => setItems(next));
    const offProgress = EventsOn('download:progress', (event: ProgressEvent) => {
      setItems((current) => current.map((item) => item.id === event.id ? { ...item, progress: event.progress } : item));
    });
    const offError = EventsOn('download:error', (failure: QueueFailure | DownloadFailure) => {
      const queuedFailure = failure as QueueFailure;
      setError(queuedFailure.message || 'Unduhan gagal');
      if (queuedFailure.id) {
        setItems((current) => current.map((item) => item.id === queuedFailure.id
          ? { ...item, error: queuedFailure.message, progress: { ...item.progress, phase: 'failed' } }
          : item));
      }
    });
    return () => { offQueue(); offProgress(); offError(); };
  }, []);

  const start = useCallback(async (request: DownloadRequest) => {
    setError('');
    const optimistic: QueueItem = {
      id: `pending-${Date.now()}`,
      url: request.url.trim(),
      progress: emptyProgress(),
    };
    try {
      await StartDownload({
        url: request.url.trim(), outputDir: settings.outputDir, outputTemplate: '', format: request.format,
        audioOnly: request.audioOnly, audioFormat: request.audioFormat,
      });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
      setItems((current) => [...current, { ...optimistic, progress: { ...optimistic.progress, phase: 'failed' } }]);
    }
  }, [settings]);

  const cancel = useCallback(async (id: string) => {
    try { await CancelDownload(id); }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
  }, []);

  const pause = useCallback(async (id: string) => {
    try { await PauseDownload(id); }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
  }, []);

  const resume = useCallback(async (id: string) => {
    try { await ResumeDownload(id); }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
  }, []);

  const chooseFolder = useCallback(async () => {
    setError('');
    try {
      const folder = await SelectDownloadFolder();
      if (folder) {
        const updated = { ...settings, outputDir: folder };
        await SaveSettings(updated);
        setSettings(updated);
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  }, [settings]);

  const chooseBinary = useCallback(async () => {
    setError('');
    try { return await SelectYtDlpBinary(); }
    catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
      return '';
    }
  }, []);

  const saveSettings = useCallback(async (updated: AppSettings) => {
    setError('');
    try {
      await SaveSettings(updated);
      setSettings(updated);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
      throw failure;
    }
  }, []);

  const setConcurrency = useCallback(async (count: number) => {
    setError('');
    try {
      await SetQueueConcurrency(count);
      setSettings((current) => ({ ...current, maxConcurrent: count }));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  }, []);

  return {
    items, error, settings, outputDir: settings.outputDir, concurrency: settings.maxConcurrent,
    start, cancel, pause, resume, chooseFolder, chooseBinary, saveSettings, setConcurrency,
  };
}
