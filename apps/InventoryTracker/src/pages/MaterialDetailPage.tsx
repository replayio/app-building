import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchMaterialById,
  updateMaterial,
  clearCurrentMaterial,
} from "../slices/materialsSlice";
import { fetchBatches } from "../slices/batchesSlice";
import { fetchTransactions, clearTransactions } from "../slices/transactionsSlice";
import { fetchAccounts } from "../slices/accountsSlice";
import { fetchCategories } from "../slices/categoriesSlice";
import { MaterialHeader } from "../components/MaterialHeader";
import {
  AccountsDistributionTable,
  type AccountDistribution,
} from "../components/AccountsDistributionTable";
import { AllBatchesTable } from "../components/AllBatchesTable";
import { TransactionsHistoryTable } from "../components/TransactionsHistoryTable";
import { FilterSelect } from "@shared/components/FilterSelect";
import type { Account, MaterialCategory } from "../types";

export function MaterialDetailPage() {
  const { materialId } = useParams<{ materialId: string }>();
  const dispatch = useAppDispatch();
  const { currentMaterial: material, loading: materialLoading } =
    useAppSelector((state) => state.materials);
  const { items: allBatches } = useAppSelector((state) => state.batches);
  const { items: transactions } = useAppSelector((state) => state.transactions);
  const { items: accounts } = useAppSelector((state) => state.accounts);
  const { items: categories } = useAppSelector((state) => state.categories);

  // Distribution data (derived from batches)
  const [distribution, setDistribution] = useState<AccountDistribution[]>([]);

  // Edit material modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Create batch modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchAccountId, setBatchAccountId] = useState("");
  const [batchQuantity, setBatchQuantity] = useState("");
  const [batchLocation, setBatchLocation] = useState("");
  const [batchLotNumber, setBatchLotNumber] = useState("");
  const [batchExpiration, setBatchExpiration] = useState("");
  const [batchErrors, setBatchErrors] = useState<Record<string, string>>({});

  const loadData = useCallback(() => {
    if (materialId) {
      dispatch(fetchMaterialById(materialId));
      dispatch(fetchBatches({ material_id: materialId }));
      dispatch(fetchTransactions({ material_id: materialId }));
      dispatch(fetchAccounts());
      dispatch(fetchCategories());

      // Fetch distribution data
      fetch(
        `/.netlify/functions/material-distribution?material_id=${materialId}`
      )
        .then((r) => r.json())
        .then((data) => setDistribution(data))
        .catch(() => setDistribution([]));
    }
  }, [dispatch, materialId]);

  useEffect(() => {
    loadData();
    return () => {
      dispatch(clearCurrentMaterial());
      dispatch(clearTransactions());
    };
  }, [loadData, dispatch]);

  // Edit material handlers
  const handleOpenEdit = () => {
    if (!material) return;
    setEditName(material.name);
    setEditCategoryId(material.category_id);
    setEditUnit(material.unit_of_measure);
    setEditDescription(material.description);
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    const errors: Record<string, string> = {};
    if (!editName.trim()) errors.name = "Material Name is required";
    if (!editCategoryId) errors.category = "Category is required";
    if (!editUnit.trim()) errors.unit = "Unit of Measure is required";

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    if (!material) return;
    await dispatch(
      updateMaterial({
        id: material.id,
        name: editName.trim(),
        category_id: editCategoryId,
        unit_of_measure: editUnit.trim(),
        description: editDescription.trim(),
      })
    );
    setEditModalOpen(false);
  };

  // Create batch handlers
  const handleOpenBatchModal = () => {
    setBatchAccountId("");
    setBatchQuantity("");
    setBatchLocation("");
    setBatchLotNumber("");
    setBatchExpiration("");
    setBatchErrors({});
    setBatchModalOpen(true);
  };

  const handleCreateBatch = async () => {
    const errors: Record<string, string> = {};
    if (!batchAccountId) errors.account = "Account is required";
    const qty = parseFloat(batchQuantity);
    if (!batchQuantity || isNaN(qty) || qty <= 0)
      errors.quantity = "Quantity must be a positive number";

    if (Object.keys(errors).length > 0) {
      setBatchErrors(errors);
      return;
    }

    if (!material) return;

    const res = await fetch("/.netlify/functions/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        material_id: material.id,
        account_id: batchAccountId,
        quantity: qty,
        unit: material.unit_of_measure,
        location: batchLocation.trim(),
        lot_number: batchLotNumber.trim(),
        expiration_date: batchExpiration || null,
      }),
    });

    if (!res.ok) return;

    setBatchModalOpen(false);
    // Reload all data
    loadData();
  };

  const categoryOptions = categories.map((c: MaterialCategory) => ({
    value: c.id,
    label: c.name,
  }));

  const accountOptions = accounts
    .filter((a: Account) => a.status === "active")
    .map((a: Account) => ({
      value: a.id,
      label: a.name,
    }));

  if (materialLoading) {
    return (
      <div
        data-testid="material-detail-page"
        className="page-content p-6 max-sm:p-3"
      >
        <div className="loading-state">Loading material...</div>
      </div>
    );
  }

  if (!material) {
    return (
      <div
        data-testid="material-detail-page"
        className="page-content p-6 max-sm:p-3"
      >
        <div className="error-state">Material not found</div>
      </div>
    );
  }

  return (
    <div
      data-testid="material-detail-page"
      className="page-content p-6 max-sm:p-3"
    >
      <MaterialHeader
        material={material}
        onEditMaterial={handleOpenEdit}
        onNewBatch={handleOpenBatchModal}
      />

      <div style={{ marginTop: 24 }}>
        <AccountsDistributionTable
          accounts={distribution}
          unitOfMeasure={material.unit_of_measure}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <AllBatchesTable
          batches={allBatches}
          unitOfMeasure={material.unit_of_measure}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <TransactionsHistoryTable
          transactions={transactions}
          unitOfMeasure={material.unit_of_measure}
        />
      </div>

      {/* Edit Material Modal */}
      {editModalOpen && (
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
                  setEditErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Enter material name"
              />
              {editErrors.name && (
                <p
                  data-testid="edit-material-name-error"
                  style={{
                    color: "var(--status-error)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {editErrors.name}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <FilterSelect
                options={categoryOptions}
                value={editCategoryId}
                onChange={(v) => {
                  setEditCategoryId(v);
                  setEditErrors((prev) => ({ ...prev, category: "" }));
                }}
                placeholder="Select category"
                testId="edit-material-category"
              />
              {editErrors.category && (
                <p
                  data-testid="edit-material-category-error"
                  style={{
                    color: "var(--status-error)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {editErrors.category}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <input
                className="form-input"
                data-testid="edit-material-unit"
                value={editUnit}
                onChange={(e) => {
                  setEditUnit(e.target.value);
                  setEditErrors((prev) => ({ ...prev, unit: "" }));
                }}
                placeholder="Enter unit of measure"
              />
              {editErrors.unit && (
                <p
                  data-testid="edit-material-unit-error"
                  style={{
                    color: "var(--status-error)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {editErrors.unit}
                </p>
              )}
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

      {/* Create Batch Modal */}
      {batchModalOpen && (
        <div
          className="modal-overlay"
          data-testid="create-batch-modal-overlay"
          onClick={() => setBatchModalOpen(false)}
        >
          <div
            className="modal-content"
            data-testid="create-batch-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Create Batch</h2>
              <button
                className="modal-close-btn"
                data-testid="create-batch-modal-close"
                onClick={() => setBatchModalOpen(false)}
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
              <label className="form-label">Material</label>
              <input
                className="form-input"
                data-testid="create-batch-material"
                value={material.name}
                readOnly
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account</label>
              <FilterSelect
                options={accountOptions}
                value={batchAccountId}
                onChange={(v) => {
                  setBatchAccountId(v);
                  setBatchErrors((prev) => ({ ...prev, account: "" }));
                }}
                placeholder="Select account"
                testId="create-batch-account"
              />
              {batchErrors.account && (
                <p
                  data-testid="create-batch-account-error"
                  style={{
                    color: "var(--status-error)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {batchErrors.account}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                className="form-input"
                data-testid="create-batch-quantity"
                type="number"
                min="0"
                step="any"
                value={batchQuantity}
                onChange={(e) => {
                  setBatchQuantity(e.target.value);
                  setBatchErrors((prev) => ({ ...prev, quantity: "" }));
                }}
                placeholder="Enter quantity"
              />
              {batchErrors.quantity && (
                <p
                  data-testid="create-batch-quantity-error"
                  style={{
                    color: "var(--status-error)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {batchErrors.quantity}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Location (optional)</label>
              <input
                className="form-input"
                data-testid="create-batch-location"
                value={batchLocation}
                onChange={(e) => setBatchLocation(e.target.value)}
                placeholder="Enter location"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lot Number (optional)</label>
              <input
                className="form-input"
                data-testid="create-batch-lot-number"
                value={batchLotNumber}
                onChange={(e) => setBatchLotNumber(e.target.value)}
                placeholder="Enter lot number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expiration Date (optional)</label>
              <input
                className="form-input"
                data-testid="create-batch-expiration"
                type="date"
                value={batchExpiration}
                onChange={(e) => setBatchExpiration(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                data-testid="create-batch-cancel-btn"
                onClick={() => setBatchModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                data-testid="create-batch-create-btn"
                onClick={handleCreateBatch}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
