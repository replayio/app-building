import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setPage, fetchIndividuals } from '../../store/slices/individualsSlice'
import ContactsTable from './ContactsTable'

export default function ContactsListContent() {
  const dispatch = useAppDispatch()
  const { items, loading, total, page } = useAppSelector((s) => s.individuals)
  const perPage = 50
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  function handlePageChange(newPage: number) {
    dispatch(setPage(newPage))
    dispatch(fetchIndividuals())
  }

  if (loading) {
    return (
      <div data-testid="contacts-loading" className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-disabled)]" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div data-testid="contacts-empty" className="flex flex-col items-center justify-center py-12">
        <p className="text-[13px] text-[var(--color-text-muted)]">No contacts found</p>
      </div>
    )
  }

  return (
    <div>
      <ContactsTable contacts={items} />

      {/* Pagination */}
      {total > perPage && (
        <div data-testid="contacts-pagination" className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-bg-border)]">
          <span className="text-[12px] text-[var(--color-text-muted)]">
            {total} contact{total !== 1 ? 's' : ''} total
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
            <span className="px-2 text-[12px] text-[var(--color-text-muted)]">
              Page {page} of {totalPages}
            </span>
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
    </div>
  )
}
