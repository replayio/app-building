import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UsersPageHeader } from '../components/users/UsersPageHeader'
import { Briefcase, CheckSquare, Mail } from 'lucide-react'

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
  const navigate = useNavigate()

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
    <div className="p-6 max-w-[900px]" data-testid="users-list-page">
      <UsersPageHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="users-grid">
        {users.map((user) => (
          <div
            key={user.id}
            data-testid={`user-card-${user.id}`}
            onClick={() => navigate(`/users/${user.id}`)}
            className="border border-border rounded-[6px] bg-surface p-4 cursor-pointer hover:border-accent/40 transition-colors duration-100"
          >
            <div className="flex items-center gap-3 mb-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-[15px] font-medium text-accent">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div data-testid={`user-name-${user.id}`} className="text-[13px] font-medium text-text-primary truncate">
                  {user.name}
                </div>
                <div className="flex items-center gap-1 text-[12px] text-text-muted truncate">
                  <Mail size={11} strokeWidth={1.75} />
                  {user.email}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Briefcase size={12} strokeWidth={1.75} />
                <span>{user.active_deals_count} active deal{user.active_deals_count !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckSquare size={12} strokeWidth={1.75} />
                <span>{user.open_tasks_count} open task{user.open_tasks_count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
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
