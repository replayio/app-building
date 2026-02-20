import { useState } from 'react'

interface CSVColumn {
  name: string
  required: boolean
  description: string
}

interface ImportDialogProps {
  entityName: string
  entityNamePlural: string
  columns: CSVColumn[]
  headerMap: Record<string, string>
  templateFilename: string
  templateExample: string
  apiEndpoint: string
  apiBodyKey: string
  onClose: () => void
  onImported: () => void
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (values[i] ?? '').trim() })
    return row
  })
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
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
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

export function ImportDialog({
  entityName,
  entityNamePlural,
  columns,
  headerMap,
  templateFilename,
  templateExample,
  apiEndpoint,
  apiBodyKey,
  onClose,
  onImported,
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null)

  function handleDownloadTemplate() {
    const headers = columns.map(c => c.name).join(',')
    const csv = headers + '\n' + templateExample
    const blob = new Blob([csv], { type: 'text/csv' })
    const csvUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = csvUrl
    a.download = templateFilename
    a.click()
    URL.revokeObjectURL(csvUrl)
  }

  async function handleImport() {
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (rows.length === 0) {
        setResult({ imported: 0, errors: ['CSV file is empty or has no data rows.'] })
        setImporting(false)
        return
      }
      const items = rows.map(row => {
        const mapped: Record<string, string> = {}
        for (const [key, value] of Object.entries(row)) {
          const field = headerMap[key.toLowerCase()]
          if (field) mapped[field] = value
        }
        return mapped
      })
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [apiBodyKey]: items }),
      })
      const data = await res.json() as { imported: number; errors: string[] }
      setResult(data)
      if (data.imported > 0) onImported()
    } catch {
      setResult({ imported: 0, errors: ['Failed to read or process the CSV file.'] })
    }
    setImporting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div data-testid="import-dialog" className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[520px] max-sm:max-w-[calc(100%-24px)] max-h-[80vh] flex flex-col">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Import {entityNamePlural}</h2>
        </div>
        <div className="px-5 max-sm:px-3 py-4 overflow-y-auto">
          <p className="text-[13px] text-text-muted mb-3">Upload a CSV file to import {entityName.toLowerCase()} data. The first row must be column headers.</p>

          <div data-testid="csv-format-info" className="mb-4 border border-border rounded-[5px]">
            <div className="px-3 py-2 bg-hover border-b border-border">
              <span className="text-[12px] font-semibold text-text-secondary">CSV Column Format</span>
            </div>
            <div className="px-3 py-2">
              <table className="w-full text-[12px]">
                <tbody>
                  {columns.map(col => (
                    <tr key={col.name} className="border-b border-border last:border-0">
                      <td className="py-1 pr-2 font-medium text-text-primary whitespace-nowrap">
                        {col.name}{col.required && <span className="text-red-500 ml-0.5">*</span>}
                      </td>
                      <td className="py-1 text-text-muted">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            data-testid="download-template-button"
            onClick={handleDownloadTemplate}
            className="mb-3 text-[12px] text-accent hover:underline"
          >
            Download CSV template
          </button>

          <div className="mb-2">
            <input
              data-testid="csv-file-input"
              type="file"
              accept=".csv"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null) }}
              className="text-[13px] text-text-secondary"
            />
          </div>

          {result && (
            <div data-testid="import-result" className="mt-3 p-3 rounded-[5px] border border-border bg-hover">
              <p className="text-[13px] font-medium text-text-primary mb-1">
                {result.imported > 0 ? `Successfully imported ${result.imported} ${result.imported !== 1 ? entityNamePlural.toLowerCase() : entityName.toLowerCase()}.` : `No ${entityNamePlural.toLowerCase()} were imported.`}
              </p>
              {result.errors.length > 0 && (
                <div className="mt-1">
                  <p className="text-[12px] text-red-500 font-medium mb-1">{result.errors.length} error{result.errors.length !== 1 ? 's' : ''}:</p>
                  <ul className="text-[12px] text-red-500 list-disc pl-4 max-h-[100px] overflow-y-auto">
                    {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 max-sm:px-3 py-3 border-t border-border">
          <button
            data-testid="import-cancel-button"
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              data-testid="import-submit-button"
              onClick={handleImport}
              disabled={!file || importing}
              className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
