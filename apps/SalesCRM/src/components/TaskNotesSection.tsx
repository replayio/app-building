import { useState } from "react";
import { useAppDispatch } from "../hooks";
import { addTaskNote, deleteTaskNote } from "../taskDetailSlice";
import type { TaskNote } from "../taskDetailSlice";

function formatNoteDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface TaskNotesSectionProps {
  taskId: string;
  notes: TaskNote[];
}

export function TaskNotesSection({ taskId, notes }: TaskNotesSectionProps) {
  const dispatch = useAppDispatch();
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSubmitting(true);
    await dispatch(addTaskNote({ taskId, content: noteText.trim() }));
    setNoteText("");
    setSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    await dispatch(deleteTaskNote(noteId));
  };

  return (
    <div className="detail-section" data-testid="task-notes-section">
      <div className="detail-section-header">
        <div className="detail-section-header-left">
          <svg className="section-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3h10v10H3V3zm2 3h6M5 8h6M5 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="detail-section-title">Notes</span>
          {notes.length > 0 && (
            <span className="detail-section-subtitle">({notes.length})</span>
          )}
        </div>
      </div>
      <div className="detail-section-body">
        <div className="task-notes-input-row" data-testid="task-notes-input-row">
          <textarea
            className="form-input form-textarea task-notes-textarea"
            data-testid="task-note-input"
            placeholder="Add a note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <button
            className="btn btn--primary btn--sm"
            data-testid="add-note-btn"
            onClick={handleAddNote}
            disabled={!noteText.trim() || submitting}
            type="button"
          >
            Add Note
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="detail-section-empty" data-testid="task-notes-empty">
            No notes yet
          </div>
        ) : (
          <div className="task-notes-list" data-testid="task-notes-list">
            {notes.map((note) => (
              <div key={note.id} className="task-note-item" data-testid="task-note-item">
                <div className="task-note-content">
                  <p className="task-note-text" data-testid="task-note-text">{note.content}</p>
                  <div className="task-note-meta">
                    <span className="task-note-author">{note.createdBy}</span>
                    <span className="task-note-separator">·</span>
                    <span className="task-note-date">{formatNoteDate(note.createdAt)}</span>
                  </div>
                </div>
                <button
                  className="task-note-delete-btn"
                  data-testid="delete-note-btn"
                  onClick={() => handleDeleteNote(note.id)}
                  title="Delete note"
                  type="button"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 4h9M5.5 4V2.5h3V4M5.5 6.5v3M8.5 6.5v3M3.5 4l.5 7.5h6l.5-7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
