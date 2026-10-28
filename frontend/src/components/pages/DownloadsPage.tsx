import { DownloadList } from '../ui/DownloadList';
import { UrlForm } from '../ui/UrlForm';
import type { DownloadRequest, QueueItem } from '../../types';

type DownloadsPageProps = {
  items: QueueItem[];
  historyCount: number;
  activeCount: number;
  outputDir: string;
  onStart: (request: DownloadRequest) => void;
  onPickFolder: () => void;
  onCancel: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onClear: () => void;
  onShowHistory: () => void;
};

export function DownloadsPage(props: DownloadsPageProps) {
  const { items, historyCount, activeCount, outputDir, onStart, onPickFolder, onCancel, onPause, onResume, onClear, onShowHistory } = props;
  const title = `DOWNLOAD QUEUE & ACTIVITY${activeCount ? ` · ${activeCount} ACTIVE` : ''}`;

  return (
    <div className="page-stack">
      <UrlForm disabled={false} folder={outputDir} onPickFolder={onPickFolder} onSubmit={onStart} />
      <DownloadList items={items} showClear={historyCount > 0} title={title} onCancel={onCancel} onPause={onPause} onResume={onResume} onClear={onClear} />
      {historyCount > 0 && <button className="history-shortcut" onClick={onShowHistory}>View {historyCount} completed downloads in History</button>}
    </div>
  );
}
