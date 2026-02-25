import { useNavigate } from "react-router-dom";
import type { UserDeal } from "../userDetailSlice";

function formatValue(value: number | null): string {
  if (value == null) return "—";
  return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getStageClass(stage: string): string {
  switch (stage) {
    case "Lead":
      return "user-deal-stage--lead";
    case "Qualified":
      return "user-deal-stage--qualified";
    case "Proposal":
      return "user-deal-stage--proposal";
    case "Negotiation":
      return "user-deal-stage--negotiation";
    case "Closed Won":
      return "user-deal-stage--won";
    case "Closed Lost":
      return "user-deal-stage--lost";
    default:
      return "";
  }
}

interface OwnedDealsListProps {
  deals: UserDeal[];
}

export function OwnedDealsList({ deals }: OwnedDealsListProps) {
  const navigate = useNavigate();

  return (
    <div className="user-detail-section" data-testid="owned-deals-list">
      <h2 className="user-detail-section-title">Owned Deals</h2>
      {deals.length === 0 ? (
        <div className="user-detail-section-empty" data-testid="owned-deals-empty">
          No owned deals
        </div>
      ) : (
        <div className="user-detail-list">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="user-detail-list-item user-detail-list-item--clickable"
              data-testid="owned-deal-item"
              onClick={() => navigate(`/deals/${deal.id}`)}
            >
              <div className="user-detail-list-item-main">
                <span className="user-detail-list-item-name" data-testid="deal-name">
                  {deal.name}
                </span>
                {deal.clientName && (
                  <span className="user-detail-list-item-meta" data-testid="deal-client">
                    {deal.clientName}
                  </span>
                )}
              </div>
              <div className="user-detail-list-item-right">
                <span className={`user-deal-stage ${getStageClass(deal.stage)}`} data-testid="deal-stage">
                  {deal.stage}
                </span>
                <span className="user-detail-list-item-value" data-testid="deal-value">
                  {formatValue(deal.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
