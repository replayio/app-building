import { Plus, Download } from 'lucide-react'

interface TasksPageHeaderProps {
  onCreateTask: () => void
  onImport: () => void
}

export function TasksPageHeader({ onCreateTask, onImport }: TasksPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6" data-testid="tasks-page-header">
      <h1 className="text-[24px] font-semibold text-text-primary">Upcoming Tasks</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={onImport}
          data-testid="tasks-import-button"
          className="inline-flex items-center gap-1.5 h-[34px] px-3 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] bg-surface hover:bg-hover transition-colors duration-100"
        >
          <Download size={14} strokeWidth={1.75} />
          Import
        </button>
        <button
          onClick={onCreateTask}
          data-testid="new-task-button"
          className="inline-flex items-center gap-1.5 h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 transition-opacity duration-100"
        >
          <Plus size={14} strokeWidth={2} />
          New Task
        </button>
      </div>
    </div>
  )
}
