import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UserDetailHeader } from '../components/user-detail/UserDetailHeader'
import { UserDealsSection } from '../components/user-detail/UserDealsSection'
import { UserTasksSection } from '../components/user-detail/UserTasksSection'
import { UserActivitySection } from '../components/user-detail/UserActivitySection'

interface UserDetail {
  id: string
  name: string
  email: string
  avatar_url: string
  created_at: string
}

interface UserDeal {
  id: string
  name: string
  client_name: string
  value: number
  stage: string
  status: string
}

interface UserTask {
  id: string
  title: string
  client_name: string | null
  deal_name: string | null
  due_date: string | null
  priority: string
  completed: boolean
}

interface UserActivity {
  id: string
  event_type: string
  description: string
  client_name: string | null
  client_id: string
  created_at: string
}

export function UserDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [deals, setDeals] = useState<UserDeal[]>([])
  const [tasks, setTasks] = useState<UserTask[]>([])
  const [activity, setActivity] = useState<UserActivity[]>([])

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(`/.netlify/functions/users/${userId}`)
        if (!res.ok) {
          navigate('/users')
          return
        }
        const data = await res.json() as { user: UserDetail; deals: UserDeal[]; tasks: UserTask[]; activity: UserActivity[] }
        setUser(data.user)
        setDeals(data.deals)
        setTasks(data.tasks)
        setActivity(data.activity)
      } catch {
        navigate('/users')
      }
    }
    if (userId) loadUser()
  }, [userId, navigate])

  if (!user) return null

  const activeDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
  const openTasks = tasks.filter(t => !t.completed)

  return (
    <div className="p-6 max-sm:p-4 max-w-[900px]" data-testid="user-detail-page">
      <UserDetailHeader
        user={user}
        activeDealsCount={activeDeals.length}
        openTasksCount={openTasks.length}
        totalDealsCount={deals.length}
      />
      <div className="flex flex-col gap-6">
        <UserDealsSection deals={deals} />
        <UserTasksSection tasks={tasks} />
        <UserActivitySection activity={activity} />
      </div>
    </div>
  )
}
