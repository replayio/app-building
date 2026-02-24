import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchClients } from '@/store/clientsSlice'
import ClientsSearchAndFilters from '@/components/ClientsSearchAndFilters'
import ClientsActions from '@/components/ClientsActions'
import ClientsTable from '@/components/ClientsTable'
import Pagination from '@/components/Pagination'

export default function ClientsListPage() {
  const dispatch = useAppDispatch()
  const page = useAppSelector(s => s.clients.page)
  const search = useAppSelector(s => s.clients.filters.search)
  const status = useAppSelector(s => s.clients.filters.status)
  const tag = useAppSelector(s => s.clients.filters.tag)
  const source = useAppSelector(s => s.clients.filters.source)
  const sort = useAppSelector(s => s.clients.filters.sort)

  useEffect(() => {
    dispatch(fetchClients())
  }, [dispatch, page, search, status, tag, source, sort])

  return (
    <div className="page-content p-6 max-sm:p-3" data-testid="clients-list-page">
      <div className="page-header">
        <h1 className="page-title">Clients</h1>
        <ClientsActions />
      </div>
      <ClientsSearchAndFilters />
      <ClientsTable />
      <Pagination />
    </div>
  )
}
