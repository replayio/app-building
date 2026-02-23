import { getDb } from '../utils/db'
import { optionalAuth, type OptionalAuthRequest } from '../utils/auth'

async function handler(req: OptionalAuthRequest) {
  const sql = getDb()
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const userId = pathParts.length >= 4 ? pathParts[3] : null

  // GET /users — list all users
  if (req.method === 'GET' && !userId) {
    const users = await sql`
      SELECT u.*,
        (SELECT COUNT(*)::int FROM deals d WHERE d.owner = u.name AND d.stage NOT IN ('closed_won', 'closed_lost')) AS active_deals_count,
        (SELECT COUNT(*)::int FROM tasks t WHERE t.assignee_name = u.name AND t.completed = false) AS open_tasks_count
      FROM users u
      ORDER BY u.name ASC
    `
    return Response.json({ users })
  }

  // GET /users/:id — user detail with activity
  if (req.method === 'GET' && userId) {
    const rows = await sql`SELECT * FROM users WHERE id = ${userId}::uuid`
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }
    const user = rows[0]

    // Get deals owned by this user
    const deals = await sql`
      SELECT d.*, c.name AS client_name
      FROM deals d
      LEFT JOIN clients c ON c.id = d.client_id
      WHERE d.owner = ${user.name}
      ORDER BY d.updated_at DESC
    `

    // Get tasks assigned to this user
    const tasks = await sql`
      SELECT t.*, c.name AS client_name, dl.name AS deal_name
      FROM tasks t
      LEFT JOIN clients c ON c.id = t.client_id
      LEFT JOIN deals dl ON dl.id = t.deal_id
      WHERE t.assignee_name = ${user.name}
      ORDER BY t.completed ASC, t.due_date ASC NULLS LAST
    `

    // Get recent timeline activity by this user
    const activity = await sql`
      SELECT te.*, c.name AS client_name
      FROM timeline_events te
      LEFT JOIN clients c ON c.id = te.client_id
      WHERE te.user_name = ${user.name}
      ORDER BY te.created_at DESC
      LIMIT 20
    `

    return Response.json({ user, deals, tasks, activity })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
}

export default optionalAuth(handler)
