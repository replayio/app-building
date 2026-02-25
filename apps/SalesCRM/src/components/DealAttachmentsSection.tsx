import { useState, useRef } from "react";
import { useAppDispatch } from "../hooks";
import { uploadDealAttachment, deleteDealAttachment } from "../dealDetailSlice";
import type { DealAttachment } from "../dealDetailSlice";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIconClass(fileType: string | null, filename: string): string {
  if (fileType === "image") return "attachment-icon--image";
  if (fileType === "document") return "attachment-icon--document";
  if (fileType === "spreadsheet") return "attachment-icon--spreadsheet";
  if (fileType === "code") return "attachment-icon--code";
  if (fileType === "link") return "attachment-icon--link";

  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return "attachment-icon--image";
  if (["pdf", "doc", "docx", "txt"].includes(ext)) return "attachment-icon--document";
  if (["xls", "xlsx", "csv"].includes(ext)) return "attachment-icon--spreadsheet";
  return "attachment-icon--default";
}

function FileIcon({ fileType, filename }: { fileType: string | null; filename: string }) {
  const iconClass = getFileIconClass(fileType, filename);
  const isImage = iconClass === "attachment-icon--image";

  if (isImage) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2 13L6 9L9 12L12 9L16 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (iconClass === "attachment-icon--spreadsheet") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="2" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="1.2" />
        <line x1="2" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.2" />
        <line x1="7" y1="2" x2="7" y2="16" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 2H11L14 5V16H4V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 2V5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6" y1="9" x2="12" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

interface DealAttachmentsSectionProps {
  attachments: DealAttachment[];
  dealId: string;
  clientId: string;
}

export function DealAttachmentsSection({ attachments, dealId, clientId }: DealAttachmentsSectionProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      await dispatch(uploadDealAttachment({ file: selectedFile, clientId, dealId })).unwrap();
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch {
      // Keep modal open on error
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteDealAttachment(deleteTarget));
    setDeleteTarget(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="detail-section" data-testid="deal-attachments-section">
      <div className="detail-section-header">
        <h3 className="detail-section-title">Attachments</h3>
        <button
          className="attachment-action-btn"
          data-testid="deal-attachments-upload-btn"
          onClick={() => setShowUploadModal(true)}
          title="Upload attachment"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 12V14C3 14.5523 3.44772 15 4 15H14C14.5523 15 15 14.5523 15 14V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9 3V11M9 3L6 6M9 3L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="detail-section-body">
        {attachments.length === 0 ? (
          <div className="detail-section-empty" data-testid="deal-attachments-empty">No attachments</div>
        ) : (
          <div className="deal-attachments-list" data-testid="deal-attachments-list">
            {attachments.map((att) => (
              <div key={att.id} className="deal-attachment-row" data-testid={`deal-attachment-${att.id}`}>
                <div className={`attachment-icon ${getFileIconClass(att.fileType, att.filename)}`}>
                  <FileIcon fileType={att.fileType} filename={att.filename} />
                </div>
                <span className="deal-attachment-name" data-testid={`deal-attachment-name-${att.id}`}>
                  {att.filename}
                </span>
                {att.size != null && (
                  <span className="deal-attachment-size" data-testid={`deal-attachment-size-${att.id}`}>
                    ({formatFileSize(att.size)})
                  </span>
                )}
                <div className="deal-attachment-actions">
                  <a
                    href={att.url}
                    className="deal-attachment-link"
                    data-testid={`deal-attachment-download-${att.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    Download
                  </a>
                  <span className="deal-attachment-separator">|</span>
                  <button
                    className="deal-attachment-link deal-attachment-link--danger"
                    data-testid={`deal-attachment-delete-${att.id}`}
                    onClick={() => setDeleteTarget(att.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="modal-overlay" data-testid="deal-attachment-upload-modal" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Upload Attachment</h2>
              <button className="modal-close" onClick={() => setShowUploadModal(false)} type="button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div
                className="file-upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  data-testid="deal-attachment-file-input"
                />
                <div className="file-upload-label">
                  <strong>Click to browse</strong> or drag and drop a file
                </div>
                {selectedFile && (
                  <div className="file-upload-selected" data-testid="deal-attachment-selected-file">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn--secondary" onClick={() => setShowUploadModal(false)} type="button">
                Cancel
              </button>
              <button
                className="btn btn--primary"
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                type="button"
                data-testid="deal-attachment-upload-submit"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Attachment"
        message="Are you sure you want to delete this attachment? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
