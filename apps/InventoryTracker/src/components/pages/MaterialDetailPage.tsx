import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil, Plus, ChevronRight } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import {
  fetchMaterial,
  fetchMaterialDistribution,
  fetchMaterialBatches,
  fetchMaterialTransactions,
  updateMaterial,
  clearCurrentMaterial,
} from '../../store/materialsSlice';
import { fetchAccounts } from '../../store/accountsSlice';
import { createBatch } from '../../store/batchesSlice';
import { fetchCategories } from '../../store/categoriesSlice';
import Breadcrumb from '../shared/Breadcrumb';
import Modal from '../shared/Modal';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/* ---------- Edit Material Modal ---------- */

function EditMaterialModal({
  isOpen,
  onClose,
  material,
  categories,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  material: { name: string; categoryId: string; unitOfMeasure: string; description: string } | null;
  categories: { id: string; name: string }[];
  onSave: (data: { name: string; categoryId: string; unitOfMeasure: string; description: string }) => void;
}) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (material) {
      setName(material.name);
      setCategoryId(material.categoryId);
      setUnitOfMeasure(material.unitOfMeasure);
      setDescription(material.description || '');
    }
  }, [material, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Material"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} data-testid="modal-cancel-btn">
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() =>
              onSave({
                name: name.trim(),
                categoryId,
                unitOfMeasure: unitOfMeasure.trim(),
                description: description.trim(),
              })
            }
            data-testid="modal-save-btn"
          >
            Save
          </button>
        </>
      }
    >
      <div data-testid="edit-material-form">
        <div className="form-group">
          <label className="form-label">Material Name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} data-testid="material-name-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} data-testid="material-category-select">
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Unit of Measure</label>
          <input className="form-input" value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} data-testid="material-uom-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} data-testid="material-description-input" />
        </div>
      </div>
    </Modal>
  );
}

/* ---------- New Batch Modal ---------- */

function NewBatchModal({
  isOpen,
  onClose,
  materialName,
  accounts,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  materialName: string;
  accounts: { id: string; name: string }[];
  onSave: (data: { accountId: string; quantity: number; lotNumber?: string; expirationDate?: string }) => void;
}) {
  const [accountId, setAccountId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  useEffect(() => {
    setAccountId('');
    setQuantity('');
    setLotNumber('');
    setExpirationDate('');
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Batch"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} data-testid="modal-cancel-btn">
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() =>
              onSave({
                accountId,
                quantity: Number(quantity),
                lotNumber: lotNumber || undefined,
                expirationDate: expirationDate || undefined,
              })
            }
            data-testid="modal-save-btn"
          >
            Save
          </button>
        </>
      }
    >
      <div data-testid="new-batch-form">
        <div className="form-group">
          <label className="form-label">Material</label>
          <input className="form-input" value={materialName} disabled data-testid="batch-material-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Account / Location</label>
          <select className="form-select" value={accountId} onChange={(e) => setAccountId(e.target.value)} data-testid="batch-account-select">
            <option value="">Select account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input className="form-input" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} data-testid="batch-quantity-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Lot Number (optional)</label>
          <input className="form-input" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} data-testid="batch-lot-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Expiration Date (optional)</label>
          <input className="form-input" type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} data-testid="batch-expiry-input" />
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Accounts Distribution ---------- */

function AccountsDistribution({
  distribution,
  unitOfMeasure,
}: {
  distribution: {
    accountId: string;
    accountName: string;
    accountType: string;
    quantity: number;
    numberOfBatches: number;
    batches: { id: string; quantity: number; unit: string; createdAt: string }[];
  }[];
  unitOfMeasure: string;
}) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (accountId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  return (
    <div className="section" data-testid="accounts-distribution-section">
      <h2 className="section-title" data-testid="accounts-distribution-heading">
        Accounts Distribution
      </h2>
      <table className="data-table" data-testid="accounts-distribution-table">
        <thead>
          <tr>
            <th>Account Name</th>
            <th>Account Type</th>
            <th>Quantity ({unitOfMeasure})</th>
            <th>Number of Batches</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {distribution.length === 0 ? (
            <tr>
              <td colSpan={5} className="table-empty" data-testid="distribution-empty">
                This material is not currently tracked in any account
              </td>
            </tr>
          ) : (
            distribution.map((dist) => (
              <React.Fragment key={dist.accountId}>
                <tr
                  className="expandable-row clickable-row"
                  onClick={() => toggleRow(dist.accountId)}
                  data-testid={`distribution-row-${dist.accountId}`}
                >
                  <td>
                    <span
                      className={`expand-icon${expandedRows.has(dist.accountId) ? ' expanded' : ''}`}
                      data-testid={`expand-icon-${dist.accountId}`}
                    >
                      <ChevronRight style={{ width: 14, height: 14 }} />
                    </span>
                    {dist.accountName}
                  </td>
                  <td>{dist.accountType}</td>
                  <td>{formatNumber(dist.quantity)}</td>
                  <td>{dist.numberOfBatches}</td>
                  <td>
                    <Link
                      to={`/accounts/${dist.accountId}`}
                      className="link"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`view-account-link-${dist.accountId}`}
                    >
                      View Account
                    </Link>
                  </td>
                </tr>
                {expandedRows.has(dist.accountId) && (
                  <tr data-testid={`batches-sub-table-${dist.accountId}`}>
                    <td colSpan={5} style={{ padding: 0 }}>
                      <div className="sub-table-header">
                        Batches in {dist.accountName}
                      </div>
                      <table className="data-table sub-table">
                        <thead>
                          <tr>
                            <th>Batch ID</th>
                            <th>Quantity ({unitOfMeasure})</th>
                            <th>Unit</th>
                            <th>Created Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dist.batches.map((batch) => (
                            <tr key={batch.id} data-testid={`sub-batch-row-${batch.id}`}>
                              <td>
                                <Link
                                  to={`/batches/${batch.id}`}
                                  className="link"
                                  data-testid={`sub-batch-link-${batch.id}`}
                                >
                                  {batch.id}
                                </Link>
                              </td>
                              <td>{formatNumber(batch.quantity)}</td>
                              <td>{batch.unit}</td>
                              <td>{formatDate(batch.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- All Batches List ---------- */

function AllBatchesList({
  batches,
  accounts,
  onFilter,
}: {
  batches: { id: string; accountName: string; quantity: number; unit: string; createdAt: string; accountId: string }[];
  accounts: { id: string; name: string }[];
  materialId?: string;
  onFilter: (params: { accountId?: string; dateFrom?: string; dateTo?: string }) => void;
}) {
  const [accountFilter, setAccountFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const handleAccountChange = (val: string) => {
    setAccountFilter(val);
    onFilter({ accountId: val || undefined, dateFrom: dateFilter || undefined });
  };

  const handleDateChange = (val: string) => {
    setDateFilter(val);
    onFilter({ accountId: accountFilter || undefined, dateFrom: val || undefined });
  };

  return (
    <div className="section" data-testid="all-batches-section">
      <h2 className="section-title" data-testid="all-batches-heading">All Batches</h2>
      <div className="filter-bar" data-testid="batches-filter-bar">
        <div className="filter-group">
          <label>Filter by Account:</label>
          <select
            className="form-select"
            value={accountFilter}
            onChange={(e) => handleAccountChange(e.target.value)}
            data-testid="batches-account-filter"
          >
            <option value="">[All Accounts]</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Filter by Date:</label>
          <select
            className="form-select"
            value={dateFilter}
            onChange={(e) => handleDateChange(e.target.value)}
            data-testid="batches-date-filter"
          >
            <option value="">[All Dates]</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>
      <table className="data-table" data-testid="all-batches-table">
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Location</th>
            <th>Quantity</th>
            <th>Created Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.length === 0 ? (
            <tr>
              <td colSpan={5} className="table-empty" data-testid="batches-empty">
                No batches found
              </td>
            </tr>
          ) : (
            batches.map((batch) => (
              <tr key={batch.id} data-testid={`batch-row-${batch.id}`}>
                <td>
                  <Link to={`/batches/${batch.id}`} className="link" data-testid={`batch-link-${batch.id}`}>
                    {batch.id}
                  </Link>
                </td>
                <td>{batch.accountName}</td>
                <td>{formatNumber(batch.quantity)} {batch.unit}</td>
                <td>{formatDate(batch.createdAt)}</td>
                <td>
                  <Link to={`/batches/${batch.id}`} className="link" data-testid={`batch-lineage-${batch.id}`}>
                    View Lineage
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

/* ---------- Transactions History ---------- */

function TransactionsHistory({
  transactions,
  onFilter,
}: {
  transactions: {
    id: string;
    date: string;
    accountsAffected: string;
    transfers: { sourceBatchId?: string }[];
    materialsAndAmounts: string;
  }[];
  materialId?: string;
  onFilter: (params: { type?: string; dateFrom?: string; dateTo?: string }) => void;
}) {
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const handleTypeChange = (val: string) => {
    setTypeFilter(val);
    onFilter({ type: val || undefined, dateFrom: dateFilter || undefined });
  };

  const handleDateChange = (val: string) => {
    setDateFilter(val);
    onFilter({ type: typeFilter || undefined, dateFrom: val || undefined });
  };

  return (
    <div className="section" data-testid="transactions-history-section">
      <h2 className="section-title" data-testid="transactions-history-heading">
        Transactions History
      </h2>
      <div className="filter-bar" data-testid="transactions-filter-bar">
        <div className="filter-group">
          <label>Filter by Type:</label>
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value)}
            data-testid="txn-type-filter"
          >
            <option value="">[All Types]</option>
            <option value="purchase">Purchase</option>
            <option value="consumption">Consumption</option>
            <option value="transfer">Transfer</option>
            <option value="production">Production</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Filter by Date:</label>
          <select
            className="form-select"
            value={dateFilter}
            onChange={(e) => handleDateChange(e.target.value)}
            data-testid="txn-date-filter"
          >
            <option value="">[All Dates]</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>
      <table className="data-table" data-testid="transactions-history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Transaction ID</th>
            <th>Accounts Involved</th>
            <th>Batch References</th>
            <th>Quantity Moved</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="table-empty" data-testid="txn-history-empty">
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((txn) => (
              <tr key={txn.id} data-testid={`txn-history-row-${txn.id}`}>
                <td>{formatDate(txn.date)}</td>
                <td>
                  <Link to={`/transactions/${txn.id}`} className="link" data-testid={`txn-link-${txn.id}`}>
                    {txn.id}
                  </Link>
                </td>
                <td>{txn.accountsAffected}</td>
                <td>
                  {txn.transfers
                    .filter((t) => t.sourceBatchId)
                    .map((t) => (
                      <Link
                        key={t.sourceBatchId}
                        to={`/batches/${t.sourceBatchId}`}
                        className="link"
                        style={{ marginRight: 6 }}
                      >
                        {t.sourceBatchId}
                      </Link>
                    ))}
                  {txn.transfers.filter((t) => t.sourceBatchId).length === 0 && '—'}
                </td>
                <td>{txn.materialsAndAmounts}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Main Page ---------- */

export default function MaterialDetailPage() {
  const { materialId } = useParams<{ materialId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentMaterial, distribution, batches, transactions, loading } = useSelector(
    (state: RootState) => state.materials
  );
  const { categories } = useSelector((state: RootState) => state.categories);
  const { accounts } = useSelector((state: RootState) => state.accounts);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newBatchModalOpen, setNewBatchModalOpen] = useState(false);

  useEffect(() => {
    if (materialId) {
      dispatch(fetchMaterial(materialId));
      dispatch(fetchMaterialDistribution(materialId));
      dispatch(fetchMaterialBatches({ materialId }));
      dispatch(fetchMaterialTransactions({ materialId }));
      dispatch(fetchCategories());
      dispatch(fetchAccounts());
    }
    return () => {
      dispatch(clearCurrentMaterial());
    };
  }, [dispatch, materialId]);

  const handleSaveEdit = async (data: { name: string; categoryId: string; unitOfMeasure: string; description: string }) => {
    if (materialId) {
      await dispatch(updateMaterial({ materialId, data }));
      setEditModalOpen(false);
    }
  };

  const handleSaveNewBatch = async (data: { accountId: string; quantity: number; lotNumber?: string; expirationDate?: string }) => {
    if (materialId) {
      await dispatch(createBatch({ materialId, ...data }));
      setNewBatchModalOpen(false);
      // Refresh data
      dispatch(fetchMaterialDistribution(materialId));
      dispatch(fetchMaterialBatches({ materialId }));
    }
  };

  const handleBatchFilter = (params: { accountId?: string; dateFrom?: string; dateTo?: string }) => {
    if (materialId) {
      dispatch(fetchMaterialBatches({ materialId, params }));
    }
  };

  const handleTxnFilter = (params: { type?: string; dateFrom?: string; dateTo?: string }) => {
    if (materialId) {
      dispatch(fetchMaterialTransactions({ materialId, params }));
    }
  };

  if (loading || !currentMaterial) {
    return <div className="table-empty">Loading...</div>;
  }

  return (
    <div data-testid="material-detail-page">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/', testId: 'breadcrumb-home' },
          { label: 'Materials', href: '/materials', testId: 'breadcrumb-materials' },
          { label: currentMaterial.name, testId: 'breadcrumb-current' },
        ]}
      />

      <div className="detail-header">
        <div className="detail-header-info">
          <h1 className="page-heading" data-testid="page-heading">
            {currentMaterial.name}
          </h1>
          <div className="detail-meta">
            <span data-testid="material-category">Category: {currentMaterial.categoryName}</span>
            <span className="detail-meta-separator">|</span>
            <span data-testid="material-uom">Unit of Measure: {currentMaterial.unitOfMeasure}</span>
          </div>
          {currentMaterial.description && (
            <p className="detail-description" data-testid="material-description">
              {currentMaterial.description}
            </p>
          )}
        </div>
        <div className="detail-header-actions">
          <button
            className="btn btn-outline"
            onClick={() => setEditModalOpen(true)}
            data-testid="edit-material-btn"
          >
            <Pencil />
            <span>Edit Material</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setNewBatchModalOpen(true)}
            data-testid="new-batch-btn"
          >
            <Plus />
            <span>New Batch</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/transactions/new?materialId=${materialId}`)}
            data-testid="new-transaction-btn"
          >
            <Plus />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      <AccountsDistribution
        distribution={distribution}
        unitOfMeasure={currentMaterial.unitOfMeasure}
      />

      <AllBatchesList
        batches={batches.map((b) => ({
          id: b.id,
          accountName: b.accountName,
          quantity: b.quantity,
          unit: b.unit,
          createdAt: b.createdAt,
          accountId: b.accountId,
        }))}
        accounts={accounts.filter((a) => a.status === 'active')}
        materialId={materialId || ''}
        onFilter={handleBatchFilter}
      />

      <TransactionsHistory
        transactions={transactions}
        materialId={materialId || ''}
        onFilter={handleTxnFilter}
      />

      <EditMaterialModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        material={
          currentMaterial
            ? {
                name: currentMaterial.name,
                categoryId: currentMaterial.categoryId,
                unitOfMeasure: currentMaterial.unitOfMeasure,
                description: currentMaterial.description,
              }
            : null
        }
        categories={categories}
        onSave={handleSaveEdit}
      />

      <NewBatchModal
        isOpen={newBatchModalOpen}
        onClose={() => setNewBatchModalOpen(false)}
        materialName={currentMaterial.name}
        accounts={accounts.filter((a) => a.status === 'active')}
        onSave={handleSaveNewBatch}
      />
    </div>
  );
}
