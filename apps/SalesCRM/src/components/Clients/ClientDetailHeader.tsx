import { useState, useEffect } from 'react'
import { ArrowLeft, Pencil, Bell, BellOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ClientDetail } from '../../store/slices/clientsSlice'
import { useAppSelector } from '../../store/hooks'
import { getAuthHeader } from '../../lib/utils'
import CreateClientModal from './CreateClientModal'

interface ClientDetailHeaderProps {
  client: ClientDetail
  onClientUpdated: () => void
}

const statusColors: Record<string, { color: string; bg: string }> = {
  active: { color: 'var(--color-status-active)', bg: 'var(--color-status-active-bg)' },
  inactive: { color: 'var(--color-status-inactive)', bg: 'var(--color-status-inactive-bg)' },
  prospect: { color: 'var(--color-status-prospect)', bg: 'var(--color-status-prospect-bg)' },
  churned: { color: 'var(--color-status-churned)', bg: 'var(--color-status-churned-bg)' },
}

export default function ClientDetailHeader({ client, onClientUpdated }: ClientDetailHeaderProps) {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const [editOpen, setEditOpen] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    if (user && client.id) {
      fetch(`/.netlify/functions/client-follow?client_id=${client.id}`, {
        headers: getAuthHeader(),
      })
        .then((res) => res.json())
        .then((data) => setFollowing(data.following))
        .catch(() => {})
    }
  }, [user, client.id])

  async function handleToggleFollow() {
    if (!user || followLoading) return
    setFollowLoading(true)
    try {
      const res = await fetch('/.netlify/functions/client-follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ client_id: client.id }),
      })
      const data = await res.json()
      setFollowing(data.following)
    } catch {
      // ignore
    } finally {
      setFollowLoading(false)
    }
  }

  async function handleEditSubmit(data: {
    name: string
    type: string
    status: string
    tags: string[]
    source_type: string
    source_detail: string
    campaign: string
    channel: string
    date_acquired: string
  }) {
    const res = await fetch(`/.netlify/functions/clients/${client.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update')
    onClientUpdated()
  }

  const statusStyle = statusColors[client.status] || statusColors.active

  return (
    <div data-testid="client-detail-header" className="mb-6">
      <div className="flex items-start gap-3">
        {/* Back button */}
        <button
          data-testid="back-to-clients-button"
          type="button"
          onClick={() => navigate('/clients')}
          className="mt-1 h-7 w-7 rounded flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] cursor-pointer shrink-0"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Client info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 data-testid="client-name" className="text-lg font-semibold text-[var(--color-text-primary)]">
              {client.name}
            </h1>

            {/* Type badge */}
            <span
              data-testid="client-type-badge"
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border border-[var(--color-bg-border)] text-[var(--color-text-muted)]"
            >
              {client.type === 'organization' ? 'Organization' : 'Individual'}
            </span>

            {/* Status badge */}
            <span
              data-testid="client-status-badge"
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
              style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}
            >
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </span>
          </div>

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
            <div data-testid="client-tags" className="flex flex-wrap gap-1 mt-2">
              {client.tags.map((tag, i) => (
                <span
                  key={i}
                  data-testid={`client-tag-${i}`}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-[var(--color-hover)] text-[var(--color-text-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Follow button - only shown when authenticated */}
          {user && (
            <button
              data-testid="follow-button"
              type="button"
              onClick={handleToggleFollow}
              disabled={followLoading}
              className={`h-7 px-2.5 rounded flex items-center gap-1.5 text-[12px] cursor-pointer border transition-colors duration-100 ${
                following
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[rgba(113,128,255,0.08)]'
                  : 'border-[var(--color-bg-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-hover)]'
              }`}
            >
              {following ? <BellOff size={13} /> : <Bell size={13} />}
              <span>{following ? 'Following' : 'Follow'}</span>
            </button>
          )}

          {/* Edit button */}
          <button
            data-testid="edit-client-button"
            type="button"
            onClick={() => setEditOpen(true)}
            className="h-7 w-7 rounded flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-hover)] cursor-pointer"
          >
            <Pencil size={14} />
          </button>
        </div>
      </div>

      {/* Edit modal */}
      <CreateClientModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        editingClient={client}
      />
    </div>
  )
}
