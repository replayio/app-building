import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../../../shared/components/Breadcrumb";
import { CreateReportDialog } from "./CreateReportDialog";

interface ReportListHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ReportListHeader({
  searchQuery,
  onSearchChange,
}: ReportListHeaderProps): React.ReactElement {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <div className="report-list-header" data-testid="report-list-header">
        <Breadcrumb
          items={[
            { label: "Page", onClick: () => navigate("/") },
            { label: "reports" },
          ]}
        />
        <div className="report-list-header-row">
          <h1 className="page-title" data-testid="report-list-title">
            ReportList
          </h1>
          <div className="report-list-header-actions">
            <div className="report-list-search" data-testid="report-list-search">
              <svg
                className="report-list-search-icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                <path
                  d="M10.5 10.5L14 14"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                className="report-list-search-input"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                data-testid="report-list-search-input"
              />
            </div>
            <button
              className="btn btn--primary"
              data-testid="generate-new-report-btn"
              onClick={() => setShowCreateDialog(true)}
            >
              Generate New Report
            </button>
          </div>
        </div>
      </div>

      {showCreateDialog && (
        <CreateReportDialog onClose={() => setShowCreateDialog(false)} />
      )}
    </>
  );
}
