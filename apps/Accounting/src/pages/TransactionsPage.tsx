import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchTransactions,
  clearTransactions,
} from "../slices/transactionsSlice";
import { fetchAccounts } from "../slices/accountsSlice";
import { NavBar } from "../components/NavBar";
import { TransactionsPageHeader } from "../components/TransactionsPageHeader";
import { TransactionsTable } from "../components/TransactionsTable";
import { NewTransactionModal } from "../components/NewTransactionModal";
import type { Transaction } from "../types";

export function TransactionsPage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const {
    items: transactions,
    loading,
    error,
  } = useAppSelector((s) => s.transactions);
  const { items: accounts } = useAppSelector((s) => s.accounts);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewTransaction, setShowNewTransaction] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchAccounts());
    return () => {
      dispatch(clearTransactions());
    };
  }, [dispatch]);

  // Collect all unique tags from loaded transactions
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const txn of transactions) {
      if (txn.tags) {
        for (const tag of txn.tags) {
          tagSet.add(tag.name);
        }
      }
    }
    return Array.from(tagSet);
  }, [transactions]);

  // Apply all filters
  const filteredTransactions = useMemo(() => {
    let result: Transaction[] = transactions;

    // Date range filter
    if (startDate) {
      result = result.filter((txn) => txn.date >= startDate);
    }
    if (endDate) {
      result = result.filter((txn) => txn.date <= endDate);
    }

    // Account filter
    if (accountFilter) {
      result = result.filter((txn) =>
        txn.entries?.some((e) => e.account_id === accountFilter)
      );
    }

    // Material/tag filter
    if (materialFilter) {
      result = result.filter((txn) =>
        txn.tags?.some((tag) => tag.name === materialFilter)
      );
    }

    // Type filter
    if (typeFilter) {
      result = result.filter((txn) => {
        if (!txn.entries || txn.entries.length === 0) return false;
        return txn.entries[0].entry_type === typeFilter;
      });
    }

    // Search filter (case-insensitive on description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((txn) =>
        txn.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [transactions, startDate, endDate, accountFilter, materialFilter, typeFilter, searchQuery]);

  const hasFilters = !!(
    startDate ||
    endDate ||
    accountFilter ||
    materialFilter ||
    typeFilter ||
    searchQuery
  );

  const handleNewTransactionClose = useCallback(() => {
    setShowNewTransaction(false);
    // Refetch to show the new transaction
    dispatch(fetchTransactions());
  }, [dispatch]);

  return (
    <div data-testid="transactions-page">
      <NavBar />
      <div className="p-6 max-sm:p-3">
        <TransactionsPageHeader
          accounts={accounts}
          allTags={allTags}
          startDate={startDate}
          endDate={endDate}
          accountFilter={accountFilter}
          materialFilter={materialFilter}
          typeFilter={typeFilter}
          searchQuery={searchQuery}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onAccountFilterChange={setAccountFilter}
          onMaterialFilterChange={setMaterialFilter}
          onTypeFilterChange={setTypeFilter}
          onSearchQueryChange={setSearchQuery}
          onNewTransaction={() => setShowNewTransaction(true)}
        />

        {loading && transactions.length === 0 ? (
          <p>Loading transactions...</p>
        ) : error ? (
          <p style={{ color: "var(--status-error)" }}>{error}</p>
        ) : (
          <TransactionsTable
            transactions={filteredTransactions}
            hasFilters={hasFilters}
          />
        )}
      </div>

      {showNewTransaction && (
        <NewTransactionModal onClose={handleNewTransactionClose} />
      )}
    </div>
  );
}
