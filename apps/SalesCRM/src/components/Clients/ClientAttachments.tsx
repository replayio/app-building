import { useState } from 'react'
import { FileText, Link2, Sheet, Download, ExternalLink, Trash2 } from 'lucide-react'
import type { ClientAttachment } from '../../store/slices/clientsSlice'
import { formatDate } from '../../lib/utils'

interface ClientAttachmentsProps {
  attachments: ClientAttachment[]
  onAttachmentDeleted: () => void
}

function getFileIcon(attachment: ClientAttachment) {
  const type = attachment.file_type?.toLowerCase() || ''
  const name = attachment.filename.toLowerCase()

  if (type === 'link') {
    return <Link2 size={16} className="text-[var(--color-accent-blue)]" />
  }

  if (type.startsWith('image/') || /\.(png|jpg|jpeg|gif|svg|webp)$/.test(name)) {
    return (
      <div className="w-8 h-8 rounded overflow-hidden bg-[var(--color-hover)] flex items-center justify-center">
        <img
          src={attachment.file_url}
          alt={attachment.filename}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            target.parentElement!.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
          }}
        />
      </div>
    )
  }

  if (/\.(xlsx?|csv|numbers)$/.test(name) || type.includes('spreadsheet') || type.includes('csv')) {
    return <Sheet size={16} className="text-[#22c55e]" />
  }

  return <FileText size={16} className="text-[var(--color-text-muted)]" />
}

function getTypeLabel(attachment: ClientAttachment): string {
  if (attachment.file_type === 'link') return 'Link'
  return 'Document'
}

export default function ClientAttachments({ attachments, onAttachmentDeleted }: ClientAttachmentsProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/.netlify/functions/attachments/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setConfirmDelete(null)
        onAttachmentDeleted()
      }
    } catch {
      // ignore
    }
  }

  return (
    <div data-testid="client-attachments" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold text-[var(--color-text-secondary)]">Attachments</h2>
      </div>

      {attachments.length === 0 ? (
        <div data-testid="client-attachments-empty" className="rounded-lg border border-[var(--color-bg-border)] p-6 text-center">
          <p className="text-[13px] text-[var(--color-text-muted)]">No attachments</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-bg-border)] divide-y divide-[var(--color-bg-border)]">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              data-testid={`attachment-row-${attachment.id}`}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              {/* Icon */}
              <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                {getFileIcon(attachment)}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div data-testid={`attachment-name-${attachment.id}`} className="text-[13px] text-[var(--color-text-primary)] truncate">
                  {attachment.filename}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                  <span>{getTypeLabel(attachment)}</span>
                  <span>&middot;</span>
                  <span>Created: {formatDate(attachment.created_at)}</span>
                  {attachment.deal_name ? (
                    <>
                      <span>&middot;</span>
                      <span>Linked Deal: {attachment.deal_name}</span>
                    </>
                  ) : (
                    <>
                      <span>&middot;</span>
                      <span>Linked Deal: None</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-1">
                {attachment.file_type === 'link' ? (
                  <a
                    data-testid={`attachment-view-${attachment.id}`}
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-7 w-7 rounded flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-hover)]"
                  >
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <a
                    data-testid={`attachment-download-${attachment.id}`}
                    href={attachment.file_url}
                    download={attachment.filename}
                    className="h-7 w-7 rounded flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-hover)]"
                  >
                    <Download size={14} />
                  </a>
                )}
                <button
                  data-testid={`attachment-delete-${attachment.id}`}
                  type="button"
                  onClick={() => setConfirmDelete(attachment.id)}
                  className="h-7 w-7 rounded flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-hover)] hover:text-[var(--color-priority-high)] cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="delete-attachment-confirm">
          <div className="absolute inset-0 bg-black/30" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-[var(--color-bg-base)] rounded-lg shadow-[var(--shadow-elevation-2)] w-full max-w-sm mx-4 p-4">
            <p className="text-[14px] text-[var(--color-text-primary)] mb-4">Are you sure you want to delete this attachment?</p>
            <div className="flex justify-end gap-2">
              <button
                data-testid="delete-attachment-cancel"
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="h-8 px-3 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer"
              >Cancel</button>
              <button
                data-testid="delete-attachment-confirm-button"
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                className="h-8 px-4 rounded text-[13px] text-white bg-[var(--color-priority-high)] hover:opacity-90 cursor-pointer"
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
