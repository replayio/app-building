import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface ClientTask {
  id: string
  title: string
  due_date: string | null
  priority: string
  deal_name: string | null
  completed: boolean
  updated_at: string
}

interface ClientTasksSectionFullProps {
  clientId: string
  refreshKey?: number
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff === 0) return 'Due: Today'
  if (diff === 1) return 'Due: Tomorrow'
  if (diff > 1 && diff <= 7) return 'Due: Next Week'
  if (diff < 0) return `Due: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (overdue)`
  return `Due: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export default function ClientTasksSectionFull({ clientId, refreshKey }: ClientTasksSectionFullProps) {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<ClientTask[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/tasks?client_id=${clientId}`)
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks, refreshKey])

  const toggleTask = async (task: ClientTask) => {
    const newCompleted = !task.completed
    try {
      await fetch(`/.netlify/functions/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompleted }),
      })
      setTasks(prev =>
        prev.map(t => t.id === task.id
          ? { ...t, completed: newCompleted, updated_at: new Date().toISOString() }
          : t
        )
      )
    } catch {
      // silently fail
    }
  }

  const unresolvedTasks = tasks.filter(t => !t.completed)

  return (
    <div className="person-section" data-testid="tasks-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="m16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.854z"/>
          </svg>
          <h2 data-testid="tasks-heading">Tasks</h2>
        </div>
        <span className="source-info-label" data-testid="tasks-unresolved-label">Unresolved tasks</span>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : unresolvedTasks.length > 0 ? (
        <div className="linked-tasks-list" data-testid="tasks-list">
          {unresolvedTasks.map(task => (
            <div key={task.id} className="linked-task-item" data-testid="task-item">
              <label className="linked-task-checkbox-label">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                  className="linked-task-checkbox"
                  data-testid="task-checkbox"
                />
              </label>
              <button
                className="linked-task-name"
                onClick={() => navigate('/tasks')}
                data-testid="task-name"
              >
                {task.title}
              </button>
              <span className="linked-task-date" data-testid="task-due-date">
                {formatRelativeDate(task.due_date)}
              </span>
              {task.deal_name && (
                <span className="client-task-deal" data-testid="task-deal-association">
                  Deal: {task.deal_name}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="person-section-empty" data-testid="tasks-empty">
          No tasks for this client
        </div>
      )}
    </div>
  )
}
