import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchTasks, createTask, updateTask, deleteTask } from '../store/tasksSlice'
import { TasksPageHeader } from '../components/tasks/TasksPageHeader'
import { TasksFilterBar } from '../components/tasks/TasksFilterBar'
import { TaskCard } from '../components/tasks/TaskCard'
import { CreateTaskModal } from '../components/tasks/CreateTaskModal'
import { EditTaskModal } from '../components/tasks/EditTaskModal'
import { ConfirmDialog } from '../components/shared/ConfirmDialog'
import { ImportDialog } from '../components/shared/ImportDialog'
import type { Task, TaskPriority } from '../types'

export function TasksListPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, loading, availableAssignees, availableClients } = useAppSelector(
    (state) => state.tasks
  )

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Task | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  // All clients for the create modal
  const [allClients, setAllClients] = useState<{ id: string; name: string }[]>([])
  const [allDeals, setAllDeals] = useState<{ id: string; name: string; client_id: string }[]>([])

  const loadTasks = useCallback(() => {
    dispatch(
      fetchTasks({
        search: search || undefined,
        priority: priorityFilter || undefined,
        assignee: assigneeFilter || undefined,
        clientId: clientFilter || undefined,
      })
    )
  }, [dispatch, search, priorityFilter, assigneeFilter, clientFilter])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Fetch all clients and deals for create modal
  useEffect(() => {
    fetch('/.netlify/functions/clients?pageSize=1000')
      .then((res) => res.json())
      .then((data: { clients: { id: string; name: string }[] }) => {
        setAllClients(data.clients.map((c) => ({ id: c.id, name: c.name })))
      })
      .catch(() => {})

    fetch('/.netlify/functions/deals?pageSize=1000')
      .then((res) => res.json())
      .then((data: { deals: { id: string; name: string; client_id: string }[] }) => {
        setAllDeals(data.deals.map((d) => ({ id: d.id, name: d.name, client_id: d.client_id })))
      })
      .catch(() => {})
  }, [])

  function handleCreateTask(data: {
    title: string
    description: string
    due_date: string
    priority: TaskPriority
    assignee_name: string
    assignee_role: string
    client_id: string
    deal_id: string
  }) {
    const payload: Record<string, unknown> = { title: data.title }
    if (data.description) payload.description = data.description
    if (data.due_date) payload.due_date = data.due_date
    if (data.priority) payload.priority = data.priority
    if (data.assignee_name) payload.assignee_name = data.assignee_name
    if (data.assignee_role) payload.assignee_role = data.assignee_role
    if (data.client_id) payload.client_id = data.client_id
    if (data.deal_id) payload.deal_id = data.deal_id

    dispatch(createTask(payload as Parameters<typeof createTask>[0])).then(() => {
      setCreateModalOpen(false)
      loadTasks()
    })
  }

  function handleEditTask(taskId: string, data: {
    title: string
    description: string
    due_date: string
    priority: TaskPriority
    assignee_name: string
    assignee_role: string
  }) {
    const payload: Record<string, unknown> = {}
    if (data.title) payload.title = data.title
    if (data.description !== undefined) payload.description = data.description
    if (data.due_date !== undefined) payload.due_date = data.due_date
    if (data.priority) payload.priority = data.priority
    if (data.assignee_name !== undefined) payload.assignee_name = data.assignee_name
    if (data.assignee_role !== undefined) payload.assignee_role = data.assignee_role

    dispatch(updateTask({ taskId, data: payload as Parameters<typeof updateTask>[0]['data'] })).then(() => {
      setEditTask(null)
      loadTasks()
    })
  }

  function handleMarkComplete(task: Task) {
    dispatch(updateTask({ taskId: task.id, data: { completed: true } })).then(() => {
      loadTasks()
    })
  }

  function handleDeleteTask() {
    if (!deleteConfirm) return
    dispatch(deleteTask(deleteConfirm.id)).then(() => {
      setDeleteConfirm(null)
    })
  }

  function handleTaskClick(task: Task) {
    navigate(`/tasks/${task.id}`)
  }

  return (
    <div className="p-6">
      <TasksPageHeader onCreateTask={() => setCreateModalOpen(true)} onImport={() => setImportDialogOpen(true)} />

      <TasksFilterBar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        clientFilter={clientFilter}
        onClientChange={setClientFilter}
        availableAssignees={availableAssignees}
        availableClients={availableClients}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12 text-[13px] text-text-muted">
          Loading tasks...
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-[13px] text-text-muted">
          No upcoming tasks found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={handleTaskClick}
              onEdit={setEditTask}
              onMarkComplete={handleMarkComplete}
              onDelete={setDeleteConfirm}
            />
          ))}
        </div>
      )}

      <CreateTaskModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateTask}
        availableClients={allClients}
        availableDeals={allDeals}
      />

      <EditTaskModal
        open={editTask !== null}
        task={editTask}
        onClose={() => setEditTask(null)}
        onSave={handleEditTask}
      />

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteConfirm(null)}
      />

      {importDialogOpen && (
        <ImportDialog
          entityName="Task"
          entityNamePlural="Tasks"
          columns={TASK_CSV_COLUMNS}
          headerMap={TASK_HEADER_MAP}
          templateFilename="tasks-import-template.csv"
          templateExample="Follow up with client,Review Q1 proposal details,2024-03-15,high,Acme Corp,Jane Smith"
          apiEndpoint="/.netlify/functions/tasks?action=import"
          apiBodyKey="tasks"
          onClose={() => setImportDialogOpen(false)}
          onImported={loadTasks}
        />
      )}
    </div>
  )
}

const TASK_CSV_COLUMNS = [
  { name: 'Title', required: true, description: 'Task title' },
  { name: 'Description', required: false, description: 'Task description' },
  { name: 'Due Date', required: false, description: 'Date in YYYY-MM-DD format' },
  { name: 'Priority', required: false, description: '"high", "medium", "low", or "normal" (default: normal)' },
  { name: 'Client Name', required: false, description: 'Name of an existing client to associate' },
  { name: 'Assignee', required: false, description: 'Name of the person assigned' },
]

const TASK_HEADER_MAP: Record<string, string> = {
  'title': 'title',
  'description': 'description',
  'due date': 'due_date',
  'due_date': 'due_date',
  'priority': 'priority',
  'client name': 'client_name',
  'client_name': 'client_name',
  'client': 'client_name',
  'assignee': 'assignee_name',
  'assignee name': 'assignee_name',
  'assignee_name': 'assignee_name',
}
