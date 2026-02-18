import { Plus, Search, Download } from 'lucide-react'

interface DealsPageHeaderProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onCreateDeal: () => void
  onImport: () => void
}

export function DealsPageHeader({ searchValue, onSearchChange, onCreateDeal, onImport }: DealsPageHeaderProps) {
  return (
    <div className="mb-6" data-testid="deals-page-header">
      <div className="flex items-center gap-2 text-[12px] text-text-muted mb-2" data-testid="deals-breadcrumb">
        <span>/deals</span>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-text-primary">Deals List</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              strokeWidth={1.75}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-disabled"
            />
            <input
              type="text"
              data-testid="deals-search-input"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search deals..."
              className="h-[34px] w-[220px] pl-8 pr-3 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder-text-disabled focus:outline-none focus:border-accent transition-colors duration-100"
            />
          </div>
          <button
            data-testid="deals-import-button"
            onClick={onImport}
            className="inline-flex items-center gap-1.5 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100"
          >
            <Download size={14} strokeWidth={1.75} />
            Import
          </button>
          <button
            data-testid="create-new-deal-button"
            onClick={onCreateDeal}
            className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 transition-opacity duration-100"
          >
            <Plus size={14} strokeWidth={2} />
            Create New Deal
          </button>
        </div>
      </div>
    </div>
  )
}
