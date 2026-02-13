import { useState } from 'react'
import { X } from 'lucide-react'
import type { RelationshipType } from '../../types'

interface AddRelationshipModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { related_individual_id: string; relationship_type: RelationshipType }) => void
}

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: 'colleague', label: 'Colleague' },
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'manager', label: 'Manager' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' },
]

export function AddRelationshipModal({ open, onClose, onSave }: AddRelationshipModalProps) {
  const [relatedId, setRelatedId] = useState('')
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('colleague')

  if (!open) return null

  function handleSave() {
    if (!relatedId.trim()) return
    onSave({
      related_individual_id: relatedId.trim(),
      relationship_type: relationshipType,
    })
    setRelatedId('')
    setRelationshipType('colleague')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px] max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Add Relationship</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3.5">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Person ID *</label>
            <input
              type="text"
              value={relatedId}
              onChange={(e) => setRelatedId(e.target.value)}
              placeholder="Enter person ID or search"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Relationship Type *</label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
            >
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
            disabled={!relatedId.trim()}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
