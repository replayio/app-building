import { useState } from 'react'
import { Clock, Filter, Plus, Pencil } from 'lucide-react'
import type { ContactHistoryEntry, ContactHistoryType } from '../../types'

interface ContactHistorySectionProps {
  entries: ContactHistoryEntry[]
  onAddEntry: () => void
  onEditEntry: (entry: ContactHistoryEntry) => void
}

const TYPE_LABELS: Record<ContactHistoryType, string> = {
  email: 'Email',
  phone_call: 'Phone Call',
  video_call: 'Video Call',
  meeting: 'Meeting (In-person)',
  note: 'Note',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ContactHistorySection({ entries, onAddEntry, onEditEntry }: ContactHistorySectionProps) {
  const [filterType, setFilterType] = useState<string>('all')
  const [filterOpen, setFilterOpen] = useState(false)

  const filteredEntries = filterType === 'all'
    ? entries
    : entries.filter((e) => e.type === filterType)

  const uniqueTypes = Array.from(new Set(entries.map((e) => e.type)))

  return (
    <div className="border border-border rounded-[6px] p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} strokeWidth={1.5} className="text-text-muted" />
          <h2 className="text-[14px] font-semibold text-text-primary">History of Contact</h2>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center gap-1 h-7 px-2.5 text-[12px] font-medium text-text-secondary border border-border rounded-[4px] hover:bg-hover transition-colors duration-100"
            >
              <Filter size={13} strokeWidth={1.75} />
              Filter
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-surface border border-border rounded-[6px] shadow-[var(--shadow-elevation-2)] min-w-[160px]">
                <div
                  onClick={() => { setFilterType('all'); setFilterOpen(false) }}
                  className="px-3 py-2 text-[13px] text-text-primary cursor-pointer hover:bg-hover"
                >
                  All
                </div>
                {uniqueTypes.map((type) => (
                  <div
                    key={type}
                    onClick={() => { setFilterType(type); setFilterOpen(false) }}
                    className="px-3 py-2 text-[13px] text-text-primary cursor-pointer hover:bg-hover"
                  >
                    {TYPE_LABELS[type as ContactHistoryType] ?? type}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onAddEntry}
            className="inline-flex items-center gap-1 h-7 px-2.5 text-[12px] font-medium text-white bg-accent rounded-[4px] hover:opacity-90 transition-opacity duration-100"
          >
            <Plus size={13} strokeWidth={2} />
            Add Entry
          </button>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-[13px] text-text-muted py-2">No contact history found</div>
      ) : (
        <div className="flex flex-col gap-1">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between px-3 py-2.5 rounded-[4px] hover:bg-hover transition-colors duration-100"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[12px] text-text-muted">{formatDate(entry.date)}</span>
                  <span className="text-[12px] text-text-muted">|</span>
                  <span className="text-[12px] font-medium text-text-secondary">
                    {TYPE_LABELS[entry.type as ContactHistoryType] ?? entry.type}
                  </span>
                </div>
                <div className="text-[13px] text-text-primary">
                  <span className="text-text-muted">Summary: </span>
                  {entry.summary}
                </div>
                {entry.team_member && (
                  <div className="text-[12px] text-text-muted mt-0.5">
                    Team Member: {entry.team_member}
                  </div>
                )}
              </div>
              <button
                onClick={() => onEditEntry(entry)}
                className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100 flex-shrink-0 ml-2"
                title="Edit entry"
              >
                <Pencil size={13} strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
