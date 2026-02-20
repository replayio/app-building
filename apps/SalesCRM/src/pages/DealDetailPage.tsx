import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchDeal, updateDeal } from '../store/dealsSlice'
import { DealDetailHeader } from '../components/deal-detail/DealDetailHeader'
import { StagePipeline } from '../components/deal-detail/StagePipeline'
import { DealHistorySection } from '../components/deal-detail/DealHistorySection'
import { DealMetricsSection } from '../components/deal-detail/DealMetricsSection'
import { WriteupsSection } from '../components/deal-detail/WriteupsSection'
import { LinkedTasksSection } from '../components/deal-detail/LinkedTasksSection'
import { DealAttachmentsSection } from '../components/deal-detail/DealAttachmentsSection'
import { DealContactsSection } from '../components/deal-detail/DealContactsSection'
import { AddWriteupModal } from '../components/deal-detail/AddWriteupModal'
import { AddDealTaskModal } from '../components/deal-detail/AddDealTaskModal'
import { UploadAttachmentModal } from '../components/deal-detail/UploadAttachmentModal'
import { VersionHistoryModal } from '../components/deal-detail/VersionHistoryModal'
import { ConfirmDialog } from '../components/shared/ConfirmDialog'
import type { DealHistory, Writeup, Task, Attachment, DealStage } from '../types'

interface DealContact {
  id: string
  individual_id: string
  individual_name: string
  title: string | null
  role: string
  company: string | null
}

interface VersionEntry {
  id: string
  title: string
  content: string
  author: string
  version: number
  created_at: string
}

export function DealDetailPage() {
  const { dealId } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentDeal, loading } = useAppSelector((state) => state.deals)

  const [history, setHistory] = useState<DealHistory[]>([])
  const [writeups, setWriteups] = useState<Writeup[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [contacts, setContacts] = useState<DealContact[]>([])

  const [addWriteupOpen, setAddWriteupOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteAttachmentId, setDeleteAttachmentId] = useState<string | null>(null)
  const [versionModalOpen, setVersionModalOpen] = useState(false)
  const [versions, setVersions] = useState<VersionEntry[]>([])
  const [availableUsers, setAvailableUsers] = useState<{ name: string }[]>([])

  useEffect(() => {
    fetch('/.netlify/functions/users')
      .then(r => r.json())
      .then((data: { users: { name: string }[] }) => setAvailableUsers(data.users))
      .catch(() => {})
  }, [])

  const loadDetailData = useCallback(async () => {
    if (!dealId) return
    const res = await fetch(`/.netlify/functions/deal-detail?dealId=${dealId}`)
    if (res.ok) {
      const data = await res.json() as {
        history: DealHistory[]
        writeups: Writeup[]
        tasks: Task[]
        attachments: Attachment[]
        contacts: DealContact[]
      }
      setHistory(data.history)
      setWriteups(data.writeups)
      setTasks(data.tasks)
      setAttachments(data.attachments)
      setContacts(data.contacts)
    }
  }, [dealId])

  useEffect(() => {
    if (dealId) {
      dispatch(fetchDeal(dealId))
      loadDetailData()
    }
  }, [dealId, dispatch, loadDetailData])

  async function handleUpdateDeal(data: Record<string, unknown>) {
    if (!dealId) return
    await dispatch(updateDeal({ dealId, data }))
    await loadDetailData()
  }

  async function handleStageChange(newStage: DealStage) {
    if (!dealId) return
    await dispatch(updateDeal({ dealId, data: { stage: newStage } }))
    await Promise.all([
      dispatch(fetchDeal(dealId)),
      loadDetailData(),
    ])
  }

  async function handleAddWriteup(data: { title: string; content: string; author: string }) {
    if (!dealId) return
    const res = await fetch('/.netlify/functions/deal-detail/writeups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, deal_id: dealId }),
    })
    if (res.ok) {
      setAddWriteupOpen(false)
      await loadDetailData()
    }
  }

  async function handleEditWriteup(writeupId: string, data: { title: string; content: string }) {
    const res = await fetch(`/.netlify/functions/deal-detail/writeups/${writeupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      await loadDetailData()
    }
  }

  async function handleViewVersions(writeupId: string) {
    const res = await fetch(`/.netlify/functions/deal-detail/writeup-versions/${writeupId}`)
    if (res.ok) {
      const data = await res.json() as { versions: VersionEntry[] }
      setVersions(data.versions)
      setVersionModalOpen(true)
    }
  }

  async function handleAddTask(data: {
    title: string
    description: string
    due_date: string
    priority: string
  }) {
    if (!dealId || !currentDeal) return
    const res = await fetch('/.netlify/functions/deal-detail/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        deal_id: dealId,
        client_id: currentDeal.client_id,
      }),
    })
    if (res.ok) {
      setAddTaskOpen(false)
      await loadDetailData()
    }
  }

  async function handleToggleTask(taskId: string, completed: boolean) {
    const res = await fetch(`/.netlify/functions/deal-detail/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
    if (res.ok) {
      await loadDetailData()
    }
  }

  async function handleUploadAttachment(data: {
    filename: string
    type: string
    url: string
    size: number | null
  }) {
    if (!dealId || !currentDeal) return
    const res = await fetch('/.netlify/functions/deal-detail/attachments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        deal_id: dealId,
        client_id: currentDeal.client_id,
      }),
    })
    if (res.ok) {
      setUploadOpen(false)
      await loadDetailData()
    }
  }

  async function handleDeleteAttachment() {
    if (!deleteAttachmentId) return
    const res = await fetch(`/.netlify/functions/deal-detail/attachments/${deleteAttachmentId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setDeleteAttachmentId(null)
      await loadDetailData()
    }
  }

  if (loading || !currentDeal) {
    return (
      <div className="p-6" data-testid="deal-detail-loading">
        <div className="text-[13px] text-text-muted">Loading deal...</div>
      </div>
    )
  }

  return (
    <div className="p-6" data-testid="deal-detail-page">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[12px] text-text-muted mb-4" data-testid="deal-detail-breadcrumb">
        <span
          className="hover:text-accent cursor-pointer"
          onClick={() => navigate('/deals')}
        >
          Deals
        </span>
        <span>/</span>
        <span>{currentDeal.name}</span>
      </div>

      {/* Header */}
      <DealDetailHeader
        deal={currentDeal}
        availableUsers={availableUsers}
        onUpdate={handleUpdateDeal}
        onStageChange={handleStageChange}
      />

      {/* Stage Pipeline */}
      <StagePipeline currentStage={currentDeal.stage} />

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          {/* Deal History */}
          <DealHistorySection history={history} />

          {/* Deal Metrics */}
          <DealMetricsSection deal={currentDeal} onUpdate={handleUpdateDeal} />

          {/* Writeups */}
          <WriteupsSection
            writeups={writeups}
            onAddWriteup={() => setAddWriteupOpen(true)}
            onEditWriteup={handleEditWriteup}
            onViewVersions={handleViewVersions}
          />
        </div>
        <div>
          {/* Linked Tasks */}
          <LinkedTasksSection
            tasks={tasks}
            onAddTask={() => setAddTaskOpen(true)}
            onToggleTask={handleToggleTask}
          />

          {/* Attachments */}
          <DealAttachmentsSection
            attachments={attachments}
            onUpload={() => setUploadOpen(true)}
            onDelete={(id) => setDeleteAttachmentId(id)}
          />

          {/* Contacts */}
          <DealContactsSection contacts={contacts} />
        </div>
      </div>

      {/* Modals */}
      <AddWriteupModal
        open={addWriteupOpen}
        onClose={() => setAddWriteupOpen(false)}
        onSave={handleAddWriteup}
      />
      <AddDealTaskModal
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        onSave={handleAddTask}
      />
      <UploadAttachmentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSave={handleUploadAttachment}
      />
      <VersionHistoryModal
        open={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        versions={versions}
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
