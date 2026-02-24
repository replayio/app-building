import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface Relationship {
  id: string
  relationship_type: string
  related_id: string
  related_name: string
  related_title: string | null
  related_client_name: string | null
}

interface Individual {
  id: string
  name: string
  title: string | null
  email: string | null
}

interface RelationshipsSectionProps {
  individualId: string
}

const RELATIONSHIP_TYPES = ['Colleague', 'Decision Maker', 'Influencer', 'Manager', 'Report', 'Partner']

export default function RelationshipsSection({ individualId }: RelationshipsSectionProps) {
  const navigate = useNavigate()
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [activeTab, setActiveTab] = useState<'list' | 'graph'>('list')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchRelationships = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/individuals/${individualId}/relationships`)
      const data = await res.json()
      setRelationships(data.relationships || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [individualId])

  useEffect(() => {
    fetchRelationships()
  }, [fetchRelationships])

  const uniqueClients = Array.from(
    new Set(relationships.map(r => r.related_client_name).filter((c): c is string => !!c))
  ).sort()

  const handleDeleteRelationship = async (relationshipId: string) => {
    try {
      await fetch(`/.netlify/functions/individuals/${individualId}/relationships/${relationshipId}`, {
        method: 'DELETE',
      })
      fetchRelationships()
    } catch {
      // silently fail
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const filteredRelationships = relationships.filter(r => {
    if (filterType && r.relationship_type !== filterType) return false
    if (filterClient && r.related_client_name !== filterClient) return false
    return true
  })

  return (
    <div className="person-section" data-testid="relationships-section">
      <div className="person-section-header">
        <div className="person-section-heading">
          {/* Test: Relationships section displays heading with icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          <h2 data-testid="relationships-heading">Relationships with Other Individuals</h2>
        </div>
        <div className="person-section-actions">
          {/* Test: Filter button is displayed in Relationships section */}
          {/* Test: Filter button opens filter options for relationships */}
          {/* Test: Filtering relationships by type shows only matching entries */}
          {/* Test: Filtering relationships by client shows only matching entries */}
          {/* Test: Resetting relationship type filter to All Types shows all entries */}
          {/* Test: Resetting relationship client filter to All Clients shows all entries */}
          {/* Test: Relationship filter applies to both List View and Graph View */}
          <div className="filter-dropdown-wrapper">
            <button
              className="btn-ghost"
              data-testid="relationships-filter-button"
              onClick={() => setShowFilter(!showFilter)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter
            </button>
            {showFilter && (
              <div className="filter-dropdown-menu" data-testid="relationships-filter-menu">
                <div className="filter-section-label" data-testid="relationships-filter-type-label">By Type</div>
                <button
                  className={`filter-dropdown-option ${filterType === '' ? 'selected' : ''}`}
                  onClick={() => { setFilterType(''); setShowFilter(false) }}
                >
                  All Types
                </button>
                {RELATIONSHIP_TYPES.map(type => (
                  <button
                    key={type}
                    className={`filter-dropdown-option ${filterType === type ? 'selected' : ''}`}
                    onClick={() => { setFilterType(type); setShowFilter(false) }}
                  >
                    {type}
                  </button>
                ))}
                <div className="filter-section-divider" />
                <div className="filter-section-label" data-testid="relationships-filter-client-label">By Client</div>
                <button
                  className={`filter-dropdown-option ${filterClient === '' ? 'selected' : ''}`}
                  data-testid="relationships-client-all"
                  onClick={() => { setFilterClient(''); setShowFilter(false) }}
                >
                  All Clients
                </button>
                {uniqueClients.map(client => (
                  <button
                    key={client}
                    className={`filter-dropdown-option ${filterClient === client ? 'selected' : ''}`}
                    data-testid="relationships-client-option"
                    onClick={() => { setFilterClient(client); setShowFilter(false) }}
                  >
                    {client}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Test: Add Entry button is displayed in Relationships section */}
          {/* Test: Add Entry button opens relationship creation form */}
          <button
            className="btn-primary"
            data-testid="relationships-add-button"
            onClick={() => setShowAddForm(true)}
          >
            + Add Entry
          </button>
        </div>
      </div>

      {/* Test: Relationships section shows Graph View and List View tabs */}
      {/* Test: Switching to Graph View tab */}
      {/* Test: Switching back to List View from Graph View */}
      <div className="person-tabs">
        <button
          className={`person-tab ${activeTab === 'graph' ? 'active' : ''}`}
          data-testid="graph-view-tab"
          onClick={() => setActiveTab('graph')}
        >
          Graph View
        </button>
        <button
          className={`person-tab ${activeTab === 'list' ? 'active' : ''}`}
          data-testid="list-view-tab"
          onClick={() => setActiveTab('list')}
        >
          List View
        </button>
      </div>

      {loading ? (
        <p className="person-section-loading">Loading...</p>
      ) : activeTab === 'list' ? (
        /* Test: List View displays relationship entries with all details */
        filteredRelationships.length > 0 ? (
          <div className="relationships-list" data-testid="relationships-list">
            {filteredRelationships.map(rel => (
              <div key={rel.id} className="relationship-entry" data-testid="relationship-entry">
                <span className="relationship-name">{rel.related_name}</span>
                <span className="relationship-type"> ({rel.relationship_type})</span>
                {rel.related_title && <span className="relationship-detail"> - {rel.related_title}</span>}
                {rel.related_client_name && <span className="relationship-detail">, {rel.related_client_name}</span>}
                {/* Test: Relationship entry Link navigates to the related person's detail page */}
                {/* Test: Each relationship Link navigates to the correct person */}
                <button
                  className="relationship-link"
                  data-testid="relationship-link"
                  onClick={() => navigate(`/individuals/${rel.related_id}`)}
                >
                  [Link]
                </button>
                {/* Test: Relationship entry can be deleted */}
                <button
                  className="relationship-delete"
                  data-testid="relationship-delete-button"
                  onClick={() => setDeleteConfirmId(rel.id)}
                  title="Delete relationship"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Test: Relationships section shows empty state when no relationships exist */
          <div className="person-section-empty" data-testid="relationships-empty">
            No relationships yet
          </div>
        )
      ) : (
        <div className="relationships-graph" data-testid="relationships-graph">
          {filteredRelationships.length > 0 ? (
            <RelationshipGraph relationships={filteredRelationships} />
          ) : (
            <div className="person-section-empty" data-testid="relationships-empty">
              No relationships yet
            </div>
          )}
        </div>
      )}

      {/* Test: Relationship entry can be deleted */}
      {/* Test: Delete relationship can be cancelled */}
      {deleteConfirmId && (
        <div className="modal-overlay" data-testid="delete-relationship-confirm">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Relationship</h3>
            </div>
            <p className="modal-text">
              Are you sure you want to delete this relationship? This will also remove the reciprocal relationship entry.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirmId(null)} data-testid="delete-relationship-cancel">Cancel</button>
              <button className="btn-danger" onClick={() => handleDeleteRelationship(deleteConfirmId)} data-testid="delete-relationship-confirm-button">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Test: Add Entry button opens relationship creation form */}
      {/* Test: New relationship entry can be created successfully */}
      {/* Test: Add Entry form validates required fields */}
      {/* Test: Add Entry form can be cancelled */}
      {showAddForm && (
        <AddRelationshipModal
          individualId={individualId}
          onClose={() => setShowAddForm(false)}
          onCreated={() => { setShowAddForm(false); fetchRelationships() }}
        />
      )}
    </div>
  )
}

function RelationshipGraph({ relationships }: { relationships: Relationship[] }) {
  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relationships-graph-view" ref={canvasRef} data-testid="relationships-graph-view">
      <div className="graph-center-node">You</div>
      {relationships.map(rel => (
        <div key={rel.id} className="graph-node">
          <div className="graph-node-name">{rel.related_name}</div>
          <div className="graph-node-type">{rel.relationship_type}</div>
        </div>
      ))}
    </div>
  )
}

interface AddRelationshipModalProps {
  individualId: string
  onClose: () => void
  onCreated: () => void
}

function AddRelationshipModal({ individualId, onClose, onCreated }: AddRelationshipModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Individual[]>([])
  const [selectedPerson, setSelectedPerson] = useState<Individual | null>(null)
  const [relationshipType, setRelationshipType] = useState('')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (searchQuery.length >= 2) {
      fetch(`/.netlify/functions/individuals?search=${encodeURIComponent(searchQuery)}`)
        .then(r => r.json())
        .then(data => {
          const filtered = (data.individuals || []).filter((i: Individual) => i.id !== individualId)
          setSearchResults(filtered)
        })
    } else {
      setSearchResults([])
    }
  }, [searchQuery, individualId])

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    if (!selectedPerson) newErrors.person = 'Related person is required'
    if (!relationshipType) newErrors.type = 'Relationship type is required'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/.netlify/functions/individuals/${individualId}/relationships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          related_individual_id: selectedPerson!.id,
          relationship_type: relationshipType,
        }),
      })
      if (res.ok) {
        onCreated()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" data-testid="add-relationship-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Add Relationship</h3>
          <button className="modal-close" onClick={onClose} data-testid="add-relationship-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-form">
          <div className="form-field">
            <label className="form-label">Related Person *</label>
            {selectedPerson ? (
              <div className="selected-person-chip">
                <span>{selectedPerson.name}</span>
                <button
                  className="tag-input-remove"
                  onClick={() => { setSelectedPerson(null); setSearchQuery('') }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="form-dropdown-wrapper">
                <div className="searchable-select-search" style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="searchable-select-icon">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  {/* Test: Add relationship person search shows results after typing */}
                  <input
                    className="searchable-select-input"
                    placeholder="Search individuals..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    data-testid="relationship-person-search"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="form-dropdown-menu" style={{ position: 'absolute', left: 0, right: 0 }}>
                    <div className="searchable-select-options">
                      {searchResults.map(person => (
                        <button
                          key={person.id}
                          className="form-dropdown-option"
                          onClick={() => { setSelectedPerson(person); setSearchQuery(''); setSearchResults([]) }}
                          data-testid="relationship-person-option"
                        >
                          {person.name}{person.title ? ` - ${person.title}` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {errors.person && <span className="form-error" data-testid="relationship-person-error">{errors.person}</span>}
          </div>

          <div className="form-field">
            <label className="form-label">Relationship Type *</label>
            <div className="form-dropdown-wrapper">
              <button
                className="form-dropdown-trigger"
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                data-testid="relationship-type-dropdown"
              >
                <span>{relationshipType || 'Select type...'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {showTypeDropdown && (
                <div className="form-dropdown-menu">
                  {RELATIONSHIP_TYPES.map(type => (
                    <button
                      key={type}
                      className={`form-dropdown-option ${relationshipType === type ? 'selected' : ''}`}
                      onClick={() => { setRelationshipType(type); setShowTypeDropdown(false) }}
                      data-testid="relationship-type-option"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.type && <span className="form-error" data-testid="relationship-type-error">{errors.type}</span>}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} data-testid="add-relationship-cancel">Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving} data-testid="add-relationship-save">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
