import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, X, Calendar } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setDealsSearch,
  setDealsStageFilter,
  setDealsClientFilter,
  setDealsStatusFilter,
  setDealsSort,
  setDealsDateRange,
} from '@/store/dealsSlice'

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
  const displayText = selectedOption?.label || label

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

function DateRangeDropdown({ dateFrom, dateTo, onChange, testId }: {
  dateFrom: string
  dateTo: string
  onChange: (from: string, to: string) => void
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

  const hasRange = dateFrom || dateTo
  const displayText = hasRange
    ? `${dateFrom || '...'} – ${dateTo || '...'}`
    : 'Date - Range'

  return (
    <div className="filter-dropdown-wrapper" ref={ref} data-testid={testId}>
      <button
        className="filter-trigger"
        onClick={() => setOpen(!open)}
        data-testid={`${testId}-trigger`}
      >
        <Calendar size={14} />
        <span>{displayText}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="filter-dropdown-menu" data-testid={`${testId}-menu`}>
          <div className="filter-date-range">
            <label className="filter-date-label">
              <span>From:</span>
              <input
                type="date"
                className="filter-date-input"
                value={dateFrom}
                onChange={(e) => onChange(e.target.value, dateTo)}
                data-testid={`${testId}-from`}
              />
            </label>
            <label className="filter-date-label">
              <span>To:</span>
              <input
                type="date"
                className="filter-date-input"
                value={dateTo}
                onChange={(e) => onChange(dateFrom, e.target.value)}
                data-testid={`${testId}-to`}
              />
            </label>
            {hasRange && (
              <button
                className="filter-dropdown-option"
                onClick={() => { onChange('', ''); setOpen(false) }}
                data-testid={`${testId}-clear`}
              >
                Clear dates
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const stageOptions = [
  { label: 'All Stages', value: '' },
  { label: 'Lead', value: 'Lead' },
  { label: 'Qualification', value: 'Qualification' },
  { label: 'Discovery', value: 'Discovery' },
  { label: 'Proposal', value: 'Proposal' },
  { label: 'Negotiation', value: 'Negotiation' },
  { label: 'Closed Won', value: 'Closed Won' },
  { label: 'Closed Lost', value: 'Closed Lost' },
]

const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'All Statuses', value: '' },
  { label: 'On Track', value: 'On Track' },
  { label: 'Needs Attention', value: 'Needs Attention' },
  { label: 'At Risk', value: 'At Risk' },
  { label: 'Won', value: 'Won' },
  { label: 'Lost', value: 'Lost' },
]

const sortOptions = [
  { label: 'Close Date (Newest)', value: 'close_date_newest' },
  { label: 'Close Date (Oldest)', value: 'close_date_oldest' },
  { label: 'Value (Highest)', value: 'value_highest' },
  { label: 'Value (Lowest)', value: 'value_lowest' },
]

export default function DealsFilters() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(s => s.deals.filters)
  const availableClients = useAppSelector(s => s.deals.availableClients)
  const [localSearch, setLocalSearch] = useState(filters.search)

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setDealsSearch(localSearch))
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, dispatch])

  const [prevReduxSearch, setPrevReduxSearch] = useState(filters.search)
  if (filters.search !== prevReduxSearch) {
    setPrevReduxSearch(filters.search)
    setLocalSearch(filters.search)
  }

  const clientOptions = [
    { label: 'All Clients', value: '' },
    ...availableClients.map(c => ({ label: c, value: c })),
  ]

  return (
    <div className="deals-filters" data-testid="deals-filters">
      <div className="deals-filters-row">
        <FilterDropdown
          label="All Stages"
          value={filters.stage}
          options={stageOptions}
          onChange={(v) => dispatch(setDealsStageFilter(v))}
          testId="deals-stage-filter"
        />
        <FilterDropdown
          label="All Clients"
          value={filters.client}
          options={clientOptions}
          onChange={(v) => dispatch(setDealsClientFilter(v))}
          testId="deals-client-filter"
        />
        <FilterDropdown
          label="Active"
          value={filters.status}
          options={statusOptions}
          onChange={(v) => dispatch(setDealsStatusFilter(v))}
          testId="deals-status-filter"
        />
        <DateRangeDropdown
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onChange={(from, to) => dispatch(setDealsDateRange({ from, to }))}
          testId="deals-date-filter"
        />
        <FilterDropdown
          label="Close Date (Newest)"
          value={filters.sort}
          options={sortOptions}
          onChange={(v) => dispatch(setDealsSort(v))}
          testId="deals-sort-filter"
        />
        <div className="deals-search-wrapper" data-testid="deals-search-wrapper">
          <Search size={14} className="deals-search-icon" />
          <input
            type="text"
            className="deals-search-input"
            placeholder="Search deals..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            data-testid="deals-search-input"
          />
          {localSearch && (
            <button
              className="deals-search-clear"
              onClick={() => setLocalSearch('')}
              data-testid="deals-search-clear"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
