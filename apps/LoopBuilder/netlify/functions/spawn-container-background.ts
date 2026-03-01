import type { Handler } from '@netlify/functions'
import { neon } from '@neondatabase/serverless'
import { createMachine, waitForMachine } from '@replayio/app-building'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const webhookSecret = process.env.WEBHOOK_SECRET
  if (!webhookSecret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured' }) }
  }

  const authHeader = event.headers['authorization']
  const providedSecret = authHeader?.replace(/^Bearer\s+/i, '')

  if (providedSecret !== webhookSecret) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }
  }

  let body: { containerName: string; prompt: string; imageRef: string; flyApp: string; flyToken: string }
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { containerName, prompt, imageRef, flyApp, flyToken } = body
  if (!containerName || !prompt || !imageRef || !flyApp || !flyToken) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) }
  }

  const sql = neon(process.env.DATABASE_URL!)

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
    let machineId = ''
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        machineId = await createMachine(flyApp, flyToken, imageRef, containerEnv, containerName)
        break
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('MANIFEST_UNKNOWN') && attempt < 4) {
          console.log('Image not yet available in registry, retrying in 5s...')
          await new Promise((r) => setTimeout(r, 5000))
          continue
        }
        throw err
      }
    }
    await waitForMachine(flyApp, flyToken, machineId)

    await sql`
      UPDATE containers
      SET status = 'started', last_event_at = NOW()
      WHERE container_id = ${containerName}
    `
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`Failed to spawn container ${containerName}:`, message)

    await sql`
      UPDATE containers
      SET status = 'failed', last_event_at = NOW()
      WHERE container_id = ${containerName}
    `.catch((dbErr) => {
      console.error('Failed to update container status to failed:', dbErr)
    })
  }

  return { statusCode: 200, body: '' }
}
