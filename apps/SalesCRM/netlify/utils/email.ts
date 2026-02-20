import { Resend } from 'resend'

const FROM_EMAIL = 'Sales CRM <noreply@updates.nut.new>'

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

function getAppUrl(): string {
  if (process.env.URL) return process.env.URL
  return 'http://localhost:8888'
}

export async function sendConfirmationEmail(email: string, token: string): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.log(`[email] No RESEND_API_KEY — confirmation link: ${getAppUrl()}/auth/confirm-email?token=${token}`)
    return true
  }

  const confirmUrl = `${getAppUrl()}/auth/confirm-email?token=${token}`
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Confirm your Sales CRM account',
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">Confirm your email</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Thanks for signing up for Sales CRM. Click the button below to confirm your email address and activate your account.
        </p>
        <a href="${confirmUrl}" style="display: inline-block; margin: 24px 0; padding: 10px 24px; background: #7180ff; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Confirm Email
        </a>
        <p style="color: #888; font-size: 12px;">
          This link expires in 24 hours. If you didn't create an account, you can ignore this email.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('[email] Failed to send confirmation email:', error)
    return false
  }
  return true
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.log(`[email] No RESEND_API_KEY — reset link: ${getAppUrl()}/auth/reset-password?token=${token}`)
    return true
  }

  const resetUrl = `${getAppUrl()}/auth/reset-password?token=${token}`
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your Sales CRM password',
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          We received a request to reset your Sales CRM password. Click the button below to choose a new password.
        </p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 10px 24px; background: #7180ff; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Reset Password
        </a>
        <p style="color: #888; font-size: 12px;">
          This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('[email] Failed to send password reset email:', error)
    return false
  }
  return true
}
