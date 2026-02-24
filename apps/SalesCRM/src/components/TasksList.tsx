import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Eye, Pencil, CheckCircle, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { deleteTask, updateTask, fetchTasks, type TaskRow } from '@/store/tasksSlice'
import TaskFormModal from './TaskFormModal'

const priorityClasses: Record<string, string> = {
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
  Normal: 'priority-normal',
}

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  if (date.toDateString() === today.toDateString()) return `Due: Today, ${time}`
  if (date.toDateString() === tomorrow.toDateString()) return `Due: Tomorrow, ${time}`
  return `Due: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

function abbreviateName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return fullName
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?'
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function TaskActionMenu({ task, onEdit, onComplete, onDelete }: {
  task: TaskRow
  onEdit: () => void
  onComplete: () => void
  onDelete: () => void
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="row-action-wrapper" ref={ref}>
      <button
        className="row-action-trigger"
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        data-testid={`task-actions-${task.id}`}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="row-action-menu" data-testid={`task-action-menu-${task.id}`}>
          {task.client_id && (
            <button
              className="row-action-item"
              onClick={() => { setOpen(false); navigate(`/clients/${task.client_id}`) }}
              data-testid={`task-action-view-${task.id}`}
            >
              <Eye size={14} />
              <span>View Details</span>
            </button>
          )}
          <button
            className="row-action-item"
            onClick={() => { setOpen(false); onEdit() }}
            data-testid={`task-action-edit-${task.id}`}
          >
            <Pencil size={14} />
            <span>Edit</span>
          </button>
          <button
            className="row-action-item"
            onClick={() => { setOpen(false); onComplete() }}
            data-testid={`task-action-complete-${task.id}`}
          >
            <CheckCircle size={14} />
            <span>Mark as Complete</span>
          </button>
          <button
            className="row-action-item danger"
            onClick={() => { setOpen(false); onDelete() }}
            data-testid={`task-action-delete-${task.id}`}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}

function DeleteConfirmModal({ open, taskTitle, onConfirm, onCancel }: {
  open: boolean
  taskTitle: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onCancel} data-testid="task-delete-confirm-modal">
      <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Delete Task</h2>
        <p className="modal-text" data-testid="task-delete-confirm-message">
          Are you sure you want to delete this task?
        </p>
        <p className="modal-text" style={{ fontWeight: 500 }}>{taskTitle}</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel} data-testid="task-delete-cancel">
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} data-testid="task-delete-confirm">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function filterTasks(tasks: TaskRow[], filterType: string, filterText: string): TaskRow[] {
  if (!filterText.trim()) return tasks
  const q = filterText.toLowerCase()

  return tasks.filter(task => {
    switch (filterType) {
      case 'priority':
        return task.priority.toLowerCase().includes(q)
      case 'assignee':
        return (task.assignee || '').toLowerCase().includes(q)
      case 'client':
        return (task.client_name || '').toLowerCase().includes(q)
      case 'due_date':
        return formatDueDate(task.due_date).toLowerCase().includes(q)
      case 'all':
      default:
        return (
          task.title.toLowerCase().includes(q) ||
          task.priority.toLowerCase().includes(q) ||
          (task.assignee || '').toLowerCase().includes(q) ||
          (task.client_name || '').toLowerCase().includes(q) ||
          formatDueDate(task.due_date).toLowerCase().includes(q)
        )
    }
  })
}

export default function TasksList() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const items = useAppSelector(s => s.tasks.items)
  const loading = useAppSelector(s => s.tasks.loading)
  const filterType = useAppSelector(s => s.tasks.filterType)
  const filterText = useAppSelector(s => s.tasks.filterText)
  const [editTask, setEditTask] = useState<TaskRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TaskRow | null>(null)

  const filtered = filterTasks(items, filterType, filterText)

  const handleUpdate = async (data: {
    title: string
    due_date: string
    priority: string
    assignee: string
    assignee_role: string
    client_id: string
    deal_id: string
  }) => {
    if (!editTask) return
    await dispatch(updateTask({
      id: editTask.id,
      title: data.title,
      due_date: data.due_date || undefined,
      priority: data.priority,
      assignee: data.assignee || undefined,
      assignee_role: data.assignee_role || undefined,
      client_id: data.client_id || undefined,
      deal_id: data.deal_id || undefined,
    })).unwrap()
    await dispatch(fetchTasks())
  }

  const handleComplete = async (task: TaskRow) => {
    await dispatch(updateTask({ id: task.id, completed: true })).unwrap()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await dispatch(deleteTask(deleteTarget.id)).unwrap()
    setDeleteTarget(null)
  }

  if (loading) {
    return (
      <div className="tasks-empty" data-testid="tasks-list-loading">
        <p>Loading tasks...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="tasks-empty" data-testid="tasks-list-empty">
        <p className="empty-title">No upcoming tasks</p>
        <p className="empty-subtitle">No upcoming tasks. Create a new task to get started.</p>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="tasks-empty" data-testid="tasks-list-no-results">
        <p className="empty-title">No tasks found</p>
        <p className="empty-subtitle">No tasks match your current filter.</p>
      </div>
    )
  }

  return (
    <>
      <div className="tasks-list" data-testid="tasks-list">
        {filtered.map(task => (
          <div
            key={task.id}
            className="task-card"
            data-testid={`task-card-${task.id}`}
          >
            <span
              className={`priority-badge ${priorityClasses[task.priority] || 'priority-normal'}`}
              data-testid={`task-priority-${task.id}`}
            >
              {task.priority}
            </span>
            <button
              className="task-name"
              onClick={() => { if (task.client_id) navigate(`/clients/${task.client_id}`) }}
              data-testid={`task-name-${task.id}`}
            >
              {task.title}
            </button>
            <span className="task-due-date" data-testid={`task-due-date-${task.id}`}>
              {task.due_date ? formatDueDate(task.due_date) : ''}
            </span>
            <div className="task-assignee" data-testid={`task-assignee-${task.id}`}>
              {task.assignee && (
                <>
                  <span className="task-assignee-avatar">{getInitials(task.assignee)}</span>
                  <span className="task-assignee-name">
                    {abbreviateName(task.assignee)}
                    {task.assignee_role && ` (${task.assignee_role})`}
                  </span>
                </>
              )}
            </div>
            <div className="task-card-action">
              <TaskActionMenu
                task={task}
                onEdit={() => setEditTask(task)}
                onComplete={() => handleComplete(task)}
                onDelete={() => setDeleteTarget(task)}
              />
            </div>
          </div>
        ))}
      </div>

      <TaskFormModal
        open={!!editTask}
        onClose={() => setEditTask(null)}
        onSubmit={handleUpdate}
        title="Edit Task"
        initial={editTask ? {
          title: editTask.title,
          due_date: editTask.due_date || '',
          priority: editTask.priority,
          assignee: editTask.assignee || '',
          assignee_role: editTask.assignee_role || '',
          client_id: editTask.client_id || '',
          deal_id: editTask.deal_id || '',
        } : undefined}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        taskTitle={deleteTarget?.title || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
