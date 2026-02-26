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
import { EditAccountModal } from "../components/EditAccountModal";

export function AccountDetailPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const dispatch = useAppDispatch();
  const { currentAccount: account, loading } = useAppSelector(
    (state) => state.accounts
  );
  const { accountMaterials } = useAppSelector((state) => state.materials);

  const [editModalOpen, setEditModalOpen] = useState(false);

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
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (name: string, description: string) => {
    if (!account) return;
    await dispatch(
      updateAccount({
        id: account.id,
        name,
        description,
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

      {editModalOpen && (
        <EditAccountModal
          account={account}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
