import { useState } from 'react'
import { X } from 'lucide-react'
import type { ClientType, ClientStatus } from '../../types'

interface AddClientModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    type: ClientType
    status: ClientStatus
    tags: string[]
    source_type: string
    source_detail: string
    campaign: string
    channel: string
  }) => void
}

export function AddClientModal({ open, onClose, onSave }: AddClientModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<ClientType>('organization')
  const [status, setStatus] = useState<ClientStatus>('prospect')
  const [tagsInput, setTagsInput] = useState('')
  const [sourceType, setSourceType] = useState('')
  const [sourceDetail, setSourceDetail] = useState('')
  const [campaign, setCampaign] = useState('')
  const [channel, setChannel] = useState('')

  if (!open) return null

  function handleSave() {
    if (!name.trim()) return
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSave({
      name: name.trim(),
      type,
      status,
      tags,
      source_type: sourceType,
      source_detail: sourceDetail,
      campaign,
      channel,
    })
    // Reset form
    setName('')
    setType('organization')
    setStatus('prospect')
    setTagsInput('')
    setSourceType('')
    setSourceDetail('')
    setCampaign('')
    setChannel('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* Modal */}
      <div data-testid="add-client-modal" className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px] max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Add New Client</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3.5">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Client Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter client name"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          {/* Type */}
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ClientType)}
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
            >
              <option value="organization">Organization</option>
              <option value="individual">Individual</option>
            </select>
          </div>
          {/* Status */}
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
            >
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="churned">Churned</option>
            </select>
          </div>
          {/* Tags */}
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Enterprise, SaaS, VIP"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          {/* Source Type */}
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Acquisition Source</label>
            <input
              type="text"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              placeholder="e.g. Referral, Direct Sales, Campaign"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          {/* Source Detail */}
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Source Detail</label>
            <input
              type="text"
              value={sourceDetail}
              onChange={(e) => setSourceDetail(e.target.value)}
              placeholder="e.g. John Smith"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          {/* Campaign */}
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Campaign</label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="Campaign name"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          {/* Channel */}
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Channel</label>
            <input
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="e.g. Direct Sales, Partner"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
