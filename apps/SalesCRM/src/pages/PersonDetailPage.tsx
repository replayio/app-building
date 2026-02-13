import { useParams } from 'react-router-dom'

export function PersonDetailPage() {
  const { individualId } = useParams()
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-text-primary">Person Detail</h1>
      <p className="text-text-muted mt-2">Individual {individualId} detail will be implemented here.</p>
    </div>
  )
}
