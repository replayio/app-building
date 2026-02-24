import type { Context } from '@netlify/functions'
import { neon } from '@neondatabase/serverless'

export default async function handler(req: Request, _context: Context) {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    return Response.json({ error: 'Database not configured' }, { status: 500 })
  }

  const sql = neon(databaseUrl)
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const resourceId = segments[3] || null

  if (req.method === 'GET') {
    // Single user by ID - detail view with deals, tasks, activity
    if (resourceId) {
      const rows = await sql`
        SELECT u.id, u.name, u.email, u.avatar_url, u.role, u.created_at,
               (SELECT COUNT(*) FROM deals d WHERE d.owner_id = u.id AND d.status = 'open')::int as active_deals_count,
               (SELECT COUNT(*) FROM tasks t WHERE t.assignee_id = u.id AND t.status = 'open')::int as open_tasks_count,
               (SELECT COUNT(*) FROM deals d WHERE d.owner_id = u.id)::int as total_deals_count
        FROM users u
        WHERE u.id = ${resourceId}
      `
      if (rows.length === 0) {
        return Response.json({ error: 'User not found' }, { status: 404 })
      }

      const user = rows[0]

      // Fetch owned deals
      const deals = await sql`
        SELECT d.id, d.name, d.value, d.stage, d.status, d.expected_close_date,
               c.name as client_name
        FROM deals d
        LEFT JOIN clients c ON d.client_id = c.id
        WHERE d.owner_id = ${resourceId}
        ORDER BY d.created_at DESC
      `

      // Fetch assigned tasks
      const tasks = await sql`
        SELECT t.id, t.title, t.priority, t.status, t.due_date,
               c.name as client_name
        FROM tasks t
        LEFT JOIN clients c ON t.client_id = c.id
        WHERE t.assignee_id = ${resourceId}
        ORDER BY t.due_date ASC NULLS LAST
      `

      // Fetch recent activity (timeline events where this user is the actor)
      const activity = await sql`
        SELECT te.id, te.event_type, te.description, te.created_at,
               c.name as client_name
        FROM timeline_events te
        LEFT JOIN clients c ON te.client_id = c.id
        WHERE te.actor_id = ${resourceId}
        ORDER BY te.created_at DESC
        LIMIT 20
      `

      return Response.json({
        ...user,
        deals,
        tasks,
        activity,
      })
    }

    // List all users with stats
    const rows = await sql`
      SELECT u.id, u.name, u.email, u.avatar_url, u.role, u.created_at,
             (SELECT COUNT(*) FROM deals d WHERE d.owner_id = u.id AND d.status = 'open')::int as active_deals_count,
             (SELECT COUNT(*) FROM tasks t WHERE t.assignee_id = u.id AND t.status = 'open')::int as open_tasks_count
      FROM users u
      ORDER BY u.name ASC
    `

    return Response.json({ users: rows })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
