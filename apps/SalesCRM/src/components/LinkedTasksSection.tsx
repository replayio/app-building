import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface LinkedTask {
  id: string
  title: string
  completed: boolean
  due_date: string | null
  updated_at: string
}

interface LinkedTasksSectionProps {
  dealId: string
  clientId: string
}

export default function LinkedTasksSection({ dealId, clientId }: LinkedTasksSectionProps) {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<LinkedTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [unlinkConfirm, setUnlinkConfirm] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/deals/${dealId}/tasks`)
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const toggleTask = async (task: LinkedTask) => {
    const newCompleted = !task.completed
    try {
      await fetch(`/.netlify/functions/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompleted }),
      })
      setTasks(prev =>
        prev.map(t => t.id === task.id ? { ...t, completed: newCompleted, updated_at: new Date().toISOString() } : t)
      )
    } catch {
      // silently fail
    }
  }

  const unlinkTask = async (taskId: string) => {
    try {
      await fetch(`/.netlify/functions/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: null }),
      })
      setUnlinkConfirm(null)
      fetchTasks()
    } catch {
      // silently fail
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="person-section" data-testid="linked-tasks-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <h2 data-testid="linked-tasks-heading">Linked Tasks</h2>
        </div>
        <div className="person-section-actions">
          <button
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
            data-testid="linked-tasks-add-button"
          >
            Add Task
          </button>
        </div>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : tasks.length > 0 ? (
        <div className="linked-tasks-list" data-testid="linked-tasks-list">
          {tasks.map(task => (
            <div key={task.id} className={`linked-task-item ${task.completed ? 'completed' : ''}`} data-testid="linked-task-item">
              <label className="linked-task-checkbox-label">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                  className="linked-task-checkbox"
                  data-testid="linked-task-checkbox"
                />
              </label>
              <button
                className={`linked-task-name ${task.completed ? 'completed' : ''}`}
                onClick={() => navigate(`/tasks`)}
                data-testid="linked-task-name"
              >
                {task.title}
              </button>
              <span className="linked-task-date" data-testid="linked-task-date">
                {task.completed
                  ? `Completed: ${formatDate(task.updated_at)}`
                  : task.due_date ? `Due: ${formatDate(task.due_date)}` : ''}
              </span>
              <button
                className="btn-ghost linked-task-remove"
                onClick={() => setUnlinkConfirm(task.id)}
                data-testid="linked-task-remove-button"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="person-section-empty" data-testid="linked-tasks-empty">
          No tasks linked to this deal
        </div>
      )}

      {showAddForm && (
        <AddTaskModal
          dealId={dealId}
          clientId={clientId}
          onClose={() => setShowAddForm(false)}
          onSaved={() => { setShowAddForm(false); fetchTasks() }}
        />
      )}

      {unlinkConfirm && (
        <div className="modal-overlay" data-testid="linked-task-unlink-confirm">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Remove Task</h3>
            </div>
            <p style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Remove this task from the deal?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setUnlinkConfirm(null)} data-testid="linked-task-unlink-cancel">Cancel</button>
              <button className="btn-danger" onClick={() => unlinkTask(unlinkConfirm)} data-testid="linked-task-unlink-confirm-button">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface AddTaskModalProps {
  dealId: string
  clientId: string
  onClose: () => void
  onSaved: () => void
}

function AddTaskModal({ dealId, clientId, onClose, onSaved }: AddTaskModalProps) {
  const [taskName, setTaskName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    if (!taskName.trim()) newErrors.title = 'Task name is required'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/.netlify/functions/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskName.trim(),
          deal_id: dealId,
          client_id: clientId,
          due_date: dueDate || null,
        }),
      })
      if (res.ok) {
        onSaved()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" data-testid="add-task-modal">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Task</h3>
          <button className="modal-close" onClick={onClose} data-testid="add-task-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-form">
          <div className="form-field">
            <label className="form-label">Task Name *</label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              value={taskName}
              onChange={e => { setTaskName(e.target.value); setErrors({}) }}
              placeholder="Enter task name..."
              data-testid="add-task-name-input"
            />
            {errors.title && <span className="form-error" data-testid="add-task-name-error">{errors.title}</span>}
          </div>

          <div className="form-field">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              data-testid="add-task-due-date-input"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} data-testid="add-task-cancel">Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving} data-testid="add-task-save">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
