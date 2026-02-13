interface DealsPaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function DealsPagination({ page, pageSize, total, onPageChange }: DealsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (total === 0) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <span className="text-[12px] text-text-muted">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-[28px] px-2.5 text-[12px] text-text-secondary border border-border rounded-[4px] hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-100"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-[28px] px-2.5 text-[12px] text-text-secondary border border-border rounded-[4px] hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-100"
        >
          Next
        </button>
      </div>
    </div>
  )
}
