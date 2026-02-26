import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Supplier } from "../slices/suppliersSlice";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";
import "./SupplierOverview.css";

const SUPPLIER_STATUSES = ["Active", "Inactive", "On Hold", "Suspended"];

interface SupplierOverviewProps {
  supplier: Supplier;
  onUpdate: (data: Partial<Supplier>) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function SupplierOverview({ supplier, onUpdate, onDelete }: SupplierOverviewProps) {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusDotColor = (() => {
    switch (supplier.status) {
      case "Active": return "var(--status-success)";
      case "Inactive": return "var(--text-muted)";
      case "On Hold": return "var(--status-warning)";
      case "Suspended": return "var(--status-error)";
      default: return "var(--text-muted)";
    }
  })();

  const handleDelete = async () => {
    await onDelete();
    navigate("/");
  };

  return (
    <div className="section-card" data-testid="supplier-overview">
      <div className="section-card-header">
        <h2 className="section-card-title">Supplier Overview</h2>
        <div className="supplier-overview-actions">
          <div className="supplier-status-indicator" data-testid="supplier-status-badge">
            <span className="status-dot" style={{ backgroundColor: statusDotColor }} />
            <span className="status-label">Status: {supplier.status}</span>
          </div>
          <button
            className="btn-secondary"
            data-testid="supplier-edit-btn"
            onClick={() => setShowEditModal(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span className="btn-label">Edit</span>
          </button>
          <button
            className="btn-danger"
            data-testid="supplier-delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span className="btn-label">Delete</span>
          </button>
          <button
            className="btn-secondary"
            data-testid="back-to-dashboard-btn"
            onClick={() => navigate("/")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span className="btn-label">Back to Dashboard</span>
          </button>
        </div>
      </div>
      <div className="section-card-body">
        <div className="supplier-details-grid">
          <div className="detail-field" data-testid="supplier-field-name">
            <span className="detail-field-label">Supplier Name</span>
            <span className="detail-field-value">{supplier.name}</span>
          </div>
          <div className="detail-field" data-testid="supplier-field-address">
            <span className="detail-field-label">Address</span>
            <span className="detail-field-value supplier-address">
              {supplier.address.split(",").map((part, i) => (
                <span key={i}>{part.trim()}</span>
              ))}
            </span>
          </div>
          <div className="detail-field" data-testid="supplier-field-contact">
            <span className="detail-field-label">Contact</span>
            <span className="detail-field-value supplier-contact">
              <span>{supplier.contact_name}</span>
              {supplier.phone && <span>{supplier.phone}</span>}
              {supplier.email && <span>{supplier.email}</span>}
            </span>
          </div>
          <div className="detail-field" data-testid="supplier-field-description">
            <span className="detail-field-label">Description</span>
            <span className="detail-field-value">{supplier.description}</span>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditSupplierModal
          supplier={supplier}
          onClose={() => setShowEditModal(false)}
          onSave={async (data) => {
            await onUpdate(data);
            setShowEditModal(false);
          }}
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

interface EditSupplierForm {
  name: string;
  address: string;
  contact_name: string;
  phone: string;
  email: string;
  description: string;
  status: string;
}

function EditSupplierModal({
  supplier,
  onClose,
  onSave,
}: {
  supplier: Supplier;
  onClose: () => void;
  onSave: (data: EditSupplierForm) => Promise<void>;
}) {
  const [form, setForm] = useState<EditSupplierForm>({
    name: supplier.name,
    address: supplier.address,
    contact_name: supplier.contact_name,
    phone: supplier.phone,
    email: supplier.email,
    description: supplier.description,
    status: supplier.status,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const update = (field: keyof EditSupplierForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Supplier name is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="edit-supplier-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Supplier</h2>
          <button className="modal-close-btn" data-testid="edit-supplier-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Supplier Name *</label>
          <input
            className="form-input"
            data-testid="edit-supplier-form-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Enter supplier name"
          />
          {errors.name && <div className="form-error" data-testid="edit-supplier-form-name-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea
            className="form-textarea"
            data-testid="edit-supplier-form-address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Enter address"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Contact Name</label>
            <input
              className="form-input"
              data-testid="edit-supplier-form-contact-name"
              value={form.contact_name}
              onChange={(e) => update("contact_name", e.target.value)}
              placeholder="Enter contact name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              data-testid="edit-supplier-form-phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            data-testid="edit-supplier-form-email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Enter email"
            type="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            data-testid="edit-supplier-form-description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Enter description"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <div className="filter-select" style={{ position: "relative" }}>
            <button
              className="filter-select-trigger"
              data-testid="edit-supplier-form-status"
              type="button"
              onClick={() => setStatusOpen(!statusOpen)}
            >
              <span className="filter-select-value">{form.status}</span>
              <svg className={`filter-select-chevron${statusOpen ? " filter-select-chevron--open" : ""}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {statusOpen && (
              <div className="filter-select-dropdown" data-testid="edit-supplier-form-status-dropdown">
                <div className="filter-select-options">
                  {SUPPLIER_STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`filter-select-option${s === form.status ? " filter-select-option--selected" : ""}`}
                      data-testid={`edit-supplier-form-status-option-${s.toLowerCase().replace(/ /g, "-")}`}
                      type="button"
                      onClick={() => {
                        update("status", s);
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

        <div className="modal-footer">
          <button className="btn-secondary" data-testid="edit-supplier-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" data-testid="edit-supplier-save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
