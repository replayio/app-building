import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { resetRequest } from '../store/requestSlice'
import WizardStepper from '../components/WizardStepper'
import DescribeAppForm from '../components/DescribeAppForm'
import AssessmentScreen from '../components/AssessmentScreen'
import RejectionResult from '../components/RejectionResult'
import AcceptanceResult from '../components/AcceptanceResult'
import './RequestPage.css'

function RequestPage() {
  const dispatch = useAppDispatch()
  const { step, assessmentResult } = useAppSelector((state) => state.request)

  useEffect(() => {
    return () => {
      dispatch(resetRequest())
    }
  }, [dispatch])

  return (
    <div className="request-page" data-testid="request-page">
      <WizardStepper currentStep={step} />

      <div className="request-page__content">
        {step === 'describe' && (
          <div className="request-page__form-wrapper">
            <DescribeAppForm />
          </div>
        )}

        {step === 'assessment' && <AssessmentScreen />}

        {step === 'confirmation' && assessmentResult === 'rejected' && <RejectionResult />}

        {step === 'confirmation' && assessmentResult === 'accepted' && <AcceptanceResult />}
      </div>
    </div>
  )
}

export default RequestPage
