import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthProvider'

interface NotificationPrefs {
  notify_client_updated: boolean
  notify_deal_created: boolean
  notify_deal_stage_changed: boolean
  notify_task_created: boolean
  notify_task_completed: boolean
  notify_contact_added: boolean
  notify_note_added: boolean
}

const PREF_LABELS: { key: keyof NotificationPrefs; label: string }[] = [
  { key: 'notify_client_updated', label: 'Client details updated' },
  { key: 'notify_deal_created', label: 'New deal created' },
  { key: 'notify_deal_stage_changed', label: 'Deal stage changed' },
  { key: 'notify_task_created', label: 'New task created' },
  { key: 'notify_task_completed', label: 'Task completed' },
  { key: 'notify_contact_added', label: 'New contact added' },
  { key: 'notify_note_added', label: 'Note added' },
]

const DEFAULT_PREFS: NotificationPrefs = {
  notify_client_updated: true,
  notify_deal_created: true,
  notify_deal_stage_changed: true,
  notify_task_created: true,
  notify_task_completed: true,
  notify_contact_added: true,
  notify_note_added: true,
}

export function NotificationPreferencesSection() {
  const { isLoggedIn } = useAuth()
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    fetch('/.netlify/functions/notification-preferences')
      .then(r => r.json())
      .then((data: { preferences: NotificationPrefs }) => {
        setPrefs(data.preferences)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [isLoggedIn])

  if (!isLoggedIn) return null

  async function handleToggle(key: keyof NotificationPrefs) {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    setSaving(true)
    try {
      await fetch('/.netlify/functions/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
    } catch {
      // Revert on error
      setPrefs(prefs)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-bg-primary border border-border rounded-lg p-5" data-testid="notification-preferences-section">
      <div className="flex items-center gap-2 mb-1">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <h2 className="text-[15px] font-semibold text-text-primary">Email Notifications</h2>
      </div>
      <p className="text-[12px] text-text-muted mb-4">
        Receive email notifications when changes happen to clients you follow. Follow a client from their detail page.
      </p>

      {!loaded ? (
        <div className="text-[13px] text-text-muted">Loading preferences...</div>
      ) : (
        <div className="flex flex-col gap-2">
          {PREF_LABELS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 py-1.5 cursor-pointer"
              data-testid={`notification-pref-${key}`}
            >
              {/* STP-NP-01: Notification preferences section displays all toggles when authenticated, STP-NP-02: Toggling a notification preference persists the change */}
              <button
                type="button"
                role="switch"
                aria-checked={prefs[key]}
                data-testid={`notification-toggle-${key}`}
                onClick={() => handleToggle(key)}
                disabled={saving}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                  prefs[key] ? 'bg-accent' : 'bg-bg-tertiary'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${
                    prefs[key] ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="text-[13px] text-text-primary">{label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
