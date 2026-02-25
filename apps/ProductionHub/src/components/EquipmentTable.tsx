import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@shared/components/Pagination";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";
import type { Equipment } from "../types";
import { useAppDispatch } from "../hooks";
import { deleteEquipment, updateEquipment } from "../slices/equipmentSlice";

const PAGE_SIZE = 5;

interface EquipmentTableProps {
  items: Equipment[];
}

export function EquipmentTable({ items }: EquipmentTableProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageItems = items.slice(startIndex, startIndex + PAGE_SIZE);

  const handleDelete = async () => {
    if (deletingId) {
      await dispatch(deleteEquipment(deletingId));
      setDeletingId(null);
    }
  };

  return (
    <div data-testid="equipment-table-container">
      <div className="section-card">
        <table className="data-table" data-testid="equipment-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Available Units</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">
                    <p className="empty-state-message">No equipment found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pageItems.map((item) => (
                <tr
                  key={item.id}
                  className="clickable"
                  data-testid={`equipment-row-${item.id}`}
                  onClick={() => navigate(`/equipment/${item.id}`)}
                >
                  <td data-testid={`equipment-title-${item.id}`}>
                    {item.name}
                  </td>
                  <td data-testid={`equipment-description-${item.id}`}>
                    {item.description}
                  </td>
                  <td data-testid={`equipment-units-${item.id}`}>
                    {item.available_units}
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", gap: 4 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="btn-ghost"
                        data-testid={`equipment-edit-btn-${item.id}`}
                        onClick={() => setEditingItem(item)}
                        aria-label={`Edit ${item.name}`}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="btn-danger"
                        data-testid={`equipment-delete-btn-${item.id}`}
                        onClick={() => setDeletingId(item.id)}
                        aria-label={`Delete ${item.name}`}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      <ConfirmDialog
        open={deletingId !== null}
        title="Delete Equipment"
        message="Are you sure you want to delete this equipment? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
      {editingItem && (
        <EditEquipmentModal
          equipment={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={async (data) => {
            await dispatch(updateEquipment({ id: editingItem.id, ...data }));
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

interface EditEquipmentModalProps {
  equipment: Equipment;
  onClose: () => void;
  onSubmit: (data: Partial<Equipment>) => Promise<void>;
}

function EditEquipmentModal({
  equipment,
  onClose,
  onSubmit,
}: EditEquipmentModalProps) {
  const [title, setTitle] = useState(equipment.name);
  const [description, setDescription] = useState(equipment.description);
  const [availableUnits, setAvailableUnits] = useState(
    String(equipment.available_units)
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    await onSubmit({
      name: title.trim(),
      description: description.trim(),
      available_units: parseInt(availableUnits, 10) || 0,
    });
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" data-testid="edit-equipment-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Equipment</h2>
          <button
            className="modal-close-btn"
            data-testid="edit-equipment-modal-close"
            onClick={onClose}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            data-testid="edit-equipment-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Equipment name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            data-testid="edit-equipment-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Equipment description"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Available Units</label>
          <input
            className="form-input"
            data-testid="edit-equipment-units-input"
            type="number"
            min="0"
            value={availableUnits}
            onChange={(e) => setAvailableUnits(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="modal-footer">
          <button
            className="btn-secondary"
            data-testid="edit-equipment-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            data-testid="edit-equipment-submit-btn"
            disabled={!title.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
