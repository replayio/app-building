interface ContactsPaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function ContactsPagination({ page, pageSize, total, onPageChange }: ContactsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  if (total === 0) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div data-testid="contacts-pagination" className="flex flex-wrap items-center justify-end gap-3 mt-4 px-4 py-3">
      <span data-testid="contacts-pagination-info" className="text-[12px] text-text-muted">
        Showing {start}-{end} of {total} contacts
      </span>
      <div className="flex items-center gap-1">
        <button
          data-testid="contacts-pagination-previous"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-[28px] px-2.5 text-[12px] text-text-secondary border border-border rounded-[4px] hover:bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-100"
        >
          Previous
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-[12px] text-text-disabled">
              ...
            </span>
          ) : (
            <button
              key={p}
              data-testid={`contacts-pagination-page-${p}`}
              onClick={() => onPageChange(p)}
              className={`h-[28px] w-[28px] text-[12px] rounded-[4px] transition-colors duration-100 ${
                p === page
                  ? 'bg-accent text-white'
                  : 'text-text-secondary border border-border hover:bg-hover'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          data-testid="contacts-pagination-next"
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
