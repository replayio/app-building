interface MaterialsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function MaterialsSearchBar({
  value,
  onChange,
}: MaterialsSearchBarProps) {
  return (
    <div
      className="search-input-wrapper materials-search-bar"
      style={{ flex: 1, maxWidth: 300 }}
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
        data-testid="materials-search"
        type="text"
        placeholder="Search materials by name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
