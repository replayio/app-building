import { useNavigate } from "react-router-dom";

export function NewTransactionButton() {
  const navigate = useNavigate();

  return (
    <button
      data-testid="new-transaction-btn"
      className="btn-primary"
      onClick={() => navigate("/transactions/new")}
      type="button"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 16, height: 16 }}
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span className="max-sm:hidden">New Transaction</span>
    </button>
  );
}
