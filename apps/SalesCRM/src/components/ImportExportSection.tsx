import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchClients, importClients } from "../clientsSlice";
import type { Client } from "../clientsSlice";
import { fetchDeals, importDeals } from "../dealsSlice";
import type { Deal } from "../dealsSlice";
import { fetchAllTasks } from "../tasksSlice";
import type { Task } from "../tasksSlice";
import { fetchContacts, importContacts } from "../contactsSlice";
import { ImportDialog, type ImportColumn, type ImportRowError } from "@shared/components/ImportDialog";
import { generateCsv } from "@shared/utils/csv";

const CLIENT_IMPORT_COLUMNS: ImportColumn[] = [
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

const CLIENT_EXPORT_COLUMNS = [
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

const DEAL_IMPORT_COLUMNS: ImportColumn[] = [
  { header: "Name", key: "Name", required: true, description: "Deal name" },
  { header: "Client Name", key: "Client Name", required: true, description: "Must match an existing client" },
  { header: "Value", key: "Value", required: false, description: "Numeric deal value" },
  { header: "Stage", key: "Stage", required: false, description: "Valid stage name (e.g., Lead, Qualified)" },
  { header: "Owner", key: "Owner", required: false, description: "Team member name" },
  { header: "Probability", key: "Probability", required: false, description: "Numeric 0-100" },
  { header: "Expected Close Date", key: "Expected Close Date", required: false, description: "Date format (YYYY-MM-DD)" },
  { header: "Status", key: "Status", required: false, description: "On Track/Needs Attention/At Risk/Won/Lost" },
];

const DEAL_EXPORT_COLUMNS = [
  { header: "Name", key: "name" },
  { header: "Client Name", key: "clientName" },
  { header: "Value", key: "value" },
  { header: "Stage", key: "stage" },
  { header: "Owner", key: "ownerName" },
  { header: "Probability", key: "probability" },
  { header: "Expected Close Date", key: "expectedCloseDate" },
  { header: "Status", key: "status" },
];

const TASK_IMPORT_COLUMNS: ImportColumn[] = [
  { header: "Title", key: "Title", required: true, description: "Task title" },
  { header: "Description", key: "Description", required: false, description: "Task description" },
  { header: "Due Date", key: "Due Date", required: false, description: "Date format (YYYY-MM-DD)" },
  { header: "Priority", key: "Priority", required: false, description: "High, Medium, Low, or Normal" },
  { header: "Client Name", key: "Client Name", required: false, description: "Must match an existing client" },
  { header: "Assignee", key: "Assignee", required: false, description: "Team member name" },
];

const TASK_EXPORT_COLUMNS = [
  { header: "Title", key: "title" },
  { header: "Description", key: "description" },
  { header: "Due Date", key: "dueDate" },
  { header: "Priority", key: "priority" },
  { header: "Status", key: "status" },
  { header: "Client", key: "clientName" },
  { header: "Assignee", key: "assigneeName" },
];

const CONTACT_IMPORT_COLUMNS: ImportColumn[] = [
  { header: "Name", key: "Name", required: true, description: "Contact name" },
  { header: "Title", key: "Title", required: false, description: "Job title" },
  { header: "Email", key: "Email", required: false, description: "Email address" },
  { header: "Phone", key: "Phone", required: false, description: "Phone number" },
  { header: "Location", key: "Location", required: false, description: "Location (e.g., City, State)" },
  { header: "Client Name", key: "Client Name", required: false, description: "Associates with an existing client by name" },
];

type ImportType = "clients" | "deals" | "tasks" | "contacts" | null;

interface TasksSliceState {
  items: Task[];
}

export function ImportExportSection() {
  const [importType, setImportType] = useState<ImportType>(null);
  const dispatch = useDispatch<AppDispatch>();
  const clients = useSelector((state: RootState) => state.clients.items) as Client[];
  const deals = useSelector((state: RootState) => (state as unknown as { deals: { items: Deal[] } }).deals.items);
  const tasks = useSelector((state: RootState) => (state as unknown as { tasks: TasksSliceState }).tasks.items);
  function getImportConfig() {
    switch (importType) {
      case "clients":
        return { title: "Import Clients", columns: CLIENT_IMPORT_COLUMNS };
      case "deals":
        return { title: "Import Deals", columns: DEAL_IMPORT_COLUMNS };
      case "tasks":
        return { title: "Import Tasks", columns: TASK_IMPORT_COLUMNS };
      case "contacts":
        return { title: "Import Contacts", columns: CONTACT_IMPORT_COLUMNS };
      default:
        return null;
    }
  }

  async function handleImport(rows: Record<string, string>[]): Promise<{ errors?: ImportRowError[] }> {
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    switch (importType) {
      case "clients": {
        const result = await dispatch(importClients(rows)).unwrap();
        if (result.errors && result.errors.length > 0) return { errors: result.errors };
        await dispatch(fetchClients());
        return {};
      }
      case "deals": {
        const result = await dispatch(importDeals(rows)).unwrap();
        if (result.errors && result.errors.length > 0) return { errors: result.errors };
        await dispatch(fetchDeals());
        return {};
      }
      case "tasks": {
        const resp = await fetch("/.netlify/functions/tasks/import", {
          method: "POST",
          headers,
          body: JSON.stringify({ rows }),
        });
        const data = await resp.json();
        if (data.errors && data.errors.length > 0) return { errors: data.errors };
        await dispatch(fetchAllTasks());
        return {};
      }
      case "contacts": {
        const result = await dispatch(importContacts(rows)).unwrap();
        if (result.errors && result.errors.length > 0) return { errors: result.errors };
        await dispatch(fetchContacts());
        return {};
      }
      default:
        return {};
    }
  }

  function downloadCsv(filename: string, csvContent: string) {
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportClients() {
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
    downloadCsv("clients.csv", generateCsv(exportData, CLIENT_EXPORT_COLUMNS));
  }

  function handleExportDeals() {
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
    downloadCsv("deals.csv", generateCsv(exportData, DEAL_EXPORT_COLUMNS));
  }

  function handleExportTasks() {
    const exportData = tasks.map((t) => ({
      title: t.title,
      description: t.description || "",
      dueDate: t.dueDate || "",
      priority: t.priority,
      status: t.status,
      clientName: t.clientName || "",
      assigneeName: t.assigneeName || "",
    }));
    downloadCsv("tasks.csv", generateCsv(exportData, TASK_EXPORT_COLUMNS));
  }

  const config = getImportConfig();

  return (
    <div className="settings-section" data-testid="import-export-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Import &amp; Export</h2>
      </div>

      <div className="settings-ie-grid">
        <div className="settings-ie-group">
          <h3 className="settings-ie-group-title">Import</h3>
          <div className="settings-ie-buttons">
            <button
              className="btn btn--secondary"
              data-testid="import-clients-btn"
              onClick={() => setImportType("clients")}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v9M3.5 6.5L7 10l3.5-3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Import Clients
            </button>
            <button
              className="btn btn--secondary"
              data-testid="import-deals-btn"
              onClick={() => setImportType("deals")}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v9M3.5 6.5L7 10l3.5-3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Import Deals
            </button>
            <button
              className="btn btn--secondary"
              data-testid="import-tasks-btn"
              onClick={() => setImportType("tasks")}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v9M3.5 6.5L7 10l3.5-3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Import Tasks
            </button>
            <button
              className="btn btn--secondary"
              data-testid="import-contacts-btn"
              onClick={() => setImportType("contacts")}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v9M3.5 6.5L7 10l3.5-3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Import Contacts
            </button>
          </div>
        </div>

        <div className="settings-ie-group">
          <h3 className="settings-ie-group-title">Export</h3>
          <div className="settings-ie-buttons">
            <button
              className="btn btn--secondary"
              data-testid="export-clients-btn"
              onClick={handleExportClients}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 10V1M3.5 4.5L7 1l3.5 3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export Clients
            </button>
            <button
              className="btn btn--secondary"
              data-testid="export-deals-btn"
              onClick={handleExportDeals}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 10V1M3.5 4.5L7 1l3.5 3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export Deals
            </button>
            <button
              className="btn btn--secondary"
              data-testid="export-tasks-btn"
              onClick={handleExportTasks}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 10V1M3.5 4.5L7 1l3.5 3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export Tasks
            </button>
          </div>
        </div>
      </div>

      {config && (
        <ImportDialog
          open={!!importType}
          title={config.title}
          columns={config.columns}
          onImport={handleImport}
          onClose={() => setImportType(null)}
          testId="import-dialog"
        />
      )}
    </div>
  );
}
