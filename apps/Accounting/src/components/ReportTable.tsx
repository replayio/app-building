import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { createReport, deleteReport } from "../slices/reportsSlice";
import { Pagination } from "../../../shared/components/Pagination";
import { formatDateRange } from "../../../shared/utils/date";
import { generateCsv } from "../../../shared/utils/csv";
import type { Report } from "../types";

const ITEMS_PER_PAGE = 10;

const REPORT_TYPE_LABELS: Record<string, string> = {
  summary: "Financial Report",
  detailed: "Expense Detail",
  budget_vs_actual: "Financial Report",
};

interface ReportTableProps {
  reports: Report[];
  searchQuery: string;
}

export function ReportTable({
  reports,
  searchQuery,
}: ReportTableProps): React.ReactElement {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter((r) => r.name.toLowerCase().includes(q));
  }, [reports, searchQuery]);

  const sorted = useMemo(() => {
    const items = [...filtered];
    items.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });
    return items;
  }, [filtered, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = sorted.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  function handleToggleSort() {
    setSortAsc((prev) => !prev);
  }

  async function handleRefresh(report: Report) {
    await dispatch(
      createReport({
        name: report.name,
        report_type: report.report_type,
        date_range_start: report.date_range_start,
        date_range_end: report.date_range_end,
        categories_filter: report.categories_filter,
        include_zero_balance: report.include_zero_balance,
      })
    ).unwrap();
    await dispatch(deleteReport(report.id));
  }

  async function handleDownload(report: Report) {
    try {
      const res = await fetch(`/.netlify/functions/reports/${report.id}`);
      if (!res.ok) return;
      const data = await res.json();
      const items = (data.items || []) as Record<string, unknown>[];
      const csvData = generateCsv(
        items.map((item) => ({
          name: (item.item_name as string) ?? "",
          budget: String(item.budget_amount ?? 0),
          actual: String(item.actual_amount ?? 0),
          variance: String(item.variance ?? 0),
          variance_pct: `${item.variance_pct ?? 0}%`,
        })),
        [
          { header: "Account / Item", key: "name" },
          { header: "Budget ($)", key: "budget" },
          { header: "Actual ($)", key: "actual" },
          { header: "Variance ($)", key: "variance" },
          { header: "Variance (%)", key: "variance_pct" },
        ]
      );
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, "_")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // download failed silently
    }
  }

  function getAccountsLabel(report: Report): string {
    if (!report.categories_filter) return "All Accounts";
    const cats = report.categories_filter.split(",").map((c) => c.trim());
    if (cats.length === 5) return "All Accounts";
    return cats.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(", ");
  }

  if (sorted.length === 0) {
    return (
      <div className="report-table-empty" data-testid="report-table-empty">
        <p>No reports found</p>
      </div>
    );
  }

  return (
    <div data-testid="report-table">
      <div className="report-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th
                className="report-table-sortable-header"
                data-testid="report-name-header"
                onClick={handleToggleSort}
              >
                <span className="report-table-sort-label">
                  Report Name{" "}
                  <span className="report-table-sort-arrow">
                    {sortAsc ? "↑" : "↓"}
                  </span>
                </span>
              </th>
              <th>Type</th>
              <th>Date Range</th>
              <th>Accounts Included</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => (
              <tr key={r.id} data-testid={`report-row-${r.id}`}>
                <td data-testid="report-name">{r.name}</td>
                <td data-testid="report-type">
                  {REPORT_TYPE_LABELS[r.report_type] ?? r.report_type}
                </td>
                <td data-testid="report-date-range">
                  {r.date_range_start && r.date_range_end
                    ? formatDateRange(r.date_range_start, r.date_range_end)
                    : "—"}
                </td>
                <td data-testid="report-accounts">{getAccountsLabel(r)}</td>
                <td data-testid="report-status">
                  <span
                    className={`badge ${r.status === "complete" ? "badge--complete" : "badge--pending"}`}
                  >
                    {r.status === "complete" ? "Complete" : "Pending"}
                  </span>
                </td>
                <td data-testid="report-actions">
                  <div className="report-actions-row">
                    <button
                      className="report-action-icon-btn"
                      data-testid="report-refresh-btn"
                      title="Refresh report"
                      onClick={() => handleRefresh(r)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M2 8a6 6 0 0 1 10.89-3.48M14 8a6 6 0 0 1-10.89 3.48"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M14 2v3h-3"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 14v-3h3"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      className="report-action-icon-btn"
                      data-testid="report-download-btn"
                      title="Download report"
                      onClick={() => handleDownload(r)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M8 2v9M4.5 7.5L8 11l3.5-3.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3 13h10"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    <a
                      className="report-view-link"
                      data-testid="report-view-details-link"
                      href={`/reports/${r.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/reports/${r.id}`);
                      }}
                    >
                      View Details
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
