import { useState } from 'react'
import { X } from 'lucide-react'
import type { ContactHistoryType } from '../../types'

interface AddContactHistoryModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { date: string; type: ContactHistoryType; summary: string; team_member: string }) => void
}

const TYPE_OPTIONS: { value: ContactHistoryType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'video_call', label: 'Video Call' },
  { value: 'meeting', label: 'Meeting (In-person)' },
  { value: 'note', label: 'Note' },
]

export function AddContactHistoryModal({ open, onClose, onSave }: AddContactHistoryModalProps) {
  const [date, setDate] = useState('')
  const [type, setType] = useState<ContactHistoryType>('email')
  const [summary, setSummary] = useState('')
  const [teamMember, setTeamMember] = useState('')

  if (!open) return null

  function handleSave() {
    if (!date || !summary.trim()) return
    onSave({
      date,
      type,
      summary: summary.trim(),
      team_member: teamMember.trim(),
    })
    setDate('')
    setType('email')
    setSummary('')
    setTeamMember('')
  }

  return (
    <div data-testid="add-contact-history-modal" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px] max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Add Contact History Entry</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Date/Time *</label>
              <input
                data-testid="contact-history-date-input"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Type *</label>
              <select
                data-testid="contact-history-type-select"
                value={type}
                onChange={(e) => setType(e.target.value as ContactHistoryType)}
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Summary/Notes *</label>
            <textarea
              data-testid="contact-history-summary-input"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe the interaction..."
              rows={3}
              className="w-full px-3 py-2 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent resize-none"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Team Member</label>
            <input
              data-testid="contact-history-team-member-input"
              type="text"
              value={teamMember}
              onChange={(e) => setTeamMember(e.target.value)}
              placeholder="e.g. Sarah K. (Sales Lead)"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button
            data-testid="contact-history-cancel-button"
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            data-testid="contact-history-save-button"
            onClick={handleSave}
            disabled={!date || !summary.trim()}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
