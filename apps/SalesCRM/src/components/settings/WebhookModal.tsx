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

type Platform = 'zapier' | 'n8n' | 'custom'

const PLATFORM_GUIDES: Record<Platform, { label: string; steps: string[]; urlHint: string; tip: string }> = {
  zapier: {
    label: 'Zapier',
    steps: [
      'Create a new Zap in your Zapier dashboard.',
      'Choose "Webhooks by Zapier" as the trigger app.',
      'Select "Catch Hook" as the trigger event.',
      'Copy the webhook URL provided by Zapier and paste it above.',
      'After saving, trigger a test event so Zapier can detect the payload schema.',
    ],
    urlHint: 'https://hooks.zapier.com/hooks/catch/...',
    tip: 'Zapier needs the first event sent to auto-detect the JSON schema. After saving, trigger one of the selected events so Zapier can set up field mapping.',
  },
  n8n: {
    label: 'n8n',
    steps: [
      'Add a "Webhook" node to your n8n workflow.',
      'Set the HTTP Method to POST.',
      'Copy the "Test URL" or "Production URL" from the node settings.',
      'Paste the URL above. Use the Production URL for live use.',
    ],
    urlHint: 'https://your-n8n-instance.com/webhook/...',
    tip: 'n8n has separate Test and Production URLs. The Test URL only works while the workflow editor is open. Switch to the Production URL before going live.',
  },
  custom: {
    label: 'Custom Endpoint',
    steps: [
      'Set up an HTTP endpoint on your server that accepts POST requests.',
      'The endpoint should return a 2xx status code on success.',
      'Paste your endpoint URL above.',
    ],
    urlHint: 'https://api.yourapp.com/webhooks/salescrm',
    tip: 'Your endpoint will receive a POST request with Content-Type: application/json. Respond with a 2xx status within 10 seconds to confirm receipt.',
  },
}

const PAYLOAD_EXAMPLE = `{
  "event": "deal_stage_changed",
  "timestamp": "2026-02-19T12:00:00Z",
  "data": {
    "id": "abc-123",
    "name": "Acme Deal",
    "stage": "proposal",
    "previous_stage": "discovery",
    ...
  }
}`

export function WebhookModal({ open, webhook, availableEvents, onClose, onSave }: WebhookModalProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [events, setEvents] = useState<string[]>([])
  const [enabled, setEnabled] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [showPayload, setShowPayload] = useState(false)

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
    setSelectedPlatform(null)
    setShowPayload(false)
  }, [webhook, open])

  if (!open) return null

  function toggleEvent(event: string) {
    setEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event])
  }

  function handleSave() {
    if (!name.trim() || !url.trim() || events.length === 0) return
    onSave({ name: name.trim(), url: url.trim(), events, enabled })
  }

  const guide = selectedPlatform ? PLATFORM_GUIDES[selectedPlatform] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div data-testid="webhook-modal" className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[520px] max-sm:max-w-[calc(100%-24px)] max-h-[85vh] flex flex-col">
        <div className="px-5 max-sm:px-3 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">
            {webhook ? 'Edit Webhook' : 'Add Webhook'}
          </h2>
        </div>
        <div className="px-5 max-sm:px-3 py-4 overflow-y-auto flex flex-col gap-4">
          {/* Setup Guide */}
          <div data-testid="webhook-setup-guide">
            <label className="block text-[12px] font-medium text-text-secondary mb-2">Setup Guide</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {(Object.entries(PLATFORM_GUIDES) as [Platform, typeof PLATFORM_GUIDES[Platform]][]).map(([key, { label }]) => (
                <button
                  key={key}
                  data-testid={`webhook-platform-${key}`}
                  onClick={() => setSelectedPlatform(selectedPlatform === key ? null : key)}
                  className={`h-[28px] px-3 text-[12px] font-medium rounded-[5px] border transition-colors duration-100 ${
                    selectedPlatform === key
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-border text-text-secondary hover:bg-hover'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {guide && (
              <div data-testid="webhook-platform-instructions" className="bg-surface-elevated rounded-[5px] border border-border p-3 text-[12px] text-text-secondary">
                <ol className="list-decimal list-inside space-y-1 mb-2">
                  {guide.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <div className="flex items-center gap-1.5 text-[11px] text-text-disabled mb-1 flex-wrap">
                  <span>URL format:</span>
                  <code className="font-mono bg-surface px-1 py-0.5 rounded text-[11px] break-all">{guide.urlHint}</code>
                </div>
                <div data-testid="webhook-platform-tip" className="text-[11px] text-accent/80 mt-1.5">
                  Tip: {guide.tip}
                </div>
              </div>
            )}
          </div>

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
              placeholder={guide ? guide.urlHint : 'https://hooks.zapier.com/...'}
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder-text-disabled focus:outline-none focus:border-accent transition-colors duration-100 font-mono"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-2">Events *</label>
            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-2">
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

          {/* Payload Format */}
          <div>
            <button
              data-testid="webhook-payload-toggle"
              onClick={() => setShowPayload(!showPayload)}
              className="text-[12px] font-medium text-accent hover:underline"
            >
              {showPayload ? 'Hide' : 'Show'} payload format
            </button>
            {showPayload && (
              <pre data-testid="webhook-payload-example" className="mt-2 bg-surface-elevated border border-border rounded-[5px] p-3 text-[11px] font-mono text-text-secondary overflow-x-auto whitespace-pre">
                {PAYLOAD_EXAMPLE}
              </pre>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 max-sm:px-3 py-3 border-t border-border">
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
