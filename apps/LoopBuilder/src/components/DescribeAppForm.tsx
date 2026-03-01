import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setAppName, setAppDescription, setAppRequirements, submitRequest } from '../store/requestSlice'
import './DescribeAppForm.css'

function DescribeAppForm() {
  const dispatch = useAppDispatch()
  const { appName, appDescription, appRequirements, submitting, error } = useAppSelector(
    (state) => state.request,
  )
  const [submitted, setSubmitted] = useState(false)

  const nameEmpty = appName.trim().length === 0
  const descriptionEmpty = appDescription.trim().length === 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (nameEmpty || descriptionEmpty || submitting) return
    dispatch(
      submitRequest({
        name: appName.trim(),
        description: appDescription.trim(),
        requirements: appRequirements.trim(),
      }),
    )
  }

  return (
    <form className="describe-app-form" data-testid="describe-app-form" onSubmit={handleSubmit}>
      <h2 className="describe-app-form__title">Describe Your App</h2>

      {error && (
        <div className="describe-app-form__error" data-testid="describe-app-form-error">
          {error}
        </div>
      )}

      <div className="describe-app-form__field">
        <label className="describe-app-form__label" htmlFor="app-name">
          App Name
        </label>
        <input
          id="app-name"
          className="describe-app-form__input"
          data-testid="app-name-input"
          type="text"
          placeholder="e.g. Inventory Tracker Pro"
          value={appName}
          onChange={(e) => dispatch(setAppName(e.target.value))}
        />
        {submitted && nameEmpty && (
          <span className="describe-app-form__field-error" data-testid="app-name-error">
            App Name is required
          </span>
        )}
      </div>

      <div className="describe-app-form__field">
        <label className="describe-app-form__label" htmlFor="app-description">
          Description
        </label>
        <textarea
          id="app-description"
          className="describe-app-form__textarea"
          data-testid="app-description-input"
          placeholder="Describe what the app should do..."
          rows={4}
          value={appDescription}
          onChange={(e) => dispatch(setAppDescription(e.target.value))}
        />
        {submitted && descriptionEmpty && (
          <span className="describe-app-form__field-error" data-testid="app-description-error">
            Description is required
          </span>
        )}
      </div>

      <div className="describe-app-form__field">
        <label className="describe-app-form__label" htmlFor="app-requirements">
          Requirements
        </label>
        <textarea
          id="app-requirements"
          className="describe-app-form__textarea"
          data-testid="app-requirements-input"
          placeholder="Any specific requirements (authentication, integrations, etc.)..."
          rows={3}
          value={appRequirements}
          onChange={(e) => dispatch(setAppRequirements(e.target.value))}
        />
      </div>

      <button
        type="submit"
        className="describe-app-form__submit"
        data-testid="describe-app-form-submit"
      >
        {submitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}

export default DescribeAppForm
