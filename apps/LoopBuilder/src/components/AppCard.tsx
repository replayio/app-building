import { Link } from 'react-router-dom';
import type { AppInfo } from '../types';

interface AppCardProps {
  app: AppInfo;
}

function getStatusLabel(status: string, progress: number): string {
  switch (status) {
    case 'building':
      return `${progress}% Building`;
    case 'finished':
      return 'Completed';
    case 'queued':
      return 'Queued';
    default:
      return status;
  }
}

export function AppCard({ app }: AppCardProps) {
  return (
    <div className="app-card" data-testid={`app-card-${app.id}`}>
      <div className="app-card-progress">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${app.progress}%` }}
          />
        </div>
        <span className="progress-label">
          {getStatusLabel(app.status, app.progress)}
        </span>
      </div>
      <h3 className="app-card-title">{app.title}</h3>
      <p className="app-card-description">{app.description}</p>
      <div className="app-card-footer">
        <Link
          to={`/apps/${app.id}`}
          className="btn-view-app"
          data-testid={`view-app-${app.id}`}
        >
          View App
        </Link>
        <span className="app-card-path">/apps/{app.id}</span>
      </div>
    </div>
  );
}
