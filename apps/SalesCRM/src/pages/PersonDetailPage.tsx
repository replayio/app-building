import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PersonHeader from '@/components/PersonHeader'
import RelationshipsSection from '@/components/RelationshipsSection'
import ContactHistorySection from '@/components/ContactHistorySection'
import AssociatedClientsSection from '@/components/AssociatedClientsSection'

interface AssociatedClient {
  client_id: string
  client_name: string
  role: string
  is_primary: boolean
}

interface PersonInfo {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  location: string | null
  associated_clients: AssociatedClient[]
}

export default function PersonDetailPage() {
  const { individualId } = useParams<{ individualId: string }>()
  const [person, setPerson] = useState<PersonInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!individualId) return

    fetch(`/.netlify/functions/individuals/${individualId}`)
      .then(r => r.json())
      .then(data => {
        setPerson(data)
        setLoading(false)
      })
  }, [individualId])

  if (loading) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="person-detail-page">
        <p>Loading...</p>
      </div>
    )
  }

  if (!person) {
    return (
      <div className="page-content p-6 max-sm:p-3" data-testid="person-detail-page">
        <p>Person not found</p>
      </div>
    )
  }

  return (
    <div className="page-content p-6 max-sm:p-3" data-testid="person-detail-page">
      <PersonHeader
        name={person.name}
        title={person.title}
        email={person.email}
        phone={person.phone}
        location={person.location}
        associatedClients={person.associated_clients || []}
      />
      {individualId && (
        <>
          <RelationshipsSection individualId={individualId} />
          <ContactHistorySection individualId={individualId} />
          <AssociatedClientsSection individualId={individualId} />
        </>
      )}
    </div>
  )
}
