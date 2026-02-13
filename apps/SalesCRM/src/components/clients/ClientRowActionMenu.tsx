import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'

interface ClientRowActionMenuProps {
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ClientRowActionMenu({ onView, onEdit, onDelete }: ClientRowActionMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
      >
        <MoreHorizontal size={16} strokeWidth={1.75} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-36 bg-surface border border-border rounded-[6px] shadow-[var(--shadow-elevation-2)] py-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView()
              setOpen(false)
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-text-secondary hover:bg-hover transition-colors duration-100"
          >
            <Eye size={14} strokeWidth={1.75} />
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
              setOpen(false)
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-text-secondary hover:bg-hover transition-colors duration-100"
          >
            <Pencil size={14} strokeWidth={1.75} />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
              setOpen(false)
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-status-churned hover:bg-hover transition-colors duration-100"
          >
            <Trash2 size={14} strokeWidth={1.75} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
