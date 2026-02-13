import { Download, Upload, Plus } from 'lucide-react'

interface ClientsPageHeaderProps {
  onAddClient: () => void
  onImport: () => void
  onExport: () => void
}

export function ClientsPageHeader({ onAddClient, onImport, onExport }: ClientsPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-[24px] font-semibold text-text-primary">Clients</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onImport}
          className="inline-flex items-center gap-1.5 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100"
        >
          <Download size={14} strokeWidth={1.75} />
          Import
        </button>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1.5 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100"
        >
          <Upload size={14} strokeWidth={1.75} />
          Export
        </button>
        <button
          onClick={onAddClient}
          className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 transition-opacity duration-100"
        >
          <Plus size={14} strokeWidth={2} />
          Add New Client
        </button>
      </div>
    </div>
  )
}
