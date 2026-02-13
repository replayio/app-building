import { TrendingUp, DollarSign, Trophy, XCircle } from 'lucide-react'

interface DealsSummaryCardsProps {
  totalActive: number
  pipelineValue: number
  wonCount: number
  wonValue: number
  lostCount: number
  lostValue: number
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}k`
  }
  return `$${value.toLocaleString()}`
}

function SummaryCard({
  icon,
  iconBg,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  subValue?: string
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-surface border border-border rounded-[6px]">
      <div className={`flex items-center justify-center w-10 h-10 rounded-[6px] ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-[12px] text-text-muted">{label}</p>
        <p className="text-[18px] font-semibold text-text-primary">{value}</p>
        {subValue && <p className="text-[11px] text-text-muted">{subValue}</p>}
      </div>
    </div>
  )
}

export function DealsSummaryCards({
  totalActive,
  pipelineValue,
  wonCount,
  wonValue,
  lostCount,
  lostValue,
}: DealsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <SummaryCard
        icon={<TrendingUp size={18} className="text-accent" />}
        iconBg="bg-accent/10"
        label="Total Active Deals"
        value={String(totalActive)}
      />
      <SummaryCard
        icon={<DollarSign size={18} className="text-accent-blue" />}
        iconBg="bg-accent-blue/10"
        label="Pipeline Value"
        value={formatCurrency(pipelineValue)}
      />
      <SummaryCard
        icon={<Trophy size={18} className="text-status-active" />}
        iconBg="bg-status-active/10"
        label="Won (Quarter)"
        value={`${wonCount}`}
        subValue={formatCurrency(wonValue)}
      />
      <SummaryCard
        icon={<XCircle size={18} className="text-status-churned" />}
        iconBg="bg-status-churned/10"
        label="Lost (Quarter)"
        value={`${lostCount}`}
        subValue={formatCurrency(lostValue)}
      />
    </div>
  )
}
