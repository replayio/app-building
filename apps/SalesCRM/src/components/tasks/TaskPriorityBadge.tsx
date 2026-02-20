import type { TaskPriority } from '../../types'

interface TaskPriorityBadgeProps {
  priority: TaskPriority
}

const priorityLabels: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  normal: 'Normal',
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const label = priorityLabels[priority] ?? priorityLabels.normal
  const validPriority = priority in priorityLabels ? priority : 'normal'

  return (
    <span
      data-testid={`task-priority-badge-${priority}`}
      className="inline-flex items-center justify-center h-[24px] px-2.5 text-[12px] font-medium rounded-[4px] flex-shrink-0"
      style={{
        backgroundColor: `var(--color-priority-${validPriority}-bg)`,
        color: `var(--color-priority-${validPriority}-text)`,
      }}
    >
      {label}
    </span>
  )
}
