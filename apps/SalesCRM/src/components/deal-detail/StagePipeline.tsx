import { Check } from 'lucide-react'
import type { DealStage } from '../../types'

interface StagePipelineProps {
  currentStage: DealStage
}

const stages: { key: DealStage; label: string }[] = [
  { key: 'lead', label: 'Lead' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'discovery', label: 'Discovery' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'closed_won', label: 'Closed Won' },
]

export function StagePipeline({ currentStage }: StagePipelineProps) {
  const currentIndex = stages.findIndex((s) => s.key === currentStage)
  // For closed_lost, show no stages as current/completed
  const isClosedLost = currentStage === 'closed_lost'
  const progressPercent = isClosedLost ? 0 : Math.min(100, ((currentIndex + 1) / stages.length) * 100)

  return (
    <div className="border border-border rounded-[6px] p-4 mb-4">
      {/* Stage indicators */}
      <div className="flex items-center justify-between mb-3">
        {stages.map((stage, index) => {
          const isCompleted = !isClosedLost && index < currentIndex
          const isCurrent = !isClosedLost && index === currentIndex

          return (
            <div key={stage.key} className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium mb-1.5
                  ${isCompleted ? 'bg-status-active text-white' : ''}
                  ${isCurrent ? 'bg-accent text-white' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-sidebar text-text-muted border border-border' : ''}
                `}
              >
                {isCompleted ? (
                  <Check size={14} strokeWidth={2} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={`text-[11px] text-center ${
                  isCurrent ? 'text-accent font-medium' : isCompleted ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {stage.label}
              </span>
              {isCurrent && (
                <span className="text-[10px] text-accent mt-0.5">(Current)</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-sidebar rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {isClosedLost && (
        <div className="mt-2 text-[12px] text-status-churned font-medium text-center">
          Deal Closed — Lost
        </div>
      )}
    </div>
  )
}
