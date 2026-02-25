import { useState, useEffect } from "react";
import { useAppDispatch } from "../hooks";
import { createWebhook, updateWebhook, type Webhook } from "../settingsSlice";

interface WebhookModalProps {
  open: boolean;
  webhook: Webhook | null;
  onClose: () => void;
}

const WEBHOOK_EVENTS = [
  { key: "client_created", label: "Client Created" },
  { key: "client_updated", label: "Client Updated" },
  { key: "deal_created", label: "Deal Created" },
  { key: "deal_stage_changed", label: "Deal Stage Changed" },
  { key: "task_created", label: "Task Created" },
  { key: "task_completed", label: "Task Completed" },
  { key: "contact_added", label: "Contact Added" },
  { key: "note_added", label: "Note Added" },
];

const PLATFORMS = [
  { key: "zapier", label: "Zapier" },
  { key: "n8n", label: "n8n" },
  { key: "custom", label: "Custom" },
];

const URL_PLACEHOLDERS: Record<string, string> = {
  zapier: "https://hooks.zapier.com/hooks/catch/...",
  n8n: "https://your-n8n-instance.com/webhook/...",
  custom: "https://your-endpoint.com/webhook",
};

const SETUP_GUIDES: Record<string, { steps: string[]; tip: string }> = {
  zapier: {
    steps: [
      "Open Zapier and create a new Zap",
      "Choose 'Webhooks by Zapier' as the trigger",
      "Select 'Catch Hook' as the trigger event",
      "Copy the webhook URL provided by Zapier",
      "Paste the URL in the URL field above",
      "Click 'Save' to create the webhook",
    ],
    tip: "Zapier needs the first event sent to detect the payload schema. After saving, trigger a test event so Zapier can map the fields.",
  },
  n8n: {
    steps: [
      "Open n8n and create a new workflow",
      "Add a 'Webhook' trigger node",
      "Set the HTTP Method to POST",
      "Copy the webhook URL from the node settings",
      "Paste the URL in the URL field above",
      "Activate the workflow in n8n",
    ],
    tip: "n8n has separate test and production URLs. Use the production URL for live webhooks. The test URL is only active while the workflow editor is open.",
  },
  custom: {
    steps: [
      "Set up an HTTP endpoint on your server that accepts POST requests",
      "Ensure the endpoint returns a 2xx status code on success",
      "The endpoint will receive JSON payloads with event data",
      "Copy your endpoint URL and paste it in the URL field above",
      "Select the events you want to receive",
      "Click 'Save' to activate the webhook",
    ],
    tip: "Your endpoint will receive POST requests with a JSON body containing event_type, timestamp, and entity data fields.",
  },
};

const PAYLOAD_EXAMPLE = JSON.stringify(
  {
    event_type: "deal_stage_changed",
    timestamp: "2026-02-25T12:00:00.000Z",
    data: {
      id: "abc-123",
      name: "Enterprise Deal",
      client: "Acme Corp",
      old_stage: "Qualified",
      new_stage: "Proposal",
      value: 50000,
    },
  },
  null,
  2
);

export function WebhookModal({ open, webhook, onClose }: WebhookModalProps) {
  const dispatch = useAppDispatch();
  const isEdit = !!webhook;

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [platform, setPlatform] = useState("zapier");
  const [showPayload, setShowPayload] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (webhook) {
        setName(webhook.name);
        setUrl(webhook.url);
        // Convert stored labels back to keys for checkboxes
        const eventKeys = webhook.events.map((label) => {
          const found = WEBHOOK_EVENTS.find((e) => e.label === label);
          return found ? found.key : label;
        });
        setEvents(eventKeys);
        setPlatform(webhook.platform || "custom");
      } else {
        setName("");
        setUrl("");
        setEvents([]);
        setPlatform("zapier");
      }
      setShowPayload(false);
      setErrors({});
      setSaving(false);
    }
  }, [open, webhook]);

  if (!open) return null;

  function toggleEvent(eventKey: string) {
    setEvents((prev) =>
      prev.includes(eventKey)
        ? prev.filter((e) => e !== eventKey)
        : [...prev, eventKey]
    );
  }

  function validate(): boolean {
    const newErrors: { name?: string; url?: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!url.trim()) newErrors.url = "URL is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const eventLabels = events.map((key) => {
        const found = WEBHOOK_EVENTS.find((e) => e.key === key);
        return found ? found.label : key;
      });

      if (isEdit && webhook) {
        await dispatch(
          updateWebhook({
            id: webhook.id,
            name: name.trim(),
            url: url.trim(),
            events: eventLabels,
            platform,
          })
        ).unwrap();
      } else {
        await dispatch(
          createWebhook({
            name: name.trim(),
            url: url.trim(),
            events: eventLabels,
            platform,
          })
        ).unwrap();
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const guide = SETUP_GUIDES[platform];

  return (
    <div className="modal-overlay" data-testid="webhook-modal-overlay" onClick={onClose}>
      <div
        className="modal webhook-modal"
        data-testid="webhook-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title" data-testid="webhook-modal-title">
            {isEdit ? "Edit Webhook" : "Add Webhook"}
          </h3>
          <button
            className="modal-close"
            data-testid="webhook-modal-close"
            onClick={onClose}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="webhook-name">Name</label>
            <input
              id="webhook-name"
              className="form-input"
              data-testid="webhook-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Zapier Hook"
            />
            {errors.name && <span className="form-error" data-testid="webhook-name-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Platform</label>
            <div className="webhook-platform-selector" data-testid="webhook-platform-selector">
              {PLATFORMS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`webhook-platform-btn ${platform === p.key ? "webhook-platform-btn--active" : ""}`}
                  data-testid={`platform-${p.key}`}
                  onClick={() => setPlatform(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="webhook-url">URL</label>
            <input
              id="webhook-url"
              className="form-input"
              data-testid="webhook-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={URL_PLACEHOLDERS[platform]}
            />
            {errors.url && <span className="form-error" data-testid="webhook-url-error">{errors.url}</span>}
          </div>

          {guide && (
            <div className="webhook-setup-guide" data-testid="webhook-setup-guide">
              <h4 className="webhook-guide-title">Setup Guide</h4>
              <ol className="webhook-guide-steps" data-testid="webhook-guide-steps">
                {guide.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <div className="webhook-guide-tip" data-testid="webhook-guide-tip">
                <strong>Tip:</strong> {guide.tip}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Events</label>
            <div className="webhook-events-grid" data-testid="webhook-events">
              {WEBHOOK_EVENTS.map((evt) => {
                const isChecked = events.includes(evt.key);
                return (
                  <label className="webhook-event-checkbox" key={evt.key}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleEvent(evt.key)}
                      data-testid={`event-${evt.key}`}
                    />
                    <span>{evt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="webhook-payload-section">
            <button
              className="webhook-payload-toggle"
              data-testid="webhook-payload-toggle"
              onClick={() => setShowPayload(!showPayload)}
              type="button"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{ transform: showPayload ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}
              >
                <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Payload Format
            </button>
            {showPayload && (
              <pre className="webhook-payload-preview" data-testid="webhook-payload-preview">
                {PAYLOAD_EXAMPLE}
              </pre>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn--secondary"
            data-testid="webhook-modal-cancel"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn--primary"
            data-testid="webhook-modal-save"
            disabled={saving}
            onClick={handleSave}
            type="button"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
