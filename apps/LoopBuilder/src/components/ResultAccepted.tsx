import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

interface ResultAcceptedProps {
  appName: string;
  appId: string;
}

export function ResultAccepted({ appName, appId }: ResultAcceptedProps) {
  return (
    <div className="result-card accepted" data-testid="result-accepted">
      <div className="result-icon">
        <CheckCircle size={48} color="var(--color-success)" />
      </div>
      <h2 className="result-card-title">App Queued for Building!</h2>
      <div className="result-card-body">
        Great news! Your request for &lsquo;{appName}&rsquo; has been accepted and is now
        queued for autonomous building.
      </div>
      <div className="next-steps-box">
        <div className="next-steps-title">Next Steps</div>
        <div className="next-steps-text">
          Your app is being generated. You can monitor its progress on the AppPage.
        </div>
      </div>
      <Link
        to={`/apps/${appId}`}
        className="btn-action primary"
        style={{ display: 'inline-flex', textDecoration: 'none' }}
        data-testid="btn-go-to-app"
      >
        Go to AppPage to Monitor Progress
      </Link>
      <div style={{ marginTop: '12px' }}>
        <Link to="/" className="btn-link" data-testid="btn-view-all-apps">
          View all My Apps
        </Link>
      </div>
    </div>
  );
}
