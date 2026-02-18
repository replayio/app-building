import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { TaskPriority } from '../../types'
import { FilterSelect } from '../shared/FilterSelect'

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    description: string
    due_date: string
    priority: TaskPriority
    assignee_name: string
    assignee_role: string
    client_id: string
    deal_id: string
  }) => void
  availableClients: { id: string; name: string }[]
  availableDeals: { id: string; name: string; client_id: string }[]
  availableUsers?: { name: string }[]
}

export function CreateTaskModal({ open, onClose, onSave, availableClients, availableDeals, availableUsers = [] }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [assigneeName, setAssigneeName] = useState('')
  const [assigneeRole, setAssigneeRole] = useState('')
  const [clientId, setClientId] = useState('')
  const [dealId, setDealId] = useState('')

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('normal')
      setAssigneeName('')
      setAssigneeRole('')
      setClientId('')
      setDealId('')
    }
  }, [open])

  if (!open) return null

  const filteredDeals = clientId
    ? availableDeals.filter((d) => d.client_id === clientId)
    : availableDeals

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate || null,
      priority,
      assignee_name: assigneeName.trim(),
      assignee_role: assigneeRole.trim(),
      client_id: clientId || null,
      deal_id: dealId || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div data-testid="create-task-modal" className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-[14px] font-semibold text-text-primary">New Task</h3>
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
                data-testid="create-task-title"
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
                data-testid="create-task-description"
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
                  data-testid="create-task-due-date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-text-muted mb-1 block">Priority</label>
                <FilterSelect
                  testId="create-task-priority"
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
                <label className="text-[12px] font-medium text-text-muted mb-1 block">Assignee</label>
                {availableUsers.length > 0 ? (
                  <FilterSelect
                    testId="create-task-assignee-name"
                    value={assigneeName}
                    onChange={(val) => setAssigneeName(val)}
                    placeholder="Select assignee..."
                    options={[
                      { value: '', label: '— None —' },
                      ...availableUsers.map((u) => ({ value: u.name, label: u.name })),
                    ]}
                  />
                ) : (
                  <input
                    type="text"
                    data-testid="create-task-assignee-name"
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    placeholder="e.g., Sarah J."
                    className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder-text-disabled focus:outline-none focus:border-accent"
                  />
                )}
              </div>

              <div>
                <label className="text-[12px] font-medium text-text-muted mb-1 block">Assignee Role</label>
                <input
                  type="text"
                  data-testid="create-task-assignee-role"
                  value={assigneeRole}
                  onChange={(e) => setAssigneeRole(e.target.value)}
                  placeholder="e.g., PM"
                  className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-surface border border-border rounded-[5px] placeholder-text-disabled focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-text-muted mb-1 block">Client</label>
              <FilterSelect
                testId="create-task-client"
                value={clientId}
                onChange={(val) => {
                  setClientId(val)
                  setDealId('')
                }}
                options={[
                  { value: '', label: '\u2014 None \u2014' },
                  ...availableClients.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>

            {clientId && filteredDeals.length > 0 && (
              <div>
                <label className="text-[12px] font-medium text-text-muted mb-1 block">Deal (optional)</label>
                <FilterSelect
                  testId="create-task-deal"
                  value={dealId}
                  onChange={(val) => setDealId(val)}
                  options={[
                    { value: '', label: 'No deal' },
                    ...filteredDeals.map((d) => ({ value: d.id, label: d.name })),
                  ]}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 mt-5">
            <button
              type="button"
              data-testid="create-task-cancel"
              onClick={onClose}
              className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="create-task-save"
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
