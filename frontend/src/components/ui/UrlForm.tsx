import { useState, type FormEvent } from 'react';

type UrlFormProps = { disabled: boolean; onSubmit: (url: string) => void };

export function UrlForm({ disabled, onSubmit }: UrlFormProps) {
  const [url, setUrl] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = url.trim();
    if (!value || disabled) return;
    onSubmit(value);
  }

  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
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
      <button
        className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
        disabled={disabled || !url.trim()}
      >
        Mulai unduh
      </button>
    </form>
  );
}
