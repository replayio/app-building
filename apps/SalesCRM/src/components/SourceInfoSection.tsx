import { useState, useEffect } from "react";
import { useAppDispatch } from "../hooks";
import { updateClient, fetchTimeline, type ClientDetail } from "../clientDetailSlice";
import { useAuth } from "@shared/auth/useAuth";

interface SourceInfoSectionProps {
  client: ClientDetail;
}

export function SourceInfoSection({ client }: SourceInfoSectionProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [sourceType, setSourceType] = useState(client.sourceType || "");
  const [sourceDetail, setSourceDetail] = useState(client.sourceDetail || "");
  const [campaign, setCampaign] = useState(client.campaign || "");
  const [channel, setChannel] = useState(client.channel || "");
  const [dateAcquired, setDateAcquired] = useState(client.dateAcquired || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSourceType(client.sourceType || "");
    setSourceDetail(client.sourceDetail || "");
    setCampaign(client.campaign || "");
    setChannel(client.channel || "");
    setDateAcquired(client.dateAcquired || "");
  }, [client]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(
        updateClient({
          clientId: client.id,
          data: {
            sourceType: sourceType || "",
            sourceDetail: sourceDetail || "",
            campaign: campaign || "",
            channel: channel || "",
            dateAcquired: dateAcquired || "",
          },
        })
      ).unwrap();

      const actor = user ? user.name : "System";
      await fetch("/.netlify/functions/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          eventType: "Client Updated",
          description: "Client Updated: source info changed",
          createdBy: actor,
        }),
      });
      dispatch(fetchTimeline(client.id));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSourceType(client.sourceType || "");
    setSourceDetail(client.sourceDetail || "");
    setCampaign(client.campaign || "");
    setChannel(client.channel || "");
    setDateAcquired(client.dateAcquired || "");
    setEditing(false);
  };

  const acquisitionSource = client.sourceType
    ? client.sourceDetail
      ? `${client.sourceType} (${client.sourceDetail})`
      : client.sourceType
    : "None";

  return (
    <div className="detail-section" data-testid="source-info-section">
      <div className="detail-section-header">
        <h3 className="detail-section-title">Source Info</h3>
        {!editing && (
          <button
            className="btn btn--ghost"
            data-testid="source-info-edit-btn"
            onClick={() => setEditing(true)}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10 1.5L12.5 4L4.5 12H2V9.5L10 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Edit
          </button>
        )}
      </div>
      <div className="detail-section-body">
        {editing ? (
          <>
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group form-group--half" style={{ marginBottom: 0 }}>
                <label className="form-label">Source Type</label>
                <input
                  className="form-input"
                  data-testid="edit-source-type"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  placeholder="e.g., Referral"
                />
              </div>
              <div className="form-group form-group--half" style={{ marginBottom: 0 }}>
                <label className="form-label">Source Detail</label>
                <input
                  className="form-input"
                  data-testid="edit-source-detail"
                  value={sourceDetail}
                  onChange={(e) => setSourceDetail(e.target.value)}
                  placeholder="e.g., John Smith"
                />
              </div>
            </div>
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group form-group--half" style={{ marginBottom: 0 }}>
                <label className="form-label">Campaign</label>
                <input
                  className="form-input"
                  data-testid="edit-campaign"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="e.g., Q3 Outreach"
                />
              </div>
              <div className="form-group form-group--half" style={{ marginBottom: 0 }}>
                <label className="form-label">Channel</label>
                <input
                  className="form-input"
                  data-testid="edit-channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  placeholder="e.g., Direct Sales"
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Date Acquired</label>
              <input
                className="form-input"
                data-testid="edit-date-acquired"
                type="date"
                value={dateAcquired}
                onChange={(e) => setDateAcquired(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                className="btn btn--secondary"
                data-testid="source-info-cancel"
                onClick={handleCancel}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                data-testid="source-info-save"
                onClick={handleSave}
                disabled={saving}
                type="button"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        ) : (
          <div className="source-info-grid">
            <div className="source-info-field">
              <span className="source-info-label">Acquisition Source</span>
              <span className="source-info-value" data-testid="source-acquisition">
                {acquisitionSource}
              </span>
            </div>
            <div className="source-info-field">
              <span className="source-info-label">Campaign</span>
              <span className="source-info-value" data-testid="source-campaign">
                {client.campaign || "None"}
              </span>
            </div>
            <div className="source-info-field">
              <span className="source-info-label">Channel</span>
              <span className="source-info-value" data-testid="source-channel">
                {client.channel || "None"}
              </span>
            </div>
            <div className="source-info-field">
              <span className="source-info-label">Date Acquired</span>
              <span className="source-info-value" data-testid="source-date-acquired">
                {client.dateAcquired || "None"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
