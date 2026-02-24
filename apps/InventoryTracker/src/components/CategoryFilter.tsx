import { useState, useRef, useEffect } from "react";
import type { MaterialCategory } from "../types";

interface CategoryFilterProps {
  categories: MaterialCategory[];
  selectedCategoryId: string;
  onChange: (categoryId: string) => void;
}

export function CategoryFilter({ categories, selectedCategoryId, onChange }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const selectedName = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)?.name ?? "All Categories"
    : "All Categories";

  return (
    <div data-testid="category-filter" className="filter-bar" style={{ position: "relative" }}>
      <span data-testid="category-filter-label" className="filter-label">Category Filter:</span>
      <div
        ref={dropdownRef}
        className={`custom-dropdown${isOpen ? " custom-dropdown--open" : ""}`}
      >
        <button
          data-testid="category-filter-trigger"
          className="custom-dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span data-testid="category-filter-value">{selectedName}</span>
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
        {isOpen && (
          <div data-testid="category-filter-menu" className="custom-dropdown-menu">
            <button
              data-testid="category-filter-option-all"
              className={`custom-dropdown-item${!selectedCategoryId ? " custom-dropdown-item--selected" : ""}`}
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              type="button"
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                data-testid={`category-filter-option-${cat.id}`}
                className={`custom-dropdown-item${selectedCategoryId === cat.id ? " custom-dropdown-item--selected" : ""}`}
                onClick={() => {
                  onChange(cat.id);
                  setIsOpen(false);
                }}
                type="button"
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
