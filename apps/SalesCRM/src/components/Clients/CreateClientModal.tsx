import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import FilterSelect from '../FilterSelect'
import type { Client } from '../../store/slices/clientsSlice'

interface CreateClientModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    type: string
    status: string
    tags: string[]
    source_type: string
    source_detail: string
    campaign: string
    channel: string
    date_acquired: string
  }) => Promise<void>
  editingClient?: Client | null
}

const typeOptions = [
  { value: 'organization', label: 'Organization' },
  { value: 'individual', label: 'Individual' },
]

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'churned', label: 'Churned' },
]

const sourceTypeOptions = [
  { value: '', label: 'None' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Campaign', label: 'Campaign' },
  { value: 'Website', label: 'Website' },
  { value: 'Cold Call', label: 'Cold Call' },
  { value: 'Event', label: 'Event' },
]

export default function CreateClientModal({ open, onClose, onSubmit, editingClient }: CreateClientModalProps) {
  const isEditing = !!editingClient
  const [name, setName] = useState('')
  const [type, setType] = useState('organization')
  const [status, setStatus] = useState('prospect')
  const [tagsInput, setTagsInput] = useState('')
  const [sourceType, setSourceType] = useState('')
  const [sourceDetail, setSourceDetail] = useState('')
  const [campaign, setCampaign] = useState('')
  const [channel, setChannel] = useState('')
  const [dateAcquired, setDateAcquired] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name)
      setType(editingClient.type)
      setStatus(editingClient.status)
      setTagsInput(editingClient.tags?.join(', ') || '')
      setSourceType(editingClient.source_type || '')
      setSourceDetail(editingClient.source_detail || '')
      setCampaign(editingClient.campaign || '')
      setChannel(editingClient.channel || '')
      setDateAcquired(editingClient.date_acquired || '')
    }
  }, [editingClient])

  if (!open) return null

  function resetForm() {
    setName('')
    setType('organization')
    setStatus('prospect')
    setTagsInput('')
    setSourceType('')
    setSourceDetail('')
    setCampaign('')
    setChannel('')
    setDateAcquired('')
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
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      await onSubmit({
        name: name.trim(),
        type,
        status,
        tags,
        source_type: sourceType,
        source_detail: sourceDetail.trim(),
        campaign: campaign.trim(),
        channel: channel.trim(),
        date_acquired: dateAcquired,
      })
      resetForm()
      onClose()
    } catch {
      setError(isEditing ? 'Failed to update client' : 'Failed to create client')
    } finally {
      setSubmitting(false)
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t && t !== tagToRemove)
    setTagsInput(tags.join(', '))
  }

  const currentTags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="create-client-modal">
      <div className="absolute inset-0 bg-black/30" data-testid="modal-overlay" onClick={handleClose} />
      <div className="relative bg-[var(--color-bg-base)] rounded-lg shadow-[var(--shadow-elevation-2)] w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-bg-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
            {isEditing ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button type="button" onClick={handleClose} className="p-1 rounded hover:bg-[var(--color-hover)] cursor-pointer">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <p data-testid="client-form-error" className="text-[12px] text-[var(--color-priority-high)]">{error}</p>
          )}

          {/* Name */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Name *</label>
            <input
              data-testid="client-form-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Client name"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Type</label>
            <FilterSelect
              data-testid="client-form-type"
              value={type}
              onChange={setType}
              options={typeOptions}
              placeholder="Select type"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Status</label>
            <FilterSelect
              data-testid="client-form-status"
              value={status}
              onChange={setStatus}
              options={statusOptions}
              placeholder="Select status"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Tags</label>
            {currentTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {currentTags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-[var(--color-hover)] text-[var(--color-text-muted)]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-[var(--color-text-disabled)] hover:text-[var(--color-text-muted)] cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              data-testid="client-form-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Enter tags separated by commas"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Source Type */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Source Type</label>
            <FilterSelect
              data-testid="client-form-source-type"
              value={sourceType}
              onChange={setSourceType}
              options={sourceTypeOptions}
              placeholder="Select source type"
            />
          </div>

          {/* Source Detail */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Source Detail</label>
            <input
              data-testid="client-form-source-detail"
              type="text"
              value={sourceDetail}
              onChange={(e) => setSourceDetail(e.target.value)}
              placeholder="Additional source info"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Campaign */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Campaign</label>
            <input
              data-testid="client-form-campaign"
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="Campaign name"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Channel */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Channel</label>
            <input
              data-testid="client-form-channel"
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="Acquisition channel"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Date Acquired */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Date Acquired</label>
            <input
              data-testid="client-form-date-acquired"
              type="date"
              value={dateAcquired}
              onChange={(e) => setDateAcquired(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              data-testid="create-client-cancel"
              type="button"
              onClick={handleClose}
              className="h-8 px-3 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              data-testid="create-client-submit"
              type="submit"
              disabled={submitting}
              className="h-8 px-4 rounded text-[13px] text-white bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default"
            >
              {submitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
