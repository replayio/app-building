import { Briefcase, CheckSquare, BarChart3 } from 'lucide-react'
import type { UserDetail } from '../../store/slices/usersSlice'

interface UserDetailStatsProps {
  user: UserDetail
}

export default function UserDetailStats({ user }: UserDetailStatsProps) {
  const stats = [
    {
      label: 'Active Deals',
      value: user.active_deals_count,
      icon: Briefcase,
      testId: 'stat-active-deals',
    },
    {
      label: 'Open Tasks',
      value: user.open_tasks_count,
      icon: CheckSquare,
      testId: 'stat-open-tasks',
    },
    {
      label: 'Total Deals',
      value: user.total_deals_count,
      icon: BarChart3,
      testId: 'stat-total-deals',
    },
  ]

  return (
    <div data-testid="user-detail-stats" className="grid grid-cols-3 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.testId}
          data-testid={stat.testId}
          className="rounded-lg border border-[var(--color-bg-border)] p-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--color-hover)] flex items-center justify-center text-[var(--color-text-muted)]">
            <stat.icon size={18} />
          </div>
          <div>
            <div className="text-xl font-semibold text-[var(--color-text-primary)]">{stat.value}</div>
            <div className="text-[12px] text-[var(--color-text-muted)]">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
