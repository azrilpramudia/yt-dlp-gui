import type { QueueItem } from '../../types';
import { formatBytes, formatETA, formatSpeed } from '../../utils/formatters';
import { ProgressBar } from './ProgressBar';

type DownloaderItemProps = {
  item: QueueItem;
  onCancel: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
};

const phaseLabels: Record<QueueItem['progress']['phase'], string> = {
  queued: 'Menyiapkan unduhan',
  downloading: 'Mengunduh',
  processing: 'Memproses video',
  paused: 'Dijeda',
  finished: 'Selesai',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
};

export function DownloaderItem({ item, onCancel, onPause, onResume }: DownloaderItemProps) {
  const { progress } = item;
  const running = progress.phase === 'queued' || progress.phase === 'downloading' || progress.phase === 'processing';
  const hasBytes = progress.downloadedBytes > 0 || progress.totalBytes > 0;

  return (
    <article className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800/70 p-5 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">{phaseLabels[progress.phase]}</h2>
          <p className="mt-1 max-w-lg truncate text-sm text-slate-400" title={item.url}>{item.url}</p>
          {progress.stageCount > 0 && progress.phase === 'downloading' && (
            <p className="mt-1 text-sm text-slate-400">Tahap {progress.stage} dari {progress.stageCount}</p>
          )}
        </div>
        <span className="shrink-0 text-lg font-semibold tabular-nums text-blue-300">
          {progress.indeterminate && running ? '…' : `${progress.percent.toFixed(1)}%`}
        </span>
      </div>

      <ProgressBar percent={progress.percent} indeterminate={progress.indeterminate && running} />

      {progress.phase === 'downloading' && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
          <span>{formatSpeed(progress.speed)}</span>
          {hasBytes && <span>{formatBytes(progress.downloadedBytes)}{progress.totalBytes > 0 ? ` / ${formatBytes(progress.totalBytes)}` : ''}{progress.estimated ? ' (perkiraan)' : ''}</span>}
          <span>Sisa {formatETA(progress.eta)}</span>
        </div>
      )}

      {item.error && <p className="text-sm text-red-300">{item.error}</p>}

      {(running || progress.phase === 'paused') && (
        <div className="flex justify-end gap-2">
          {progress.phase === 'paused' ? (
            <button className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:border-blue-400 hover:text-blue-300" onClick={() => onResume(item.id)}>Lanjutkan</button>
          ) : progress.phase !== 'queued' && (
            <button className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:border-blue-400 hover:text-blue-300" onClick={() => onPause(item.id)}>Jeda</button>
          )}
          <button className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 transition hover:border-red-400 hover:text-red-300" onClick={() => onCancel(item.id)}>
            Batalkan
          </button>
        </div>
      )}
    </article>
  );
}
