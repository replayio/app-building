import { Check } from 'lucide-react';

interface WizardStepperProps {
  currentStep: number;
}

const STEPS = [
  { number: 1, label: 'Describe App' },
  { number: 2, label: 'Assessment' },
  { number: 3, label: 'Confirmation' },
];

export function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <div className="wizard-stepper" data-testid="wizard-stepper">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const stepClass = isCompleted
          ? 'completed'
          : isActive
            ? 'active'
            : '';

        return (
          <div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>
            {index > 0 && (
              <div
                className={`wizard-step-line ${isCompleted || isActive ? 'completed' : ''}`}
              />
            )}
            <div
              className={`wizard-step ${stepClass}`}
              data-testid={`wizard-step-${step.number}`}
            >
              <span className="wizard-step-dot">
                {isCompleted ? <Check size={14} /> : step.number}
              </span>
              <span>{step.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
