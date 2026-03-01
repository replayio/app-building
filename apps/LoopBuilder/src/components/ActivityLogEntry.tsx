import { useState } from 'react'
import { CheckCircle, Info, Settings, ChevronDown, ChevronRight } from 'lucide-react'
import type { ActivityEntry } from '../store/activitySlice'
import './ActivityLogEntry.css'

interface ActivityLogEntryProps {
  entry: ActivityEntry
}

const typeConfig: Record<string, { icon: typeof CheckCircle; colorClass: string }> = {
  DEPLOY: { icon: CheckCircle, colorClass: 'deploy' },
  TEST: { icon: Info, colorClass: 'test' },
  REASONING: { icon: Settings, colorClass: 'reasoning' },
  PLAN: { icon: Info, colorClass: 'plan' },
  INIT: { icon: Settings, colorClass: 'init' },
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

const URL_REGEX = /(https?:\/\/[^\s),]+)/g

function renderMessageWithLinks(message: string) {
  const parts = message.split(URL_REGEX)
  if (parts.length === 1) return message
  return parts.map((part, i) =>
    URL_REGEX.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="activity-entry__link"
      >
        {part}
      </a>
    ) : (
      part
    )
  )
}

function ActivityLogEntry({ entry }: ActivityLogEntryProps) {
  const [expanded, setExpanded] = useState(false)
  const config = typeConfig[entry.log_type.toUpperCase()] || typeConfig.INIT
  const Icon = config.icon
  const colorClass = config.colorClass

  return (
    <div
      className={`activity-entry activity-entry--${colorClass}`}
      data-testid="activity-log-entry"
    >
      <div className="activity-entry__row">
        <Icon className="activity-entry__icon" size={20} />
        <span className="activity-entry__timestamp" data-testid="activity-entry-timestamp">
          {formatTimestamp(entry.timestamp)}
        </span>
        <span className="activity-entry__separator">|</span>
        <span
          className={`activity-entry__type activity-entry__type--${colorClass}`}
          data-testid="activity-entry-type"
        >
          [{entry.log_type.toUpperCase()}]
        </span>
        <span className="activity-entry__separator">|</span>
        <span className="activity-entry__message" data-testid="activity-entry-message">
          {renderMessageWithLinks(entry.message)}
        </span>
      </div>
      {entry.expandable && entry.detail && (
        <div className="activity-entry__expandable">
          <button
            className="activity-entry__toggle"
            onClick={() => setExpanded(!expanded)}
            data-testid="activity-entry-toggle"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {expanded ? 'Hide Detail' : 'View Detail'}
          </button>
          {expanded && (
            <pre className="activity-entry__detail" data-testid="activity-entry-detail">
              <code>{entry.detail}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

export default ActivityLogEntry
