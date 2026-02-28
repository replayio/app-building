import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchApps } from '../store/appsSlice'
import StatusFilter from '../components/StatusFilter'
import RequestAppCTA from '../components/RequestAppCTA'
import AppCardGrid from '../components/AppCardGrid'
import './MainPage.css'

function MainPage() {
  const dispatch = useAppDispatch()
  const loading = useAppSelector((state) => state.apps.loading)
  const error = useAppSelector((state) => state.apps.error)

  useEffect(() => {
    dispatch(fetchApps())
  }, [dispatch])

  return (
    <div className="main-page" data-testid="main-page">
      <StatusFilter />
      <RequestAppCTA />
      {loading ? (
        <div data-testid="main-page-loading" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)' }}>
          Loading apps...
        </div>
      ) : error ? (
        <div data-testid="main-page-error" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-rejected)' }}>
          {error}
        </div>
      ) : (
        <AppCardGrid />
      )}
    </div>
  )
}

export default MainPage
