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
import { ImportDialog } from '../components/shared/ImportDialog'
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
  const [importDialogOpen, setImportDialogOpen] = useState(false)

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
        onImport={() => setImportDialogOpen(true)}
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

      {importDialogOpen && (
        <ImportDialog
          entityName="Deal"
          entityNamePlural="Deals"
          columns={DEAL_CSV_COLUMNS}
          headerMap={DEAL_HEADER_MAP}
          templateFilename="deals-import-template.csv"
          templateExample="Enterprise License,Acme Corp,50000,proposal,Jane Smith,75,2024-06-15,active"
          apiEndpoint="/.netlify/functions/deals?action=import"
          apiBodyKey="deals"
          onClose={() => setImportDialogOpen(false)}
          onImported={loadDeals}
        />
      )}
    </div>
  )
}

const DEAL_CSV_COLUMNS = [
  { name: 'Name', required: true, description: 'Deal name' },
  { name: 'Client Name', required: true, description: 'Name of an existing client' },
  { name: 'Value', required: false, description: 'Deal value in dollars (default: 0)' },
  { name: 'Stage', required: false, description: '"lead", "qualification", "discovery", "proposal", "negotiation", "closed_won", or "closed_lost" (default: lead)' },
  { name: 'Owner', required: false, description: 'Deal owner name' },
  { name: 'Probability', required: false, description: 'Win probability 0-100 (default: 0)' },
  { name: 'Expected Close Date', required: false, description: 'Date in YYYY-MM-DD format' },
  { name: 'Status', required: false, description: '"active", "on_track", "at_risk", or "stalled" (default: active)' },
]

const DEAL_HEADER_MAP: Record<string, string> = {
  'name': 'name',
  'client name': 'client_name',
  'client_name': 'client_name',
  'client': 'client_name',
  'value': 'value',
  'stage': 'stage',
  'owner': 'owner',
  'probability': 'probability',
  'expected close date': 'expected_close_date',
  'expected_close_date': 'expected_close_date',
  'close date': 'expected_close_date',
  'close_date': 'expected_close_date',
  'status': 'status',
}
