import { neon } from '@neondatabase/serverless'

export default async (request: Request) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const sql = neon(process.env.DATABASE_URL!)

  const [containers, webhookEvents, settingsRows] = await Promise.all([
    sql`SELECT container_id, name, status, prompt, last_event_at FROM containers WHERE status != 'stopped' ORDER BY last_event_at DESC`,
    sql`SELECT id, container_id, event_type, payload, received_at FROM webhook_events ORDER BY received_at DESC LIMIT 50`,
    sql`SELECT value FROM settings WHERE key = 'default_prompt'`,
  ])

  const defaultPrompt = settingsRows.length > 0 ? settingsRows[0].value : null

  return new Response(
    JSON.stringify({
      containers,
      webhookEvents,
      defaultPrompt,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
