export type ClientStatus = 'active' | 'inactive' | 'prospect' | 'churned'
export type ClientType = 'organization' | 'individual'
export type DealStage = 'lead' | 'qualification' | 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
export type TaskPriority = 'high' | 'medium' | 'low' | 'normal'
export type AttachmentType = 'document' | 'link'
export type ContactHistoryType = 'email' | 'phone_call' | 'video_call' | 'meeting' | 'note'
export type RelationshipType = 'colleague' | 'decision_maker' | 'influencer' | 'manager' | 'report' | 'other'

export interface Client {
  id: string
  name: string
  type: ClientType
  status: ClientStatus
  tags: string[]
  source_type: string | null
  source_detail: string | null
  campaign: string | null
  channel: string | null
  date_acquired: string | null
  created_at: string
  updated_at: string
  primary_contact_name: string | null
  primary_contact_role: string | null
  open_deals_count: number
  open_deals_value: number
  next_task_title: string | null
  next_task_due: string | null
}

export interface Deal {
  id: string
  name: string
  client_id: string
  client_name: string
  value: number
  stage: DealStage
  status: string
  owner: string
  probability: number
  expected_close_date: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  due_date: string | null
  priority: TaskPriority
  completed: boolean
  completed_at: string | null
  client_id: string | null
  client_name: string | null
  deal_id: string | null
  deal_name: string | null
  assignee_name: string | null
  assignee_role: string | null
  created_at: string
  updated_at: string
}

export interface TaskNote {
  id: string
  task_id: string
  content: string
  author: string
  created_at: string
}

export interface Individual {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  location: string | null
  created_at: string
  updated_at: string
  client_associations: ClientAssociation[]
  relationships: Relationship[]
  contact_history: ContactHistoryEntry[]
}

export interface ClientAssociation {
  client_id: string
  client_name: string
  client_status: ClientStatus
  industry: string | null
  role: string | null
}

export interface Relationship {
  id: string
  related_individual_id: string
  related_individual_name: string
  relationship_type: RelationshipType
  role: string | null
  company: string | null
}

export interface ContactHistoryEntry {
  id: string
  individual_id: string
  date: string
  type: ContactHistoryType
  summary: string
  team_member: string | null
  created_at: string
  updated_at: string
}

export interface ContactListItem {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  location: string | null
  created_at: string
  updated_at: string
  associated_clients: Array<{ client_id: string; client_name: string }>
}

export interface Attachment {
  id: string
  filename: string
  type: AttachmentType
  url: string
  size: number | null
  client_id: string
  deal_id: string | null
  deal_name: string | null
  created_at: string
}

export interface TimelineEvent {
  id: string
  client_id: string
  event_type: string
  description: string
  user_name: string | null
  related_entity_id: string | null
  related_entity_type: string | null
  created_at: string
}

export interface DealHistory {
  id: string
  deal_id: string
  old_stage: DealStage
  new_stage: DealStage
  changed_by: string | null
  created_at: string
}

export interface Writeup {
  id: string
  deal_id: string
  title: string
  content: string
  author: string
  version: number
  created_at: string
  updated_at: string
}

export interface DealContact {
  individual_id: string
  individual_name: string
  role: string
  company: string | null
}

export interface UserSummary {
  id: string
  name: string
  email: string
  avatar_url: string
}
