import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import FilterSelect from '../FilterSelect'

interface CreateContactModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    client_id: string
  }) => Promise<void>
}

interface SelectOption {
  value: string
  label: string
}

export default function CreateContactModal({ open, onClose, onSubmit }: CreateContactModalProps) {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [clientId, setClientId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [clients, setClients] = useState<SelectOption[]>([])

  useEffect(() => {
    if (open) {
      fetch('/.netlify/functions/clients?limit=200')
        .then((r) => r.json())
        .then((data) => {
          const items = (data.clients || data || []) as Array<{ id: string; name: string }>
          setClients(items.map((c) => ({ value: c.id, label: c.name })))
        })
        .catch(() => {})
    }
  }, [open])

  if (!open) return null

  function resetForm() {
    setName('')
    setTitle('')
    setEmail('')
    setPhone('')
    setLocation('')
    setClientId('')
    setError('')
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        title: title.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        client_id: clientId,
      })
      resetForm()
      onClose()
    } catch {
      setError('Failed to create contact')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="create-contact-modal">
      <div className="absolute inset-0 bg-black/30" data-testid="modal-overlay" onClick={handleClose} />
      <div className="relative bg-[var(--color-bg-base)] rounded-lg shadow-[var(--shadow-elevation-2)] w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-bg-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">Add Contact</h2>
          <button type="button" onClick={handleClose} className="p-1 rounded hover:bg-[var(--color-hover)] cursor-pointer">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <p data-testid="contact-form-error" className="text-[12px] text-[var(--color-priority-high)]">{error}</p>
          )}

          {/* Name */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Name *</label>
            <input
              data-testid="contact-form-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Title</label>
            <input
              data-testid="contact-form-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job title"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Email</label>
            <input
              data-testid="contact-form-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Phone</label>
            <input
              data-testid="contact-form-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Location</label>
            <input
              data-testid="contact-form-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Client */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Client</label>
            <FilterSelect
              data-testid="contact-form-client"
              value={clientId}
              onChange={setClientId}
              options={[{ value: '', label: 'None' }, ...clients]}
              placeholder="Select client"
              searchable
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              data-testid="create-contact-cancel"
              type="button"
              onClick={handleClose}
              className="h-8 px-3 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              data-testid="create-contact-submit"
              type="submit"
              disabled={submitting}
              className="h-8 px-4 rounded text-[13px] text-white bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
