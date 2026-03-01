import { RefreshCw } from 'lucide-react'
import type { AppStatus } from '../store/appsSlice'
import type { ActivityEntry } from '../store/activitySlice'
import ActivityLogEntry from './ActivityLogEntry'
import './ActivityLog.css'

interface ActivityLogProps {
  entries: ActivityEntry[]
  loading: boolean
  error: string | null
  appStatus: AppStatus
  onRefresh: () => void
}

function ActivityLog({ entries, loading, error, appStatus, onRefresh }: ActivityLogProps) {
  const isLive = appStatus === 'building'

  return (
    <div className="activity-log" data-testid="activity-log">
      <div className="activity-log__header">
        <h2 className="activity-log__title">AI Development Activity Log</h2>
        <div className="activity-log__status-row">
          <span className="activity-log__feed-label" data-testid="activity-log-feed-label">
            {isLive && <span className="activity-log__live-dot" data-testid="activity-log-live-dot" />}
            <span
              className={isLive ? 'activity-log__live-text' : 'activity-log__inactive-text'}
              data-testid="activity-log-live"
            >
              Live Feed
            </span>
            <span className="activity-log__label-sep"> - </span>
            <span
              className={!isLive ? 'activity-log__historical-text' : 'activity-log__inactive-text'}
              data-testid="activity-log-historical"
            >
              Historical View
            </span>
          </span>
          <button
            className="activity-log__refresh"
            onClick={onRefresh}
            data-testid="activity-log-refresh"
            title="Refresh activity log"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      <div className="activity-log__entries" data-testid="activity-log-entries">
        {loading ? (
          <div className="activity-log__loading" data-testid="activity-log-loading">
            Loading activity...
          </div>
        ) : error ? (
          <div className="activity-log__error" data-testid="activity-log-error">
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div className="activity-log__empty" data-testid="activity-log-empty">
            {appStatus === 'queued'
              ? 'Development has not started yet. Activity will appear here once building begins.'
              : 'No activity recorded.'}
          </div>
        ) : (
          entries.map((entry) => (
            <ActivityLogEntry key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  )
}

export default ActivityLog
