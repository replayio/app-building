import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { createReport } from "../slices/reportsSlice";
import { fetchAccounts } from "../slices/accountsSlice";
import { ReportTypeSelector } from "./ReportTypeSelector";
import { DateRangeSelector } from "./DateRangeSelector";
import { AccountCategoryFilter } from "./AccountCategoryFilter";
import { buildDefaultCategoryState, getSelectedCategories } from "./categoryTree";
import { ReportPreview } from "./ReportPreview";

interface CreateReportDialogProps {
  onClose: () => void;
  defaultType?: "summary" | "detailed" | "budget_vs_actual";
  defaultAccountName?: string;
}

export function CreateReportDialog({ onClose, defaultType, defaultAccountName }: CreateReportDialogProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((s) => s.accounts.items);

  const [reportType, setReportType] = useState<"summary" | "detailed" | "budget_vs_actual">(defaultType ?? "summary");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [subCategoryState, setSubCategoryState] = useState(buildDefaultCategoryState);
  const [includeZeroBalance, setIncludeZeroBalance] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedCategories = getSelectedCategories(subCategoryState);

  useEffect(() => {
    if (accounts.length === 0) {
      dispatch(fetchAccounts());
    }
  }, [dispatch, accounts.length]);

  const categoriesFilterString = selectedCategories.length === 5 ? null : selectedCategories.join(",");

  const handleSubmit = async () => {
    if (!startDate || !endDate) return;
    setSubmitting(true);

    const name = defaultAccountName
      ? `${reportType === "budget_vs_actual" ? "Budget vs Actual" : reportType === "detailed" ? "Detailed Transactions" : "Summary Overview"} - ${defaultAccountName}`
      : `${reportType === "budget_vs_actual" ? "Budget vs Actual" : reportType === "detailed" ? "Detailed Transactions" : "Summary Overview"} Report`;

    try {
      await dispatch(
        createReport({
          name,
          report_type: reportType,
          date_range_start: startDate,
          date_range_end: endDate,
          categories_filter: categoriesFilterString,
          include_zero_balance: includeZeroBalance,
        })
      ).unwrap();
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  const canSubmit = !!startDate && !!endDate && !submitting;

  return (
    <div className="modal-overlay create-report-dialog" data-testid="create-report-dialog" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Report</h2>
          <button className="modal-close-btn" data-testid="report-dialog-close-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="create-report-dialog-subtitle">
          Configure parameters to generate a financial report based on accounts and transactions.
        </p>

        <div className="create-report-dialog-body">
          <div className="create-report-dialog-left">
            <div className="create-report-settings-title">Report Settings</div>

            <ReportTypeSelector value={reportType} onChange={setReportType} />

            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />

            <AccountCategoryFilter
              subCategoryState={subCategoryState}
              onSubCategoryChange={setSubCategoryState}
              includeZeroBalance={includeZeroBalance}
              onIncludeZeroBalanceChange={setIncludeZeroBalance}
            />
          </div>

          <ReportPreview
            reportType={reportType}
            startDate={startDate}
            endDate={endDate}
            selectedCategories={selectedCategories}
            includeZeroBalance={includeZeroBalance}
            subCategoryState={subCategoryState}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn--secondary" data-testid="report-cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="btn btn--primary"
            data-testid="submit-report-btn"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
