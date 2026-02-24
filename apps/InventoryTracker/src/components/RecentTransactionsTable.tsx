import { useNavigate } from "react-router-dom";
import type { Transaction } from "../types";

interface RecentTransactionsTableProps {
  transactions: Transaction[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
  const navigate = useNavigate();

  return (
    <div data-testid="recent-transactions" className="section-card">
      <div className="section-card-header">
        <div data-testid="recent-transactions-heading" className="section-card-title">
          <svg
            className="section-card-title-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Recent Transactions
        </div>
      </div>
      <div className="section-card-body" style={{ padding: 0 }}>
        {transactions.length === 0 ? (
          <div data-testid="recent-transactions-empty" className="empty-state">
            <p className="empty-state-message">No recent transactions</p>
          </div>
        ) : (
          <table data-testid="recent-transactions-table" className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Accounts Affected</th>
                <th>Materials &amp; Amounts</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => {
                const accountPairs = (txn.transfers ?? []).map((t) => (
                  `${t.source_account_name} → ${t.destination_account_name}`
                ));
                const uniqueAccounts = [...new Set(accountPairs)].join("; ");

                const materialAmounts = (txn.transfers ?? []).map((t) => (
                  `${t.material_name}: +${t.amount.toLocaleString()} ${t.unit}`
                )).join("; ");

                return (
                  <tr key={txn.id} data-testid={`recent-transaction-row-${txn.id}`}>
                    <td data-testid={`recent-transaction-date-${txn.id}`}>
                      {formatDate(txn.date)}
                    </td>
                    <td data-testid={`recent-transaction-reference-${txn.id}`}>
                      {txn.reference_id}
                    </td>
                    <td data-testid={`recent-transaction-accounts-${txn.id}`}>
                      {uniqueAccounts}
                    </td>
                    <td data-testid={`recent-transaction-materials-${txn.id}`}>
                      {materialAmounts}
                    </td>
                    <td>
                      <a
                        data-testid={`recent-transaction-view-details-${txn.id}`}
                        className="link"
                        href={`/transactions/${txn.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/transactions/${txn.id}`);
                        }}
                      >
                        View Full Details &gt;
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="section-card-footer">
        <a
          data-testid="view-all-transactions-link"
          className="link"
          href="/transactions"
          onClick={(e) => {
            e.preventDefault();
            navigate("/transactions");
          }}
        >
          View All Transactions
        </a>
      </div>
    </div>
  );
}
