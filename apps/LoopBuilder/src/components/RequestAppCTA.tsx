import { useNavigate } from 'react-router-dom'
import './RequestAppCTA.css'

function RequestAppCTA() {
  const navigate = useNavigate()

  return (
    <button
      className="request-app-cta"
      data-testid="request-app-cta"
      onClick={() => navigate('/request')}
    >
      Request an app
    </button>
  )
}

export default RequestAppCTA
