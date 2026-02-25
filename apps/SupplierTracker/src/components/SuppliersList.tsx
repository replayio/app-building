import { useNavigate } from "react-router-dom";
import type { Supplier } from "../slices/suppliersSlice";
import "./SuppliersList.css";

function getStatusBadgeClass(status: string): string {
  const key = status.toLowerCase().replace(/ /g, "-");
  return `badge badge--${key}`;
}

function formatOrdersValue(value: number): string {
  if (value >= 1000) {
    const k = Math.round(value / 1000);
    return `$${k}k`;
  }
  return `$${value}`;
}

export function SuppliersList({ suppliers }: { suppliers: Supplier[] }) {
  const navigate = useNavigate();

  return (
    <div className="suppliers-list" data-testid="suppliers-list">
      <div className="suppliers-list-header">
        <h2 className="suppliers-list-title" data-testid="suppliers-list-heading">
          Suppliers List
        </h2>
      </div>

      {suppliers.length === 0 ? (
        <div className="empty-state" data-testid="suppliers-list-empty">
          <p className="empty-state-message">
            No suppliers found. Click &apos;Add New Supplier&apos; to get started.
          </p>
        </div>
      ) : (
        <div className="suppliers-grid" data-testid="suppliers-grid">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="supplier-card"
              data-testid={`supplier-card-${supplier.id}`}
              onClick={() => navigate(`/suppliers/${supplier.id}`)}
            >
              <div className="supplier-card-header">
                <span className="supplier-card-name" data-testid={`supplier-name-${supplier.id}`}>
                  {supplier.name}
                </span>
                <span
                  className={getStatusBadgeClass(supplier.status)}
                  data-testid={`supplier-status-${supplier.id}`}
                >
                  {supplier.status}
                </span>
              </div>
              <div className="supplier-card-contact" data-testid={`supplier-contact-${supplier.id}`}>
                {supplier.contact_name}
              </div>
              <div className="supplier-card-email" data-testid={`supplier-email-${supplier.id}`}>
                {supplier.email}
              </div>
              <div className="supplier-card-orders" data-testid={`supplier-orders-${supplier.id}`}>
                {(supplier.open_orders_count ?? 0)} Open Orders, {formatOrdersValue(supplier.open_orders_value ?? 0)} Value
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
