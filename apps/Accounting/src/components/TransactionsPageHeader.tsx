import React, { useState, useRef, useEffect } from "react";
import type { Account } from "../types";

interface FilterDropdownProps {
  value: string;
  options: Array<{ id: string; label: string; group?: string }>;
  testId: string;
  onChange: (value: string) => void;
}

function FilterDropdown({
  value,
  options,
  testId,
  onChange,
}: FilterDropdownProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.id === value)?.label ?? value;

  // Group options
  let lastGroup: string | undefined;

  return (
    <div className="filter-dropdown" ref={ref} data-testid={testId}>
      <button
        className="filter-dropdown-trigger"
        data-testid={`${testId}-trigger`}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span>{selectedLabel}</span>
        <svg
          className="filter-dropdown-chevron"
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
        <div className="filter-dropdown-menu" data-testid={`${testId}-menu`}>
          {options.map((option) => {
            const showGroup = option.group && option.group !== lastGroup;
            if (option.group) lastGroup = option.group;
            return (
              <React.Fragment key={option.id}>
                {showGroup && (
                  <div className="filter-dropdown-group-label">{option.group}</div>
                )}
                <button
                  className={`filter-dropdown-option${option.id === value ? " filter-dropdown-option--active" : ""}`}
                  data-testid={`${testId}-option-${option.id}`}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface TransactionsPageHeaderProps {
  accounts: Account[];
  allTags: string[];
  startDate: string;
  endDate: string;
  accountFilter: string;
  materialFilter: string;
  typeFilter: string;
  searchQuery: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onAccountFilterChange: (value: string) => void;
  onMaterialFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
  onNewTransaction: () => void;
}

const CATEGORY_ORDER = ["assets", "liabilities", "equity", "revenue", "expenses"];
const CATEGORY_LABELS: Record<string, string> = {
  assets: "Assets",
  liabilities: "Liabilities",
  equity: "Equity",
  revenue: "Revenue",
  expenses: "Expenses",
};

export function TransactionsPageHeader({
  accounts,
  allTags,
  startDate,
  endDate,
  accountFilter,
  materialFilter,
  typeFilter,
  searchQuery,
  onStartDateChange,
  onEndDateChange,
  onAccountFilterChange,
  onMaterialFilterChange,
  onTypeFilterChange,
  onSearchQueryChange,
  onNewTransaction,
}: TransactionsPageHeaderProps): React.ReactElement {
  const accountOptions = React.useMemo(() => {
    const opts: Array<{ id: string; label: string; group?: string }> = [
      { id: "", label: "All Accounts" },
    ];
    for (const cat of CATEGORY_ORDER) {
      const catAccounts = accounts.filter((a) => a.category === cat);
      for (const acct of catAccounts) {
        const label = acct.institution
          ? `${acct.name} (${acct.institution})`
          : acct.name;
        opts.push({
          id: acct.id,
          label,
          group: CATEGORY_LABELS[cat],
        });
      }
    }
    return opts;
  }, [accounts]);

  const materialOptions = React.useMemo(() => {
    const opts: Array<{ id: string; label: string }> = [
      { id: "", label: "All Materials" },
    ];
    const sorted = [...allTags].sort((a, b) => a.localeCompare(b));
    for (const tag of sorted) {
      opts.push({ id: tag, label: tag });
    }
    return opts;
  }, [allTags]);

  const typeOptions = [
    { id: "", label: "All Types" },
    { id: "debit", label: "Debit" },
    { id: "credit", label: "Credit" },
  ];

  return (
    <div data-testid="transactions-page-header">
      <div className="transactions-page-header">
        <h1
          className="transactions-page-title"
          data-testid="transactions-page-title"
        >
          Transactions
        </h1>
        <button
          className="navbar-btn-new-transaction"
          data-testid="new-transaction-btn"
          onClick={onNewTransaction}
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1V13M1 7H13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="max-sm:hidden">New Transaction</span>
        </button>
      </div>

      <div
        className="transactions-page-filter-bar"
        data-testid="transactions-filter-bar"
      >
        {/* DateRangeFilter */}
        <div className="date-range-field" data-testid="date-range-filter">
          <svg
            className="date-range-icon"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <rect
              x="1"
              y="2"
              width="12"
              height="11"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path d="M1 5.5H13" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            className="form-input"
            type="date"
            data-testid="date-range-start"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            placeholder="Start Date"
          />
        </div>
        <div className="date-range-field" data-testid="date-range-filter-end">
          <svg
            className="date-range-icon"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <rect
              x="1"
              y="2"
              width="12"
              height="11"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path d="M1 5.5H13" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            className="form-input"
            type="date"
            data-testid="date-range-end"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            placeholder="End Date"
          />
        </div>

        {/* AccountFilter */}
        <FilterDropdown
          value={accountFilter}
          options={accountOptions}
          testId="account-filter"
          onChange={onAccountFilterChange}
        />

        {/* MaterialFilter */}
        <FilterDropdown
          value={materialFilter}
          options={materialOptions}
          testId="material-filter"
          onChange={onMaterialFilterChange}
        />

        {/* TransactionTypeFilter */}
        <FilterDropdown
          value={typeFilter}
          options={typeOptions}
          testId="transaction-type-filter"
          onChange={onTypeFilterChange}
        />

        {/* SearchBar */}
        <div className="transactions-search-bar" data-testid="search-bar">
          <svg
            className="transactions-search-icon"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <circle
              cx="6"
              cy="6"
              r="4.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M9.5 9.5L13 13"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="transactions-search-input"
            type="text"
            data-testid="search-bar-input"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
