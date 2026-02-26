import { useState } from "react";
import { useAppDispatch } from "../hooks";
import { createWriteup, updateWriteup, fetchWriteupVersions } from "../dealDetailSlice";
import type { Writeup, WriteupVersion } from "../dealDetailSlice";

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    ", " + date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

interface WriteupsSectionProps {
  writeups: Writeup[];
  dealId: string;
}

export function WriteupsSection({ writeups, dealId }: WriteupsSectionProps) {
  const dispatch = useAppDispatch();

  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const [versionsId, setVersionsId] = useState<string | null>(null);
  const [versions, setVersions] = useState<WriteupVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const handleCreate = async () => {
    if (!createTitle.trim()) {
      setCreateError("Title is required");
      return;
    }
    if (!createContent.trim()) {
      setCreateError("Content is required");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      await dispatch(createWriteup({ dealId, title: createTitle.trim(), content: createContent.trim() })).unwrap();
      setShowCreate(false);
      setCreateTitle("");
      setCreateContent("");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create writeup");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (writeup: Writeup) => {
    setEditingId(writeup.id);
    setEditTitle(writeup.title);
    setEditContent(writeup.content);
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await dispatch(updateWriteup({ writeupId: editingId, data: { title: editTitle, content: editContent } })).unwrap();
      setEditingId(null);
    } catch {
      // Keep editing on error
    } finally {
      setSaving(false);
    }
  };

  const handleShowVersions = async (writeupId: string) => {
    setVersionsId(writeupId);
    setLoadingVersions(true);
    try {
      const result = await dispatch(fetchWriteupVersions(writeupId)).unwrap();
      setVersions(result);
    } catch {
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  return (
    <div className="detail-section" data-testid="writeups-section">
      <div className="detail-section-header">
        <h3 className="detail-section-title">Writeups</h3>
        <button
          className="btn btn--secondary btn--sm"
          data-testid="writeups-new-entry-btn"
          onClick={() => setShowCreate(true)}
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 4 }}>
            <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          + New Entry
        </button>
      </div>
      <div className="detail-section-body">
        {writeups.length === 0 && !showCreate ? (
          <div className="detail-section-empty" data-testid="writeups-empty">No writeups</div>
        ) : (
          <div className="writeups-list" data-testid="writeups-list">
            {writeups.map((writeup) => (
              <div key={writeup.id} className="writeup-card" data-testid={`writeup-card-${writeup.id}`}>
                {editingId === writeup.id ? (
                  <div className="writeup-edit-form">
                    <input
                      className="form-input"
                      data-testid="writeup-edit-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title"
                    />
                    <textarea
                      className="form-input form-textarea"
                      data-testid="writeup-edit-content"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      placeholder="Content"
                    />
                    <div className="writeup-edit-actions">
                      <button className="btn btn--secondary btn--sm" data-testid="writeup-edit-cancel" onClick={() => setEditingId(null)} type="button">
                        Cancel
                      </button>
                      <button className="btn btn--primary btn--sm" data-testid="writeup-edit-save" onClick={handleEditSave} disabled={saving} type="button">
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="writeup-card-header">
                      <strong className="writeup-card-title" data-testid={`writeup-title-${writeup.id}`}>
                        {writeup.title}
                      </strong>
                      <span className="writeup-card-meta">
                        - {formatShortDate(writeup.createdAt)} ({writeup.author})
                      </span>
                    </div>
                    <div className="writeup-card-content" data-testid={`writeup-content-${writeup.id}`}>
                      {writeup.content}
                    </div>
                    <div className="writeup-card-actions">
                      <button
                        className="writeup-action-btn"
                        data-testid={`writeup-edit-btn-${writeup.id}`}
                        onClick={() => handleEdit(writeup)}
                        title="Edit"
                        type="button"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M8.5 2.5L11.5 5.5M1 13L1.5 10.5L10 2L12 4L3.5 12.5L1 13Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        className="writeup-action-btn"
                        data-testid={`writeup-versions-btn-${writeup.id}`}
                        onClick={() => handleShowVersions(writeup.id)}
                        title="Version History"
                        type="button"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M7 4V7.5L9.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {showCreate && (
          <div className="modal-overlay" data-testid="writeup-create-modal" onClick={() => setShowCreate(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">New Writeup</h2>
                <button className="modal-close" onClick={() => setShowCreate(false)} type="button">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                {createError && <div className="modal-error" data-testid="writeup-create-error">{createError}</div>}
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    className="form-input"
                    data-testid="writeup-create-title"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Content *</label>
                  <textarea
                    className="form-input form-textarea"
                    data-testid="writeup-create-content"
                    value={createContent}
                    onChange={(e) => setCreateContent(e.target.value)}
                    rows={5}
                    placeholder="Enter content"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn--secondary" onClick={() => setShowCreate(false)} type="button">
                  Cancel
                </button>
                <button className="btn btn--primary" onClick={handleCreate} disabled={creating} type="button" data-testid="writeup-create-submit">
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {versionsId && (
          <div className="modal-overlay" data-testid="writeup-versions-modal" onClick={() => setVersionsId(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Version History</h2>
                <button className="modal-close" onClick={() => setVersionsId(null)} type="button">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                {loadingVersions ? (
                  <div className="detail-section-empty">Loading...</div>
                ) : versions.length === 0 ? (
                  <div className="detail-section-empty">No versions found</div>
                ) : (
                  <div className="writeup-versions-list" data-testid="writeup-versions-list">
                    {versions.map((v) => (
                      <div key={v.id} className="writeup-version-entry" data-testid={`writeup-version-${v.id}`}>
                        <div className="writeup-version-header">
                          <strong>{v.title}</strong>
                          <span className="writeup-version-meta">
                            {formatFullDate(v.createdAt)} — {v.author}
                          </span>
                        </div>
                        <div className="writeup-version-content">{v.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn--secondary" onClick={() => setVersionsId(null)} type="button">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
