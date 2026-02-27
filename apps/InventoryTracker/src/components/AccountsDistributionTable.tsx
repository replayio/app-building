import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { accountTypeLabel } from "../utils/accountTypeLabel";

interface AccountBatch {
  id: string;
  quantity: number;
  unit: string;
  created_at: string;
  status: string;
}

export interface AccountDistribution {
  account_id: string;
  account_name: string;
  account_type: string;
  total_quantity: number;
  batch_count: number;
  batches: AccountBatch[];
}

interface AccountsDistributionTableProps {
  accounts: AccountDistribution[];
  unitOfMeasure: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatQuantity(value: number): string {
  const num = Number(value);
  return num.toLocaleString("en-US");
}

export function AccountsDistributionTable({
  accounts,
  unitOfMeasure,
}: AccountsDistributionTableProps) {
  const navigate = useNavigate();
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
    new Set()
  );

  const toggleExpand = (accountId: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  return (
    <div data-testid="accounts-distribution-section">
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">
            <svg
              className="section-card-title-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Accounts Distribution
          </h2>
        </div>
        <div className="section-card-body" style={{ padding: 0 }}>
          {accounts.length === 0 ? (
            <div
              data-testid="accounts-distribution-empty"
              className="empty-state"
            >
              <p className="empty-state-message">
                This material is not tracked in any account
              </p>
            </div>
          ) : (
            <table
              className="data-table"
              data-testid="accounts-distribution-table"
            >
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Account Name</th>
                  <th className="max-lg:hidden">Account Type</th>
                  <th>Quantity ({unitOfMeasure})</th>
                  <th className="max-md:hidden">Number of Batches</th>
                  <th className="max-md:hidden">Link</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => {
                  const isExpanded = expandedAccounts.has(acc.account_id);
                  return (
                    <>
                      <tr
                        key={acc.account_id}
                        data-testid={`account-row-${acc.account_id}`}
                      >
                        <td>
                          <button
                            data-testid={`expand-btn-${acc.account_id}`}
                            className="btn-ghost"
                            onClick={() => toggleExpand(acc.account_id)}
                            style={{ padding: 4, minWidth: 24 }}
                            title={
                              isExpanded
                                ? "Collapse batches"
                                : "Expand batches"
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                width: 14,
                                height: 14,
                                transition: "transform 0.15s ease",
                                transform: isExpanded
                                  ? "rotate(90deg)"
                                  : "rotate(0deg)",
                              }}
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </td>
                        <td>
                          <span
                            data-testid={`account-name-${acc.account_id}`}
                          >
                            {acc.account_name}
                          </span>
                        </td>
                        <td className="max-lg:hidden">
                          <span
                            data-testid={`account-type-${acc.account_id}`}
                          >
                            {accountTypeLabel(acc.account_type)}
                          </span>
                        </td>
                        <td>
                          <span
                            data-testid={`account-quantity-${acc.account_id}`}
                          >
                            {formatQuantity(acc.total_quantity)}
                          </span>
                        </td>
                        <td className="max-md:hidden">
                          <span
                            data-testid={`account-batches-${acc.account_id}`}
                          >
                            {acc.batch_count}
                          </span>
                        </td>
                        <td className="max-md:hidden">
                          <a
                            data-testid={`view-account-link-${acc.account_id}`}
                            className="link"
                            href={`/accounts/${acc.account_id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/accounts/${acc.account_id}`);
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ width: 14, height: 14 }}
                            >
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            View Account
                          </a>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr
                          key={`${acc.account_id}-batches`}
                          data-testid={`account-batches-row-${acc.account_id}`}
                        >
                          <td colSpan={6} className="nested-batches-cell">
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: "var(--text-muted)",
                                marginBottom: 8,
                              }}
                            >
                              Batches in {acc.account_name}
                            </div>
                            {acc.batches.length === 0 ? (
                              <div
                                style={{
                                  fontSize: 13,
                                  color: "var(--text-disabled)",
                                  padding: "8px 0",
                                }}
                              >
                                No batches
                              </div>
                            ) : (
                              <table
                                className="data-table"
                                data-testid={`nested-batches-table-${acc.account_id}`}
                                style={{
                                  border: "1px solid var(--bg-border-color-light)",
                                  borderRadius: 4,
                                }}
                              >
                                <thead>
                                  <tr>
                                    <th>Batch ID</th>
                                    <th>Quantity ({unitOfMeasure})</th>
                                    <th className="max-md:hidden">Unit</th>
                                    <th className="max-md:hidden">Created Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {acc.batches.map((batch) => (
                                    <tr
                                      key={batch.id}
                                      data-testid={`nested-batch-row-${batch.id}`}
                                    >
                                      <td>
                                        <a
                                          data-testid={`nested-batch-id-${batch.id}`}
                                          className="link"
                                          href={`/batches/${batch.id}`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            navigate(`/batches/${batch.id}`);
                                          }}
                                        >
                                          {batch.id.substring(0, 13)}
                                        </a>
                                      </td>
                                      <td>{formatQuantity(batch.quantity)}</td>
                                      <td className="max-md:hidden">{batch.unit || unitOfMeasure}</td>
                                      <td className="max-md:hidden">{formatDate(batch.created_at)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
