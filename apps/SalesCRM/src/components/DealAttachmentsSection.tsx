import { useState, useEffect, useCallback, useRef } from 'react'

interface Attachment {
  id: string
  filename: string
  file_type: string
  file_url: string | null
  file_size: string | null
  created_at: string
}

interface DealAttachmentsSectionProps {
  dealId: string
  clientId: string
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
  // Generic file icon
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

export default function DealAttachmentsSection({ dealId, clientId }: DealAttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Attachment | null>(null)
  const [toast, setToast] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchAttachments = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/deals/${dealId}/attachments`)
      const data = await res.json()
      setAttachments(data.attachments || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetchAttachments()
  }, [fetchAttachments])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/uploadthing', {
        method: 'POST',
        body: formData,
      })

      let fileUrl = ''
      const fileSize = formatFileSize(file.size)

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json()
        fileUrl = uploadData.url || ''
      } else {
        fileUrl = URL.createObjectURL(file)
      }

      const res = await fetch(`/.netlify/functions/deals/${dealId}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          file_type: file.type || 'application/octet-stream',
          file_url: fileUrl,
          file_size: fileSize,
          client_id: clientId,
        }),
      })

      if (res.ok) {
        fetchAttachments()
        showToast('File uploaded successfully')
      }
    } catch {
      // silently fail
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (attachment: Attachment) => {
    try {
      await fetch(`/.netlify/functions/deals/${dealId}/attachments/${attachment.id}`, { method: 'DELETE' })
      setDeleteConfirm(null)
      fetchAttachments()
    } catch {
      // silently fail
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="person-section" data-testid="deal-attachments-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          <h2 data-testid="deal-attachments-heading">Attachments</h2>
        </div>
        <div className="person-section-actions">
          <button
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            data-testid="deal-attachments-upload-button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleUpload}
            data-testid="deal-attachments-file-input"
          />
        </div>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : attachments.length > 0 ? (
        <div className="deal-attachments-list" data-testid="deal-attachments-list">
          {attachments.map(att => (
            <div key={att.id} className="deal-attachment-item" data-testid="deal-attachment-item">
              <span className="deal-attachment-icon">
                {getFileIcon(att.file_type, att.filename)}
              </span>
              <span className="deal-attachment-name" data-testid="deal-attachment-name">{att.filename}</span>
              {att.file_size && <span className="deal-attachment-size">({att.file_size})</span>}
              <span className="deal-attachment-separator"> - </span>
              <a
                href={att.file_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="deal-attachment-link"
                data-testid="deal-attachment-download"
              >
                Download
              </a>
              <span className="deal-attachment-separator"> | </span>
              <button
                className="deal-attachment-link deal-attachment-delete"
                onClick={() => setDeleteConfirm(att)}
                data-testid="deal-attachment-delete"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="person-section-empty" data-testid="deal-attachments-empty">
          No attachments yet
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" data-testid="deal-attachment-delete-confirm">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Delete Attachment</h3>
            </div>
            <p style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Are you sure you want to delete {deleteConfirm.filename}?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)} data-testid="deal-attachment-delete-cancel">Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)} data-testid="deal-attachment-delete-confirm-button">Delete</button>
            </div>
          </div>
        </div>
      )}

      {uploading && (
        <div className="deal-attachment-upload-progress" data-testid="deal-attachment-upload-progress">
          Uploading file...
        </div>
      )}

      {toast && <div className="success-toast" data-testid="deal-attachment-toast">{toast}</div>}
    </div>
  )
}
