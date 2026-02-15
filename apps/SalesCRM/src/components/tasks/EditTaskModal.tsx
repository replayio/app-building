import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Task, TaskPriority } from '../../types'
import { FilterSelect } from '../shared/FilterSelect'

interface EditTaskModalProps {
  open: boolean
  task: Task | null
  onClose: () => void
  onSave: (taskId: string, data: {
    title: string
    description: string
    due_date: string
    priority: TaskPriority
    assignee_name: string
    assignee_role: string
  }) => void
}

export function EditTaskModal({ open, task, onClose, onSave }: EditTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [assigneeName, setAssigneeName] = useState('')
  const [assigneeRole, setAssigneeRole] = useState('')

  useEffect(() => {
    if (open && task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
      setPriority(task.priority)
      setAssigneeName(task.assignee_name ?? '')
      setAssigneeRole(task.assignee_role ?? '')
    }
  }, [open, task])

  if (!open || !task) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !task) return
    onSave(task.id, {
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate,
      priority,
      assignee_name: assigneeName.trim(),
      assignee_role: assigneeRole.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div data-testid="edit-task-modal" className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-[14px] font-semibold text-text-primary">Edit Task</h3>
          <button
            onClick={onClose}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] hover:bg-hover transition-colors duration-100 text-text-muted"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[12px] font-medium text-text-muted mb-1 block">Title *</label>
              <input
                type="text"
                data-testid="edit-task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder-text-disabled focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-text-muted mb-1 block">Description</label>
              <textarea
                data-testid="edit-task-description-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                rows={3}
                className="w-full px-3 py-2 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder-text-disabled focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-text-muted mb-1 block">Due Date</label>
                <input
                  type="date"
                  data-testid="edit-task-due-date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-text-muted mb-1 block">Priority</label>
                <FilterSelect
                  testId="edit-task-priority"
                  value={priority}
                  onChange={(val) => setPriority(val as TaskPriority)}
                  options={[
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' },
                    { value: 'normal', label: 'Normal' },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-text-muted mb-1 block">Assignee Name</label>
                <input
                  type="text"
                  data-testid="edit-task-assignee-name-input"
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  placeholder="e.g., Sarah J."
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder-text-disabled focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-text-muted mb-1 block">Assignee Role</label>
                <input
                  type="text"
                  data-testid="edit-task-assignee-role-input"
                  value={assigneeRole}
                  onChange={(e) => setAssigneeRole(e.target.value)}
                  placeholder="e.g., PM"
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder-text-disabled focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-5">
            <button
              type="button"
              data-testid="edit-task-cancel"
              onClick={onClose}
              className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="edit-task-save"
              disabled={!title.trim()}
              className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 transition-opacity duration-100 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
