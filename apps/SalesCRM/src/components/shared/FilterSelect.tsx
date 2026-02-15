import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

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
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  testId,
  placeholder,
  className,
}: FilterSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)
  const displayText = label && selectedOption
    ? `${label}: ${selectedOption.label}`
    : selectedOption?.label ?? placeholder ?? label ?? ''

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

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
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-testid={testId ? `${testId}-option-${opt.value || 'all'}` : undefined}
              data-option-value={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
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
        </div>
      )}
    </div>
  )
}
