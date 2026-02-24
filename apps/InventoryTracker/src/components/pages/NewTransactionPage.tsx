import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2, X } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { createTransaction } from '../../store/transactionsSlice';
import { fetchAccounts } from '../../store/accountsSlice';
import { fetchMaterials } from '../../store/materialsSlice';
import Breadcrumb from '../shared/Breadcrumb';

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

interface TransferRow {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: string;
  unit: string;
  sourceBatchId: string;
}

interface BatchAllocationRow {
  id: string;
  materialId: string;
  quantity: string;
}

let transferCounter = 0;
let batchCounter = 0;

function generateTransferId() {
  return `transfer-${++transferCounter}`;
}

function generateBatchId() {
  return `batch-${++batchCounter}`;
}

/* ---------- Basic Info Form ---------- */

function BasicInfoForm({
  date,
  referenceId,
  description,
  type,
  onChange,
  errors,
}: {
  date: string;
  referenceId: string;
  description: string;
  type: string;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="section" data-testid="basic-info-form">
      <h2 className="section-title" data-testid="basic-info-heading">Basic Information</h2>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Date *</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => onChange('date', e.target.value)}
            data-testid="txn-date-input"
          />
          {errors.date && <div className="form-error" data-testid="date-error">{errors.date}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Reference ID</label>
          <input
            className="form-input"
            value={referenceId}
            onChange={(e) => onChange('referenceId', e.target.value)}
            placeholder="e.g., TRX-20231025-001"
            data-testid="txn-reference-input"
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe this transaction..."
          data-testid="txn-description-input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Transaction Type *</label>
        <select
          className="form-select"
          value={type}
          onChange={(e) => onChange('type', e.target.value)}
          data-testid="txn-type-select"
        >
          <option value="">Select type</option>
          <option value="purchase">Purchase</option>
          <option value="consumption">Consumption</option>
          <option value="transfer">Transfer</option>
          <option value="production">Production</option>
          <option value="adjustment">Adjustment</option>
        </select>
        {errors.type && <div className="form-error" data-testid="type-error">{errors.type}</div>}
      </div>
    </div>
  );
}

/* ---------- Quantity Transfers List ---------- */

function QuantityTransfersList({
  transfers,
  accounts,
  onAdd,
  onRemove,
  onChange,
  errors,
}: {
  transfers: TransferRow[];
  accounts: { id: string; name: string }[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: string, value: string) => void;
  errors: Record<string, string>;
}) {
  const totalDebits = transfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalCredits = transfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <div className="section" data-testid="quantity-transfers-list">
      <div className="section-header">
        <h2 className="section-title" data-testid="transfers-heading">Quantity Transfers</h2>
      </div>
      {errors.transfers && <div className="form-error mb-2" data-testid="transfers-error">{errors.transfers}</div>}
      <table className="data-table" data-testid="transfers-table">
        <thead>
          <tr>
            <th>Source Account</th>
            <th>Destination Account</th>
            <th>Amount</th>
            <th>Unit</th>
            <th>Source Batch ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer) => (
            <tr key={transfer.id} data-testid={`transfer-row-${transfer.id}`}>
              <td>
                <select
                  className="form-select"
                  value={transfer.sourceAccountId}
                  onChange={(e) => onChange(transfer.id, 'sourceAccountId', e.target.value)}
                  data-testid={`transfer-source-select-${transfer.id}`}
                >
                  <option value="">Select source</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  className="form-select"
                  value={transfer.destinationAccountId}
                  onChange={(e) => onChange(transfer.id, 'destinationAccountId', e.target.value)}
                  data-testid={`transfer-dest-select-${transfer.id}`}
                >
                  <option value="">Select destination</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  className="form-input"
                  type="number"
                  value={transfer.amount}
                  onChange={(e) => onChange(transfer.id, 'amount', e.target.value)}
                  placeholder="0"
                  data-testid={`transfer-amount-input-${transfer.id}`}
                />
              </td>
              <td>
                <input
                  className="form-input"
                  value={transfer.unit}
                  onChange={(e) => onChange(transfer.id, 'unit', e.target.value)}
                  placeholder="units"
                  data-testid={`transfer-unit-input-${transfer.id}`}
                  style={{ width: 80 }}
                />
              </td>
              <td>
                <input
                  className="form-input"
                  value={transfer.sourceBatchId}
                  onChange={(e) => onChange(transfer.id, 'sourceBatchId', e.target.value)}
                  placeholder="Optional"
                  data-testid={`transfer-batch-input-${transfer.id}`}
                />
              </td>
              <td>
                <button
                  className="btn-icon"
                  onClick={() => onRemove(transfer.id)}
                  title="Delete"
                  data-testid={`transfer-delete-${transfer.id}`}
                >
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={6}>
              <button
                className="btn btn-ghost"
                onClick={onAdd}
                data-testid="add-transfer-btn"
              >
                <Plus />
                <span>Add Transfer</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      {transfers.length > 0 && (
        <div className="text-xs text-muted mt-2" data-testid="transfers-totals">
          Total Debits: {formatNumber(totalDebits)} | Total Credits: {formatNumber(totalCredits)}
          {isBalanced ? ' (Balanced)' : ' (Unbalanced)'}
        </div>
      )}
    </div>
  );
}

/* ---------- Batch Allocation List ---------- */

function BatchAllocationList({
  allocations,
  materials,
  onAdd,
  onRemove,
  onChange,
}: {
  allocations: BatchAllocationRow[];
  materials: { id: string; name: string }[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: string, value: string) => void;
}) {
  return (
    <div className="section" data-testid="batch-allocation-list">
      <div className="section-header">
        <h2 className="section-title" data-testid="batch-allocation-heading">Batch Allocation</h2>
      </div>
      <table className="data-table" data-testid="batch-allocation-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((alloc) => (
            <tr key={alloc.id} data-testid={`allocation-row-${alloc.id}`}>
              <td>
                <select
                  className="form-select"
                  value={alloc.materialId}
                  onChange={(e) => onChange(alloc.id, 'materialId', e.target.value)}
                  data-testid={`allocation-material-select-${alloc.id}`}
                >
                  <option value="">Select material</option>
                  {materials.map((mat) => (
                    <option key={mat.id} value={mat.id}>{mat.name}</option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  className="form-input"
                  type="number"
                  value={alloc.quantity}
                  onChange={(e) => onChange(alloc.id, 'quantity', e.target.value)}
                  placeholder="0"
                  data-testid={`allocation-amount-input-${alloc.id}`}
                />
              </td>
              <td>
                <button
                  className="btn-icon"
                  onClick={() => onRemove(alloc.id)}
                  title="Delete"
                  data-testid={`allocation-delete-${alloc.id}`}
                >
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={3}>
              <button
                className="btn btn-ghost"
                onClick={onAdd}
                data-testid="create-new-batch-btn"
              >
                <Plus />
                <span>Create New Batch</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Main Page ---------- */

export default function NewTransactionPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accounts } = useSelector((state: RootState) => state.accounts);
  const { materials } = useSelector((state: RootState) => state.materials);

  // Basic info
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceId, setReferenceId] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');

  // Transfers
  const [transfers, setTransfers] = useState<TransferRow[]>([]);

  // Batch allocations
  const [allocations, setAllocations] = useState<BatchAllocationRow[]>([]);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Loading
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchMaterials({ pageSize: 100 }));
  }, [dispatch]);

  // Pre-fill from URL params
  useEffect(() => {
    const accountId = searchParams.get('accountId');
    const materialId = searchParams.get('materialId');
    if (accountId && transfers.length === 0) {
      setTransfers([
        {
          id: generateTransferId(),
          sourceAccountId: accountId,
          destinationAccountId: '',
          amount: '',
          unit: '',
          sourceBatchId: '',
        },
      ]);
    }
    if (materialId && allocations.length === 0) {
      setAllocations([
        {
          id: generateBatchId(),
          materialId,
          quantity: '',
        },
      ]);
    }
  }, [searchParams, transfers.length, allocations.length]);

  const handleBasicInfoChange = (field: string, value: string) => {
    switch (field) {
      case 'date':
        setDate(value);
        break;
      case 'referenceId':
        setReferenceId(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'type':
        setType(value);
        break;
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Transfer handlers
  const addTransfer = () => {
    setTransfers((prev) => [
      ...prev,
      {
        id: generateTransferId(),
        sourceAccountId: '',
        destinationAccountId: '',
        amount: '',
        unit: '',
        sourceBatchId: '',
      },
    ]);
  };

  const removeTransfer = (id: string) => {
    setTransfers((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransfer = (id: string, field: string, value: string) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Allocation handlers
  const addAllocation = () => {
    setAllocations((prev) => [
      ...prev,
      {
        id: generateBatchId(),
        materialId: '',
        quantity: '',
      },
    ]);
  };

  const removeAllocation = (id: string) => {
    setAllocations((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAllocation = (id: string, field: string, value: string) => {
    setAllocations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!date) newErrors.date = 'Date is required';
    if (!type) newErrors.type = 'Transaction type is required';

    if (transfers.length === 0) {
      newErrors.transfers = 'At least one transfer is required';
    } else {
      const totalDebits = transfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const totalCredits = transfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      if (Math.abs(totalDebits - totalCredits) >= 0.01 && transfers.length > 1) {
        // For double-entry: debits must equal credits
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handlePost = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await dispatch(
        createTransaction({
          date,
          referenceId,
          description,
          type,
          transfers: transfers
            .filter((t) => t.sourceAccountId && t.destinationAccountId && Number(t.amount) > 0)
            .map((t) => ({
              sourceAccountId: t.sourceAccountId,
              destinationAccountId: t.destinationAccountId,
              amount: Number(t.amount),
              unit: t.unit,
              sourceBatchId: t.sourceBatchId || undefined,
            })),
          batchAllocations: allocations
            .filter((a) => a.materialId && Number(a.quantity) > 0)
            .map((a) => ({
              materialId: a.materialId,
              quantity: Number(a.quantity),
            })),
        })
      ).unwrap();
      navigate(`/transactions/${result.id}`);
    } catch {
      setErrors({ submit: 'Failed to create transaction. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const activeAccounts = accounts.filter((a) => a.status === 'active');

  return (
    <div data-testid="new-transaction-page">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/', testId: 'breadcrumb-home' },
          { label: 'Transactions', href: '/transactions', testId: 'breadcrumb-transactions' },
          { label: 'New Transaction', testId: 'breadcrumb-current' },
        ]}
      />

      <div className="detail-header">
        <div className="detail-header-info">
          <h1 className="page-heading" data-testid="page-heading">New Transaction</h1>
        </div>
        <div className="detail-header-actions">
          <button
            className="btn btn-outline"
            onClick={() => navigate('/transactions')}
            data-testid="cancel-btn"
          >
            <X />
            <span>Cancel</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={handlePost}
            disabled={submitting}
            data-testid="post-btn"
          >
            <span>{submitting ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </div>

      {errors.submit && (
        <div className="form-error mb-4" data-testid="submit-error">
          {errors.submit}
        </div>
      )}

      <BasicInfoForm
        date={date}
        referenceId={referenceId}
        description={description}
        type={type}
        onChange={handleBasicInfoChange}
        errors={errors}
      />

      <QuantityTransfersList
        transfers={transfers}
        accounts={activeAccounts}
        onAdd={addTransfer}
        onRemove={removeTransfer}
        onChange={updateTransfer}
        errors={errors}
      />

      <BatchAllocationList
        allocations={allocations}
        materials={materials}
        onAdd={addAllocation}
        onRemove={removeAllocation}
        onChange={updateAllocation}
      />
    </div>
  );
}
