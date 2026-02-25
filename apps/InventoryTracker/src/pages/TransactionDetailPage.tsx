import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchTransactionById,
  clearCurrentTransaction,
} from "../slices/transactionsSlice";
import { TransactionHeader } from "../components/TransactionHeader";
import { BasicInfoSection } from "../components/BasicInfoSection";
import { QuantityTransfersTable } from "../components/QuantityTransfersTable";
import { BatchesCreatedTable } from "../components/BatchesCreatedTable";

export function TransactionDetailPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const dispatch = useAppDispatch();
  const { currentTransaction: transaction, loading } = useAppSelector(
    (state) => state.transactions
  );

  const loadData = useCallback(() => {
    if (transactionId) {
      dispatch(fetchTransactionById(transactionId));
    }
  }, [dispatch, transactionId]);

  useEffect(() => {
    loadData();
    return () => {
      dispatch(clearCurrentTransaction());
    };
  }, [loadData, dispatch]);

  if (loading) {
    return (
      <div data-testid="transaction-detail-page" className="page-content p-6 max-sm:p-3">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div data-testid="transaction-detail-page" className="page-content p-6 max-sm:p-3">
        <div className="error-state">Transaction not found</div>
      </div>
    );
  }

  return (
    <div data-testid="transaction-detail-page" className="page-content p-6 max-sm:p-3">
      <TransactionHeader transaction={transaction} />

      <div style={{ marginTop: 24 }}>
        <BasicInfoSection transaction={transaction} />
      </div>

      <div style={{ marginTop: 24 }}>
        <QuantityTransfersTable transfers={transaction.transfers || []} />
      </div>

      <div style={{ marginTop: 24 }}>
        <BatchesCreatedTable batches={transaction.batches_created || []} />
      </div>
    </div>
  );
}
