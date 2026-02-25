import { useState, useEffect, useCallback } from "react";
import { FilterSelect } from "@shared/components/FilterSelect";

const STAGE_OPTIONS = [
  { value: "", label: "All Stages" },
  { value: "Discovery", label: "Discovery" },
  { value: "Qualification", label: "Qualification" },
  { value: "Proposal Sent", label: "Proposal Sent" },
  { value: "Negotiation", label: "Negotiation" },
  { value: "Closed Won", label: "Closed Won" },
  { value: "Closed Lost", label: "Closed Lost" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "On Track", label: "On Track" },
  { value: "Needs Attention", label: "Needs Attention" },
  { value: "At Risk", label: "At Risk" },
  { value: "Won", label: "Won" },
  { value: "Lost", label: "Lost" },
];

const SORT_OPTIONS = [
  { value: "close_desc", label: "Close Date (Newest)" },
  { value: "close_asc", label: "Close Date (Oldest)" },
  { value: "value_desc", label: "Value (High to Low)" },
  { value: "value_asc", label: "Value (Low to High)" },
  { value: "name_asc", label: "Deal Name (A-Z)" },
];

interface DealsFiltersProps {
  stage: string;
  onStageChange: (value: string) => void;
  client: string;
  onClientChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  dateStart: string;
  onDateStartChange: (value: string) => void;
  dateEnd: string;
  onDateEndChange: (value: string) => void;
  clientOptions: { value: string; label: string }[];
}

export function DealsFilters({
  stage,
  onStageChange,
  client,
  onClientChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  search,
  onSearchChange,
  dateStart,
  onDateStartChange,
  dateEnd,
  onDateEndChange,
  clientOptions,
}: DealsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const debouncedSearch = useCallback(
    (value: string) => {
      onSearchChange(value);
    },
    [onSearchChange]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, debouncedSearch]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="deals-filters" data-testid="deals-filters">
      <div className="deals-filters-row">
        <FilterSelect
          options={STAGE_OPTIONS}
          value={stage}
          onChange={onStageChange}
          placeholder="All Stages"
          searchable
          testId="stage-filter"
        />
        <FilterSelect
          options={clientOptions}
          value={client}
          onChange={onClientChange}
          placeholder="All Clients"
          searchable
          testId="client-filter"
        />
        <FilterSelect
          options={STATUS_OPTIONS}
          value={status}
          onChange={onStatusChange}
          placeholder="Active"
          testId="status-filter"
        />
        <div className="deals-date-range" data-testid="date-range-filter">
          <svg className="deals-date-range-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1.5 5.5h11M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            className="deals-date-input"
            data-testid="date-start"
            type="date"
            value={dateStart}
            onChange={(e) => onDateStartChange(e.target.value)}
            placeholder="Start"
          />
          <span className="deals-date-separator">-</span>
          <input
            className="deals-date-input"
            data-testid="date-end"
            type="date"
            value={dateEnd}
            onChange={(e) => onDateEndChange(e.target.value)}
            placeholder="End"
          />
          {(dateStart || dateEnd) && (
            <button
              className="deals-date-clear"
              data-testid="date-clear"
              onClick={() => {
                onDateStartChange("");
                onDateEndChange("");
              }}
              type="button"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="deals-filters-row">
        <div className="deals-sort-group">
          <span className="deals-sort-label">Sort by:</span>
          <FilterSelect
            options={SORT_OPTIONS}
            value={sort}
            onChange={onSortChange}
            placeholder="Close Date (Newest)"
            testId="sort-filter"
          />
        </div>
        <div className="deals-search-wrapper">
          <svg className="deals-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            className="deals-search-input"
            data-testid="deals-search"
            type="text"
            placeholder="Search deals..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
