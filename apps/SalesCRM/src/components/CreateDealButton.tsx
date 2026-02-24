import { useState, useEffect, useRef } from 'react'
import { Plus, ChevronDown, Search } from 'lucide-react'
import { useAppDispatch } from '@/store/hooks'
import { createDeal, fetchDeals } from '@/store/dealsSlice'

const stages = ['Lead', 'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won']
const statuses = ['On Track', 'Needs Attention', 'At Risk']

export default function CreateDealButton() {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')

  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [stage, setStage] = useState('Lead')
  const [owner, setOwner] = useState('')
  const [value, setValue] = useState('')
  const [closeDate, setCloseDate] = useState('')
  const [status, setStatus] = useState('On Track')
  const [nameError, setNameError] = useState('')
  const [saving, setSaving] = useState(false)

  const [allClients, setAllClients] = useState<{ id: string; name: string }[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const clientRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      fetch('/.netlify/functions/clients?page=1&pageSize=1000')
        .then(r => r.json())
        .then(data => setAllClients((data.clients || []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))))
        .catch(() => {})
    }
  }, [open])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) setClientDropdownOpen(false)
      if (stageRef.current && !stageRef.current.contains(e.target as Node)) setStageDropdownOpen(false)
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const resetForm = () => {
    setName('')
    setClientId('')
    setClientName('')
    setStage('Lead')
    setOwner('')
    setValue('')
    setCloseDate('')
    setStatus('On Track')
    setNameError('')
    setClientSearch('')
  }

  const handleOpen = () => {
    resetForm()
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError('Deal name is required')
      return
    }
    setNameError('')
    setSaving(true)
    try {
      await dispatch(createDeal({
        name: name.trim(),
        client_id: clientId,
        stage,
        owner: owner.trim(),
        value,
        close_date: closeDate,
        status,
      })).unwrap()
      setOpen(false)
      setToast('Deal created successfully')
      setTimeout(() => setToast(''), 3000)
      await dispatch(fetchDeals())
    } catch {
      // error handled by redux
    } finally {
      setSaving(false)
    }
  }

  const filteredClients = clientSearch
    ? allClients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
    : allClients

  return (
    <>
      <button
        className="btn-primary"
        onClick={handleOpen}
        data-testid="create-deal-button"
      >
        <Plus size={14} />
        <span>Create New Deal</span>
      </button>

      {open && (
        <div className="modal-overlay" onClick={handleClose} data-testid="create-deal-modal">
          <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Deal</h2>
              <button className="modal-close" onClick={handleClose}>✕</button>
            </div>
            <div className="modal-form">
              <div className="form-field">
                <label className="form-label">Deal Name *</label>
                <input
                  className={`form-input${nameError ? ' error' : ''}`}
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (nameError) setNameError('') }}
                  placeholder="Enter deal name"
                  data-testid="create-deal-name"
                />
                {nameError && <span className="form-error" data-testid="create-deal-name-error">{nameError}</span>}
              </div>

              <div className="form-field">
                <label className="form-label">Client</label>
                <div className="form-dropdown-wrapper" ref={clientRef}>
                  <button
                    className="form-dropdown-trigger"
                    onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                    data-testid="create-deal-client"
                  >
                    <span>{clientName || 'Select client'}</span>
                    <ChevronDown size={14} />
                  </button>
                  {clientDropdownOpen && (
                    <div className="form-dropdown-menu">
                      <div className="searchable-select-search">
                        <Search size={14} className="searchable-select-icon" />
                        <input
                          className="searchable-select-input"
                          placeholder="Search clients..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          data-testid="create-deal-client-search"
                        />
                      </div>
                      <div className="searchable-select-options">
                        {filteredClients.length === 0 && (
                          <div className="searchable-select-empty">No clients found</div>
                        )}
                        {filteredClients.map(c => (
                          <button
                            key={c.id}
                            className={`form-dropdown-option${c.id === clientId ? ' selected' : ''}`}
                            onClick={() => {
                              setClientId(c.id)
                              setClientName(c.name)
                              setClientDropdownOpen(false)
                              setClientSearch('')
                            }}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Stage</label>
                <div className="form-dropdown-wrapper" ref={stageRef}>
                  <button
                    className="form-dropdown-trigger"
                    onClick={() => setStageDropdownOpen(!stageDropdownOpen)}
                    data-testid="create-deal-stage"
                  >
                    <span>{stage}</span>
                    <ChevronDown size={14} />
                  </button>
                  {stageDropdownOpen && (
                    <div className="form-dropdown-menu">
                      {stages.map(s => (
                        <button
                          key={s}
                          className={`form-dropdown-option${s === stage ? ' selected' : ''}`}
                          onClick={() => { setStage(s); setStageDropdownOpen(false) }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Owner</label>
                <input
                  className="form-input"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Deal owner"
                  data-testid="create-deal-owner"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Value</label>
                <input
                  className="form-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="$0"
                  data-testid="create-deal-value"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Close Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                  data-testid="create-deal-close-date"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Status</label>
                <div className="form-dropdown-wrapper" ref={statusRef}>
                  <button
                    className="form-dropdown-trigger"
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    data-testid="create-deal-status"
                  >
                    <span>{status}</span>
                    <ChevronDown size={14} />
                  </button>
                  {statusDropdownOpen && (
                    <div className="form-dropdown-menu">
                      {statuses.map(s => (
                        <button
                          key={s}
                          className={`form-dropdown-option${s === status ? ' selected' : ''}`}
                          onClick={() => { setStatus(s); setStatusDropdownOpen(false) }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleClose} data-testid="create-deal-cancel">
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={saving}
                data-testid="create-deal-submit"
              >
                {saving ? 'Creating...' : 'Create Deal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="success-toast" data-testid="deals-success-toast">{toast}</div>}
    </>
  )
}
