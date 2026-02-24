import { useState } from 'react'
import { Pencil } from 'lucide-react'
import type { ClientDetail } from '../../store/slices/clientsSlice'
import FilterSelect from '../FilterSelect'
import { formatDate } from '../../lib/utils'

interface ClientSourceInfoProps {
  client: ClientDetail
  onClientUpdated: () => void
}

const sourceTypeOptions = [
  { value: '', label: 'None' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Campaign', label: 'Campaign' },
  { value: 'Website', label: 'Website' },
  { value: 'Cold Call', label: 'Cold Call' },
  { value: 'Event', label: 'Event' },
]

export default function ClientSourceInfo({ client, onClientUpdated }: ClientSourceInfoProps) {
  const [editing, setEditing] = useState(false)
  const [sourceType, setSourceType] = useState(client.source_type || '')
  const [sourceDetail, setSourceDetail] = useState(client.source_detail || '')
  const [campaign, setCampaign] = useState(client.campaign || '')
  const [channel, setChannel] = useState(client.channel || '')
  const [dateAcquired, setDateAcquired] = useState(client.date_acquired || '')
  const [submitting, setSubmitting] = useState(false)

  function handleEdit() {
    setSourceType(client.source_type || '')
    setSourceDetail(client.source_detail || '')
    setCampaign(client.campaign || '')
    setChannel(client.channel || '')
    setDateAcquired(client.date_acquired || '')
    setEditing(true)
  }

  async function handleSave() {
    setSubmitting(true)
    try {
      const res = await fetch(`/.netlify/functions/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: sourceType || '',
          source_detail: sourceDetail || '',
          campaign: campaign || '',
          channel: channel || '',
          date_acquired: dateAcquired || '',
        }),
      })
      if (!res.ok) throw new Error('Failed to update')
      await onClientUpdated()
      setEditing(false)
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const acquisitionSource = client.source_type
    ? client.source_detail
      ? `${client.source_type} (${client.source_detail})`
      : client.source_type
    : 'None'

  return (
    <div data-testid="client-source-info" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold text-[var(--color-text-secondary)]">Source Info</h2>
        {!editing && (
          <button
            data-testid="edit-source-info-button"
            type="button"
            onClick={handleEdit}
            className="h-7 px-2 rounded flex items-center gap-1 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-hover)] cursor-pointer"
          >
            <Pencil size={12} />
            <span>Edit</span>
          </button>
        )}
      </div>

      {editing ? (
        <div data-testid="source-info-edit-form" className="rounded-lg border border-[var(--color-bg-border)] p-4 space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Source Type</label>
            <FilterSelect
              data-testid="source-form-type"
              value={sourceType}
              onChange={setSourceType}
              options={sourceTypeOptions}
              placeholder="Select source type"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Source Detail</label>
            <input
              data-testid="source-form-detail"
              type="text"
              value={sourceDetail}
              onChange={(e) => setSourceDetail(e.target.value)}
              placeholder="Additional source info"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Campaign</label>
            <input
              data-testid="source-form-campaign"
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="Campaign name"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Channel</label>
            <input
              data-testid="source-form-channel"
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="Acquisition channel"
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-muted)] mb-1">Date Acquired</label>
            <input
              data-testid="source-form-date"
              type="date"
              value={dateAcquired}
              onChange={(e) => setDateAcquired(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              data-testid="source-form-cancel"
              type="button"
              onClick={() => setEditing(false)}
              className="h-7 px-3 rounded text-[12px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] cursor-pointer"
            >Cancel</button>
            <button
              data-testid="source-form-save"
              type="button"
              onClick={handleSave}
              disabled={submitting}
              className="h-7 px-3 rounded text-[12px] text-white bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-default"
            >{submitting ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-[var(--color-bg-border)] p-4">
          <div>
            <div className="text-[12px] text-[var(--color-text-muted)] mb-0.5">Acquisition Source</div>
            <div data-testid="source-acquisition" className="text-[13px] text-[var(--color-text-primary)]">
              {acquisitionSource}
            </div>
          </div>
          <div>
            <div className="text-[12px] text-[var(--color-text-muted)] mb-0.5">Campaign</div>
            <div data-testid="source-campaign" className="text-[13px] text-[var(--color-text-primary)]">
              {client.campaign || 'None'}
            </div>
          </div>
          <div>
            <div className="text-[12px] text-[var(--color-text-muted)] mb-0.5">Channel</div>
            <div data-testid="source-channel" className="text-[13px] text-[var(--color-text-primary)]">
              {client.channel || 'None'}
            </div>
          </div>
          <div>
            <div className="text-[12px] text-[var(--color-text-muted)] mb-0.5">Date Acquired</div>
            <div data-testid="source-date-acquired" className="text-[13px] text-[var(--color-text-primary)]">
              {client.date_acquired ? formatDate(client.date_acquired) : 'None'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
