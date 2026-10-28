import type { ReactNode } from 'react';
import type { EngineStatus } from '../../types';
import { Icon } from '../ui/Icon';

export type AppView = 'downloads' | 'history' | 'updates' | 'settings';
export type AppTheme = 'dark' | 'light';

type AppShellProps = {
  view: AppView;
  title: string;
  theme: AppTheme;
  historyCount: number;
  currentCount: number;
  engineStatus: EngineStatus | null;
  error: string | null;
  concurrency?: number;
  onNavigate: (view: AppView) => void;
  onThemeChange: (theme: AppTheme) => void;
  onConcurrencyChange?: (value: number) => void;
  onClearError: () => void;
  children: ReactNode;
};

export function AppShell({
  view, title, theme, historyCount, currentCount, engineStatus, error, concurrency,
  onNavigate, onThemeChange, onConcurrencyChange, onClearError, children,
}: AppShellProps) {
  return (
    <div className="app-shell bg-base text-primary" data-theme={theme}>
      <div className="app-body">
        <aside className="sidebar bg-base">
          <p className="sidebar-label">NAVIGATION</p>
          <nav className="side-nav" aria-label="Main navigation">
            <NavItem view="downloads" activeView={view} icon="download" label="Downloads" count={currentCount} onNavigate={onNavigate} />
            <NavItem view="history" activeView={view} icon="history" label="History" count={historyCount} onNavigate={onNavigate} />
            <NavItem view="updates" activeView={view} icon="update" label="Updates" onNavigate={onNavigate} />
            <NavItem view="settings" activeView={view} icon="settings" label="Settings" onNavigate={onNavigate} />
          </nav>
          <div className="sidebar-footer">
            <button className="theme-toggle" type="button" onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'dark'}>
              <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={16} />
              <span className="theme-toggle-label">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
            </button>
          </div>
        </aside>

        <main className="main-content">
          <div className="page-title-row">
            <div className="page-title-copy"><h1>{title}</h1></div>
            {view === 'downloads' && concurrency !== undefined && onConcurrencyChange && (
              <label className="concurrency-control">
                <span>Queue</span>
                <select value={concurrency} onChange={(event) => onConcurrencyChange(Number(event.target.value))} aria-label="Queue mode">
                  <option value={1}>Sequential</option><option value={2}>Concurrent · 2</option><option value={3}>Concurrent · 3</option><option value={4}>Concurrent · 4</option>
                </select>
              </label>
            )}
          </div>
          {error && <div className="app-alert" role="alert"><span>{error}</span><button onClick={onClearError} aria-label="Dismiss error message"><Icon name="close" size={15} /></button></div>}
          {children}
        </main>
      </div>
      <EngineStatusbar status={engineStatus} />
    </div>
  );
}

type NavItemProps = {
  view: AppView;
  activeView: AppView;
  icon: 'download' | 'history' | 'update' | 'settings';
  label: string;
  count?: number;
  onNavigate: (view: AppView) => void;
};

function NavItem({ view, activeView, icon, label, count = 0, onNavigate }: NavItemProps) {
  return (
    <button className={`nav-item hover-accent${activeView === view ? ' active' : ''}`} onClick={() => onNavigate(view)}>
      <Icon name={icon} size={16} /><span>{label}</span>
      {count > 0 && <span className="nav-count">{count}</span>}
    </button>
  );
}

function EngineStatusbar({ status }: { status: EngineStatus | null }) {
  return (
    <footer className="engine-statusbar" aria-label="Engine status">
      <span>FFmpeg: {status?.ffmpegVersion || '—'}</span>
      <span className="status-separator">•</span>
      <span>yt-dlp: {status?.ytDlpVersion ? `v${status.ytDlpVersion}` : '—'}</span>
    </footer>
  );
}
