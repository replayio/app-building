import { useParams } from 'react-router-dom'

export function ClientDetailPage() {
  const { clientId } = useParams()
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-text-primary">Client Detail</h1>
      <p className="text-text-muted mt-2">Client {clientId} detail will be implemented here.</p>
    </div>
  )
}
