import type { QueueItem } from '../../types';
import { DownloaderItem } from './DownloaderItem';

type DownloadListProps = {
  items: QueueItem[];
  onCancel: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onClear: () => void;
  title?: string;
  showClear?: boolean;
};

export function DownloadList({ items, onCancel, onPause, onResume, onClear, title = 'ANTREAN & AKTIVITAS UNDUHAN', showClear }: DownloadListProps) {
  const hasCompleted = showClear ?? items.some((item) => ['finished', 'failed', 'cancelled'].includes(item.progress.phase));
  return (
    <section className="queue-section" aria-label={title}>
      <div className="queue-heading">
        <h2>{title}</h2>
        {hasCompleted && <button type="button" onClick={onClear}>Clear completed</button>}
      </div>
      {items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon"><span className="download-mark">↓</span></span>
          <p>{title.startsWith('DOWNLOAD HISTORY') ? 'No previous downloads.' : 'Nothing here yet. Paste a video link to get started.'}</p>
        </div>
      ) : (
        <div className="queue-list">
          {items.map((item) => <DownloaderItem key={item.id} item={item} onCancel={onCancel} onPause={onPause} onResume={onResume} />)}
        </div>
      )}
    </section>
  );
}
