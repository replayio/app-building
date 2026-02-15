import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface DealsFilterControlsProps {
  stage: string
  client: string
  status: string
  sort: string
  dateFrom: string
  dateTo: string
  availableClients: { id: string; name: string }[]
  onStageChange: (value: string) => void
  onClientChange: (value: string) => void
  onStatusChange: (value: string) => void
  onSortChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  testId,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  testId?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)
  const displayText = selectedOption ? `${label}: ${selectedOption.label}` : label

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative" ref={ref} data-testid={testId} data-value={value}>
      <button
        type="button"
        data-testid={testId ? `${testId}-trigger` : undefined}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 h-[34px] pl-3 pr-7 text-[13px] text-text-secondary bg-surface border border-border rounded-[5px] cursor-pointer hover:bg-hover focus:outline-none focus:border-accent transition-colors duration-100 whitespace-nowrap"
      >
        {displayText}
        <ChevronDown
          size={12}
          strokeWidth={2}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled"
        />
      </button>
      {open && (
        <div
          data-testid={testId ? `${testId}-menu` : undefined}
          className="absolute top-full left-0 mt-1 min-w-full w-max max-h-[240px] overflow-y-auto bg-surface border border-border rounded-[6px] shadow-lg z-50"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-testid={testId ? `${testId}-option-${opt.value || 'all'}` : undefined}
              data-option-value={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={`flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-left hover:bg-hover transition-colors duration-100 ${
                opt.value === value ? 'text-accent font-medium' : 'text-text-secondary'
              }`}
            >
              <span className="w-3.5 flex-shrink-0">
                {opt.value === value && <Check size={12} strokeWidth={2.5} />}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function DealsFilterControls({
  stage,
  client,
  status,
  sort,
  dateFrom,
  dateTo,
  availableClients,
  onStageChange,
  onClientChange,
  onStatusChange,
  onSortChange,
  onDateFromChange,
  onDateToChange,
}: DealsFilterControlsProps) {
  const stageOptions = [
    { value: '', label: 'All Stages' },
    { value: 'lead', label: 'Lead' },
    { value: 'qualification', label: 'Qualification' },
    { value: 'discovery', label: 'Discovery' },
    { value: 'proposal', label: 'Proposal Sent' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' },
  ]

  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...availableClients.map((c) => ({ value: c.id, label: c.name })),
  ]

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'on_track', label: 'On Track' },
    { value: 'needs_attention', label: 'Needs Attention' },
    { value: 'at_risk', label: 'At Risk' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
    { value: 'on_hold', label: 'On Hold' },
  ]

  const sortOptions = [
    { value: 'close_date_desc', label: 'Close Date (Newest)' },
    { value: 'close_date_asc', label: 'Close Date (Oldest)' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    { value: 'value_desc', label: 'Value (High-Low)' },
    { value: 'value_asc', label: 'Value (Low-High)' },
  ]

  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap" data-testid="deals-filter-controls">
      <FilterSelect label="Stage" value={stage} options={stageOptions} onChange={onStageChange} testId="deals-filter-stage" />
      <FilterSelect label="Client" value={client} options={clientOptions} onChange={onClientChange} testId="deals-filter-client" />
      <FilterSelect label="Status" value={status} options={statusOptions} onChange={onStatusChange} testId="deals-filter-status" />
      <FilterSelect label="Sort by" value={sort} options={sortOptions} onChange={onSortChange} testId="deals-filter-sort" />
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          data-testid="deals-filter-date-from"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="h-[34px] px-2 text-[13px] text-text-secondary bg-surface border border-border rounded-[5px] focus:outline-none focus:border-accent transition-colors duration-100"
          placeholder="From"
        />
        <span className="text-[12px] text-text-muted">to</span>
        <input
          type="date"
          data-testid="deals-filter-date-to"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="h-[34px] px-2 text-[13px] text-text-secondary bg-surface border border-border rounded-[5px] focus:outline-none focus:border-accent transition-colors duration-100"
          placeholder="To"
        />
      </div>
    </div>
  )
}
