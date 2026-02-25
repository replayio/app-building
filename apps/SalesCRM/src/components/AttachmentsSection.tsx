import { useState } from "react";
import { useAppDispatch } from "../hooks";
import { deleteAttachment, type AttachmentItem } from "../clientDetailSlice";
import { ConfirmDialog } from "@shared/components/ConfirmDialog";

interface AttachmentsSectionProps {
  attachments: AttachmentItem[];
}

function getFileIcon(fileType: string | null): React.ReactElement {
  switch (fileType) {
    case "document":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 2H11L14 5V16H4V2Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 2V5H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 9H11M7 12H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "image":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="6.5" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2 13L6 9L10 13L13 10L16 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "spreadsheet":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2 6H16M2 10H16M2 14H16M6 2V16M10 2V16" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      );
    case "code":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M6 5L2 9L6 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 5L16 9L12 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 3L8 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "link":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M7.5 10.5L10.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M6 12L4 14C3 15 3 15 4 16C5 17 5 17 6 16L8 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 6L14 4C15 3 15 3 14 2C13 1 13 1 12 2L10 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 2H11L14 5V16H4V2Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 2V5H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function getIconClass(fileType: string | null): string {
  switch (fileType) {
    case "document": return "attachment-icon--document";
    case "image": return "attachment-icon--image";
    case "spreadsheet": return "attachment-icon--spreadsheet";
    case "code": return "attachment-icon--code";
    case "link": return "attachment-icon--link";
    default: return "attachment-icon--default";
  }
}

function isImageFile(fileType: string | null): boolean {
  return fileType === "image";
}

export function AttachmentsSection({ attachments }: AttachmentsSectionProps) {
  const dispatch = useAppDispatch();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteAttachment(deleteTarget)).unwrap();
    setDeleteTarget(null);
  };

  return (
    <div className="detail-section" data-testid="attachments-section">
      <div className="detail-section-header">
        <h3 className="detail-section-title">Attachments</h3>
      </div>
      <div className="detail-section-body">
        {attachments.length === 0 ? (
          <p className="detail-section-empty" data-testid="attachments-empty">
            No attachments
          </p>
        ) : (
          attachments.map((att) => (
            <div key={att.id} className="attachment-item" data-testid="attachment-item">
              {isImageFile(att.fileType) ? (
                <img
                  src={att.url}
                  alt={att.filename}
                  className="attachment-thumbnail"
                  data-testid="attachment-thumbnail"
                />
              ) : (
                <div className={`attachment-icon ${getIconClass(att.fileType)}`} data-testid="attachment-icon">
                  {getFileIcon(att.fileType)}
                </div>
              )}
              <div className="attachment-info">
                <div className="attachment-name" data-testid="attachment-name">
                  {att.filename}
                </div>
                <div className="attachment-meta">
                  <span data-testid="attachment-type">
                    {att.fileType === "link" ? "Link" : att.fileType ? att.fileType.charAt(0).toUpperCase() + att.fileType.slice(1) : "Document"}
                  </span>
                  <span data-testid="attachment-date">
                    Created: {new Date(att.createdAt).toLocaleDateString()}
                  </span>
                  <span data-testid="attachment-deal">
                    Linked Deal: {att.dealName || "None"}
                  </span>
                </div>
              </div>
              <div className="attachment-actions">
                {att.fileType === "link" ? (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachment-action-btn"
                    data-testid="attachment-view-btn"
                    title="View link"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8C1 8 4 3 8 3C12 3 15 8 15 8C15 8 12 13 8 13C4 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </a>
                ) : (
                  <a
                    href={att.url}
                    download={att.filename}
                    className="attachment-action-btn"
                    data-testid="attachment-download-btn"
                    title="Download"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 12H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </a>
                )}
                <button
                  className="attachment-action-btn attachment-action-btn--danger"
                  data-testid="attachment-delete-btn"
                  onClick={() => setDeleteTarget(att.id)}
                  type="button"
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 4H13M6 4V3C6 2.45 6.45 2 7 2H9C9.55 2 10 2.45 10 3V4M5 4V13C5 13.55 5.45 14 6 14H10C10.55 14 11 13.55 11 13V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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
