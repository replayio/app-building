import { useState, useRef } from 'react'
import { X, Upload, Download } from 'lucide-react'

interface ColumnSpec {
  name: string
  required: boolean
  description: string
}

interface ImportDialogProps {
  open: boolean
  onClose: () => void
  entityName: string
  columns: ColumnSpec[]
  onImport: (rows: Array<Record<string, string>>) => Promise<{ imported: number; errors: Array<{ row: number; error: string }> }>
}

function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const rows: Array<Record<string, string>> = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ''
    })
    rows.push(row)
  }
  return rows
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        fields.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
  }
  fields.push(current.trim())
  return fields
}

export default function ImportDialog({ open, onClose, entityName, columns, onImport }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; errors: Array<{ row: number; error: string }> } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  function handleDownloadTemplate() {
    const header = columns.map((c) => c.name).join(',')
    const blob = new Blob([header + '\n'], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${entityName.toLowerCase()}_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport() {
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      const res = await onImport(rows)
      setResult(res)
    } catch {
      setResult({ imported: 0, errors: [{ row: 0, error: 'Failed to process CSV file' }] })
    } finally {
      setImporting(false)
    }
  }

  function handleClose() {
    setFile(null)
    setResult(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="import-dialog">
      <div className="absolute inset-0 bg-black/30" data-testid="modal-overlay" onClick={handleClose} />
      <div className="relative bg-[var(--color-bg-base)] rounded-lg shadow-[var(--shadow-elevation-2)] w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-bg-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">Import {entityName}</h2>
          <button type="button" onClick={handleClose} className="p-1 rounded hover:bg-[var(--color-hover)] cursor-pointer">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Column spec table */}
          <div>
            <h3 className="text-[13px] font-medium text-[var(--color-text-primary)] mb-2">CSV Column Format</h3>
            <div className="border border-[var(--color-bg-border)] rounded overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[var(--color-bg-sidebar)]">
                    <th className="text-left px-3 py-1.5 text-[var(--color-text-muted)] font-medium">Column</th>
                    <th className="text-left px-3 py-1.5 text-[var(--color-text-muted)] font-medium">Required</th>
                    <th className="text-left px-3 py-1.5 text-[var(--color-text-muted)] font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map((col) => (
                    <tr key={col.name} className="border-t border-[var(--color-bg-border)]">
                      <td className="px-3 py-1.5 text-[var(--color-text-primary)] font-medium">{col.name}</td>
                      <td className="px-3 py-1.5 text-[var(--color-text-muted)]">{col.required ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-1.5 text-[var(--color-text-muted)]">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            data-testid="download-csv-template"
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 text-[13px] text-[var(--color-accent)] hover:underline cursor-pointer"
          >
            <Download size={14} />
            Download CSV template
          </button>

          {/* File upload */}
          <div
            className="border-2 border-dashed border-[var(--color-bg-border)] rounded-lg p-6 text-center cursor-pointer hover:border-[var(--color-accent)] transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={24} className="mx-auto mb-2 text-[var(--color-text-disabled)]" />
            <p className="text-[13px] text-[var(--color-text-muted)]">
              {file ? file.name : 'Click to select a CSV file'}
            </p>
            <input
              ref={fileInputRef}
              data-testid="import-file-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null)
                setResult(null)
              }}
            />
          </div>

          {/* Results */}
          {result && (
            <div className="rounded border border-[var(--color-bg-border)] p-3 space-y-2">
              <p className="text-[13px] text-[var(--color-text-primary)]">
                Successfully imported {result.imported} {entityName.toLowerCase()}.
              </p>
              {result.errors.length > 0 && (
                <div className="space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-[12px] text-[var(--color-priority-high)]">
                      Row {err.row}: {err.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-[var(--color-bg-border)]">
          <button
            type="button"
            onClick={handleClose}
            className="h-8 px-3 rounded text-[13px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              data-testid="import-submit-button"
              type="button"
              onClick={handleImport}
              disabled={!file || importing}
              className="h-8 px-4 rounded text-[13px] text-white bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
