import { Users } from 'lucide-react'

export function UsersPageHeader() {
  return (
    <div className="flex items-center gap-3 mb-6" data-testid="users-page-header">
      <Users size={20} strokeWidth={1.75} className="text-text-secondary" />
      <h1 className="text-[24px] font-semibold text-text-primary">Team Members</h1>
    </div>
  )
}
