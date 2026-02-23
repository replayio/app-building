import { useState } from 'react'
import { X } from 'lucide-react'
import { FilterSelect } from '../shared/FilterSelect'
import type { Deal } from '../../types'

interface AddTaskModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    description: string
    due_date: string
    priority: string
    deal_id: string
  }) => void
  deals: Deal[]
}

export function AddTaskModal({ open, onClose, onSave, deals }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('normal')
  const [dealId, setDealId] = useState('')

  if (!open) return null

  function handleSave() {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description,
      due_date: dueDate,
      priority,
      deal_id: dealId,
    })
    setTitle('')
    setDescription('')
    setDueDate('')
    setPriority('normal')
    setDealId('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-[8px] shadow-[var(--shadow-elevation-2)] w-full max-w-[480px] max-sm:max-w-[calc(100%-24px)] max-h-[90vh] overflow-auto" data-testid="add-task-modal">
        <div className="flex items-center justify-between px-5 max-sm:px-3 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-text-primary">Add Task</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
            data-testid="add-task-modal-close"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-5 max-sm:px-3 py-4 flex flex-col gap-3.5">
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Task Title *</label>
            <input
              data-testid="task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Description</label>
            <textarea
              data-testid="task-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
              className="w-full px-3 py-2 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent resize-none"
            />
          </div>
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Due Date</label>
              <input
                data-testid="task-due-date-input"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Priority</label>
              <FilterSelect
                testId="task-priority-select"
                value={priority}
                onChange={(v) => setPriority(v)}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Associated Deal (optional)</label>
            <FilterSelect
              testId="task-associated-deal-select"
              value={dealId}
              onChange={(v) => setDealId(v)}
              searchable
              options={[
                { value: '', label: 'None' },
                ...deals.map((deal) => ({ value: deal.id, label: deal.name })),
              ]}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 max-sm:px-3 py-4 border-t border-border">
          <button
            data-testid="task-cancel-button"
            onClick={onClose}
            className="h-[34px] px-3.5 text-[13px] font-medium text-text-secondary border border-border rounded-[5px] hover:bg-hover transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            data-testid="task-save-button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="h-[34px] px-3.5 text-[13px] font-medium text-white bg-accent rounded-[5px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-100"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
