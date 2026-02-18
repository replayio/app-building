import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchClient, updateClient } from '../store/clientsSlice'
import { ClientHeader } from '../components/client-detail/ClientHeader'
import { QuickActions } from '../components/client-detail/QuickActions'
import { SourceInfoSection } from '../components/client-detail/SourceInfoSection'
import { TasksSection } from '../components/client-detail/TasksSection'
import { DealsSection } from '../components/client-detail/DealsSection'
import { AttachmentsSection } from '../components/client-detail/AttachmentsSection'
import { PeopleSection } from '../components/client-detail/PeopleSection'
import { TimelineSection } from '../components/client-detail/TimelineSection'
import { AddTaskModal } from '../components/client-detail/AddTaskModal'
import { AddDealModal } from '../components/client-detail/AddDealModal'
import { AddAttachmentModal } from '../components/client-detail/AddAttachmentModal'
import { AddPersonModal } from '../components/client-detail/AddPersonModal'
import { ConfirmDialog } from '../components/shared/ConfirmDialog'
import type { Task, Deal, Attachment, TimelineEvent } from '../types'

interface Person {
  id: string
  name: string
  title: string | null
  role: string | null
  is_primary: boolean
}

export function ClientDetailPage() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentClient, loading } = useAppSelector((state) => state.clients)

  const [tasks, setTasks] = useState<Task[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])

  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [addDealOpen, setAddDealOpen] = useState(false)
  const [addAttachmentOpen, setAddAttachmentOpen] = useState(false)
  const [addPersonOpen, setAddPersonOpen] = useState(false)
  const [deleteAttachmentId, setDeleteAttachmentId] = useState<string | null>(null)
  const [availableUsers, setAvailableUsers] = useState<{ name: string }[]>([])

  useEffect(() => {
    fetch('/.netlify/functions/users')
      .then(r => r.json())
      .then((data: { users: { name: string }[] }) => setAvailableUsers(data.users))
      .catch(() => {})
  }, [])

  const loadClientData = useCallback(async () => {
    if (!clientId) return

    const [tasksRes, dealsRes, attachmentsRes, peopleRes, timelineRes] = await Promise.all([
      fetch(`/.netlify/functions/client-tasks?clientId=${clientId}`),
      fetch(`/.netlify/functions/client-deals?clientId=${clientId}`),
      fetch(`/.netlify/functions/client-attachments?clientId=${clientId}`),
      fetch(`/.netlify/functions/client-people?clientId=${clientId}`),
      fetch(`/.netlify/functions/client-timeline?clientId=${clientId}`),
    ])

    if (tasksRes.ok) {
      const data = await tasksRes.json() as { tasks: Task[] }
      setTasks(data.tasks)
    }
    if (dealsRes.ok) {
      const data = await dealsRes.json() as { deals: Deal[] }
      setDeals(data.deals)
    }
    if (attachmentsRes.ok) {
      const data = await attachmentsRes.json() as { attachments: Attachment[] }
      setAttachments(data.attachments)
    }
    if (peopleRes.ok) {
      const data = await peopleRes.json() as { people: Person[] }
      setPeople(data.people)
    }
    if (timelineRes.ok) {
      const data = await timelineRes.json() as { events: TimelineEvent[] }
      setTimeline(data.events)
    }
  }, [clientId])

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClient(clientId))
      loadClientData()
    }
  }, [clientId, dispatch, loadClientData])

  function handleUpdateClient(data: Record<string, unknown>) {
    if (!clientId) return
    dispatch(updateClient({ clientId, data })).then(() => {
      loadClientData()
    })
  }

  async function handleAddTask(data: {
    title: string
    description: string
    due_date: string
    priority: string
    deal_id: string
  }) {
    if (!clientId) return
    const res = await fetch('/.netlify/functions/client-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        client_id: clientId,
        deal_id: data.deal_id || null,
      }),
    })
    if (res.ok) {
      setAddTaskOpen(false)
      loadClientData()
    }
  }

  async function handleAddDeal(data: {
    name: string
    value: number
    stage: string
    owner: string
    probability: number
    expected_close_date: string | null
  }) {
    if (!clientId) return
    const res = await fetch('/.netlify/functions/client-deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        client_id: clientId,
        expected_close_date: data.expected_close_date || null,
      }),
    })
    if (res.ok) {
      setAddDealOpen(false)
      loadClientData()
    }
  }

  async function handleAddAttachment(data: {
    filename: string
    type: string
    url: string
    size: number | null
    deal_id: string
  }) {
    if (!clientId) return
    const res = await fetch('/.netlify/functions/client-attachments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        client_id: clientId,
        deal_id: data.deal_id || null,
      }),
    })
    if (res.ok) {
      setAddAttachmentOpen(false)
      loadClientData()
    }
  }

  async function handleDeleteAttachment() {
    if (!deleteAttachmentId) return
    const res = await fetch(`/.netlify/functions/client-attachments/${deleteAttachmentId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setDeleteAttachmentId(null)
      loadClientData()
    }
  }

  async function handleAddPerson(data: {
    name: string
    title: string
    email: string
    phone: string
    role: string
  }) {
    if (!clientId) return
    const res = await fetch('/.netlify/functions/client-people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        client_id: clientId,
      }),
    })
    if (res.ok) {
      setAddPersonOpen(false)
      loadClientData()
    }
  }

  async function handleToggleTask(taskId: string, completed: boolean) {
    const res = await fetch(`/.netlify/functions/client-tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
    if (res.ok) {
      loadClientData()
    }
  }

  if (loading || !currentClient) {
    return (
      <div className="p-6">
        <div className="text-[13px] text-text-muted">Loading client...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[12px] text-text-muted mb-4">
        <span
          className="hover:text-accent cursor-pointer"
          onClick={() => navigate('/clients')}
        >
          ClientDetailPage
        </span>
        <span>/</span>
        <span>/clients/{clientId}</span>
      </div>

      {/* Header */}
      <ClientHeader client={currentClient} onUpdate={handleUpdateClient} />

      {/* Quick Actions */}
      <QuickActions
        onAddTask={() => setAddTaskOpen(true)}
        onAddDeal={() => setAddDealOpen(true)}
        onAddAttachment={() => setAddAttachmentOpen(true)}
        onAddPerson={() => setAddPersonOpen(true)}
      />

      {/* Source Info */}
      <SourceInfoSection client={currentClient} onUpdate={handleUpdateClient} />

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          {/* Tasks */}
          <TasksSection tasks={tasks} onToggleTask={handleToggleTask} />

          {/* Deals */}
          <DealsSection deals={deals} />

          {/* Attachments */}
          <AttachmentsSection
            attachments={attachments}
            onDelete={(id) => setDeleteAttachmentId(id)}
          />
        </div>
        <div>
          {/* People */}
          <PeopleSection people={people} />

          {/* Timeline */}
          <TimelineSection events={timeline} />
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        onSave={handleAddTask}
        deals={deals}
      />
      <AddDealModal
        open={addDealOpen}
        availableUsers={availableUsers}
        onClose={() => setAddDealOpen(false)}
        onSave={handleAddDeal}
      />
      <AddAttachmentModal
        open={addAttachmentOpen}
        onClose={() => setAddAttachmentOpen(false)}
        onSave={handleAddAttachment}
        deals={deals}
      />
      <AddPersonModal
        open={addPersonOpen}
        onClose={() => setAddPersonOpen(false)}
        onSave={handleAddPerson}
      />
      <ConfirmDialog
        open={deleteAttachmentId !== null}
        title="Delete Attachment"
        message="Are you sure you want to delete this attachment? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteAttachment}
        onCancel={() => setDeleteAttachmentId(null)}
      />
    </div>
  )
}
