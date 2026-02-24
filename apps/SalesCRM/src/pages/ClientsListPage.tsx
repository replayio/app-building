import { useEffect, useState, useCallback } from 'react'
import { Plus, Download, Upload } from 'lucide-react'
import { useAppDispatch } from '../store/hooks'
import { fetchClients } from '../store/slices/clientsSlice'
import type { Client } from '../store/slices/clientsSlice'
import ClientsFilterBar from '../components/Clients/ClientsFilterBar'
import ClientsListContent from '../components/Clients/ClientsListContent'
import CreateClientModal from '../components/Clients/CreateClientModal'
import ImportDialog from '../components/ImportDialog'

const clientImportColumns = [
  { name: 'Name', required: true, description: 'Client name (text)' },
  { name: 'Type', required: false, description: 'organization or individual' },
  { name: 'Status', required: false, description: 'active, inactive, prospect, or churned' },
  { name: 'Tags', required: false, description: 'Comma-separated tags' },
  { name: 'Source Type', required: false, description: 'How client was acquired' },
  { name: 'Source Detail', required: false, description: 'Additional source info' },
  { name: 'Campaign', required: false, description: 'Marketing campaign name' },
  { name: 'Channel', required: false, description: 'Acquisition channel' },
  { name: 'Date Acquired', required: false, description: 'ISO format or date string' },
]

export default function ClientsListPage() {
  const dispatch = useAppDispatch()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Client | null>(null)

  useEffect(() => {
    dispatch(fetchClients())
  }, [dispatch])

  const handleCreateClient = useCallback(
    async (data: {
      name: string
      type: string
      status: string
      tags: string[]
      source_type: string
      source_detail: string
      campaign: string
      channel: string
      date_acquired: string
    }) => {
      const res = await fetch('/.netlify/functions/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create client')
      }
      dispatch(fetchClients())
    },
    [dispatch],
  )

  const handleUpdateClient = useCallback(
    async (data: {
      name: string
      type: string
      status: string
      tags: string[]
      source_type: string
      source_detail: string
      campaign: string
      channel: string
      date_acquired: string
    }) => {
      if (!editingClient) return
      const res = await fetch(`/.netlify/functions/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update client')
      }
      setEditingClient(null)
      dispatch(fetchClients())
    },
    [dispatch, editingClient],
  )

  const handleDeleteClient = useCallback(
    async () => {
      if (!deleteConfirm) return
      await fetch(`/.netlify/functions/clients/${deleteConfirm.id}`, {
        method: 'DELETE',
      })
      setDeleteConfirm(null)
      dispatch(fetchClients())
    },
    [dispatch, deleteConfirm],
  )

  function handleExportCSV() {
    const url = '/.netlify/functions/clients?export=csv'
    const a = document.createElement('a')
    a.href = url
    a.download = 'clients.csv'
    a.click()
  }

  async function handleImport(rows: Array<Record<string, string>>) {
    const res = await fetch('/.netlify/functions/clients/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clients: rows }),
    })
    const data = await res.json()
    dispatch(fetchClients())
    return data
  }

  function handleEdit(client: Client) {
    setEditingClient(client)
  }

  function handleDelete(client: Client) {
    setDeleteConfirm(client)
  }

  return (
    <div data-testid="clients-list-page" className="p-6 max-sm:p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Clients</h1>
        <div className="flex items-center gap-2">
          <button
            data-testid="csv-import-button"
            type="button"
            onClick={() => setImportDialogOpen(true)}
            className="h-7 px-2 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer flex items-center gap-1"
          >
            <Upload size={14} />
            Import
          </button>
          <button
            data-testid="csv-export-button"
            type="button"
            onClick={handleExportCSV}
            className="h-7 px-2 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer flex items-center gap-1"
          >
            <Download size={14} />
            Export
          </button>
          <button
            data-testid="add-client-button"
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="h-7 px-3 rounded text-[13px] text-white bg-[var(--color-accent)] hover:opacity-90 cursor-pointer flex items-center gap-1"
          >
            <Plus size={14} />
            Add New Client
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-3">
        <ClientsFilterBar />
      </div>

      {/* Client list */}
      <ClientsListContent onEdit={handleEdit} onDelete={handleDelete} />

      {/* Create Client Modal */}
      <CreateClientModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateClient}
      />

      {/* Edit Client Modal */}
      <CreateClientModal
        open={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSubmit={handleUpdateClient}
        editingClient={editingClient}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        entityName="Clients"
        columns={clientImportColumns}
        onImport={handleImport}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="delete-confirm-dialog">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-[var(--color-bg-base)] rounded-lg shadow-[var(--shadow-elevation-2)] w-full max-w-sm mx-4 p-4">
            <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-2">Delete Client</h3>
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">
              Are you sure you want to delete this client? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                data-testid="delete-cancel"
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="h-8 px-3 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                data-testid="delete-confirm"
                type="button"
                onClick={handleDeleteClient}
                className="h-8 px-4 rounded text-[13px] text-white bg-[var(--color-priority-high)] hover:opacity-90 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
