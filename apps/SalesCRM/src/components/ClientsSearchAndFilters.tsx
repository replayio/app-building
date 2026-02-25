import { FilterSelect } from "@shared/components/FilterSelect";

const STATUS_OPTIONS = [
  { value: "", label: "Status: All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "prospect", label: "Prospect" },
  { value: "churned", label: "Churned" },
];

const SORT_OPTIONS = [
  { value: "updated_desc", label: "Sort: Recently Updated" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "created_desc", label: "Newest First" },
  { value: "created_asc", label: "Oldest First" },
];

interface ClientsSearchAndFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  tag: string;
  onTagChange: (value: string) => void;
  source: string;
  onSourceChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  tagOptions: { value: string; label: string }[];
  sourceOptions: { value: string; label: string }[];
}

export function ClientsSearchAndFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  tag,
  onTagChange,
  source,
  onSourceChange,
  sort,
  onSortChange,
  tagOptions,
  sourceOptions,
}: ClientsSearchAndFiltersProps) {
  return (
    <div className="clients-filters" data-testid="clients-filters">
      <div className="clients-search-wrapper">
        <svg className="clients-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <input
          className="clients-search-input"
          data-testid="clients-search"
          type="text"
          placeholder="Search clients by name, tag, or contact..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="clients-filter-row">
        <FilterSelect
          options={STATUS_OPTIONS}
          value={status}
          onChange={onStatusChange}
          placeholder="Status: All"
          testId="status-filter"
        />
        <FilterSelect
          options={tagOptions}
          value={tag}
          onChange={onTagChange}
          placeholder="Tags: All"
          searchable
          testId="tags-filter"
        />
        <FilterSelect
          options={sourceOptions}
          value={source}
          onChange={onSourceChange}
          placeholder="Source: All"
          testId="source-filter"
        />
        <FilterSelect
          options={SORT_OPTIONS}
          value={sort}
          onChange={onSortChange}
          placeholder="Sort: Recently Updated"
          testId="sort-filter"
        />
      </div>
    </div>
  );
}
