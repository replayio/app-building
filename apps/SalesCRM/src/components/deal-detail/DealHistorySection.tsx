import { Clock } from 'lucide-react'
import type { DealHistory, DealStage } from '../../types'

interface DealHistorySectionProps {
  history: DealHistory[]
}

const stageLabels: Record<string, string> = {
  none: 'None',
  lead: 'Lead',
  qualification: 'Qualification',
  discovery: 'Discovery',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
}

function formatStage(stage: string): string {
  return stageLabels[stage] ?? stage
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) + ', ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function DealHistorySection({ history }: DealHistorySectionProps) {
  return (
    <div data-testid="deal-history-section" className="border border-border rounded-[6px] p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} strokeWidth={1.75} className="text-text-muted" />
        <h2 className="text-[14px] font-semibold text-text-primary">Deal History</h2>
      </div>

      {history.length === 0 ? (
        <div data-testid="deal-history-empty" className="text-[13px] text-text-muted py-2">No stage changes recorded</div>
      ) : (
        <div className="flex flex-col gap-1">
          {history.map((entry) => (
            <div
              key={entry.id}
              data-testid={`deal-history-entry-${entry.id}`}
              className="flex items-start gap-3 px-3 py-2.5 rounded-[4px] hover:bg-hover transition-colors duration-100"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-text-primary">
                  Changed Stage from{' '}
                  <span className="font-medium">{formatStage(entry.old_stage)}</span>
                  {' '}to{' '}
                  <span className="font-medium">{formatStage(entry.new_stage as DealStage)}</span>
                  {entry.changed_by && (
                    <span className="text-text-muted"> ({entry.changed_by})</span>
                  )}
                </div>
                <div className="text-[12px] text-text-muted mt-0.5">
                  {formatDate(entry.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
