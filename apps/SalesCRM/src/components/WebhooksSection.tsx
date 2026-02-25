import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchWebhooks,
  updateWebhook,
  deleteWebhook,
  type Webhook,
} from "../settingsSlice";
import { WebhookModal } from "./WebhookModal";

export function WebhooksSection() {
  const dispatch = useAppDispatch();
  const webhooks = useAppSelector((state) => (state as unknown as { settings: { webhooks: Webhook[]; webhooksLoading: boolean } }).settings.webhooks);
  const loading = useAppSelector((state) => (state as unknown as { settings: { webhooksLoading: boolean } }).settings.webhooksLoading);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchWebhooks());
  }, [dispatch]);

  function handleAdd() {
    setEditingWebhook(null);
    setModalOpen(true);
  }

  function handleEdit(webhook: Webhook) {
    setEditingWebhook(webhook);
    setModalOpen(true);
  }

  function handleToggleEnabled(webhook: Webhook) {
    dispatch(updateWebhook({ id: webhook.id, enabled: !webhook.enabled }));
  }

  function handleDeleteConfirm(id: string) {
    dispatch(deleteWebhook(id));
    setDeleteConfirmId(null);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingWebhook(null);
  }

  return (
    <div className="settings-section" data-testid="webhooks-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Webhooks</h2>
        <button
          className="btn btn--primary"
          data-testid="add-webhook-btn"
          onClick={handleAdd}
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add Webhook
        </button>
      </div>

      {loading ? (
        <div className="settings-loading">Loading webhooks...</div>
      ) : webhooks.length === 0 ? (
        <div className="settings-empty" data-testid="webhooks-empty">
          No webhooks configured
        </div>
      ) : (
        <div className="webhooks-list" data-testid="webhooks-list">
          {webhooks.map((webhook) => (
            <div className="webhook-entry" key={webhook.id} data-testid={`webhook-entry-${webhook.id}`}>
              <div className="webhook-entry-info">
                <button
                  className="webhook-entry-name"
                  data-testid={`webhook-name-${webhook.id}`}
                  onClick={() => handleEdit(webhook)}
                  type="button"
                >
                  {webhook.name}
                </button>
                <span className="webhook-entry-url" data-testid={`webhook-url-${webhook.id}`}>
                  {webhook.url}
                </span>
                <div className="webhook-entry-events" data-testid={`webhook-events-${webhook.id}`}>
                  {webhook.events.map((event) => (
                    <span className="webhook-event-badge" key={event}>
                      {event}
                    </span>
                  ))}
                </div>
              </div>
              <div className="webhook-entry-actions">
                <button
                  type="button"
                  role="switch"
                  aria-checked={webhook.enabled}
                  className={`settings-toggle ${webhook.enabled ? "settings-toggle--on" : "settings-toggle--off"}`}
                  data-testid={`webhook-toggle-${webhook.id}`}
                  onClick={() => handleToggleEnabled(webhook)}
                >
                  <span className="settings-toggle-thumb" />
                </button>
                {deleteConfirmId === webhook.id ? (
                  <div className="webhook-delete-confirm" data-testid={`webhook-delete-confirm-${webhook.id}`}>
                    <span className="webhook-delete-confirm-text">Are you sure you want to delete this webhook?</span>
                    <button
                      className="btn btn--danger btn--sm"
                      data-testid={`webhook-delete-yes-${webhook.id}`}
                      onClick={() => handleDeleteConfirm(webhook.id)}
                      type="button"
                    >
                      Delete
                    </button>
                    <button
                      className="btn btn--secondary btn--sm"
                      data-testid={`webhook-delete-no-${webhook.id}`}
                      onClick={() => setDeleteConfirmId(null)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn--ghost btn--icon webhook-delete-btn"
                    data-testid={`webhook-delete-${webhook.id}`}
                    onClick={() => setDeleteConfirmId(webhook.id)}
                    type="button"
                    aria-label="Delete webhook"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 3.5h9M5 3.5V2.5a1 1 0 011-1h2a1 1 0 011 1v1M10.5 3.5v8a1 1 0 01-1 1h-5a1 1 0 01-1-1v-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <WebhookModal
        open={modalOpen}
        webhook={editingWebhook}
        onClose={handleModalClose}
      />
    </div>
  );
}
