import { useNavigate } from "react-router-dom";
import type { UserDetail } from "../userDetailSlice";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatJoinDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

interface UserHeaderProps {
  user: UserDetail;
}

export function UserHeader({ user }: UserHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="user-detail-header" data-testid="user-header">
      <button
        className="user-detail-back"
        data-testid="back-to-team"
        onClick={() => navigate("/users")}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Team
      </button>
      <div className="user-detail-header-content">
        <div className="user-detail-avatar" data-testid="user-avatar">
          {user.avatarUrl ? (
            <img className="user-detail-avatar-img" src={user.avatarUrl} alt={user.name} />
          ) : (
            <span className="user-detail-avatar-initials">{getInitials(user.name)}</span>
          )}
        </div>
        <div className="user-detail-info">
          <h1 className="user-detail-name" data-testid="user-name">{user.name}</h1>
          <span className="user-detail-email" data-testid="user-email">{user.email}</span>
          <span className="user-detail-joined" data-testid="user-join-date">
            Joined {formatJoinDate(user.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
