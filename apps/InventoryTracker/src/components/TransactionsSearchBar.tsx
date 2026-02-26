interface TransactionsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function TransactionsSearchBar({ value, onChange }: TransactionsSearchBarProps) {
  return (
    <div
      data-testid="transactions-search-bar"
      className="search-input-wrapper"
      style={{ flex: 1 }}
    >
      <svg
        className="search-input-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        className="search-input"
        data-testid="transactions-search-input"
        type="text"
        placeholder="Search by ID or description..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
