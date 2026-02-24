import { useCallback, useRef } from 'react'
import { Search } from 'lucide-react'
import FilterSelect from '../FilterSelect'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSearch, setFilterPriority, setFilterStatus, fetchTasks } from '../../store/slices/tasksSlice'

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
]

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function TasksFilterBar() {
  const dispatch = useAppDispatch()
  const { search, filterPriority, filterStatus } = useAppSelector((s) => s.tasks)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch(setSearch(value))
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        dispatch(fetchTasks())
      }, 300)
    },
    [dispatch],
  )

  const handlePriorityChange = useCallback(
    (value: string) => {
      dispatch(setFilterPriority(value))
      dispatch(fetchTasks())
    },
    [dispatch],
  )

  const handleStatusChange = useCallback(
    (value: string) => {
      dispatch(setFilterStatus(value))
      dispatch(fetchTasks())
    },
    [dispatch],
  )

  return (
    <div data-testid="tasks-filter-bar" className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 h-7 px-2 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] flex-1 min-w-[180px] max-w-[320px]">
        <Search size={14} className="text-[var(--color-text-disabled)] shrink-0" />
        <input
          data-testid="task-search-input"
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Filter..."
          className="w-full bg-transparent border-none outline-none text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)]"
        />
      </div>
      <FilterSelect
        data-testid="priority-filter"
        value={filterPriority}
        onChange={handlePriorityChange}
        options={priorityOptions}
        placeholder="All Priorities"
      />
      <FilterSelect
        data-testid="status-filter"
        value={filterStatus}
        onChange={handleStatusChange}
        options={statusOptions}
        placeholder="All Statuses"
      />
    </div>
  )
}
