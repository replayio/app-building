import { FilterSelect } from '../shared/FilterSelect'

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
    { value: 'most_deals', label: 'Most Deals' },
  ]

  return (
    <div data-testid="clients-filter-controls" className="flex flex-wrap items-center gap-2">
      <FilterSelect label="Status" value={status} options={statusOptions} onChange={onStatusChange} testId="filter-status" />
      <FilterSelect label="Tags" value={tag} options={tagOptions} onChange={onTagChange} testId="filter-tags" />
      <FilterSelect label="Source" value={source} options={sourceOptions} onChange={onSourceChange} testId="filter-source" />
      <FilterSelect label="Sort" value={sort} options={sortOptions} onChange={onSortChange} testId="filter-sort" />
    </div>
  )
}
