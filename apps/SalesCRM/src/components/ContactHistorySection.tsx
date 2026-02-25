import { useState } from "react";
import { useAppDispatch } from "../hooks";
import {
  createContactHistoryEntry,
  updateContactHistoryEntry,
  fetchContactHistory,
  type ContactHistoryItem,
} from "../personDetailSlice";
import { FilterSelect } from "@shared/components/FilterSelect";

interface ContactHistorySectionProps {
  contactHistory: ContactHistoryItem[];
  individualId: string;
}

const CONTACT_TYPES = [
  { value: "call", label: "Video Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting (In-person)" },
  { value: "note", label: "Note" },
];

function formatContactType(type: string): string {
  const found = CONTACT_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ContactHistorySection({
  contactHistory,
  individualId,
}: ContactHistorySectionProps) {
  const dispatch = useAppDispatch();
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add form state
  const [addType, setAddType] = useState("call");
  const [addSummary, setAddSummary] = useState("");
  const [addDate, setAddDate] = useState("");
  const [addPerformedBy, setAddPerformedBy] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit form state
  const [editType, setEditType] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPerformedBy, setEditPerformedBy] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const filtered = filterType
    ? contactHistory.filter((e) => e.type === filterType)
    : contactHistory;

  const filterOptions = [
    { value: "", label: "All Types" },
    ...CONTACT_TYPES.map((t) => ({ value: t.value, label: t.label })),
  ];

  const handleAdd = async () => {
    if (!addSummary.trim()) {
      setAddError("Summary is required");
      return;
    }
    setAddSaving(true);
    setAddError("");
    try {
      await dispatch(
        createContactHistoryEntry({
          individualId,
          type: addType,
          summary: addSummary.trim(),
          contactDate: addDate || new Date().toISOString(),
          performedBy: addPerformedBy.trim() || "System",
        })
      ).unwrap();
      setShowAddModal(false);
      setAddType("call");
      setAddSummary("");
      setAddDate("");
      setAddPerformedBy("");
    } catch {
      setAddError("Failed to create entry");
    } finally {
      setAddSaving(false);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddType("call");
    setAddSummary("");
    setAddDate("");
    setAddPerformedBy("");
    setAddError("");
  };

  const startEdit = (entry: ContactHistoryItem) => {
    setEditingId(entry.id);
    setEditType(entry.type);
    setEditSummary(entry.summary);
    setEditDate(new Date(entry.contactDate).toISOString().slice(0, 16));
    setEditPerformedBy(entry.performedBy);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setEditSaving(true);
    try {
      await dispatch(
        updateContactHistoryEntry({
          entryId: editingId,
          data: {
            type: editType,
            summary: editSummary.trim(),
            contactDate: editDate ? new Date(editDate).toISOString() : undefined,
            performedBy: editPerformedBy.trim() || undefined,
          },
        })
      ).unwrap();
      await dispatch(fetchContactHistory(individualId));
      setEditingId(null);
    } finally {
      setEditSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="detail-section" data-testid="contact-history-section">
      <div className="detail-section-header">
        <div className="detail-section-header-left">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="section-icon">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 4.5V8L10.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="detail-section-title">History of Contact</h3>
        </div>
        <div className="detail-section-header-actions">
          <button
            className="btn btn--secondary btn--sm"
            data-testid="contact-history-filter-btn"
            onClick={() => setShowFilter(!showFilter)}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1.5 2.5H12.5L8.5 7.5V11.5L5.5 10.5V7.5L1.5 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            Filter
          </button>
          <button
            className="btn btn--primary btn--sm"
            data-testid="add-contact-history-btn"
            onClick={() => setShowAddModal(true)}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Entry
          </button>
        </div>
      </div>

      {showFilter && (
        <div className="detail-section-filter" data-testid="contact-history-filter-controls">
          <FilterSelect
            options={filterOptions}
            value={filterType}
            onChange={setFilterType}
            placeholder="Filter by type"
            testId="contact-history-type-filter"
          />
        </div>
      )}

      <div className="detail-section-body">
        {filtered.length === 0 ? (
          <p className="detail-section-empty" data-testid="contact-history-empty">
            No contact history
          </p>
        ) : (
          <div className="contact-history-list" data-testid="contact-history-list">
            {filtered.map((entry) =>
              editingId === entry.id ? (
                <div key={entry.id} className="contact-history-edit" data-testid="contact-history-edit">
                  <div className="form-group">
                    <label className="form-label">Date/Time</label>
                    <input
                      className="form-input"
                      data-testid="edit-contact-date"
                      type="datetime-local"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <FilterSelect
                      options={CONTACT_TYPES}
                      value={editType}
                      onChange={setEditType}
                      testId="edit-contact-type"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Summary</label>
                    <textarea
                      className="form-input form-textarea"
                      data-testid="edit-contact-summary"
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Team Member</label>
                    <input
                      className="form-input"
                      data-testid="edit-contact-performed-by"
                      value={editPerformedBy}
                      onChange={(e) => setEditPerformedBy(e.target.value)}
                    />
                  </div>
                  <div className="contact-history-edit-actions">
                    <button
                      className="btn btn--secondary"
                      data-testid="edit-contact-cancel"
                      onClick={handleCancelEdit}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn--primary"
                      data-testid="edit-contact-save"
                      onClick={handleSaveEdit}
                      disabled={editSaving}
                      type="button"
                    >
                      {editSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div key={entry.id} className="contact-history-item" data-testid="contact-history-item">
                  <div className="contact-history-item-content">
                    <div className="contact-history-item-header">
                      <span className="contact-history-date" data-testid="contact-history-date">
                        {formatDate(entry.contactDate)}
                      </span>
                      <span className="contact-history-type-badge" data-testid="contact-history-type">
                        {formatContactType(entry.type)}
                      </span>
                    </div>
                    <div className="contact-history-summary" data-testid="contact-history-summary">
                      Summary: {entry.summary}
                    </div>
                    <div className="contact-history-performer" data-testid="contact-history-performer">
                      Team Member: {entry.performedBy === "System" ? "System (Auto-logged)" : entry.performedBy}
                    </div>
                  </div>
                  <button
                    className="contact-history-edit-btn"
                    data-testid={`contact-history-edit-${entry.id}`}
                    onClick={() => startEdit(entry)}
                    type="button"
                    title="Edit entry"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M10 1.5L12.5 4L4.5 12H2V9.5L10 1.5Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" data-testid="add-contact-history-modal" onClick={handleCloseAddModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Contact History Entry</h2>
              <button className="modal-close" onClick={handleCloseAddModal} type="button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {addError && <div className="modal-error">{addError}</div>}
              <div className="form-group">
                <label className="form-label">Date/Time</label>
                <input
                  className="form-input"
                  data-testid="add-contact-date"
                  type="datetime-local"
                  value={addDate}
                  onChange={(e) => setAddDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <FilterSelect
                  options={CONTACT_TYPES}
                  value={addType}
                  onChange={setAddType}
                  testId="add-contact-type"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Summary</label>
                <textarea
                  className="form-input form-textarea"
                  data-testid="add-contact-summary"
                  placeholder="Describe the interaction..."
                  value={addSummary}
                  onChange={(e) => setAddSummary(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Team Member(s)</label>
                <input
                  className="form-input"
                  data-testid="add-contact-performed-by"
                  placeholder="e.g., Michael B. (Sales Lead)"
                  value={addPerformedBy}
                  onChange={(e) => setAddPerformedBy(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn--secondary"
                data-testid="add-contact-cancel"
                onClick={handleCloseAddModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                data-testid="add-contact-submit"
                onClick={handleAdd}
                disabled={addSaving || !addSummary.trim()}
                type="button"
              >
                {addSaving ? "Saving..." : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
