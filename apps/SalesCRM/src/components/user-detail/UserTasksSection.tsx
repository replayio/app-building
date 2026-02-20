import { Link } from 'react-router-dom'
import { CheckSquare } from 'lucide-react'

interface UserTask {
  id: string
  title: string
  client_name: string | null
  deal_name: string | null
  due_date: string | null
  priority: string
  completed: boolean
}

interface UserTasksSectionProps {
  tasks: UserTask[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function UserTasksSection({ tasks }: UserTasksSectionProps) {
  return (
    <div data-testid="user-tasks-section" className="border border-border rounded-[6px] bg-surface">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <CheckSquare size={14} strokeWidth={1.75} className="text-text-muted" />
        <h2 className="text-[14px] font-semibold text-text-primary">Tasks ({tasks.length})</h2>
      </div>
      <div className="px-5 py-4">
        {tasks.length === 0 ? (
          <p className="text-[13px] text-text-muted text-center py-4">No tasks assigned to this user.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                data-testid={`user-task-${task.id}`}
                className="flex items-center justify-between py-2 px-3 rounded-[5px] hover:bg-hover transition-colors duration-100"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${task.completed ? 'bg-status-active' : 'border border-border'}`} />
                  <div>
                    <div className={`text-[13px] font-medium ${task.completed ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                      {task.title}
                    </div>
                    {task.client_name && (
                      <div className="text-[12px] text-text-muted">{task.client_name}</div>
                    )}
                  </div>
                </div>
                <div className="text-[12px] text-text-muted">
                  {task.due_date ? formatDate(task.due_date) : '—'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
