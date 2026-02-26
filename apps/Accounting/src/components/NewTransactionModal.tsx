import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks";
import { createTransaction, updateTransaction } from "../slices/transactionsSlice";
import { fetchAccounts } from "../slices/accountsSlice";
import { TransactionHeaderFields } from "./TransactionHeaderFields";
import { LineItemsTable } from "./LineItemsTable";
import { BalanceIndicator } from "./BalanceIndicator";
import { TagsInput } from "./TagsInput";
import type { Transaction } from "../types";
import type { LineItem } from "./LineItemsTable";

interface NewTransactionModalProps {
  onClose: () => void;
  editTransaction?: Transaction;
}

export function NewTransactionModal({
  onClose,
  editTransaction,
}: NewTransactionModalProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);

  const [date, setDate] = useState(
    editTransaction ? editTransaction.date : new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState(editTransaction?.description ?? "");
  const [currency, setCurrency] = useState(editTransaction?.currency ?? "USD");
  const [lineItems, setLineItems] = useState<LineItem[]>(() => {
    if (editTransaction?.entries && editTransaction.entries.length > 0) {
      return editTransaction.entries.map((e) => ({
        account_id: e.account_id,
        entry_type: e.entry_type,
        amount: String(e.amount),
      }));
    }
    return [
      { account_id: "", entry_type: "debit", amount: "" },
      { account_id: "", entry_type: "credit", amount: "" },
    ];
  });
  const [tags, setTags] = useState<string[]>(
    editTransaction?.tags?.map((t) => t.name) ?? []
  );
  const [submitting, setSubmitting] = useState(false);

  const totalDebits = lineItems
    .filter((li) => li.entry_type === "debit")
    .reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0);
  const totalCredits = lineItems
    .filter((li) => li.entry_type === "credit")
    .reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.005;

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((li, i) => (i === index ? { ...li, [field]: value } : li))
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { account_id: "", entry_type: "debit", amount: "" },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 2) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim() || !isBalanced) return;
    setSubmitting(true);
    try {
      const transactionData = {
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
      };

      if (editTransaction) {
        await dispatch(
          updateTransaction({ id: editTransaction.id, ...transactionData })
        ).unwrap();
      } else {
        await dispatch(createTransaction(transactionData)).unwrap();
      }
      await dispatch(fetchAccounts());
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      data-testid="new-transaction-modal"
      onClick={onClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Transaction</h2>
          <button
            className="modal-close-btn"
            data-testid="modal-close-btn"
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <TransactionHeaderFields
          date={date}
          description={description}
          currency={currency}
          onDateChange={setDate}
          onDescriptionChange={setDescription}
          onCurrencyChange={setCurrency}
        />

        <LineItemsTable
          lineItems={lineItems}
          accounts={accounts}
          onUpdate={updateLineItem}
          onAdd={addLineItem}
          onRemove={removeLineItem}
        />

        <BalanceIndicator
          totalDebits={totalDebits}
          totalCredits={totalCredits}
          isBalanced={isBalanced}
        />

        <TagsInput
          tags={tags}
          onAddTag={(tag) => setTags((prev) => [...prev, tag])}
          onRemoveTag={(tag) => setTags((prev) => prev.filter((t) => t !== tag))}
        />

        <div className="modal-footer" data-testid="modal-footer">
          <button
            className="btn btn--secondary"
            data-testid="cancel-transaction-btn"
            onClick={onClose}
          >
            Cancel
          </button>
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
