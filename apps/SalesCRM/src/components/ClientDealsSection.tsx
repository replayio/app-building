import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface ClientDeal {
  id: string
  name: string
  stage: string
  value: string | number | null
  status: string
  created_at: string
}

interface ClientDealsSectionProps {
  clientId: string
  refreshKey?: number
}

export default function ClientDealsSection({ clientId, refreshKey }: ClientDealsSectionProps) {
  const navigate = useNavigate()
  const [deals, setDeals] = useState<ClientDeal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/clients/${clientId}/deals`)
      const data = await res.json()
      setDeals(data.deals || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals, refreshKey])

  const formatValue = (val: string | number | null) => {
    if (val === null || val === undefined || val === '') return ''
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return String(val)
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const getStageClass = (stage: string) => {
    if (stage === 'Closed Won') return 'deal-status-won'
    if (stage === 'Closed Lost') return 'deal-status-lost'
    return ''
  }

  return (
    <div className="person-section" data-testid="deals-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <h2 data-testid="deals-heading">Deals</h2>
        </div>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : deals.length > 0 ? (
        <div className="client-deals-list" data-testid="deals-list">
          {deals.map(deal => (
            <button
              key={deal.id}
              className="client-deal-item"
              onClick={() => navigate(`/deals/${deal.id}`)}
              data-testid="deal-item"
            >
              <span className="client-deal-name" data-testid="deal-name">{deal.name}</span>
              <span className={`client-deal-stage ${getStageClass(deal.stage)}`} data-testid="deal-stage">
                Stage: {deal.stage}
              </span>
              {deal.value && (
                <span className="client-deal-value" data-testid="deal-value">
                  Value: {formatValue(deal.value)}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="person-section-empty" data-testid="deals-empty">
          No deals for this client
        </div>
      )}
    </div>
  )
}
