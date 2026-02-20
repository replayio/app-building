import { Plus, Download, Upload } from 'lucide-react'

interface ContactsPageHeaderProps {
  onAddContact: () => void
  onImport: () => void
  onExport: () => void
}

export function ContactsPageHeader({ onAddContact, onImport, onExport }: ContactsPageHeaderProps) {
  return (
    <div data-testid="contacts-page-header" className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 className="text-[24px] font-semibold text-text-primary">Contacts</h1>
      <div className="flex flex-wrap items-center gap-2">
        <button
          data-testid="contacts-import-button"
          onClick={onImport}
          className="inline-flex items-center gap-1.5 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100"
        >
          <Download size={14} strokeWidth={1.75} />
          Import
        </button>
        <button
          data-testid="contacts-export-button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100"
        >
          <Upload size={14} strokeWidth={1.75} />
          Export
        </button>
        <button
          data-testid="add-new-contact-button"
          onClick={onAddContact}
          className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 transition-opacity duration-100"
        >
          <Plus size={14} strokeWidth={2} />
          Add Contact
        </button>
      </div>
    </div>
  )
}
