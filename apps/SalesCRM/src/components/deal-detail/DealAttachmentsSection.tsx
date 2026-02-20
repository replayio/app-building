import { Upload } from 'lucide-react'
import type { Attachment } from '../../types'
import { AttachmentPreview } from '../shared/AttachmentPreview'
import { getFileTypeLabel } from '../shared/attachmentUtils'

interface DealAttachmentsSectionProps {
  attachments: Attachment[]
  onUpload: () => void
  onDelete: (attachmentId: string) => void
}

function formatSize(size: number | null): string {
  if (!size) return ''
  if (size >= 1048576) return `(${(size / 1048576).toFixed(1)} MB)`
  if (size >= 1024) return `(${(size / 1024).toFixed(0)} KB)`
  return `(${size} B)`
}

export function DealAttachmentsSection({ attachments, onUpload, onDelete }: DealAttachmentsSectionProps) {
  return (
    <div data-testid="deal-attachments-section" className="border border-border rounded-[6px] p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold text-text-primary">Attachments</h2>
        <button
          data-testid="deal-attachments-upload-button"
          onClick={onUpload}
          className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
          title="Upload"
        >
          <Upload size={14} strokeWidth={1.75} />
        </button>
      </div>

      {attachments.length === 0 ? (
        <div data-testid="deal-attachments-empty" className="text-[13px] text-text-muted py-2">No attachments</div>
      ) : (
        <div className="flex flex-col gap-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              data-testid={`deal-attachment-${att.id}`}
              className="flex items-center gap-3 max-sm:flex-wrap px-3 py-2.5 rounded-[4px] hover:bg-hover transition-colors duration-100"
            >
              <AttachmentPreview filename={att.filename} url={att.url} type={att.type} />
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-text-primary font-medium truncate block">{att.filename}</span>
                <span className="text-[12px] text-text-muted">{getFileTypeLabel(att.filename, att.type)}</span>
                <span className="text-[12px] text-text-muted ml-1">{formatSize(att.size)}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 max-sm:ml-auto">
                <a
                  data-testid={`deal-attachment-download-${att.id}`}
                  href={att.url}
                  download={att.filename}
                  className="text-[12px] text-accent hover:underline"
                >
                  Download
                </a>
                <button
                  data-testid={`deal-attachment-delete-${att.id}`}
                  onClick={() => onDelete(att.id)}
                  className="text-[12px] text-status-churned hover:underline ml-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
