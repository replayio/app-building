import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import ClientHeader from '@/components/ClientHeader'
import QuickActions from '@/components/QuickActions'
import SourceInfoSection from '@/components/SourceInfoSection'
import ClientTasksSectionFull from '@/components/ClientTasksSectionFull'
import ClientDealsSection from '@/components/ClientDealsSection'
import ClientAttachmentsSection from '@/components/ClientAttachmentsSection'
import ClientPeopleSection from '@/components/ClientPeopleSection'
import ClientTimelineSection from '@/components/ClientTimelineSection'

interface ClientInfo {
  id: string
  name: string
  type: string
  status: string
  source: string | null
  source_detail: string | null
  campaign: string | null
  channel: string | null
  date_acquired: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const [client, setClient] = useState<ClientInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0)
  const [dealsRefreshKey, setDealsRefreshKey] = useState(0)
  const [attachmentsRefreshKey, setAttachmentsRefreshKey] = useState(0)
  const [peopleRefreshKey, setPeopleRefreshKey] = useState(0)
  const [timelineRefreshKey, setTimelineRefreshKey] = useState(0)

  const fetchClient = useCallback(async () => {
    if (!clientId) return
    try {
      const res = await fetch(`/.netlify/functions/clients/${clientId}`)
      const data = await res.json()
      setClient(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchClient()
  }, [fetchClient])

  const handleUpdateName = async (name: string) => {
    if (!clientId) return
    try {
      const res = await fetch(`/.netlify/functions/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const updated = await res.json()
        setClient(updated)
        setTimelineRefreshKey(k => k + 1)
      }
    } catch {
      // silently fail
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!clientId) return
    try {
      const res = await fetch(`/.netlify/functions/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const updated = await res.json()
        setClient(updated)
        setTimelineRefreshKey(k => k + 1)
      }
    } catch {
      // silently fail
    }
  }

  const handleUpdateTags = async (tags: string[]) => {
    if (!clientId) return
    try {
      const res = await fetch(`/.netlify/functions/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      })
      if (res.ok) {
        const updated = await res.json()
        setClient(updated)
      }
    } catch {
      // silently fail
    }
  }

  const handleUpdateSourceInfo = async (fields: Record<string, string | undefined>) => {
    if (!clientId) return
    try {
      const res = await fetch(`/.netlify/functions/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (res.ok) {
        const updated = await res.json()
        setClient(updated)
        setTimelineRefreshKey(k => k + 1)
      }
    } catch {
      // silently fail
    }
  }

  const refreshAll = () => {
    setTimelineRefreshKey(k => k + 1)
  }

  if (loading) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="client-detail-page">
        <p>Loading...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="client-detail-page">
        <p>Client not found</p>
      </div>
    )
  }

  return (
    <div className="page-content p-6 max-sm:p-3" data-testid="client-detail-page">
      <div className="client-detail-top">
        <ClientHeader
          name={client.name}
          type={client.type}
          status={client.status}
          tags={client.tags || []}
          source={client.source}
          onUpdateName={handleUpdateName}
          onUpdateStatus={handleUpdateStatus}
          onUpdateTags={handleUpdateTags}
        />

        <QuickActions
          clientId={client.id}
          clientName={client.name}
          onTaskCreated={() => { setTasksRefreshKey(k => k + 1); refreshAll() }}
          onDealCreated={() => { setDealsRefreshKey(k => k + 1); refreshAll() }}
          onAttachmentUploaded={() => { setAttachmentsRefreshKey(k => k + 1); refreshAll() }}
          onPersonAdded={() => { setPeopleRefreshKey(k => k + 1); refreshAll() }}
        />
      </div>

      <SourceInfoSection
        source={client.source}
        sourceDetail={client.source_detail}
        campaign={client.campaign}
        channel={client.channel}
        dateAcquired={client.date_acquired}
        onUpdate={handleUpdateSourceInfo}
      />

      <div className="client-detail-grid">
        <div className="client-detail-col">
          <ClientTasksSectionFull
            clientId={client.id}
            refreshKey={tasksRefreshKey}
          />

          <ClientDealsSection
            clientId={client.id}
            refreshKey={dealsRefreshKey}
          />

          <ClientAttachmentsSection
            clientId={client.id}
            refreshKey={attachmentsRefreshKey}
          />
        </div>

        <div className="client-detail-col">
          <ClientPeopleSection
            clientId={client.id}
            refreshKey={peopleRefreshKey}
          />

          <ClientTimelineSection
            clientId={client.id}
            refreshKey={timelineRefreshKey}
          />
        </div>
      </div>
    </div>
  )
}
