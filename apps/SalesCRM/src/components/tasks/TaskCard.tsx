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

  function getAssigneeDisplay(): string {
    if (!task.assignee_name) return ''
    if (task.assignee_role) {
      return `${task.assignee_name} (${task.assignee_role})`
    }
    return task.assignee_name
  }

  return (
    <div
      className="border border-border rounded-[6px] bg-surface px-5 py-4 hover:shadow-[var(--shadow-elevation-1)] transition-shadow duration-150 cursor-pointer"
      onClick={() => onClick(task)}
    >
      <div className="flex items-center gap-4">
        <TaskPriorityBadge priority={task.priority} />

        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium text-text-primary leading-snug">
            {task.title}
          </div>
        </div>

        <div className="text-[13px] text-text-muted whitespace-nowrap flex-shrink-0">
          {formatDueDate(task.due_date)}
        </div>

        {task.assignee_name && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center">
              <User size={14} strokeWidth={1.75} className="text-text-muted" />
            </div>
            <span className="text-[13px] text-text-primary whitespace-nowrap">
              {getAssigneeDisplay()}
            </span>
          </div>
        )}

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] hover:bg-hover transition-colors duration-100 text-text-muted"
          >
            <MoreHorizontal size={16} strokeWidth={1.75} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-[140px] bg-surface border border-border rounded-[6px] shadow-[var(--shadow-elevation-2)] z-50 py-1">
              <button
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
