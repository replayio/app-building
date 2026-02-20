import { X } from 'lucide-react'

interface VersionEntry {
  id: string
  title: string
  content: string
  author: string
  version: number
  created_at: string
}

interface VersionHistoryModalProps {
  open: boolean
  onClose: () => void
  versions: VersionEntry[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function VersionHistoryModal({ open, onClose, versions }: VersionHistoryModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div data-testid="version-history-modal" className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[560px] max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Version History</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
            data-testid="version-history-modal-close"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-5 py-4">
          {versions.length === 0 ? (
            <div className="text-[13px] text-text-muted py-2">No version history available</div>
          ) : (
            <div className="flex flex-col gap-3">
              {versions.map((v) => (
                <div key={v.id} className="border border-border rounded-[4px] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium text-text-primary">
                      v{v.version} — {v.title}
                    </span>
                    <span className="text-[12px] text-text-muted">{formatDate(v.created_at)}</span>
                  </div>
                  <div className="text-[12px] text-text-muted mb-2">by {v.author}</div>
                  <p className="text-[13px] text-text-secondary whitespace-pre-wrap">{v.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
