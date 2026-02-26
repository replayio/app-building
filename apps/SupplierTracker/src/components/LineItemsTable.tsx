import { useState } from "react";
import type { LineItem } from "../slices/ordersSlice";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";
import { formatCurrency } from "@shared/utils/currency";
import "./LineItemsTable.css";

interface LineItemsTableProps {
  lineItems: LineItem[];
  onAdd: (data: { sku: string; item_name: string; quantity: number; unit_price: number }) => Promise<void>;
  onEdit: (lineItemId: string, data: { sku: string; item_name: string; quantity: number; unit_price: number }) => Promise<void>;
  onDelete: (lineItemId: string) => Promise<void>;
}

export function LineItemsTable({ lineItems, onAdd, onEdit, onDelete }: LineItemsTableProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LineItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<LineItem | null>(null);

  return (
    <div className="section-card" data-testid="line-items-section">
      <div className="section-card-header">
        <h2 className="section-card-title">Line Items</h2>
        <button
          className="btn-primary"
          data-testid="add-line-item-btn"
          onClick={() => setShowAddModal(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="btn-label">Add Item</span>
        </button>
      </div>
      <div className="section-card-body" style={{ padding: 0 }}>
        {lineItems.length === 0 ? (
          <div className="empty-state" data-testid="line-items-empty">
            <p className="empty-state-message">No line items yet. Click "Add Item" to get started.</p>
          </div>
        ) : (
          <table className="data-table line-items-table" data-testid="line-items-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Item Name / Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Line Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id} data-testid="line-item-row">
                  <td data-testid="line-item-sku">{item.sku}</td>
                  <td data-testid="line-item-name">{item.item_name}</td>
                  <td data-testid="line-item-qty">{item.quantity}</td>
                  <td data-testid="line-item-unit-price">{formatCurrency(item.unit_price)}</td>
                  <td data-testid="line-item-total">{formatCurrency(item.line_total)}</td>
                  <td>
                    <div className="line-items-actions-cell">
                      <button
                        className="btn-ghost"
                        data-testid="line-item-edit-btn"
                        title="Edit"
                        onClick={() => setEditingItem(item)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="btn-ghost doc-action-danger"
                        data-testid="line-item-delete-btn"
                        title="Delete"
                        onClick={() => setDeletingItem(item)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <LineItemModal
          title="Add Line Item"
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            await onAdd(data);
            setShowAddModal(false);
          }}
        />
      )}

      {editingItem && (
        <LineItemModal
          title="Edit Line Item"
          initialValues={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={async (data) => {
            await onEdit(editingItem.id, data);
            setEditingItem(null);
          }}
        />
      )}

      {/* Tests: Delete Line Item, Delete Line Item Confirmation Dismiss Does Not Delete Item */}
      <ConfirmDialog
        open={!!deletingItem}
        title="Delete Line Item"
        message="Are you sure you want to delete this line item?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          if (deletingItem) {
            await onDelete(deletingItem.id);
            setDeletingItem(null);
          }
        }}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
}

interface LineItemFormData {
  sku: string;
  item_name: string;
  quantity: number;
  unit_price: number;
}

function LineItemModal({
  title,
  initialValues,
  onClose,
  onSave,
}: {
  title: string;
  initialValues?: LineItem;
  onClose: () => void;
  onSave: (data: LineItemFormData) => Promise<void>;
}) {
  const [form, setForm] = useState<LineItemFormData>({
    sku: initialValues?.sku || "",
    item_name: initialValues?.item_name || "",
    quantity: initialValues?.quantity || 0,
    unit_price: initialValues?.unit_price || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const update = (field: keyof LineItemFormData, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.item_name.trim()) newErrors.item_name = "Item name is required";
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
    <div className="modal-overlay" data-testid="line-item-modal" onClick={onClose}>
      <div className="modal-content line-item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-btn" data-testid="line-item-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input
              className="form-input"
              data-testid="line-item-form-sku"
              value={form.sku}
              onChange={(e) => update("sku", e.target.value)}
              placeholder="Enter SKU"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Item Name / Description *</label>
            <input
              className="form-input"
              data-testid="line-item-form-name"
              value={form.item_name}
              onChange={(e) => update("item_name", e.target.value)}
              placeholder="Enter item name"
            />
            {errors.item_name && <div className="form-error" data-testid="line-item-form-name-error">{errors.item_name}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Qty</label>
            <input
              className="form-input"
              data-testid="line-item-form-qty"
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => update("quantity", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Unit Price</label>
            <input
              className="form-input"
              data-testid="line-item-form-unit-price"
              type="number"
              min="0"
              step="0.01"
              value={form.unit_price}
              onChange={(e) => update("unit_price", parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="modal-footer">
          {/* Tests: Add Line Item Dialog Cancel Does Not Add Item, Edit Line Item Dialog Cancel Does Not Modify Item */}
          <button className="btn-secondary" data-testid="line-item-cancel" onClick={onClose}>
            Cancel
          </button>
          {/* Tests: Add Line Item, Edit Line Item, Add Line Item Dialog Validation */}
          <button className="btn-primary" data-testid="line-item-save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
