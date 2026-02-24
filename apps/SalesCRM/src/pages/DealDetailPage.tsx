import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import DealHeader from '@/components/DealHeader'
import StageProgressBar from '@/components/StageProgressBar'
import DealHistorySection from '@/components/DealHistorySection'
import DealMetricsSection from '@/components/DealMetricsSection'
import WriteupsSection from '@/components/WriteupsSection'
import LinkedTasksSection from '@/components/LinkedTasksSection'
import DealAttachmentsSection from '@/components/DealAttachmentsSection'
import DealContactsSection from '@/components/DealContactsSection'

interface DealInfo {
  id: string
  name: string
  client_id: string
  client_name: string
  stage: string
  value: string | number | null
  owner: string | null
  status: string
  probability: number | null
  expected_close_date: string | null
  close_date: string | null
  created_at: string
  updated_at: string
}

export default function DealDetailPage() {
  const { dealId } = useParams<{ dealId: string }>()
  const [deal, setDeal] = useState<DealInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  const fetchDeal = useCallback(async () => {
    if (!dealId) return
    try {
      const res = await fetch(`/.netlify/functions/deals/${dealId}`)
      const data = await res.json()
      setDeal(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetchDeal()
  }, [fetchDeal])

  const handleUpdateField = async (field: string, value: string) => {
    if (!dealId || !deal) return
    const body: Record<string, unknown> = {}
    if (field === 'client_name') {
      body.name = deal.name
    } else if (field === 'value') {
      const numericValue = value.replace(/[$,]/g, '')
      body.value = numericValue || null
    } else {
      body[field] = value
    }
    try {
      const res = await fetch(`/.netlify/functions/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const updated = await res.json()
        setDeal(updated)
      }
    } catch {
      // silently fail
    }
  }

  const handleChangeStage = async (newStage: string) => {
    if (!dealId || !deal) return
    try {
      // Update the deal stage
      const res = await fetch(`/.netlify/functions/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      if (res.ok) {
        const updated = await res.json()
        setDeal(updated)
        setHistoryRefreshKey(k => k + 1)
      }
    } catch {
      // silently fail
    }
  }

  const handleUpdateMetrics = async (field: string, value: string | number | null) => {
    if (!dealId) return
    const body: Record<string, unknown> = { [field]: value }
    try {
      const res = await fetch(`/.netlify/functions/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const updated = await res.json()
        setDeal(updated)
      }
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="deal-detail-page">
        <p>Loading...</p>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="deal-detail-page">
        <p>Deal not found</p>
      </div>
    )
  }

  return (
    <div className="page-content p-6 max-sm:p-3" data-testid="deal-detail-page">
      <DealHeader
        dealName={deal.name}
        clientName={deal.client_name}
        value={deal.value}
        owner={deal.owner}
        stage={deal.stage}
        onUpdateField={handleUpdateField}
        onChangeStage={handleChangeStage}
      />

      <StageProgressBar currentStage={deal.stage} />

      <DealHistorySection dealId={deal.id} refreshKey={historyRefreshKey} />

      <DealMetricsSection
        probability={deal.probability}
        expectedCloseDate={deal.expected_close_date}
        onUpdate={handleUpdateMetrics}
      />

      <WriteupsSection dealId={deal.id} />

      <LinkedTasksSection dealId={deal.id} clientId={deal.client_id} />

      <DealAttachmentsSection dealId={deal.id} clientId={deal.client_id} />

      <DealContactsSection dealId={deal.id} />
    </div>
  )
}
