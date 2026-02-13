import { ChevronDown } from 'lucide-react'

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
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-[34px] pl-3 pr-7 text-[13px] text-text-secondary bg-surface border border-border rounded-[5px] cursor-pointer hover:bg-hover focus:outline-none focus:border-accent transition-colors duration-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {label}: {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        strokeWidth={2}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none"
      />
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
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <FilterSelect label="Stage" value={stage} options={stageOptions} onChange={onStageChange} />
      <FilterSelect label="Client" value={client} options={clientOptions} onChange={onClientChange} />
      <FilterSelect label="Status" value={status} options={statusOptions} onChange={onStatusChange} />
      <FilterSelect label="Sort by" value={sort} options={sortOptions} onChange={onSortChange} />
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="h-[34px] px-2 text-[13px] text-text-secondary bg-surface border border-border rounded-[5px] focus:outline-none focus:border-accent transition-colors duration-100"
          placeholder="From"
        />
        <span className="text-[12px] text-text-muted">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="h-[34px] px-2 text-[13px] text-text-secondary bg-surface border border-border rounded-[5px] focus:outline-none focus:border-accent transition-colors duration-100"
          placeholder="To"
        />
      </div>
    </div>
  )
}
