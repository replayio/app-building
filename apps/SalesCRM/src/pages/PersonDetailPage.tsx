import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchIndividual } from '../store/individualsSlice'
import { PersonHeader } from '../components/person-detail/PersonHeader'
import { RelationshipsSection } from '../components/person-detail/RelationshipsSection'
import { ContactHistorySection } from '../components/person-detail/ContactHistorySection'
import { AssociatedClientsSection } from '../components/person-detail/AssociatedClientsSection'
import { AddRelationshipModal } from '../components/person-detail/AddRelationshipModal'
import { AddContactHistoryModal } from '../components/person-detail/AddContactHistoryModal'
import { EditContactHistoryModal } from '../components/person-detail/EditContactHistoryModal'
import type { ContactHistoryEntry, ContactHistoryType, RelationshipType } from '../types'

export function PersonDetailPage() {
  const { individualId } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentIndividual, loading } = useAppSelector((state) => state.individuals)

  const [addRelationshipOpen, setAddRelationshipOpen] = useState(false)
  const [addContactHistoryOpen, setAddContactHistoryOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ContactHistoryEntry | null>(null)

  const loadData = useCallback(() => {
    if (individualId) {
      dispatch(fetchIndividual(individualId))
    }
  }, [individualId, dispatch])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleUpdatePerson(data: Partial<{ name: string; title: string; email: string; phone: string; location: string }>) {
    if (!individualId) return
    const res = await fetch(`/.netlify/functions/individuals/${individualId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      loadData()
    }
  }

  async function handleAddRelationship(data: { related_individual_id: string; relationship_type: RelationshipType }) {
    if (!individualId) return
    const res = await fetch(`/.netlify/functions/individuals/${individualId}/relationships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setAddRelationshipOpen(false)
      loadData()
    }
  }

  async function handleAddContactHistory(data: { date: string; type: ContactHistoryType; summary: string; team_member: string }) {
    if (!individualId) return
    const res = await fetch(`/.netlify/functions/individuals/${individualId}/contact-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setAddContactHistoryOpen(false)
      loadData()
    }
  }

  async function handleEditContactHistory(entryId: string, data: { date: string; type: ContactHistoryType; summary: string; team_member: string }) {
    if (!individualId) return
    const res = await fetch(`/.netlify/functions/individuals/${individualId}/contact-history/${entryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setEditingEntry(null)
      loadData()
    }
  }

  async function handleDeleteRelationship(relationshipId: string) {
    if (!individualId) return
    const res = await fetch(`/.netlify/functions/individuals/${individualId}/relationships/${relationshipId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      loadData()
    }
  }

  async function handleDeleteContactHistory(entryId: string) {
    if (!individualId) return
    const res = await fetch(`/.netlify/functions/individuals/${individualId}/contact-history/${entryId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      loadData()
    }
  }

  if (loading || !currentIndividual) {
    return (
      <div className="p-6" data-testid="person-detail-loading">
        <div className="text-[13px] text-text-muted">Loading individual...</div>
      </div>
    )
  }

  return (
    <div className="p-6" data-testid="person-detail-page">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[12px] text-text-muted mb-4" data-testid="person-detail-breadcrumb">
        <span
          className="hover:text-accent cursor-pointer"
          onClick={() => navigate('/clients')}
        >
          Clients
        </span>
        <span>/</span>
        <span>Individuals</span>
        <span>/</span>
        <span>{currentIndividual.name}</span>
      </div>

      {/* Header */}
      <PersonHeader individual={currentIndividual} onUpdate={handleUpdatePerson} />

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          {/* Relationships */}
          <RelationshipsSection
            relationships={currentIndividual.relationships ?? []}
            onAddEntry={() => setAddRelationshipOpen(true)}
            onDeleteRelationship={handleDeleteRelationship}
          />

          {/* Contact History */}
          <ContactHistorySection
            entries={currentIndividual.contact_history ?? []}
            onAddEntry={() => setAddContactHistoryOpen(true)}
            onEditEntry={(entry) => setEditingEntry(entry)}
            onDeleteEntry={handleDeleteContactHistory}
          />
        </div>
        <div>
          {/* Associated Clients */}
          <AssociatedClientsSection associations={currentIndividual.client_associations ?? []} />
        </div>
      </div>

      {/* Modals */}
      <AddRelationshipModal
        open={addRelationshipOpen}
        onClose={() => setAddRelationshipOpen(false)}
        onSave={handleAddRelationship}
      />
      <AddContactHistoryModal
        open={addContactHistoryOpen}
        onClose={() => setAddContactHistoryOpen(false)}
        onSave={handleAddContactHistory}
      />
      <EditContactHistoryModal
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleEditContactHistory}
      />
    </div>
  )
}
