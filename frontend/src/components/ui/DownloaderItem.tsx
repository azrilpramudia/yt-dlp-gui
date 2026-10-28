import type { QueueItem } from '../../types';
import { formatBytes, formatETA, formatSpeed } from '../../utils/formatters';
import { Icon } from './Icon';
import { ProgressBar } from './ProgressBar';

type DownloaderItemProps = {
  item: QueueItem;
  onCancel: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
};

const phaseLabels: Record<QueueItem['progress']['phase'], string> = {
  queued: 'Ready to Download',
  downloading: 'Downloading',
  processing: 'Processing Media',
  paused: 'Download Paused',
  finished: 'Download Complete',
  failed: 'Download Failed',
  cancelled: 'Download Cancelled',
};

const statusLabels: Record<QueueItem['progress']['phase'], string> = {
  queued: 'Queued', downloading: 'Downloading', processing: 'Processing', paused: 'Paused',
  finished: 'Complete', failed: 'Failed', cancelled: 'Cancelled',
};

export function DownloaderItem({ item, onCancel, onPause, onResume }: DownloaderItemProps) {
  const { progress } = item;
  const active = progress.phase === 'downloading' || progress.phase === 'processing';
  const canCancel = progress.phase === 'queued' || active || progress.phase === 'paused';
  const complete = progress.phase === 'finished';
  const details = progress.phase === 'queued'
    ? 'Waiting in queue'
    : progress.phase === 'processing'
      ? 'Merging and preparing file'
      : progress.phase === 'finished'
        ? 'File is ready in the output folder'
        : `${formatSpeed(progress.speed)}  •  ${formatETA(progress.eta)} remaining`;

  return (
    <article className="download-card bg-surface border-divider">
      <div className="download-card-top">
        <div className={`media-icon${complete ? ' is-complete' : ''}`}><Icon name={complete ? 'check' : 'video'} size={17} /></div>
        <div className="download-copy">
          <h3>{phaseLabels[progress.phase]}</h3>
          <p className="download-url" title={item.url}>{item.url}</p>
          <p className="download-meta">
            {progress.stageCount > 0 && progress.phase === 'downloading' ? `Stage ${progress.stage}/${progress.stageCount}  •  ` : ''}
            {details}
            {(progress.totalBytes > 0 || progress.downloadedBytes > 0) && <span>  •  {formatBytes(progress.downloadedBytes)} / {formatBytes(progress.totalBytes)}</span>}
          </p>
        </div>
        <span className={`status-pill status-${progress.phase}`}>{statusLabels[progress.phase]}</span>
      </div>

      <ProgressBar percent={progress.percent} indeterminate={progress.indeterminate && progress.phase === 'downloading'} label={`Progress for ${item.url}`} />
      <div className="progress-caption"><span>{progress.indeterminate ? '—' : `${progress.percent.toFixed(0)}%`}</span><span>{formatBytes(progress.downloadedBytes)} / {formatBytes(progress.totalBytes)}</span></div>

      {item.error && <p className="download-error">{item.error}</p>}
      {(canCancel || progress.phase === 'paused') && (
        <div className="download-actions">
          {progress.phase === 'paused' ? (
            <button type="button" onClick={() => onResume(item.id)}><Icon name="play" size={14} /> Resume</button>
          ) : active ? (
            <button type="button" onClick={() => onPause(item.id)}><Icon name="pause" size={14} /> Pause</button>
          ) : null}
          {canCancel && <button type="button" className="cancel-action" onClick={() => onCancel(item.id)}>Cancel</button>}
        </div>
      )}
    </article>
  );
}
