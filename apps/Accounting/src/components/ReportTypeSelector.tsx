import React from "react";

type ReportType = "summary" | "detailed" | "budget_vs_actual";

interface ReportTypeSelectorProps {
  value: ReportType;
  onChange: (type: ReportType) => void;
}

const reportTypes: { value: ReportType; label: string }[] = [
  { value: "summary", label: "Summary Overview" },
  { value: "detailed", label: "Detailed Transactions" },
  { value: "budget_vs_actual", label: "Budget vs. Actual (Comparison)" },
];

function DocumentIcon(): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function ListIcon(): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function ComparisonIcon(): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

const icons: Record<ReportType, () => React.ReactElement> = {
  summary: DocumentIcon,
  detailed: ListIcon,
  budget_vs_actual: ComparisonIcon,
};

export function ReportTypeSelector({ value, onChange }: ReportTypeSelectorProps): React.ReactElement {
  return (
    <div className="report-type-selector" data-testid="report-type-selector">
      <div className="form-label" style={{ marginBottom: "8px" }}>Report Type</div>
      <div className="report-type-tabs">
        {reportTypes.map((rt) => {
          const Icon = icons[rt.value];
          const isActive = value === rt.value;
          return (
            <button
              key={rt.value}
              className={`report-type-tab${isActive ? " report-type-tab--active" : ""}`}
              data-testid={`report-type-${rt.value}`}
              onClick={() => onChange(rt.value)}
              type="button"
            >
              <Icon />
              <span className="report-type-tab-label">{rt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
