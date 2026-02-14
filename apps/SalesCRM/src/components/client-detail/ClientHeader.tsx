import { useState } from 'react'
import { Pencil, X, Check } from 'lucide-react'
import { StatusBadge } from '../clients/StatusBadge'
import { TagBadge } from '../clients/TagBadge'
import type { Client, ClientStatus, ClientType } from '../../types'

interface ClientHeaderProps {
  client: Client
  onUpdate: (data: Record<string, unknown>) => void
}

export function ClientHeader({ client, onUpdate }: ClientHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(client.name)
  const [type, setType] = useState<ClientType>(client.type)
  const [status, setStatus] = useState<ClientStatus>(client.status)
  const [tagsInput, setTagsInput] = useState(client.tags.join(', '))

  function handleSave() {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onUpdate({ name, type, status, tags })
    setEditing(false)
  }

  function handleCancel() {
    setName(client.name)
    setType(client.type)
    setStatus(client.status)
    setTagsInput(client.tags.join(', '))
    setEditing(false)
  }

  function handleStatusChange(newStatus: ClientStatus) {
    onUpdate({ status: newStatus })
  }

  if (editing) {
    return (
      <div className="mb-6" data-testid="client-header">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="client-header-name-input"
            className="text-[24px] font-semibold text-text-primary bg-base border border-border rounded-[5px] px-2 py-1 focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleSave}
            data-testid="client-header-save-button"
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-status-active hover:bg-hover transition-colors duration-100"
          >
            <Check size={16} strokeWidth={2} />
          </button>
          <button
            onClick={handleCancel}
            data-testid="client-header-cancel-button"
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ClientType)}
              data-testid="client-header-type-select"
              className="h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
            >
              <option value="organization">Organization</option>
              <option value="individual">Individual</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              data-testid="client-header-status-select"
              className="h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
              <option value="churned">Churned</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. Enterprise, SaaS, VIP"
            data-testid="client-header-tags-input"
            className="w-full max-w-[400px] h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6" data-testid="client-header">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[24px] font-semibold text-text-primary" data-testid="client-header-title">{client.name}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-border/50 text-text-secondary capitalize" data-testid="client-header-type-badge">
              {client.type === 'organization' ? 'Organization' : 'Individual'}
            </span>
            <StatusDropdown status={client.status} onChange={handleStatusChange} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap" data-testid="client-header-tags">
            {client.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
            {client.source_type && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-normal text-text-muted bg-border/50" data-testid="client-header-source-badge">
                {client.source_type}
                {client.source_detail && ` (${client.source_detail})`}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
          title="Edit client"
          data-testid="client-header-edit-button"
        >
          <Pencil size={14} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}

function StatusDropdown({ status, onChange }: { status: ClientStatus; onChange: (s: ClientStatus) => void }) {
  const [open, setOpen] = useState(false)
  const statuses: ClientStatus[] = ['active', 'inactive', 'prospect', 'churned']

  return (
    <div className="relative" data-testid="client-header-status-dropdown">
      <button onClick={() => setOpen(!open)} data-testid="status-dropdown-button">
        <span data-testid="client-header-status-badge"><StatusBadge status={status} /></span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-surface border border-border rounded-[6px] shadow-[var(--shadow-elevation-2)] py-1 min-w-[120px]" data-testid="status-dropdown-options">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false) }}
                data-testid={`status-dropdown-option-${s}`}
                className="w-full px-3 py-1.5 text-left text-[13px] text-text-secondary hover:bg-hover transition-colors duration-100 capitalize"
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
