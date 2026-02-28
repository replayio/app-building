import { useSelector, useDispatch } from 'react-redux';
import { Send } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import {
  setName,
  setDescription,
  setRequirements,
  submitRequest,
  resetRequest,
} from '../slices/requestSlice';
import { WizardStepper } from '../components/WizardStepper';
import { RequestSummary } from '../components/RequestSummary';
import { AssessmentPanel } from '../components/AssessmentPanel';
import { ResultRejected } from '../components/ResultRejected';
import { ResultAccepted } from '../components/ResultAccepted';
import { useEffect } from 'react';

export function RequestPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { step, name, description, requirements, assessing, assessment, error } =
    useSelector((state: RootState) => state.request);

  useEffect(() => {
    return () => {
      dispatch(resetRequest());
    };
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    dispatch(submitRequest({ name, description, requirements }));
  };

  const canSubmit = name.trim().length > 0 && description.trim().length > 0;

  return (
    <div data-testid="request-page" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
        Request an App
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        Describe the app you&apos;d like us to build autonomously.
      </p>

      <WizardStepper currentStep={step} />

      {step === 1 && (
        <form onSubmit={handleSubmit} data-testid="request-form">
          <div className="form-group">
            <label className="form-label" htmlFor="app-name">
              App Name
            </label>
            <input
              id="app-name"
              className="form-input"
              type="text"
              placeholder="e.g., Inventory Tracker Pro"
              value={name}
              onChange={(e) => dispatch(setName(e.target.value))}
              data-testid="input-app-name"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="app-description">
              Description
            </label>
            <textarea
              id="app-description"
              className="form-textarea"
              placeholder="Describe what your app should do..."
              value={description}
              onChange={(e) => dispatch(setDescription(e.target.value))}
              data-testid="input-app-description"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="app-requirements">
              Requirements (optional)
            </label>
            <textarea
              id="app-requirements"
              className="form-textarea"
              placeholder="Any specific technical requirements, integrations, etc."
              value={requirements}
              onChange={(e) => dispatch(setRequirements(e.target.value))}
              data-testid="input-app-requirements"
            />
          </div>
          <button
            type="submit"
            className="btn-submit"
            disabled={!canSubmit}
            data-testid="btn-submit-request"
          >
            <Send size={16} />
            Submit for Assessment
          </button>
        </form>
      )}

      {step === 2 && assessing && (
        <div className="wizard-content">
          <RequestSummary
            name={name}
            description={description}
            requirements={requirements}
          />
          <AssessmentPanel />
        </div>
      )}

      {step === 3 && assessment && !assessment.accepted && (
        <ResultRejected reason={assessment.reason || 'Request did not meet policy requirements.'} />
      )}

      {step === 3 && assessment && assessment.accepted && assessment.appId && (
        <ResultAccepted appName={name} appId={assessment.appId} />
      )}

      {step === 3 && error && (
        <div className="result-card rejected" data-testid="result-error">
          <div className="result-card-title">Assessment Failed</div>
          <div className="result-card-body">{error}</div>
          <button
            className="btn-submit"
            onClick={() => dispatch(resetRequest())}
            data-testid="btn-try-again"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
