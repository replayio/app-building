import type { AppEntry } from '../store/appsSlice'
import './AppHeader.css'

interface AppHeaderProps {
  app: AppEntry
}

const statusDisplayMap: Record<string, string> = {
  building: 'Building (In Progress)',
  finished: 'Completed (Successfully Deployed)',
  queued: 'Queued (Waiting to Start)',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function AppHeader({ app }: AppHeaderProps) {
  const statusText = statusDisplayMap[app.status] || app.status
  const meta: string[] = []
  if (app.created_at) meta.push(`Created: ${formatDate(app.created_at)}`)
  if (app.model) meta.push(`Model: ${app.model}`)
  if (app.deployment_url) meta.push(`Deployment: ${new URL(app.deployment_url).hostname}`)

  return (
    <div className="app-header" data-testid="app-header">
      <div className="app-header__title-row">
        <h1 className="app-header__title" data-testid="app-header-title">{app.name}</h1>
        <span
          className={`app-header__status app-header__status--${app.status}`}
          data-testid="app-header-status"
        >
          Status: {statusText}
        </span>
      </div>
      <p className="app-header__description" data-testid="app-header-description">
        {app.description}
      </p>
      {meta.length > 0 && (
        <p className="app-header__meta" data-testid="app-header-meta">
          {meta.join(' | ')}
        </p>
      )}
    </div>
  )
}

export default AppHeader
