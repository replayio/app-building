import type { TaskPriority } from '../../types'

interface TaskPriorityBadgeProps {
  priority: TaskPriority
}

const priorityConfig: Record<TaskPriority, { label: string; bg: string; text: string }> = {
  high: { label: 'High', bg: 'bg-red-100', text: 'text-red-700' },
  medium: { label: 'Medium', bg: 'bg-amber-100', text: 'text-amber-700' },
  low: { label: 'Low', bg: 'bg-green-100', text: 'text-green-700' },
  normal: { label: 'Normal', bg: 'bg-blue-100', text: 'text-blue-700' },
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const config = priorityConfig[priority] ?? priorityConfig.normal

  return (
    <span
      data-testid={`task-priority-badge-${priority}`}
      className={`inline-flex items-center justify-center h-[24px] px-2.5 text-[12px] font-medium rounded-[4px] flex-shrink-0 ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  )
}
