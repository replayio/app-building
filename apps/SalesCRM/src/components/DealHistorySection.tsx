import { useState, useEffect, useCallback } from 'react'

interface HistoryEntry {
  id: string
  old_stage: string | null
  new_stage: string
  changed_by: string | null
  changed_at: string
}

interface DealHistorySectionProps {
  dealId: string
  refreshKey?: number
}

export default function DealHistorySection({ dealId, refreshKey }: DealHistorySectionProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/deals/${dealId}/history`)
      const data = await res.json()
      setEntries(data.history || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory, refreshKey])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="person-section" data-testid="deal-history-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <h2 data-testid="deal-history-heading">Deal History</h2>
        </div>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : entries.length > 0 ? (
        <div className="deal-history-list" data-testid="deal-history-list">
          {entries.map(entry => (
            <div key={entry.id} className="deal-history-entry" data-testid="deal-history-entry">
              <span className="deal-history-date">{formatDate(entry.changed_at)}</span>
              <span className="deal-history-separator">: </span>
              <span className="deal-history-text">
                {entry.old_stage
                  ? `Changed Stage from ${entry.old_stage} to ${entry.new_stage}`
                  : `Stage set to ${entry.new_stage}`}
              </span>
              {entry.changed_by && (
                <span className="deal-history-user"> ({entry.changed_by})</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="person-section-empty" data-testid="deal-history-empty">
          No stage change history yet
        </div>
      )}
    </div>
  )
}
