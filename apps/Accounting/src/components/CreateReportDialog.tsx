import React, { useState } from "react";
import { useAppDispatch } from "../hooks";
import { createReport } from "../slices/reportsSlice";

interface CreateReportDialogProps {
  onClose: () => void;
}

export function CreateReportDialog({ onClose }: CreateReportDialogProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [reportType, setReportType] = useState<"summary" | "detailed" | "budget_vs_actual">("summary");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [categoriesFilter, setCategoriesFilter] = useState("");
  const [includeZeroBalance, setIncludeZeroBalance] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reportTypes = [
    { value: "summary", label: "Summary" },
    { value: "detailed", label: "Detailed" },
    { value: "budget_vs_actual", label: "Budget vs Actual" },
  ] as const;

  const handleSubmit = async () => {
    if (!name.trim() || !dateStart || !dateEnd) return;
    setSubmitting(true);
    try {
      await dispatch(
        createReport({
          name,
          report_type: reportType,
          date_range_start: dateStart,
          date_range_end: dateEnd,
          categories_filter: categoriesFilter || null,
          include_zero_balance: includeZeroBalance,
        })
      ).unwrap();
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="create-report-dialog" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Generate Report</h2>
          <button className="modal-close-btn" data-testid="report-dialog-close-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Report Name</label>
          <input
            type="text"
            className="form-input"
            data-testid="report-name"
            placeholder="Enter report name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Report Type</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {reportTypes.map((rt) => (
              <button
                key={rt.value}
                className={`btn ${reportType === rt.value ? "btn--primary" : "btn--secondary"}`}
                data-testid={`report-type-${rt.value}`}
                onClick={() => setReportType(rt.value)}
              >
                {rt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              data-testid="report-date-start"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              data-testid="report-date-end"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Categories Filter (comma-separated, leave empty for all)</label>
          <input
            type="text"
            className="form-input"
            data-testid="report-categories-filter"
            placeholder="e.g. assets, liabilities"
            value={categoriesFilter}
            onChange={(e) => setCategoriesFilter(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              data-testid="report-include-zero"
              checked={includeZeroBalance}
              onChange={(e) => setIncludeZeroBalance(e.target.checked)}
            />
            <span className="form-label" style={{ marginBottom: 0 }}>Include zero-balance accounts</span>
          </label>
        </div>

        <div className="modal-footer">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn--primary"
            data-testid="submit-report-btn"
            disabled={!name.trim() || !dateStart || !dateEnd || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
