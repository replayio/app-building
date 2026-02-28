import { useAppSelector } from '../store/hooks'
import AppCard from './AppCard'
import './AppCardGrid.css'

function AppCardGrid() {
  const items = useAppSelector((state) => state.apps.items)
  const activeFilter = useAppSelector((state) => state.apps.activeFilter)
  const filtered = items.filter((app) => app.status === activeFilter)

  return (
    <div className="app-card-grid" data-testid="app-card-grid">
      {filtered.length === 0 ? (
        <div className="app-card-grid__empty" data-testid="app-card-grid-empty">
          No apps found for this filter.
        </div>
      ) : (
        filtered.map((app) => <AppCard key={app.id} app={app} />)
      )}
    </div>
  )
}

export default AppCardGrid
