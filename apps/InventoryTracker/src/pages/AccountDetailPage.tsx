import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchAccountById,
  updateAccount,
  clearCurrentAccount,
} from "../slices/accountsSlice";
import {
  fetchAccountMaterials,
  clearAccountMaterials,
} from "../slices/materialsSlice";
import { AccountHeader } from "../components/AccountHeader";
import { TrackedMaterialsTable } from "../components/TrackedMaterialsTable";

function typeLabel(accountType: string): string {
  switch (accountType) {
    case "stock":
      return "Stock";
    case "input":
      return "Input";
    case "output":
      return "Output";
    default:
      return accountType.charAt(0).toUpperCase() + accountType.slice(1);
  }
}

export function AccountDetailPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const dispatch = useAppDispatch();
  const { currentAccount: account, loading } = useAppSelector(
    (state) => state.accounts
  );
  const { accountMaterials } = useAppSelector((state) => state.materials);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (accountId) {
      dispatch(fetchAccountById(accountId));
      dispatch(fetchAccountMaterials(accountId));
    }
    return () => {
      dispatch(clearCurrentAccount());
      dispatch(clearAccountMaterials());
    };
  }, [dispatch, accountId]);

  const handleOpenEdit = () => {
    if (!account) return;
    setEditName(account.name);
    setEditDescription(account.description);
    setEditError("");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setEditError("Account Name is required");
      return;
    }
    if (!account) return;
    await dispatch(
      updateAccount({
        id: account.id,
        name: editName.trim(),
        description: editDescription.trim(),
      })
    );
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <div
        data-testid="account-detail-page"
        className="page-content p-6 max-sm:p-3"
      >
        <div className="loading-state">Loading account...</div>
      </div>
    );
  }

  if (!account) {
    return (
      <div
        data-testid="account-detail-page"
        className="page-content p-6 max-sm:p-3"
      >
        <div className="error-state">Account not found</div>
      </div>
    );
  }

  return (
    <div
      data-testid="account-detail-page"
      className="page-content p-6 max-sm:p-3"
    >
      <AccountHeader account={account} onEditAccount={handleOpenEdit} />

      <div style={{ marginTop: 24 }}>
        <TrackedMaterialsTable
          materials={accountMaterials}
          accountId={account.id}
        />
      </div>

      {/* Edit Account Modal */}
      {editModalOpen && (
        <div
          className="modal-overlay"
          data-testid="edit-account-modal-overlay"
          onClick={() => setEditModalOpen(false)}
        >
          <div
            className="modal-content"
            data-testid="edit-account-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Edit Account</h2>
              <button
                className="modal-close-btn"
                data-testid="edit-account-modal-close"
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
              <label className="form-label">Account Type</label>
              <input
                className="form-input"
                data-testid="edit-account-type"
                value={typeLabel(account.account_type)}
                readOnly
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Name</label>
              <input
                className="form-input"
                data-testid="edit-account-name"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  setEditError("");
                }}
                placeholder="Enter account name"
              />
              {editError && (
                <p
                  data-testid="edit-account-error"
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
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                data-testid="edit-account-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                data-testid="edit-account-cancel-btn"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                data-testid="edit-account-save-btn"
                onClick={handleSaveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
