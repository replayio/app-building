import { Settings } from 'lucide-react'

export function SettingsPageHeader() {
  return (
    <div className="flex items-center gap-3 mb-6" data-testid="settings-page-header">
      <Settings size={20} strokeWidth={1.75} className="text-text-secondary" />
      <h1 className="text-[24px] font-semibold text-text-primary">Settings</h1>
    </div>
  )
}
