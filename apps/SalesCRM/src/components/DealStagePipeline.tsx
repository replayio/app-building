const STAGES = ["Lead", "Qualification", "Discovery", "Proposal", "Negotiation", "Closed Won"];

interface DealStagePipelineProps {
  currentStage: string;
}

function CheckIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="pipeline-stage-icon pipeline-stage-icon--filled">
        <circle cx="10" cy="10" r="9" fill="var(--accent-primary)" stroke="var(--accent-primary)" strokeWidth="1.5" />
        <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="pipeline-stage-icon pipeline-stage-icon--unfilled">
      <circle cx="10" cy="10" r="9" fill="none" stroke="var(--text-disabled)" strokeWidth="1.5" />
      <path d="M6 10L9 13L14 7" stroke="var(--text-disabled)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DealStagePipeline({ currentStage }: DealStagePipelineProps) {
  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <div className="deal-stage-pipeline" data-testid="deal-stage-pipeline">
      <div className="deal-stage-labels">
        {STAGES.map((stage, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isFilled = isCompleted || isCurrent;

          return (
            <div
              key={stage}
              className={`deal-stage-label ${isCurrent ? "deal-stage-label--current" : ""} ${isCompleted ? "deal-stage-label--completed" : ""}`}
              data-testid={`deal-stage-${stage.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <CheckIcon filled={isFilled} />
              <span className="deal-stage-label-text">
                {stage}{isCurrent ? " (Current)" : ""}
              </span>
            </div>
          );
        })}
      </div>
      <div className="deal-stage-progress-bar" data-testid="deal-stage-progress-bar">
        {STAGES.map((stage, index) => {
          const isFilled = index <= currentIndex;
          return (
            <div
              key={stage}
              className={`deal-stage-progress-segment ${isFilled ? "deal-stage-progress-segment--filled" : ""}`}
              data-testid={`deal-stage-progress-${stage.toLowerCase().replace(/\s+/g, "-")}`}
            />
          );
        })}
      </div>
    </div>
  );
}
