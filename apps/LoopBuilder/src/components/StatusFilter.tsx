import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setActiveFilter, type AppStatus } from '../store/appsSlice'
import './StatusFilter.css'

const tabs: { label: string; value: AppStatus }[] = [
  { label: 'Building', value: 'building' },
  { label: 'Finished', value: 'finished' },
  { label: 'Queued', value: 'queued' },
]

function StatusFilter() {
  const dispatch = useAppDispatch()
  const activeFilter = useAppSelector((state) => state.apps.activeFilter)

  return (
    <div className="status-filter" data-testid="status-filter">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`status-filter__tab${activeFilter === tab.value ? ' status-filter__tab--active' : ''}`}
          data-testid={`status-filter-tab-${tab.value}`}
          onClick={() => dispatch(setActiveFilter(tab.value))}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default StatusFilter
