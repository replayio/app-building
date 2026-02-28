import { neon } from '@neondatabase/serverless'

const DISALLOWED_KEYWORDS = [
  'personal information',
  'social security',
  'credit card',
  'password manager',
  'hack',
  'exploit',
  'malware',
  'phishing',
]

function assessRequest(name: string, description: string, requirements: string): {
  accepted: boolean
  reason: string
} {
  const combined = `${name} ${description} ${requirements}`.toLowerCase()

  for (const keyword of DISALLOWED_KEYWORDS) {
    if (combined.includes(keyword)) {
      return {
        accepted: false,
        reason: `The request contains specifications for handling ${keyword}, which violates our policy. Please revise your request to comply with data privacy guidelines.`,
      }
    }
  }

  if (name.trim().length < 3) {
    return {
      accepted: false,
      reason: 'The app name is too short. Please provide a descriptive name of at least 3 characters.',
    }
  }

  if (description.trim().length < 10) {
    return {
      accepted: false,
      reason: 'The app description is too brief. Please provide more detail about what the app should do.',
    }
  }

  return { accepted: true, reason: '' }
}

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const sql = neon(process.env.DATABASE_URL!)
  const body = await request.json() as { name: string; description: string; requirements: string }
  const { name, description, requirements } = body

  const assessment = assessRequest(name, description, requirements)

  if (!assessment.accepted) {
    await sql`
      INSERT INTO app_requests (name, description, requirements, status, rejection_reason)
      VALUES (${name}, ${description}, ${requirements || null}, 'rejected', ${assessment.reason})
    `
    return new Response(
      JSON.stringify({
        result: 'rejected',
        rejectionReason: assessment.reason,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }

  const appId = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  await sql`
    INSERT INTO apps (id, name, description, status, progress, model, deployment_url, source_url)
    VALUES (${appId}, ${name}, ${description}, 'queued', 0, NULL, NULL, NULL)
  `

  await sql`
    INSERT INTO app_requests (name, description, requirements, status, app_id)
    VALUES (${name}, ${description}, ${requirements || null}, 'accepted', ${appId})
  `

  return new Response(
    JSON.stringify({
      result: 'accepted',
      appId,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}
