import { Download, Upload } from 'lucide-react'

interface ImportExportSectionProps {
  onImportClients: () => void
  onImportDeals: () => void
  onImportTasks: () => void
  onImportContacts: () => void
  onExportClients: () => void
  onExportDeals: () => void
  onExportTasks: () => void
}

export function ImportExportSection({
  onImportClients,
  onImportDeals,
  onImportTasks,
  onImportContacts,
  onExportClients,
  onExportDeals,
  onExportTasks,
}: ImportExportSectionProps) {
  return (
    <div data-testid="import-export-section" className="border border-border rounded-[6px] bg-surface">
      <div className="px-5 max-sm:px-3 py-4 border-b border-border">
        <h2 className="text-[14px] font-semibold text-text-primary">Import & Export</h2>
        <p className="text-[12px] text-text-muted mt-1">Import data from CSV files or export your data.</p>
      </div>
      <div className="px-5 max-sm:px-3 py-4">
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-6">
          <div>
            <h3 className="text-[13px] font-medium text-text-secondary mb-3">Import from CSV</h3>
            <div className="flex flex-col gap-2">
              <button
                data-testid="settings-import-clients"
                onClick={onImportClients}
                className="inline-flex items-center gap-2 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100 w-fit"
              >
                <Download size={14} strokeWidth={1.75} />
                Import Clients
              </button>
              <button
                data-testid="settings-import-deals"
                onClick={onImportDeals}
                className="inline-flex items-center gap-2 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100 w-fit"
              >
                <Download size={14} strokeWidth={1.75} />
                Import Deals
              </button>
              <button
                data-testid="settings-import-tasks"
                onClick={onImportTasks}
                className="inline-flex items-center gap-2 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100 w-fit"
              >
                <Download size={14} strokeWidth={1.75} />
                Import Tasks
              </button>
              <button
                data-testid="settings-import-contacts"
                onClick={onImportContacts}
                className="inline-flex items-center gap-2 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100 w-fit"
              >
                <Download size={14} strokeWidth={1.75} />
                Import Contacts
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-[13px] font-medium text-text-secondary mb-3">Export to CSV</h3>
            <div className="flex flex-col gap-2">
              <button
                data-testid="settings-export-clients"
                onClick={onExportClients}
                className="inline-flex items-center gap-2 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100 w-fit"
              >
                <Upload size={14} strokeWidth={1.75} />
                Export Clients
              </button>
              <button
                data-testid="settings-export-deals"
                onClick={onExportDeals}
                className="inline-flex items-center gap-2 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100 w-fit"
              >
                <Upload size={14} strokeWidth={1.75} />
                Export Deals
              </button>
              <button
                data-testid="settings-export-tasks"
                onClick={onExportTasks}
                className="inline-flex items-center gap-2 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100 w-fit"
              >
                <Upload size={14} strokeWidth={1.75} />
                Export Tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
