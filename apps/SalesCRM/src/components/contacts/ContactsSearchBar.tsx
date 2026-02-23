import { Search, X } from 'lucide-react'

interface ContactsSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function ContactsSearchBar({ value, onChange }: ContactsSearchBarProps) {
  return (
    <div data-testid="contacts-search-bar" className="relative flex-1 max-w-[400px]">
      <Search
        size={14}
        strokeWidth={1.75}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled"
      />
      <input
        data-testid="contacts-search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search contacts by name, email, title, or location..."
        className="w-full h-[34px] pl-8 pr-8 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent transition-colors duration-100"
      />
      {value && (
        <button
          data-testid="contacts-search-clear"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-muted"
        >
          <X size={14} strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
}
