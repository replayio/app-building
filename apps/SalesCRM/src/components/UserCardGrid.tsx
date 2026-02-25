import { useNavigate } from "react-router-dom";
import type { User } from "../usersSlice";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UserCardGridProps {
  users: User[];
}

export function UserCardGrid({ users }: UserCardGridProps) {
  const navigate = useNavigate();

  if (users.length === 0) {
    return (
      <div className="user-card-grid-empty" data-testid="user-card-grid-empty">
        No team members found.
      </div>
    );
  }

  return (
    <div className="user-card-grid" data-testid="user-card-grid">
      {users.map((user) => (
        <div
          key={user.id}
          className="user-card"
          data-testid={`user-card-${user.id}`}
          onClick={() => navigate(`/users/${user.id}`)}
        >
          <div className="user-card-avatar" data-testid={`user-avatar-${user.id}`}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="user-card-avatar-img" />
            ) : (
              <span className="user-card-avatar-initials">{getInitials(user.name)}</span>
            )}
          </div>
          <div className="user-card-name" data-testid={`user-name-${user.id}`}>{user.name}</div>
          <div className="user-card-email" data-testid={`user-email-${user.id}`}>{user.email}</div>
          <div className="user-card-stats">
            <div className="user-card-stat" data-testid={`user-active-deals-${user.id}`}>
              <span className="user-card-stat-value">{user.activeDeals}</span>
              <span className="user-card-stat-label">Active Deals</span>
            </div>
            <div className="user-card-stat" data-testid={`user-open-tasks-${user.id}`}>
              <span className="user-card-stat-value">{user.openTasks}</span>
              <span className="user-card-stat-label">Open Tasks</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
