import { neon } from '@neondatabase/serverless'
import { createMachine, waitForMachine } from '@replayio/app-building'

const DEFAULT_IMAGE_REF = 'ghcr.io/replayio/app-building:latest'

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

  const flyToken = process.env.FLY_API_TOKEN
  const flyApp = process.env.FLY_APP_NAME
  if (!flyToken || !flyApp) {
    return new Response(JSON.stringify({ error: 'Fly.io credentials not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: { prompt?: string }
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const sql = neon(process.env.DATABASE_URL!)
  let prompt = body.prompt || null

  if (!prompt) {
    const rows = await sql`SELECT value FROM settings WHERE key = 'default_prompt'`
    if (rows.length > 0) {
      prompt = rows[0].value
    }
  }

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'No prompt provided and no default_prompt configured' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const imageRef = process.env.CONTAINER_IMAGE_REF || DEFAULT_IMAGE_REF
  const uniqueId = Math.random().toString(36).slice(2, 8)
  const containerName = `app-building-${uniqueId}`

  const containerEnv: Record<string, string> = {
    GIT_AUTHOR_NAME: 'App Builder',
    GIT_AUTHOR_EMAIL: 'app-builder@localhost',
    GIT_COMMITTER_NAME: 'App Builder',
    GIT_COMMITTER_EMAIL: 'app-builder@localhost',
    PLAYWRIGHT_BROWSERS_PATH: '/opt/playwright',
    PORT: '3000',
    CONTAINER_NAME: containerName,
    PROMPT: prompt,
  }

  const webhookUrl = process.env.WEBHOOK_URL
  if (webhookUrl) {
    containerEnv.WEBHOOK_URL = webhookUrl
  }

  try {
    const machineId = await createMachine(flyApp, flyToken, imageRef, containerEnv, containerName)
    await waitForMachine(flyApp, flyToken, machineId)

    await sql`
      INSERT INTO containers (container_id, name, status, prompt, created_at, last_event_at)
      VALUES (${machineId}, ${containerName}, 'started', ${prompt}, NOW(), NOW())
    `

    return new Response(JSON.stringify({
      container_id: machineId,
      name: containerName,
      status: 'started',
      prompt,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: 'Failed to spawn container', detail: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
