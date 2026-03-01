import { ExternalLink, Download } from 'lucide-react'
import type { AppEntry } from '../store/appsSlice'
import './AppActions.css'

interface AppActionsProps {
  app: AppEntry
}

function AppActions({ app }: AppActionsProps) {
  const isCompleted = app.status === 'finished'

  return (
    <div className="app-actions" data-testid="app-actions">
      {isCompleted && app.deployment_url ? (
        <a
          className="app-actions__btn app-actions__btn--primary"
          href={app.deployment_url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="app-actions-open"
        >
          <ExternalLink size={18} />
          Open Live App
        </a>
      ) : (
        <button
          className="app-actions__btn app-actions__btn--primary app-actions__btn--disabled"
          disabled
          data-testid="app-actions-open"
        >
          <ExternalLink size={18} />
          Open Live App
        </button>
      )}
      {isCompleted && app.source_url ? (
        <a
          className="app-actions__btn app-actions__btn--secondary"
          href={app.source_url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="app-actions-source"
        >
          <Download size={18} />
          Download Source Code
        </a>
      ) : (
        <button
          className="app-actions__btn app-actions__btn--secondary app-actions__btn--disabled"
          disabled
          data-testid="app-actions-source"
        >
          <Download size={18} />
          Download Source Code
        </button>
      )}
    </div>
  )
}

export default AppActions
