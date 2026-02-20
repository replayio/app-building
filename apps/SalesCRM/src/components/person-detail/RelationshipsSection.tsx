import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Filter, Plus, Link as LinkIcon, Trash2 } from 'lucide-react'
import type { Relationship, RelationshipType } from '../../types'

interface RelationshipsSectionProps {
  relationships: Relationship[]
  onAddEntry: () => void
  onDeleteRelationship: (relationshipId: string) => void
}

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  colleague: 'Colleague',
  decision_maker: 'Decision Maker',
  influencer: 'Influencer',
  manager: 'Manager',
  report: 'Report',
  other: 'Other',
}

export function RelationshipsSection({ relationships, onAddEntry, onDeleteRelationship }: RelationshipsSectionProps) {
  const navigate = useNavigate()
  const [view, setView] = useState<'list' | 'graph'>('list')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterOpen, setFilterOpen] = useState(false)

  const filteredRelationships = filterType === 'all'
    ? relationships
    : relationships.filter((r) => r.relationship_type === filterType)

  const uniqueTypes = Array.from(new Set(relationships.map((r) => r.relationship_type)))

  return (
    <div data-testid="relationships-section" className="border border-border rounded-[6px] p-4 mb-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Users size={16} strokeWidth={1.5} className="text-text-muted" />
          <h2 className="text-[14px] font-semibold text-text-primary">Relationships with Other Individuals</h2>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              data-testid="relationships-filter-button"
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center gap-1 h-7 px-2.5 text-[12px] font-medium text-text-secondary border border-border rounded-[4px] hover:bg-hover transition-colors duration-100"
            >
              <Filter size={13} strokeWidth={1.75} />
              Filter
            </button>
            {filterOpen && (
              <div data-testid="relationships-filter-dropdown" className="absolute right-0 top-full mt-1 z-10 bg-surface border border-border rounded-[6px] shadow-[var(--shadow-elevation-2)] min-w-[160px]">
                <div
                  data-testid="relationships-filter-option-all"
                  onClick={() => { setFilterType('all'); setFilterOpen(false) }}
                  className="px-3 py-2 text-[13px] text-text-primary cursor-pointer hover:bg-hover"
                >
                  All
                </div>
                {uniqueTypes.map((type) => (
                  <div
                    key={type}
                    data-testid={`relationships-filter-option-${type}`}
                    onClick={() => { setFilterType(type); setFilterOpen(false) }}
                    className="px-3 py-2 text-[13px] text-text-primary cursor-pointer hover:bg-hover"
                  >
                    {RELATIONSHIP_LABELS[type as RelationshipType] ?? type}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            data-testid="relationships-add-entry-button"
            onClick={onAddEntry}
            className="inline-flex items-center gap-1 h-7 px-2.5 text-[12px] font-medium text-white bg-accent rounded-[4px] hover:opacity-90 transition-opacity duration-100"
          >
            <Plus size={13} strokeWidth={2} />
            Add Entry
          </button>
        </div>
      </div>

      {/* View toggle tabs */}
      <div data-testid="relationships-view-toggle" className="flex items-center gap-0 mb-3 border-b border-border">
        <button
          data-testid="relationships-graph-view-tab"
          onClick={() => setView('graph')}
          className={`px-3 py-1.5 text-[12px] font-medium border-b-2 transition-colors duration-100 ${
            view === 'graph'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          Graph View
        </button>
        <button
          data-testid="relationships-list-view-tab"
          onClick={() => setView('list')}
          className={`px-3 py-1.5 text-[12px] font-medium border-b-2 transition-colors duration-100 ${
            view === 'list'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          List View
        </button>
      </div>

      {view === 'list' ? (
        <div data-testid="relationships-list-view">
          {filteredRelationships.length === 0 ? (
            <div data-testid="relationships-empty-state" className="text-[13px] text-text-muted py-2">No relationships found</div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredRelationships.map((rel) => (
                <div
                  key={rel.id}
                  data-testid={`relationship-item-${rel.id}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[4px] hover:bg-hover transition-colors duration-100"
                >
                  <div className="flex-1 min-w-0">
                    <span data-testid={`relationship-name-${rel.id}`} className="text-[13px] font-medium text-text-primary">
                      {rel.related_individual_name}
                    </span>
                    <span data-testid={`relationship-type-${rel.id}`} className="text-[13px] text-text-muted ml-1">
                      ({RELATIONSHIP_LABELS[rel.relationship_type as RelationshipType] ?? rel.relationship_type})
                    </span>
                    {rel.role && (
                      <span className="text-[13px] text-text-muted ml-1">
                        - {rel.role}
                      </span>
                    )}
                    {rel.company && (
                      <span className="text-[13px] text-text-muted">, {rel.company}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button
                      data-testid={`relationship-link-${rel.id}`}
                      onClick={() => navigate(`/individuals/${rel.related_individual_id}`)}
                      className="inline-flex items-center gap-1 text-[12px] text-accent hover:underline cursor-pointer"
                    >
                      <LinkIcon size={12} strokeWidth={1.75} />
                      Link
                    </button>
                    <button
                      data-testid={`relationship-delete-${rel.id}`}
                      onClick={() => onDeleteRelationship(rel.id)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:text-status-churned hover:bg-hover transition-colors duration-100"
                      title="Delete relationship"
                    >
                      <Trash2 size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div data-testid="relationships-graph-view" className="py-4">
          {/* Simple graph view: central node with connections */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[400px] min-h-[200px] flex items-center justify-center">
              {/* Center node */}
              <div data-testid="relationships-graph-center" className="absolute z-10 bg-accent text-white rounded-full w-14 h-14 flex items-center justify-center text-[11px] font-semibold text-center leading-tight px-1">
                You
              </div>
              {/* Relationship nodes arranged in a circle */}
              {filteredRelationships.map((rel, idx) => {
                const total = filteredRelationships.length
                const angle = (2 * Math.PI * idx) / total - Math.PI / 2
                const radiusX = 150
                const radiusY = 80
                const x = Math.cos(angle) * radiusX
                const y = Math.sin(angle) * radiusY

                return (
                  <div
                    key={rel.id}
                    data-testid={`relationships-graph-node-${rel.id}`}
                    className="absolute z-10"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    {/* Connection line */}
                    <svg
                      className="absolute"
                      style={{
                        left: '50%',
                        top: '50%',
                        width: 0,
                        height: 0,
                        overflow: 'visible',
                      }}
                    >
                      <line
                        x1={0}
                        y1={0}
                        x2={-x}
                        y2={-y}
                        stroke="#dcdcdc"
                        strokeWidth={1}
                      />
                    </svg>
                    <div
                      onClick={() => navigate(`/individuals/${rel.related_individual_id}`)}
                      className="bg-surface border border-border rounded-[6px] px-2 py-1.5 text-center cursor-pointer hover:border-accent transition-colors duration-100 min-w-[80px]"
                    >
                      <div className="text-[11px] font-medium text-text-primary truncate">
                        {rel.related_individual_name}
                      </div>
                      <div className="text-[10px] text-text-muted truncate">
                        {RELATIONSHIP_LABELS[rel.relationship_type as RelationshipType] ?? rel.relationship_type}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
