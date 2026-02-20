import { useState } from 'react'
import type { DealStage } from '../../types'
import { FilterSelect } from '../shared/FilterSelect'

interface CreateDealModalProps {
  open: boolean
  availableClients: { id: string; name: string }[]
  availableUsers?: { name: string }[]
  onClose: () => void
  onSave: (data: {
    name: string
    client_id: string
    value: number
    stage: DealStage
    owner: string
    expected_close_date: string | null
  }) => void
}

const STAGE_OPTIONS: { value: DealStage; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'proposal', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
]

export function CreateDealModal({ open, availableClients, availableUsers = [], onClose, onSave }: CreateDealModalProps) {
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const [value, setValue] = useState('')
  const [stage, setStage] = useState<DealStage>('lead')
  const [owner, setOwner] = useState('')
  const [closeDate, setCloseDate] = useState('')

  if (!open) return null

  function handleSave() {
    if (!name.trim() || !clientId) return
    onSave({
      name: name.trim(),
      client_id: clientId,
      value: parseFloat(value) || 0,
      stage,
      owner: owner.trim(),
      expected_close_date: closeDate || null,
    })
    setName('')
    setClientId('')
    setValue('')
    setStage('lead')
    setOwner('')
    setCloseDate('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="create-deal-modal">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px]">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Create New Deal</h2>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-[12px] text-text-muted mb-1">Deal Name *</label>
            <input
              type="text"
              data-testid="create-deal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent transition-colors duration-100"
              placeholder="Enter deal name"
            />
          </div>
          <div>
            <label className="block text-[12px] text-text-muted mb-1">Client *</label>
            <FilterSelect
              testId="create-deal-client"
              value={clientId}
              onChange={(val) => setClientId(val)}
              placeholder="Select a client..."
              searchable
              options={[
                { value: '', label: 'Select a client...' },
                ...availableClients.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-text-muted mb-1">Value ($)</label>
              <input
                type="number"
                data-testid="create-deal-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent transition-colors duration-100"
                placeholder="0"
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-[12px] text-text-muted mb-1">Stage</label>
              <FilterSelect
                testId="create-deal-stage"
                value={stage}
                onChange={(val) => setStage(val as DealStage)}
                options={STAGE_OPTIONS}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-text-muted mb-1">Owner</label>
              {availableUsers.length > 0 ? (
                <FilterSelect
                  testId="create-deal-owner"
                  value={owner}
                  onChange={(val) => setOwner(val)}
                  placeholder="Select owner..."
                  searchable
                  options={[
                    { value: '', label: '— None —' },
                    ...availableUsers.map((u) => ({ value: u.name, label: u.name })),
                  ]}
                />
              ) : (
                <input
                  type="text"
                  data-testid="create-deal-owner"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent transition-colors duration-100"
                  placeholder="Deal owner"
                />
              )}
            </div>
            <div>
              <label className="block text-[12px] text-text-muted mb-1">Expected Close Date</label>
              <input
                type="date"
                data-testid="create-deal-close-date"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent transition-colors duration-100"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
          <button
            data-testid="create-deal-cancel"
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            data-testid="create-deal-save"
            onClick={handleSave}
            disabled={!name.trim() || !clientId}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
