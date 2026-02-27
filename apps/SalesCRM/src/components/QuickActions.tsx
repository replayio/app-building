interface QuickActionsProps {
  onAddTask: () => void;
  onAddDeal: () => void;
  onAddAttachment: () => void;
  onAddPerson: () => void;
}

export function QuickActions({
  onAddTask,
  onAddDeal,
  onAddAttachment,
  onAddPerson,
}: QuickActionsProps) {
  return (
    <div className="quick-actions" data-testid="quick-actions">
      <button
        className="quick-action-btn"
        data-testid="add-task-btn"
        onClick={onAddTask}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="max-sm:hidden">Add Task</span>
      </button>
      <button
        className="quick-action-btn"
        data-testid="add-deal-btn"
        onClick={onAddDeal}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2V14M5 4H11C12 4 13 4.9 13 6C13 7.1 12 8 11 8H5M5 8H11.5C12.5 8 13.5 8.9 13.5 10C13.5 11.1 12.5 12 11.5 12H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="max-sm:hidden">Add Deal</span>
      </button>
      <button
        className="quick-action-btn"
        data-testid="add-attachment-btn"
        onClick={onAddAttachment}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13.5 7.5L8 13C6.5 14.5 4 14.5 2.5 13C1 11.5 1 9 2.5 7.5L8 2C9 1 10.5 1 11.5 2C12.5 3 12.5 4.5 11.5 5.5L6 11C5.5 11.5 4.75 11.5 4.25 11C3.75 10.5 3.75 9.75 4.25 9.25L9.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="max-sm:hidden">Add Attachment</span>
      </button>
      <button
        className="quick-action-btn"
        data-testid="add-person-btn"
        onClick={onAddPerson}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3 14C3 11 5 9 8 9C11 9 13 11 13 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M12 4V8M10 6H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="max-sm:hidden">Add Person</span>
      </button>
    </div>
  );
}
