import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import type { Task } from '../../store/slices/tasksSlice'
import { formatDueDate, getInitials } from '../../lib/utils'

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: 'High', color: 'var(--color-priority-high)', bg: 'var(--color-priority-high-bg)' },
  medium: { label: 'Medium', color: 'var(--color-priority-medium)', bg: 'var(--color-priority-medium-bg)' },
  normal: { label: 'Normal', color: 'var(--color-priority-normal)', bg: 'var(--color-priority-normal-bg)' },
  low: { label: 'Low', color: 'var(--color-priority-low)', bg: 'var(--color-priority-low-bg)' },
}

function formatAssigneeName(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length <= 1) return name
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, status: 'completed' | 'cancelled') => void
  onDelete: (taskId: string) => void
}

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setConfirmDelete(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const priority = priorityConfig[task.priority] || priorityConfig.medium
  const dueDateStr = formatDueDate(task.due_date)

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('[data-menu-area]')) return
    navigate(`/tasks/${task.id}`)
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(task.id)
    setMenuOpen(false)
    setConfirmDelete(false)
  }

  return (
    <div
      data-testid={`task-card-${task.id}`}
      className="flex items-center gap-3 h-[44px] px-3 rounded hover:bg-[var(--color-hover)] transition-colors duration-100 cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Priority badge */}
      <span
        data-testid="task-priority-badge"
        className="shrink-0 inline-flex items-center h-5 px-1.5 rounded text-[11px] font-medium"
        style={{ color: priority.color, backgroundColor: priority.bg }}
      >
        {priority.label}
      </span>

      {/* Title */}
      <span
        data-testid="task-title"
        className="flex-1 min-w-0 truncate text-[13px] font-medium text-[var(--color-text-primary)]"
      >
        {task.title}
      </span>

      {/* Due date */}
      {dueDateStr && (
        <span data-testid="task-due-date" className="shrink-0 text-[12px] text-[var(--color-text-muted)]">
          Due: {dueDateStr}
        </span>
      )}

      {/* Assignee */}
      {task.assignee && (
        <div data-testid="task-assignee" className="shrink-0 flex items-center gap-1.5">
          {task.assignee_avatar ? (
            <img
              src={task.assignee_avatar}
              alt={task.assignee}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center text-[9px] font-medium text-white">
              {getInitials(task.assignee)}
            </div>
          )}
          <span className="text-[12px] text-[var(--color-text-muted)]">
            {formatAssigneeName(task.assignee)}
            {task.assignee_role && ` (${task.assignee_role})`}
          </span>
        </div>
      )}

      {/* Action menu */}
      <div data-menu-area ref={menuRef} className="relative shrink-0">
        <button
          data-testid="task-action-menu"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen(!menuOpen)
            setConfirmDelete(false)
          }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--color-active)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <MoreHorizontal size={16} className="text-[var(--color-text-muted)]" />
        </button>
        {menuOpen && (
          <div
            data-testid="action-menu-dropdown"
            className="absolute right-0 top-full mt-1 w-[160px] bg-[var(--color-bg-base)] border border-[var(--color-bg-border)] rounded-lg shadow-[var(--shadow-elevation-2)] z-50 py-1"
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task.id}`); setMenuOpen(false) }}
              className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] cursor-pointer"
            >
              View Details
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task.id}`); setMenuOpen(false) }}
              className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] cursor-pointer"
            >
              Edit
            </button>
            {task.status === 'open' && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'completed'); setMenuOpen(false) }}
                  className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] cursor-pointer"
                >
                  Mark Complete
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'cancelled'); setMenuOpen(false) }}
                  className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] cursor-pointer"
                >
                  Cancel Task
                </button>
              </>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleDelete() }}
              className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--color-priority-high)] hover:bg-[var(--color-hover)] cursor-pointer"
            >
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
