import { useState, type FormEvent } from 'react';
import type { DownloadRequest } from '../../types';
import { Icon } from './Icon';

type UrlFormProps = {
  disabled: boolean;
  folder: string;
  onPickFolder: () => void;
  onSubmit: (request: DownloadRequest) => void;
};

const qualityFormats = [
  { label: 'Full HD (1080p)', value: 'bestvideo[height<=1080]+bestaudio/best[height<=1080]' },
  { label: 'Terbaik yang tersedia', value: 'bestvideo+bestaudio/best' },
  { label: 'HD (720p)', value: 'bestvideo[height<=720]+bestaudio/best[height<=720]' },
  { label: 'SD (480p)', value: 'bestvideo[height<=480]+bestaudio/best[height<=480]' },
  { label: 'Hemat data (360p)', value: 'bestvideo[height<=360]+bestaudio/best[height<=360]' },
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

  async function pasteURL() {
    try {
      const value = await navigator.clipboard.readText();
      if (value) setUrl(value.trim());
    } catch {
      // Clipboard access may be unavailable in some WebView configurations.
    }
  }

  return (
    <form className="download-form" onSubmit={submit}>
      <div className="field-heading">
        <label htmlFor="video-url">Media / Playlist URL</label>
        <span className="text-muted">Supports YouTube, TikTok, Vimeo, Bilibili &amp; 1,000+ sites</span>
      </div>

      <div className="url-row">
        <div className="url-field">
          <Icon name="link" size={17} />
          <input
            id="video-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a video URL here..."
            autoComplete="url"
            required
          />
          <button className="paste-button hover-accent" type="button" onClick={() => void pasteURL()} aria-label="Paste from clipboard">
            <Icon name="paste" size={14} /> <span>Paste</span>
          </button>
        </div>
        <button className="analyze-button bg-accent hover-accent" type="submit" disabled={disabled || !url.trim()}>
          <Icon name="search" size={16} /> Analyze
        </button>
      </div>

      <div className="option-grid">
        <label className="option-card bg-surface border-divider">
          <span className="option-label text-muted">Video Quality</span>
          <select value={format} onChange={(event) => setFormat(event.target.value)} disabled={disabled || audioOnly}>
            {qualityFormats.map((quality) => <option key={quality.value} value={quality.value}>{quality.label}</option>)}
          </select>
        </label>

        <div className="option-card bg-surface border-divider">
          <span className="option-label text-muted">Output Format</span>
          <div className="audio-control">
            <span><Icon name="audio" size={16} /> Extract Audio{audioOnly ? ` (${audioFormat.toUpperCase()})` : ''}</span>
            <button
              className={`toggle-switch${audioOnly ? ' is-on' : ''}`}
              type="button"
              role="switch"
              aria-checked={audioOnly}
              aria-label="Extract audio only"
              onClick={() => setAudioOnly((enabled) => !enabled)}
              disabled={disabled}
            ><span /></button>
          </div>
          {audioOnly && (
            <select className="audio-format-select" value={audioFormat} onChange={(event) => setAudioFormat(event.target.value)} disabled={disabled} aria-label="Format audio">
              <option value="mp3">MP3</option><option value="m4a">M4A</option><option value="opus">Opus</option><option value="wav">WAV</option><option value="flac">FLAC</option>
            </select>
          )}
        </div>

        <div className="option-card bg-surface border-divider">
          <span className="option-label text-muted">Output Folder</span>
          <button className="folder-picker hover-accent" type="button" onClick={onPickFolder} disabled={disabled}>
            <span>{folder || '~/Downloads'}</span>
            <Icon name="folder" size={16} />
          </button>
        </div>
      </div>
    </form>
  );
}
