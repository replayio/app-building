import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchStatus } from '../store/statusSlice'
import ActiveContainers from '../components/ActiveContainers'
import WebhookEventFeed from '../components/WebhookEventFeed'
import DefaultPromptDisplay from '../components/DefaultPromptDisplay'
import './StatusPage.css'

const POLL_INTERVAL = 10000

function StatusPage() {
  const dispatch = useAppDispatch()
  const { containers, webhookEvents, defaultPrompt, loading, error } = useAppSelector(
    (state) => state.status
  )
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    dispatch(fetchStatus())
    intervalRef.current = setInterval(() => {
      dispatch(fetchStatus())
    }, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [dispatch])

  return (
    <div className="status-page" data-testid="status-page">
      <div className="status-page__header">
        <Link to="/" className="status-page__back" data-testid="status-back-link">
          &larr; Back
        </Link>
        <h1 className="status-page__title">System Status</h1>
      </div>
      {loading ? (
        <div
          className="status-page__loading"
          data-testid="status-page-loading"
        >
          Loading status...
        </div>
      ) : error ? (
        <div
          className="status-page__error"
          data-testid="status-page-error"
        >
          {error}
        </div>
      ) : (
        <div className="status-page__content">
          <DefaultPromptDisplay prompt={defaultPrompt} />
          <ActiveContainers containers={containers} />
          <WebhookEventFeed events={webhookEvents} />
        </div>
      )}
    </div>
  )
}

export default StatusPage
