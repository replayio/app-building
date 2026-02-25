import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  archiveAccount,
} from "../slices/accountsSlice";
import { Breadcrumb } from "@shared/components/Breadcrumb";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";
import { AccountsList } from "../components/AccountsList";
import type { Account, AccountCategory } from "../types";

export function AccountsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: accounts, loading } = useAppSelector((state) => state.accounts);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<AccountCategory>("stock");
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createError, setCreateError] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Account | null>(null);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const stockAccounts = useMemo(
    () => accounts.filter((a: Account) => a.account_type === "stock"),
    [accounts]
  );
  const inputAccounts = useMemo(
    () => accounts.filter((a: Account) => a.account_type === "input"),
    [accounts]
  );
  const outputAccounts = useMemo(
    () => accounts.filter((a: Account) => a.account_type === "output"),
    [accounts]
  );

  const handleOpenCreate = (accountType: AccountCategory) => {
    setCreateType(accountType);
    setCreateName("");
    setCreateDescription("");
    setCreateError("");
    setCreateModalOpen(true);
  };

  const handleCreate = async () => {
    if (!createName.trim()) {
      setCreateError("Account Name is required");
      return;
    }
    await dispatch(
      createAccount({
        name: createName.trim(),
        account_type: createType,
        description: createDescription.trim(),
      })
    );
    setCreateModalOpen(false);
  };

  const handleOpenEdit = (account: Account) => {
    setEditAccount(account);
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
    if (!editAccount) return;
    await dispatch(
      updateAccount({
        id: editAccount.id,
        name: editName.trim(),
        description: editDescription.trim(),
      })
    );
    setEditModalOpen(false);
  };

  const handleOpenArchive = (account: Account) => {
    if (account.is_default) return;
    setArchiveTarget(account);
    setArchiveDialogOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    await dispatch(archiveAccount(archiveTarget.id));
    setArchiveDialogOpen(false);
    setArchiveTarget(null);
  };

  const typeLabel = (t: AccountCategory) => {
    switch (t) {
      case "stock":
        return "Stock";
      case "input":
        return "Input";
      case "output":
        return "Output";
    }
  };

  if (loading) {
    return (
      <div data-testid="accounts-page" className="page-content p-6 max-sm:p-3">
        <div className="loading-state">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div data-testid="accounts-page" className="page-content p-6 max-sm:p-3">
      <Breadcrumb
        items={[
          { label: "Home", onClick: () => navigate("/") },
          { label: "Accounts" },
        ]}
      />

      <div className="page-header" style={{ marginTop: 16 }}>
        <h1 className="page-title">Accounts</h1>
      </div>

      <AccountsList
        title="Stock Accounts"
        accountType="stock"
        accounts={stockAccounts}
        onCreateAccount={handleOpenCreate}
        onEditAccount={handleOpenEdit}
        onArchiveAccount={handleOpenArchive}
      />

      <AccountsList
        title="Input Accounts"
        accountType="input"
        accounts={inputAccounts}
        onCreateAccount={handleOpenCreate}
        onEditAccount={handleOpenEdit}
        onArchiveAccount={handleOpenArchive}
      />

      <AccountsList
        title="Output Accounts"
        accountType="output"
        accounts={outputAccounts}
        onCreateAccount={handleOpenCreate}
        onEditAccount={handleOpenEdit}
        onArchiveAccount={handleOpenArchive}
      />

      {/* Create Account Modal */}
      {createModalOpen && (
        <div
          className="modal-overlay"
          data-testid="create-account-modal-overlay"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="modal-content"
            data-testid="create-account-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                Create {typeLabel(createType)} Account
              </h2>
              <button
                className="modal-close-btn"
                data-testid="create-account-modal-close"
                onClick={() => setCreateModalOpen(false)}
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
                data-testid="create-account-type"
                value={typeLabel(createType)}
                readOnly
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Name</label>
              <input
                className="form-input"
                data-testid="create-account-name"
                value={createName}
                onChange={(e) => {
                  setCreateName(e.target.value);
                  setCreateError("");
                }}
                placeholder="Enter account name"
              />
              {createError && (
                <p
                  data-testid="create-account-error"
                  style={{
                    color: "var(--status-error)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {createError}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                data-testid="create-account-description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                data-testid="create-account-cancel-btn"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                data-testid="create-account-submit-btn"
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editModalOpen && editAccount && (
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
                value={typeLabel(editAccount.account_type)}
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

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        open={archiveDialogOpen}
        title="Archive Account"
        message="Are you sure you want to archive this account?"
        confirmLabel="Archive"
        cancelLabel="Cancel"
        onConfirm={handleConfirmArchive}
        onCancel={() => {
          setArchiveDialogOpen(false);
          setArchiveTarget(null);
        }}
      />
    </div>
  );
}
