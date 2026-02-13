import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface DealRowActionMenuProps {
  dealId: string
  onDelete: (dealId: string) => void
}

export function DealRowActionMenu({ dealId, onDelete }: DealRowActionMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="flex items-center justify-center w-[28px] h-[28px] rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
      >
        <MoreHorizontal size={16} strokeWidth={1.75} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-[140px] bg-surface border border-border rounded-[6px] shadow-[var(--shadow-elevation-2)] z-20 py-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
              navigate(`/deals/${dealId}`)
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-text-secondary hover:bg-hover transition-colors duration-100"
          >
            <Eye size={14} strokeWidth={1.75} />
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
              navigate(`/deals/${dealId}`)
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-text-secondary hover:bg-hover transition-colors duration-100"
          >
            <Pencil size={14} strokeWidth={1.75} />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
              onDelete(dealId)
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
