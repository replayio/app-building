import type { Order } from "../slices/ordersSlice";
import { formatCurrency } from "@shared/utils/currency";
import "./CostBreakdown.css";

interface CostBreakdownProps {
  order: Order;
}

export function CostBreakdown({ order }: CostBreakdownProps) {
  const taxLabel = order.tax_rate ? `Tax (${order.tax_rate}%):` : "Tax:";
  const discountLabel = order.discount_label
    ? `Discount (${order.discount_label}):`
    : "Discount:";
  const currencyLabel = order.currency ? ` (${order.currency})` : "";

  return (
    <div className="section-card" data-testid="cost-breakdown">
      <div className="section-card-header">
        <h2 className="section-card-title">Cost Breakdown</h2>
      </div>
      <div className="section-card-body">
        <div className="cost-breakdown-list">
          <div className="cost-breakdown-row" data-testid="cost-subtotal">
            <span className="cost-breakdown-label">Subtotal:</span>
            <span className="cost-breakdown-value">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="cost-breakdown-row" data-testid="cost-tax">
            <span className="cost-breakdown-label">{taxLabel}</span>
            <span className="cost-breakdown-value">{formatCurrency(order.tax_amount)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="cost-breakdown-row" data-testid="cost-discount">
              <span className="cost-breakdown-label">{discountLabel}</span>
              <span className="cost-breakdown-value cost-breakdown-value--discount">
                -{formatCurrency(order.discount_amount)}
              </span>
            </div>
          )}
          <div className="cost-breakdown-row cost-breakdown-row--total" data-testid="cost-total">
            <span className="cost-breakdown-label">Total Cost:</span>
            <span className="cost-breakdown-value">
              {formatCurrency(order.total_cost)}{currencyLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
