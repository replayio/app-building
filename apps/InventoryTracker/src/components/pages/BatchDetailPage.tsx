import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, ArrowRight } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import {
  fetchBatch,
  fetchBatchLineage,
  fetchBatchUsageHistory,
  clearCurrentBatch,
} from '../../store/batchesSlice';
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

/* ---------- Batch Overview ---------- */

function BatchOverview({
  batch,
}: {
  batch: {
    quantity: number;
    unit: string;
    location?: string;
    lotNumber?: string;
    expirationDate?: string;
    qualityGrade?: string;
    storageCondition?: string;
  };
}) {
  return (
    <div className="card" data-testid="batch-overview">
      <div className="card-header">
        <h3 className="card-title" data-testid="batch-overview-heading">Batch Overview</h3>
      </div>
      <div className="overview-grid">
        <div className="overview-item">
          <div className="overview-label">Quantity</div>
          <div className="overview-value" data-testid="batch-quantity">{formatNumber(batch.quantity)}</div>
        </div>
        <div className="overview-item">
          <div className="overview-label">Unit</div>
          <div className="overview-value" data-testid="batch-unit">{batch.unit}</div>
        </div>
        <div className="overview-item">
          <div className="overview-label">Location</div>
          <div className="overview-value" data-testid="batch-location">{batch.location || '—'}</div>
        </div>
        <div className="overview-item">
          <div className="overview-label">Lot Number</div>
          <div className="overview-value" data-testid="batch-lot">{batch.lotNumber || '—'}</div>
        </div>
        <div className="overview-item">
          <div className="overview-label">Expiration Date</div>
          <div className="overview-value" data-testid="batch-expiry">
            {batch.expirationDate ? formatDate(batch.expirationDate) : '—'}
          </div>
        </div>
        <div className="overview-item">
          <div className="overview-label">Quality Grade</div>
          <div className="overview-value" data-testid="batch-grade">{batch.qualityGrade || '—'}</div>
        </div>
        <div className="overview-item">
          <div className="overview-label">Storage Condition</div>
          <div className="overview-value" data-testid="batch-storage">{batch.storageCondition || '—'}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Lineage Diagram ---------- */

function LineageDiagram({
  lineage,
}: {
  lineage: {
    sourceTransaction: {
      id: string;
      referenceId: string;
      type: string;
    } | null;
    inputBatches: { id: string; materialName: string; quantity: number; unit: string }[];
    outputBatch: { id: string; materialName: string; quantity: number; unit: string };
  } | null;
}) {
  if (!lineage) {
    return (
      <div className="section" data-testid="lineage-section">
        <h2 className="section-title" data-testid="lineage-heading">Lineage</h2>
        <div className="table-empty" data-testid="lineage-empty">No lineage data available</div>
      </div>
    );
  }

  return (
    <div className="section" data-testid="lineage-section">
      <h2 className="section-title" data-testid="lineage-heading">Lineage</h2>

      {lineage.sourceTransaction && (
        <div style={{ marginBottom: 12 }}>
          <span className="text-xs text-muted">Source Transaction: </span>
          <Link
            to={`/transactions/${lineage.sourceTransaction.id}`}
            className="link"
            data-testid="lineage-source-txn-link"
          >
            {lineage.sourceTransaction.referenceId || lineage.sourceTransaction.id}
          </Link>
        </div>
      )}

      <div className="lineage-diagram" data-testid="lineage-diagram">
        {/* Inputs */}
        {lineage.inputBatches.length > 0 && (
          <div>
            <div className="text-xs text-muted mb-2">Inputs Used</div>
            {lineage.inputBatches.map((batch) => (
              <div key={batch.id} className="lineage-box" style={{ marginBottom: 8 }}>
                <div className="lineage-box-title">Input Batch</div>
                <div className="lineage-box-value">
                  <Link to={`/batches/${batch.id}`} className="link" data-testid={`lineage-input-${batch.id}`}>
                    {batch.id}
                  </Link>
                </div>
                <div className="text-xs text-muted">
                  {batch.materialName}: {formatNumber(batch.quantity)} {batch.unit}
                </div>
              </div>
            ))}
          </div>
        )}

        {lineage.inputBatches.length > 0 && (
          <div className="lineage-arrow" data-testid="lineage-arrow">
            <ArrowRight />
          </div>
        )}

        {/* Process */}
        {lineage.sourceTransaction && (
          <div className="lineage-box" style={{ borderColor: 'var(--accent-primary)' }}>
            <div className="lineage-box-title">Process</div>
            <div className="lineage-box-value" data-testid="lineage-process">
              {lineage.sourceTransaction.type.charAt(0).toUpperCase() + lineage.sourceTransaction.type.slice(1)}
            </div>
            <div className="text-xs text-muted">
              <Link to={`/transactions/${lineage.sourceTransaction.id}`} className="link">
                {lineage.sourceTransaction.referenceId || lineage.sourceTransaction.id}
              </Link>
            </div>
          </div>
        )}

        {lineage.sourceTransaction && (
          <div className="lineage-arrow" data-testid="lineage-arrow-out">
            <ArrowRight />
          </div>
        )}

        {/* Output */}
        <div className="lineage-box">
          <div className="lineage-box-title">Output Batch</div>
          <div className="lineage-box-value" data-testid="lineage-output">
            {lineage.outputBatch.id}
          </div>
          <div className="text-xs text-muted">
            {lineage.outputBatch.materialName}: {formatNumber(lineage.outputBatch.quantity)} {lineage.outputBatch.unit}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Usage History Table ---------- */

function UsageHistoryTable({
  history,
}: {
  history: {
    date: string;
    transactionId: string;
    type: string;
    movement: 'in' | 'out';
    amount: number;
    unit: string;
    createdBatches: { id: string; materialName: string }[];
  }[];
}) {
  return (
    <div className="section" data-testid="usage-history-section">
      <h2 className="section-title" data-testid="usage-history-heading">Usage History</h2>
      <table className="data-table" data-testid="usage-history-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Transaction ID</th>
            <th>Type</th>
            <th>Movement</th>
            <th>Amount</th>
            <th>Created Batches</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan={6} className="table-empty" data-testid="usage-empty">
                No usage history available
              </td>
            </tr>
          ) : (
            history.map((entry, idx) => (
              <tr key={`${entry.transactionId}-${idx}`} data-testid={`usage-row-${entry.transactionId}`}>
                <td>{formatDateTime(entry.date)}</td>
                <td>
                  <Link
                    to={`/transactions/${entry.transactionId}`}
                    className="link"
                    data-testid={`usage-txn-link-${entry.transactionId}`}
                  >
                    {entry.transactionId}
                  </Link>
                </td>
                <td>{entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</td>
                <td>
                  <span
                    className={`badge ${entry.movement === 'in' ? 'badge-success' : 'badge-error'}`}
                    data-testid={`usage-movement-${entry.transactionId}`}
                  >
                    {entry.movement === 'in' ? 'In' : 'Out'}
                  </span>
                </td>
                <td>{formatNumber(entry.amount)} {entry.unit}</td>
                <td>
                  {entry.createdBatches.length > 0
                    ? entry.createdBatches.map((b) => (
                        <Link
                          key={b.id}
                          to={`/batches/${b.id}`}
                          className="link"
                          style={{ marginRight: 6 }}
                          data-testid={`usage-created-batch-${b.id}`}
                        >
                          {b.id}
                        </Link>
                      ))
                    : '—'}
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

export default function BatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentBatch, lineage, usageHistory, loading } = useSelector(
    (state: RootState) => state.batches
  );

  useEffect(() => {
    if (batchId) {
      dispatch(fetchBatch(batchId));
      dispatch(fetchBatchLineage(batchId));
      dispatch(fetchBatchUsageHistory(batchId));
    }
    return () => {
      dispatch(clearCurrentBatch());
    };
  }, [dispatch, batchId]);

  if (loading || !currentBatch) {
    return <div className="table-empty">Loading...</div>;
  }

  return (
    <div data-testid="batch-detail-page">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/', testId: 'breadcrumb-home' },
          { label: 'Materials', href: '/materials', testId: 'breadcrumb-materials' },
          { label: currentBatch.materialName, href: `/materials/${currentBatch.materialId}`, testId: 'breadcrumb-material' },
          { label: `Batch: ${currentBatch.id}`, testId: 'breadcrumb-current' },
        ]}
      />

      <div className="detail-header">
        <div className="detail-header-info">
          <h1 className="page-heading" data-testid="page-heading">
            Batch: {currentBatch.id}
          </h1>
          <div className="detail-meta">
            <span data-testid="batch-material">
              Material:{' '}
              <Link to={`/materials/${currentBatch.materialId}`} className="link">
                {currentBatch.materialName}
              </Link>
            </span>
            <span className="detail-meta-separator">|</span>
            <span data-testid="batch-account">
              Account:{' '}
              <Link to={`/accounts/${currentBatch.accountId}`} className="link">
                {currentBatch.accountName}
              </Link>
            </span>
            <span className="detail-meta-separator">|</span>
            <span data-testid="batch-status">
              Status: <span className="status-dot">{currentBatch.status === 'active' ? 'Active' : currentBatch.status}</span>
            </span>
          </div>
          <div className="detail-meta" style={{ marginTop: 4 }}>
            <span data-testid="batch-created">
              Created: {formatDateTime(currentBatch.createdAt)}
            </span>
            {currentBatch.originatingTransactionId && (
              <>
                <span className="detail-meta-separator">|</span>
                <span data-testid="batch-originating-txn">
                  Originating Transaction:{' '}
                  <Link
                    to={`/transactions/${currentBatch.originatingTransactionId}`}
                    className="link"
                  >
                    {currentBatch.originatingTransactionId}
                  </Link>
                </span>
              </>
            )}
          </div>
        </div>
        <div className="detail-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/transactions/new?batchId=${batchId}`)}
            data-testid="create-transaction-btn"
          >
            <Plus />
            <span>Create New Transaction</span>
          </button>
        </div>
      </div>

      <BatchOverview batch={currentBatch} />

      <div style={{ marginTop: 24 }}>
        <LineageDiagram lineage={lineage} />
      </div>

      <UsageHistoryTable history={usageHistory} />
    </div>
  );
}
