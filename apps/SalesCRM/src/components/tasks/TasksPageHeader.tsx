import { Plus } from 'lucide-react'

interface TasksPageHeaderProps {
  onCreateTask: () => void
}

export function TasksPageHeader({ onCreateTask }: TasksPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6" data-testid="tasks-page-header">
      <h1 className="text-[24px] font-semibold text-text-primary">Upcoming Tasks</h1>
      <button
        onClick={onCreateTask}
        data-testid="new-task-button"
        className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 transition-opacity duration-100"
      >
        <Plus size={14} strokeWidth={2} />
        New Task
      </button>
    </div>
  )
}
