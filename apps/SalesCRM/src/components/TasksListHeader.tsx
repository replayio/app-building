import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchAllTasks } from "../tasksSlice";
import type { Task } from "../tasksSlice";
import { ImportDialog, type ImportColumn, type ImportRowError } from "@shared/components/ImportDialog";
import { generateCsv } from "@shared/utils/csv";

const IMPORT_COLUMNS: ImportColumn[] = [
  { header: "Title", key: "Title", required: true, description: "Task title" },
  { header: "Description", key: "Description", required: false, description: "Task description" },
  { header: "Due Date", key: "Due Date", required: false, description: "Date format (YYYY-MM-DD)" },
  { header: "Priority", key: "Priority", required: false, description: "High, Medium, Low, or Normal" },
  { header: "Client Name", key: "Client Name", required: false, description: "Must match an existing client" },
  { header: "Assignee", key: "Assignee", required: false, description: "Team member name" },
];

const EXPORT_COLUMNS = [
  { header: "Title", key: "title" },
  { header: "Description", key: "description" },
  { header: "Due Date", key: "dueDate" },
  { header: "Priority", key: "priority" },
  { header: "Status", key: "status" },
  { header: "Client", key: "clientName" },
  { header: "Assignee", key: "assigneeName" },
];

interface TasksListHeaderProps {
  onCreateTask: () => void;
}

interface TasksSliceState {
  items: Task[];
}

export function TasksListHeader({ onCreateTask }: TasksListHeaderProps) {
  const [importOpen, setImportOpen] = useState(false);
  const tasks = useSelector((state: RootState) => (state as unknown as { tasks: TasksSliceState }).tasks.items);
  const dispatch = useDispatch<AppDispatch>();

  function handleExport() {
    const exportData = tasks.map((t) => ({
      title: t.title,
      description: t.description || "",
      dueDate: t.dueDate || "",
      priority: t.priority,
      status: t.status,
      clientName: t.clientName || "",
      assigneeName: t.assigneeName || "",
    }));
    const csv = generateCsv(exportData, EXPORT_COLUMNS);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(rows: Record<string, string>[]): Promise<{ errors?: ImportRowError[] }> {
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const resp = await fetch("/.netlify/functions/tasks/import", {
      method: "POST",
      headers,
      body: JSON.stringify({ rows }),
    });
    const data = await resp.json();
    if (data.errors && data.errors.length > 0) {
      return { errors: data.errors };
    }
    await dispatch(fetchAllTasks());
    return {};
  }

  return (
    <>
      <div className="page-header" data-testid="tasks-list-header">
        <div>
          <h1 className="page-title">Upcoming Tasks</h1>
        </div>
        <div className="tasks-header-actions">
          <button
            className="btn btn--secondary"
            data-testid="import-btn"
            onClick={() => setImportOpen(true)}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v9M3.5 6.5L7 10l3.5-3.5M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="max-sm:hidden">Import</span>
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
            <span className="max-sm:hidden">Export</span>
          </button>
          <button
            className="btn btn--primary"
            data-testid="new-task-btn"
            onClick={onCreateTask}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="max-sm:hidden">New Task</span>
          </button>
        </div>
      </div>

      <ImportDialog
        open={importOpen}
        title="Import Tasks"
        columns={IMPORT_COLUMNS}
        onImport={handleImport}
        onClose={() => setImportOpen(false)}
        testId="import-dialog"
      />
    </>
  );
}
