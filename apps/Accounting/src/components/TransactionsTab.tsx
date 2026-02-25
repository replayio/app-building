import React, { useState } from "react";
import { formatCurrency } from "@shared/utils/currency";
import { NewTransactionModal } from "./NewTransactionModal";
import type { Transaction } from "../types";

interface TransactionsTabProps {
  transactions: Transaction[];
  accountId: string;
}

export function TransactionsTab({
  transactions,
  accountId,
}: TransactionsTabProps): React.ReactElement {
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(
    null
  );

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEntryForAccount = (txn: Transaction) => {
    if (!txn.entries) return null;
    return txn.entries.find((e) => e.account_id === accountId) ?? null;
  };

  if (transactions.length === 0) {
    return (
      <div
        className="transactions-empty"
        data-testid="transactions-empty"
      >
        No transactions found
      </div>
    );
  }

  return (
    <>
      <div
        className="transactions-table-wrapper"
        data-testid="transactions-table"
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Direction</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((txn) => {
              const entry = getEntryForAccount(txn);
              const amount = entry ? entry.amount : 0;
              const direction = entry ? entry.entry_type : "debit";

              return (
                <tr
                  key={txn.id}
                  data-testid={`transaction-row-${txn.id}`}
                >
                  <td>{formatDate(txn.date)}</td>
                  <td>{txn.description}</td>
                  <td>{formatCurrency(amount)}</td>
                  <td>
                    <span
                      className={`transaction-direction transaction-direction--${direction}`}
                      data-testid={`transaction-direction-${txn.id}`}
                    >
                      {direction === "debit" ? "Debit" : "Credit"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="transaction-action-link"
                      data-testid={`transaction-view-edit-${txn.id}`}
                      onClick={() => setEditTransaction(txn)}
                    >
                      View/Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editTransaction && (
        <NewTransactionModal
          onClose={() => setEditTransaction(null)}
        />
      )}
    </>
  );
}
