import { CheckSquare, Clock, Paperclip, UserPlus } from 'lucide-react'

interface QuickActionsProps {
  onAddTask: () => void
  onAddDeal: () => void
  onAddAttachment: () => void
  onAddPerson: () => void
}

export function QuickActions({ onAddTask, onAddDeal, onAddAttachment, onAddPerson }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <QuickActionButton icon={<CheckSquare size={18} strokeWidth={1.5} />} label="Add Task" onClick={onAddTask} />
      <QuickActionButton icon={<Clock size={18} strokeWidth={1.5} />} label="Add Deal" onClick={onAddDeal} />
      <QuickActionButton icon={<Paperclip size={18} strokeWidth={1.5} />} label="Add Attachment" onClick={onAddAttachment} />
      <QuickActionButton icon={<UserPlus size={18} strokeWidth={1.5} />} label="Add Person" onClick={onAddPerson} />
    </div>
  )
}

function QuickActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 w-[100px] h-[72px] border border-border rounded-[6px] text-text-secondary hover:bg-hover transition-colors duration-100"
    >
      <span className="text-text-muted">{icon}</span>
      <span className="text-[12px] font-medium">{label}</span>
    </button>
  )
}
