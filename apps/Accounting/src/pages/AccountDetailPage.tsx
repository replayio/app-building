import React, { useEffect, useState, useMemo } from "react";
import type { Transaction } from "../types";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchAccountById, clearCurrentAccount } from "../slices/accountsSlice";
import {
  fetchTransactions,
  clearTransactions,
} from "../slices/transactionsSlice";
import { fetchBudgets, clearBudgets } from "../slices/budgetsSlice";
import { NavBar } from "../components/NavBar";
import { AccountHeader } from "../components/AccountHeader";
import { BudgetOverview } from "../components/BudgetOverview";
import { TransactionsTab } from "../components/TransactionsTab";
import { BudgetDetailsTab } from "../components/BudgetDetailsTab";
import { ReportingLinks } from "../components/ReportingLinks";

type TabId = "transactions" | "budget-details";

export function AccountDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const {
    currentAccount: account,
    loading: accountLoading,
    error: accountError,
  } = useAppSelector((s) => s.accounts);
  const { items: transactions } = useAppSelector(
    (s) => s.transactions
  );
  const { items: budgets } = useAppSelector((s) => s.budgets);

  const [activeTab, setActiveTab] = useState<TabId>("transactions");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchAccountById(id));
      dispatch(fetchTransactions(id));
      dispatch(fetchBudgets(id));
    }
    return () => {
      dispatch(clearCurrentAccount());
      dispatch(clearTransactions());
      dispatch(clearBudgets());
    };
  }, [dispatch, id]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter((txn: Transaction) =>
      txn.description.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  const loading = accountLoading && !account;

  if (loading) {
    return (
      <div data-testid="account-detail-page">
        <NavBar />
        <div className="p-6 max-sm:p-3">
          <p>Loading account...</p>
        </div>
      </div>
    );
  }

  if (accountError) {
    return (
      <div data-testid="account-detail-page">
        <NavBar />
        <div className="p-6 max-sm:p-3">
          <p style={{ color: "var(--status-error)" }}>{accountError}</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div data-testid="account-detail-page">
        <NavBar />
        <div className="p-6 max-sm:p-3">
          <p>Account not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="account-detail-page">
      <NavBar />

      <div className="p-6 max-sm:p-3">
        <AccountHeader
          account={account}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <BudgetOverview
          budgetAmount={account.budget_amount}
          budgetActual={account.budget_actual}
        />

        <div className="account-detail-tabs" data-testid="account-detail-tabs">
          <div className="tabs">
            <button
              className={`tab${activeTab === "transactions" ? " tab--active" : ""}`}
              data-testid="tab-transactions"
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </button>
            <button
              className={`tab${activeTab === "budget-details" ? " tab--active" : ""}`}
              data-testid="tab-budget-details"
              onClick={() => setActiveTab("budget-details")}
            >
              Budget Details
            </button>
          </div>

          <div data-testid="tab-content">
            {activeTab === "transactions" && (
              <TransactionsTab
                transactions={filteredTransactions}
                accountId={id!}
              />
            )}
            {activeTab === "budget-details" && (
              <BudgetDetailsTab budgets={budgets} />
            )}
          </div>
        </div>

        <ReportingLinks accountName={account.name} />
      </div>
    </div>
  );
}
