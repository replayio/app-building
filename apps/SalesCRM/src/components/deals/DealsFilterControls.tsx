import { FilterSelect } from '../shared/FilterSelect'

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
      <FilterSelect label="Client" value={client} options={clientOptions} onChange={onClientChange} testId="deals-filter-client" searchable />
      <FilterSelect label="Status" value={status} options={statusOptions} onChange={onStatusChange} testId="deals-filter-status" />
      <FilterSelect label="Sort by" value={sort} options={sortOptions} onChange={onSortChange} testId="deals-filter-sort" />
      <div className="deals-date-range flex items-center gap-1.5">
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
