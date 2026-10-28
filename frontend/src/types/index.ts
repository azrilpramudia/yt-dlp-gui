export type DownloadPhase =
  | 'queued'
  | 'downloading'
  | 'processing'
  | 'paused'
  | 'finished'
  | 'failed'
  | 'cancelled';

export type DownloadProgress = {
  phase: DownloadPhase;
  stage: number;
  stageCount: number;
  downloadedBytes: number;
  totalBytes: number;
  estimated: boolean;
  indeterminate: boolean;
  stagePercent: number;
  percent: number;
  speed: number;
  eta: number;
};

export type DownloadFailure = { message: string };

export type DownloadRequest = {
  url: string;
  format: string;
  audioOnly: boolean;
  audioFormat: string;
};

export type QueueItem = {
  id: string;
  url: string;
  progress: DownloadProgress;
  error?: string;
};

export type ProgressEvent = { id: string; progress: DownloadProgress };
export type QueueFailure = { id: string; message: string };

export type AppSettings = {
  outputDir: string;
  outputTemplate: string;
  ytDlpPath: string;
  maxConcurrent: number;
};

export type UpdateInfo = {
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
  available: boolean;
};

export type EngineStatus = {
  ffmpegConnected: boolean;
  ffmpegVersion: string;
  ytDlpConnected: boolean;
  ytDlpVersion: string;
};
