import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Order } from "../slices/ordersSlice";
import { formatDate } from "@shared/utils/date";
import { formatCurrency } from "@shared/utils/currency";
import "./OrderSummary.css";

const ORDER_STATUSES = ["Pending", "Approved", "Shipped", "Delivered", "Cancelled"];

interface OrderSummaryProps {
  order: Order;
  onUpdate: (data: { status?: string; expected_delivery?: string }) => Promise<void>;
}

function getStatusBadgeClass(status: string): string {
  const key = status.toLowerCase().replace(/ /g, "-");
  return `badge badge--${key}`;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "Approved":
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "Pending":
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "Shipped":
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case "Delivered":
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "Cancelled":
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    default:
      return null;
  }
}

export function OrderSummary({ order, onUpdate }: OrderSummaryProps) {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="section-card" data-testid="order-summary">
      <div className="section-card-header">
        <div className="order-summary-title-block">
          <h2 className="section-card-title">Order Summary</h2>
          <span className="order-summary-subtitle" data-testid="order-summary-subtitle">
            Purchase Order #{order.order_id} Details
          </span>
        </div>
        <div className="order-summary-actions">
          <button
            className="btn-secondary"
            data-testid="order-edit-btn"
            onClick={() => setShowEditModal(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span className="btn-label">Edit</span>
          </button>
          <button
            className="btn-secondary"
            data-testid="order-print-btn"
            onClick={() => window.print()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span className="btn-label">Print</span>
          </button>
        </div>
      </div>
      <div className="section-card-body">
        <div className="order-summary-grid">
          <div className="order-summary-field" data-testid="order-field-supplier">
            <span className="order-summary-field-label">Supplier</span>
            <span className="order-summary-field-value">
              <a
                className="order-supplier-link"
                data-testid="order-supplier-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/suppliers/${order.supplier_id}`);
                }}
              >
                {order.supplier_name}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </span>
          </div>
          <div className="order-summary-field" data-testid="order-field-order-date">
            <span className="order-summary-field-label">Order Date</span>
            <span className="order-summary-field-value">{formatDate(order.order_date)}</span>
          </div>
          <div className="order-summary-field" data-testid="order-field-expected-delivery">
            <span className="order-summary-field-label">Expected Delivery</span>
            <span className="order-summary-field-value">{formatDate(order.expected_delivery)}</span>
          </div>
          <div className="order-summary-field" data-testid="order-field-status">
            <span className="order-summary-field-label">Status</span>
            <span className="order-summary-field-value">
              <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`} data-testid="order-status-badge">
                <StatusIcon status={order.status} />
                {order.status}
              </span>
            </span>
          </div>
          <div className="order-summary-field" data-testid="order-field-overall-cost">
            <span className="order-summary-field-label">Overall Cost</span>
            <span className="order-summary-field-value order-summary-field-value--large" data-testid="order-overall-cost">
              {formatCurrency(order.total_cost)}
            </span>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditOrderModal
          order={order}
          onClose={() => setShowEditModal(false)}
          onSave={async (data) => {
            await onUpdate(data);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}

interface EditOrderForm {
  status: string;
  expected_delivery: string;
}

function EditOrderModal({
  order,
  onClose,
  onSave,
}: {
  order: Order;
  onClose: () => void;
  onSave: (data: EditOrderForm) => Promise<void>;
}) {
  const [form, setForm] = useState<EditOrderForm>({
    status: order.status,
    expected_delivery: order.expected_delivery ? order.expected_delivery.slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="edit-order-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Order</h2>
          <button className="modal-close-btn" data-testid="edit-order-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <div className="filter-select" style={{ position: "relative" }}>
            <button
              className="filter-select-trigger"
              data-testid="edit-order-form-status"
              type="button"
              onClick={() => setStatusOpen(!statusOpen)}
            >
              <span className="filter-select-value">{form.status}</span>
              <svg className={`filter-select-chevron${statusOpen ? " filter-select-chevron--open" : ""}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {statusOpen && (
              <div className="filter-select-dropdown" data-testid="edit-order-form-status-dropdown">
                <div className="filter-select-options">
                  {ORDER_STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`filter-select-option${s === form.status ? " filter-select-option--selected" : ""}`}
                      data-testid={`edit-order-status-option-${s.toLowerCase()}`}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, status: s }));
                        setStatusOpen(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Expected Delivery</label>
          <input
            className="form-input"
            data-testid="edit-order-form-expected-delivery"
            type="date"
            value={form.expected_delivery}
            onChange={(e) => setForm((f) => ({ ...f, expected_delivery: e.target.value }))}
          />
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" data-testid="edit-order-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" data-testid="edit-order-save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
