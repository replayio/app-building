import { useState, useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchIndividuals, createIndividual, setPage } from '../store/individualsSlice'
import { ContactsPageHeader } from '../components/contacts/ContactsPageHeader'
import { ContactsSearchBar } from '../components/contacts/ContactsSearchBar'
import { ContactsTable } from '../components/contacts/ContactsTable'
import { ContactsPagination } from '../components/contacts/ContactsPagination'
import { AddContactModal } from '../components/contacts/AddContactModal'
import { ImportDialog } from '../components/shared/ImportDialog'

export function ContactsListPage() {
  const dispatch = useAppDispatch()
  const { items, total, page, pageSize, loading } = useAppSelector(
    (state) => state.individuals
  )

  const [search, setSearch] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const loadContacts = useCallback(() => {
    dispatch(
      fetchIndividuals({
        page,
        search: search || undefined,
      })
    )
  }, [dispatch, page, search])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  // Debounce search input
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      dispatch(setPage(1))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, dispatch])

  function handleAddContact(data: {
    name: string
    title: string
    email: string
    phone: string
    location: string
  }) {
    dispatch(createIndividual(data)).then(() => {
      setAddModalOpen(false)
      loadContacts()
    })
  }

  function handlePageChange(newPage: number) {
    dispatch(setPage(newPage))
  }

  function handleExport() {
    const headers = ['Name', 'Title', 'Email', 'Phone', 'Location', 'Associated Clients']
    const rows = items.map((c) => [
      c.name,
      c.title ?? '',
      c.email ?? '',
      c.phone ?? '',
      c.location ?? '',
      c.associated_clients.map((ac) => ac.client_name).join('; '),
    ])
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const csvUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = csvUrl
    a.download = 'contacts-export.csv'
    a.click()
    URL.revokeObjectURL(csvUrl)
  }

  return (
    <div className="p-3 sm:p-6" data-testid="contacts-list-page">
      <ContactsPageHeader
        onAddContact={() => setAddModalOpen(true)}
        onImport={() => setImportDialogOpen(true)}
        onExport={handleExport}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <ContactsSearchBar value={searchInput} onChange={setSearchInput} />
      </div>

      <div className="border border-border rounded-[6px] bg-surface overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-[13px] text-text-muted">
            Loading contacts...
          </div>
        ) : (
          <ContactsTable contacts={items} />
        )}
        <ContactsPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
        />
      </div>

      <AddContactModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddContact}
      />

      {importDialogOpen && (
        <ImportDialog
          entityName="Contact"
          entityNamePlural="Contacts"
          columns={CONTACT_CSV_COLUMNS}
          headerMap={CONTACT_HEADER_MAP}
          templateFilename="contacts-import-template.csv"
          templateExample="Sarah Johnson,CEO,sarah@acmecorp.com,+1 555-100-0001,New York,Acme Corp"
          apiEndpoint="/.netlify/functions/individuals?action=import"
          apiBodyKey="contacts"
          onClose={() => setImportDialogOpen(false)}
          onImported={loadContacts}
        />
      )}
    </div>
  )
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
