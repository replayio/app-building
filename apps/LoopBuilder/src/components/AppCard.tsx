import { useNavigate } from 'react-router-dom'
import type { AppEntry } from '../store/appsSlice'
import './AppCard.css'

interface AppCardProps {
  app: AppEntry
}

const statusLabels: Record<string, string> = {
  building: 'Building',
  finished: 'Finished',
  queued: 'Queued',
}

function AppCard({ app }: AppCardProps) {
  const navigate = useNavigate()
  const route = `/apps/${app.id}`
  const label = statusLabels[app.status] || app.status

  return (
    <div className="app-card" data-testid="app-card">
      <div className="app-card__progress-row">
        <div className="app-card__progress-track" data-testid="app-card-progress">
          <div
            className={`app-card__progress-fill app-card__progress-fill--${app.status}`}
            style={{ width: `${app.progress}%` }}
          />
        </div>
        <span className="app-card__progress-text" data-testid="app-card-status">
          {app.progress}% {label}
        </span>
      </div>
      <h3 className="app-card__title" data-testid="app-card-title">{app.name}</h3>
      <p className="app-card__description" data-testid="app-card-description">{app.description}</p>
      <div className="app-card__footer">
        <button
          className="app-card__view-btn"
          data-testid="app-card-view-btn"
          onClick={() => navigate(route)}
        >
          View App
        </button>
        <span className="app-card__route" data-testid="app-card-route">{route}</span>
      </div>
    </div>
  )
}

export default AppCard
