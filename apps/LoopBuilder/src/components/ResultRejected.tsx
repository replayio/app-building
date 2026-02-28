import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { resetRequest } from '../slices/requestSlice';

interface ResultRejectedProps {
  reason: string;
}

export function ResultRejected({ reason }: ResultRejectedProps) {
  const dispatch = useDispatch();

  return (
    <div className="result-card rejected" data-testid="result-rejected">
      <div className="result-icon">
        <AlertTriangle size={48} color="var(--color-warning)" />
      </div>
      <h2 className="result-card-title">Request Rejected</h2>
      <div className="result-card-body">
        Your request cannot be processed at this time.
      </div>
      <div className="reason-box">
        <div className="reason-box-title">Reason for Rejection</div>
        <div className="reason-box-text">{reason}</div>
      </div>
      <Link
        to="/request"
        className="btn-submit"
        style={{ textDecoration: 'none' }}
        onClick={() => dispatch(resetRequest())}
        data-testid="btn-edit-request"
      >
        Edit Request
      </Link>
    </div>
  );
}
