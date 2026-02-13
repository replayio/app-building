import { useState } from 'react'
import { X } from 'lucide-react'
import type { Deal } from '../../types'

interface AddAttachmentModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    filename: string
    type: string
    url: string
    size: number | null
    deal_id: string
  }) => void
  deals: Deal[]
}

export function AddAttachmentModal({ open, onClose, onSave, deals }: AddAttachmentModalProps) {
  const [attachmentType, setAttachmentType] = useState<'document' | 'link'>('document')
  const [file, setFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkName, setLinkName] = useState('')
  const [dealId, setDealId] = useState('')

  if (!open) return null

  function handleSave() {
    if (attachmentType === 'document' && file) {
      // For document uploads, we use the file name and a placeholder URL
      // In production this would use UploadThing
      const url = URL.createObjectURL(file)
      onSave({
        filename: file.name,
        type: 'document',
        url,
        size: file.size,
        deal_id: dealId,
      })
    } else if (attachmentType === 'link' && linkUrl) {
      onSave({
        filename: linkName || linkUrl,
        type: 'link',
        url: linkUrl,
        size: null,
        deal_id: dealId,
      })
    }
    setFile(null)
    setLinkUrl('')
    setLinkName('')
    setDealId('')
  }

  const canSave = (attachmentType === 'document' && file !== null) || (attachmentType === 'link' && linkUrl.trim() !== '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px] max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Add Attachment</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3.5">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Attachment Type</label>
            <div className="flex gap-2">
              <button
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
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Associated Deal (optional)</label>
            <select
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
            >
              <option value="">None</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>{deal.name}</option>
              ))}
            </select>
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
            disabled={!canSave}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
