import { useState, useRef, useEffect } from "react";

const TRANSACTION_TYPES = [
  { value: "", label: "All Types (Purchase, Consumption, Transfer...)" },
  { value: "purchase", label: "Purchase" },
  { value: "consumption", label: "Consumption" },
  { value: "transfer", label: "Transfer" },
  { value: "production", label: "Production" },
  { value: "adjustment", label: "Adjustment" },
];

interface TransactionTypeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function TransactionTypeFilter({ value, onChange }: TransactionTypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = TRANSACTION_TYPES.find((t) => t.value === value) || TRANSACTION_TYPES[0];

  return (
    <div data-testid="transaction-type-filter" ref={containerRef} style={{ position: "relative" }}>
      <span className="filter-label">Transaction Type</span>
      <button
        data-testid="transaction-type-filter-trigger"
        className="custom-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        style={{ width: "100%" }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>
          {selectedOption.label}
        </span>
        <svg
          className={`custom-dropdown-chevron${isOpen ? " custom-dropdown-chevron--open" : ""}`}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div
          data-testid="transaction-type-filter-dropdown"
          className="custom-dropdown-menu"
          style={{ minWidth: 220 }}
        >
          {TRANSACTION_TYPES.map((type) => (
            <button
              key={type.value}
              data-testid={`transaction-type-option-${type.value || "all"}`}
              className={`custom-dropdown-item${type.value === value ? " custom-dropdown-item--selected" : ""}`}
              onClick={() => {
                onChange(type.value);
                setIsOpen(false);
              }}
              type="button"
            >
              {type.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
