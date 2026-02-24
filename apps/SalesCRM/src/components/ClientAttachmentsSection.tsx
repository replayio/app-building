import { useState, useEffect, useCallback } from 'react'

interface Attachment {
  id: string
  filename: string
  file_type: string
  file_url: string | null
  file_size: string | null
  deal_name: string | null
  deal_id: string | null
  created_at: string
}

interface ClientAttachmentsSectionProps {
  clientId: string
  refreshKey?: number
}

function getFileIcon(fileType: string, filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const isImage = fileType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)
  const isPdf = fileType === 'application/pdf' || ext === 'pdf'
  const isSpreadsheet = ['csv', 'xls', 'xlsx'].includes(ext) || fileType.includes('spreadsheet') || fileType.includes('csv')
  const isDoc = ['doc', 'docx'].includes(ext) || fileType.includes('document') || fileType.includes('msword')

  if (isImage) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
    )
  }
  if (isPdf) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <path d="M10 12h4"/><path d="M10 16h4"/>
      </svg>
    )
  }
  if (isSpreadsheet) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>
      </svg>
    )
  }
  if (isDoc) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

function getFileTypeLabel(fileType: string, filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (fileType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'Image'
  if (fileType === 'application/pdf' || ext === 'pdf') return 'PDF'
  if (['csv', 'xls', 'xlsx'].includes(ext) || fileType.includes('spreadsheet')) return 'Spreadsheet'
  if (['doc', 'docx'].includes(ext) || fileType.includes('document')) return 'Document'
  return 'File'
}

export default function ClientAttachmentsSection({ clientId, refreshKey }: ClientAttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<Attachment | null>(null)

  const fetchAttachments = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/clients/${clientId}/attachments`)
      const data = await res.json()
      setAttachments(data.attachments || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchAttachments()
  }, [fetchAttachments, refreshKey])

  const handleDelete = async (attachment: Attachment) => {
    try {
      await fetch(`/.netlify/functions/clients/${clientId}/attachments/${attachment.id}`, { method: 'DELETE' })
      await fetch(`/.netlify/functions/clients/${clientId}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'attachment_deleted',
          title: 'Attachment Deleted: ' + attachment.filename,
          description: `File "${attachment.filename}" was deleted`,
        }),
      })
      setDeleteConfirm(null)
      fetchAttachments()
    } catch {
      // silently fail
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const isLink = (att: Attachment) => {
    return att.file_url && (att.file_url.startsWith('http://') || att.file_url.startsWith('https://'))
  }

  return (
    <div className="person-section" data-testid="attachments-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          <h2 data-testid="attachments-heading">Attachments</h2>
        </div>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : attachments.length > 0 ? (
        <div className="client-attachments-list" data-testid="attachments-list">
          {attachments.map(att => (
            <div key={att.id} className="client-attachment-item" data-testid="attachment-item">
              <span className="deal-attachment-icon" data-testid="attachment-type-icon">
                {getFileIcon(att.file_type, att.filename)}
              </span>
              <span className="client-attachment-name" data-testid="attachment-filename">{att.filename}</span>
              <span className="client-attachment-type">{getFileTypeLabel(att.file_type, att.filename)}</span>
              <span className="client-attachment-date">Created: {formatDate(att.created_at)}</span>
              <span className="client-attachment-deal" data-testid="attachment-deal-link">
                Linked Deal: {att.deal_name || 'None'}
              </span>
              <div className="client-attachment-actions">
                {isLink(att) ? (
                  <a
                    href={att.file_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="deal-attachment-link"
                    data-testid="attachment-view-button"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </a>
                ) : (
                  <a
                    href={att.file_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="deal-attachment-link"
                    data-testid="attachment-download-button"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </a>
                )}
                <button
                  className="deal-attachment-link deal-attachment-delete"
                  onClick={() => setDeleteConfirm(att)}
                  data-testid="attachment-delete-button"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="person-section-empty" data-testid="attachments-empty">
          No attachments for this client
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" data-testid="attachment-delete-confirmation">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Delete Attachment</h3>
            </div>
            <p style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Are you sure you want to delete {deleteConfirm.filename}?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)} data-testid="attachment-delete-cancel">Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)} data-testid="attachment-delete-confirm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
