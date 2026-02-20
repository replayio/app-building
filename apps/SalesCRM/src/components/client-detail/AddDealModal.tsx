import { useState } from 'react'
import { X } from 'lucide-react'
import { FilterSelect } from '../shared/FilterSelect'

interface AddDealModalProps {
  open: boolean
  availableUsers?: { name: string }[]
  onClose: () => void
  onSave: (data: {
    name: string
    value: number
    stage: string
    owner: string
    probability: number
    expected_close_date: string | null
  }) => void
}

export function AddDealModal({ open, availableUsers = [], onClose, onSave }: AddDealModalProps) {
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [stage, setStage] = useState('lead')
  const [owner, setOwner] = useState('')
  const [probability, setProbability] = useState('')
  const [closeDate, setCloseDate] = useState('')

  if (!open) return null

  function handleSave() {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      value: parseFloat(value) || 0,
      stage,
      owner,
      probability: parseInt(probability) || 0,
      expected_close_date: closeDate || null,
    })
    setName('')
    setValue('')
    setStage('lead')
    setOwner('')
    setProbability('')
    setCloseDate('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px] max-h-[90vh] overflow-auto" data-testid="add-deal-modal">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Add Deal</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3.5">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Deal Name *</label>
            <input
              data-testid="deal-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter deal name"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Value ($)</label>
              <input
                data-testid="deal-value-input"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Stage</label>
              <FilterSelect
                testId="deal-stage-select"
                value={stage}
                onChange={(v) => setStage(v)}
                options={[
                  { value: 'lead', label: 'Lead' },
                  { value: 'qualification', label: 'Qualification' },
                  { value: 'discovery', label: 'Discovery' },
                  { value: 'proposal', label: 'Proposal Sent' },
                  { value: 'negotiation', label: 'Negotiation' },
                  { value: 'closed_won', label: 'Closed Won' },
                ]}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Owner</label>
            {availableUsers.length > 0 ? (
              <FilterSelect
                testId="deal-owner-input"
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
                data-testid="deal-owner-input"
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Deal owner name"
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Probability (%)</label>
              <input
                data-testid="deal-probability-input"
                type="number"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Expected Close Date</label>
              <input
                data-testid="deal-expected-close-date-input"
                type="date"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button
            data-testid="deal-cancel-button"
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            data-testid="deal-save-button"
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
