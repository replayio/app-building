import React, { useState } from "react";
import { CreateReportDialog } from "./CreateReportDialog";

interface ReportingLinksProps {
  accountName: string;
}

export function ReportingLinks({
  accountName,
}: ReportingLinksProps): React.ReactElement {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportType, setReportType] = useState<
    "budget_vs_actual" | "detailed"
  >("budget_vs_actual");

  const handleOpenReport = (type: "budget_vs_actual" | "detailed") => {
    setReportType(type);
    setShowReportDialog(true);
  };

  return (
    <>
      <div className="reporting-links" data-testid="reporting-links">
        <h2
          className="reporting-links-title"
          data-testid="reporting-links-title"
        >
          Reporting
        </h2>
        <div className="reporting-links-list">
          <button
            className="reporting-link"
            data-testid="reporting-link-budget"
            onClick={() => handleOpenReport("budget_vs_actual")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M9 1H4C3.44772 1 3 1.44772 3 2V14C3 14.5523 3.44772 15 4 15H12C12.5523 15 13 14.5523 13 14V5L9 1Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 1V5H13"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Actual vs Budget Report
          </button>
          <button
            className="reporting-link"
            data-testid="reporting-link-history"
            onClick={() => handleOpenReport("detailed")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M9 1H4C3.44772 1 3 1.44772 3 2V14C3 14.5523 3.44772 15 4 15H12C12.5523 15 13 14.5523 13 14V5L9 1Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 1V5H13"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 9H10"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M6 11.5H10"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            Transaction History Report
          </button>
        </div>
      </div>

      {showReportDialog && (
        <CreateReportDialog
          onClose={() => setShowReportDialog(false)}
          defaultType={reportType}
          defaultAccountName={accountName}
        />
      )}
    </>
  );
}
