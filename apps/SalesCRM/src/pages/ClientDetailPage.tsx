import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchClient, clearCurrent } from '../store/slices/clientsSlice'
import ClientDetailHeader from '../components/Clients/ClientDetailHeader'
import ClientQuickActions from '../components/Clients/ClientQuickActions'
import ClientSourceInfo from '../components/Clients/ClientSourceInfo'
import ClientTasks from '../components/Clients/ClientTasks'
import ClientDeals from '../components/Clients/ClientDeals'
import ClientAttachments from '../components/Clients/ClientAttachments'
import ClientPeople from '../components/Clients/ClientPeople'
import ClientTimeline from '../components/Clients/ClientTimeline'

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const dispatch = useAppDispatch()
  const { current: client, loading } = useAppSelector((state) => state.clients)

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClient(clientId))
    }
    return () => {
      dispatch(clearCurrent())
    }
  }, [dispatch, clientId])

  function handleRefresh() {
    if (clientId) {
      dispatch(fetchClient(clientId))
    }
  }

  if (loading) {
    return (
      <div data-testid="client-detail-page" className="p-6 max-sm:p-3">
        <div data-testid="client-detail-loading" className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div data-testid="client-detail-page" className="p-6 max-sm:p-3">
        <p className="text-[13px] text-[var(--color-text-muted)]">Client not found</p>
      </div>
    )
  }

  return (
    <div data-testid="client-detail-page" className="p-6 max-sm:p-3">
      <ClientDetailHeader client={client} onClientUpdated={handleRefresh} />
      <ClientQuickActions client={client} onActionComplete={handleRefresh} />
      <ClientSourceInfo client={client} onClientUpdated={handleRefresh} />
      <ClientTasks tasks={client.tasks || []} onTaskCompleted={handleRefresh} />
      <ClientDeals deals={client.deals || []} />
      <ClientAttachments attachments={client.attachments || []} onAttachmentDeleted={handleRefresh} />
      <ClientPeople people={client.people || []} />
      <ClientTimeline timeline={client.timeline || []} />
    </div>
  )
}
