import { useState, useRef, useEffect } from "react";
import type { Account } from "../types";

interface AccountFilterProps {
  accounts: Account[];
  selectedAccountIds: string[];
  onChange: (accountIds: string[]) => void;
}

export function AccountFilter({ accounts, selectedAccountIds, onChange }: AccountFilterProps) {
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

  const toggleAccount = (accountId: string) => {
    if (selectedAccountIds.includes(accountId)) {
      onChange(selectedAccountIds.filter((id) => id !== accountId));
    } else {
      onChange([...selectedAccountIds, accountId]);
    }
  };

  const getDisplayText = () => {
    if (selectedAccountIds.length === 0) return "All Accounts";
    const selectedNames = accounts
      .filter((a) => selectedAccountIds.includes(a.id))
      .map((a) => a.name);
    if (selectedNames.length === 1) return selectedNames[0];
    return `${selectedNames.join(", ")} (${selectedAccountIds.length} selected)`;
  };

  return (
    <div data-testid="account-filter" ref={containerRef} style={{ position: "relative" }}>
      <span className="filter-label">Involved Account(s)</span>
      <button
        data-testid="account-filter-trigger"
        className="custom-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        style={{ width: "100%" }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>
          {getDisplayText()}
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
          data-testid="account-filter-dropdown"
          className="custom-dropdown-menu"
          style={{ minWidth: 260, maxHeight: 300, overflowY: "auto" }}
        >
          {accounts.map((account) => {
            const isSelected = selectedAccountIds.includes(account.id);
            return (
              <button
                key={account.id}
                data-testid={`account-filter-option-${account.id}`}
                className={`custom-dropdown-item${isSelected ? " custom-dropdown-item--selected" : ""}`}
                onClick={() => toggleAccount(account.id)}
                type="button"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 14, height: 14, marginRight: 8, flexShrink: 0, opacity: isSelected ? 1 : 0 }}
                >
                  <polyline points="2 8 6 12 14 4" />
                </svg>
                <span>{account.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
