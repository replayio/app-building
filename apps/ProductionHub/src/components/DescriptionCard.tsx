interface DescriptionCardProps {
  description: string;
}

export function DescriptionCard({ description }: DescriptionCardProps) {
  return (
    <div className="section-card" data-testid="description-card">
      <div className="section-card-header">
        <h2 className="section-card-title">Description</h2>
      </div>
      <div className="section-card-body">
        {description ? (
          <p data-testid="description-text" className="description-text">
            {description}
          </p>
        ) : (
          <div className="empty-state" data-testid="description-empty">
            <p className="empty-state-message">No description available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
