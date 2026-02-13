import { useState, useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchClients, createClient, deleteClient, setPage } from '../store/clientsSlice'
import { ClientsPageHeader } from '../components/clients/ClientsPageHeader'
import { ClientsSearchBar } from '../components/clients/ClientsSearchBar'
import { ClientsFilterControls } from '../components/clients/ClientsFilterControls'
import { ClientsTable } from '../components/clients/ClientsTable'
import { ClientsPagination } from '../components/clients/ClientsPagination'
import { AddClientModal } from '../components/clients/AddClientModal'
import { ConfirmDialog } from '../components/shared/ConfirmDialog'
import type { ClientType, ClientStatus } from '../types'

export function ClientsListPage() {
  const dispatch = useAppDispatch()
  const { items, total, page, pageSize, loading, availableTags, availableSources } = useAppSelector(
    (state) => state.clients
  )

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [sort, setSort] = useState('updated_at')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const loadClients = useCallback(() => {
    dispatch(
      fetchClients({
        page,
        search: search || undefined,
        status: statusFilter || undefined,
        tag: tagFilter || undefined,
        source: sourceFilter || undefined,
        sort,
      })
    )
  }, [dispatch, page, search, statusFilter, tagFilter, sourceFilter, sort])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  // Debounce search input
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      dispatch(setPage(1))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, dispatch])

  function handleAddClient(data: {
    name: string
    type: ClientType
    status: ClientStatus
    tags: string[]
    source_type: string
    source_detail: string
    campaign: string
    channel: string
  }) {
    dispatch(createClient(data)).then(() => {
      setAddModalOpen(false)
      loadClients()
    })
  }

  function handleDeleteClient() {
    if (!deleteConfirm) return
    dispatch(deleteClient(deleteConfirm)).then(() => {
      setDeleteConfirm(null)
    })
  }

  function handlePageChange(newPage: number) {
    dispatch(setPage(newPage))
  }

  function handleExport() {
    const headers = ['Name', 'Type', 'Status', 'Tags', 'Primary Contact', 'Open Deals']
    const rows = items.map((c) => [
      c.name,
      c.type,
      c.status,
      c.tags.join('; '),
      c.primary_contact_name ?? '',
      String(c.open_deals_count ?? 0),
    ])
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const csvUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = csvUrl
    a.download = 'clients-export.csv'
    a.click()
    URL.revokeObjectURL(csvUrl)
  }

  return (
    <div className="p-6">
      <ClientsPageHeader
        onAddClient={() => setAddModalOpen(true)}
        onImport={() => setImportDialogOpen(true)}
        onExport={handleExport}
      />

      {/* Search + Filters row */}
      <div className="flex items-center gap-3 mb-4">
        <ClientsSearchBar value={searchInput} onChange={setSearchInput} />
        <ClientsFilterControls
          status={statusFilter}
          tag={tagFilter}
          source={sourceFilter}
          sort={sort}
          availableTags={availableTags}
          availableSources={availableSources}
          onStatusChange={(v) => { setStatusFilter(v); dispatch(setPage(1)) }}
          onTagChange={(v) => { setTagFilter(v); dispatch(setPage(1)) }}
          onSourceChange={(v) => { setSourceFilter(v); dispatch(setPage(1)) }}
          onSortChange={setSort}
        />
      </div>

      {/* Table */}
      <div className="border border-border rounded-[6px] bg-surface">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-[13px] text-text-muted">
            Loading clients...
          </div>
        ) : (
          <ClientsTable clients={items} onDeleteClient={(id) => setDeleteConfirm(id)} />
        )}
        <ClientsPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddClient}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteClient}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Import Dialog */}
      {importDialogOpen && (
        <ImportDialog onClose={() => setImportDialogOpen(false)} />
      )}
    </div>
  )
}

function ImportDialog({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)

  function handleImport() {
    if (!file) return
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div data-testid="import-dialog" className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[420px]">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Import Clients</h2>
        </div>
        <div className="px-5 py-4">
          <p className="text-[13px] text-text-muted mb-3">Upload a CSV file to import client data.</p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-[13px] text-text-secondary"
          />
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
          <button
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  )
}
