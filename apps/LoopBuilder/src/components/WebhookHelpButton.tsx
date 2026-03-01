import { useState } from 'react'
import './WebhookHelpButton.css'

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/.netlify/functions/app-builder-event',
    auth: 'Bearer token via Authorization header, or secret query parameter (?secret=YOUR_SECRET)',
    requiredFields: [
      { name: 'container_id', type: 'string', description: 'ID of the container' },
      { name: 'event_type', type: 'string', description: 'Type of the event' },
    ],
    optionalFields: [
      { name: 'payload', type: 'object', description: 'Additional event data' },
      { name: 'status', type: 'string', description: 'New container status' },
    ],
    curl: `curl -X POST https://YOUR_SITE/.netlify/functions/app-builder-event \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"container_id": "machine-123", "event_type": "build_complete", "status": "finished"}'`,
  },
  {
    method: 'POST',
    path: '/.netlify/functions/spawn-container',
    auth: 'Bearer token via Authorization header, or secret query parameter (?secret=YOUR_SECRET)',
    requiredFields: [],
    optionalFields: [
      { name: 'prompt', type: 'string', description: 'Build prompt (falls back to default_prompt if omitted)' },
    ],
    curl: `curl -X POST https://YOUR_SITE/.netlify/functions/spawn-container \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"prompt": "Build a todo app with authentication"}'
# Returns immediately with { name, status: "pending", prompt }
# Container spawning runs in background; poll status endpoint for updates`,
  },
  {
    method: 'POST',
    path: '/.netlify/functions/set-default-prompt',
    auth: 'Bearer token via Authorization header, or secret query parameter (?secret=YOUR_SECRET)',
    requiredFields: [
      { name: 'prompt', type: 'string', description: 'The new default prompt text' },
    ],
    optionalFields: [],
    curl: `curl -X POST https://YOUR_SITE/.netlify/functions/set-default-prompt \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"prompt": "Build a dashboard app with charts"}'`,
  },
]

function WebhookHelpButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* WebhookHelpButton: Visible on StatusPage, Opens help panel on click */}
      <button
        className="webhook-help-btn"
        data-testid="webhook-help-button"
        onClick={() => setOpen(true)}
      >
        ? Webhook Documentation
      </button>
      {open && (
        <div
          className="webhook-help-overlay"
          data-testid="webhook-help-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="webhook-help-panel" data-testid="webhook-help-panel">
            <div className="webhook-help-panel__header">
              <h2 className="webhook-help-panel__title">Webhook Endpoints</h2>
              {/* WebhookHelpButton: Closes help panel */}
              <button
                className="webhook-help-panel__close"
                data-testid="webhook-help-close"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            {ENDPOINTS.map((ep) => (
              <div
                key={ep.path}
                className="webhook-help-endpoint"
                data-testid="webhook-help-endpoint"
              >
                <div className="webhook-help-endpoint__header">
                  <span className="webhook-help-endpoint__method" data-testid="webhook-endpoint-method">
                    {ep.method}
                  </span>
                  <span className="webhook-help-endpoint__path" data-testid="webhook-endpoint-path">
                    {ep.path}
                  </span>
                </div>
                <div className="webhook-help-endpoint__body">
                  <div className="webhook-help-endpoint__section">
                    <div className="webhook-help-endpoint__label">Authentication</div>
                    <div className="webhook-help-endpoint__text" data-testid="webhook-endpoint-auth">
                      {ep.auth}
                    </div>
                  </div>
                  {ep.requiredFields.length > 0 && (
                    <div className="webhook-help-endpoint__section">
                      <div className="webhook-help-endpoint__label">Required Fields</div>
                      <ul className="webhook-help-endpoint__fields" data-testid="webhook-endpoint-required-fields">
                        {ep.requiredFields.map((f) => (
                          <li key={f.name}>
                            <code>{f.name}</code> ({f.type}) — {f.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ep.optionalFields.length > 0 && (
                    <div className="webhook-help-endpoint__section">
                      <div className="webhook-help-endpoint__label">Optional Fields</div>
                      <ul className="webhook-help-endpoint__fields" data-testid="webhook-endpoint-optional-fields">
                        {ep.optionalFields.map((f) => (
                          <li key={f.name}>
                            <code>{f.name}</code> ({f.type}) — {f.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ep.requiredFields.length === 0 && (
                    <div className="webhook-help-endpoint__section">
                      <div className="webhook-help-endpoint__label">Required Fields</div>
                      <div className="webhook-help-endpoint__text" data-testid="webhook-endpoint-required-fields">
                        None — all fields are optional
                      </div>
                    </div>
                  )}
                  <div className="webhook-help-endpoint__section">
                    <div className="webhook-help-endpoint__label">Example</div>
                    <code className="webhook-help-endpoint__curl" data-testid="webhook-endpoint-curl">
                      {ep.curl}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default WebhookHelpButton
