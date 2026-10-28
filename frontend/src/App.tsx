import { useState } from 'react';
import { BrowserOpenURL } from '../wailsjs/runtime/runtime';
import { DownloadList } from './components/ui/DownloadList';
import { SettingsPanel } from './components/ui/SettingsPanel';
import { UrlForm } from './components/ui/UrlForm';
import { useDownloader } from './hooks/useDownloader';

function App() {
  const { items, error, settings, outputDir, concurrency, appVersion, updateInfo, updateError, checkingUpdates, checkForUpdates, start, cancel, pause, resume, chooseFolder, chooseBinary, saveSettings, setConcurrency, clearError } = useDownloader();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">yt-dlp GUI</p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Unduh video</h1>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-slate-400">Tempel tautan video untuk memulai unduhan.</p>
            <span className="text-xs text-slate-500">Versi {appVersion}</span>
          </div>
        </header>

        {updateInfo?.available && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-800 bg-blue-950/50 px-4 py-3 text-sm text-blue-100" role="status">
            <span>Versi baru {updateInfo.latestVersion} tersedia.</span>
            <button className="font-semibold underline underline-offset-4" onClick={() => BrowserOpenURL(updateInfo.releaseUrl)}>Buka release</button>
          </div>
        )}
        {updateInfo && !updateInfo.available && (
          <p className="text-xs text-slate-500" role="status">Versi terbaru yang dirilis: {updateInfo.latestVersion}.</p>
        )}
        <div className="flex justify-end">
          <button className="text-xs text-slate-400 underline underline-offset-4 hover:text-slate-200 disabled:opacity-50" onClick={() => void checkForUpdates()} disabled={checkingUpdates}>
            {checkingUpdates ? 'Memeriksa pembaruan…' : 'Periksa pembaruan'}
          </button>
        </div>
        {updateError && <p className="text-xs text-slate-500" role="status">Pemeriksaan pembaruan gagal. Periksa koneksi internet dan coba lagi.</p>}

        <div className="flex justify-end">
          <button className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white" onClick={() => setSettingsOpen((open) => !open)} aria-expanded={settingsOpen}>
            {settingsOpen ? 'Tutup pengaturan' : 'Pengaturan'}
          </button>
        </div>

        {settingsOpen && <SettingsPanel settings={settings} onChooseBinary={chooseBinary} onSave={saveSettings} />}

        <UrlForm disabled={false} folder={outputDir} onPickFolder={() => void chooseFolder()} onSubmit={(request) => void start(request)} />

        {error && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-red-900/80 bg-red-950/50 px-4 py-3 text-sm text-red-200" role="alert">
            {error}
            <button className="shrink-0 text-red-300 underline underline-offset-2" onClick={clearError} aria-label="Tutup pesan error">Tutup</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <label className="text-sm text-slate-400" htmlFor="queue-concurrency">Mode antrean</label>
          <select id="queue-concurrency" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200" value={concurrency} onChange={(event) => void setConcurrency(Number(event.target.value))}>
            <option value={1}>Berurutan</option>
            <option value={2}>Paralel · 2 unduhan</option>
            <option value={3}>Paralel · 3 unduhan</option>
            <option value={4}>Paralel · 4 unduhan</option>
          </select>
        </div>

        <DownloadList items={items} onCancel={(id) => void cancel(id)} onPause={(id) => void pause(id)} onResume={(id) => void resume(id)} />
      </div>
    </main>
  );
}

export default App;
