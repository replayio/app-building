import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAppDispatch } from '@/store/hooks'
import { createTask, fetchTasks } from '@/store/tasksSlice'
import TaskFormModal from './TaskFormModal'

export default function TasksHeader() {
  const dispatch = useAppDispatch()
  const [addOpen, setAddOpen] = useState(false)

  const handleCreate = async (data: {
    title: string
    due_date: string
    priority: string
    assignee: string
    assignee_role: string
    client_id: string
    deal_id: string
  }) => {
    await dispatch(createTask({
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

  return (
    <div className="page-header" data-testid="tasks-header">
      <h1 className="page-title">Upcoming Tasks</h1>
      <button
        className="btn-primary"
        onClick={() => setAddOpen(true)}
        data-testid="new-task-button"
      >
        <Plus size={14} />
        <span>New Task</span>
      </button>
      <TaskFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
        title="New Task"
      />
    </div>
  )
}
