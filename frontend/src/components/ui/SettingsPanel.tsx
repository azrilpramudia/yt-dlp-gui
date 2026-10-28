import { useEffect, useState } from 'react';
import type { AppSettings } from '../../types';

type SettingsPanelProps = {
  settings: AppSettings;
  onChooseBinary: () => Promise<string>;
  onSave: (settings: AppSettings) => Promise<void>;
};

export function SettingsPanel({ settings, onChooseBinary, onSave }: SettingsPanelProps) {
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

  async function chooseBinary() {
    const path = await onChooseBinary();
    if (path) {
      setDraft((current) => ({ ...current, ytDlpPath: path }));
      setSaved(false);
    }
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await onSave(draft);
      setSaved(true);
    } catch {
      // The app-level alert displays the backend validation or storage error.
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="settings-panel bg-surface border-divider" aria-label="Application settings">
      <h2>Application settings</h2>
      <label className="settings-field">
        <span>File name template</span>
        <input
          className="settings-input"
          value={draft.outputTemplate}
          onChange={(event) => { setDraft({ ...draft, outputTemplate: event.target.value }); setSaved(false); }}
          placeholder="%(title)s.%(ext)s"
          required
        />
        <span className="settings-hint">Examples: %(title)s.%(ext)s or %(uploader)s/%(title)s.%(ext)s</span>
      </label>

      <div className="settings-field">
        <label htmlFor="yt-dlp-path">yt-dlp binary path</label>
        <div className="settings-binary-row">
          <input
            id="yt-dlp-path"
            className="settings-input"
            value={draft.ytDlpPath}
            onChange={(event) => { setDraft({ ...draft, ytDlpPath: event.target.value }); setSaved(false); }}
            placeholder="yt-dlp"
            required
          />
          <button className="secondary-button" type="button" onClick={() => void chooseBinary()}>
            Browse…
          </button>
        </div>
        <p className="settings-hint">Use yt-dlp from PATH, or select an executable file.</p>
      </div>

      <div className="settings-footer">
          <span className="settings-hint">Applies to new downloads.</span>
        <div className="settings-save-row">
          {saved && <span className="saved-label" role="status">Saved</span>}
          <button className="primary-button bg-accent hover-accent" type="button" onClick={() => void save()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </section>
  );
}
