import { useState, useRef, useEffect } from 'react'

const STAGES = ['Lead', 'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won'] as const

interface DealHeaderProps {
  dealName: string
  clientName: string
  value: string | number | null
  owner: string | null
  stage: string
  onUpdateField: (field: string, value: string) => Promise<void>
  onChangeStage: (newStage: string) => Promise<void>
}

export default function DealHeader({
  dealName,
  clientName,
  value,
  owner,
  stage,
  onUpdateField,
  onChangeStage,
}: DealHeaderProps) {
  const [selectedStage, setSelectedStage] = useState(stage)
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const stageRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSelectedStage(stage)
  }, [stage])

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingField])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stageRef.current && !stageRef.current.contains(e.target as Node)) {
        setStageDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatValue = (val: string | number | null) => {
    if (val === null || val === undefined || val === '') return ''
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return String(val)
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue)
  }

  const handleSave = async () => {
    if (!editingField) return
    await onUpdateField(editingField, editValue)
    setEditingField(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditingField(null)
    }
  }

  const handleChangeStage = async () => {
    if (selectedStage === stage) return
    await onChangeStage(selectedStage)
  }

  const displayTitle = `DEAL DETAILS: ${clientName} - ${dealName}`

  return (
    <div className="deal-header" data-testid="deal-header">
      <h1 className="deal-header-title" data-testid="deal-title">{displayTitle}</h1>

      <div className="deal-header-fields">
        <div className="deal-header-field" data-testid="deal-client-field">
          <span className="deal-header-label">Client:</span>
          {editingField === 'client_name' ? (
            <input
              ref={inputRef}
              className="deal-header-input"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              data-testid="deal-client-input"
            />
          ) : (
            <button
              className="deal-header-value-btn"
              onClick={() => startEditing('client_name', clientName)}
              data-testid="deal-client-value"
            >
              {clientName}
            </button>
          )}
        </div>

        <div className="deal-header-field" data-testid="deal-value-field">
          <span className="deal-header-label">Value:</span>
          {editingField === 'value' ? (
            <input
              ref={inputRef}
              className="deal-header-input"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              data-testid="deal-value-input"
            />
          ) : (
            <button
              className="deal-header-value-btn"
              onClick={() => startEditing('value', value !== null && value !== undefined ? String(value) : '')}
              data-testid="deal-value-value"
            >
              {formatValue(value)}
            </button>
          )}
        </div>

        <div className="deal-header-field" data-testid="deal-owner-field">
          <span className="deal-header-label">Owner:</span>
          {editingField === 'owner' ? (
            <input
              ref={inputRef}
              className="deal-header-input"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              data-testid="deal-owner-input"
            />
          ) : (
            <button
              className="deal-header-value-btn"
              onClick={() => startEditing('owner', owner || '')}
              data-testid="deal-owner-value"
            >
              {owner || '—'}
            </button>
          )}
        </div>

        <div className="deal-header-field deal-header-stage-field" data-testid="deal-stage-field">
          <span className="deal-header-label">Stage:</span>
          <div className="deal-header-stage-controls">
            <div className="deal-stage-dropdown-wrapper" ref={stageRef}>
              <button
                className="deal-stage-dropdown-trigger"
                onClick={() => setStageDropdownOpen(!stageDropdownOpen)}
                data-testid="deal-stage-dropdown"
              >
                <span>{selectedStage}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {stageDropdownOpen && (
                <div className="deal-stage-dropdown-menu" data-testid="deal-stage-dropdown-menu">
                  {STAGES.map(s => (
                    <button
                      key={s}
                      className={`deal-stage-dropdown-option ${selectedStage === s ? 'selected' : ''}`}
                      onClick={() => { setSelectedStage(s); setStageDropdownOpen(false) }}
                      data-testid="deal-stage-option"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="btn-primary"
              onClick={handleChangeStage}
              data-testid="deal-change-stage-button"
            >
              Change Stage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
