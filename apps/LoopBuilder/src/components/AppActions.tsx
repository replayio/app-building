import { ExternalLink, Download } from 'lucide-react'
import type { AppEntry } from '../store/appsSlice'
import './AppActions.css'

interface AppActionsProps {
  app: AppEntry
}

function AppActions({ app }: AppActionsProps) {
  return (
    <div className="app-actions" data-testid="app-actions">
      {app.deployment_url && (
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
      )}
      {app.source_url && (
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
      )}
    </div>
  )
}

export default AppActions
