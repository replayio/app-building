import type { Account } from "../types";

interface AccountRowActionsProps {
  account: Account;
  onView: () => void;
  onEdit: () => void;
  onArchive: () => void;
}

export function AccountRowActions({
  account,
  onView,
  onEdit,
  onArchive,
}: AccountRowActionsProps) {
  return (
    <div
      data-testid={`account-actions-${account.id}`}
      style={{ display: "flex", gap: 4, alignItems: "center" }}
    >
      {/* View (eye icon) */}
      <button
        data-testid={`account-view-btn-${account.id}`}
        className="btn-ghost"
        title="View"
        onClick={onView}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 16, height: 16 }}
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {/* Edit (pencil icon) */}
      <button
        data-testid={`account-edit-btn-${account.id}`}
        className="btn-ghost"
        title="Edit"
        onClick={onEdit}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 16, height: 16 }}
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

      {/* Archive (archive icon) */}
      <button
        data-testid={`account-archive-btn-${account.id}`}
        className="btn-ghost"
        title="Archive"
        onClick={onArchive}
        disabled={account.is_default}
        style={account.is_default ? { opacity: 0.3, cursor: "default" } : undefined}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 16, height: 16 }}
        >
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      </button>
    </div>
  );
}
