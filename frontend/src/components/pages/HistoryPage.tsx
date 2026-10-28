import { DownloadList } from '../ui/DownloadList';
import type { QueueItem } from '../../types';

type HistoryPageProps = {
  items: QueueItem[];
  onCancel: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onClear: () => void;
};

export function HistoryPage(props: HistoryPageProps) {
  return <DownloadList {...props} title="DOWNLOAD HISTORY" showClear={props.items.length > 0} />;
}
