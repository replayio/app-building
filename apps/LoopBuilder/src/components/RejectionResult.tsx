import { useAppDispatch, useAppSelector } from '../store/hooks'
import { goToStep } from '../store/requestSlice'
import './RejectionResult.css'

function RejectionResult() {
  const dispatch = useAppDispatch()
  const { appName, rejectionReason } = useAppSelector((state) => state.request)

  return (
    <div className="rejection-result" data-testid="rejection-result">
      <div className="rejection-result__icon">⚠️</div>

      <h2 className="rejection-result__title">Request Rejected</h2>

      <p className="rejection-result__message">
        Your request for &apos;{appName}&apos; cannot be processed at this time.
      </p>

      <div className="rejection-result__reason-box" data-testid="rejection-reason-box">
        <div className="rejection-result__reason-title">Reason for Rejection</div>
        <p className="rejection-result__reason-text">
          <span className="rejection-result__reason-label">Policy Violation: </span>
          {rejectionReason}
        </p>
      </div>

      <button
        className="rejection-result__edit-btn"
        data-testid="edit-request-btn"
        onClick={() => dispatch(goToStep('describe'))}
      >
        Edit Request
      </button>
    </div>
  )
}

export default RejectionResult
