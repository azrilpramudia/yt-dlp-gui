import { useState, type FormEvent } from 'react';
import type { DownloadRequest } from '../../types';

type UrlFormProps = {
  disabled: boolean;
  folder: string;
  onPickFolder: () => void;
  onSubmit: (request: DownloadRequest) => void;
};

const qualityFormats = [
  { label: 'Terbaik yang tersedia', value: 'bestvideo+bestaudio/best' },
  { label: 'Maksimum 1080p', value: 'bestvideo[height<=1080]+bestaudio/best[height<=1080]' },
  { label: 'Maksimum 720p', value: 'bestvideo[height<=720]+bestaudio/best[height<=720]' },
  { label: 'Maksimum 480p', value: 'bestvideo[height<=480]+bestaudio/best[height<=480]' },
  { label: 'Maksimum 360p', value: 'bestvideo[height<=360]+bestaudio/best[height<=360]' },
];

export function UrlForm({ disabled, folder, onPickFolder, onSubmit }: UrlFormProps) {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState(qualityFormats[0].value);
  const [audioOnly, setAudioOnly] = useState(false);
  const [audioFormat, setAudioFormat] = useState('mp3');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = url.trim();
    if (!value || disabled) return;
    onSubmit({ url: value, format, audioOnly, audioFormat });
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <label className="sr-only" htmlFor="video-url">URL video</label>
      <input
        id="video-url"
        className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="Tempel URL video di sini"
        autoComplete="url"
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Kualitas video</span>
          <select className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white disabled:opacity-50" value={format} onChange={(event) => setFormat(event.target.value)} disabled={disabled || audioOnly}>
            {qualityFormats.map((quality) => <option key={quality.value} value={quality.value}>{quality.label}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-3 self-end rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-200">
          <input className="h-4 w-4 accent-blue-500" type="checkbox" checked={audioOnly} onChange={(event) => setAudioOnly(event.target.checked)} disabled={disabled} />
          <span>Audio saja</span>
        </label>
        {audioOnly && (
          <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
            <span>Format audio</span>
            <select className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white" value={audioFormat} onChange={(event) => setAudioFormat(event.target.value)} disabled={disabled}>
              <option value="mp3">MP3</option>
              <option value="m4a">M4A</option>
              <option value="opus">Opus</option>
              <option value="wav">WAV</option>
              <option value="flac">FLAC</option>
            </select>
          </label>
        )}
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Folder penyimpanan</p>
          <p className="truncate text-sm text-slate-300">{folder || 'Folder Downloads default'}</p>
        </div>
        <button className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-400 disabled:opacity-50" type="button" onClick={onPickFolder} disabled={disabled}>
          Pilih folder…
        </button>
      </div>
      <button
        className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        type="submit"
        disabled={disabled || !url.trim()}
      >
        Mulai unduh
      </button>
    </form>
  );
}
