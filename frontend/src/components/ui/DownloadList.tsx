import type { QueueItem } from '../../types';
import { DownloaderItem } from './DownloaderItem';

type DownloadListProps = {
  items: QueueItem[];
  onCancel: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
};

export function DownloadList({ items, onCancel, onPause, onResume }: DownloadListProps) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-3" aria-label="Daftar unduhan">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Antrean · {items.length}</h2>
      {items.map((item) => <DownloaderItem key={item.id} item={item} onCancel={onCancel} onPause={onPause} onResume={onResume} />)}
    </section>
  );
}
