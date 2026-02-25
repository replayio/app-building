import type { UserDetail } from "../userDetailSlice";

interface UserStatsProps {
  user: UserDetail;
}

export function UserStats({ user }: UserStatsProps) {
  return (
    <div className="user-detail-stats" data-testid="user-stats">
      <div className="user-detail-stat" data-testid="user-stat-active-deals">
        <span className="user-detail-stat-value">{user.activeDeals}</span>
        <span className="user-detail-stat-label">Active Deals</span>
      </div>
      <div className="user-detail-stat" data-testid="user-stat-open-tasks">
        <span className="user-detail-stat-value">{user.openTasks}</span>
        <span className="user-detail-stat-label">Open Tasks</span>
      </div>
      <div className="user-detail-stat" data-testid="user-stat-total-deals">
        <span className="user-detail-stat-value">{user.totalDeals}</span>
        <span className="user-detail-stat-label">Total Deals</span>
      </div>
    </div>
  );
}
