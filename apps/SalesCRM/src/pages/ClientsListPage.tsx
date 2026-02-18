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
        <ImportDialog onClose={() => setImportDialogOpen(false)} onImported={loadClients} />
      )}
    </div>
  )
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (values[i] ?? '').trim() })
    return row
  })
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

const CSV_COLUMNS = [
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

const HEADER_MAP: Record<string, string> = {
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

function ImportDialog({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null)

  function handleDownloadTemplate() {
    const headers = CSV_COLUMNS.map(c => c.name).join(',')
    const example = 'Acme Corp,organization,active,"Enterprise; SaaS",Referral,John Smith,Q1 Campaign,Direct Sales,2024-01-15'
    const csv = headers + '\n' + example
    const blob = new Blob([csv], { type: 'text/csv' })
    const csvUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = csvUrl
    a.download = 'clients-import-template.csv'
    a.click()
    URL.revokeObjectURL(csvUrl)
  }

  async function handleImport() {
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (rows.length === 0) {
        setResult({ imported: 0, errors: ['CSV file is empty or has no data rows.'] })
        setImporting(false)
        return
      }
      const clients = rows.map(row => {
        const mapped: Record<string, string> = {}
        for (const [key, value] of Object.entries(row)) {
          const field = HEADER_MAP[key.toLowerCase()]
          if (field) mapped[field] = value
        }
        return mapped
      })
      const res = await fetch('/.netlify/functions/clients?action=import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients }),
      })
      const data = await res.json() as { imported: number; errors: string[] }
      setResult(data)
      if (data.imported > 0) onImported()
    } catch {
      setResult({ imported: 0, errors: ['Failed to read or process the CSV file.'] })
    }
    setImporting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div data-testid="import-dialog" className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[520px] max-h-[80vh] flex flex-col">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Import Clients</h2>
        </div>
        <div className="px-5 py-4 overflow-y-auto">
          <p className="text-[13px] text-text-muted mb-3">Upload a CSV file to import client data. The first row must be column headers.</p>

          <div data-testid="csv-format-info" className="mb-4 border border-border rounded-[5px]">
            <div className="px-3 py-2 bg-hover border-b border-border">
              <span className="text-[12px] font-semibold text-text-secondary">CSV Column Format</span>
            </div>
            <div className="px-3 py-2">
              <table className="w-full text-[12px]">
                <tbody>
                  {CSV_COLUMNS.map(col => (
                    <tr key={col.name} className="border-b border-border last:border-0">
                      <td className="py-1 pr-2 font-medium text-text-primary whitespace-nowrap">
                        {col.name}{col.required && <span className="text-red-500 ml-0.5">*</span>}
                      </td>
                      <td className="py-1 text-text-muted">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            data-testid="download-template-button"
            onClick={handleDownloadTemplate}
            className="mb-3 text-[12px] text-accent hover:underline"
          >
            Download CSV template
          </button>

          <div className="mb-2">
            <input
              data-testid="csv-file-input"
              type="file"
              accept=".csv"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null) }}
              className="text-[13px] text-text-secondary"
            />
          </div>

          {result && (
            <div data-testid="import-result" className="mt-3 p-3 rounded-[5px] border border-border bg-hover">
              <p className="text-[13px] font-medium text-text-primary mb-1">
                {result.imported > 0 ? `Successfully imported ${result.imported} client${result.imported !== 1 ? 's' : ''}.` : 'No clients were imported.'}
              </p>
              {result.errors.length > 0 && (
                <div className="mt-1">
                  <p className="text-[12px] text-red-500 font-medium mb-1">{result.errors.length} error{result.errors.length !== 1 ? 's' : ''}:</p>
                  <ul className="text-[12px] text-red-500 list-disc pl-4 max-h-[100px] overflow-y-auto">
                    {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
          <button
            data-testid="import-cancel-button"
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              data-testid="import-submit-button"
              onClick={handleImport}
              disabled={!file || importing}
              className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
