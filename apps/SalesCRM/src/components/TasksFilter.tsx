import { useState, useRef, useEffect, useCallback } from "react";

interface TasksFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (value: string) => void;
  clientFilter: string;
  onClientFilterChange: (value: string) => void;
  assigneeOptions: { value: string; label: string }[];
  clientOptions: { value: string; label: string }[];
}

type FilterCategory = "Priority" | "Status" | "Assignee" | "Client";

const PRIORITY_OPTIONS = [
  { value: "", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
];

export function TasksFilter({
  search,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  statusFilter,
  onStatusFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  clientFilter,
  onClientFilterChange,
  assigneeOptions,
  clientOptions,
}: TasksFilterProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [category, setCategory] = useState<FilterCategory | null>(null);
  const [optionSearch, setOptionSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setDropdownOpen(false);
      setCategory(null);
      setOptionSearch("");
    }
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen, handleClickOutside]);

  useEffect(() => {
    if (category && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [category]);

  const categories: FilterCategory[] = ["Priority", "Status", "Assignee", "Client"];

  function getOptionsForCategory(cat: FilterCategory) {
    switch (cat) {
      case "Priority":
        return PRIORITY_OPTIONS;
      case "Status":
        return STATUS_OPTIONS;
      case "Assignee":
        return [{ value: "", label: "All" }, ...assigneeOptions];
      case "Client":
        return [{ value: "", label: "All" }, ...clientOptions];
    }
  }

  function getActiveValue(cat: FilterCategory) {
    switch (cat) {
      case "Priority": return priorityFilter;
      case "Status": return statusFilter;
      case "Assignee": return assigneeFilter;
      case "Client": return clientFilter;
    }
  }

  function handleOptionSelect(cat: FilterCategory, value: string) {
    switch (cat) {
      case "Priority": onPriorityFilterChange(value); break;
      case "Status": onStatusFilterChange(value); break;
      case "Assignee": onAssigneeFilterChange(value); break;
      case "Client": onClientFilterChange(value); break;
    }
    setDropdownOpen(false);
    setCategory(null);
    setOptionSearch("");
  }

  const currentOptions = category ? getOptionsForCategory(category) : [];
  const filteredOptions = optionSearch
    ? currentOptions.filter((o) => o.label.toLowerCase().includes(optionSearch.toLowerCase()))
    : currentOptions;

  const hasActiveFilters = priorityFilter || statusFilter || assigneeFilter || clientFilter;

  return (
    <div className="tasks-filter" data-testid="tasks-filter" ref={containerRef}>
      <div className="tasks-filter-control">
        <svg className="tasks-filter-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1.5 3h11M3.5 7h7M5.5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>

        <button
          className="tasks-filter-chevron-btn"
          data-testid="tasks-filter-dropdown-btn"
          onClick={() => {
            if (dropdownOpen) {
              setDropdownOpen(false);
              setCategory(null);
              setOptionSearch("");
            } else {
              setDropdownOpen(true);
              setCategory(null);
            }
          }}
          type="button"
        >
          <svg
            className={`tasks-filter-chevron ${dropdownOpen ? "tasks-filter-chevron--open" : ""}`}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <input
          className="tasks-filter-search"
          data-testid="tasks-filter-search"
          type="text"
          placeholder="Filter..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        {hasActiveFilters && (
          <button
            className="tasks-filter-clear"
            data-testid="tasks-filter-clear"
            onClick={() => {
              onPriorityFilterChange("");
              onStatusFilterChange("");
              onAssigneeFilterChange("");
              onClientFilterChange("");
            }}
            type="button"
            title="Clear all filters"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {dropdownOpen && (
        <div className="tasks-filter-dropdown" data-testid="tasks-filter-dropdown">
          {!category ? (
            <div className="tasks-filter-categories">
              {categories.map((cat) => {
                const activeVal = getActiveValue(cat);
                const activeLabel = activeVal
                  ? getOptionsForCategory(cat).find((o) => o.value === activeVal)?.label
                  : null;
                return (
                  <button
                    key={cat}
                    className="tasks-filter-category"
                    data-testid={`tasks-filter-category-${cat.toLowerCase()}`}
                    onClick={() => setCategory(cat)}
                    type="button"
                  >
                    <span>{cat}</span>
                    {activeLabel && <span className="tasks-filter-category-active">{activeLabel}</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="tasks-filter-options">
              <div className="tasks-filter-options-header">
                <button
                  className="tasks-filter-back"
                  onClick={() => { setCategory(null); setOptionSearch(""); }}
                  type="button"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="tasks-filter-options-title">{category}</span>
              </div>
              <div className="tasks-filter-option-search">
                <input
                  ref={searchInputRef}
                  className="tasks-filter-option-search-input"
                  data-testid="tasks-filter-option-search"
                  type="text"
                  placeholder="Search..."
                  value={optionSearch}
                  onChange={(e) => setOptionSearch(e.target.value)}
                />
              </div>
              <div className="tasks-filter-option-list">
                {filteredOptions.length === 0 ? (
                  <div className="tasks-filter-no-matches">No matches</div>
                ) : (
                  filteredOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className={`tasks-filter-option ${opt.value === getActiveValue(category) ? "tasks-filter-option--selected" : ""}`}
                      data-testid={`tasks-filter-option-${opt.label.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={() => handleOptionSelect(category, opt.value)}
                      type="button"
                    >
                      {opt.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
