import { useState } from "react";
import "./DocumentsSection.css";

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  date: string;
  url?: string;
  linkedEntity?: string;
}

interface DocumentsSectionProps {
  title: string;
  documents: DocumentItem[];
  onUpload: (file: File) => void;
  onView?: (doc: DocumentItem) => void;
  onDownload?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
  searchable?: boolean;
  uploadButtonLabel?: string;
  emptyMessage?: string;
  showLinkedEntity?: boolean;
  linkedEntityLabel?: string;
}

export function DocumentsSection({
  title,
  documents,
  onUpload,
  onView,
  onDownload,
  onDelete,
  searchable = true,
  uploadButtonLabel = "Upload",
  emptyMessage = "No documents yet.",
  showLinkedEntity = false,
  linkedEntityLabel = "Linked",
}: DocumentsSectionProps): React.ReactElement {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? documents.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.type.toLowerCase().includes(search.toLowerCase()),
      )
    : documents;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = "";
    }
  }

  return (
    <div className="documents-section" data-testid="documents-section">
      <div className="documents-section-header">
        <h3
          className="documents-section-title"
          data-testid="documents-section-title"
        >
          {title}
        </h3>
        <label className="btn btn--primary documents-upload-btn">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1V13M1 7H13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {uploadButtonLabel}
          <input
            type="file"
            data-testid="documents-upload-input"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {searchable && (
        <input
          type="text"
          className="form-input documents-search"
          data-testid="documents-search"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {filtered.length === 0 ? (
        <p className="documents-empty" data-testid="documents-empty">
          {search.trim() ? "No matching documents." : emptyMessage}
        </p>
      ) : (
        <table
          className="data-table documents-table"
          data-testid="documents-table"
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Date</th>
              {showLinkedEntity && <th>{linkedEntityLabel}</th>}
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => (
              <tr key={doc.id} data-testid="document-row">
                <td>
                  <span className="document-name" data-testid="document-name">
                    <svg
                      className="document-icon"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M8 1H3.5C2.67 1 2 1.67 2 2.5V11.5C2 12.33 2.67 13 3.5 13H10.5C11.33 13 12 12.33 12 11.5V5L8 1Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 1V5H12"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {doc.name}
                  </span>
                </td>
                <td>
                  <span className="badge badge--info">{doc.type}</span>
                </td>
                <td>{doc.date}</td>
                {showLinkedEntity && <td>{doc.linkedEntity || "—"}</td>}
                <td className="text-right">
                  <span className="document-actions">
                    {onView && (
                      <button
                        className="btn btn--ghost document-action-btn"
                        data-testid="document-view-btn"
                        onClick={() => onView(doc)}
                        title="View"
                        type="button"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M1 7C1 7 3 2.5 7 2.5C11 2.5 13 7 13 7C13 7 11 11.5 7 11.5C3 11.5 1 7 1 7Z"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="7"
                            cy="7"
                            r="2"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                        </svg>
                      </button>
                    )}
                    {onDownload && (
                      <button
                        className="btn btn--ghost document-action-btn"
                        data-testid="document-download-btn"
                        onClick={() => onDownload(doc)}
                        title="Download"
                        type="button"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M7 1V10M7 10L4 7M7 10L10 7M1 12H13"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn btn--ghost document-action-btn document-action-btn--danger"
                        data-testid="document-delete-btn"
                        onClick={() => onDelete(doc)}
                        title="Delete"
                        type="button"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M2 4H12M5 4V2.5C5 2.22 5.22 2 5.5 2H8.5C8.78 2 9 2.22 9 2.5V4M10.5 4V12C10.5 12.55 10.05 13 9.5 13H4.5C3.95 13 3.5 12.55 3.5 12V4"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
