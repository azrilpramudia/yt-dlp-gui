import { DownloadList } from './components/ui/DownloadList';
import { UrlForm } from './components/ui/UrlForm';
import { useDownloader } from './hooks/useDownloader';

function App() {
  const { progress, error, active, start, cancel } = useDownloader();

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">yt-dlp GUI</p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Unduh video</h1>
          <p className="text-slate-400">Tempel tautan video untuk memulai unduhan.</p>
        </header>

        <UrlForm disabled={active} onSubmit={(url) => void start(url)} />

        {error && (
          <div className="rounded-xl border border-red-900/80 bg-red-950/50 px-4 py-3 text-sm text-red-200" role="alert">
            {error}
          </div>
        )}

        <DownloadList progress={progress} onCancel={() => void cancel()} />
      </div>
    </main>
  );
}

export default App;
