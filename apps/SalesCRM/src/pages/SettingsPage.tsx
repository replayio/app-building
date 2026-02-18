import { useState, useEffect, useCallback } from 'react'
import { SettingsPageHeader } from '../components/settings/SettingsPageHeader'
import { ImportExportSection } from '../components/settings/ImportExportSection'
import { WebhookSection } from '../components/settings/WebhookSection'
import { WebhookModal } from '../components/settings/WebhookModal'
import { ImportDialog } from '../components/shared/ImportDialog'
import { ConfirmDialog } from '../components/shared/ConfirmDialog'

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  enabled: boolean
  created_at: string
}

export function SettingsPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [availableEvents, setAvailableEvents] = useState<string[]>([])
  const [webhookModalOpen, setWebhookModalOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [importType, setImportType] = useState<string | null>(null)

  const loadWebhooks = useCallback(async () => {
    try {
      const res = await fetch('/.netlify/functions/webhooks')
      const data = await res.json() as { webhooks: Webhook[]; availableEvents: string[] }
      setWebhooks(data.webhooks)
      setAvailableEvents(data.availableEvents)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    loadWebhooks()
  }, [loadWebhooks])

  async function handleSaveWebhook(data: { name: string; url: string; events: string[]; enabled: boolean }) {
    try {
      if (editingWebhook) {
        await fetch(`/.netlify/functions/webhooks/${editingWebhook.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        await fetch('/.netlify/functions/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      setWebhookModalOpen(false)
      setEditingWebhook(null)
      loadWebhooks()
    } catch {
      // ignore
    }
  }

  async function handleDeleteWebhook() {
    if (!deleteConfirm) return
    try {
      await fetch(`/.netlify/functions/webhooks/${deleteConfirm}`, { method: 'DELETE' })
      setDeleteConfirm(null)
      loadWebhooks()
    } catch {
      // ignore
    }
  }

  async function handleToggleWebhook(id: string, enabled: boolean) {
    try {
      await fetch(`/.netlify/functions/webhooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      })
      loadWebhooks()
    } catch {
      // ignore
    }
  }

  function downloadCSV(filename: string, headers: string[], rows: string[][]) {
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${(c ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleExportClients() {
    const res = await fetch('/.netlify/functions/clients?pageSize=10000')
    const data = await res.json() as { clients: Record<string, unknown>[] }
    downloadCSV('clients-export.csv',
      ['Name', 'Type', 'Status', 'Tags', 'Primary Contact', 'Open Deals'],
      data.clients.map((c: Record<string, unknown>) => [
        String(c.name ?? ''), String(c.type ?? ''), String(c.status ?? ''),
        Array.isArray(c.tags) ? c.tags.join('; ') : '',
        String(c.primary_contact ?? ''), String(c.open_deals_count ?? '0'),
      ])
    )
  }

  async function handleExportDeals() {
    const res = await fetch('/.netlify/functions/deals?pageSize=10000')
    const data = await res.json() as { deals: Record<string, unknown>[] }
    downloadCSV('deals-export.csv',
      ['Name', 'Client', 'Value', 'Stage', 'Owner', 'Status'],
      data.deals.map((d: Record<string, unknown>) => [
        String(d.name ?? ''), String(d.client_name ?? ''), String(d.value ?? '0'),
        String(d.stage ?? ''), String(d.owner ?? ''), String(d.status ?? ''),
      ])
    )
  }

  async function handleExportTasks() {
    const res = await fetch('/.netlify/functions/tasks')
    const data = await res.json() as { tasks: Record<string, unknown>[] }
    downloadCSV('tasks-export.csv',
      ['Title', 'Description', 'Priority', 'Due Date', 'Assignee', 'Client', 'Completed'],
      data.tasks.map((t: Record<string, unknown>) => [
        String(t.title ?? ''), String(t.description ?? ''), String(t.priority ?? ''),
        String(t.due_date ?? ''), String(t.assignee_name ?? ''), String(t.client_name ?? ''),
        t.completed ? 'Yes' : 'No',
      ])
    )
  }

  return (
    <div className="p-6 max-w-[900px]">
      <SettingsPageHeader />

      <div className="flex flex-col gap-6">
        <ImportExportSection
          onImportClients={() => setImportType('clients')}
          onImportDeals={() => setImportType('deals')}
          onImportTasks={() => setImportType('tasks')}
          onImportContacts={() => setImportType('contacts')}
          onExportClients={handleExportClients}
          onExportDeals={handleExportDeals}
          onExportTasks={handleExportTasks}
        />

        <WebhookSection
          webhooks={webhooks}
          onAdd={() => { setEditingWebhook(null); setWebhookModalOpen(true) }}
          onEdit={(w) => { setEditingWebhook(w); setWebhookModalOpen(true) }}
          onDelete={(id) => setDeleteConfirm(id)}
          onToggle={handleToggleWebhook}
        />
      </div>

      <WebhookModal
        open={webhookModalOpen}
        webhook={editingWebhook}
        availableEvents={availableEvents}
        onClose={() => { setWebhookModalOpen(false); setEditingWebhook(null) }}
        onSave={handleSaveWebhook}
      />

      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Delete Webhook"
        message="Are you sure you want to delete this webhook? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteWebhook}
        onCancel={() => setDeleteConfirm(null)}
      />

      {importType === 'clients' && (
        <ImportDialog
          entityName="Client"
          entityNamePlural="Clients"
          columns={CLIENT_CSV_COLUMNS}
          headerMap={CLIENT_HEADER_MAP}
          templateFilename="clients-import-template.csv"
          templateExample='Acme Corp,organization,active,"Enterprise; SaaS",Referral,John Smith,Q1 Campaign,Direct Sales,2024-01-15'
          apiEndpoint="/.netlify/functions/clients?action=import"
          apiBodyKey="clients"
          onClose={() => setImportType(null)}
          onImported={() => {}}
        />
      )}

      {importType === 'deals' && (
        <ImportDialog
          entityName="Deal"
          entityNamePlural="Deals"
          columns={DEAL_CSV_COLUMNS}
          headerMap={DEAL_HEADER_MAP}
          templateFilename="deals-import-template.csv"
          templateExample="Enterprise License,Acme Corp,50000,proposal,Jane Smith,75,2024-06-15,active"
          apiEndpoint="/.netlify/functions/deals?action=import"
          apiBodyKey="deals"
          onClose={() => setImportType(null)}
          onImported={() => {}}
        />
      )}

      {importType === 'tasks' && (
        <ImportDialog
          entityName="Task"
          entityNamePlural="Tasks"
          columns={TASK_CSV_COLUMNS}
          headerMap={TASK_HEADER_MAP}
          templateFilename="tasks-import-template.csv"
          templateExample="Follow up with client,Review Q1 proposal details,2024-03-15,high,Acme Corp,Jane Smith"
          apiEndpoint="/.netlify/functions/tasks?action=import"
          apiBodyKey="tasks"
          onClose={() => setImportType(null)}
          onImported={() => {}}
        />
      )}

      {importType === 'contacts' && (
        <ImportDialog
          entityName="Contact"
          entityNamePlural="Contacts"
          columns={CONTACT_CSV_COLUMNS}
          headerMap={CONTACT_HEADER_MAP}
          templateFilename="contacts-import-template.csv"
          templateExample="Sarah Johnson,CEO,sarah@acmecorp.com,+1 555-100-0001,New York,Acme Corp"
          apiEndpoint="/.netlify/functions/individuals?action=import"
          apiBodyKey="contacts"
          onClose={() => setImportType(null)}
          onImported={() => {}}
        />
      )}
    </div>
  )
}

const CLIENT_CSV_COLUMNS = [
  { name: 'Name', required: true, description: 'Client name' },
  { name: 'Type', required: false, description: '"organization" or "individual" (default: organization)' },
  { name: 'Status', required: false, description: '"active", "inactive", "prospect", or "churned" (default: prospect)' },
  { name: 'Tags', required: false, description: 'Semicolon-separated tags' },
  { name: 'Source Type', required: false, description: 'Acquisition source type' },
  { name: 'Source Detail', required: false, description: 'Source details' },
  { name: 'Campaign', required: false, description: 'Campaign name' },
  { name: 'Channel', required: false, description: 'Acquisition channel' },
  { name: 'Date Acquired', required: false, description: 'Date in YYYY-MM-DD format' },
]
const CLIENT_HEADER_MAP: Record<string, string> = {
  'name': 'name', 'type': 'type', 'status': 'status', 'tags': 'tags',
  'source type': 'source_type', 'source_type': 'source_type',
  'source detail': 'source_detail', 'source_detail': 'source_detail',
  'campaign': 'campaign', 'channel': 'channel',
  'date acquired': 'date_acquired', 'date_acquired': 'date_acquired',
}

const DEAL_CSV_COLUMNS = [
  { name: 'Name', required: true, description: 'Deal name' },
  { name: 'Client Name', required: true, description: 'Name of an existing client' },
  { name: 'Value', required: false, description: 'Deal value in dollars (default: 0)' },
  { name: 'Stage', required: false, description: 'Deal stage (default: lead)' },
  { name: 'Owner', required: false, description: 'Deal owner name' },
  { name: 'Probability', required: false, description: 'Win probability 0-100' },
  { name: 'Expected Close Date', required: false, description: 'Date in YYYY-MM-DD format' },
  { name: 'Status', required: false, description: 'Deal status (default: active)' },
]
const DEAL_HEADER_MAP: Record<string, string> = {
  'name': 'name', 'client name': 'client_name', 'client_name': 'client_name', 'client': 'client_name',
  'value': 'value', 'stage': 'stage', 'owner': 'owner', 'probability': 'probability',
  'expected close date': 'expected_close_date', 'expected_close_date': 'expected_close_date',
  'close date': 'expected_close_date', 'close_date': 'expected_close_date', 'status': 'status',
}

const TASK_CSV_COLUMNS = [
  { name: 'Title', required: true, description: 'Task title' },
  { name: 'Description', required: false, description: 'Task description' },
  { name: 'Due Date', required: false, description: 'Date in YYYY-MM-DD format' },
  { name: 'Priority', required: false, description: '"high", "medium", "low", or "normal"' },
  { name: 'Client Name', required: false, description: 'Name of an existing client' },
  { name: 'Assignee', required: false, description: 'Person assigned' },
]
const TASK_HEADER_MAP: Record<string, string> = {
  'title': 'title', 'description': 'description',
  'due date': 'due_date', 'due_date': 'due_date', 'priority': 'priority',
  'client name': 'client_name', 'client_name': 'client_name', 'client': 'client_name',
  'assignee': 'assignee_name', 'assignee name': 'assignee_name', 'assignee_name': 'assignee_name',
}

const CONTACT_CSV_COLUMNS = [
  { name: 'Name', required: true, description: 'Contact name' },
  { name: 'Title', required: false, description: 'Job title' },
  { name: 'Email', required: false, description: 'Email address' },
  { name: 'Phone', required: false, description: 'Phone number' },
  { name: 'Location', required: false, description: 'City, state, or address' },
  { name: 'Client Name', required: false, description: 'Name of an existing client' },
]
const CONTACT_HEADER_MAP: Record<string, string> = {
  'name': 'name', 'title': 'title', 'email': 'email', 'phone': 'phone', 'location': 'location',
  'client name': 'client_name', 'client_name': 'client_name', 'client': 'client_name',
}
