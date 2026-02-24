import React, { useState, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../hooks";
import { createTransaction } from "../slices/transactionsSlice";
import { fetchAccounts } from "../slices/accountsSlice";
import { formatCurrency } from "@shared/utils/currency";
import { SearchableSelect } from "@shared/components/SearchableSelect";
import type { Account } from "../types";

interface NewTransactionModalProps {
  onClose: () => void;
}

interface LineItem {
  account_id: string;
  entry_type: "debit" | "credit";
  amount: string;
}

export function NewTransactionModal({ onClose }: NewTransactionModalProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [currency] = useState("USD");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { account_id: "", entry_type: "debit", amount: "" },
    { account_id: "", entry_type: "credit", amount: "" },
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalDebits = lineItems
    .filter((li) => li.entry_type === "debit")
    .reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0);
  const totalCredits = lineItems
    .filter((li) => li.entry_type === "credit")
    .reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.005;

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    setLineItems((prev) => prev.map((li, i) => (i === index ? { ...li, [field]: value } : li)));
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { account_id: "", entry_type: "debit", amount: "" }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 2) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags((prev) => [...prev, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    if (!description.trim() || !isBalanced) return;
    setSubmitting(true);
    try {
      await dispatch(
        createTransaction({
          date,
          description,
          currency,
          entries: lineItems
            .filter((li) => li.account_id && parseFloat(li.amount) > 0)
            .map((li) => ({
              account_id: li.account_id,
              entry_type: li.entry_type,
              amount: parseFloat(li.amount),
            })),
          tags,
        })
      ).unwrap();
      await dispatch(fetchAccounts());
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="new-transaction-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Transaction</h2>
          <button className="modal-close-btn" data-testid="modal-close-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-input"
            data-testid="transaction-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            className="form-input"
            data-testid="transaction-description"
            placeholder="Enter description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Line Items</label>
          <div className="line-items-table">
            <div className="line-items-header">
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
                onChange={updateLineItem}
                onRemove={removeLineItem}
              />
            ))}
          </div>
          <button className="add-line-item-btn" data-testid="add-line-item-btn" onClick={addLineItem}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Line Item
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Tags</label>
          <div className="tags-container">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button className="tag-remove" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                  &times;
                </button>
              </span>
            ))}
            <input
              className="tags-input"
              data-testid="tags-input"
              placeholder="Type and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>
        </div>

        <div className="balance-indicator" data-testid="balance-indicator">
          <div className="balance-totals">
            <div className="balance-total-item">
              <span className="balance-total-label">Total Debits</span>
              <span className="balance-total-value">{formatCurrency(totalDebits)}</span>
            </div>
            <div className="balance-total-item">
              <span className="balance-total-label">Total Credits</span>
              <span className="balance-total-value">{formatCurrency(totalCredits)}</span>
            </div>
          </div>
          <div className={`balance-status ${isBalanced ? "balance-status--balanced" : "balance-status--unbalanced"}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {isBalanced ? (
                <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
            {isBalanced ? "Balanced" : "Unbalanced"}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn--primary"
            data-testid="submit-transaction-btn"
            disabled={!description.trim() || !isBalanced || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </div>
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
    () => accounts.map((a) => ({ id: a.id, label: a.name })),
    [accounts]
  );

  return (
    <div className="line-item-row" data-testid={`line-item-row-${index}`}>
      <SearchableSelect
        options={accountOptions}
        value={item.account_id}
        onChange={(id) => onChange(index, "account_id", id)}
        placeholder="Search account..."
        testId={`line-item-account-${index}`}
      />

      <div className="searchable-select">
        <button
          className="searchable-select-input"
          data-testid={`line-item-type-${index}`}
          style={{ textAlign: "left", cursor: "pointer" }}
          onClick={() => {
            onChange(index, "entry_type", item.entry_type === "debit" ? "credit" : "debit");
          }}
        >
          {item.entry_type === "debit" ? "Debit" : "Credit"}
        </button>
      </div>

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
          <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
