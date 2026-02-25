import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { updateDeal } from "../dealsSlice";
import type { Deal } from "../dealsSlice";

const PIPELINE_STAGES = [
  "Discovery",
  "Qualification",
  "Proposal Sent",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

function formatCurrency(value: number | null): string {
  if (value == null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface PipelineViewProps {
  deals: Deal[];
}

export function PipelineView({ deals }: PipelineViewProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const isDragging = useRef(false);

  const dealsByStage: Record<string, Deal[]> = {};
  for (const stage of PIPELINE_STAGES) {
    dealsByStage[stage] = [];
  }
  for (const deal of deals) {
    if (dealsByStage[deal.stage]) {
      dealsByStage[deal.stage].push(deal);
    }
  }

  function handleDragStart(e: React.DragEvent, dealId: string) {
    isDragging.current = true;
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dealId);
  }

  function handleDragEnd() {
    isDragging.current = false;
    setDraggedDealId(null);
    setDragOverStage(null);
  }

  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stage);
  }

  function handleDragLeave() {
    setDragOverStage(null);
  }

  function handleDrop(e: React.DragEvent, newStage: string) {
    e.preventDefault();
    setDragOverStage(null);
    const dealId = e.dataTransfer.getData("text/plain");
    if (!dealId) return;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    dispatch(updateDeal({ dealId, data: { stage: newStage } }));
  }

  function handleCardClick(dealId: string) {
    if (!isDragging.current) {
      navigate(`/deals/${dealId}`);
    }
  }

  return (
    <div className="pipeline-view" data-testid="pipeline-view">
      {PIPELINE_STAGES.map((stage) => {
        const stageDeals = dealsByStage[stage];
        return (
          <div
            key={stage}
            className={`pipeline-column ${dragOverStage === stage ? "pipeline-column--drag-over" : ""}`}
            data-testid={`pipeline-column-${stage.toLowerCase().replace(/\s+/g, "-")}`}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="pipeline-column-header">
              <span className="pipeline-column-title">{stage}</span>
              <span className="pipeline-column-count" data-testid={`pipeline-count-${stage.toLowerCase().replace(/\s+/g, "-")}`}>
                ({stageDeals.length})
              </span>
            </div>
            <div className="pipeline-column-body">
              {stageDeals.length === 0 ? (
                <div className="pipeline-empty" data-testid={`pipeline-empty-${stage.toLowerCase().replace(/\s+/g, "-")}`}>
                  No deals
                </div>
              ) : (
                stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className={`pipeline-card ${draggedDealId === deal.id ? "pipeline-card--dragging" : ""}`}
                    data-testid={`pipeline-card-${deal.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleCardClick(deal.id)}
                  >
                    <div className="pipeline-card-name" data-testid={`pipeline-deal-name-${deal.id}`}>
                      {deal.name}
                    </div>
                    <div className="pipeline-card-client" data-testid={`pipeline-deal-client-${deal.id}`}>
                      {deal.clientName || "—"}
                    </div>
                    <div className="pipeline-card-footer">
                      <span className="pipeline-card-value" data-testid={`pipeline-deal-value-${deal.id}`}>
                        {deal.value != null ? formatCurrency(deal.value) : "—"}
                      </span>
                      <span className="pipeline-card-owner" data-testid={`pipeline-deal-owner-${deal.id}`}>
                        {deal.ownerName || "—"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
