import { useState } from 'react'
import { X } from 'lucide-react'

interface UploadAttachmentModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    filename: string
    type: string
    url: string
    size: number | null
  }) => void
}

export function UploadAttachmentModal({ open, onClose, onSave }: UploadAttachmentModalProps) {
  const [filename, setFilename] = useState('')
  const [type, setType] = useState<'document' | 'link'>('document')
  const [url, setUrl] = useState('')

  if (!open) return null

  function handleSave() {
    if (!filename.trim() || !url.trim()) return
    onSave({
      filename: filename.trim(),
      type,
      url: url.trim(),
      size: null,
    })
    setFilename('')
    setType('document')
    setUrl('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px] max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Upload Attachment</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3.5">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">File Name *</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g. Report.pdf"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'document' | 'link')}
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
            >
              <option value="document">Document</option>
              <option value="link">Link</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">
              {type === 'document' ? 'File URL *' : 'Link URL *'}
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={type === 'document' ? 'https://...' : 'https://example.com'}
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!filename.trim() || !url.trim()}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}
