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
  const [attachmentType, setAttachmentType] = useState<'document' | 'link'>('document')
  const [file, setFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkName, setLinkName] = useState('')

  if (!open) return null

  function handleSave() {
    if (attachmentType === 'document' && file) {
      const url = URL.createObjectURL(file)
      onSave({
        filename: file.name,
        type: 'document',
        url,
        size: file.size,
      })
    } else if (attachmentType === 'link' && linkUrl.trim()) {
      onSave({
        filename: linkName.trim() || linkUrl.trim(),
        type: 'link',
        url: linkUrl.trim(),
        size: null,
      })
    }
    setFile(null)
    setLinkUrl('')
    setLinkName('')
    setAttachmentType('document')
  }

  const canSave = (attachmentType === 'document' && file !== null) || (attachmentType === 'link' && linkUrl.trim() !== '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div data-testid="upload-attachment-modal" className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px] max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Upload Attachment</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
            data-testid="upload-attachment-modal-close"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3.5">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Attachment Type</label>
            <div className="flex gap-2">
              <button
                data-testid="upload-attachment-file-toggle"
                onClick={() => setAttachmentType('document')}
                className={`h-[34px] px-3 text-[13px] font-medium rounded-[5px] border transition-colors duration-100 ${
                  attachmentType === 'document'
                    ? 'bg-accent text-white border-accent'
                    : 'border-border text-text-secondary hover:bg-hover'
                }`}
              >
                File Upload
              </button>
              <button
                data-testid="upload-attachment-link-toggle"
                onClick={() => setAttachmentType('link')}
                className={`h-[34px] px-3 text-[13px] font-medium rounded-[5px] border transition-colors duration-100 ${
                  attachmentType === 'link'
                    ? 'bg-accent text-white border-accent'
                    : 'border-border text-text-secondary hover:bg-hover'
                }`}
              >
                Link URL
              </button>
            </div>
          </div>

          {attachmentType === 'document' ? (
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">File</label>
              <div className="border border-dashed border-border rounded-[5px] p-4 text-center">
                <input
                  data-testid="upload-attachment-file-input"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="text-[13px] text-text-secondary"
                />
                {file && (
                  <p className="text-[12px] text-text-muted mt-2">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[12px] font-medium text-text-muted mb-1">Link Name</label>
                <input
                  data-testid="upload-attachment-link-name"
                  type="text"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="e.g. Client Website"
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-text-muted mb-1">URL *</label>
                <input
                  data-testid="upload-attachment-url"
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button
            data-testid="upload-attachment-cancel"
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            data-testid="upload-attachment-save"
            onClick={handleSave}
            disabled={!canSave}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}
