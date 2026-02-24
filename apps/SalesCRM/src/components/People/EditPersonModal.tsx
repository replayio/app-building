import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface EditPersonModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    title: string
    email: string
    phone: string
    location: string
  }) => Promise<void>
  person: {
    name: string
    title: string | null
    email: string | null
    phone: string | null
    location: string | null
  }
}

export default function EditPersonModal({ open, onClose, onSubmit, person }: EditPersonModalProps) {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(person.name)
      setTitle(person.title || '')
      setEmail(person.email || '')
      setPhone(person.phone || '')
      setLocation(person.location || '')
      setError('')
    }
  }, [open, person])

  if (!open) return null

  function handleClose() {
    setError('')
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
      })
      onClose()
    } catch {
      setError('Failed to update contact')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="edit-person-modal">
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className="relative bg-[var(--color-bg-base)] rounded-lg shadow-[var(--shadow-elevation-2)] w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-bg-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">Edit Contact</h2>
          <button type="button" onClick={handleClose} className="p-1 rounded hover:bg-[var(--color-hover)] cursor-pointer">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <p className="text-[12px] text-[var(--color-priority-high)]">{error}</p>
          )}

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Name *</label>
            <input
              data-testid="edit-person-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Title</label>
            <input
              data-testid="edit-person-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Email</label>
            <input
              data-testid="edit-person-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Phone</label>
            <input
              data-testid="edit-person-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Location</label>
            <input
              data-testid="edit-person-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="h-8 px-3 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              data-testid="edit-person-submit"
              type="submit"
              disabled={submitting}
              className="h-8 px-4 rounded text-[13px] text-white bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
