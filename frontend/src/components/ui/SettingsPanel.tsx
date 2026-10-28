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
    <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-5" aria-label="Pengaturan aplikasi">
      <h2 className="font-semibold text-white">Pengaturan</h2>
      <label className="block space-y-2 text-sm text-slate-300">
        <span>Template nama file</span>
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-blue-500"
          value={draft.outputTemplate}
          onChange={(event) => { setDraft({ ...draft, outputTemplate: event.target.value }); setSaved(false); }}
          placeholder="%(title)s.%(ext)s"
          required
        />
        <span className="block text-xs text-slate-500">Contoh: %(title)s.%(ext)s atau %(uploader)s/%(title)s.%(ext)s</span>
      </label>

      <div className="space-y-2">
        <label className="block text-sm text-slate-300" htmlFor="yt-dlp-path">Path binary yt-dlp</label>
        <div className="flex gap-2">
          <input
            id="yt-dlp-path"
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-blue-500"
            value={draft.ytDlpPath}
            onChange={(event) => { setDraft({ ...draft, ytDlpPath: event.target.value }); setSaved(false); }}
            placeholder="yt-dlp"
            required
          />
          <button className="rounded-xl border border-slate-600 px-3 text-sm text-slate-200 hover:border-slate-400" type="button" onClick={() => void chooseBinary()}>
            Pilih file…
          </button>
        </div>
        <p className="text-xs text-slate-500">Gunakan `yt-dlp` untuk mencari lewat PATH, atau pilih file executable langsung.</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">Berlaku untuk unduhan yang dimulai setelah disimpan.</span>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-emerald-400" role="status">Tersimpan</span>}
          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50" type="button" onClick={() => void save()} disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </div>
    </section>
  );
}
