import { SettingsPanel } from '../ui/SettingsPanel';
import type { AppSettings } from '../../types';

type SettingsPageProps = {
  settings: AppSettings;
  concurrency: number;
  detailsOpen: boolean;
  onChooseBinary: () => Promise<string>;
  onSave: (settings: AppSettings) => Promise<void>;
  onConcurrencyChange: (value: number) => void;
  onToggleDetails: () => void;
};

export function SettingsPage({ settings, concurrency, detailsOpen, onChooseBinary, onSave, onConcurrencyChange, onToggleDetails }: SettingsPageProps) {
  return (
    <div className="settings-page">
      <SettingsPanel settings={settings} onChooseBinary={onChooseBinary} onSave={onSave} />
      <section className="settings-panel queue-preferences bg-surface border-divider">
        <h2>Download queue</h2>
        <p>Maximum number of files to download at the same time.</p>
        <select value={concurrency} onChange={(event) => onConcurrencyChange(Number(event.target.value))}>
          <option value={1}>Sequential — one download</option><option value={2}>Concurrent — two downloads</option><option value={3}>Concurrent — three downloads</option><option value={4}>Concurrent — four downloads</option>
        </select>
      </section>
      <button className="settings-advanced-toggle" onClick={onToggleDetails} aria-expanded={detailsOpen}>
        {detailsOpen ? 'Hide configuration details' : 'Configuration details'}
      </button>
      {detailsOpen && <p className="settings-hint">Theme preferences are saved on this device. Downloader settings are stored in the app’s JSON file.</p>}
    </div>
  );
}
