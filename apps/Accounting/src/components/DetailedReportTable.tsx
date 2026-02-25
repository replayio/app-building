import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ReportItem } from "../types";
import { formatCurrency } from "../../../shared/utils/currency";

interface DetailedReportTableProps {
  items: ReportItem[];
}

function RowSparkline({
  variance,
}: {
  variance: number;
}): React.ReactElement {
  // Generate a small trend sparkline based on variance direction
  const w = 60;
  const h = 20;
  const pad = 2;

  // Create simple trend points: favorable = rising, unfavorable = declining
  const trending = variance >= 0;
  const points = trending
    ? [
        [pad, h - pad],
        [w * 0.25, h * 0.6],
        [w * 0.5, h * 0.45],
        [w * 0.75, h * 0.3],
        [w - pad, pad],
      ]
    : [
        [pad, pad],
        [w * 0.25, h * 0.35],
        [w * 0.5, h * 0.5],
        [w * 0.75, h * 0.65],
        [w - pad, h - pad],
      ];

  const color = trending ? "var(--status-success)" : "var(--status-error)";

  return (
    <svg width={w} height={h} data-testid="row-sparkline">
      <polyline
        points={points.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DetailedReportTable({
  items,
}: DetailedReportTableProps): React.ReactElement {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const accountItems = items.filter((i) => i.item_type === "account");

  function getChildItems(parentId: string): ReportItem[] {
    return items.filter(
      (i) => i.parent_item_id === parentId && i.item_type === "item"
    );
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function formatVarianceDollar(variance: number): string {
    if (variance === 0) return formatCurrency(0);
    if (variance > 0) return `+${formatCurrency(variance)}`;
    return `-${formatCurrency(Math.abs(variance))}`;
  }

  function formatVariancePct(variance: number, pct: number): string {
    if (variance === 0) return "(0%)";
    if (variance < 0) return `(${Math.abs(pct).toFixed(1)}%)`;
    return `${pct.toFixed(1)}%`;
  }

  function varianceColorClass(variance: number): string {
    if (variance < 0) return "report-variance--negative";
    if (variance > 0) return "report-variance--positive";
    return "";
  }

  return (
    <div className="detailed-report-section" data-testid="detailed-report-table">
      <h2 className="detailed-report-heading">Detailed Report</h2>
      <div className="detailed-report-table-wrapper">
        <table className="data-table detailed-report-data-table">
          <thead>
            <tr>
              <th>Account / Item</th>
              <th className="text-right">Actual ($)</th>
              <th className="text-right">Budget ($)</th>
              <th className="text-right">Variance ($)</th>
              <th className="text-right">Variance (%)</th>
              <th>Trend</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accountItems.map((item) => {
              const isExpanded = expanded.has(item.id);
              const children = getChildItems(item.id);
              const hasChildren = children.length > 0;

              return (
                <React.Fragment key={item.id}>
                  <tr
                    className="detailed-report-account-row"
                    data-testid={`report-row-${item.item_name?.toLowerCase().replace(/[^a-z0-9]/g, "-") ?? item.id}`}
                  >
                    <td>
                      <div className="detailed-report-name-cell">
                        <button
                          className={`detailed-report-expand-btn${!hasChildren ? " detailed-report-expand-btn--hidden" : ""}`}
                          data-testid={`expand-btn-${item.item_name?.toLowerCase().replace(/[^a-z0-9]/g, "-") ?? item.id}`}
                          onClick={() => toggleExpand(item.id)}
                          aria-label={
                            isExpanded
                              ? `Collapse ${item.item_name}`
                              : `Expand ${item.item_name}`
                          }
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            className={
                              isExpanded
                                ? "detailed-report-chevron--expanded"
                                : ""
                            }
                          >
                            <path
                              d="M4 2L8 6L4 10"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <div>
                          <span className="detailed-report-item-name">
                            {item.item_name}
                          </span>
                          <span className="detailed-report-item-label">
                            {" "}
                            (Account)
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="text-right font-tabular">
                      {formatCurrency(item.actual_amount)}
                    </td>
                    <td className="text-right font-tabular">
                      {formatCurrency(item.budget_amount)}
                    </td>
                    <td
                      className={`text-right font-tabular ${varianceColorClass(item.variance)}`}
                    >
                      {formatVarianceDollar(item.variance)}
                    </td>
                    <td
                      className={`text-right font-tabular ${varianceColorClass(item.variance)}`}
                    >
                      {formatVariancePct(item.variance, item.variance_pct)}
                    </td>
                    <td>
                      <RowSparkline variance={item.variance} />
                    </td>
                    <td>
                      {item.account_id && (
                        <button
                          className="btn btn--secondary detailed-report-view-btn"
                          data-testid={`view-btn-${item.item_name?.toLowerCase().replace(/[^a-z0-9]/g, "-") ?? item.id}`}
                          onClick={() =>
                            navigate(`/accounts/${item.account_id}`)
                          }
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>

                  {isExpanded &&
                    children.map((child) => (
                      <tr
                        key={child.id}
                        className="detailed-report-subitem-row"
                        data-testid={`report-subrow-${child.item_name?.toLowerCase().replace(/[^a-z0-9]/g, "-") ?? child.id}`}
                      >
                        <td>
                          <div className="detailed-report-subitem-name-cell">
                            <span className="detailed-report-item-name">
                              {child.item_name}
                            </span>
                            <span className="detailed-report-item-label">
                              {" "}
                              (Item)
                            </span>
                          </div>
                        </td>
                        <td className="text-right font-tabular">
                          {formatCurrency(child.actual_amount)}
                        </td>
                        <td className="text-right font-tabular">
                          {formatCurrency(child.budget_amount)}
                        </td>
                        <td
                          className={`text-right font-tabular ${varianceColorClass(child.variance)}`}
                        >
                          {formatVarianceDollar(child.variance)}
                        </td>
                        <td
                          className={`text-right font-tabular ${varianceColorClass(child.variance)}`}
                        >
                          {formatVariancePct(
                            child.variance,
                            child.variance_pct
                          )}
                        </td>
                        <td>
                          <RowSparkline variance={child.variance} />
                        </td>
                        <td>{/* No actions for sub-items */}</td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
