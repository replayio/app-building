import { useCallback, useRef } from 'react'
import { Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSearch, fetchIndividuals } from '../../store/slices/individualsSlice'

export default function ContactsSearchBar() {
  const dispatch = useAppDispatch()
  const { search } = useAppSelector((s) => s.individuals)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch(setSearch(value))
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        dispatch(fetchIndividuals())
      }, 300)
    },
    [dispatch],
  )

  return (
    <div data-testid="contacts-search-bar" className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 h-7 px-2 rounded border border-[var(--color-bg-border)] bg-[var(--color-bg-base)] flex-1 min-w-[180px] max-w-[320px]">
        <Search size={14} className="text-[var(--color-text-disabled)] shrink-0" />
        <input
          data-testid="contacts-search-input"
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search contacts..."
          className="w-full bg-transparent border-none outline-none text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)]"
        />
      </div>
    </div>
  )
}
