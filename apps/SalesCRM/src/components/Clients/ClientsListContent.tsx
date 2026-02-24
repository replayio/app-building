import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setPage, fetchClients } from '../../store/slices/clientsSlice'
import type { Client } from '../../store/slices/clientsSlice'
import ClientsTable from './ClientsTable'

interface ClientsListContentProps {
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

const PER_PAGE = 50

export default function ClientsListContent({ onEdit, onDelete }: ClientsListContentProps) {
  const dispatch = useAppDispatch()
  const { items, loading, total, page } = useAppSelector((s) => s.clients)
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  function handlePageChange(newPage: number) {
    dispatch(setPage(newPage))
    dispatch(fetchClients())
  }

  if (loading) {
    return (
      <div data-testid="clients-loading" className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-disabled)]" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div data-testid="clients-empty" className="flex flex-col items-center justify-center py-12">
        <p className="text-[13px] text-[var(--color-text-muted)]">No clients found</p>
      </div>
    )
  }

  const startItem = (page - 1) * PER_PAGE + 1
  const endItem = Math.min(page * PER_PAGE, total)

  // Generate page numbers to display
  const pageNumbers: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pageNumbers.push(i)
    }
  }

  return (
    <div>
      <ClientsTable clients={items} onEdit={onEdit} onDelete={onDelete} />

      {/* Pagination */}
      {total > PER_PAGE && (
        <div data-testid="clients-pagination" className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-bg-border)]">
          <span className="text-[12px] text-[var(--color-text-muted)]">
            Showing {startItem}-{endItem} of {total} clients
          </span>
          <div className="flex items-center gap-1">
            <button
              data-testid="page-previous"
              type="button"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="h-7 px-2 rounded text-[12px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] disabled:opacity-40 disabled:cursor-default cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            {pageNumbers.map((num, i) => {
              const prev = pageNumbers[i - 1]
              const showEllipsis = prev !== undefined && num - prev > 1
              return (
                <span key={num} className="flex items-center">
                  {showEllipsis && (
                    <span className="px-1 text-[12px] text-[var(--color-text-disabled)]">...</span>
                  )}
                  <button
                    type="button"
                    data-testid={`page-${num}`}
                    onClick={() => handlePageChange(num)}
                    className={`h-7 w-7 rounded text-[12px] flex items-center justify-center cursor-pointer border ${
                      num === page
                        ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                        : 'text-[var(--color-text-secondary)] border-[var(--color-bg-border)] hover:bg-[var(--color-hover)]'
                    }`}
                  >
                    {num}
                  </button>
                </span>
              )
            })}
            <button
              data-testid="page-next"
              type="button"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="h-7 px-2 rounded text-[12px] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-hover)] disabled:opacity-40 disabled:cursor-default cursor-pointer flex items-center gap-1"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Show count when all on one page */}
      {total <= PER_PAGE && total > 0 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-bg-border)]">
          <span className="text-[12px] text-[var(--color-text-muted)]">
            Showing 1-{total} of {total} clients
          </span>
        </div>
      )}
    </div>
  )
}
