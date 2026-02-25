import React from "react";
import { useNavigate } from "react-router-dom";
import type { Report, ReportItem } from "../types";
import { Breadcrumb } from "../../../shared/components/Breadcrumb";
import { formatCurrency } from "../../../shared/utils/currency";
import { generateCsv } from "../../../shared/utils/csv";

interface ReportHeaderProps {
  report: Report;
  items: ReportItem[];
}

export function ReportHeader({
  report,
  items,
}: ReportHeaderProps): React.ReactElement {
  const navigate = useNavigate();

  function handleExportCsv() {
    const csvData = generateCsv(
      items.map((item) => ({
        name: item.item_name ?? "",
        actual: formatCurrency(item.actual_amount),
        budget: formatCurrency(item.budget_amount),
        variance_dollar: formatCurrency(item.variance),
        variance_pct:
          item.variance < 0
            ? `(${Math.abs(item.variance_pct).toFixed(1)}%)`
            : `${item.variance_pct.toFixed(1)}%`,
      })),
      [
        { header: "Account / Item", key: "name" },
        { header: "Actual ($)", key: "actual" },
        { header: "Budget ($)", key: "budget" },
        { header: "Variance ($)", key: "variance_dollar" },
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
  }

  function handleExportPdf() {
    window.print();
  }

  return (
    <div className="report-header" data-testid="report-header">
      <Breadcrumb
        items={[
          { label: "Reports", onClick: () => navigate("/reports") },
          { label: report.name },
        ]}
      />
      <div className="report-header-row">
        <h1 className="report-header-title" data-testid="report-header-title">
          {report.name} (ID: {report.id})
        </h1>
        <div className="report-header-actions flex-wrap">
          <button
            className="btn btn--secondary"
            data-testid="export-pdf-btn"
            onClick={handleExportPdf}
          >
            Export PDF
          </button>
          <button
            className="btn btn--primary"
            data-testid="export-csv-btn"
            onClick={handleExportCsv}
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
