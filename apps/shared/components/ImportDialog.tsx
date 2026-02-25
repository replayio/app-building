import { useState, useRef } from "react";
import { parseCsvWithHeaders, generateCsvTemplate } from "../utils/csv";
import "./ImportDialog.css";

export interface ImportColumn {
  header: string;
  key: string;
  required?: boolean;
  description?: string;
}

export interface ImportRowError {
  row: number;
  errors: string[];
}

export interface ImportDialogProps {
  open: boolean;
  title: string;
  columns: ImportColumn[];
  onImport: (rows: Record<string, string>[]) => Promise<{ errors?: ImportRowError[] }>;
  onClose: () => void;
  testId?: string;
}

export function ImportDialog({
  open,
  title,
  columns,
  onImport,
  onClose,
  testId,
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [rowErrors, setRowErrors] = useState<ImportRowError[]>([]);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [importCount, setImportCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function handleDownloadTemplate() {
    const csv = generateCsvTemplate(columns);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setRowErrors([]);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { rows } = parseCsvWithHeaders(text);
      setParsedRows(rows);
      setStep("preview");
    };
    reader.readAsText(selected);
  }

  async function handleImport() {
    setImporting(true);
    setRowErrors([]);
    try {
      const result = await onImport(parsedRows);
      if (result.errors && result.errors.length > 0) {
        setRowErrors(result.errors);
      } else {
        setImportCount(parsedRows.length);
        setStep("done");
      }
    } finally {
      setImporting(false);
    }
  }

  function handleClose() {
    setFile(null);
    setParsedRows([]);
    setRowErrors([]);
    setStep("upload");
    setImportCount(0);
    onClose();
  }

  return (
    <div
      className="import-dialog-overlay"
      data-testid={testId ? `${testId}-overlay` : "import-dialog-overlay"}
      onClick={handleClose}
    >
      <div
        className="import-dialog"
        data-testid={testId || "import-dialog"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="import-dialog-header">
          <h3 className="import-dialog-title">{title}</h3>
          <button
            className="import-dialog-close"
            data-testid={testId ? `${testId}-close` : "import-dialog-close"}
            onClick={handleClose}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M11 3L3 11M3 3L11 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="import-dialog-body">
          {step === "upload" && (
            <>
              <div className="import-dialog-section">
                <h4 className="import-dialog-section-title">CSV Column Format</h4>
                <table className="import-dialog-spec-table" data-testid="import-column-spec">
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((col) => (
                      <tr key={col.key}>
                        <td>{col.header}</td>
                        <td>{col.required ? "Yes" : "No"}</td>
                        <td>{col.description || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="import-dialog-actions-row">
                <button
                  className="btn btn--secondary"
                  data-testid="import-download-template"
                  onClick={handleDownloadTemplate}
                  type="button"
                >
                  Download CSV Template
                </button>
              </div>

              <div className="import-dialog-upload">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  data-testid="import-file-input"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <button
                  className="btn btn--primary"
                  data-testid="import-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  Choose CSV File
                </button>
                {file && (
                  <span className="import-dialog-filename">{file.name}</span>
                )}
              </div>
            </>
          )}

          {step === "preview" && (
            <>
              <p className="import-dialog-preview-info">
                Found {parsedRows.length} row{parsedRows.length !== 1 ? "s" : ""} to import
                {file ? ` from ${file.name}` : ""}.
              </p>

              {rowErrors.length > 0 && (
                <div className="import-dialog-errors" data-testid="import-errors">
                  <h4 className="import-dialog-errors-title">Validation Errors</h4>
                  <ul className="import-dialog-errors-list">
                    {rowErrors.map((re) => (
                      <li key={re.row}>
                        <strong>Row {re.row}:</strong> {re.errors.join("; ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="import-dialog-footer">
                <button
                  className="btn btn--secondary"
                  onClick={() => {
                    setStep("upload");
                    setFile(null);
                    setParsedRows([]);
                    setRowErrors([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  type="button"
                >
                  Back
                </button>
                <button
                  className="btn btn--primary"
                  data-testid="import-confirm-btn"
                  disabled={importing || parsedRows.length === 0}
                  onClick={handleImport}
                  type="button"
                >
                  {importing ? "Importing..." : `Import ${parsedRows.length} Row${parsedRows.length !== 1 ? "s" : ""}`}
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <>
              <p className="import-dialog-success" data-testid="import-success">
                Successfully imported {importCount} row{importCount !== 1 ? "s" : ""}.
              </p>
              <div className="import-dialog-footer">
                <button
                  className="btn btn--primary"
                  data-testid="import-done-btn"
                  onClick={handleClose}
                  type="button"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
