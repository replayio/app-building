import { Square, CheckSquare, Plus } from 'lucide-react'
import type { Task } from '../../types'

interface LinkedTasksSectionProps {
  tasks: Task[]
  onAddTask: () => void
  onToggleTask: (taskId: string, completed: boolean) => void
}

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 86400000)
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (taskDate.getTime() === today.getTime()) return 'Today'
  if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function LinkedTasksSection({ tasks, onAddTask, onToggleTask }: LinkedTasksSectionProps) {
  return (
    <div className="border border-border rounded-[6px] p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold text-text-primary">Linked Tasks</h2>
        <button
          onClick={onAddTask}
          className="inline-flex items-center gap-1 h-[28px] px-2.5 text-[12px] font-medium text-accent hover:bg-hover rounded-[4px] transition-colors duration-100"
        >
          <Plus size={14} strokeWidth={1.75} />
          Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-[13px] text-text-muted py-2">No linked tasks</div>
      ) : (
        <div className="flex flex-col gap-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[4px] hover:bg-hover transition-colors duration-100"
            >
              <button
                onClick={() => onToggleTask(task.id, !task.completed)}
                className="flex-shrink-0 text-text-muted hover:text-status-active transition-colors duration-100"
              >
                {task.completed ? (
                  <CheckSquare size={16} strokeWidth={1.75} />
                ) : (
                  <Square size={16} strokeWidth={1.75} />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-[13px] ${
                    task.completed ? 'text-text-muted line-through' : 'text-text-primary'
                  }`}
                >
                  {task.title}
                </span>
                {task.due_date && (
                  <span className="text-[12px] text-text-muted ml-2">
                    · {task.completed ? 'Completed' : `Due: ${formatDueDate(task.due_date)}`}
                  </span>
                )}
                {task.completed && task.completed_at && (
                  <span className="text-[12px] text-text-muted ml-1">
                    {new Date(task.completed_at).toLocaleDateString()}
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
