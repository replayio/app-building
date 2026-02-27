import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { createSupplier, fetchSuppliers } from "../slices/suppliersSlice";
import { createOrder, fetchOrders } from "../slices/ordersSlice";
import { SearchableSelect } from "@shared/components/SearchableSelect";
import "./QuickActions.css";

interface LineItemInput {
  sku: string;
  item_name: string;
  quantity: string;
  unit_price: string;
}

const SUPPLIER_STATUSES = ["Active", "Inactive", "On Hold", "Suspended"];

const emptyLineItem = (): LineItemInput => ({
  sku: "",
  item_name: "",
  quantity: "",
  unit_price: "",
});

export function QuickActions() {
  const dispatch = useAppDispatch();
  const suppliers = useAppSelector((s) => s.suppliers.items);

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  return (
    <div className="quick-actions" data-testid="quick-actions">
      <h2 className="quick-actions-title" data-testid="quick-actions-heading">Quick Actions</h2>
      <div className="quick-actions-buttons">
        {/* Test: Add New Supplier Button Opens Create Supplier Dialog */}
        <button
          className="quick-action-btn"
          data-testid="quick-action-add-supplier"
          onClick={() => setShowSupplierModal(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Add New Supplier
        </button>

        {/* Test: Create Purchase Order Button Opens Create Order Dialog */}
        <button
          className="quick-action-btn"
          data-testid="quick-action-create-order"
          onClick={() => setShowOrderModal(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          Create Purchase Order
        </button>
      </div>

      {showSupplierModal && (
        <AddSupplierModal
          onClose={() => setShowSupplierModal(false)}
          onSave={async (data) => {
            await dispatch(createSupplier(data)).unwrap();
            await dispatch(fetchSuppliers());
            setShowSupplierModal(false);
          }}
        />
      )}

      {showOrderModal && (
        <CreateOrderModal
          suppliers={suppliers}
          onClose={() => setShowOrderModal(false)}
          onSave={async (data) => {
            await dispatch(createOrder(data)).unwrap();
            await dispatch(fetchOrders());
            setShowOrderModal(false);
          }}
        />
      )}
    </div>
  );
}

/* Add Supplier Modal */

interface AddSupplierForm {
  name: string;
  address: string;
  contact_name: string;
  phone: string;
  email: string;
  description: string;
  status: string;
}

function AddSupplierModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: AddSupplierForm) => Promise<void>;
}) {
  const [form, setForm] = useState<AddSupplierForm>({
    name: "",
    address: "",
    contact_name: "",
    phone: "",
    email: "",
    description: "",
    status: "Active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const update = (field: keyof AddSupplierForm, value: string) => {
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
    // Test: Create Supplier Dialog Cancel Does Not Create Supplier
    <div className="modal-overlay" data-testid="add-supplier-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Supplier</h2>
          {/* Test: Create Supplier Dialog Cancel Does Not Create Supplier */}
          <button className="modal-close-btn" data-testid="add-supplier-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Supplier Name *</label>
          {/* Test: Create Supplier via Dialog Saves and Updates Dashboard, Create Supplier Dialog Validation */}
          <input
            className="form-input"
            data-testid="supplier-form-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Enter supplier name"
          />
          {errors.name && <div className="form-error" data-testid="supplier-form-name-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          {/* Test: Create Supplier via Dialog Saves and Updates Dashboard */}
          <textarea
            className="form-textarea"
            data-testid="supplier-form-address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Enter address"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Contact Name</label>
            {/* Test: Create Supplier via Dialog Saves and Updates Dashboard */}
            <input
              className="form-input"
              data-testid="supplier-form-contact-name"
              value={form.contact_name}
              onChange={(e) => update("contact_name", e.target.value)}
              placeholder="Enter contact name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            {/* Test: Create Supplier via Dialog Saves and Updates Dashboard */}
            <input
              className="form-input"
              data-testid="supplier-form-phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          {/* Test: Create Supplier via Dialog Saves and Updates Dashboard */}
          <input
            className="form-input"
            data-testid="supplier-form-email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Enter email"
            type="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          {/* Test: Create Supplier via Dialog Saves and Updates Dashboard */}
          <textarea
            className="form-textarea"
            data-testid="supplier-form-description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Enter description"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <div className="filter-select" style={{ position: "relative" }}>
            {/* Test: Create Supplier via Dialog Saves and Updates Dashboard */}
            <button
              className="filter-select-trigger"
              data-testid="supplier-form-status"
              type="button"
              onClick={() => setStatusOpen(!statusOpen)}
            >
              <span className="filter-select-value">{form.status}</span>
              <svg className={`filter-select-chevron${statusOpen ? " filter-select-chevron--open" : ""}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {statusOpen && (
              <div className="filter-select-dropdown" data-testid="supplier-form-status-dropdown">
                <div className="filter-select-options">
                  {/* Test: Create Supplier via Dialog Saves and Updates Dashboard */}
                  {SUPPLIER_STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`filter-select-option${s === form.status ? " filter-select-option--selected" : ""}`}
                      data-testid={`supplier-form-status-option-${s.toLowerCase().replace(/ /g, "-")}`}
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
          {/* Test: Create Supplier Dialog Cancel Does Not Create Supplier */}
          <button className="btn-secondary" data-testid="add-supplier-cancel" onClick={onClose}>
            Cancel
          </button>
          {/* Test: Create Supplier via Dialog Saves and Updates Dashboard, Create Supplier Dialog Validation */}
          <button className="btn-primary" data-testid="add-supplier-save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Create Order Modal */

interface CreateOrderData {
  supplier_id: string;
  order_date: string;
  expected_delivery: string;
  line_items: { sku: string; item_name: string; quantity: number; unit_price: number }[];
}

function CreateOrderModal({
  suppliers,
  onClose,
  onSave,
}: {
  suppliers: { id: string; name: string }[];
  onClose: () => void;
  onSave: (data: CreateOrderData) => Promise<void>;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [supplierId, setSupplierId] = useState("");
  const [orderDate, setOrderDate] = useState(today);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [lineItems, setLineItems] = useState<LineItemInput[]>([emptyLineItem()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const supplierOptions = suppliers.map((s) => ({ id: s.id, label: s.name }));

  const updateLineItem = (index: number, field: keyof LineItemInput, value: string) => {
    setLineItems((items) => {
      const next = [...items];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((items) => items.filter((_, i) => i !== index));
  };

  const addLineItem = () => {
    setLineItems((items) => [...items, emptyLineItem()]);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!supplierId) newErrors.supplier = "Supplier is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const parsedLineItems = lineItems
      .filter((li) => li.item_name.trim())
      .map((li) => ({
        sku: li.sku,
        item_name: li.item_name,
        quantity: parseInt(li.quantity, 10) || 0,
        unit_price: parseFloat(li.unit_price) || 0,
      }));

    setSaving(true);
    try {
      await onSave({
        supplier_id: supplierId,
        order_date: orderDate || today,
        expected_delivery: expectedDelivery || null as unknown as string,
        line_items: parsedLineItems,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    // Test: Create Order Dialog Cancel Does Not Create Order
    <div className="modal-overlay" data-testid="create-order-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Purchase Order</h2>
          {/* Test: Create Order Dialog Cancel Does Not Create Order */}
          <button className="modal-close-btn" data-testid="create-order-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Supplier *</label>
          {/* Test: Create Order via Dialog Saves and Updates Dashboard, Create Order Dialog Validation */}
          <SearchableSelect
            options={supplierOptions}
            value={supplierId}
            onChange={(id) => {
              setSupplierId(id);
              if (errors.supplier) setErrors((e) => ({ ...e, supplier: "" }));
            }}
            placeholder="Search suppliers..."
            testId="order-form-supplier"
          />
          {errors.supplier && <div className="form-error" data-testid="order-form-supplier-error">{errors.supplier}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Order Date</label>
            {/* Test: Create Order via Dialog Saves and Updates Dashboard */}
            <input
              className="form-input"
              data-testid="order-form-order-date"
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Expected Delivery</label>
            {/* Test: Create Order via Dialog Saves and Updates Dashboard */}
            <input
              className="form-input"
              data-testid="order-form-expected-delivery"
              type="date"
              value={expectedDelivery}
              onChange={(e) => setExpectedDelivery(e.target.value)}
            />
          </div>
        </div>

        <div className="line-items-section">
          <div className="line-items-section-header">
            <span className="line-items-section-title">Line Items</span>
            {/* Test: Create Order via Dialog Saves and Updates Dashboard */}
            <button className="add-line-item-btn" data-testid="order-form-add-line-item" type="button" onClick={addLineItem}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Item
            </button>
          </div>

          {/* Test: Create Order via Dialog Saves and Updates Dashboard */}
          {lineItems.map((li, idx) => (
            <div className="line-item-row" key={idx} data-testid={`order-form-line-item-${idx}`}>
              <input
                className="form-input"
                data-testid={`order-form-line-item-sku-${idx}`}
                placeholder="SKU"
                value={li.sku}
                onChange={(e) => updateLineItem(idx, "sku", e.target.value)}
              />
              <input
                className="form-input"
                data-testid={`order-form-line-item-name-${idx}`}
                placeholder="Item Name / Description"
                value={li.item_name}
                onChange={(e) => updateLineItem(idx, "item_name", e.target.value)}
              />
              <input
                className="form-input"
                data-testid={`order-form-line-item-qty-${idx}`}
                placeholder="Qty"
                type="number"
                value={li.quantity}
                onChange={(e) => updateLineItem(idx, "quantity", e.target.value)}
              />
              <input
                className="form-input"
                data-testid={`order-form-line-item-price-${idx}`}
                placeholder="Unit Price"
                type="number"
                step="0.01"
                value={li.unit_price}
                onChange={(e) => updateLineItem(idx, "unit_price", e.target.value)}
              />
              <button
                className="line-item-remove-btn"
                data-testid={`order-form-line-item-remove-${idx}`}
                type="button"
                onClick={() => removeLineItem(idx)}
                disabled={lineItems.length <= 1}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          {/* Test: Create Order Dialog Cancel Does Not Create Order */}
          <button className="btn-secondary" data-testid="create-order-cancel" onClick={onClose}>
            Cancel
          </button>
          {/* Test: Create Order via Dialog Saves and Updates Dashboard, Create Order Dialog Validation */}
          <button className="btn-primary" data-testid="create-order-save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
