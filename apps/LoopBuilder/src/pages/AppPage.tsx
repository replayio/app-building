import { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchAppById } from '../store/appsSlice'
import { fetchActivity, clearActivity } from '../store/activitySlice'
import AppHeader from '../components/AppHeader'
import AppActions from '../components/AppActions'
import ActivityLog from '../components/ActivityLog'
import './AppPage.css'

const POLL_INTERVAL = 5000

function AppPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const app = useAppSelector((state) => state.apps.items.find((a) => a.id === id))
  const activityEntries = useAppSelector((state) => state.activity.entries)
  const activityLoading = useAppSelector((state) => state.activity.loading)
  const activityError = useAppSelector((state) => state.activity.error)

  useEffect(() => {
    if (id) {
      dispatch(fetchAppById(id))
      dispatch(fetchActivity(id))
    }
    return () => {
      dispatch(clearActivity())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (!id || !app || app.status !== 'building') return

    const interval = setInterval(() => {
      dispatch(fetchAppById(id))
      dispatch(fetchActivity(id))
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [dispatch, id, app?.status])

  const handleRefresh = useCallback(() => {
    if (id) {
      dispatch(fetchAppById(id))
      dispatch(fetchActivity(id))
    }
  }, [dispatch, id])

  if (!app) {
    return (
      <div className="app-page" data-testid="app-page">
        <div className="app-page__loading" data-testid="app-page-loading">
          Loading app...
        </div>
      </div>
    )
  }

  return (
    <div className="app-page" data-testid="app-page">
      <button
        className="app-page__back"
        onClick={() => navigate('/')}
        data-testid="app-page-back"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>
      <AppHeader app={app} />
      <AppActions app={app} />
      <ActivityLog
        entries={activityEntries}
        loading={activityLoading}
        error={activityError}
        appStatus={app.status}
        onRefresh={handleRefresh}
      />
    </div>
  )
}

export default AppPage
