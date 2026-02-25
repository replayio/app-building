import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { updateDealDetail, fetchDealHistory } from "../dealDetailSlice";
import type { DealDetail, DealUser } from "../dealDetailSlice";
import { FilterSelect } from "@shared/components/FilterSelect";

const DEAL_STAGES = [
  { value: "Lead", label: "Lead" },
  { value: "Qualification", label: "Qualification" },
  { value: "Discovery", label: "Discovery" },
  { value: "Proposal", label: "Proposal" },
  { value: "Negotiation", label: "Negotiation" },
  { value: "Closed Won", label: "Closed Won" },
];

function formatCurrency(value: number | null): string {
  if (value == null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface DealHeaderProps {
  deal: DealDetail;
  users: DealUser[];
}

export function DealHeader({ deal, users }: DealHeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [editingValue, setEditingValue] = useState(false);
  const [valueInput, setValueInput] = useState("");
  const [selectedStage, setSelectedStage] = useState(deal.stage);
  const [selectedOwner, setSelectedOwner] = useState(deal.ownerId || "");

  useEffect(() => {
    setSelectedStage(deal.stage);
  }, [deal.stage]);

  useEffect(() => {
    setSelectedOwner(deal.ownerId || "");
  }, [deal.ownerId]);

  const formattedValue = formatCurrency(deal.value);
  const displayValue = deal.value != null ? `$${Math.round(deal.value / 1000)}k` : "";
  const heading = `DEAL DETAILS: ${deal.clientName || "Unknown"} - ${displayValue} ${deal.name}`;

  const ownerOptions = [
    { value: "", label: "Unassigned" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const handleClientClick = () => {
    if (deal.clientId) {
      navigate(`/clients/${deal.clientId}`);
    }
  };

  const handleValueSave = async () => {
    const parsed = parseFloat(valueInput.replace(/[^0-9.]/g, ""));
    const newValue = isNaN(parsed) ? 0 : parsed;
    await dispatch(updateDealDetail({ dealId: deal.id, data: { value: newValue } })).unwrap();
    setEditingValue(false);
  };

  const handleValueKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleValueSave();
    } else if (e.key === "Escape") {
      setEditingValue(false);
    }
  };

  const handleOwnerChange = async (newOwnerId: string) => {
    setSelectedOwner(newOwnerId);
    await dispatch(updateDealDetail({ dealId: deal.id, data: { ownerId: newOwnerId || undefined } }));
  };

  const handleChangeStage = async () => {
    if (selectedStage !== deal.stage) {
      await dispatch(updateDealDetail({ dealId: deal.id, data: { stage: selectedStage } }));
      await dispatch(fetchDealHistory(deal.id));
    }
  };

  return (
    <div className="deal-header" data-testid="deal-header">
      <h1 className="deal-header-title" data-testid="deal-header-title">{heading}</h1>

      <div className="deal-header-fields">
        <div className="deal-header-field">
          <span className="deal-header-field-label">Client:</span>
          <button
            className="deal-header-client-link"
            data-testid="deal-header-client"
            onClick={handleClientClick}
            type="button"
          >
            {deal.clientName || "Unknown"}
          </button>
        </div>

        <div className="deal-header-field">
          <span className="deal-header-field-label">Value:</span>
          {editingValue ? (
            <input
              className="deal-header-inline-input"
              data-testid="deal-header-value-input"
              type="text"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              onBlur={handleValueSave}
              onKeyDown={handleValueKeyDown}
              autoFocus
            />
          ) : (
            <button
              className="deal-header-field-value deal-header-field-value--editable"
              data-testid="deal-header-value"
              onClick={() => {
                setValueInput(deal.value != null ? String(deal.value) : "");
                setEditingValue(true);
              }}
              type="button"
            >
              {formattedValue || "N/A"}
            </button>
          )}
        </div>

        <div className="deal-header-field">
          <span className="deal-header-field-label">Owner:</span>
          <div className="deal-header-field-select" data-testid="deal-header-owner">
            <FilterSelect
              options={ownerOptions}
              value={selectedOwner}
              onChange={handleOwnerChange}
              placeholder="Select owner..."
              searchable
              testId="deal-owner-select"
            />
          </div>
        </div>

        <div className="deal-header-field deal-header-stage-field">
          <span className="deal-header-field-label">Stage:</span>
          <div className="deal-header-field-select" data-testid="deal-header-stage">
            <FilterSelect
              options={DEAL_STAGES}
              value={selectedStage}
              onChange={setSelectedStage}
              testId="deal-stage-select"
            />
          </div>
          <button
            className="btn btn--primary btn--sm"
            data-testid="deal-change-stage-btn"
            onClick={handleChangeStage}
            type="button"
          >
            Change Stage
          </button>
        </div>
      </div>
    </div>
  );
}
