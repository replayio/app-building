import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { updateMaterial } from "../slices/materialsSlice";
import { FilterSelect } from "@shared/components/FilterSelect";
import type { Material, MaterialCategory } from "../types";

interface MaterialsTableProps {
  materials: Material[];
  categories: MaterialCategory[];
}

export function MaterialsTable({ materials, categories }: MaterialsTableProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");

  const handleOpenEdit = (material: Material) => {
    setEditMaterial(material);
    setEditName(material.name);
    setEditCategoryId(material.category_id);
    setEditUnit(material.unit_of_measure);
    setEditDescription(material.description);
    setEditError("");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setEditError("Material Name is required");
      return;
    }
    if (!editMaterial) return;
    await dispatch(
      updateMaterial({
        id: editMaterial.id,
        name: editName.trim(),
        category_id: editCategoryId,
        unit_of_measure: editUnit.trim(),
        description: editDescription.trim(),
      })
    );
    setEditModalOpen(false);
  };

  const formatStock = (stock: number): string => {
    const num = Number(stock || 0);
    return num.toLocaleString("en-US");
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  if (materials.length === 0) {
    return (
      <div data-testid="materials-table-empty" className="empty-state">
        <p className="empty-state-message">No materials found</p>
      </div>
    );
  }

  return (
    <>
      <div className="section-card">
        <div className="section-card-body" style={{ padding: 0 }}>
          <table className="data-table" data-testid="materials-table">
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Category</th>
                <th>Unit of Measure</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr
                  key={material.id}
                  data-testid={`material-row-${material.id}`}
                >
                  <td>
                    <a
                      data-testid={`material-name-${material.id}`}
                      className="link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/materials/${material.id}`);
                      }}
                      href={`/materials/${material.id}`}
                    >
                      {material.name}
                    </a>
                  </td>
                  <td>
                    <span data-testid={`material-category-${material.id}`}>
                      {material.category_name}
                    </span>
                  </td>
                  <td>
                    <span data-testid={`material-unit-${material.id}`}>
                      {material.unit_of_measure}
                    </span>
                  </td>
                  <td>
                    <span data-testid={`material-stock-${material.id}`}>
                      {formatStock(material.stock ?? 0)}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <a
                        data-testid={`view-detail-link-${material.id}`}
                        className="link"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/materials/${material.id}`);
                        }}
                        href={`/materials/${material.id}`}
                      >
                        View Detail
                      </a>
                      <a
                        data-testid={`edit-link-${material.id}`}
                        className="link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleOpenEdit(material);
                        }}
                        href="#"
                      >
                        Edit
                      </a>
                      <button
                        data-testid={`view-icon-${material.id}`}
                        className="btn-ghost"
                        onClick={() => navigate(`/materials/${material.id}`)}
                        title="View Detail"
                        style={{ padding: 4 }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ width: 16, height: 16 }}
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        data-testid={`edit-icon-${material.id}`}
                        className="btn-ghost"
                        onClick={() => handleOpenEdit(material)}
                        title="Edit Material"
                        style={{ padding: 4 }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ width: 16, height: 16 }}
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Material Modal */}
      {editModalOpen && editMaterial && (
        <div
          className="modal-overlay"
          data-testid="edit-material-modal-overlay"
          onClick={() => setEditModalOpen(false)}
        >
          <div
            className="modal-content"
            data-testid="edit-material-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Edit Material</h2>
              <button
                className="modal-close-btn"
                data-testid="edit-material-modal-close"
                onClick={() => setEditModalOpen(false)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 18, height: 18 }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Material Name</label>
              <input
                className="form-input"
                data-testid="edit-material-name"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  setEditError("");
                }}
                placeholder="Enter material name"
              />
              {editError && (
                <p
                  data-testid="edit-material-error"
                  style={{
                    color: "var(--status-error)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {editError}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <FilterSelect
                options={categoryOptions}
                value={editCategoryId}
                onChange={setEditCategoryId}
                placeholder="Select category"
                testId="edit-material-category"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <input
                className="form-input"
                data-testid="edit-material-unit"
                value={editUnit}
                onChange={(e) => setEditUnit(e.target.value)}
                placeholder="Enter unit of measure"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                data-testid="edit-material-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                data-testid="edit-material-cancel-btn"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                data-testid="edit-material-save-btn"
                onClick={handleSaveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
