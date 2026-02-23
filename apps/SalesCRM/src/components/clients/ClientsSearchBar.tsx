import { Search, X } from 'lucide-react'

interface ClientsSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function ClientsSearchBar({ value, onChange }: ClientsSearchBarProps) {
  return (
    <div data-testid="clients-search-bar" className="relative flex-1 max-w-[400px] max-sm:max-w-none">
      <Search
        size={14}
        strokeWidth={1.75}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled"
      />
      <input
        data-testid="clients-search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search clients by name, tag, or contact..."
        className="w-full h-[34px] pl-8 pr-8 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent transition-colors duration-100"
      />
      {value && (
        <button
          data-testid="clients-search-clear"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-muted"
        >
          <X size={14} strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
}
