import { useCallback, useRef } from 'react'
import { Search } from 'lucide-react'
import FilterSelect from '../FilterSelect'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSearch, setFilterStatus, setFilterTag, setFilterSource, setSort, fetchClients } from '../../store/slices/clientsSlice'

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'churned', label: 'Churned' },
]

const sortOptions = [
  { value: 'updated_at_desc', label: 'Recently Updated' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'created_at_desc', label: 'Newest First' },
  { value: 'created_at_asc', label: 'Oldest First' },
]

function getSortValue(sortBy: string, sortDir: string): string {
  return `${sortBy}_${sortDir}`
}

function parseSortValue(value: string): { sortBy: string; sortDir: 'asc' | 'desc' } {
  const parts = value.split('_')
  const dir = parts.pop() as 'asc' | 'desc'
  const field = parts.join('_')
  return { sortBy: field, sortDir: dir }
}

export default function ClientsFilterBar() {
  const dispatch = useAppDispatch()
  const { search, filterStatus, filterTag, filterSource, sortBy, sortDir, availableTags, availableSources } = useAppSelector((s) => s.clients)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch(setSearch(value))
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        dispatch(fetchClients())
      }, 300)
    },
    [dispatch],
  )

  const handleStatusChange = useCallback(
    (value: string) => {
      dispatch(setFilterStatus(value))
      dispatch(fetchClients())
    },
    [dispatch],
  )

  const handleTagChange = useCallback(
    (value: string) => {
      dispatch(setFilterTag(value))
      dispatch(fetchClients())
    },
    [dispatch],
  )

  const handleSourceChange = useCallback(
    (value: string) => {
      dispatch(setFilterSource(value))
      dispatch(fetchClients())
    },
    [dispatch],
  )

  const handleSortChange = useCallback(
    (value: string) => {
      const parsed = parseSortValue(value)
      dispatch(setSort(parsed))
      dispatch(fetchClients())
    },
    [dispatch],
  )

  const tagOptions = [
    { value: '', label: 'All' },
    ...availableTags.map((t) => ({ value: t, label: t })),
  ]

  const sourceOptions = [
    { value: '', label: 'All' },
    ...availableSources.map((s) => ({ value: s, label: s })),
  ]

  const statusLabel = filterStatus
    ? `Status: ${statusOptions.find((o) => o.value === filterStatus)?.label || filterStatus}`
    : 'Status: All'

  const tagLabel = filterTag
    ? `Tags: ${filterTag}`
    : 'Tags: All'

  const sourceLabel = filterSource
    ? `Source: ${filterSource}`
    : 'Source: All'

  const currentSortValue = getSortValue(sortBy, sortDir)
  const sortLabel = `Sort: ${sortOptions.find((o) => o.value === currentSortValue)?.label || 'Recently Updated'}`

  return (
    <div data-testid="clients-filter-bar" className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 h-7 px-2 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] flex-1 min-w-[180px] max-w-[320px]">
        <Search size={14} className="text-[var(--color-text-disabled)] shrink-0" />
        <input
          data-testid="clients-search-input"
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search clients by name, tag, or contact..."
          className="w-full bg-transparent border-none outline-none text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)]"
        />
      </div>
      <FilterSelect
        data-testid="status-filter"
        value={filterStatus}
        onChange={handleStatusChange}
        options={statusOptions}
        placeholder={statusLabel}
      />
      <FilterSelect
        data-testid="tags-filter"
        value={filterTag}
        onChange={handleTagChange}
        options={tagOptions}
        placeholder={tagLabel}
        searchable
      />
      <FilterSelect
        data-testid="source-filter"
        value={filterSource}
        onChange={handleSourceChange}
        options={sourceOptions}
        placeholder={sourceLabel}
      />
      <FilterSelect
        data-testid="sort-select"
        value={currentSortValue}
        onChange={handleSortChange}
        options={sortOptions}
        placeholder={sortLabel}
      />
    </div>
  )
}
