import { useState, useRef } from "react";
import type { SupplierDocument } from "../slices/suppliersSlice";
import { formatDate } from "@shared/utils/date";
import "./DocumentsTab.css";

interface DocumentsTabProps {
  documents: SupplierDocument[];
  onUpload: (file: File, documentType: string) => Promise<void>;
  onDelete?: (documentId: string) => void;
}

const DOCUMENT_TYPES = ["Contract", "Certification", "Agreement", "Invoice", "Other"];

function getFileTypeIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) {
    return (
      <svg className="doc-card-icon doc-card-icon--pdf" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15h6" /><path d="M9 11h6" />
      </svg>
    );
  }
  if (["doc", "docx"].includes(ext)) {
    return (
      <svg className="doc-card-icon doc-card-icon--doc" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }
  if (["png", "jpg", "jpeg", "gif", "svg"].includes(ext)) {
    return (
      <svg className="doc-card-icon doc-card-icon--image" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    );
  }
  if (["csv", "xls", "xlsx"].includes(ext)) {
    return (
      <svg className="doc-card-icon doc-card-icon--spreadsheet" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><line x1="12" y1="9" x2="12" y2="21" />
      </svg>
    );
  }
  return (
    <svg className="doc-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export function DocumentsTab({ documents, onUpload, onDelete }: DocumentsTabProps) {
  const [search, setSearch] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("Contract");
  const [uploading, setUploading] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = search.trim()
    ? documents.filter((d) =>
        d.file_name.toLowerCase().includes(search.toLowerCase())
      )
    : documents;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setShowUploadDialog(true);
    }
    e.target.value = "";
  };

  const handleUploadConfirm = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      await onUpload(uploadFile, uploadType);
      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadType("Contract");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadCancel = () => {
    setShowUploadDialog(false);
    setUploadFile(null);
    setUploadType("Contract");
  };

  return (
    <div className="documents-tab" data-testid="documents-tab">
      <div className="documents-tab-header">
        <input
          type="text"
          className="form-input documents-tab-search"
          data-testid="documents-search"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="btn-primary"
          data-testid="upload-document-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="btn-label">Upload Document</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          data-testid="documents-file-input"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" data-testid="documents-empty">
          <p className="empty-state-message">
            {search.trim() ? "No documents match your search." : "No documents uploaded yet."}
          </p>
        </div>
      ) : (
        <div className="documents-card-grid" data-testid="documents-list">
          {filtered.map((doc) => (
            <div className="doc-card" key={doc.id} data-testid="document-card">
              <div className="doc-card-header">
                {getFileTypeIcon(doc.file_name)}
                <span className="doc-card-name" data-testid="document-name">{doc.file_name}</span>
              </div>
              <div className="doc-card-meta">
                <div className="doc-card-field">
                  <span className="doc-card-label">Type:</span>
                  <span className="doc-card-value" data-testid="document-type">{doc.document_type}</span>
                </div>
                <div className="doc-card-field">
                  <span className="doc-card-label">Upload Date:</span>
                  <span className="doc-card-value" data-testid="document-date">
                    {formatDate(doc.upload_date)}
                  </span>
                </div>
              </div>
              <div className="doc-card-actions">
                {doc.file_url && (
                  <button
                    className="btn-ghost"
                    data-testid="document-view-btn"
                    title="View"
                    onClick={() => window.open(doc.file_url, "_blank")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                )}
                {doc.file_url && (
                  <button
                    className="btn-ghost"
                    data-testid="document-download-btn"
                    title="Download"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = doc.file_url;
                      a.download = doc.file_name;
                      a.click();
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <button
                    className="btn-ghost doc-action-danger"
                    data-testid="document-delete-btn"
                    title="Delete"
                    onClick={() => onDelete(doc.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadDialog && (
        <div className="modal-overlay" data-testid="upload-document-modal" onClick={handleUploadCancel}>
          <div className="modal-content upload-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Upload Document</h2>
              <button className="modal-close-btn" data-testid="upload-document-modal-close" onClick={handleUploadCancel}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">File</label>
              <div className="upload-file-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>{uploadFile?.name}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Document Type</label>
              <div className="filter-select" style={{ position: "relative" }}>
                <button
                  className="filter-select-trigger"
                  data-testid="upload-document-type"
                  type="button"
                  onClick={() => setTypeOpen(!typeOpen)}
                >
                  <span className="filter-select-value">{uploadType}</span>
                  <svg className={`filter-select-chevron${typeOpen ? " filter-select-chevron--open" : ""}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {typeOpen && (
                  <div className="filter-select-dropdown" data-testid="upload-document-type-dropdown">
                    <div className="filter-select-options">
                      {DOCUMENT_TYPES.map((t) => (
                        <button
                          key={t}
                          className={`filter-select-option${t === uploadType ? " filter-select-option--selected" : ""}`}
                          data-testid={`upload-document-type-option-${t.toLowerCase()}`}
                          type="button"
                          onClick={() => {
                            setUploadType(t);
                            setTypeOpen(false);
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {/* Tests: Upload Document Dialog Cancel Does Not Upload */}
              <button className="btn-secondary" data-testid="upload-document-cancel" onClick={handleUploadCancel}>
                Cancel
              </button>
              <button className="btn-primary" data-testid="upload-document-confirm" onClick={handleUploadConfirm} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
