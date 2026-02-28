import { Link } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import './AcceptanceResult.css'

function AcceptanceResult() {
  const { appName, createdAppId } = useAppSelector((state) => state.request)

  return (
    <div className="acceptance-result" data-testid="acceptance-result">
      <div className="acceptance-result__icon">✅</div>

      <h2 className="acceptance-result__title">App Queued for Building!</h2>

      <p className="acceptance-result__message">
        Great news! Your request for &apos;{appName}&apos; has been accepted and is now queued for
        autonomous building.
      </p>

      <div className="acceptance-result__next-steps" data-testid="acceptance-next-steps">
        <div className="acceptance-result__next-steps-title">Next Steps</div>
        <p className="acceptance-result__next-steps-text">
          Your app is being generated. You can monitor its progress on the AppPage.
        </p>
      </div>

      {createdAppId && (
        <Link
          to={`/apps/${createdAppId}`}
          className="acceptance-result__go-btn"
          data-testid="go-to-app-btn"
        >
          Go to AppPage to Monitor Progress
        </Link>
      )}

      <Link to="/" className="acceptance-result__view-all" data-testid="view-all-apps-link">
        View all My Apps
      </Link>
    </div>
  )
}

export default AcceptanceResult
