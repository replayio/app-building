import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchAccounts } from "../slices/accountsSlice";
import { NavBar } from "../components/NavBar";
import { AccountsOverviewHeader } from "../components/AccountsOverviewHeader";
import { AccountCard } from "../components/AccountCard";
import { CategoryGroup } from "@shared/components/CategorySection";
import { formatCurrency } from "@shared/utils/currency";
import type { Account, AccountCategory } from "../types";

const CATEGORY_ORDER: { key: AccountCategory; label: string; defaultExpanded: boolean }[] = [
  { key: "assets", label: "Assets", defaultExpanded: true },
  { key: "liabilities", label: "Liabilities", defaultExpanded: true },
  { key: "equity", label: "Equity", defaultExpanded: false },
  { key: "revenue", label: "Revenue", defaultExpanded: false },
  { key: "expenses", label: "Expenses", defaultExpanded: false },
];

export function AccountsPage(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { items: accounts, loading, error } = useAppSelector((s) => s.accounts);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const grouped = CATEGORY_ORDER.map((cat) => {
    const items = accounts.filter((a: Account) => a.category === cat.key);
    const total = items.reduce((sum: number, a: Account) => sum + a.balance, 0);
    return {
      title: cat.label,
      items,
      total: formatCurrency(total),
      defaultExpanded: cat.defaultExpanded,
    };
  });

  return (
    <div data-testid="accounts-page">
      <NavBar />
      <AccountsOverviewHeader />

      <div className="p-6 max-sm:p-3">
        {loading && accounts.length === 0 && <p>Loading accounts...</p>}
        {error && <p style={{ color: "var(--status-error)" }}>{error}</p>}

        {!loading && accounts.length > 0 && (
          <CategoryGroup<Account>
            categories={grouped}
            renderItem={(account) => <AccountCard account={account} />}
            getItemKey={(account) => account.id}
          />
        )}

        {!loading && !error && accounts.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>
            No accounts found. Create your first account to get started.
          </p>
        )}
      </div>
    </div>
  );
}
