import { ArrowLeft } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import type { Task } from '../../types'
import { TaskPriorityBadge } from '../tasks/TaskPriorityBadge'

interface TaskDetailHeaderProps {
  task: Task
  onMarkComplete: () => void
  onMarkCanceled: () => void
}

export function TaskDetailHeader({ task, onMarkComplete, onMarkCanceled }: TaskDetailHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="border border-border rounded-[6px] p-4 mb-4" data-testid="task-detail-header">
      <div className="flex items-center gap-2 mb-3">
        <button
          data-testid="task-detail-back"
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
          title="Back to tasks"
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
        </button>
        <h1 className="text-[18px] max-sm:text-[16px] font-semibold text-text-primary flex-1 min-w-0 break-words" data-testid="task-detail-title">
          {task.title}
        </h1>
        <TaskPriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-[13px] text-text-secondary mb-3 ml-9 max-sm:ml-0" data-testid="task-detail-description">
          {task.description}
        </p>
      )}

      <div className="task-detail-meta ml-9 max-sm:ml-0 text-[12px] text-text-muted">
        {task.due_date && (
          <span data-testid="task-detail-due-date">
            Due: {new Date(task.due_date).toLocaleDateString()} {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        {task.assignee_name && (
          <span data-testid="task-detail-assignee">
            Assignee: {task.assignee_name}{task.assignee_role ? ` (${task.assignee_role})` : ''}
          </span>
        )}
        {task.client_name && (
          <span data-testid="task-detail-client">Client: {task.client_id ? (
            <Link to={`/clients/${task.client_id}`} className="text-accent hover:underline" data-testid="task-detail-client-link">{task.client_name}</Link>
          ) : task.client_name}</span>
        )}
        {task.deal_name && (
          <span data-testid="task-detail-deal">Deal: {task.deal_id ? (
            <Link to={`/deals/${task.deal_id}`} className="text-accent hover:underline" data-testid="task-detail-deal-link">{task.deal_name}</Link>
          ) : task.deal_name}</span>
        )}
      </div>

      <div className="flex items-center gap-4 ml-9 max-sm:ml-0 mt-3">
        <span
          data-testid="task-detail-status"
          className={`text-[12px] font-medium px-2 py-0.5 rounded-[4px] ${
            task.completed
              ? 'bg-green-50 text-green-700'
              : 'bg-blue-50 text-blue-700'
          }`}
        >
          {task.completed ? 'Completed' : 'Open'}
        </span>
        {task.completed_at && (
          <span className="text-[12px] text-text-muted" data-testid="task-detail-completed-at">
            Completed: {new Date(task.completed_at).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 ml-9 max-sm:ml-0 max-sm:flex-col max-sm:items-stretch flex-wrap">
        {!task.completed && (
          <>
            <button
              data-testid="task-detail-mark-complete"
              onClick={onMarkComplete}
              className="h-[30px] px-3 text-[12px] font-medium bg-accent text-white rounded-[5px] hover:opacity-90 transition-opacity duration-100"
            >
              Mark Complete
            </button>
            <button
              data-testid="task-detail-mark-canceled"
              onClick={onMarkCanceled}
              className="h-[30px] px-3 text-[12px] font-medium border border-border text-text-secondary rounded-[5px] hover:bg-hover transition-colors duration-100"
            >
              Cancel Task
            </button>
          </>
        )}
      </div>
    </div>
  )
}
