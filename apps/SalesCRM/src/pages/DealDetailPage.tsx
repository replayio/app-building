import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchDealDetail,
  fetchDealHistory,
  fetchWriteups,
  fetchDealTasks,
  fetchDealAttachments,
  fetchDealIndividuals,
  fetchDealUsers,
  clearDealDetail,
} from "../dealDetailSlice";
import { DealHeader } from "../components/DealHeader";
import { DealStagePipeline } from "../components/DealStagePipeline";
import { DealHistorySection } from "../components/DealHistorySection";
import { DealMetricsSection } from "../components/DealMetricsSection";
import { WriteupsSection } from "../components/WriteupsSection";
import { LinkedTasksSection } from "../components/LinkedTasksSection";
import { DealAttachmentsSection } from "../components/DealAttachmentsSection";
import { ContactsIndividualsSection } from "../components/ContactsIndividualsSection";

export function DealDetailPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const dispatch = useAppDispatch();

  const { deal, history, writeups, tasks, attachments, individuals, users, loading, error } =
    useAppSelector((state) => state.dealDetail);

  useEffect(() => {
    if (!dealId) return;

    dispatch(fetchDealDetail(dealId));
    dispatch(fetchDealHistory(dealId));
    dispatch(fetchWriteups(dealId));
    dispatch(fetchDealTasks(dealId));
    dispatch(fetchDealAttachments(dealId));
    dispatch(fetchDealUsers());

    return () => {
      dispatch(clearDealDetail());
    };
  }, [dealId, dispatch]);

  // Fetch individuals once we know the clientId
  useEffect(() => {
    if (deal?.clientId) {
      dispatch(fetchDealIndividuals(deal.clientId));
    }
  }, [deal?.clientId, dispatch]);

  if (loading && !deal) {
    return (
      <div data-testid="deal-detail-page" className="deal-detail-page p-6 max-sm:p-3">
        <div className="deal-detail-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="deal-detail-page" className="deal-detail-page p-6 max-sm:p-3">
        <div className="deal-detail-error">{error}</div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div data-testid="deal-detail-page" className="deal-detail-page p-6 max-sm:p-3">
        <div className="deal-detail-error">Deal not found</div>
      </div>
    );
  }

  return (
    <div data-testid="deal-detail-page" className="deal-detail-page p-6 max-sm:p-3">
      <DealHeader deal={deal} users={users} />
      <DealStagePipeline currentStage={deal.stage} />

      <div className="deal-detail-grid">
        <div className="deal-detail-main">
          <DealHistorySection history={history} />
          <DealMetricsSection deal={deal} />
          <WriteupsSection writeups={writeups} dealId={deal.id} />
          <LinkedTasksSection tasks={tasks} dealId={deal.id} clientId={deal.clientId} users={users} />
        </div>
        <div className="deal-detail-sidebar">
          <DealAttachmentsSection attachments={attachments} dealId={deal.id} clientId={deal.clientId} />
          <ContactsIndividualsSection individuals={individuals} clientName={deal.clientName} />
        </div>
      </div>
    </div>
  );
}
