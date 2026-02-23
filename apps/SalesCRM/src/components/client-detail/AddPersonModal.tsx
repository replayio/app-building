import { useState, useEffect, useRef } from 'react'
import { X, Search } from 'lucide-react'

interface IndividualOption {
  id: string
  name: string
  title: string | null
}

type PersonMode = 'create' | 'associate'

export type AddPersonData =
  | { mode: 'create'; name: string; title: string; email: string; phone: string; role: string }
  | { mode: 'associate'; individual_id: string; role: string }

interface AddPersonModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: AddPersonData) => void
}

export function AddPersonModal({ open, onClose, onSave }: AddPersonModalProps) {
  const [mode, setMode] = useState<PersonMode>('create')
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')

  // Associate existing state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const [options, setOptions] = useState<IndividualOption[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || mode !== 'associate') return
    const timer = setTimeout(() => {
      setSearchLoading(true)
      fetch(`/.netlify/functions/individuals?search=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data: { individuals: IndividualOption[] }) => {
          setOptions(data.individuals)
        })
        .catch(() => setOptions([]))
        .finally(() => setSearchLoading(false))
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery, open, mode])

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
    if (mode === 'create') {
      if (!name.trim()) return
      onSave({
        mode: 'create',
        name: name.trim(),
        title,
        email,
        phone,
        role,
      })
    } else {
      if (!selectedId) return
      onSave({
        mode: 'associate',
        individual_id: selectedId,
        role,
      })
    }
    resetForm()
  }

  function resetForm() {
    setName('')
    setTitle('')
    setEmail('')
    setPhone('')
    setRole('')
    setSearchQuery('')
    setSelectedId('')
    setSelectedName('')
    setOptions([])
    setShowDropdown(false)
  }

  function handleSelect(person: IndividualOption) {
    setSelectedId(person.id)
    setSelectedName(person.name)
    setSearchQuery(person.name)
    setShowDropdown(false)
  }

  function handleModeChange(newMode: PersonMode) {
    setMode(newMode)
    resetForm()
  }

  const isSaveDisabled = mode === 'create' ? !name.trim() : !selectedId

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px] max-sm:max-w-[calc(100%-24px)] max-h-[90vh] overflow-auto" data-testid="add-person-modal">
        <div className="flex items-center justify-between px-5 max-sm:px-3 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Add Person</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
            data-testid="add-person-modal-close"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-5 max-sm:px-3 py-4 flex flex-col gap-3.5">
          {/* Mode toggle */}
          <div className="flex gap-2" data-testid="person-mode-toggle">
            <button
              data-testid="person-mode-create"
              onClick={() => handleModeChange('create')}
              className={`flex-1 h-[34px] text-[13px] font-medium rounded-[5px] border transition-colors duration-100 ${
                mode === 'create'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-base text-text-secondary border-border hover:bg-hover'
              }`}
            >
              Create New
            </button>
            <button
              data-testid="person-mode-associate"
              onClick={() => handleModeChange('associate')}
              className={`flex-1 h-[34px] text-[13px] font-medium rounded-[5px] border transition-colors duration-100 ${
                mode === 'associate'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-base text-text-secondary border-border hover:bg-hover'
              }`}
            >
              Associate Existing
            </button>
          </div>

          {mode === 'create' ? (
            <>
              <div>
                <label className="block text-[12px] font-medium text-text-muted mb-1">Name *</label>
                <input
                  data-testid="person-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter person's name"
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-text-muted mb-1">Role/Title</label>
                <input
                  data-testid="person-role-input"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. CEO, Project Manager"
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-text-muted mb-1">Title</label>
                <input
                  data-testid="person-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chief Executive Officer"
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
                />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-text-muted mb-1">Email</label>
                  <input
                    data-testid="person-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-muted mb-1">Phone</label>
                  <input
                    data-testid="person-phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div ref={dropdownRef} className="relative">
                <label className="block text-[12px] font-medium text-text-muted mb-1">Person *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
                  <input
                    data-testid="person-search-input"
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
                  <div data-testid="person-search-results" className="absolute z-10 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-[5px] shadow-[var(--shadow-elevation-2)] max-h-[200px] overflow-auto">
                    {searchLoading && (
                      <div className="px-3 py-2 text-[12px] text-text-muted">Searching...</div>
                    )}
                    {!searchLoading && options.length === 0 && (
                      <div className="px-3 py-2 text-[12px] text-text-muted">No individuals found</div>
                    )}
                    {!searchLoading && options.map((person) => (
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
                <label className="block text-[12px] font-medium text-text-muted mb-1">Role/Title</label>
                <input
                  data-testid="person-role-input"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. CEO, Project Manager"
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 max-sm:px-3 py-4 border-t border-border">
          <button
            data-testid="person-cancel-button"
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            data-testid="person-save-button"
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
