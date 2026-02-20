import { useState, useRef, useEffect } from 'react'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { FilterSelect } from '../shared/FilterSelect'

interface TasksFilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  priorityFilter: string
  onPriorityChange: (value: string) => void
  assigneeFilter: string
  onAssigneeChange: (value: string) => void
  clientFilter: string
  onClientChange: (value: string) => void
  availableAssignees: { assignee_name: string; assignee_role: string | null }[]
  availableClients: { id: string; name: string }[]
}

export function TasksFilterBar({
  searchValue,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  assigneeFilter,
  onAssigneeChange,
  clientFilter,
  onClientChange,
  availableAssignees,
  availableClients,
}: TasksFilterBarProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasActiveFilters = priorityFilter || assigneeFilter || clientFilter

  return (
    <div className="flex items-center gap-2 mb-4" data-testid="tasks-filter-bar">
      <div className="relative" ref={dropdownRef}>
        <button
          data-testid="tasks-filter-button"
          onClick={() => setFilterOpen(!filterOpen)}
          className={`inline-flex items-center gap-1.5 h-[34px] px-3 text-[13px] font-medium border rounded-[5px] transition-colors duration-100 ${
            hasActiveFilters
              ? 'text-accent border-accent bg-accent/5'
              : 'text-text-secondary border-border hover:bg-hover'
          }`}
        >
          <SlidersHorizontal size={14} strokeWidth={1.75} />
          <ChevronDown size={12} strokeWidth={1.75} />
        </button>

        {filterOpen && (
          <div data-testid="tasks-filter-dropdown" className="absolute left-0 top-full mt-1 w-[240px] max-sm:w-[200px] bg-surface border border-border rounded-[6px] shadow-[var(--shadow-elevation-2)] z-50 py-1">
            <div className="px-3 py-2">
              <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Priority</label>
              <FilterSelect
                testId="tasks-filter-priority"
                value={priorityFilter}
                onChange={(val) => { onPriorityChange(val); setFilterOpen(false) }}
                className="mt-1"
                options={[
                  { value: '', label: 'All Priorities' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                  { value: 'normal', label: 'Normal' },
                ]}
              />
            </div>

            <div className="px-3 py-2">
              <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Assignee</label>
              <FilterSelect
                testId="tasks-filter-assignee"
                value={assigneeFilter}
                onChange={(val) => { onAssigneeChange(val); setFilterOpen(false) }}
                className="mt-1"
                searchable
                options={[
                  { value: '', label: 'All Assignees' },
                  ...availableAssignees.map((a) => ({ value: a.assignee_name, label: a.assignee_name })),
                ]}
              />
            </div>

            <div className="px-3 py-2">
              <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Client</label>
              <FilterSelect
                testId="tasks-filter-client"
                value={clientFilter}
                onChange={(val) => { onClientChange(val); setFilterOpen(false) }}
                className="mt-1"
                searchable
                options={[
                  { value: '', label: 'All Clients' },
                  ...availableClients.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>

            {hasActiveFilters && (
              <div className="px-3 py-2 border-t border-border">
                <button
                  data-testid="tasks-filter-clear"
                  onClick={() => {
                    onPriorityChange('')
                    onAssigneeChange('')
                    onClientChange('')
                    setFilterOpen(false)
                  }}
                  className="text-[12px] text-accent hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        type="text"
        data-testid="tasks-filter-search"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Filter..."
        className="flex-1 h-[34px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder-text-disabled focus:outline-none focus:border-accent transition-colors duration-100"
      />
    </div>
  )
}
