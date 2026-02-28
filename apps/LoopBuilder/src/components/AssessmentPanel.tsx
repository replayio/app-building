export function AssessmentPanel() {
  return (
    <div className="assessment-panel" data-testid="assessment-panel">
      <div className="assessment-loading">
        <div className="assessment-loading-title">
          Assessing Request against Policy &amp; Technical Criteria...
        </div>
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
        <div className="assessment-loading-subtitle">
          Please wait while we review your request. This typically takes a few moments.
        </div>
      </div>
    </div>
  );
}
