import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSearch, setStatusFilter, setTagFilter, setSourceFilter, setSort } from '@/store/clientsSlice'

function FilterDropdown({ label, value, options, onChange, testId }: {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
  testId: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)
  const displayText = value ? `${label}: ${selectedOption?.label || value}` : label

  return (
    <div className="filter-dropdown-wrapper" ref={ref} data-testid={testId}>
      <button
        className="filter-trigger"
        onClick={() => setOpen(!open)}
        data-testid={`${testId}-trigger`}
      >
        <span>{displayText}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="filter-dropdown-menu" data-testid={`${testId}-menu`}>
          {options.map(opt => (
            <button
              key={opt.value}
              className={`filter-dropdown-option${opt.value === value ? ' selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              data-testid={`${testId}-option-${opt.value || 'all'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Prospect', value: 'Prospect' },
  { label: 'Churned', value: 'Churned' },
]

const sortOptions = [
  { label: 'Recently Updated', value: 'recently_updated' },
  { label: 'Name A-Z', value: 'name_asc' },
  { label: 'Name Z-A', value: 'name_desc' },
]

export default function ClientsSearchAndFilters() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(s => s.clients.filters)
  const availableTags = useAppSelector(s => s.clients.availableTags)
  const availableSources = useAppSelector(s => s.clients.availableSources)
  const [localSearch, setLocalSearch] = useState(filters.search)

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearch(localSearch))
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, dispatch])

  const [prevReduxSearch, setPrevReduxSearch] = useState(filters.search)
  if (filters.search !== prevReduxSearch) {
    setPrevReduxSearch(filters.search)
    setLocalSearch(filters.search)
  }

  const tagOptions = [
    { label: 'All', value: '' },
    ...availableTags.map(t => ({ label: t, value: t })),
  ]

  const sourceOptions = [
    { label: 'All', value: '' },
    ...availableSources.map(s => ({ label: s, value: s })),
  ]

  return (
    <div className="clients-filters" data-testid="clients-search-and-filters">
      <div className="clients-search-wrapper" data-testid="search-input-wrapper">
        <Search size={16} className="clients-search-icon" />
        <input
          type="text"
          className="clients-search-input"
          placeholder="Search clients by name, tag, or contact..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          data-testid="search-input"
        />
        {localSearch && (
          <button
            className="clients-search-clear"
            onClick={() => setLocalSearch('')}
            data-testid="search-clear"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="clients-filter-row">
        <FilterDropdown
          label="Status"
          value={filters.status}
          options={statusOptions}
          onChange={(v) => dispatch(setStatusFilter(v))}
          testId="status-filter"
        />
        <FilterDropdown
          label="Tags"
          value={filters.tag}
          options={tagOptions}
          onChange={(v) => dispatch(setTagFilter(v))}
          testId="tags-filter"
        />
        <FilterDropdown
          label="Source"
          value={filters.source}
          options={sourceOptions}
          onChange={(v) => dispatch(setSourceFilter(v))}
          testId="source-filter"
        />
        <FilterDropdown
          label="Sort"
          value={filters.sort}
          options={sortOptions}
          onChange={(v) => dispatch(setSort(v))}
          testId="sort-filter"
        />
      </div>
    </div>
  )
}
