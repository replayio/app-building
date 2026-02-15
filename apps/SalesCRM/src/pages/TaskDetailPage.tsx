import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TaskDetailHeader } from '../components/task-detail/TaskDetailHeader'
import { TaskNotesSection } from '../components/task-detail/TaskNotesSection'
import { ConfirmDialog } from '../components/shared/ConfirmDialog'
import type { Task, TaskNote } from '../types'

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [notes, setNotes] = useState<TaskNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'complete' | 'cancel' | null>(null)

  const fetchTask = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/tasks/${taskId}`)
      if (!res.ok) {
        setError('Task not found')
        return
      }
      const data = await res.json()
      setTask(data.task)
      setNotes(data.notes)
    } catch {
      setError('Failed to load task')
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    fetchTask()
  }, [fetchTask])

  async function handleMarkComplete() {
    await fetch(`/.netlify/functions/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })
    setConfirmAction(null)
    await fetchTask()
  }

  async function handleMarkCanceled() {
    await fetch(`/.netlify/functions/tasks/${taskId}`, {
      method: 'DELETE',
    })
    setConfirmAction(null)
    navigate('/tasks')
  }

  async function handleAddNote(content: string) {
    const res = await fetch(`/.netlify/functions/tasks/${taskId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (res.ok) {
      await fetchTask()
    }
  }

  async function handleDeleteNote(noteId: string) {
    await fetch(`/.netlify/functions/tasks/${taskId}/notes/${noteId}`, {
      method: 'DELETE',
    })
    await fetchTask()
  }

  if (loading) {
    return (
      <div className="flex-1 p-6" data-testid="task-detail-loading">
        <div className="text-[13px] text-text-muted">Loading...</div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex-1 p-6" data-testid="task-detail-error">
        <div className="text-[13px] text-text-muted">{error ?? 'Task not found'}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6" data-testid="task-detail-page">
      <TaskDetailHeader
        task={task}
        onMarkComplete={() => setConfirmAction('complete')}
        onMarkCanceled={() => setConfirmAction('cancel')}
      />
      <TaskNotesSection
        notes={notes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
      />

      <ConfirmDialog
        open={confirmAction === 'complete'}
        title="Complete Task"
        message={`Mark "${task.title}" as completed?`}
        onConfirm={handleMarkComplete}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === 'cancel'}
        title="Cancel Task"
        message={`Delete "${task.title}"? This action cannot be undone.`}
        onConfirm={handleMarkCanceled}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
