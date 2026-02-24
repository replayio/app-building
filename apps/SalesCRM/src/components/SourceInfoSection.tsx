import { useState, useEffect } from 'react'

interface SourceInfoSectionProps {
  source: string | null
  sourceDetail: string | null
  campaign: string | null
  channel: string | null
  dateAcquired: string | null
  onUpdate: (fields: { source?: string; source_detail?: string; campaign?: string; channel?: string; date_acquired?: string }) => Promise<void>
}

export default function SourceInfoSection({
  source,
  sourceDetail,
  campaign,
  channel,
  dateAcquired,
  onUpdate,
}: SourceInfoSectionProps) {
  const [editing, setEditing] = useState(false)
  const [localSource, setLocalSource] = useState(source || '')
  const [localSourceDetail, setLocalSourceDetail] = useState(sourceDetail || '')
  const [localCampaign, setLocalCampaign] = useState(campaign || '')
  const [localChannel, setLocalChannel] = useState(channel || '')
  const [localDateAcquired, setLocalDateAcquired] = useState(dateAcquired || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLocalSource(source || '')
    setLocalSourceDetail(sourceDetail || '')
    setLocalCampaign(campaign || '')
    setLocalChannel(channel || '')
    setLocalDateAcquired(dateAcquired || '')
  }, [source, sourceDetail, campaign, channel, dateAcquired])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate({
        source: localSource,
        source_detail: localSourceDetail,
        campaign: localCampaign,
        channel: localChannel,
        date_acquired: localDateAcquired,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setLocalSource(source || '')
    setLocalSourceDetail(sourceDetail || '')
    setLocalCampaign(campaign || '')
    setLocalChannel(channel || '')
    setLocalDateAcquired(dateAcquired || '')
    setEditing(false)
  }

  const formatDate = (d: string | null) => {
    if (!d) return 'Not set'
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="person-section" data-testid="source-info-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <h2 data-testid="source-info-heading">Source Info</h2>
        </div>
        <div className="person-section-actions">
          {!editing && (
            <button
              className="btn-ghost"
              onClick={() => setEditing(true)}
              data-testid="source-info-edit-button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                <path d="m15 5 4 4"/>
              </svg>
              Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="source-info-form" data-testid="source-info-form">
          <div className="source-info-form-grid">
            <div className="form-field">
              <label className="form-label">Acquisition Source</label>
              <input
                type="text"
                className="form-input"
                value={localSource}
                onChange={e => setLocalSource(e.target.value)}
                placeholder="e.g. Referral, Inbound, Cold Call..."
                data-testid="acquisition-source-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Source Detail</label>
              <input
                type="text"
                className="form-input"
                value={localSourceDetail}
                onChange={e => setLocalSourceDetail(e.target.value)}
                placeholder="e.g. John Smith referral..."
                data-testid="source-detail-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Campaign</label>
              <input
                type="text"
                className="form-input"
                value={localCampaign}
                onChange={e => setLocalCampaign(e.target.value)}
                placeholder="e.g. Q4 Outreach..."
                data-testid="campaign-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Channel</label>
              <input
                type="text"
                className="form-input"
                value={localChannel}
                onChange={e => setLocalChannel(e.target.value)}
                placeholder="e.g. Direct Sales, Website..."
                data-testid="channel-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Date Acquired</label>
              <input
                type="date"
                className="form-input"
                value={localDateAcquired}
                onChange={e => setLocalDateAcquired(e.target.value)}
                data-testid="date-acquired-input"
              />
            </div>
          </div>
          <div className="modal-actions" style={{ marginTop: '12px' }}>
            <button className="btn-secondary" onClick={handleCancel} data-testid="source-info-cancel">Cancel</button>
            <button className="btn-primary" disabled={saving} onClick={handleSave} data-testid="source-info-save">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="source-info-fields" data-testid="source-info-fields">
          <div className="source-info-field" data-testid="acquisition-source-field">
            <span className="source-info-label">Acquisition Source</span>
            <span className="source-info-value">{source ? `${source}${sourceDetail ? ` (${sourceDetail})` : ''}` : 'Not set'}</span>
          </div>
          <div className="source-info-field" data-testid="campaign-field">
            <span className="source-info-label">Campaign</span>
            <span className="source-info-value">{campaign || 'None'}</span>
          </div>
          <div className="source-info-field" data-testid="channel-field">
            <span className="source-info-label">Channel</span>
            <span className="source-info-value">{channel || 'Not set'}</span>
          </div>
          <div className="source-info-field" data-testid="date-acquired-field">
            <span className="source-info-label">Date Acquired</span>
            <span className="source-info-value">{formatDate(dateAcquired)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
