interface RequestSummaryProps {
  name: string;
  description: string;
  requirements: string;
}

export function RequestSummary({ name, description, requirements }: RequestSummaryProps) {
  return (
    <div className="request-summary" data-testid="request-summary">
      <h3>Request Summary</h3>
      <div className="request-summary-field">
        <div className="request-summary-label">App Name:</div>
        <div className="request-summary-value">{name}</div>
      </div>
      <div className="request-summary-field">
        <div className="request-summary-label">Description:</div>
        <div className="request-summary-value">{description}</div>
      </div>
      {requirements && (
        <div className="request-summary-field">
          <div className="request-summary-label">Requirements:</div>
          <div className="request-summary-value">{requirements}</div>
        </div>
      )}
    </div>
  );
}
