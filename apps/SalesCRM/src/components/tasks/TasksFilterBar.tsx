import { useState, useRef, useEffect } from 'react'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'

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
          <div data-testid="tasks-filter-dropdown" className="absolute left-0 top-full mt-1 w-[240px] bg-surface border border-border rounded-[6px] shadow-[var(--shadow-elevation-2)] z-50 py-1">
            <div className="px-3 py-2">
              <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Priority</label>
              <select
                data-testid="tasks-filter-priority"
                value={priorityFilter}
                onChange={(e) => { onPriorityChange(e.target.value); setFilterOpen(false) }}
                className="mt-1 w-full h-[30px] px-2 text-[13px] text-text-primary bg-surface border border-border rounded-[4px] focus:outline-none focus:border-accent"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
              </select>
            </div>

            <div className="px-3 py-2">
              <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Assignee</label>
              <select
                data-testid="tasks-filter-assignee"
                value={assigneeFilter}
                onChange={(e) => { onAssigneeChange(e.target.value); setFilterOpen(false) }}
                className="mt-1 w-full h-[30px] px-2 text-[13px] text-text-primary bg-surface border border-border rounded-[4px] focus:outline-none focus:border-accent"
              >
                <option value="">All Assignees</option>
                {availableAssignees.map((a) => (
                  <option key={a.assignee_name} value={a.assignee_name}>
                    {a.assignee_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="px-3 py-2">
              <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Client</label>
              <select
                data-testid="tasks-filter-client"
                value={clientFilter}
                onChange={(e) => { onClientChange(e.target.value); setFilterOpen(false) }}
                className="mt-1 w-full h-[30px] px-2 text-[13px] text-text-primary bg-surface border border-border rounded-[4px] focus:outline-none focus:border-accent"
              >
                <option value="">All Clients</option>
                {availableClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
