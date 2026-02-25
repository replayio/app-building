import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { formatCurrency } from "@shared/utils/currency";
import type { AccountCategory } from "../types";

type ReportType = "summary" | "detailed" | "budget_vs_actual";

interface ReportPreviewProps {
  reportType: ReportType;
  startDate: string;
  endDate: string;
  selectedCategories: AccountCategory[];
  includeZeroBalance: boolean;
  subCategoryState: Record<string, boolean>;
}

interface PreviewRow {
  id: string;
  name: string;
  accountId?: string;
  isSummary: boolean;
  isExpandable: boolean;
  budget: number;
  actual: number;
  variance: number;
  variancePct: number;
  children?: PreviewRow[];
}

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  summary: "Summary Overview",
  detailed: "Detailed Transactions",
  budget_vs_actual: "Budget vs. Actual",
};

function formatPreviewDateRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return "";
  if (!startDate || !endDate) return "";
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear === endYear && start.getMonth() === end.getMonth()) {
    return `${startMonth} ${startYear}`;
  }
  if (startYear === endYear) {
    return `${startMonth}\u2013${endMonth} ${startYear}`;
  }
  return `${startMonth} ${startYear}\u2013${endMonth} ${endYear}`;
}

function formatVariance(value: number): string {
  if (value >= 0) return `$+${formatCurrency(value).replace("$", "")}`;
  return `$${formatCurrency(value).replace("$", "")}`;
}

function formatVariancePct(value: number): string {
  if (value >= 0) return `+${value.toFixed(1)}%`;
  return `${value.toFixed(1)}%`;
}

function RefreshIcon(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}

function ChevronRightIcon(): React.ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 2.5L7.5 6L4.5 9.5" />
    </svg>
  );
}

function buildPreviewData(
  accounts: { id: string; name: string; category: AccountCategory; balance: number; budget_amount: number; budget_actual: number }[],
  selectedCategories: AccountCategory[],
  includeZeroBalance: boolean
): PreviewRow[] {
  const filtered = accounts.filter((a) => {
    if (!selectedCategories.includes(a.category)) return false;
    if (!includeZeroBalance && a.balance === 0 && a.budget_amount === 0 && a.budget_actual === 0) return false;
    return true;
  });

  // Build summary rows
  const categoryTotals: Record<string, { budget: number; actual: number }> = {};
  for (const cat of selectedCategories) {
    categoryTotals[cat] = { budget: 0, actual: 0 };
  }

  const accountsByCategory: Record<string, typeof filtered> = {};
  for (const a of filtered) {
    if (!accountsByCategory[a.category]) accountsByCategory[a.category] = [];
    accountsByCategory[a.category].push(a);
    categoryTotals[a.category].budget += a.budget_amount;
    categoryTotals[a.category].actual += a.budget_actual;
  }

  const rows: PreviewRow[] = [];

  // Revenue summary
  const revenueCats = selectedCategories.filter((c) => c === "revenue");
  let totalRevenueBudget = 0;
  let totalRevenueActual = 0;
  for (const cat of revenueCats) {
    totalRevenueBudget += categoryTotals[cat]?.budget ?? 0;
    totalRevenueActual += categoryTotals[cat]?.actual ?? 0;
  }
  if (revenueCats.length > 0) {
    const variance = totalRevenueActual - totalRevenueBudget;
    const pct = totalRevenueBudget !== 0 ? (variance / totalRevenueBudget) * 100 : 0;
    rows.push({
      id: "total-revenue",
      name: "Total Revenue",
      isSummary: true,
      isExpandable: false,
      budget: totalRevenueBudget,
      actual: totalRevenueActual,
      variance,
      variancePct: pct,
    });
  }

  // Expenses summary
  const expenseCats = selectedCategories.filter((c) => c === "expenses");
  let totalExpensesBudget = 0;
  let totalExpensesActual = 0;
  for (const cat of expenseCats) {
    totalExpensesBudget += categoryTotals[cat]?.budget ?? 0;
    totalExpensesActual += categoryTotals[cat]?.actual ?? 0;
  }
  if (expenseCats.length > 0) {
    const variance = totalExpensesBudget - totalExpensesActual;
    const pct = totalExpensesBudget !== 0 ? (variance / totalExpensesBudget) * 100 : 0;
    rows.push({
      id: "total-expenses",
      name: "Total Expenses",
      isSummary: true,
      isExpandable: false,
      budget: totalExpensesBudget,
      actual: totalExpensesActual,
      variance,
      variancePct: pct,
    });
  }

  // Net Income
  if (revenueCats.length > 0 || expenseCats.length > 0) {
    const netBudget = totalRevenueBudget - totalExpensesBudget;
    const netActual = totalRevenueActual - totalExpensesActual;
    const netVariance = netActual - netBudget;
    const netPct = netBudget !== 0 ? (netVariance / netBudget) * 100 : 0;
    rows.push({
      id: "net-income",
      name: "Net Income",
      isSummary: true,
      isExpandable: false,
      budget: netBudget,
      actual: netActual,
      variance: netVariance,
      variancePct: netPct,
    });
  }

  // Individual account rows grouped by category
  for (const cat of selectedCategories) {
    const catAccounts = accountsByCategory[cat] ?? [];
    for (const acct of catAccounts) {
      const variance = acct.category === "expenses"
        ? acct.budget_amount - acct.budget_actual
        : acct.budget_actual - acct.budget_amount;
      const pct = acct.budget_amount !== 0 ? (variance / acct.budget_amount) * 100 : 0;
      rows.push({
        id: acct.id,
        name: acct.name,
        accountId: acct.id,
        isSummary: false,
        isExpandable: true,
        budget: acct.budget_amount,
        actual: acct.budget_actual,
        variance,
        variancePct: pct,
      });
    }
  }

  return rows;
}

export function ReportPreview({
  reportType,
  startDate,
  endDate,
  selectedCategories,
  includeZeroBalance,
}: ReportPreviewProps): React.ReactElement {
  const navigate = useNavigate();
  const accounts = useAppSelector((s) => s.accounts.items);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);

  const computePreview = useCallback(() => {
    const data = buildPreviewData(accounts, selectedCategories, includeZeroBalance);
    setPreviewData(data);
    setExpandedRows(new Set());
  }, [accounts, selectedCategories, includeZeroBalance]);

  useEffect(() => {
    computePreview();
  }, [computePreview]);

  const dateLabel = formatPreviewDateRange(startDate, endDate);
  const typeLabel = REPORT_TYPE_LABELS[reportType];
  const previewTitle = `Report Preview${typeLabel || dateLabel ? ` (${typeLabel}${dateLabel ? ` - ${dateLabel}` : ""})` : ""}`;

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAccountClick = (accountId: string) => {
    navigate(`/accounts/${accountId}`);
  };

  const handleRefresh = () => {
    computePreview();
  };

  const isBudgetVsActual = reportType === "budget_vs_actual";
  const isSummary = reportType === "summary";

  return (
    <div className="create-report-dialog-right" data-testid="report-preview">
      <div className="report-preview-header">
        <span className="report-preview-title" data-testid="report-preview-title">{previewTitle}</span>
        <button
          type="button"
          className="report-preview-refresh-btn"
          data-testid="refresh-preview-btn"
          onClick={handleRefresh}
        >
          <RefreshIcon />
          Refresh Preview
        </button>
      </div>

      <div className="report-preview-table-wrapper">
        {previewData.length === 0 ? (
          <div className="report-preview-empty" data-testid="preview-empty">
            No data available for the selected filters
          </div>
        ) : (
          <table className="report-preview-table" data-testid="preview-table">
            <thead>
              <tr>
                <th>Category / Account</th>
                {isBudgetVsActual && (
                  <>
                    <th>Budget</th>
                    <th>Actual</th>
                    <th>Variance</th>
                    <th>Variance %</th>
                  </>
                )}
                {isSummary && (
                  <>
                    <th>Budget</th>
                    <th>Actual</th>
                    <th>Variance</th>
                  </>
                )}
                {reportType === "detailed" && (
                  <>
                    <th>Budget</th>
                    <th>Actual</th>
                    <th>Variance</th>
                    <th>Variance %</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row) => {
                const isExpanded = expandedRows.has(row.id);
                const varianceClass = row.variance >= 0
                  ? "report-preview-variance--positive"
                  : "report-preview-variance--negative";

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`${row.isSummary ? "report-preview-row--summary" : ""}${row.isExpandable ? " report-preview-row--expandable" : ""}`}
                      data-testid={`preview-row-${row.id}`}
                      onClick={row.isExpandable ? () => toggleExpand(row.id) : undefined}
                    >
                      <td>
                        <div className="report-preview-row-name">
                          {row.isExpandable && (
                            <span className={`report-preview-expand-icon${isExpanded ? " report-preview-expand-icon--expanded" : ""}`}>
                              <ChevronRightIcon />
                            </span>
                          )}
                          {row.accountId ? (
                            <a
                              className="report-preview-account-link"
                              data-testid={`preview-link-${row.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccountClick(row.accountId!);
                              }}
                            >
                              {row.name}
                            </a>
                          ) : (
                            <span>{row.name}</span>
                          )}
                        </div>
                      </td>
                      <td>{formatCurrency(row.budget)}</td>
                      <td>{formatCurrency(row.actual)}</td>
                      <td className={varianceClass}>{formatVariance(row.variance)}</td>
                      {(isBudgetVsActual || reportType === "detailed") && (
                        <td className={varianceClass}>{formatVariancePct(row.variancePct)}</td>
                      )}
                    </tr>
                    {isExpanded && row.children && row.children.map((child) => (
                      <tr key={child.id} className="report-preview-sub-row" data-testid={`preview-subrow-${child.id}`}>
                        <td>{child.name}</td>
                        <td>{formatCurrency(child.budget)}</td>
                        <td>{formatCurrency(child.actual)}</td>
                        <td className={child.variance >= 0 ? "report-preview-variance--positive" : "report-preview-variance--negative"}>
                          {formatVariance(child.variance)}
                        </td>
                        {(isBudgetVsActual || reportType === "detailed") && (
                          <td className={child.variance >= 0 ? "report-preview-variance--positive" : "report-preview-variance--negative"}>
                            {formatVariancePct(child.variancePct)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
