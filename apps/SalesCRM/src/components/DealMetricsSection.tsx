import { useState, useEffect, useRef } from 'react'

interface DealMetricsSectionProps {
  probability: number | null
  expectedCloseDate: string | null
  onUpdate: (field: string, value: string | number | null) => Promise<void>
}

export default function DealMetricsSection({ probability, expectedCloseDate, onUpdate }: DealMetricsSectionProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingField])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue)
    setError('')
  }

  const handleSave = async () => {
    if (!editingField) return

    if (editingField === 'probability') {
      const numVal = parseInt(editValue, 10)
      if (editValue !== '' && (isNaN(numVal) || numVal < 0 || numVal > 100)) {
        setError('Probability must be between 0 and 100')
        return
      }
      await onUpdate('probability', editValue === '' ? null : numVal)
    } else if (editingField === 'expected_close_date') {
      await onUpdate('expected_close_date', editValue || null)
    }

    setEditingField(null)
    setError('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditingField(null)
      setError('')
    }
  }

  return (
    <div className="person-section" data-testid="deal-metrics-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/>
            <path d="m19 9-5 5-4-4-3 3"/>
          </svg>
          <h2 data-testid="deal-metrics-heading">Deal Metrics</h2>
        </div>
      </div>

      <div className="deal-metrics-grid">
        <div className="deal-metrics-item" data-testid="deal-probability-field">
          <span className="deal-metrics-label">Probability:</span>
          {editingField === 'probability' ? (
            <div className="deal-metrics-edit">
              <input
                ref={inputRef}
                type="number"
                min={0}
                max={100}
                className="deal-header-input"
                value={editValue}
                onChange={e => { setEditValue(e.target.value); setError('') }}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                data-testid="deal-probability-input"
              />
              <span>%</span>
              {error && <span className="form-error" data-testid="deal-probability-error">{error}</span>}
            </div>
          ) : (
            <button
              className="deal-header-value-btn"
              onClick={() => startEditing('probability', probability !== null && probability !== undefined ? String(probability) : '')}
              data-testid="deal-probability-value"
            >
              {probability !== null && probability !== undefined ? `${probability}%` : '—'}
            </button>
          )}
        </div>

        <div className="deal-metrics-item" data-testid="deal-expected-close-field">
          <span className="deal-metrics-label">Expected Close:</span>
          {editingField === 'expected_close_date' ? (
            <input
              ref={inputRef}
              type="date"
              className="deal-header-input"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              data-testid="deal-expected-close-input"
            />
          ) : (
            <button
              className="deal-header-value-btn"
              onClick={() => startEditing('expected_close_date', expectedCloseDate ? expectedCloseDate.split('T')[0] : '')}
              data-testid="deal-expected-close-value"
            >
              {formatDate(expectedCloseDate)}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
