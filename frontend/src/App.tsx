import { DownloadList } from './components/ui/DownloadList';
import { UrlForm } from './components/ui/UrlForm';
import { useDownloader } from './hooks/useDownloader';

function App() {
  const { items, error, outputDir, concurrency, start, cancel, pause, resume, chooseFolder, setConcurrency } = useDownloader();

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">yt-dlp GUI</p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Unduh video</h1>
          <p className="text-slate-400">Tempel tautan video untuk memulai unduhan.</p>
        </header>

        <UrlForm disabled={false} folder={outputDir} onPickFolder={() => void chooseFolder()} onSubmit={(request) => void start(request)} />

        {error && (
          <div className="rounded-xl border border-red-900/80 bg-red-950/50 px-4 py-3 text-sm text-red-200" role="alert">
            {error}
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
