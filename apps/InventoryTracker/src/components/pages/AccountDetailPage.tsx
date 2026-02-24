import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil, Plus, ExternalLink } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { fetchAccountDetail, updateAccount, clearCurrentAccount } from '../../store/accountsSlice';
import Breadcrumb from '../shared/Breadcrumb';
import Modal from '../shared/Modal';

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/* ---------- Edit Account Modal ---------- */

function EditAccountModal({
  isOpen,
  onClose,
  account,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  account: { name: string; type: string; description: string; status: string } | null;
  onSave: (data: { name: string; description: string }) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (account) {
      setName(account.name);
      setDescription(account.description);
    }
  }, [account, isOpen]);

  const handleSave = () => {
    onSave({ name: name.trim(), description: description.trim() });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Account"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} data-testid="modal-cancel-btn">
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} data-testid="modal-save-btn">
            Save
          </button>
        </>
      }
    >
      <div data-testid="edit-modal">
        <div className="form-group">
          <label className="form-label">Account Name</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="account-name-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            data-testid="account-description-input"
          />
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Tracked Materials Table ---------- */

function TrackedMaterialsTable({
  materials,
}: {
  materials: { materialId: string; materialName: string; categoryName: string; unitOfMeasure: string; totalQuantity: number; numberOfBatches: number }[];
}) {
  return (
    <div className="section" data-testid="tracked-materials-section">
      <h2 className="section-title" data-testid="tracked-materials-heading">
        Tracked Materials
      </h2>
      <table className="data-table" data-testid="tracked-materials-table">
        <thead>
          <tr>
            <th>Material Name</th>
            <th>Category</th>
            <th>Unit of Measure</th>
            <th>Total Quantity</th>
            <th>Number of Batches</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.length === 0 ? (
            <tr>
              <td colSpan={6} className="table-empty" data-testid="tracked-materials-empty">
                No materials are currently tracked in this account
              </td>
            </tr>
          ) : (
            materials.map((mat) => (
              <tr key={mat.materialId} data-testid={`material-row-${mat.materialId}`}>
                <td data-testid={`material-name-${mat.materialId}`}>{mat.materialName}</td>
                <td data-testid={`material-category-${mat.materialId}`}>{mat.categoryName}</td>
                <td data-testid={`material-uom-${mat.materialId}`}>{mat.unitOfMeasure}</td>
                <td data-testid={`material-quantity-${mat.materialId}`}>
                  {formatNumber(mat.totalQuantity)} {mat.unitOfMeasure}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    &Sigma; Batches
                  </div>
                </td>
                <td data-testid={`material-batches-${mat.materialId}`}>
                  {mat.numberOfBatches} Batches
                </td>
                <td>
                  <Link
                    to={`/materials/${mat.materialId}`}
                    className="link"
                    data-testid={`view-material-${mat.materialId}`}
                  >
                    View Material in this Account
                    <ExternalLink style={{ width: 12, height: 12, marginLeft: 4, verticalAlign: 'middle' }} />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Main Page ---------- */

export default function AccountDetailPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentAccount, accountMaterials, loading } = useSelector(
    (state: RootState) => state.accounts
  );
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (accountId) {
      dispatch(fetchAccountDetail(accountId));
    }
    return () => {
      dispatch(clearCurrentAccount());
    };
  }, [dispatch, accountId]);

  const handleSaveEdit = async (data: { name: string; description: string }) => {
    if (accountId) {
      await dispatch(updateAccount({ accountId, data }));
      setEditModalOpen(false);
    }
  };

  if (loading || !currentAccount) {
    return <div className="table-empty">Loading...</div>;
  }

  const typeLabel =
    currentAccount.type.charAt(0).toUpperCase() + currentAccount.type.slice(1);

  return (
    <div data-testid="account-detail-page">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/', testId: 'breadcrumb-home' },
          { label: 'Accounts', href: '/accounts', testId: 'breadcrumb-accounts' },
          { label: currentAccount.name, testId: 'breadcrumb-current' },
        ]}
      />

      <div className="detail-header">
        <div className="detail-header-info">
          <h1 className="page-heading" data-testid="page-heading">
            Account: {currentAccount.name}
          </h1>
          <div className="detail-meta">
            <span data-testid="account-type">Type: {typeLabel} Account</span>
            <span className="detail-meta-separator">|</span>
            <span data-testid="account-status">
              Status: <span className="badge badge-success">{currentAccount.status === 'active' ? 'Active' : 'Archived'}</span>
            </span>
          </div>
        </div>
        <div className="detail-header-actions">
          <button
            className="btn btn-outline"
            onClick={() => setEditModalOpen(true)}
            data-testid="edit-account-btn"
          >
            <Pencil />
            <span>Edit Account</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/transactions/new?accountId=${accountId}`)}
            data-testid="new-transaction-btn"
          >
            <Plus />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      <TrackedMaterialsTable materials={accountMaterials} />

      <EditAccountModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        account={currentAccount ? {
          name: currentAccount.name,
          type: typeLabel,
          description: currentAccount.description,
          status: currentAccount.status,
        } : null}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
