import { neon } from '@neondatabase/serverless'

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const webhookSecret = process.env.WEBHOOK_SECRET
  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const authHeader = request.headers.get('Authorization')
  const url = new URL(request.url)
  const secretParam = url.searchParams.get('secret')
  const providedSecret = authHeader?.replace(/^Bearer\s+/i, '') || secretParam

  if (providedSecret !== webhookSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: { container_id: string; event_type: string; payload?: Record<string, unknown>; status?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!body.container_id || !body.event_type) {
    return new Response(JSON.stringify({ error: 'Missing required fields: container_id, event_type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const sql = neon(process.env.DATABASE_URL!)
  const payload = body.payload || {}
  const newStatus = body.status || null

  if (newStatus) {
    await sql`
      INSERT INTO containers (container_id, name, status, last_event_at)
      VALUES (${body.container_id}, ${body.container_id}, ${newStatus}, NOW())
      ON CONFLICT (container_id)
      DO UPDATE SET status = ${newStatus}, last_event_at = NOW()
    `
  } else {
    await sql`
      INSERT INTO containers (container_id, name, status, last_event_at)
      VALUES (${body.container_id}, ${body.container_id}, 'starting', NOW())
      ON CONFLICT (container_id)
      DO UPDATE SET last_event_at = NOW()
    `
  }

  await sql`
    INSERT INTO webhook_events (container_id, event_type, payload)
    VALUES (${body.container_id}, ${body.event_type}, ${JSON.stringify(payload)})
  `

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
