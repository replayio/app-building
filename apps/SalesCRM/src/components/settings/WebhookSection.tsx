import { Plus, Trash2, Pencil } from 'lucide-react'

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  enabled: boolean
  created_at: string
}

interface WebhookSectionProps {
  webhooks: Webhook[]
  onAdd: () => void
  onEdit: (webhook: Webhook) => void
  onDelete: (id: string) => void
  onToggle: (id: string, enabled: boolean) => void
}

const EVENT_LABELS: Record<string, string> = {
  client_created: 'New Client Created',
  client_updated: 'Client Updated',
  deal_created: 'New Deal Created',
  deal_stage_changed: 'Deal Stage Changed',
  deal_closed_won: 'Deal Closed Won',
  deal_closed_lost: 'Deal Closed Lost',
  task_created: 'New Task Created',
  task_completed: 'Task Completed',
  contact_created: 'Contact Created',
  note_added: 'Note Added',
}

export function WebhookSection({ webhooks, onAdd, onEdit, onDelete, onToggle }: WebhookSectionProps) {
  return (
    <div data-testid="webhook-section" className="border border-border rounded-[6px] bg-surface">
      <div className="px-5 max-sm:px-3 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[14px] font-semibold text-text-primary">Webhooks</h2>
          <p className="text-[12px] text-text-muted mt-1">Send notifications to external services (Zapier, n8n, Discord) when events occur.</p>
        </div>
        {/* STP-WH-01: Webhook section shows empty state, STP-WH-02: Add Webhook button opens webhook modal with setup guide */}
        <button
          data-testid="add-webhook-button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 transition-opacity duration-100"
        >
          <Plus size={14} strokeWidth={2} />
          Add Webhook
        </button>
      </div>
      <div className="px-5 max-sm:px-3 py-4">
        {webhooks.length === 0 ? (
          <p data-testid="webhook-empty-state" className="text-[13px] text-text-muted text-center py-6">
            No webhooks configured. Add a webhook to send event notifications to external services.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                data-testid={`webhook-item-${webhook.id}`}
                className="border border-border rounded-[5px] p-4 max-sm:p-3"
              >
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span data-testid={`webhook-name-${webhook.id}`} className="text-[13px] font-medium text-text-primary">
                      {webhook.name}
                    </span>
                    {/* STP-WH-07: Enable/disable toggle changes webhook state */}
                    <label data-testid={`webhook-toggle-${webhook.id}`} className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhook.enabled}
                        onChange={() => onToggle(webhook.id, !webhook.enabled)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-checked:bg-accent rounded-full transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* STP-WH-08: Edit webhook flow updates webhook details */}
                    <button
                      data-testid={`webhook-edit-${webhook.id}`}
                      onClick={() => onEdit(webhook)}
                      className="p-1.5 text-text-muted hover:text-text-primary hover:bg-hover rounded-[4px] transition-colors duration-100"
                    >
                      <Pencil size={14} strokeWidth={1.75} />
                    </button>
                    {/* STP-WH-06: Delete webhook removes it after confirmation */}
                    <button
                      data-testid={`webhook-delete-${webhook.id}`}
                      onClick={() => onDelete(webhook.id)}
                      className="p-1.5 text-text-muted hover:text-red-500 hover:bg-hover rounded-[4px] transition-colors duration-100"
                    >
                      <Trash2 size={14} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
                <p data-testid={`webhook-url-${webhook.id}`} className="text-[12px] text-text-muted mb-2 font-mono truncate">
                  {webhook.url}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="text-[11px] px-2 py-0.5 rounded-[3px] bg-hover text-text-secondary border border-border"
                    >
                      {EVENT_LABELS[event] ?? event}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
