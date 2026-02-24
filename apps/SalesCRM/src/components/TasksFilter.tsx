import { useState, useEffect, useRef } from 'react'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setFilterType, setFilterText } from '@/store/tasksSlice'

const filterOptions = [
  { label: 'All Fields', value: 'all' },
  { label: 'Priority', value: 'priority' },
  { label: 'Assignee', value: 'assignee' },
  { label: 'Client', value: 'client' },
  { label: 'Due Date', value: 'due_date' },
]

export default function TasksFilter() {
  const dispatch = useAppDispatch()
  const filterType = useAppSelector(s => s.tasks.filterType)
  const filterText = useAppSelector(s => s.tasks.filterText)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [localText, setLocalText] = useState(filterText)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilterText(localText))
    }, 200)
    return () => clearTimeout(timer)
  }, [localText, dispatch])

  const [prevReduxText, setPrevReduxText] = useState(filterText)
  if (filterText !== prevReduxText) {
    setPrevReduxText(filterText)
    setLocalText(filterText)
  }

  const selectedLabel = filterOptions.find(o => o.value === filterType)?.label || 'All Fields'

  const handleTypeChange = (value: string) => {
    dispatch(setFilterType(value))
    setLocalText('')
    setDropdownOpen(false)
  }

  return (
    <div className="tasks-filter" data-testid="tasks-filter">
      <div className="filter-dropdown-wrapper" ref={ref} data-testid="tasks-filter-type-dropdown">
        <button
          className="filter-trigger"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          data-testid="tasks-filter-type-dropdown-trigger"
        >
          <SlidersHorizontal size={14} />
          <span>{selectedLabel}</span>
          <ChevronDown size={14} />
        </button>
        {dropdownOpen && (
          <div className="filter-dropdown-menu" data-testid="tasks-filter-type-dropdown-menu">
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                className={`filter-dropdown-option${opt.value === filterType ? ' selected' : ''}`}
                onClick={() => handleTypeChange(opt.value)}
                data-testid={`tasks-filter-type-option-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="tasks-filter-input-wrapper">
        <input
          type="text"
          className="tasks-filter-input"
          placeholder="Filter..."
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          data-testid="tasks-filter-input"
        />
        {localText && (
          <button
            className="tasks-filter-clear"
            onClick={() => setLocalText('')}
            data-testid="tasks-filter-clear"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
