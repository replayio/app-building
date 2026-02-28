import { useAppSelector } from '../store/hooks'
import './AssessmentScreen.css'

function AssessmentScreen() {
  const { appName, appDescription, appRequirements } = useAppSelector((state) => state.request)

  return (
    <div className="assessment-screen" data-testid="assessment-screen">
      <div className="assessment-screen__summary" data-testid="assessment-summary">
        <h2 className="assessment-screen__summary-title">Request Summary</h2>

        <div className="assessment-screen__summary-field">
          <div className="assessment-screen__summary-label">App Name:</div>
          <div className="assessment-screen__summary-value" data-testid="assessment-summary-name">
            {appName}
          </div>
        </div>

        <div className="assessment-screen__summary-field">
          <div className="assessment-screen__summary-label">Description:</div>
          <div
            className="assessment-screen__summary-value"
            data-testid="assessment-summary-description"
          >
            {appDescription}
          </div>
        </div>

        {appRequirements && (
          <div className="assessment-screen__summary-field">
            <div className="assessment-screen__summary-label">Requirements:</div>
            <div
              className="assessment-screen__summary-value"
              data-testid="assessment-summary-requirements"
            >
              {appRequirements}
            </div>
          </div>
        )}
      </div>

      <div className="assessment-screen__progress" data-testid="assessment-progress">
        <h3 className="assessment-screen__progress-title">
          Assessing Request against Policy &amp; Technical Criteria...
        </h3>

        <div className="assessment-screen__progress-bar-track">
          <div className="assessment-screen__progress-bar-fill" />
        </div>

        <p className="assessment-screen__progress-message">
          Please wait while we review your request. This typically takes a few moments.
        </p>

        <div className="assessment-screen__spinner" data-testid="assessment-spinner" />
      </div>
    </div>
  )
}

export default AssessmentScreen
