interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[360px]">
        <div className="px-5 py-4">
          <h3 className="text-[14px] font-semibold text-text-primary mb-2">{title}</h3>
          <p className="text-[13px] text-text-muted">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
          <button
            onClick={onCancel}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-status-churned rounded-[5px] hover:opacity-90 transition-opacity duration-100"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
