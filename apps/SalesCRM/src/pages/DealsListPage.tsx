import { useState, useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchDeals, createDeal, deleteDeal, updateDeal, setDealsPage } from '../store/dealsSlice'
import { DealsPageHeader } from '../components/deals/DealsPageHeader'
import { DealsSummaryCards } from '../components/deals/DealsSummaryCards'
import { DealsViewToggle } from '../components/deals/DealsViewToggle'
import { DealsFilterControls } from '../components/deals/DealsFilterControls'
import { DealsTable } from '../components/deals/DealsTable'
import { DealsPipelineView } from '../components/deals/DealsPipelineView'
import { DealsPagination } from '../components/deals/DealsPagination'
import { CreateDealModal } from '../components/deals/CreateDealModal'
import { ConfirmDialog } from '../components/shared/ConfirmDialog'
import type { DealStage } from '../types'

export function DealsListPage() {
  const dispatch = useAppDispatch()
  const { items, total, page, pageSize, loading, metrics, availableClients } = useAppSelector(
    (state) => state.deals
  )

  const [view, setView] = useState<'table' | 'pipeline'>('table')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState('close_date_desc')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadDeals = useCallback(() => {
    dispatch(
      fetchDeals({
        page,
        search: search || undefined,
        stage: stageFilter || undefined,
        client: clientFilter || undefined,
        status: statusFilter || undefined,
        sort,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
    )
  }, [dispatch, page, search, stageFilter, clientFilter, statusFilter, sort, dateFrom, dateTo])

  useEffect(() => {
    loadDeals()
  }, [loadDeals])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      dispatch(setDealsPage(1))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, dispatch])

  function handleCreateDeal(data: {
    name: string
    client_id: string
    value: number
    stage: DealStage
    owner: string
    expected_close_date: string
  }) {
    dispatch(createDeal(data)).then(() => {
      setCreateModalOpen(false)
      return dispatch(fetchDeals({
        page,
        search: search || undefined,
        stage: stageFilter || undefined,
        client: clientFilter || undefined,
        status: statusFilter || undefined,
        sort,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }))
    })
  }

  function handleDeleteDeal() {
    if (!deleteConfirm) return
    dispatch(deleteDeal(deleteConfirm)).then(() => {
      setDeleteConfirm(null)
      loadDeals()
    })
  }

  function handlePageChange(newPage: number) {
    dispatch(setDealsPage(newPage))
  }

  // Also fetch all clients for the create modal (not just ones with deals)
  const [allClients, setAllClients] = useState<{ id: string; name: string }[]>([])
  useEffect(() => {
    fetch('/.netlify/functions/clients?pageSize=1000')
      .then((res) => res.json())
      .then((data: { clients: { id: string; name: string }[] }) => {
        setAllClients(data.clients.map((c) => ({ id: c.id, name: c.name })))
      })
      .catch(() => {})
  }, [])

  return (
    <div className="p-6">
      <DealsPageHeader
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onCreateDeal={() => setCreateModalOpen(true)}
      />

      <DealsSummaryCards
        totalActive={Number(metrics.total_active)}
        pipelineValue={Number(metrics.pipeline_value)}
        wonCount={Number(metrics.won_count)}
        wonValue={Number(metrics.won_value)}
        lostCount={Number(metrics.lost_count)}
        lostValue={Number(metrics.lost_value)}
      />

      <DealsViewToggle view={view} onViewChange={setView} />

      <DealsFilterControls
        stage={stageFilter}
        client={clientFilter}
        status={statusFilter}
        sort={sort}
        dateFrom={dateFrom}
        dateTo={dateTo}
        availableClients={availableClients}
        onStageChange={(v) => { setStageFilter(v); dispatch(setDealsPage(1)) }}
        onClientChange={(v) => { setClientFilter(v); dispatch(setDealsPage(1)) }}
        onStatusChange={(v) => { setStatusFilter(v); dispatch(setDealsPage(1)) }}
        onSortChange={setSort}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12 text-[13px] text-text-muted">
          Loading deals...
        </div>
      ) : view === 'table' ? (
        <div className="border border-border rounded-[6px] bg-surface">
          <DealsTable
            deals={items}
            sort={sort}
            onSortChange={setSort}
            onDeleteDeal={(id) => setDeleteConfirm(id)}
          />
          <DealsPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        <div className="border border-border rounded-[6px] bg-surface p-4">
          <DealsPipelineView
            deals={items}
            onStageChange={(dealId, newStage) => {
              dispatch(updateDeal({ dealId, data: { stage: newStage } })).then(() => loadDeals())
            }}
          />
        </div>
      )}

      <CreateDealModal
        open={createModalOpen}
        availableClients={allClients}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateDeal}
      />

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Deal"
        message="Are you sure you want to delete this deal? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteDeal}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
