import { useState, useEffect } from 'react'
import { UsersPageHeader } from '../components/users/UsersPageHeader'
import { UserCard } from '../components/users/UserCard'

interface UserSummary {
  id: string
  name: string
  email: string
  avatar_url: string
  created_at: string
  active_deals_count: number
  open_tasks_count: number
}

export function UsersListPage() {
  const [users, setUsers] = useState<UserSummary[]>([])

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/.netlify/functions/users')
        const data = await res.json() as { users: UserSummary[] }
        setUsers(data.users)
      } catch {
        // ignore
      }
    }
    loadUsers()
  }, [])

  return (
    <div className="p-3 sm:p-6 max-w-[900px]" data-testid="users-list-page">
      <UsersPageHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="users-grid">
        {users.map((user) => (
          <UserCard
            key={user.id}
            id={user.id}
            name={user.name}
            email={user.email}
            avatar_url={user.avatar_url}
            active_deals_count={user.active_deals_count}
            open_tasks_count={user.open_tasks_count}
          />
        ))}
      </div>

      {users.length === 0 && (
        <div data-testid="users-empty-state" className="text-center py-12 text-[13px] text-text-muted">
          No team members found. Users appear here after signing up.
        </div>
      )}
    </div>
  )
}
