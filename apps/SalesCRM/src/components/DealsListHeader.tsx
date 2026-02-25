import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchDeals, importDeals } from "../dealsSlice";
import type { Deal } from "../dealsSlice";
import { ImportDialog, type ImportColumn, type ImportRowError } from "@shared/components/ImportDialog";
import { generateCsv } from "@shared/utils/csv";

const IMPORT_COLUMNS: ImportColumn[] = [
  { header: "Name", key: "Name", required: true, description: "Deal name" },
  { header: "Client Name", key: "Client Name", required: true, description: "Must match an existing client" },
  { header: "Value", key: "Value", required: false, description: "Numeric deal value" },
  { header: "Stage", key: "Stage", required: false, description: "Valid stage name (e.g., Lead, Qualified)" },
  { header: "Owner", key: "Owner", required: false, description: "Team member name" },
  { header: "Probability", key: "Probability", required: false, description: "Numeric 0-100" },
  { header: "Expected Close Date", key: "Expected Close Date", required: false, description: "Date format (YYYY-MM-DD)" },
  { header: "Status", key: "Status", required: false, description: "On Track/Needs Attention/At Risk/Won/Lost" },
];

const EXPORT_COLUMNS = [
  { header: "Name", key: "name" },
  { header: "Client Name", key: "clientName" },
  { header: "Value", key: "value" },
  { header: "Stage", key: "stage" },
  { header: "Owner", key: "ownerName" },
  { header: "Probability", key: "probability" },
  { header: "Expected Close Date", key: "expectedCloseDate" },
  { header: "Status", key: "status" },
];

interface DealsListHeaderProps {
  onCreateDeal: () => void;
}

export function DealsListHeader({ onCreateDeal }: DealsListHeaderProps) {
  const [importOpen, setImportOpen] = useState(false);
  const deals = useSelector((state: RootState) => (state as unknown as { deals: { items: Deal[] } }).deals.items);
  const dispatch = useDispatch<AppDispatch>();

  function handleExport() {
    const exportData = deals.map((d) => ({
      name: d.name,
      clientName: d.clientName || "",
      value: d.value != null ? String(d.value) : "",
      stage: d.stage,
      ownerName: d.ownerName || "",
      probability: d.probability != null ? String(d.probability) : "",
      expectedCloseDate: d.expectedCloseDate || "",
      status: d.status,
    }));
    const csv = generateCsv(exportData, EXPORT_COLUMNS);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deals.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(rows: Record<string, string>[]): Promise<{ errors?: ImportRowError[] }> {
    const result = await dispatch(importDeals(rows)).unwrap();
    if (result.errors && result.errors.length > 0) {
      return { errors: result.errors };
    }
    await dispatch(fetchDeals());
    return {};
  }

  return (
    <>
      <div className="page-header" data-testid="deals-list-header">
        <div>
          <div className="deals-breadcrumb" data-testid="deals-breadcrumb">/deals</div>
          <h1 className="page-title">Deals List</h1>
        </div>
        <div className="deals-header-actions">
          <button
            className="btn btn--secondary"
            data-testid="import-btn"
            onClick={() => setImportOpen(true)}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v9M3.5 6.5L7 10l3.5-3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Import
          </button>
          <button
            className="btn btn--secondary"
            data-testid="export-btn"
            onClick={handleExport}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 10V1M3.5 4.5L7 1l3.5 3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export
          </button>
          <button
            className="btn btn--primary"
            data-testid="create-deal-btn"
            onClick={onCreateDeal}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Create New Deal
          </button>
        </div>
      </div>

      <ImportDialog
        open={importOpen}
        title="Import Deals"
        columns={IMPORT_COLUMNS}
        onImport={handleImport}
        onClose={() => setImportOpen(false)}
        testId="import-dialog"
      />
    </>
  );
}
