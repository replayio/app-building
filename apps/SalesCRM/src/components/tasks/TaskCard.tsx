import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, User } from 'lucide-react'
import type { Task } from '../../types'
import { TaskPriorityBadge } from './TaskPriorityBadge'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
  onEdit: (task: Task) => void
  onMarkComplete: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskCard({ task, onClick, onEdit, onMarkComplete, onDelete }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function formatDueDate(dateStr: string | null): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (taskDate.getTime() === today.getTime()) {
      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      return `Due: Today, ${timeStr}`
    }
    if (taskDate.getTime() === tomorrow.getTime()) {
      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      return `Due: Tomorrow, ${timeStr}`
    }
    return `Due: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  return (
    <div
      data-testid={`task-card-${task.id}`}
      className="border border-border rounded-[6px] bg-surface px-5 max-sm:px-3 py-4 hover:shadow-[var(--shadow-elevation-1)] transition-shadow duration-150 cursor-pointer"
      onClick={() => onClick(task)}
    >
      <div className="flex items-center gap-4 max-md:gap-3">
        <TaskPriorityBadge priority={task.priority} />

        <div className="flex-1 min-w-0">
          <div data-testid={`task-title-${task.id}`} className="text-[14px] font-medium text-text-primary leading-snug">
            {task.title}
          </div>
          <div className="hidden max-sm:flex items-center gap-2 mt-1 flex-wrap">
            {task.due_date && (
              <span data-testid={`task-due-date-mobile-${task.id}`} className="text-[12px] text-text-muted">
                {formatDueDate(task.due_date)}
              </span>
            )}
            {task.assignee_name && (
              <span className="text-[12px] text-text-muted">
                · {task.assignee_name}
              </span>
            )}
          </div>
          {task.assignee_name && (
            <div className="hidden max-md:flex max-sm:hidden items-center gap-1 mt-1">
              <span className="text-[12px] text-text-muted">
                {task.assignee_name}
              </span>
            </div>
          )}
        </div>

        <div data-testid={`task-due-date-${task.id}`} className="text-[13px] text-text-muted whitespace-nowrap flex-shrink-0 max-sm:hidden">
          {formatDueDate(task.due_date)}
        </div>

        {task.assignee_name && (
          <div data-testid={`task-assignee-${task.id}`} className="flex items-center gap-2 flex-shrink-0 max-md:hidden">
            <div className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center max-lg:hidden">
              <User size={14} strokeWidth={1.75} className="text-text-muted" />
            </div>
            <span className="text-[13px] text-text-primary whitespace-nowrap">
              {task.assignee_name}
              <span className="max-lg:hidden">{task.assignee_role ? ` (${task.assignee_role})` : ''}</span>
            </span>
          </div>
        )}

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            data-testid={`task-action-menu-button-${task.id}`}
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] hover:bg-hover transition-colors duration-100 text-text-muted"
          >
            <MoreHorizontal size={16} strokeWidth={1.75} />
          </button>

          {menuOpen && (
            <div data-testid={`task-action-menu-${task.id}`} className="absolute right-0 top-full mt-1 w-[140px] bg-surface border border-border rounded-[6px] shadow-[var(--shadow-elevation-2)] z-50 py-1">
              <button
                data-testid={`task-action-edit-${task.id}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onEdit(task)
                }}
                className="w-full text-left px-3 py-1.5 text-[13px] text-text-secondary hover:bg-hover transition-colors duration-100"
              >
                Edit
              </button>
              <button
                data-testid={`task-action-complete-${task.id}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onMarkComplete(task)
                }}
                className="w-full text-left px-3 py-1.5 text-[13px] text-text-secondary hover:bg-hover transition-colors duration-100"
              >
                Mark Complete
              </button>
              <button
                data-testid={`task-action-delete-${task.id}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onDelete(task)
                }}
                className="w-full text-left px-3 py-1.5 text-[13px] text-status-churned hover:bg-hover transition-colors duration-100"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
