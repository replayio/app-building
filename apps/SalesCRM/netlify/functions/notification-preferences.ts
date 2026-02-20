import { getDb } from '../utils/db'
import { requiresAuth, type OptionalAuthRequest } from '../utils/auth'

async function handler(req: OptionalAuthRequest) {
  const sql = getDb()
  const user = req.user!

  // GET /notification-preferences — get current user's preferences
  if (req.method === 'GET') {
    const rows = await sql`
      SELECT * FROM notification_preferences
      WHERE user_id = ${user.id}::uuid
    `

    if (rows.length === 0) {
      // Return defaults (all true)
      return Response.json({
        preferences: {
          notify_client_updated: true,
          notify_deal_created: true,
          notify_deal_stage_changed: true,
          notify_task_created: true,
          notify_task_completed: true,
          notify_contact_added: true,
          notify_note_added: true,
        },
      })
    }

    const p = rows[0]
    return Response.json({
      preferences: {
        notify_client_updated: p.notify_client_updated,
        notify_deal_created: p.notify_deal_created,
        notify_deal_stage_changed: p.notify_deal_stage_changed,
        notify_task_created: p.notify_task_created,
        notify_task_completed: p.notify_task_completed,
        notify_contact_added: p.notify_contact_added,
        notify_note_added: p.notify_note_added,
      },
    })
  }

  // PUT /notification-preferences — update preferences
  if (req.method === 'PUT') {
    const body = await req.json() as Record<string, boolean>

    const rows = await sql`
      INSERT INTO notification_preferences (
        user_id,
        notify_client_updated,
        notify_deal_created,
        notify_deal_stage_changed,
        notify_task_created,
        notify_task_completed,
        notify_contact_added,
        notify_note_added
      )
      VALUES (
        ${user.id}::uuid,
        ${body.notify_client_updated !== false},
        ${body.notify_deal_created !== false},
        ${body.notify_deal_stage_changed !== false},
        ${body.notify_task_created !== false},
        ${body.notify_task_completed !== false},
        ${body.notify_contact_added !== false},
        ${body.notify_note_added !== false}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        notify_client_updated = ${body.notify_client_updated !== false},
        notify_deal_created = ${body.notify_deal_created !== false},
        notify_deal_stage_changed = ${body.notify_deal_stage_changed !== false},
        notify_task_created = ${body.notify_task_created !== false},
        notify_task_completed = ${body.notify_task_completed !== false},
        notify_contact_added = ${body.notify_contact_added !== false},
        notify_note_added = ${body.notify_note_added !== false},
        updated_at = NOW()
      RETURNING *
    `

    const p = rows[0]
    return Response.json({
      preferences: {
        notify_client_updated: p.notify_client_updated,
        notify_deal_created: p.notify_deal_created,
        notify_deal_stage_changed: p.notify_deal_stage_changed,
        notify_task_created: p.notify_task_created,
        notify_task_completed: p.notify_task_completed,
        notify_contact_added: p.notify_contact_added,
        notify_note_added: p.notify_note_added,
      },
    })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
}

export default requiresAuth(handler)
