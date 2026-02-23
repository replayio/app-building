import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import type { Client } from '../../types'

interface SourceInfoSectionProps {
  client: Client
  onUpdate: (data: Record<string, unknown>) => void
}

export function SourceInfoSection({ client, onUpdate }: SourceInfoSectionProps) {
  const [editing, setEditing] = useState(false)
  const [sourceType, setSourceType] = useState(client.source_type ?? '')
  const [sourceDetail, setSourceDetail] = useState(client.source_detail ?? '')
  const [campaign, setCampaign] = useState(client.campaign ?? '')
  const [channel, setChannel] = useState(client.channel ?? '')
  const [dateAcquired, setDateAcquired] = useState(client.date_acquired ?? '')

  function handleSave() {
    onUpdate({
      source_type: sourceType || null,
      source_detail: sourceDetail || null,
      campaign: campaign || null,
      channel: channel || null,
      date_acquired: dateAcquired || null,
    })
    setEditing(false)
  }

  function handleCancel() {
    setSourceType(client.source_type ?? '')
    setSourceDetail(client.source_detail ?? '')
    setCampaign(client.campaign ?? '')
    setChannel(client.channel ?? '')
    setDateAcquired(client.date_acquired ?? '')
    setEditing(false)
  }

  return (
    <div className="border border-border rounded-[6px] p-4 max-sm:p-3 mb-4" data-testid="source-info-section">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold text-text-primary">Source Info</h2>
        {editing ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              data-testid="source-info-save-button"
              className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-status-active hover:bg-hover transition-colors duration-100"
            >
              <Check size={14} strokeWidth={2} />
            </button>
            <button
              onClick={handleCancel}
              data-testid="source-info-cancel-button"
              className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            data-testid="source-info-edit-button"
            className="inline-flex items-center gap-1 px-2 py-1 text-[12px] text-text-muted hover:bg-hover rounded-[4px] transition-colors duration-100"
          >
            <Pencil size={12} strokeWidth={1.75} />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Acquisition Source</label>
            <input
              type="text"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              placeholder="e.g. Referral"
              data-testid="source-info-source-input"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Source Detail</label>
            <input
              type="text"
              value={sourceDetail}
              onChange={(e) => setSourceDetail(e.target.value)}
              placeholder="e.g. John Smith"
              data-testid="source-info-detail-input"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Campaign</label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="Campaign name"
              data-testid="source-info-campaign-input"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Channel</label>
            <input
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="e.g. Direct Sales"
              data-testid="source-info-channel-input"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Date Acquired</label>
            <input
              type="date"
              value={dateAcquired}
              onChange={(e) => setDateAcquired(e.target.value)}
              data-testid="source-info-date-input"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      ) : (
        <div className="source-info-grid grid grid-cols-4 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4" data-testid="source-info-display">
          <div>
            <div className="text-[12px] text-text-muted mb-0.5">Acquisition Source</div>
            <div className="text-[13px] text-text-primary" data-testid="source-info-source-value">
              {client.source_type || 'None'}
              {client.source_detail && ` (${client.source_detail})`}
            </div>
          </div>
          <div>
            <div className="text-[12px] text-text-muted mb-0.5">Campaign</div>
            <div className="text-[13px] text-text-primary" data-testid="source-info-campaign-value">{client.campaign || 'None'}</div>
          </div>
          <div>
            <div className="text-[12px] text-text-muted mb-0.5">Channel</div>
            <div className="text-[13px] text-text-primary" data-testid="source-info-channel-value">{client.channel || 'None'}</div>
          </div>
          <div>
            <div className="text-[12px] text-text-muted mb-0.5">Date Acquired</div>
            <div className="text-[13px] text-text-primary" data-testid="source-info-date-value">
              {client.date_acquired ? new Date(client.date_acquired).toLocaleDateString() : 'None'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
