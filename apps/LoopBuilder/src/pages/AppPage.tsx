import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ExternalLink,
  Download,
  RefreshCw,
  Calendar,
  Cpu,
  Globe,
} from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import {
  fetchAppDetail,
  fetchActivityLog,
  clearAppDetail,
} from '../slices/appDetailSlice';
import { LogEntryItem } from '../components/LogEntryItem';

function getStatusText(status: string): string {
  switch (status) {
    case 'building':
      return 'In Progress';
    case 'finished':
      return 'Completed (Successfully Deployed)';
    case 'queued':
      return 'Queued';
    default:
      return status;
  }
}

function formatDate(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AppPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { app, logs, loadingApp, loadingLogs, error } = useSelector(
    (state: RootState) => state.appDetail
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchAppDetail(id));
      dispatch(fetchActivityLog(id));
    }
    return () => {
      dispatch(clearAppDetail());
    };
  }, [dispatch, id]);

  const handleRefresh = () => {
    if (id) {
      dispatch(fetchActivityLog(id));
    }
  };

  if (loadingApp) {
    return (
      <div className="loading-container" data-testid="loading">
        Loading app details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="empty-state" data-testid="error-state">
          <div className="empty-state-title">Error</div>
          <div className="empty-state-subtitle">{error}</div>
          <Link to="/" className="btn-link" style={{ marginTop: '12px' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="empty-state" data-testid="not-found">
          <div className="empty-state-title">App not found</div>
          <Link to="/" className="btn-link" style={{ marginTop: '12px' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="app-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="app-detail-header">
        <div className="app-detail-title-row">
          <h1 className="app-detail-title">{app.title}</h1>
          <span className={`status-badge ${app.status}`} data-testid="status-badge">
            Status: {getStatusText(app.status)}
          </span>
        </div>
        <p className="app-detail-description">{app.description}</p>
        <div className="app-detail-actions">
          {app.liveUrl && (
            <a
              href={app.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-action primary"
              data-testid="btn-open-live-app"
            >
              <ExternalLink size={16} />
              Open Live App
            </a>
          )}
          <button
            className="btn-action secondary"
            data-testid="btn-download-source"
          >
            <Download size={16} />
            Download Source Code
          </button>
        </div>
        <div className="app-detail-meta">
          <span>
            <Calendar size={14} />
            Created: {formatDate(app.createdAt)}
          </span>
          <span>
            <Cpu size={14} />
            Model: {app.model}
          </span>
          {app.deployment && (
            <span>
              <Globe size={14} />
              Deployment: {app.deployment}
            </span>
          )}
        </div>
      </div>

      <div className="activity-log" data-testid="activity-log">
        <div className="activity-log-header">
          <h2 className="activity-log-title">AI Development Activity Log</h2>
          <div className="activity-log-controls">
            {app.status === 'building' && (
              <span className="live-indicator" data-testid="live-indicator">
                <span className="live-dot" />
                Live Feed
              </span>
            )}
            {app.status !== 'building' && (
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Historical View
              </span>
            )}
            <button
              className="btn-refresh"
              onClick={handleRefresh}
              data-testid="btn-refresh-log"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {loadingLogs && (
          <div className="loading-container" data-testid="loading-logs">
            Loading activity log...
          </div>
        )}

        {!loadingLogs && logs.length === 0 && (
          <div className="empty-state" data-testid="empty-log">
            <div className="empty-state-title">No activity yet</div>
            <div className="empty-state-subtitle">
              Development has not yet started for this app.
            </div>
          </div>
        )}

        {!loadingLogs &&
          logs.map((entry) => (
            <LogEntryItem key={entry.id} entry={entry} />
          ))}
      </div>
    </div>
  );
}
