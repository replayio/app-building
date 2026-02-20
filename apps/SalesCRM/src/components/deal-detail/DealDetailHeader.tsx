import { useState, useEffect } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import type { Deal, DealStage } from '../../types'
import { FilterSelect } from '../shared/FilterSelect'

interface DealDetailHeaderProps {
  deal: Deal
  availableUsers?: { name: string }[]
  availableClients?: { id: string; name: string }[]
  onUpdate: (data: Record<string, unknown>) => void | Promise<void>
  onStageChange: (newStage: DealStage) => void
}

const stageLabels: Record<DealStage, string> = {
  lead: 'Lead',
  qualification: 'Qualification',
  discovery: 'Discovery',
  proposal: 'Proposal Sent',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
}

const stageOptions: DealStage[] = ['lead', 'qualification', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

function formatValue(value: number): string {
  return `$${Number(value).toLocaleString()}`
}

export function DealDetailHeader({ deal, availableUsers = [], availableClients = [], onUpdate, onStageChange }: DealDetailHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(deal.name)
  const [value, setValue] = useState(String(deal.value))
  const [owner, setOwner] = useState(deal.owner ?? '')
  const [clientId, setClientId] = useState(deal.client_id)
  const [selectedStage, setSelectedStage] = useState<DealStage>(deal.stage)

  useEffect(() => {
    setSelectedStage(deal.stage)
  }, [deal.stage])

  useEffect(() => {
    setName(deal.name)
    setValue(String(deal.value))
    setOwner(deal.owner ?? '')
    setClientId(deal.client_id)
  }, [deal.name, deal.value, deal.owner, deal.client_id])

  async function handleSave() {
    const data: Record<string, unknown> = {
      name: name.trim(),
      value: parseFloat(value) || 0,
      owner: owner.trim() || null,
    }
    if (clientId !== deal.client_id) {
      data.client_id = clientId
    }
    await onUpdate(data)
    setEditing(false)
  }

  function handleCancel() {
    setName(deal.name)
    setValue(String(deal.value))
    setOwner(deal.owner ?? '')
    setClientId(deal.client_id)
    setEditing(false)
  }

  function handleChangeStage() {
    if (selectedStage !== deal.stage) {
      onStageChange(selectedStage)
    }
  }

  return (
    <div data-testid="deal-detail-header" className="border border-border rounded-[6px] p-5 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-1">
            Deal Details
          </div>
          {editing ? (
            <input
              data-testid="deal-header-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-[18px] font-semibold text-text-primary bg-base border border-border rounded-[5px] px-2 py-1 w-full max-w-[500px] focus:outline-none focus:border-accent"
            />
          ) : (
            <h1 data-testid="deal-header-title" className="text-[18px] font-semibold text-text-primary">
              {deal.client_name} - {deal.name}
            </h1>
          )}
        </div>
        {!editing ? (
          <button
            data-testid="deal-header-edit-button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
            title="Edit deal"
          >
            <Pencil size={14} strokeWidth={1.75} />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              data-testid="deal-header-save-button"
              onClick={handleSave}
              className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-status-active hover:bg-hover transition-colors duration-100"
              title="Save"
            >
              <Check size={14} strokeWidth={1.75} />
            </button>
            <button
              data-testid="deal-header-cancel-button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-status-churned hover:bg-hover transition-colors duration-100"
              title="Cancel"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4">
        <div>
          <div className="text-[12px] font-medium text-text-muted mb-1">Client</div>
          {editing ? (
            availableClients.length > 0 ? (
              <FilterSelect
                testId="deal-header-client-input"
                value={clientId}
                onChange={(val) => setClientId(val)}
                searchable
                options={availableClients.map((c) => ({ value: c.id, label: c.name }))}
              />
            ) : (
              <div data-testid="deal-header-client" className="text-[13px] text-text-primary">{deal.client_name}</div>
            )
          ) : (
            <div data-testid="deal-header-client" className="text-[13px] text-text-primary">{deal.client_name}</div>
          )}
        </div>
        <div>
          <div className="text-[12px] font-medium text-text-muted mb-1">Value</div>
          {editing ? (
            <input
              data-testid="deal-header-value-input"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-[30px] px-2 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
            />
          ) : (
            <div data-testid="deal-header-value" className="text-[13px] text-text-primary font-medium">{formatValue(Number(deal.value))}</div>
          )}
        </div>
        <div>
          <div className="text-[12px] font-medium text-text-muted mb-1">Owner</div>
          {editing ? (
            availableUsers.length > 0 ? (
              <FilterSelect
                testId="deal-header-owner-input"
                value={owner}
                onChange={(val) => setOwner(val)}
                searchable
                options={[
                  { value: '', label: '— None —' },
                  ...availableUsers.map((u) => ({ value: u.name, label: u.name })),
                ]}
              />
            ) : (
              <input
                data-testid="deal-header-owner-input"
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full h-[30px] px-2 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
              />
            )
          ) : (
            <div data-testid="deal-header-owner" className="text-[13px] text-text-primary">{deal.owner ?? '—'}</div>
          )}
        </div>
        <div>
          <div className="text-[12px] font-medium text-text-muted mb-1">Stage</div>
          <div className="flex items-center gap-2 flex-wrap">
            <FilterSelect
              testId="deal-header-stage-select"
              value={selectedStage}
              onChange={(val) => setSelectedStage(val as DealStage)}
              options={stageOptions.map((s) => ({ value: s, label: stageLabels[s] }))}
            />
            <button
              data-testid="deal-header-change-stage-button"
              onClick={handleChangeStage}
              disabled={selectedStage === deal.stage}
              className="h-[30px] px-3 text-[12px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
            >
              Change Stage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
