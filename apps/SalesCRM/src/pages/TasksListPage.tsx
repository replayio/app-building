import { useEffect, useState, useCallback } from 'react'
import { Plus, Download, Upload } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchTasks } from '../store/slices/tasksSlice'
import TasksFilterBar from '../components/Tasks/TasksFilterBar'
import TasksListContent from '../components/Tasks/TasksListContent'
import CreateTaskModal from '../components/Tasks/CreateTaskModal'
import ImportDialog from '../components/ImportDialog'

const taskImportColumns = [
  { name: 'Title', required: true, description: 'Task title (text)' },
  { name: 'Description', required: false, description: 'Task description (text)' },
  { name: 'Due Date', required: false, description: 'Due date (ISO format or date string)' },
  { name: 'Priority', required: false, description: 'high, medium, normal, or low' },
  { name: 'Client Name', required: false, description: 'Name of existing client' },
  { name: 'Assignee', required: false, description: 'Name of team member' },
]

export default function TasksListPage() {
  const dispatch = useAppDispatch()
  const { filterStatus } = useAppSelector((s) => s.tasks)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchTasks())
  }, [dispatch])

  const handleCreateTask = useCallback(
    async (data: {
      title: string
      description: string
      due_date: string
      priority: string
      client_id: string
      assignee_id: string
    }) => {
      const res = await fetch('/.netlify/functions/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create task')
      }
      dispatch(fetchTasks())
    },
    [dispatch],
  )

  const handleStatusChange = useCallback(
    async (taskId: string, status: 'completed' | 'cancelled') => {
      await fetch(`/.netlify/functions/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      dispatch(fetchTasks())
    },
    [dispatch],
  )

  const handleDelete = useCallback(
    async (taskId: string) => {
      await fetch(`/.netlify/functions/tasks/${taskId}`, {
        method: 'DELETE',
      })
      dispatch(fetchTasks())
    },
    [dispatch],
  )

  function handleExportCSV() {
    const params = new URLSearchParams()
    params.set('export', 'csv')
    if (filterStatus) params.set('status', filterStatus)
    const url = `/.netlify/functions/tasks?${params}`
    const a = document.createElement('a')
    a.href = url
    a.download = 'tasks.csv'
    a.click()
  }

  async function handleImport(rows: Array<Record<string, string>>) {
    const res = await fetch('/.netlify/functions/tasks/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: rows }),
    })
    const data = await res.json()
    dispatch(fetchTasks())
    return data
  }

  return (
    <div data-testid="tasks-list-page" className="p-6 max-sm:p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Upcoming Tasks</h1>
        <div className="flex items-center gap-2">
          <button
            data-testid="csv-import-button"
            type="button"
            onClick={() => setImportDialogOpen(true)}
            className="h-7 px-2 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer flex items-center gap-1"
          >
            <Upload size={14} />
            Import
          </button>
          <button
            data-testid="csv-export-button"
            type="button"
            onClick={handleExportCSV}
            className="h-7 px-2 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer flex items-center gap-1"
          >
            <Download size={14} />
            Export
          </button>
          <button
            data-testid="new-task-button"
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="h-7 px-3 rounded text-[13px] text-white bg-[var(--color-accent)] hover:opacity-90 cursor-pointer flex items-center gap-1"
          >
            <Plus size={14} />
            New Task
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-3">
        <TasksFilterBar />
      </div>

      {/* Task list */}
      <TasksListContent
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        entityName="Tasks"
        columns={taskImportColumns}
        onImport={handleImport}
      />
    </div>
  )
}
