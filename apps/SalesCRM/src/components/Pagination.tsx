import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setPage } from '@/store/clientsSlice'

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = [1]

  if (currentPage > 3) {
    pages.push('...')
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push('...')
  }

  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return pages
}

export default function Pagination() {
  const dispatch = useAppDispatch()
  const page = useAppSelector(s => s.clients.page)
  const pageSize = useAppSelector(s => s.clients.pageSize)
  const total = useAppSelector(s => s.clients.total)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const pageNumbers = getPageNumbers(page, totalPages)

  if (total === 0) {
    return (
      <div className="pagination" data-testid="pagination">
        <span className="pagination-info" data-testid="pagination-info">
          Showing 0 of 0 clients
        </span>
      </div>
    )
  }

  return (
    <div className="pagination" data-testid="pagination">
      <span className="pagination-info" data-testid="pagination-info">
        Showing {start}-{end} of {total} clients
      </span>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          disabled={page <= 1}
          onClick={() => dispatch(setPage(page - 1))}
          data-testid="pagination-prev"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>
        <div className="pagination-pages">
          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="pagination-ellipsis" data-testid="pagination-ellipsis">
                ...
              </span>
            ) : (
              <button
                key={p}
                className={`pagination-page${p === page ? ' active' : ''}`}
                onClick={() => dispatch(setPage(p))}
                data-testid={`pagination-page-${p}`}
              >
                {p}
              </button>
            )
          )}
        </div>
        <button
          className="pagination-btn"
          disabled={page >= totalPages}
          onClick={() => dispatch(setPage(page + 1))}
          data-testid="pagination-next"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
