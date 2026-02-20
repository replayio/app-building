import { CheckSquare, Clock, Paperclip, UserPlus } from 'lucide-react'

interface QuickActionsProps {
  onAddTask: () => void
  onAddDeal: () => void
  onAddAttachment: () => void
  onAddPerson: () => void
}

export function QuickActions({ onAddTask, onAddDeal, onAddAttachment, onAddPerson }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6" data-testid="quick-actions">
      <QuickActionButton icon={<CheckSquare size={18} strokeWidth={1.5} />} label="Add Task" onClick={onAddTask} testId="quick-action-add-task" />
      <QuickActionButton icon={<Clock size={18} strokeWidth={1.5} />} label="Add Deal" onClick={onAddDeal} testId="quick-action-add-deal" />
      <QuickActionButton icon={<Paperclip size={18} strokeWidth={1.5} />} label="Add Attachment" onClick={onAddAttachment} testId="quick-action-add-attachment" />
      <QuickActionButton icon={<UserPlus size={18} strokeWidth={1.5} />} label="Add Person" onClick={onAddPerson} testId="quick-action-add-person" />
    </div>
  )
}

function QuickActionButton({ icon, label, onClick, testId }: { icon: React.ReactNode; label: string; onClick: () => void; testId: string }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="flex flex-col items-center justify-center gap-1.5 w-[100px] h-[72px] border border-border rounded-[6px] text-text-secondary hover:bg-hover transition-colors duration-100"
    >
      <span className="text-text-muted">{icon}</span>
      <span className="text-[12px] font-medium">{label}</span>
    </button>
  )
}
