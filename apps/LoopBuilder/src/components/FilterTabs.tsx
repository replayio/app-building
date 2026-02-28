import type { AppStatus } from '../types';

interface FilterTabsProps {
  activeFilter: AppStatus;
  onFilterChange: (filter: AppStatus) => void;
}

const TABS: { label: string; value: AppStatus }[] = [
  { label: 'Building', value: 'building' },
  { label: 'Finished', value: 'finished' },
  { label: 'Queued', value: 'queued' },
];

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="filter-tabs" data-testid="filter-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          className={`filter-tab ${activeFilter === tab.value ? 'active' : ''}`}
          onClick={() => onFilterChange(tab.value)}
          data-testid={`filter-tab-${tab.value}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
