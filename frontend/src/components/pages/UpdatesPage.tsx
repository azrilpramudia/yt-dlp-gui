import { BrowserOpenURL } from '../../../wailsjs/runtime/runtime';
import { Icon } from '../ui/Icon';
import type { UpdateInfo } from '../../types';

type UpdatesPageProps = {
  appVersion: string;
  updateInfo: UpdateInfo | null;
  updateError: string | null;
  checking: boolean;
  onCheck: () => void;
};

export function UpdatesPage({ appVersion, updateInfo, updateError, checking, onCheck }: UpdatesPageProps) {
  return (
    <section className="update-panel bg-surface border-divider">
      <div className="update-panel-heading">
        <span className="update-icon"><Icon name="update" size={19} /></span>
        <div><h2>Application updates</h2><p>Check whether a newer version is available.</p></div>
      </div>
      <div className="version-comparison">
        <div><span>Installed version</span><strong>{appVersion}</strong></div>
        <div><span>Latest version</span><strong>{updateInfo?.latestVersion ?? (checking ? 'Checking…' : '—')}</strong></div>
      </div>
      <UpdateResult info={updateInfo} error={updateError} checking={checking} />
      <div className="update-panel-actions">
        <button className="secondary-button" onClick={onCheck} disabled={checking}>{checking ? 'Checking…' : 'Check again'}</button>
        {updateInfo?.available && <button className="primary-button bg-accent hover-accent" onClick={() => BrowserOpenURL(updateInfo.releaseUrl)}>View release</button>}
      </div>
      <p className="update-footnote">Updates are installed through GitHub release packages.</p>
    </section>
  );
}

function UpdateResult({ info, error, checking }: { info: UpdateInfo | null; error: string | null; checking: boolean }) {
  if (info?.available) return <div className="update-result available" role="status">Version {info.latestVersion} is available to download.</div>;
  if (info) return <div className="update-result" role="status">You’re using the latest version.</div>;
  if (error) return <div className="update-result update-error" role="status">Update check failed. Check your internet connection and try again.</div>;
  return <div className="update-result" role="status">{checking ? 'Connecting to GitHub Releases…' : 'Update check has not run yet.'}</div>;
}
