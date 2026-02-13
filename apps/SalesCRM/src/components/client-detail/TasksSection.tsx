import { useNavigate } from 'react-router-dom'
import { Square, CheckSquare } from 'lucide-react'
import type { Task } from '../../types'

interface TasksSectionProps {
  tasks: Task[]
  onToggleTask: (taskId: string, completed: boolean) => void
}

export function TasksSection({ tasks, onToggleTask }: TasksSectionProps) {
  const navigate = useNavigate()

  function formatDueDate(dateStr: string | null): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 86400000)
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (taskDate.getTime() === today.getTime()) return 'Today'
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow'

    const diff = taskDate.getTime() - today.getTime()
    const days = Math.round(diff / 86400000)
    if (days > 0 && days <= 7) return 'Next Week'
    return date.toLocaleDateString()
  }

  return (
    <div className="border border-border rounded-[6px] p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold text-text-primary">Tasks</h2>
        <span className="text-[12px] text-text-muted">Unresolved tasks</span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-[13px] text-text-muted py-2">No unresolved tasks</div>
      ) : (
        <div className="flex flex-col gap-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[4px] hover:bg-hover transition-colors duration-100 cursor-pointer group"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onToggleTask(task.id, true) }}
                className="flex-shrink-0 text-text-muted hover:text-status-active transition-colors duration-100"
              >
                {task.completed ? (
                  <CheckSquare size={16} strokeWidth={1.75} />
                ) : (
                  <Square size={16} strokeWidth={1.75} />
                )}
              </button>
              <div
                className="flex-1 min-w-0"
                onClick={() => {
                  if (task.deal_id) {
                    navigate(`/deals/${task.deal_id}`)
                  }
                }}
              >
                <span className="text-[13px] text-text-primary">{task.title}</span>
                {task.due_date && (
                  <span className="text-[12px] text-text-muted ml-2">
                    · Due: {formatDueDate(task.due_date)}
                  </span>
                )}
                {task.deal_name && (
                  <span className="text-[12px] text-text-muted ml-1">
                    , Deal: &apos;{task.deal_name}&apos;
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
