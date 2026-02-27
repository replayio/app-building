import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchBatchById,
  fetchBatchUsageHistory,
  clearCurrentBatch,
} from "../slices/batchesSlice";
import { BatchHeader } from "../components/BatchHeader";
import { BatchOverview } from "../components/BatchOverview";
import { LineageSection } from "../components/LineageSection";
import { UsageHistoryTable } from "../components/UsageHistoryTable";

export function BatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const dispatch = useAppDispatch();
  const { currentBatch: batch, lineage, usageHistory, loading } = useAppSelector(
    (state) => state.batches
  );

  const loadData = useCallback(() => {
    if (batchId) {
      dispatch(fetchBatchById(batchId));
      dispatch(fetchBatchUsageHistory(batchId));
    }
  }, [dispatch, batchId]);

  useEffect(() => {
    loadData();
    return () => {
      dispatch(clearCurrentBatch());
    };
  }, [loadData, dispatch]);

  if (loading) {
    return (
      <div data-testid="batch-detail-page" className="page-content p-6 max-sm:p-3">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div data-testid="batch-detail-page" className="page-content p-6 max-sm:p-3">
        <div className="error-state">Batch not found</div>
      </div>
    );
  }

  return (
    <div data-testid="batch-detail-page" className="page-content p-6 max-sm:p-3">
      <BatchHeader batch={batch} />

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 mt-6">
        <BatchOverview batch={batch} />
        <LineageSection batch={batch} lineage={lineage} />
      </div>

      <div className="mt-6">
        <UsageHistoryTable entries={usageHistory} unit={batch.unit} />
      </div>
    </div>
  );
}
