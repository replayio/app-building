import { useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchDeals, setDealsPage } from '@/store/dealsSlice'
import DealsSummaryCards from '@/components/DealsSummaryCards'
import DealsViewTabs from '@/components/DealsViewTabs'
import DealsFilters from '@/components/DealsFilters'
import DealsTable from '@/components/DealsTable'
import CreateDealButton from '@/components/CreateDealButton'

function DealsPagination() {
  const dispatch = useAppDispatch()
  const page = useAppSelector(s => s.deals.page)
  const pageSize = useAppSelector(s => s.deals.pageSize)
  const total = useAppSelector(s => s.deals.total)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (total === 0) return null

  return (
    <div className="pagination" data-testid="deals-pagination">
      <span className="pagination-info" data-testid="deals-pagination-info">
        Page {page} of {totalPages}
      </span>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          disabled={page <= 1}
          onClick={() => dispatch(setDealsPage(page - 1))}
          data-testid="deals-pagination-prev"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>
        <button
          className="pagination-btn"
          disabled={page >= totalPages}
          onClick={() => dispatch(setDealsPage(page + 1))}
          data-testid="deals-pagination-next"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

export default function DealsListPage() {
  const dispatch = useAppDispatch()
  const page = useAppSelector(s => s.deals.page)
  const filters = useAppSelector(s => s.deals.filters)
  const viewMode = useAppSelector(s => s.deals.viewMode)

  useEffect(() => {
    dispatch(fetchDeals())
  }, [dispatch, page, filters.search, filters.stage, filters.client, filters.status, filters.sort, filters.dateFrom, filters.dateTo])

  return (
    <div className="page-content p-6 max-sm:p-3" data-testid="deals-list-page">
      <div className="page-header">
        <h1 className="page-title">Deals</h1>
        <CreateDealButton />
      </div>

      <div className="mb-4">
        <DealsSummaryCards />
      </div>

      <div className="deals-toolbar">
        <DealsViewTabs />
      </div>

      <div className="mb-4">
        <DealsFilters />
      </div>

      {viewMode === 'table' && <DealsTable />}

      {viewMode === 'pipeline' && (
        <div className="deals-pipeline-placeholder" data-testid="deals-pipeline-view">
          <p className="empty-subtitle">Pipeline view coming soon</p>
        </div>
      )}

      <div className="mt-4">
        <DealsPagination />
      </div>
    </div>
  )
}
