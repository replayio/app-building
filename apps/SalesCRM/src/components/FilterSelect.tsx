import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'

interface FilterSelectOption {
  value: string
  label: string
}

interface FilterSelectProps {
  value: string
  onChange: (value: string) => void
  options: FilterSelectOption[]
  placeholder?: string
  searchable?: boolean
  className?: string
  'data-testid'?: string
}

export default function FilterSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  searchable = false,
  className = '',
  'data-testid': testId,
}: FilterSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [open, searchable])

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder
  const filteredOptions = searchable && searchQuery
    ? options.filter((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options

  return (
    <div ref={containerRef} className={`relative ${className}`} data-testid={testId}>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearchQuery('') }}
        className="flex items-center gap-1 h-7 px-2 rounded text-[13px] text-[var(--color-text-secondary)] bg-transparent border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] transition-colors duration-100 cursor-pointer"
      >
        <span className={value ? '' : 'text-[var(--color-text-disabled)]'}>{selectedLabel}</span>
        <ChevronDown size={14} className="text-[var(--color-text-muted)]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-[var(--color-bg-base)] border border-[var(--color-bg-border)] rounded-lg shadow-[var(--shadow-elevation-2)] z-50 py-1">
          {searchable && (
            <div className="px-2 pb-1 pt-1">
              <div className="flex items-center gap-1.5 h-7 px-2 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)]">
                <Search size={13} className="text-[var(--color-text-disabled)] shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent border-none outline-none text-[12px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)]"
                />
              </div>
            </div>
          )}
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-[12px] text-[var(--color-text-muted)]">No matches</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                    setSearchQuery('')
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[13px] cursor-pointer hover:bg-[var(--color-hover)] transition-colors duration-100 ${
                    option.value === value
                      ? 'text-[var(--color-accent)] font-medium'
                      : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
