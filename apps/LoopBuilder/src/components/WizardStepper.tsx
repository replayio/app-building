import type { WizardStep } from '../store/requestSlice'
import './WizardStepper.css'

const steps: { key: WizardStep; label: string; number: number }[] = [
  { key: 'describe', label: '1. Describe App', number: 1 },
  { key: 'assessment', label: '2. Assessment', number: 2 },
  { key: 'confirmation', label: '3. Confirmation', number: 3 },
]

const stepOrder: WizardStep[] = ['describe', 'assessment', 'confirmation']

function getStepIndex(step: WizardStep): number {
  return stepOrder.indexOf(step)
}

interface WizardStepperProps {
  currentStep: WizardStep
}

function WizardStepper({ currentStep }: WizardStepperProps) {
  const currentIndex = getStepIndex(currentStep)

  return (
    <div className="wizard-stepper" data-testid="wizard-stepper">
      {steps.map((step, i) => {
        const stepIndex = getStepIndex(step.key)
        const isCompleted = stepIndex < currentIndex
        const isActive = stepIndex === currentIndex

        return (
          <div key={step.key} style={{ display: 'contents' }}>
            {i > 0 && (
              <div
                className={`wizard-stepper__connector${isCompleted || isActive ? ' wizard-stepper__connector--completed' : ''}`}
                data-testid={`wizard-connector-${i}`}
              />
            )}
            <div className="wizard-stepper__step" data-testid={`wizard-step-${step.key}`}>
              <div
                className={`wizard-stepper__circle${isCompleted ? ' wizard-stepper__circle--completed' : ''}${isActive ? ' wizard-stepper__circle--active' : ''}`}
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <span
                className={`wizard-stepper__label${isActive ? ' wizard-stepper__label--active' : ''}${isCompleted ? ' wizard-stepper__label--completed' : ''}`}
              >
                {step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default WizardStepper
