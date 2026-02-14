import { useState, useEffect, useRef } from 'react'
import { X, Search } from 'lucide-react'
import type { RelationshipType } from '../../types'

interface AddRelationshipModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { related_individual_id: string; relationship_type: RelationshipType }) => void
}

interface IndividualOption {
  id: string
  name: string
  title: string | null
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
  const [selectedId, setSelectedId] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('colleague')
  const [searchQuery, setSearchQuery] = useState('')
  const [options, setOptions] = useState<IndividualOption[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      setLoading(true)
      fetch(`/.netlify/functions/individuals?search=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data: { individuals: IndividualOption[] }) => {
          setOptions(data.individuals)
        })
        .catch(() => setOptions([]))
        .finally(() => setLoading(false))
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery, open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!open) return null

  function handleSave() {
    if (!selectedId) return
    onSave({
      related_individual_id: selectedId,
      relationship_type: relationshipType,
    })
    setSelectedId('')
    setSelectedName('')
    setSearchQuery('')
    setRelationshipType('colleague')
  }

  function handleSelect(person: IndividualOption) {
    setSelectedId(person.id)
    setSelectedName(person.name)
    setSearchQuery(person.name)
    setShowDropdown(false)
  }

  return (
    <div data-testid="add-relationship-modal" className="fixed inset-0 z-50 flex items-center justify-center">
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
          <div ref={dropdownRef} className="relative">
            <label className="block text-[12px] font-medium text-text-muted mb-1">Person *</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
              <input
                data-testid="relationship-person-search"
                type="text"
                value={showDropdown ? searchQuery : selectedName || searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedId('')
                  setSelectedName('')
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search by name..."
                className="w-full h-[34px] pl-8 pr-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
              />
            </div>
            {showDropdown && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-[5px] shadow-[var(--shadow-elevation-2)] max-h-[200px] overflow-auto">
                {loading && (
                  <div className="px-3 py-2 text-[12px] text-text-muted">Searching...</div>
                )}
                {!loading && options.length === 0 && (
                  <div className="px-3 py-2 text-[12px] text-text-muted">No individuals found</div>
                )}
                {!loading && options.map((person) => (
                  <button
                    key={person.id}
                    data-testid={`person-option-${person.id}`}
                    onClick={() => handleSelect(person)}
                    className="w-full text-left px-3 py-2 text-[13px] text-text-primary hover:bg-hover transition-colors duration-75"
                  >
                    <span className="font-medium">{person.name}</span>
                    {person.title && <span className="text-text-muted ml-1.5">— {person.title}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Relationship Type *</label>
            <select
              data-testid="relationship-type-select"
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
            data-testid="relationship-cancel-button"
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            data-testid="relationship-save-button"
            onClick={handleSave}
            disabled={!selectedId}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
