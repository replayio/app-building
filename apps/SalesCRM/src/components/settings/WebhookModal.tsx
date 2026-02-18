import { useState, useEffect } from 'react'

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  enabled: boolean
}

interface WebhookModalProps {
  open: boolean
  webhook: Webhook | null
  availableEvents: string[]
  onClose: () => void
  onSave: (data: { name: string; url: string; events: string[]; enabled: boolean }) => void
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

export function WebhookModal({ open, webhook, availableEvents, onClose, onSave }: WebhookModalProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [events, setEvents] = useState<string[]>([])
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (webhook) {
      setName(webhook.name)
      setUrl(webhook.url)
      setEvents(webhook.events)
      setEnabled(webhook.enabled)
    } else {
      setName('')
      setUrl('')
      setEvents([])
      setEnabled(true)
    }
  }, [webhook, open])

  if (!open) return null

  function toggleEvent(event: string) {
    setEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event])
  }

  function handleSave() {
    if (!name.trim() || !url.trim() || events.length === 0) return
    onSave({ name: name.trim(), url: url.trim(), events, enabled })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div data-testid="webhook-modal" className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px] max-h-[80vh] flex flex-col">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">
            {webhook ? 'Edit Webhook' : 'Add Webhook'}
          </h2>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">Name *</label>
            <input
              data-testid="webhook-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Zapier Integration"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder-text-disabled focus:outline-none focus:border-accent transition-colors duration-100"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">Webhook URL *</label>
            <input
              data-testid="webhook-url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/..."
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder-text-disabled focus:outline-none focus:border-accent transition-colors duration-100 font-mono"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-2">Events *</label>
            <div className="grid grid-cols-2 gap-2">
              {availableEvents.map((event) => (
                <label
                  key={event}
                  data-testid={`webhook-event-${event}`}
                  className="flex items-center gap-2 text-[12px] text-text-secondary cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="w-3.5 h-3.5 rounded-[3px] border-border accent-accent"
                  />
                  {EVENT_LABELS[event] ?? event}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
          <button
            data-testid="webhook-cancel-button"
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            data-testid="webhook-save-button"
            onClick={handleSave}
            disabled={!name.trim() || !url.trim() || events.length === 0}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            {webhook ? 'Save Changes' : 'Add Webhook'}
          </button>
        </div>
      </div>
    </div>
  )
}
