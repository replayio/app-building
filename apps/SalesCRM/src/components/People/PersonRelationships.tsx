import { useState, useRef, useEffect } from 'react'
import { Link2, Filter, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { IndividualRelationship } from '../../store/slices/individualsSlice'
import AddRelationshipModal from './AddRelationshipModal'

interface PersonRelationshipsProps {
  relationships: IndividualRelationship[]
  individualId: string
  onRelationshipsChanged: () => void
}

const RELATIONSHIP_TYPES = ['Colleague', 'Decision Maker', 'Influencer', 'Manager', 'Report', 'Partner', 'Advisor']

export default function PersonRelationships({ relationships, individualId, onRelationshipsChanged }: PersonRelationshipsProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'list' | 'graph'>('list')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [filterOpen])

  const filteredRelationships = filterType
    ? relationships.filter((r) => r.relationship_type === filterType)
    : relationships

  const availableTypes = [...new Set(relationships.map((r) => r.relationship_type))]

  async function handleDelete(relationshipId: string) {
    const res = await fetch(`/.netlify/functions/individual-relationships/${relationshipId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      onRelationshipsChanged()
    }
  }

  async function handleAddRelationship(data: { related_individual_id: string; relationship_type: string }) {
    const res = await fetch('/.netlify/functions/individual-relationships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        individual_id: individualId,
        related_individual_id: data.related_individual_id,
        relationship_type: data.relationship_type,
      }),
    })
    if (!res.ok) throw new Error('Failed to add relationship')
    onRelationshipsChanged()
  }

  return (
    <div data-testid="person-relationships" className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link2 size={15} className="text-[var(--color-text-muted)]" />
          <h2 className="text-[14px] font-semibold text-[var(--color-text-secondary)]">
            Relationships with Other Individuals
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter button */}
          <div className="relative" ref={filterRef}>
            <button
              data-testid="relationships-filter-button"
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className={`h-7 px-2.5 rounded flex items-center gap-1.5 text-[12px] cursor-pointer border transition-colors duration-100 ${
                filterType
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[rgba(113,128,255,0.08)]'
                  : 'border-[var(--color-bg-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-hover)]'
              }`}
            >
              <Filter size={13} />
              <span>Filter</span>
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-[var(--color-bg-base)] border border-[var(--color-bg-border)] rounded-lg shadow-[var(--shadow-elevation-2)] min-w-[180px] py-1">
                <button
                  type="button"
                  data-testid="relationships-filter-all"
                  onClick={() => { setFilterType(null); setFilterOpen(false) }}
                  className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[var(--color-hover)] cursor-pointer ${
                    !filterType ? 'text-[var(--color-accent)] font-medium' : 'text-[var(--color-text-primary)]'
                  }`}
                >
                  All Types
                </button>
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    data-testid={`relationships-filter-${type.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => { setFilterType(type); setFilterOpen(false) }}
                    className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[var(--color-hover)] cursor-pointer ${
                      filterType === type ? 'text-[var(--color-accent)] font-medium' : 'text-[var(--color-text-primary)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add button */}
          <button
            data-testid="relationships-add-button"
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="h-7 px-2.5 rounded flex items-center gap-1.5 text-[12px] cursor-pointer border border-[var(--color-bg-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-hover)]"
          >
            <Plus size={13} />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--color-bg-border)] mb-3">
        <button
          data-testid="relationships-tab-graph"
          type="button"
          onClick={() => setActiveTab('graph')}
          className={`px-3 py-1.5 text-[12px] font-medium cursor-pointer transition-colors duration-100 border-b-2 -mb-px ${
            activeTab === 'graph'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          Graph View
        </button>
        <button
          data-testid="relationships-tab-list"
          type="button"
          onClick={() => setActiveTab('list')}
          className={`px-3 py-1.5 text-[12px] font-medium cursor-pointer transition-colors duration-100 border-b-2 -mb-px ${
            activeTab === 'list'
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          List View
        </button>
      </div>

      {/* Content */}
      {activeTab === 'list' ? (
        filteredRelationships.length === 0 ? (
          <div data-testid="relationships-empty" className="rounded-lg border border-[var(--color-bg-border)] p-6 text-center">
            <p className="text-[13px] text-[var(--color-text-muted)]">No relationships found</p>
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--color-bg-border)] divide-y divide-[var(--color-bg-border)]">
            {filteredRelationships.map((rel) => (
              <div
                key={rel.id}
                data-testid={`relationship-row-${rel.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-hover)] transition-colors duration-100"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[13px] text-[var(--color-text-primary)]">
                    {rel.related_individual_name}
                    {' '}
                    <span className="text-[var(--color-text-muted)]">({rel.relationship_type})</span>
                  </span>
                  {(rel.related_individual_title || rel.related_individual_clients) && (
                    <span className="text-[13px] text-[var(--color-text-muted)]">
                      {' — '}
                      {[rel.related_individual_title, rel.related_individual_clients].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  data-testid={`relationship-link-${rel.related_individual_id}`}
                  onClick={() => navigate(`/individuals/${rel.related_individual_id}`)}
                  className="text-[12px] text-[var(--color-accent)] hover:underline cursor-pointer shrink-0"
                >
                  [Link]
                </button>
                <button
                  type="button"
                  data-testid={`relationship-delete-${rel.id}`}
                  onClick={() => handleDelete(rel.id)}
                  className="p-1 rounded hover:bg-[var(--color-hover)] cursor-pointer text-[var(--color-text-muted)] shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <div data-testid="relationships-graph" className="rounded-lg border border-[var(--color-bg-border)] p-6">
          {relationships.length === 0 ? (
            <p className="text-[13px] text-[var(--color-text-muted)] text-center">No relationships found</p>
          ) : (
            <RelationshipGraph relationships={relationships} />
          )}
        </div>
      )}

      <AddRelationshipModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddRelationship}
        currentIndividualId={individualId}
      />
    </div>
  )
}

function RelationshipGraph({ relationships }: { relationships: IndividualRelationship[] }) {
  const width = 600
  const height = 400
  const centerX = width / 2
  const centerY = height / 2

  return (
    <div className="flex justify-center overflow-auto">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full">
        {/* Center node */}
        <circle cx={centerX} cy={centerY} r={30} fill="var(--color-accent)" opacity={0.15} stroke="var(--color-accent)" strokeWidth={2} />
        <text x={centerX} y={centerY + 4} textAnchor="middle" fontSize={11} fill="var(--color-accent)" fontWeight={600}>
          You
        </text>

        {/* Related nodes */}
        {relationships.map((rel, idx) => {
          const angle = (2 * Math.PI * idx) / relationships.length - Math.PI / 2
          const radius = 140
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)

          return (
            <g key={rel.id}>
              {/* Line */}
              <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="var(--color-bg-border)" strokeWidth={1.5} />
              {/* Label on line */}
              <text
                x={(centerX + x) / 2}
                y={(centerY + y) / 2 - 6}
                textAnchor="middle"
                fontSize={9}
                fill="var(--color-text-muted)"
              >
                {rel.relationship_type}
              </text>
              {/* Node */}
              <circle cx={x} cy={y} r={24} fill="var(--color-bg-base)" stroke="var(--color-bg-border)" strokeWidth={1.5} />
              <text x={x} y={y - 2} textAnchor="middle" fontSize={10} fill="var(--color-text-primary)" fontWeight={500}>
                {rel.related_individual_name.split(' ')[0]}
              </text>
              <text x={x} y={y + 10} textAnchor="middle" fontSize={8} fill="var(--color-text-muted)">
                {rel.related_individual_name.split(' ').slice(1).join(' ').slice(0, 10)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
