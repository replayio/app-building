import { useNavigate } from "react-router-dom";
import { type DealItem } from "../clientDetailSlice";

interface DealsSectionProps {
  deals: DealItem[];
}

function formatCurrency(value: number | null): string {
  if (value == null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DealsSection({ deals }: DealsSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="detail-section" data-testid="deals-section">
      <div className="detail-section-header">
        <h3 className="detail-section-title">Deals</h3>
      </div>
      <div className="detail-section-body">
        {deals.length === 0 ? (
          <p className="detail-section-empty" data-testid="deals-empty">
            No deals
          </p>
        ) : (
          deals.map((deal) => (
            <div
              key={deal.id}
              className="deal-card"
              data-testid="deal-card"
              onClick={() => navigate(`/deals/${deal.id}`)}
            >
              <div className="deal-info">
                <div className="deal-name" data-testid="deal-name">
                  {deal.name}
                </div>
                <div className="deal-meta">
                  <span data-testid="deal-stage">Stage: {deal.stage}</span>
                </div>
              </div>
              <div className="deal-value" data-testid="deal-value">
                {deal.value != null ? `Value: ${formatCurrency(deal.value)}` : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
