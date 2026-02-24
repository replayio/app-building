import { useState, useCallback } from 'react'
import { Download, Upload, Plus, X, Upload as UploadIcon } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createClient, importClients, fetchClients } from '@/store/clientsSlice'
import ClientFormModal from './ClientFormModal'

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h.trim()] = (values[i] || '').trim() })
    return obj
  })
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += line[i]
    }
  }
  result.push(current)
  return result
}

function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [success, setSuccess] = useState('')

  const handleFile = useCallback((f: File) => {
    setError('')
    setSuccess('')
    if (!f.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseCSV(text)
      if (rows.length === 0) {
        setError('CSV file is empty or has no data rows')
        return
      }
      const headers = Object.keys(rows[0])
      const requiredCols = ['Client Name']
      const missing = requiredCols.filter(c => !headers.some(h => h.toLowerCase() === c.toLowerCase()))
      if (missing.length) {
        setError(`Missing required column: ${missing.join(', ')}`)
        return
      }
      setPreview(rows)
    }
    reader.readAsText(f)
  }, [])

  const handleImport = async () => {
    if (!preview.length) return
    setImporting(true)
    setError('')
    try {
      const clients = preview.map(row => ({
        name: row['Client Name'] || row['client name'] || row['Name'] || row['name'] || '',
        type: row['Type'] || row['type'] || 'Organization',
        status: row['Status'] || row['status'] || 'Prospect',
        tags: row['Tags'] || row['tags'] || '',
        source: row['Source'] || row['source'] || '',
      }))
      const result = await dispatch(importClients(clients)).unwrap()
      setSuccess(`${result.imported} clients imported successfully`)
      await dispatch(fetchClients())
      setTimeout(() => {
        onClose()
        setFile(null)
        setPreview([])
        setSuccess('')
      }, 1500)
    } catch {
      setError('Failed to import clients')
    } finally {
      setImporting(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview([])
    setError('')
    setSuccess('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={reset} data-testid="import-modal">
      <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()} data-testid="import-modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Import Clients</h2>
          <button className="modal-close" onClick={reset} data-testid="import-modal-close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="import-instructions">
            <p className="import-instructions-title">Expected CSV Format</p>
            <p className="import-instructions-text">
              Required columns: <strong>Client Name</strong>, <strong>Type</strong>, <strong>Status</strong>
            </p>
            <p className="import-instructions-text">
              Optional columns: Tags, Source, Primary Contact
            </p>
          </div>

          {!preview.length && (
            <div
              className="import-dropzone"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
              data-testid="import-dropzone"
            >
              <UploadIcon size={32} className="import-dropzone-icon" />
              <p className="import-dropzone-text">Drag and drop a CSV file here, or click to browse</p>
              <label className="btn-secondary import-browse-btn">
                Browse Files
                <input
                  type="file"
                  accept=".csv"
                  className="import-file-input"
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
                  data-testid="import-file-input"
                />
              </label>
            </div>
          )}

          {preview.length > 0 && (
            <div className="import-preview" data-testid="import-preview">
              <p className="import-preview-info">
                {file?.name} — {preview.length} client{preview.length !== 1 ? 's' : ''} found
              </p>
              <div className="import-preview-table">
                <div className="import-preview-header">
                  {Object.keys(preview[0]).slice(0, 5).map(key => (
                    <div key={key} className="import-preview-cell header">{key}</div>
                  ))}
                </div>
                {preview.slice(0, 5).map((row, i) => (
                  <div key={i} className="import-preview-row">
                    {Object.keys(preview[0]).slice(0, 5).map(key => (
                      <div key={key} className="import-preview-cell">{row[key] || '—'}</div>
                    ))}
                  </div>
                ))}
                {preview.length > 5 && (
                  <p className="import-preview-more">...and {preview.length - 5} more</p>
                )}
              </div>
            </div>
          )}

          {error && <p className="import-error" data-testid="import-error">{error}</p>}
          {success && <p className="import-success" data-testid="import-success">{success}</p>}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={reset} data-testid="import-cancel">
            Cancel
          </button>
          {preview.length > 0 && (
            <button
              type="button"
              className="btn-primary"
              onClick={handleImport}
              disabled={importing}
              data-testid="import-confirm"
            >
              {importing ? 'Importing...' : `Import ${preview.length} Client${preview.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClientsActions() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(s => s.clients.filters)
  const [importOpen, setImportOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleExport = async () => {
    const params = new URLSearchParams()
    params.set('format', 'csv')
    params.set('pageSize', '10000')
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('status', filters.status)
    if (filters.tag) params.set('tag', filters.tag)
    if (filters.source) params.set('source', filters.source)

    const res = await fetch(`/.netlify/functions/clients?${params}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clients.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCreate = async (data: { name: string; type: string; status: string; tags: string[]; source: string }) => {
    await dispatch(createClient(data)).unwrap()
    await dispatch(fetchClients())
    setSuccessMsg('Client created successfully')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  return (
    <div className="clients-actions" data-testid="clients-actions">
      <button className="btn-ghost" onClick={() => setImportOpen(true)} data-testid="import-button">
        <Download size={14} />
        <span>Import</span>
      </button>
      <button className="btn-ghost" onClick={handleExport} data-testid="export-button">
        <Upload size={14} />
        <span>Export</span>
      </button>
      <button className="btn-primary" onClick={() => setAddOpen(true)} data-testid="add-client-button">
        <Plus size={14} />
        <span>Add New Client</span>
      </button>

      {successMsg && (
        <div className="success-toast" data-testid="client-success-message">{successMsg}</div>
      )}

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <ClientFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
        title="Add New Client"
      />
    </div>
  )
}
