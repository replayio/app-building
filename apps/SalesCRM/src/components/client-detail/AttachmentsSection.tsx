import { Download, Eye, Trash2 } from 'lucide-react'
import type { Attachment } from '../../types'
import { AttachmentPreview } from '../shared/AttachmentPreview'
import { getFileTypeLabel } from '../shared/attachmentUtils'

interface AttachmentsSectionProps {
  attachments: Attachment[]
  onDelete: (attachmentId: string) => void
}

export function AttachmentsSection({ attachments, onDelete }: AttachmentsSectionProps) {
  return (
    <div className="border border-border rounded-[6px] p-4 max-sm:p-3 mb-4" data-testid="attachments-section">
      <h2 className="text-[14px] font-semibold text-text-primary mb-3">Attachments</h2>

      {attachments.length === 0 ? (
        <div className="text-[13px] text-text-muted py-2" data-testid="attachments-empty-state">No attachments</div>
      ) : (
        <div className="flex flex-col gap-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              data-testid={`attachment-item-${att.id}`}
              className="flex items-center gap-3 max-sm:gap-2 px-3 py-2.5 rounded-[4px] hover:bg-hover transition-colors duration-100"
            >
              <AttachmentPreview filename={att.filename} url={att.url} type={att.type} />
              <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <span className="text-[13px] text-text-primary font-medium truncate" data-testid={`attachment-filename-${att.id}`}>{att.filename}</span>
                <span className="text-[12px] text-text-muted" data-testid={`attachment-type-${att.id}`}>{getFileTypeLabel(att.filename, att.type)}</span>
                <span className="text-[12px] text-text-muted max-md:hidden" data-testid={`attachment-date-${att.id}`}>
                  Created: {new Date(att.created_at).toLocaleDateString()}
                </span>
                <span className="text-[12px] text-text-muted max-md:hidden" data-testid={`attachment-deal-${att.id}`}>
                  Linked Deal: {att.deal_name ?? 'None'}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {att.type === 'document' ? (
                  <a
                    href={att.url}
                    download={att.filename}
                    data-testid={`attachment-download-${att.id}`}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
                    title="Download"
                  >
                    <Download size={14} strokeWidth={1.75} />
                  </a>
                ) : (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`attachment-view-${att.id}`}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
                    title="View"
                  >
                    <Eye size={14} strokeWidth={1.75} />
                  </a>
                )}
                <button
                  onClick={() => onDelete(att.id)}
                  data-testid={`attachment-delete-${att.id}`}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:text-status-churned hover:bg-hover transition-colors duration-100"
                  title="Delete"
                >
                  <Trash2 size={14} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
