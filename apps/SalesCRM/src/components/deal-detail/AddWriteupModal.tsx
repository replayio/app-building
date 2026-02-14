import { useState } from 'react'
import { X } from 'lucide-react'

interface AddWriteupModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { title: string; content: string; author: string }) => void
}

export function AddWriteupModal({ open, onClose, onSave }: AddWriteupModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')

  if (!open) return null

  function handleSave() {
    if (!title.trim() || !content.trim()) return
    onSave({
      title: title.trim(),
      content: content.trim(),
      author: author.trim() || 'System',
    })
    setTitle('')
    setContent('')
    setAuthor('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div data-testid="add-writeup-modal" className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[520px] max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">New Writeup</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3.5">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Title *</label>
            <input
              data-testid="add-writeup-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Writeup title"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Content *</label>
            <textarea
              data-testid="add-writeup-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your analysis, notes, or strategy..."
              rows={6}
              className="w-full px-3 py-2 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent resize-none"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Author</label>
            <input
              data-testid="add-writeup-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button
            data-testid="add-writeup-cancel"
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            data-testid="add-writeup-save"
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
