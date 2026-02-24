const STAGES = ['Lead', 'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won'] as const

interface StageProgressBarProps {
  currentStage: string
}

export default function StageProgressBar({ currentStage }: StageProgressBarProps) {
  const currentIndex = STAGES.indexOf(currentStage as typeof STAGES[number])

  return (
    <div className="stage-progress-bar" data-testid="stage-progress-bar">
      {STAGES.map((stage, index) => {
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex
        const isLast = index === STAGES.length - 1

        return (
          <div key={stage} className="stage-progress-step" data-testid="stage-progress-step">
            <div className="stage-progress-indicator">
              <div
                className={`stage-progress-circle ${isCompleted ? 'completed' : 'incomplete'}`}
                data-testid={`stage-circle-${stage.toLowerCase().replace(' ', '-')}`}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span className="stage-progress-dot" />
                )}
              </div>
              {!isLast && (
                <div className={`stage-progress-line ${index < currentIndex ? 'completed' : 'incomplete'}`} />
              )}
            </div>
            <span className={`stage-progress-label ${isCompleted ? 'completed' : 'incomplete'}`} data-testid={`stage-label-${stage.toLowerCase().replace(' ', '-')}`}>
              {stage}{isCurrent ? ' (Current)' : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}
