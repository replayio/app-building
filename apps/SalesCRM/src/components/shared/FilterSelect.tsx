import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'

interface FilterSelectOption {
  value: string
  label: string
}

interface FilterSelectProps {
  label?: string
  value: string
  options: FilterSelectOption[]
  onChange: (value: string) => void
  testId?: string
  placeholder?: string
  className?: string
  searchable?: boolean
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  testId,
  placeholder,
  className,
  searchable,
}: FilterSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((o) => o.value === value)
  const displayText = label && selectedOption
    ? `${label}: ${selectedOption.label}`
    : selectedOption?.label ?? placeholder ?? label ?? ''

  const filteredOptions = searchable && search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  useEffect(() => {
    if (open && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [open, searchable])

  return (
    <div className={`relative ${className ?? ''}`} ref={ref} data-testid={testId} data-value={value}>
      <button
        type="button"
        data-testid={testId ? `${testId}-trigger` : undefined}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 w-full h-[34px] pl-3 pr-7 text-[13px] text-text-secondary bg-surface border border-border rounded-[5px] cursor-pointer hover:bg-hover focus:outline-none focus:border-accent transition-colors duration-100 whitespace-nowrap text-left"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown
          size={12}
          strokeWidth={2}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled"
        />
      </button>
      {open && (
        <div
          data-testid={testId ? `${testId}-menu` : undefined}
          className="absolute top-full left-0 mt-1 min-w-full w-max max-h-[240px] overflow-y-auto bg-surface border border-border rounded-[6px] shadow-lg z-50"
        >
          {searchable && (
            <div className="sticky top-0 bg-surface p-1.5 border-b border-border">
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-disabled" />
                <input
                  ref={searchInputRef}
                  type="text"
                  data-testid={testId ? `${testId}-search` : undefined}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-6 pr-2 py-1 text-[13px] text-text-primary bg-background border border-border rounded focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}
          {filteredOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-testid={testId ? `${testId}-option-${opt.value || 'all'}` : undefined}
              data-option-value={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
                setSearch('')
              }}
              className={`flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-left hover:bg-hover transition-colors duration-100 ${
                opt.value === value ? 'text-accent font-medium' : 'text-text-secondary'
              }`}
            >
              <span className="w-3.5 flex-shrink-0">
                {opt.value === value && <Check size={12} strokeWidth={2.5} />}
              </span>
              {opt.label}
            </button>
          ))}
          {searchable && filteredOptions.length === 0 && (
            <div className="px-3 py-2 text-[13px] text-text-disabled">No matches</div>
          )}
        </div>
      )}
    </div>
  )
}
