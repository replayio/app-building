import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { TaskNote } from '../../types'

interface TaskNotesSectionProps {
  notes: TaskNote[]
  onAddNote: (content: string) => Promise<void>
  onDeleteNote: (noteId: string) => void
}

export function TaskNotesSection({ notes, onAddNote, onDeleteNote }: TaskNotesSectionProps) {
  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!newNote.trim()) return
    setSaving(true)
    await onAddNote(newNote.trim())
    setNewNote('')
    setSaving(false)
  }

  return (
    <div className="border border-border rounded-[6px] p-4" data-testid="task-notes-section">
      <h2 className="text-[14px] font-semibold text-text-primary mb-3">Notes</h2>

      <div className="flex gap-2 mb-4 max-sm:flex-col">
        <textarea
          data-testid="task-note-input"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="flex-1 min-h-[60px] px-3 py-2 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] focus:outline-none focus:border-accent transition-colors duration-100 resize-none"
        />
        <button
          data-testid="task-note-add"
          onClick={handleAdd}
          disabled={!newNote.trim() || saving}
          className="self-end max-sm:self-start h-[30px] px-3 text-[12px] font-medium bg-accent text-white rounded-[5px] hover:opacity-90 disabled:opacity-50 transition-opacity duration-100"
        >
          Add
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-[13px] text-text-muted py-2" data-testid="task-notes-empty">No notes yet</div>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <div
              key={note.id}
              data-testid={`task-note-${note.id}`}
              className="flex gap-3 px-3 py-2.5 rounded-[4px] bg-hover"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-text-primary whitespace-pre-wrap break-words" data-testid={`task-note-content-${note.id}`}>
                  {note.content}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] text-text-muted" data-testid={`task-note-author-${note.id}`}>{note.author}</span>
                  <span className="text-[11px] text-text-muted" data-testid={`task-note-timestamp-${note.id}`}>
                    {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <button
                data-testid={`task-note-delete-${note.id}`}
                onClick={() => onDeleteNote(note.id)}
                className="self-start inline-flex items-center justify-center w-6 h-6 rounded-[4px] text-text-muted hover:text-status-churned hover:bg-surface transition-colors duration-100"
                title="Delete note"
              >
                <Trash2 size={12} strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
