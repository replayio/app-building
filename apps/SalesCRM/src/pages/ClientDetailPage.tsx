import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ClientTasksSection from '@/components/ClientTasksSection'

interface ClientInfo {
  id: string
  name: string
  type: string
  status: string
}

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const [client, setClient] = useState<ClientInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clientId) return

    fetch(`/.netlify/functions/clients/${clientId}`)
      .then(r => r.json())
      .then(data => {
        setClient(data)
        setLoading(false)
      })
  }, [clientId])

  if (loading) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="client-detail-page">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="page-content p-6 max-sm:p-3" data-testid="client-detail-page">
      <h1 className="page-title" data-testid="client-detail-name">{client?.name}</h1>
      {clientId && <ClientTasksSection clientId={clientId} />}
    </div>
  )
}
