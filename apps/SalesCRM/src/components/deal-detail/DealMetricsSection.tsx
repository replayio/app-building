import { useState, useEffect } from 'react'
import { BarChart2, Pencil, Check, X } from 'lucide-react'
import type { Deal } from '../../types'

interface DealMetricsSectionProps {
  deal: Deal
  onUpdate: (data: Record<string, unknown>) => void | Promise<void>
}

export function DealMetricsSection({ deal, onUpdate }: DealMetricsSectionProps) {
  const [editing, setEditing] = useState(false)
  const [probability, setProbability] = useState(String(deal.probability))
  const [closeDate, setCloseDate] = useState(deal.expected_close_date ?? '')

  useEffect(() => {
    setProbability(String(deal.probability))
    setCloseDate(deal.expected_close_date ?? '')
  }, [deal.probability, deal.expected_close_date])

  async function handleSave() {
    await onUpdate({
      probability: parseInt(probability, 10) || 0,
      expected_close_date: closeDate || null,
    })
    setEditing(false)
  }

  function handleCancel() {
    setProbability(String(deal.probability))
    setCloseDate(deal.expected_close_date ?? '')
    setEditing(false)
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div data-testid="deal-metrics-section" className="border border-border rounded-[6px] p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 size={14} strokeWidth={1.75} className="text-text-muted" />
          <h2 className="text-[14px] font-semibold text-text-primary">Deal Metrics</h2>
        </div>
        {!editing ? (
          <button
            data-testid="deal-metrics-edit-button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
            title="Edit metrics"
          >
            <Pencil size={14} strokeWidth={1.75} />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              data-testid="deal-metrics-save-button"
              onClick={handleSave}
              className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-status-active hover:bg-hover transition-colors duration-100"
            >
              <Check size={14} strokeWidth={1.75} />
            </button>
            <button
              data-testid="deal-metrics-cancel-button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-status-churned hover:bg-hover transition-colors duration-100"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
        <div>
          <div className="text-[12px] font-medium text-text-muted mb-1">Probability</div>
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                data-testid="deal-metrics-probability-input"
                type="number"
                min="0"
                max="100"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                className="w-20 h-[30px] px-2 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
              />
              <span className="text-[13px] text-text-muted">%</span>
            </div>
          ) : (
            <div data-testid="deal-metrics-probability" className="text-[16px] font-semibold text-text-primary">{deal.probability}%</div>
          )}
        </div>
        <div>
          <div className="text-[12px] font-medium text-text-muted mb-1">Expected Close</div>
          {editing ? (
            <input
              data-testid="deal-metrics-close-date-input"
              type="date"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              className="h-[30px] px-2 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
            />
          ) : (
            <div data-testid="deal-metrics-close-date" className="text-[16px] font-semibold text-text-primary">
              {formatDate(deal.expected_close_date)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
