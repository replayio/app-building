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
import { ImportDialog } from '../components/shared/ImportDialog'
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
  const [importContactsDialogOpen, setImportContactsDialogOpen] = useState(false)

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
    <div className="p-3 sm:p-6" data-testid="clients-list-page">
      <ClientsPageHeader
        onAddClient={() => setAddModalOpen(true)}
        onImport={() => setImportDialogOpen(true)}
        onImportContacts={() => setImportContactsDialogOpen(true)}
        onExport={handleExport}
      />

      {/* Search + Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
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
      <div className="border border-border rounded-[6px] bg-surface overflow-x-auto">
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
        <ImportDialog
          entityName="Client"
          entityNamePlural="Clients"
          columns={CLIENT_CSV_COLUMNS}
          headerMap={CLIENT_HEADER_MAP}
          templateFilename="clients-import-template.csv"
          templateExample='Acme Corp,organization,active,"Enterprise; SaaS",Referral,John Smith,Q1 Campaign,Direct Sales,2024-01-15'
          apiEndpoint="/.netlify/functions/clients?action=import"
          apiBodyKey="clients"
          onClose={() => setImportDialogOpen(false)}
          onImported={loadClients}
        />
      )}

      {importContactsDialogOpen && (
        <ImportDialog
          entityName="Contact"
          entityNamePlural="Contacts"
          columns={CONTACT_CSV_COLUMNS}
          headerMap={CONTACT_HEADER_MAP}
          templateFilename="contacts-import-template.csv"
          templateExample="Sarah Johnson,CEO,sarah@acmecorp.com,+1 555-100-0001,New York,Acme Corp"
          apiEndpoint="/.netlify/functions/individuals?action=import"
          apiBodyKey="contacts"
          onClose={() => setImportContactsDialogOpen(false)}
          onImported={loadClients}
        />
      )}
    </div>
  )
}

const CLIENT_CSV_COLUMNS = [
  { name: 'Name', required: true, description: 'Client name' },
  { name: 'Type', required: false, description: '"organization" or "individual" (default: organization)' },
  { name: 'Status', required: false, description: '"active", "inactive", "prospect", or "churned" (default: prospect)' },
  { name: 'Tags', required: false, description: 'Semicolon-separated tags, e.g. "Enterprise; SaaS"' },
  { name: 'Source Type', required: false, description: 'Acquisition source type, e.g. "Referral", "Campaign"' },
  { name: 'Source Detail', required: false, description: 'Source details' },
  { name: 'Campaign', required: false, description: 'Campaign name' },
  { name: 'Channel', required: false, description: 'Acquisition channel' },
  { name: 'Date Acquired', required: false, description: 'Date in YYYY-MM-DD format' },
]

const CLIENT_HEADER_MAP: Record<string, string> = {
  'name': 'name',
  'type': 'type',
  'status': 'status',
  'tags': 'tags',
  'source type': 'source_type',
  'source_type': 'source_type',
  'source detail': 'source_detail',
  'source_detail': 'source_detail',
  'campaign': 'campaign',
  'channel': 'channel',
  'date acquired': 'date_acquired',
  'date_acquired': 'date_acquired',
}

const CONTACT_CSV_COLUMNS = [
  { name: 'Name', required: true, description: 'Contact name' },
  { name: 'Title', required: false, description: 'Job title, e.g. "CEO", "VP Engineering"' },
  { name: 'Email', required: false, description: 'Email address' },
  { name: 'Phone', required: false, description: 'Phone number' },
  { name: 'Location', required: false, description: 'City, state, or address' },
  { name: 'Client Name', required: false, description: 'Name of an existing client to associate with' },
]

const CONTACT_HEADER_MAP: Record<string, string> = {
  'name': 'name',
  'title': 'title',
  'email': 'email',
  'phone': 'phone',
  'location': 'location',
  'client name': 'client_name',
  'client_name': 'client_name',
  'client': 'client_name',
}
