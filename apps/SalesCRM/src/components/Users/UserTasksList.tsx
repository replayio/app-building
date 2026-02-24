import { useNavigate } from 'react-router-dom'
import type { UserTask } from '../../store/slices/usersSlice'
import { formatDueDate } from '../../lib/utils'

interface UserTasksListProps {
  tasks: UserTask[]
}

const priorityStyles: Record<string, { bg: string; text: string }> = {
  high: { bg: 'var(--color-priority-high-bg)', text: 'var(--color-priority-high)' },
  medium: { bg: 'var(--color-priority-medium-bg)', text: 'var(--color-priority-medium)' },
  low: { bg: 'var(--color-priority-low-bg)', text: 'var(--color-priority-low)' },
  normal: { bg: 'var(--color-priority-normal-bg)', text: 'var(--color-priority-normal)' },
}

export default function UserTasksList({ tasks }: UserTasksListProps) {
  const navigate = useNavigate()

  return (
    <div data-testid="user-tasks-section" className="mb-6">
      <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-3">Assigned Tasks</h2>
      {tasks.length === 0 ? (
        <p data-testid="user-tasks-empty" className="text-[13px] text-[var(--color-text-muted)] py-4">
          No assigned tasks yet
        </p>
      ) : (
        <div className="border border-[var(--color-bg-border)] rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-bg-border)] bg-[var(--color-bg-sidebar)]">
                <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Task</th>
                <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Priority</th>
                <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Status</th>
                <th className="text-left px-3 py-2 font-medium text-[var(--color-text-muted)]">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const pStyle = priorityStyles[task.priority] || priorityStyles.normal
                return (
                  <tr
                    key={task.id}
                    data-testid={`user-task-${task.id}`}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="border-b border-[var(--color-bg-border)] last:border-b-0 hover:bg-[var(--color-hover)] cursor-pointer"
                  >
                    <td className="px-3 py-2 text-[var(--color-text-primary)] font-medium">{task.title}</td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[12px] capitalize"
                        style={{ backgroundColor: pStyle.bg, color: pStyle.text }}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[var(--color-text-muted)] capitalize">{task.status}</td>
                    <td className="px-3 py-2 text-[var(--color-text-muted)]">
                      {task.due_date ? formatDueDate(task.due_date) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
