import { useEffect, useState, useCallback } from 'react'
import { Plus, Download, Upload } from 'lucide-react'
import { useAppDispatch } from '../store/hooks'
import { fetchIndividuals } from '../store/slices/individualsSlice'
import ContactsSearchBar from '../components/Contacts/ContactsSearchBar'
import ContactsListContent from '../components/Contacts/ContactsListContent'
import CreateContactModal from '../components/Contacts/CreateContactModal'
import ImportDialog from '../components/ImportDialog'

const contactImportColumns = [
  { name: 'Name', required: true, description: 'Contact full name (text)' },
  { name: 'Title', required: false, description: 'Job title (text)' },
  { name: 'Email', required: false, description: 'Email address (text)' },
  { name: 'Phone', required: false, description: 'Phone number (text)' },
  { name: 'Location', required: false, description: 'City, State (text)' },
  { name: 'Client Name', required: false, description: 'Name of existing client' },
]

export default function ContactsListPage() {
  const dispatch = useAppDispatch()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchIndividuals())
  }, [dispatch])

  const handleCreateContact = useCallback(
    async (data: {
      name: string
      title: string
      email: string
      phone: string
      location: string
      client_id: string
    }) => {
      const res = await fetch('/.netlify/functions/individuals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create contact')
      }
      dispatch(fetchIndividuals())
    },
    [dispatch],
  )

  function handleExportCSV() {
    const params = new URLSearchParams()
    params.set('export', 'csv')
    const url = `/.netlify/functions/individuals?${params}`
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts.csv'
    a.click()
  }

  async function handleImport(rows: Array<Record<string, string>>) {
    const res = await fetch('/.netlify/functions/individuals/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts: rows }),
    })
    const data = await res.json()
    dispatch(fetchIndividuals())
    return data
  }

  return (
    <div data-testid="contacts-list-page" className="p-6 max-sm:p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Contacts</h1>
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
            data-testid="add-contact-button"
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="h-7 px-3 rounded text-[13px] text-white bg-[var(--color-accent)] hover:opacity-90 cursor-pointer flex items-center gap-1"
          >
            <Plus size={14} />
            Add Contact
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-3">
        <ContactsSearchBar />
      </div>

      {/* Contact list */}
      <ContactsListContent />

      {/* Create Contact Modal */}
      <CreateContactModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateContact}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        entityName="Contacts"
        columns={contactImportColumns}
        onImport={handleImport}
      />
    </div>
  )
}
