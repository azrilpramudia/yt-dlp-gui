import type { DownloadProgress } from '../../types';
import { DownloaderItem } from './DownloaderItem';

type DownloadListProps = {
  progress: DownloadProgress | null;
  onCancel: () => void;
};

export function DownloadList({ progress, onCancel }: DownloadListProps) {
  if (!progress) return null;
  return (
    <section className="space-y-3" aria-label="Daftar unduhan">
      <DownloaderItem progress={progress} onCancel={onCancel} />
    </section>
  );
}
