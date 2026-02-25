import React, { useState } from "react";
import type { AccountCategory } from "../types";
import { CATEGORY_TREE, type CategoryNode } from "./categoryTree";

interface AccountCategoryFilterProps {
  subCategoryState: Record<string, boolean>;
  onSubCategoryChange: (newState: Record<string, boolean>) => void;
  includeZeroBalance: boolean;
  onIncludeZeroBalanceChange: (value: boolean) => void;
}

function ChevronIcon(): React.ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 2.5L7.5 6L4.5 9.5" />
    </svg>
  );
}

function CheckIcon(): React.ReactElement {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5L4 7L8 3" />
    </svg>
  );
}

function DashIcon(): React.ReactElement {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2.5 5H7.5" />
    </svg>
  );
}

type CheckState = "checked" | "unchecked" | "indeterminate";

function getParentCheckState(node: CategoryNode, subState: Record<string, boolean>): CheckState {
  const total = node.subCategories.length;
  const checkedCount = node.subCategories.filter((s) => subState[s.id]).length;
  if (checkedCount === 0) return "unchecked";
  if (checkedCount === total) return "checked";
  return "indeterminate";
}

export function AccountCategoryFilter({
  subCategoryState,
  onSubCategoryChange,
  includeZeroBalance,
  onIncludeZeroBalanceChange,
}: AccountCategoryFilterProps): React.ReactElement {
  const [expandedCategories, setExpandedCategories] = useState<Set<AccountCategory>>(new Set());

  const toggleExpand = (cat: AccountCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const handleParentToggle = (node: CategoryNode) => {
    const currentState = getParentCheckState(node, subCategoryState);
    const newChecked = currentState !== "checked";
    const newState = { ...subCategoryState };
    for (const sub of node.subCategories) {
      newState[sub.id] = newChecked;
    }
    onSubCategoryChange(newState);
  };

  const handleSubToggle = (subId: string) => {
    const newState = { ...subCategoryState };
    newState[subId] = !newState[subId];
    onSubCategoryChange(newState);
  };

  return (
    <div data-testid="account-category-filter">
      <div className="form-label" style={{ marginBottom: "8px" }}>Filter Accounts &amp; Categories</div>
      <div className="category-filter-tree">
        {CATEGORY_TREE.map((node) => {
          const isExpanded = expandedCategories.has(node.category);
          const parentState = getParentCheckState(node, subCategoryState);

          return (
            <div key={node.category}>
              <div className="category-filter-item">
                <button
                  type="button"
                  className={`category-filter-expand${isExpanded ? " category-filter-expand--expanded" : ""}`}
                  data-testid={`category-expand-${node.category}`}
                  onClick={() => toggleExpand(node.category)}
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.label}`}
                >
                  <ChevronIcon />
                </button>
                <button
                  type="button"
                  className={`category-filter-checkbox${
                    parentState === "checked" ? " category-filter-checkbox--checked" :
                    parentState === "indeterminate" ? " category-filter-checkbox--indeterminate" : ""
                  }`}
                  data-testid={`category-checkbox-${node.category}`}
                  onClick={() => handleParentToggle(node)}
                  aria-label={`${node.label} (All)`}
                >
                  {parentState === "checked" && <CheckIcon />}
                  {parentState === "indeterminate" && <DashIcon />}
                </button>
                <span
                  className="category-filter-label"
                  onClick={() => handleParentToggle(node)}
                >
                  {node.label} (All)
                </span>
              </div>

              {isExpanded && (
                <div className="category-filter-children">
                  {node.subCategories.map((sub) => (
                    <div key={sub.id} className="category-filter-item">
                      <button
                        type="button"
                        className="category-filter-expand category-filter-expand--hidden"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        <ChevronIcon />
                      </button>
                      <button
                        type="button"
                        className={`category-filter-checkbox${subCategoryState[sub.id] ? " category-filter-checkbox--checked" : ""}`}
                        data-testid={`subcategory-checkbox-${sub.id}`}
                        onClick={() => handleSubToggle(sub.id)}
                        aria-label={sub.label}
                      >
                        {subCategoryState[sub.id] && <CheckIcon />}
                      </button>
                      <span
                        className="category-filter-sublabel"
                        onClick={() => handleSubToggle(sub.id)}
                      >
                        {sub.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="zero-balance-toggle" data-testid="zero-balance-toggle">
        <label className="toggle-switch">
          <input
            type="checkbox"
            className="toggle-switch-input"
            data-testid="report-include-zero"
            checked={includeZeroBalance}
            onChange={(e) => onIncludeZeroBalanceChange(e.target.checked)}
          />
          <span className="toggle-switch-slider" />
        </label>
        <span
          className="zero-balance-toggle-label"
          onClick={() => onIncludeZeroBalanceChange(!includeZeroBalance)}
        >
          Include Zero Balance Accounts
        </span>
      </div>
    </div>
  );
}
