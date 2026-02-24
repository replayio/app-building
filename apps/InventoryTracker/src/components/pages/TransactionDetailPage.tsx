import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { fetchTransaction, clearCurrentTransaction } from '../../store/transactionsSlice';
import Breadcrumb from '../shared/Breadcrumb';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/* ---------- Basic Info Section ---------- */

function BasicInfoSection({
  transaction,
}: {
  transaction: {
    date: string;
    referenceId: string;
    description: string;
    type: string;
  };
}) {
  return (
    <div className="section" data-testid="basic-info-section">
      <h2 className="section-title" data-testid="basic-info-heading">Basic Information</h2>
      <div className="info-row">
        <div className="info-field">
          <div className="info-field-label">Date</div>
          <div className="info-field-value" data-testid="txn-date">{formatDate(transaction.date)}</div>
        </div>
        <div className="info-field">
          <div className="info-field-label">Reference Id</div>
          <div className="info-field-value" data-testid="txn-reference">{transaction.referenceId}</div>
        </div>
        <div className="info-field">
          <div className="info-field-label">Description</div>
          <div className="info-field-value" data-testid="txn-description">{transaction.description}</div>
        </div>
        <div className="info-field">
          <div className="info-field-label">Transaction Type</div>
          <div className="info-field-value" data-testid="txn-type">
            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Quantity Transfers Table ---------- */

function QuantityTransfersTable({
  transfers,
}: {
  transfers: {
    id: string;
    sourceAccountName: string;
    sourceAmount: number;
    sourceBatchId?: string;
    destinationAccountName: string;
    destinationAmount: number;
    unit: string;
    netTransfer: number;
  }[];
}) {
  const totalDebits = transfers.reduce((sum, t) => sum + t.sourceAmount, 0);
  const totalCredits = transfers.reduce((sum, t) => sum + t.destinationAmount, 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <div className="section" data-testid="quantity-transfers-section">
      <div className="section-header">
        <h2 className="section-title" data-testid="quantity-transfers-heading">
          Quantity Transfers
        </h2>
        <div
          className={`balanced-indicator ${isBalanced ? 'balanced' : 'unbalanced'}`}
          data-testid="balanced-indicator"
        >
          {isBalanced && <CheckCircle style={{ width: 14, height: 14 }} />}
          {isBalanced ? 'Balanced' : 'Unbalanced'}
        </div>
      </div>
      <table className="data-table" data-testid="quantity-transfers-table">
        <thead>
          <tr>
            <th>Source Account</th>
            <th>Source Amount</th>
            <th>Source Batch ID</th>
            <th>Destination Account</th>
            <th>Destination Amount</th>
            <th>Net Transfer</th>
          </tr>
        </thead>
        <tbody>
          {transfers.length === 0 ? (
            <tr>
              <td colSpan={6} className="table-empty">No transfers</td>
            </tr>
          ) : (
            transfers.map((transfer) => (
              <tr key={transfer.id} data-testid={`transfer-row-${transfer.id}`}>
                <td data-testid={`transfer-source-${transfer.id}`}>{transfer.sourceAccountName}</td>
                <td data-testid={`transfer-source-amount-${transfer.id}`}>
                  {formatNumber(transfer.sourceAmount)} {transfer.unit}
                </td>
                <td data-testid={`transfer-batch-${transfer.id}`}>
                  {transfer.sourceBatchId ? (
                    <Link to={`/batches/${transfer.sourceBatchId}`} className="link">
                      {transfer.sourceBatchId}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td data-testid={`transfer-dest-${transfer.id}`}>{transfer.destinationAccountName}</td>
                <td data-testid={`transfer-dest-amount-${transfer.id}`}>
                  {formatNumber(transfer.destinationAmount)} {transfer.unit}
                </td>
                <td data-testid={`transfer-net-${transfer.id}`}>
                  {formatNumber(transfer.netTransfer)} {transfer.unit}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 500 }}>
              Total Debits: {formatNumber(totalDebits)}
            </td>
            <td colSpan={3} style={{ fontWeight: 500 }}>
              Total Credits: {formatNumber(totalCredits)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ---------- Batches Created Table ---------- */

function BatchesCreatedTable({
  batches,
}: {
  batches: {
    id: string;
    batchId: string;
    materialId: string;
    materialName: string;
    quantity: number;
    unit: string;
  }[];
}) {
  return (
    <div className="section" data-testid="batches-created-section">
      <h2 className="section-title" data-testid="batches-created-heading">Batches Created</h2>
      <table className="data-table" data-testid="batches-created-table">
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Material</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {batches.length === 0 ? (
            <tr>
              <td colSpan={3} className="table-empty" data-testid="batches-created-empty">
                No batches created in this transaction
              </td>
            </tr>
          ) : (
            batches.map((batch) => (
              <tr key={batch.id} data-testid={`created-batch-row-${batch.batchId}`}>
                <td>
                  <Link
                    to={`/batches/${batch.batchId}`}
                    className="link"
                    data-testid={`created-batch-link-${batch.batchId}`}
                  >
                    {batch.batchId}
                  </Link>
                </td>
                <td>
                  <Link
                    to={`/materials/${batch.materialId}`}
                    className="link"
                    data-testid={`created-batch-material-${batch.batchId}`}
                  >
                    {batch.materialName}
                  </Link>
                </td>
                <td data-testid={`created-batch-qty-${batch.batchId}`}>
                  {formatNumber(batch.quantity)} {batch.unit}
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

export default function TransactionDetailPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentTransaction, loading } = useSelector(
    (state: RootState) => state.transactions
  );

  useEffect(() => {
    if (transactionId) {
      dispatch(fetchTransaction(transactionId));
    }
    return () => {
      dispatch(clearCurrentTransaction());
    };
  }, [dispatch, transactionId]);

  if (loading || !currentTransaction) {
    return <div className="table-empty">Loading...</div>;
  }

  return (
    <div data-testid="transaction-detail-page">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/', testId: 'breadcrumb-home' },
          { label: 'Transactions', href: '/transactions', testId: 'breadcrumb-transactions' },
          { label: currentTransaction.referenceId || currentTransaction.id, testId: 'breadcrumb-current' },
        ]}
      />

      <div className="detail-header">
        <div className="detail-header-info">
          <h1 className="page-heading" data-testid="page-heading">
            {currentTransaction.referenceId || currentTransaction.id}
          </h1>
          <div className="detail-meta">
            <span className="badge badge-success" data-testid="txn-status-badge">
              <CheckCircle style={{ width: 12, height: 12 }} />
              {currentTransaction.status.charAt(0).toUpperCase() + currentTransaction.status.slice(1)}
            </span>
            <span className="detail-meta-separator">|</span>
            <span data-testid="txn-datetime">{formatDateTime(currentTransaction.date)}</span>
            <span className="detail-meta-separator">|</span>
            <span data-testid="txn-creator">Creator: {currentTransaction.createdBy}</span>
          </div>
          {currentTransaction.description && (
            <p className="detail-description" data-testid="txn-full-description">
              {currentTransaction.description}
            </p>
          )}
        </div>
      </div>

      <BasicInfoSection transaction={currentTransaction} />

      <QuantityTransfersTable transfers={currentTransaction.transfers} />

      <BatchesCreatedTable batches={currentTransaction.batchesCreated} />
    </div>
  );
}
