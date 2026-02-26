import { useState, useRef, useEffect } from "react";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "stock-asc"
  | "stock-desc"
  | "category-asc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "stock-asc", label: "Stock (Low to High)" },
  { value: "stock-desc", label: "Stock (High to Low)" },
  { value: "category-asc", label: "Category (A-Z)" },
];

interface MaterialsSortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export type { SortOption };
export { SORT_OPTIONS };

export function MaterialsSortDropdown({
  value,
  onChange,
}: MaterialsSortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === value)?.label || "";

  return (
    <div
      ref={ref}
      data-testid="sort-dropdown"
      className={`custom-dropdown ${open ? "custom-dropdown--open" : ""}`}
    >
      <button
        className="custom-dropdown-trigger"
        data-testid="sort-dropdown-trigger"
        type="button"
        onClick={() => setOpen(!open)}
      >
        Sort by: {sortLabel}
        <svg
          className="custom-dropdown-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          className="custom-dropdown-menu"
          data-testid="sort-dropdown-menu"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`custom-dropdown-item ${opt.value === value ? "custom-dropdown-item--selected" : ""}`}
              data-testid={`sort-option-${opt.value}`}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
