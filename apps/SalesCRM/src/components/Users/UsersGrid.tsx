import type { User } from '../../store/slices/usersSlice'
import UserCard from './UserCard'

interface UsersGridProps {
  users: User[]
  loading: boolean
}

export default function UsersGrid({ users, loading }: UsersGridProps) {
  if (loading) {
    return (
      <div data-testid="users-loading" className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div data-testid="users-empty" className="text-center py-12">
        <p className="text-[13px] text-[var(--color-text-muted)]">No team members found</p>
      </div>
    )
  }

  return (
    <div data-testid="users-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
