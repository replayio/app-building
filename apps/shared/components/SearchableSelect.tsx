import { useState } from "react";

export interface SearchableSelectOption {
  id: string;
  label: string;
}

export interface SearchableSelectProps {
  /** Available options to search and select from. */
  options: SearchableSelectOption[];
  /** Currently selected option ID, or empty string if none selected. */
  value: string;
  /** Called when an option is selected. */
  onChange: (id: string) => void;
  /** Placeholder text shown when no option is selected. */
  placeholder?: string;
  /** data-testid attribute for the input element. */
  testId?: string;
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * A searchable dropdown select component.
 * Used by Accounting (account selection in transactions) and InventoryTracker
 * (account/material/batch selection in transactions).
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  testId,
}: SearchableSelectProps) {
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedOption = options.find((o) => o.id === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="searchable-select">
      <input
        className="searchable-select-input"
        data-testid={testId}
        placeholder={placeholder}
        value={showDropdown ? searchText : (selectedOption?.label ?? "")}
        onChange={(e) => {
          setSearchText(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => {
          setSearchText("");
          setShowDropdown(true);
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />
      <span
        className="searchable-select-chevron"
        data-testid={testId ? `${testId}-chevron` : undefined}
      >
        <ChevronDownIcon />
      </span>
      {showDropdown && filtered.length > 0 && (
        <div className="searchable-select-dropdown">
          {filtered.map((o) => (
            <button
              key={o.id}
              className="searchable-select-option"
              onMouseDown={() => {
                onChange(o.id);
                setShowDropdown(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
