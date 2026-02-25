import { useState, useRef, useEffect, useCallback } from "react";
import "./FilterSelect.css";

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  options: FilterSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  testId?: string;
}

export function FilterSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchable = false,
  testId,
}: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = searchable && search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
      setSearch("");
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, handleClickOutside]);

  useEffect(() => {
    if (open && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open, searchable]);

  return (
    <div className="filter-select" ref={containerRef} data-testid={testId}>
      <button
        className="filter-select-trigger"
        data-testid={testId ? `${testId}-trigger` : undefined}
        onClick={() => {
          setOpen(!open);
          if (open) setSearch("");
        }}
        type="button"
      >
        <span className={selectedOption ? "filter-select-value" : "filter-select-placeholder"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`filter-select-chevron ${open ? "filter-select-chevron--open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="filter-select-dropdown"
          data-testid={testId ? `${testId}-dropdown` : undefined}
        >
          {searchable && (
            <div className="filter-select-search">
              <input
                ref={searchInputRef}
                className="filter-select-search-input"
                data-testid={testId ? `${testId}-search` : undefined}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          <div className="filter-select-options">
            {filtered.length === 0 ? (
              <div className="filter-select-empty">No matches</div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  className={`filter-select-option ${option.value === value ? "filter-select-option--selected" : ""}`}
                  data-testid={testId ? `${testId}-option-${option.value}` : undefined}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
