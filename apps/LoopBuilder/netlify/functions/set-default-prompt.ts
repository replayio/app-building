import { neon } from '@neondatabase/serverless'

export default async (request: Request) => {
  const sql = neon(process.env.DATABASE_URL!)

  if (request.method === 'GET') {
    try {
      const rows = await sql`SELECT value FROM settings WHERE key = 'default_prompt'`
      const prompt = rows.length > 0 ? rows[0].value : null
      return new Response(JSON.stringify({ prompt }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return new Response(JSON.stringify({ error: 'Failed to fetch default prompt', detail: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

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

  let body: { prompt?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const prompt = body.prompt
  if (!prompt || typeof prompt !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing or invalid "prompt" field' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('default_prompt', ${prompt})
      ON CONFLICT (key) DO UPDATE SET value = ${prompt}
    `

    return new Response(JSON.stringify({ success: true, prompt }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: 'Failed to set default prompt', detail: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
