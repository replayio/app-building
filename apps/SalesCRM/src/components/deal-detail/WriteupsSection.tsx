import { useState } from 'react'
import { FileText, Pencil, Clock, Plus, X, Check } from 'lucide-react'
import type { Writeup } from '../../types'

interface WriteupsSectionProps {
  writeups: Writeup[]
  onAddWriteup: () => void
  onEditWriteup: (writeupId: string, data: { title: string; content: string }) => void
  onViewVersions: (writeupId: string) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function WriteupsSection({ writeups, onAddWriteup, onEditWriteup, onViewVersions }: WriteupsSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  function startEdit(writeup: Writeup) {
    setEditingId(writeup.id)
    setEditTitle(writeup.title)
    setEditContent(writeup.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  function saveEdit() {
    if (!editingId || !editTitle.trim()) return
    onEditWriteup(editingId, { title: editTitle.trim(), content: editContent })
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  return (
    <div data-testid="deal-writeups-section" className="border border-border rounded-[6px] p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={14} strokeWidth={1.75} className="text-text-muted" />
          <h2 className="text-[14px] font-semibold text-text-primary">Writeups</h2>
        </div>
        <button
          data-testid="deal-writeups-add-button"
          onClick={onAddWriteup}
          className="inline-flex items-center gap-1 h-[28px] px-2.5 text-[12px] font-medium text-accent hover:bg-hover rounded-[4px] transition-colors duration-100"
        >
          <Plus size={14} strokeWidth={1.75} />
          New Entry
        </button>
      </div>

      {writeups.length === 0 ? (
        <div data-testid="deal-writeups-empty" className="text-[13px] text-text-muted py-2">No writeups yet</div>
      ) : (
        <div className="flex flex-col gap-2">
          {writeups.map((writeup) => (
            <div
              key={writeup.id}
              data-testid={`deal-writeup-${writeup.id}`}
              className="border border-border rounded-[4px] p-3"
            >
              {editingId === writeup.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    data-testid="deal-writeup-edit-title-input"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-[30px] px-2 text-[13px] font-medium text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
                  />
                  <textarea
                    data-testid="deal-writeup-edit-content-input"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="w-full px-2 py-1.5 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent resize-none"
                  />
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      data-testid="deal-writeup-edit-save-button"
                      onClick={saveEdit}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-status-active hover:bg-hover transition-colors duration-100"
                    >
                      <Check size={14} strokeWidth={1.75} />
                    </button>
                    <button
                      data-testid="deal-writeup-edit-cancel-button"
                      onClick={cancelEdit}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-status-churned hover:bg-hover transition-colors duration-100"
                    >
                      <X size={14} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="text-[13px] font-medium text-text-primary">{writeup.title}</span>
                      <div className="text-[12px] text-text-muted mt-0.5">
                        {formatDate(writeup.created_at)} · {writeup.author}
                        {writeup.version > 1 && (
                          <span className="ml-1">(v{writeup.version})</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        data-testid={`deal-writeup-edit-${writeup.id}`}
                        onClick={() => startEdit(writeup)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
                        title="Edit"
                      >
                        <Pencil size={13} strokeWidth={1.75} />
                      </button>
                      <button
                        data-testid={`deal-writeup-versions-${writeup.id}`}
                        onClick={() => onViewVersions(writeup.id)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
                        title="Version History"
                      >
                        <Clock size={13} strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[13px] text-text-secondary line-clamp-3">{writeup.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
