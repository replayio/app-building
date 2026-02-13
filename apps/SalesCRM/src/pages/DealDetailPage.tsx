import { useParams } from 'react-router-dom'

export function DealDetailPage() {
  const { dealId } = useParams()
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-text-primary">Deal Detail</h1>
      <p className="text-text-muted mt-2">Deal {dealId} detail will be implemented here.</p>
    </div>
  )
}
