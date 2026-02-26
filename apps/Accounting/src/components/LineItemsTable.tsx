import React, { useMemo } from "react";
import { SearchableSelect } from "@shared/components/SearchableSelect";
import type { Account } from "../types";

export interface LineItem {
  account_id: string;
  entry_type: "debit" | "credit";
  amount: string;
}

interface LineItemsTableProps {
  lineItems: LineItem[];
  accounts: Account[];
  onUpdate: (index: number, field: keyof LineItem, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const TYPE_OPTIONS = [
  { id: "debit", label: "Debit" },
  { id: "credit", label: "Credit" },
];

export function LineItemsTable({
  lineItems,
  accounts,
  onUpdate,
  onAdd,
  onRemove,
}: LineItemsTableProps): React.ReactElement {
  return (
    <div className="form-group" data-testid="line-items-section">
      <label className="form-label line-items-section-heading" data-testid="line-items-heading">
        Transaction Details (Line Items)
      </label>
      <div className="line-items-table">
        <div className="line-items-header" data-testid="line-items-header">
          <span>Account</span>
          <span>Type</span>
          <span>Amount</span>
          <span></span>
        </div>
        {lineItems.map((li, index) => (
          <LineItemRow
            key={index}
            item={li}
            index={index}
            accounts={accounts}
            canRemove={lineItems.length > 2}
            onChange={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </div>
      <button
        className="add-line-item-btn"
        data-testid="add-line-item-btn"
        onClick={onAdd}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1V11M1 6H11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Add Line Item
      </button>
    </div>
  );
}

function LineItemRow({
  item,
  index,
  accounts,
  canRemove,
  onChange,
  onRemove,
}: {
  item: LineItem;
  index: number;
  accounts: Account[];
  canRemove: boolean;
  onChange: (index: number, field: keyof LineItem, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const accountOptions = useMemo(
    () =>
      accounts.map((a) => ({
        id: a.id,
        label: a.code ? `${a.name} (${a.code})` : a.name,
      })),
    [accounts]
  );

  return (
    <div className="line-item-row" data-testid={`line-item-row-${index}`}>
      <SearchableSelect
        options={accountOptions}
        value={item.account_id}
        onChange={(id) => onChange(index, "account_id", id)}
        placeholder="Select Account"
        testId={`line-item-account-${index}`}
      />

      <SearchableSelect
        options={TYPE_OPTIONS}
        value={item.entry_type}
        onChange={(id) => onChange(index, "entry_type", id)}
        placeholder="Select Type"
        testId={`line-item-type-${index}`}
      />

      <input
        type="number"
        className="form-input"
        data-testid={`line-item-amount-${index}`}
        placeholder="0.00"
        value={item.amount}
        onChange={(e) => onChange(index, "amount", e.target.value)}
        step="0.01"
        min="0"
      />

      <button
        className="line-item-delete-btn"
        data-testid={`line-item-delete-${index}`}
        disabled={!canRemove}
        onClick={() => onRemove(index)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 3.5H12M5.5 1.5H8.5M3.5 3.5L4 11.5C4 12.05 4.45 12.5 5 12.5H9C9.55 12.5 10 12.05 10 11.5L10.5 3.5M5.5 5.5V10.5M8.5 5.5V10.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
