import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchUsers } from '../store/slices/usersSlice'
import UsersGrid from '../components/Users/UsersGrid'

export default function UsersListPage() {
  const dispatch = useAppDispatch()
  const { items: users, loading } = useAppSelector((state) => state.users)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  return (
    <div data-testid="users-list-page" className="p-6 max-sm:p-3">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Team</h1>
      </div>
      <UsersGrid users={users} loading={loading} />
    </div>
  )
}
