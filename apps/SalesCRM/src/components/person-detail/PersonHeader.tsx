import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Mail, Phone, MapPin, X, Check } from 'lucide-react'
import type { Individual, ClientAssociation } from '../../types'

interface PersonHeaderProps {
  individual: Individual
  onUpdate: (data: Partial<{ name: string; title: string; email: string; phone: string; location: string }>) => void
}

export function PersonHeader({ individual, onUpdate }: PersonHeaderProps) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(individual.name)
  const [title, setTitle] = useState(individual.title ?? '')
  const [email, setEmail] = useState(individual.email ?? '')
  const [phone, setPhone] = useState(individual.phone ?? '')
  const [location, setLocation] = useState(individual.location ?? '')

  function handleSave() {
    onUpdate({
      name: name.trim(),
      title: title.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      location: location.trim() || undefined,
    })
    setEditing(false)
  }

  function handleCancel() {
    setName(individual.name)
    setTitle(individual.title ?? '')
    setEmail(individual.email ?? '')
    setPhone(individual.phone ?? '')
    setLocation(individual.location ?? '')
    setEditing(false)
  }

  const clientAssociations = individual.client_associations ?? []
  const companiesLabel = clientAssociations.map((ca: ClientAssociation) => ca.client_name).join(' & ')

  return (
    <div className="border border-border rounded-[6px] p-5 mb-4">
      {editing ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-text-primary">Edit Person Info</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCancel}
                className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-accent hover:bg-hover transition-colors duration-100"
              >
                <Check size={16} strokeWidth={1.75} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-text-muted mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chief Technology Officer (CTO)"
              className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full h-[34px] px-3 text-[13px] text-text-primary bg-base border border-border rounded-[5px] placeholder:text-text-disabled focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between mb-1">
            <h1 className="text-[16px] font-semibold text-text-primary">{individual.name}</h1>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-text-muted hover:bg-hover transition-colors duration-100"
              title="Edit person info"
            >
              <Pencil size={14} strokeWidth={1.75} />
            </button>
          </div>

          {/* Title and companies */}
          {(individual.title || companiesLabel) && (
            <div className="text-[13px] text-text-secondary mb-3">
              {individual.title && <span>{individual.title}</span>}
              {individual.title && companiesLabel && <span> | </span>}
              {companiesLabel && <span>{companiesLabel}</span>}
            </div>
          )}

          {/* Contact info */}
          <div className="flex flex-wrap gap-4 mb-3">
            {individual.email && (
              <div className="flex items-center gap-1.5 text-[13px] text-text-muted">
                <Mail size={14} strokeWidth={1.5} className="text-text-disabled" />
                <span>{individual.email}</span>
              </div>
            )}
            {individual.phone && (
              <div className="flex items-center gap-1.5 text-[13px] text-text-muted">
                <Phone size={14} strokeWidth={1.5} className="text-text-disabled" />
                <span>{individual.phone}</span>
              </div>
            )}
            {individual.location && (
              <div className="flex items-center gap-1.5 text-[13px] text-text-muted">
                <MapPin size={14} strokeWidth={1.5} className="text-text-disabled" />
                <span>{individual.location}</span>
              </div>
            )}
          </div>

          {/* Associated Clients links */}
          {clientAssociations.length > 0 && (
            <div className="text-[12px] text-text-muted">
              <span className="font-medium">Associated Clients: </span>
              {clientAssociations.map((ca: ClientAssociation, idx: number) => (
                <span key={ca.client_id}>
                  <span
                    className="text-accent hover:underline cursor-pointer"
                    onClick={() => navigate(`/clients/${ca.client_id}`)}
                  >
                    {ca.client_name}
                  </span>
                  {ca.role && <span className="text-text-disabled"> ({ca.role})</span>}
                  {idx < clientAssociations.length - 1 && <span>, </span>}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
