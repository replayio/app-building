import { ChevronDown } from 'lucide-react'

interface ClientsFilterControlsProps {
  status: string
  tag: string
  source: string
  sort: string
  availableTags: string[]
  availableSources: string[]
  onStatusChange: (value: string) => void
  onTagChange: (value: string) => void
  onSourceChange: (value: string) => void
  onSortChange: (value: string) => void
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
        data-testid={`filter-${label.toLowerCase()}`}
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

export function ClientsFilterControls({
  status,
  tag,
  source,
  sort,
  availableTags,
  availableSources,
  onStatusChange,
  onTagChange,
  onSourceChange,
  onSortChange,
}: ClientsFilterControlsProps) {
  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'churned', label: 'Churned' },
  ]

  const tagOptions = [
    { value: '', label: 'All' },
    ...availableTags.map((t) => ({ value: t, label: t })),
  ]

  const sourceOptions = [
    { value: '', label: 'All' },
    ...availableSources.map((s) => ({ value: s, label: s })),
  ]

  const sortOptions = [
    { value: 'updated_at', label: 'Recently Updated' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    { value: 'status', label: 'Status' },
  ]

  return (
    <div data-testid="clients-filter-controls" className="flex items-center gap-2">
      <FilterSelect label="Status" value={status} options={statusOptions} onChange={onStatusChange} />
      <FilterSelect label="Tags" value={tag} options={tagOptions} onChange={onTagChange} />
      <FilterSelect label="Source" value={source} options={sourceOptions} onChange={onSourceChange} />
      <FilterSelect label="Sort" value={sort} options={sortOptions} onChange={onSortChange} />
    </div>
  )
}
