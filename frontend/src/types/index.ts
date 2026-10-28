export type DownloadPhase =
  | 'queued'
  | 'downloading'
  | 'processing'
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
