import { useState, useRef } from "react";
import { useAppDispatch } from "../hooks";
import { createAttachmentLink, uploadAttachmentFile, type DealItem } from "../clientDetailSlice";
import { FilterSelect } from "@shared/components/FilterSelect";

interface AddAttachmentModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  deals: DealItem[];
}

type AttachmentMode = "file" | "link";

export function AddAttachmentModal({ open, onClose, clientId, deals }: AddAttachmentModalProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<AttachmentMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [dealId, setDealId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (mode === "file") {
      if (!file) {
        setError("Please select a file to upload");
        return;
      }
      setSaving(true);
      setError("");
      try {
        await dispatch(
          uploadAttachmentFile({
            file,
            clientId,
            dealId: dealId || undefined,
          })
        ).unwrap();
        resetAndClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload file");
      } finally {
        setSaving(false);
      }
    } else {
      if (!linkUrl.trim()) {
        setError("URL is required");
        return;
      }
      setSaving(true);
      setError("");
      try {
        await dispatch(
          createAttachmentLink({
            filename: linkName.trim() || linkUrl.trim(),
            url: linkUrl.trim(),
            clientId,
            dealId: dealId || undefined,
          })
        ).unwrap();
        resetAndClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create link");
      } finally {
        setSaving(false);
      }
    }
  };

  const resetAndClose = () => {
    setMode("file");
    setFile(null);
    setLinkName("");
    setLinkUrl("");
    setDealId("");
    setError("");
    onClose();
  };

  const dealOptions = [
    { value: "", label: "None" },
    ...deals.map((d) => ({ value: d.id, label: d.name })),
  ];

  return (
    <div className="modal-overlay" data-testid="add-attachment-modal" onClick={resetAndClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Attachment</h2>
          <button className="modal-close" onClick={resetAndClose} type="button" data-testid="add-attachment-close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="modal-error" data-testid="add-attachment-error">{error}</div>}

          <div className="attachment-mode-toggle" data-testid="attachment-mode-toggle">
            <button
              className={`attachment-mode-btn ${mode === "file" ? "attachment-mode-btn--active" : ""}`}
              data-testid="attachment-mode-file"
              onClick={() => setMode("file")}
              type="button"
            >
              File Upload
            </button>
            <button
              className={`attachment-mode-btn ${mode === "link" ? "attachment-mode-btn--active" : ""}`}
              data-testid="attachment-mode-link"
              onClick={() => setMode("link")}
              type="button"
            >
              Link URL
            </button>
          </div>

          {mode === "file" ? (
            <>
              <div
                className="file-upload-area"
                data-testid="file-upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  data-testid="file-upload-input"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFile(f);
                  }}
                />
                <div className="file-upload-label">
                  <strong>Click to browse</strong> or drag and drop
                </div>
                {file && (
                  <div className="file-upload-selected" data-testid="file-upload-selected">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  className="form-input"
                  data-testid="add-attachment-link-name"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="e.g., Client Portal"
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL *</label>
                <input
                  className="form-input"
                  data-testid="add-attachment-link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Link to Deal (optional)</label>
            <FilterSelect
              options={dealOptions}
              value={dealId}
              onChange={setDealId}
              placeholder="Select a deal..."
              searchable
              testId="add-attachment-deal"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn--secondary"
            data-testid="add-attachment-cancel"
            onClick={resetAndClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn--primary"
            data-testid="add-attachment-submit"
            onClick={handleSubmit}
            disabled={saving}
            type="button"
          >
            {saving ? "Uploading..." : mode === "file" ? "Upload" : "Add Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
