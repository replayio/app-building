import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchClients, importClients } from "../clientsSlice";
import type { Client } from "../clientsSlice";
import { ImportDialog, type ImportColumn, type ImportRowError } from "@shared/components/ImportDialog";
import { generateCsv } from "@shared/utils/csv";

const IMPORT_COLUMNS: ImportColumn[] = [
  { header: "Name", key: "Name", required: true, description: "Client name" },
  { header: "Type", key: "Type", required: true, description: "Organization or Individual" },
  { header: "Status", key: "Status", required: false, description: "Active, Inactive, Prospect, or Churned" },
  { header: "Tags", key: "Tags", required: false, description: "Comma-separated tags" },
  { header: "Source Type", key: "Source Type", required: false, description: "Acquisition source type" },
  { header: "Source Detail", key: "Source Detail", required: false, description: "Acquisition source detail" },
  { header: "Campaign", key: "Campaign", required: false, description: "Marketing campaign" },
  { header: "Channel", key: "Channel", required: false, description: "Acquisition channel" },
  { header: "Date Acquired", key: "Date Acquired", required: false, description: "Date client was acquired (YYYY-MM-DD)" },
];

const EXPORT_COLUMNS = [
  { header: "Name", key: "name" },
  { header: "Type", key: "type" },
  { header: "Status", key: "status" },
  { header: "Tags", key: "tags" },
  { header: "Source Type", key: "sourceType" },
  { header: "Source Detail", key: "sourceDetail" },
  { header: "Campaign", key: "campaign" },
  { header: "Channel", key: "channel" },
  { header: "Date Acquired", key: "dateAcquired" },
];

interface ClientsListHeaderProps {
  onAddClient: () => void;
}

export function ClientsListHeader({ onAddClient }: ClientsListHeaderProps) {
  const [importOpen, setImportOpen] = useState(false);
  const clients = useSelector((state: RootState) => state.clients.items) as Client[];
  const dispatch = useDispatch<AppDispatch>();

  function handleExport() {
    const exportData = clients.map((c) => ({
      name: c.name,
      type: c.type.charAt(0).toUpperCase() + c.type.slice(1),
      status: c.status.charAt(0).toUpperCase() + c.status.slice(1),
      tags: c.tags.join(", "),
      sourceType: c.sourceType || "",
      sourceDetail: c.sourceDetail || "",
      campaign: c.campaign || "",
      channel: c.channel || "",
      dateAcquired: c.dateAcquired || "",
    }));
    const csv = generateCsv(exportData, EXPORT_COLUMNS);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(rows: Record<string, string>[]): Promise<{ errors?: ImportRowError[] }> {
    const result = await dispatch(importClients(rows)).unwrap();
    if (result.errors && result.errors.length > 0) {
      return { errors: result.errors };
    }
    await dispatch(fetchClients());
    return {};
  }

  return (
    <>
      <div className="page-header" data-testid="clients-list-header">
        <h1 className="page-title">Clients</h1>
        <div className="clients-header-actions">
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
            data-testid="add-client-btn"
            onClick={onAddClient}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add New Client
          </button>
        </div>
      </div>

      <ImportDialog
        open={importOpen}
        title="Import Clients"
        columns={IMPORT_COLUMNS}
        onImport={handleImport}
        onClose={() => setImportOpen(false)}
        testId="import-dialog"
      />
    </>
  );
}
