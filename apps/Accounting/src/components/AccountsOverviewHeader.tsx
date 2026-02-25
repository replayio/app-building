import React, { useState } from "react";
import { CreateReportDialog } from "./CreateReportDialog";

export function AccountsOverviewHeader(): React.ReactElement {
  const [showReportDialog, setShowReportDialog] = useState(false);

  return (
    <>
      <div className="page-header" data-testid="accounts-overview-header">
        <h1 className="page-title" data-testid="accounts-overview-title">
          Accounts Overview
        </h1>
        <button
          className="btn-generate-reports"
          data-testid="generate-reports-btn"
          onClick={() => setShowReportDialog(true)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M9 1H4C3.44772 1 3 1.44772 3 2V14C3 14.5523 3.44772 15 4 15H12C12.5523 15 13 14.5523 13 14V5L9 1Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M9 1V5H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 9H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M6 11.5H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="max-sm:hidden">Generate Reports</span>
        </button>
      </div>

      {showReportDialog && (
        <CreateReportDialog onClose={() => setShowReportDialog(false)} />
      )}
    </>
  );
}
