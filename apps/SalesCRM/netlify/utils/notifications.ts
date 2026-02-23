import { neon } from '@neondatabase/serverless'
import { Resend } from 'resend'

const FROM_EMAIL = 'Sales CRM <noreply@updates.nut.new>'

const EVENT_TO_PREF_KEY: Record<string, string> = {
  client_updated: 'notify_client_updated',
  deal_created: 'notify_deal_created',
  deal_stage_changed: 'notify_deal_stage_changed',
  task_created: 'notify_task_created',
  task_completed: 'notify_task_completed',
  contact_added: 'notify_contact_added',
  note_added: 'notify_note_added',
}

const EVENT_LABELS: Record<string, string> = {
  client_updated: 'Client Updated',
  deal_created: 'New Deal Created',
  deal_stage_changed: 'Deal Stage Changed',
  task_created: 'New Task Created',
  task_completed: 'Task Completed',
  contact_added: 'New Contact Added',
  note_added: 'Note Added',
}

function getAppUrl(request?: Request): string {
  if (request) {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`
    }
    const host = request.headers.get('host')
    if (host && !/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|$)/.test(host)) {
      return `https://${host}`
    }
    try {
      const url = new URL(request.url)
      if (!/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(url.hostname)) {
        return url.origin
      }
    } catch { /* fall through */ }
  }
  if (process.env.URL) return process.env.URL
  return 'http://localhost:8888'
}

interface FollowerRow {
  id: string
  email: string
  name: string
  notify_client_updated: boolean | null
  notify_deal_created: boolean | null
  notify_deal_stage_changed: boolean | null
  notify_task_created: boolean | null
  notify_task_completed: boolean | null
  notify_contact_added: boolean | null
  notify_note_added: boolean | null
}

/**
 * Send email notifications to users following a client when something changes.
 * Checks each follower's notification preferences before sending.
 */
export async function notifyClientFollowers(
  databaseUrl: string,
  clientId: string,
  eventType: string,
  description: string,
  actorUserId?: string,
  request?: Request
): Promise<void> {
  const prefKey = EVENT_TO_PREF_KEY[eventType]
  if (!prefKey) return

  const sql = neon(databaseUrl)

  // Get client name for the email
  const clientRows = await sql`SELECT name FROM clients WHERE id = ${clientId}::uuid`
  if (clientRows.length === 0) return
  const clientName = clientRows[0].name

  // Get all followers with their notification preferences
  const followers = await sql`
    SELECT u.id, u.email, u.name,
      np.notify_client_updated,
      np.notify_deal_created,
      np.notify_deal_stage_changed,
      np.notify_task_created,
      np.notify_task_completed,
      np.notify_contact_added,
      np.notify_note_added
    FROM client_followers cf
    JOIN users u ON u.id = cf.user_id
    LEFT JOIN notification_preferences np ON np.user_id = u.id
    WHERE cf.client_id = ${clientId}::uuid
  ` as FollowerRow[]

  // Filter: exclude actor and check notification preference (default true if no prefs row)
  const recipients = followers.filter(f => {
    if (actorUserId && f.id === actorUserId) return false
    const pref = f[prefKey as keyof FollowerRow]
    return pref === null || pref === true
  })

  if (recipients.length === 0) return

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    for (const f of recipients) {
      console.log(`[notification] Would email ${f.email}: ${eventType} on ${clientName} — ${description}`)
    }
    return
  }

  const resend = new Resend(apiKey)
  const appUrl = getAppUrl(request)
  const clientUrl = `${appUrl}/clients/${clientId}`
  const settingsUrl = `${appUrl}/settings`
  const eventLabel = EVENT_LABELS[eventType] || eventType

  for (const follower of recipients) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: follower.email,
        subject: `${eventLabel}: ${clientName}`,
        html: `
          <div style="font-family: Inter, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #1a1a1a; font-size: 18px; margin-bottom: 12px;">${eventLabel}</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">
              Hi ${follower.name},
            </p>
            <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
              A change was made to <strong>${clientName}</strong>, a client you are following:
            </p>
            <div style="background: #f5f5f7; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
              <p style="color: #333; font-size: 14px; margin: 0;">${description}</p>
            </div>
            <a href="${clientUrl}" style="display: inline-block; padding: 10px 24px; background: #7180ff; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
              View Client
            </a>
            <p style="color: #aaa; font-size: 12px; margin-top: 24px;">
              You're receiving this because you follow ${clientName}.
              <a href="${settingsUrl}" style="color: #7180ff; text-decoration: none;">Manage notification preferences</a>
            </p>
          </div>
        `,
      })
    } catch (err) {
      console.error(`[notification] Failed to email ${follower.email}:`, err)
    }
  }
}
