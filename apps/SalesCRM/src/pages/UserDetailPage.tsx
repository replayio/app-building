import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Calendar, Briefcase, CheckSquare, Clock } from 'lucide-react'

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

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  qualification: 'Qualification',
  discovery: 'Discovery',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
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

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function formatRelativeDate(dateStr: string) {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    return formatDate(dateStr)
  }

  return (
    <div className="p-6 max-w-[900px]">
      {/* Header */}
      <div data-testid="user-detail-header" className="mb-6">
        <button
          data-testid="user-detail-back"
          onClick={() => navigate('/users')}
          className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors duration-100 mb-4"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Back to Team Members
        </button>

        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-[20px] font-medium text-accent">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 data-testid="user-detail-name" className="text-[22px] font-semibold text-text-primary">
              {user.name}
            </h1>
            <div className="flex items-center gap-4 text-[13px] text-text-muted mt-1">
              <span className="flex items-center gap-1.5">
                <Mail size={13} strokeWidth={1.75} />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} strokeWidth={1.75} />
                Joined {formatDate(user.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="border border-border rounded-[6px] bg-surface p-3">
            <div className="text-[12px] text-text-muted mb-1">Active Deals</div>
            <div className="text-[18px] font-semibold text-text-primary">{activeDeals.length}</div>
          </div>
          <div className="border border-border rounded-[6px] bg-surface p-3">
            <div className="text-[12px] text-text-muted mb-1">Open Tasks</div>
            <div className="text-[18px] font-semibold text-text-primary">{openTasks.length}</div>
          </div>
          <div className="border border-border rounded-[6px] bg-surface p-3">
            <div className="text-[12px] text-text-muted mb-1">Total Deals</div>
            <div className="text-[18px] font-semibold text-text-primary">{deals.length}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Deals Section */}
        <div data-testid="user-deals-section" className="border border-border rounded-[6px] bg-surface">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Briefcase size={14} strokeWidth={1.75} className="text-text-muted" />
            <h2 className="text-[14px] font-semibold text-text-primary">Deals ({deals.length})</h2>
          </div>
          <div className="px-5 py-4">
            {deals.length === 0 ? (
              <p className="text-[13px] text-text-muted text-center py-4">No deals owned by this user.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {deals.map((deal) => (
                  <Link
                    key={deal.id}
                    to={`/deals/${deal.id}`}
                    data-testid={`user-deal-${deal.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-[5px] hover:bg-hover transition-colors duration-100"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-text-primary">{deal.name}</div>
                      <div className="text-[12px] text-text-muted">{deal.client_name}</div>
                    </div>
                    <div className="flex items-center gap-3 text-[12px]">
                      <span className="text-text-secondary">${Number(deal.value).toLocaleString()}</span>
                      <span className="px-2 py-0.5 rounded-[3px] bg-hover text-text-secondary border border-border">
                        {stageLabels[deal.stage] ?? deal.stage}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div data-testid="user-tasks-section" className="border border-border rounded-[6px] bg-surface">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <CheckSquare size={14} strokeWidth={1.75} className="text-text-muted" />
            <h2 className="text-[14px] font-semibold text-text-primary">Tasks ({tasks.length})</h2>
          </div>
          <div className="px-5 py-4">
            {tasks.length === 0 ? (
              <p className="text-[13px] text-text-muted text-center py-4">No tasks assigned to this user.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    data-testid={`user-task-${task.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-[5px] hover:bg-hover transition-colors duration-100"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm ${task.completed ? 'bg-status-active' : 'border border-border'}`} />
                      <div>
                        <div className={`text-[13px] font-medium ${task.completed ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                          {task.title}
                        </div>
                        {task.client_name && (
                          <div className="text-[12px] text-text-muted">{task.client_name}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-[12px] text-text-muted">
                      {task.due_date ? formatDate(task.due_date) : '—'}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Section */}
        <div data-testid="user-activity-section" className="border border-border rounded-[6px] bg-surface">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Clock size={14} strokeWidth={1.75} className="text-text-muted" />
            <h2 className="text-[14px] font-semibold text-text-primary">Recent Activity</h2>
          </div>
          <div className="px-5 py-4">
            {activity.length === 0 ? (
              <p className="text-[13px] text-text-muted text-center py-4">No recent activity.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {activity.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="text-[12px] text-text-muted whitespace-nowrap mt-0.5">{formatRelativeDate(event.created_at)}</div>
                    <div className="flex-1">
                      <div className="text-[13px] text-text-primary">{event.description}</div>
                      {event.client_name && (
                        <Link to={`/clients/${event.client_id}`} className="text-[12px] text-accent hover:underline">
                          {event.client_name}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
