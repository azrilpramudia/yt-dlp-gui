import { useEffect, useMemo, useState } from 'react';
import { AppShell, type AppTheme, type AppView } from './components/layout/AppShell';
import { DownloadsPage } from './components/pages/DownloadsPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { UpdatesPage } from './components/pages/UpdatesPage';
import { useDownloader } from './hooks/useDownloader';
import type { DownloadPhase } from './types';

const terminalPhases: DownloadPhase[] = ['finished', 'failed', 'cancelled'];

function savedTheme(): AppTheme {
  try {
    return localStorage.getItem('ytdlp-gui-theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function App() {
  const downloader = useDownloader();
  const [view, setView] = useState<AppView>('downloads');
  const [theme, setTheme] = useState<AppTheme>(savedTheme);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('ytdlp-gui-theme', theme); } catch { /* Storage may be disabled in embedded WebViews. */ }
  }, [theme]);

  const historyItems = useMemo(() => downloader.items.filter((item) => terminalPhases.includes(item.progress.phase)), [downloader.items]);
  const currentItems = useMemo(() => downloader.items.filter((item) => !terminalPhases.includes(item.progress.phase)), [downloader.items]);
  const activeCount = downloader.items.filter((item) => ['downloading', 'processing', 'paused'].includes(item.progress.phase)).length;
  const titles: Record<AppView, string> = { downloads: 'Downloads', history: 'History', updates: 'Updates', settings: 'Settings' };

  return (
    <AppShell
      view={view}
      title={titles[view]}
      theme={theme}
      historyCount={historyItems.length}
      currentCount={currentItems.length}
      engineStatus={downloader.engineStatus}
      error={downloader.error}
      concurrency={downloader.concurrency}
      onNavigate={setView}
      onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
      onConcurrencyChange={(value) => void downloader.setConcurrency(value)}
      onClearError={downloader.clearError}
    >
      {view === 'downloads' && <DownloadsPage
        items={currentItems}
        historyCount={historyItems.length}
        activeCount={activeCount}
        outputDir={downloader.outputDir}
        onStart={(request) => void downloader.start(request)}
        onPickFolder={() => void downloader.chooseFolder()}
        onCancel={(id) => void downloader.cancel(id)}
        onPause={(id) => void downloader.pause(id)}
        onResume={(id) => void downloader.resume(id)}
        onClear={() => void downloader.clearCompleted()}
        onShowHistory={() => setView('history')}
      />}
      {view === 'history' && <HistoryPage
        items={historyItems}
        onCancel={(id) => void downloader.cancel(id)}
        onPause={(id) => void downloader.pause(id)}
        onResume={(id) => void downloader.resume(id)}
        onClear={() => void downloader.clearCompleted()}
      />}
      {view === 'updates' && <UpdatesPage
        appVersion={downloader.appVersion}
        updateInfo={downloader.updateInfo}
        updateError={downloader.updateError}
        checking={downloader.checkingUpdates}
        onCheck={() => void downloader.checkForUpdates()}
      />}
      {view === 'settings' && <SettingsPage
        settings={downloader.settings}
        concurrency={downloader.concurrency}
        detailsOpen={settingsOpen}
        onChooseBinary={downloader.chooseBinary}
        onSave={downloader.saveSettings}
        onConcurrencyChange={(value) => void downloader.setConcurrency(value)}
        onToggleDetails={() => setSettingsOpen((open) => !open)}
      />}
    </AppShell>
  );
}

export default App;
