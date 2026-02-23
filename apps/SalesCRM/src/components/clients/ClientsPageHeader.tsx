import { Download, Upload, Plus, Users } from 'lucide-react'

interface ClientsPageHeaderProps {
  onAddClient: () => void
  onImport: () => void
  onImportContacts: () => void
  onExport: () => void
}

export function ClientsPageHeader({ onAddClient, onImport, onImportContacts, onExport }: ClientsPageHeaderProps) {
  return (
    <div data-testid="clients-page-header" className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 className="text-[24px] max-sm:text-[20px] font-semibold text-text-primary">Clients</h1>
      <div className="flex flex-wrap items-center gap-2">
        <button
          data-testid="import-button"
          onClick={onImport}
          className="inline-flex items-center gap-1.5 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100"
        >
          <Download size={14} strokeWidth={1.75} />
          <span className="max-sm:hidden">Import</span>
        </button>
        <button
          data-testid="import-contacts-button"
          onClick={onImportContacts}
          className="inline-flex items-center gap-1.5 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100"
        >
          <Users size={14} strokeWidth={1.75} />
          <span className="max-sm:hidden">Import Contacts</span>
        </button>
        <button
          data-testid="export-button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100"
        >
          <Upload size={14} strokeWidth={1.75} />
          <span className="max-sm:hidden">Export</span>
        </button>
        <button
          data-testid="add-new-client-button"
          onClick={onAddClient}
          className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 transition-opacity duration-100"
        >
          <Plus size={14} strokeWidth={2} />
          <span className="max-sm:hidden">Add New Client</span>
        </button>
      </div>
    </div>
  )
}
