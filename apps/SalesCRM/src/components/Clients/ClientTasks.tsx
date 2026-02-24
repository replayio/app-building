import { useNavigate } from 'react-router-dom'
import { Square } from 'lucide-react'
import type { ClientTask } from '../../store/slices/clientsSlice'
import { formatDueDate } from '../../lib/utils'

interface ClientTasksProps {
  tasks: ClientTask[]
  onTaskCompleted: () => void
}

export default function ClientTasks({ tasks, onTaskCompleted }: ClientTasksProps) {
  const navigate = useNavigate()

  async function handleCompleteTask(taskId: string) {
    try {
      const res = await fetch(`/.netlify/functions/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      if (res.ok) {
        onTaskCompleted()
      }
    } catch {
      // ignore
    }
  }

  return (
    <div data-testid="client-tasks" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold text-[var(--color-text-secondary)]">Tasks</h2>
        <span className="text-[12px] text-[var(--color-text-muted)]">Unresolved tasks</span>
      </div>

      {tasks.length === 0 ? (
        <div data-testid="client-tasks-empty" className="rounded-lg border border-[var(--color-bg-border)] p-6 text-center">
          <p className="text-[13px] text-[var(--color-text-muted)]">No unresolved tasks</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-bg-border)] divide-y divide-[var(--color-bg-border)]">
          {tasks.map((task) => (
            <div
              key={task.id}
              data-testid={`task-row-${task.id}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-hover)] transition-colors duration-100"
            >
              {/* Checkbox */}
              <button
                data-testid={`task-checkbox-${task.id}`}
                type="button"
                onClick={() => handleCompleteTask(task.id)}
                className="shrink-0 text-[var(--color-text-disabled)] hover:text-[var(--color-accent)] cursor-pointer"
              >
                <Square size={16} />
              </button>

              {/* Task info */}
              <div className="min-w-0 flex-1">
                <button
                  data-testid={`task-title-${task.id}`}
                  type="button"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="text-[13px] text-[var(--color-text-primary)] hover:text-[var(--color-accent)] cursor-pointer text-left"
                >
                  {task.title}
                </button>
              </div>

              {/* Due date and deal */}
              <div className="shrink-0 flex items-center gap-1 text-[12px] text-[var(--color-text-muted)]">
                {task.deal_name && (
                  <>
                    <span>Deal: &apos;{task.deal_name}&apos;</span>
                    <span className="mx-1">&middot;</span>
                  </>
                )}
                {task.due_date && (
                  <span>Due: {formatDueDate(task.due_date)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
