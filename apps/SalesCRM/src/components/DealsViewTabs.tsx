import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setDealsViewMode } from '@/store/dealsSlice'

export default function DealsViewTabs() {
  const dispatch = useAppDispatch()
  const viewMode = useAppSelector(s => s.deals.viewMode)

  return (
    <div className="deals-view-tabs" data-testid="deals-view-tabs">
      <button
        className={`deals-view-tab${viewMode === 'table' ? ' active' : ''}`}
        onClick={() => dispatch(setDealsViewMode('table'))}
        data-testid="deals-view-tab-table"
      >
        Table View
      </button>
      <button
        className={`deals-view-tab${viewMode === 'pipeline' ? ' active' : ''}`}
        onClick={() => dispatch(setDealsViewMode('pipeline'))}
        data-testid="deals-view-tab-pipeline"
      >
        Pipeline View
      </button>
    </div>
  )
}
