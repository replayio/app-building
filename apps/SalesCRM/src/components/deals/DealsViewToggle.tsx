interface DealsViewToggleProps {
  view: 'table' | 'pipeline'
  onViewChange: (view: 'table' | 'pipeline') => void
}

export function DealsViewToggle({ view, onViewChange }: DealsViewToggleProps) {
  return (
    <div className="flex items-center border border-border rounded-[5px] overflow-hidden mb-4">
      <button
        onClick={() => onViewChange('table')}
        className={`h-[32px] px-4 text-[13px] font-medium transition-colors duration-100 ${
          view === 'table'
            ? 'bg-accent text-white'
            : 'bg-surface text-text-secondary hover:bg-hover'
        }`}
      >
        Table View
      </button>
      <button
        onClick={() => onViewChange('pipeline')}
        className={`h-[32px] px-4 text-[13px] font-medium transition-colors duration-100 ${
          view === 'pipeline'
            ? 'bg-accent text-white'
            : 'bg-surface text-text-secondary hover:bg-hover'
        }`}
      >
        Pipeline View
      </button>
    </div>
  )
}
