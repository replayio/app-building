import { getDb, query, queryOne, jsonResponse, errorResponse } from "@shared/backend/db";

function base64url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function createJwt(payload: Record<string, unknown>): string {
  const header = base64url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  return `${header}.${body}.`;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "sales-crm-salt");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "Sales CRM <noreply@resend.dev>",
      to,
      subject,
      html,
    }),
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return errorResponse(405, "Method not allowed");
  }

  const sql = getDb();

  let body: { action?: string; email?: string; password?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "Invalid JSON body");
  }

  const { action } = body;

  if (!action) {
    return errorResponse(400, "Missing required field: action");
  }

  const isTest = process.env.IS_TEST === "true";
  const siteUrl = process.env.URL || process.env.SITE_URL || "http://localhost:8888";

  if (action === "signup") {
    const { email, password } = body;
    if (!email || !password) {
      return errorResponse(400, "Missing required fields: email, password");
    }

    const existing = await queryOne<{ id: string }>(sql, "SELECT id FROM users WHERE email = $1", [email]);
    if (existing) {
      return errorResponse(409, "An account with this email already exists");
    }

    const passwordHash = await hashPassword(password);
    const name = email.split("@")[0];

    if (isTest) {
      const rows = await query<{ id: string; name: string; email: string; avatar_url: string | null }>(
        sql,
        "INSERT INTO users (name, email, password_hash, email_confirmed) VALUES ($1, $2, $3, true) RETURNING id, name, email, avatar_url",
        [name, email, passwordHash]
      );
      const newUser = rows[0];
      const token = createJwt({ sub: newUser.id, email: newUser.email, name: newUser.name });
      return jsonResponse({
        user: { id: newUser.id, name: newUser.name, email: newUser.email, avatarUrl: newUser.avatar_url },
        token,
      });
    }

    const rows = await query<{ id: string; name: string; email: string }>(
      sql,
      "INSERT INTO users (name, email, password_hash, email_confirmed) VALUES ($1, $2, $3, false) RETURNING id, name, email",
      [name, email, passwordHash]
    );
    const newUser = rows[0];

    const confirmToken = crypto.randomUUID();
    await query(
      sql,
      "INSERT INTO email_tokens (user_id, token, type, expires_at) VALUES ($1, $2, 'confirmation', NOW() + INTERVAL '24 hours')",
      [newUser.id, confirmToken]
    );

    const confirmUrl = `${siteUrl}/auth/confirm-email?token=${confirmToken}`;
    await sendEmail(
      email,
      "Confirm your email — Sales CRM",
      `<p>Welcome to Sales CRM!</p><p>Please confirm your email by clicking the link below:</p><p><a href="${confirmUrl}">Confirm Email</a></p><p>This link expires in 24 hours.</p>`
    );

    return jsonResponse({ requiresConfirmation: true, message: "A confirmation email has been sent." });
  }

  if (action === "signin") {
    const { email, password } = body;
    if (!email || !password) {
      return errorResponse(400, "Missing required fields: email, password");
    }

    const passwordHash = await hashPassword(password);
    const user = await queryOne<{ id: string; name: string; email: string; avatar_url: string | null; email_confirmed: boolean; password_hash: string }>(
      sql,
      "SELECT id, name, email, avatar_url, email_confirmed, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (!user || user.password_hash !== passwordHash) {
      return errorResponse(401, "Invalid email or password");
    }

    if (!user.email_confirmed) {
      return errorResponse(403, "Please confirm your email before signing in");
    }

    const token = createJwt({ sub: user.id, email: user.email, name: user.name });
    return jsonResponse({
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url },
      token,
    });
  }

  if (action === "forgot-password") {
    const { email } = body;
    if (!email) {
      return errorResponse(400, "Email is required");
    }

    const user = await queryOne<{ id: string; email: string }>(
      sql,
      "SELECT id, email FROM users WHERE email = $1",
      [email]
    );

    if (user) {
      const resetToken = crypto.randomUUID();
      await query(
        sql,
        "INSERT INTO email_tokens (user_id, token, type, expires_at) VALUES ($1, $2, 'reset', NOW() + INTERVAL '1 hour')",
        [user.id, resetToken]
      );

      if (!isTest) {
        const resetUrl = `${siteUrl}/auth/reset-password?token=${resetToken}`;
        await sendEmail(
          user.email,
          "Reset your password — Sales CRM",
          `<p>You requested a password reset for your Sales CRM account.</p><p>Click the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`
        );
      }
    }

    return jsonResponse({ message: "If an account exists with that email, a password reset link has been sent." });
  }

  if (action === "reset-password") {
    const { token, password } = body;
    if (!token) {
      return errorResponse(400, "Reset token is required");
    }
    if (!password) {
      return errorResponse(400, "Password is required");
    }

    const tokenRow = await queryOne<{ id: string; user_id: string; expires_at: string; used_at: string | null; type: string }>(
      sql,
      "SELECT id, user_id, expires_at, used_at, type FROM email_tokens WHERE token = $1",
      [token]
    );

    if (!tokenRow || tokenRow.type !== "reset") {
      return errorResponse(400, "This reset link is invalid or has expired.");
    }

    if (tokenRow.used_at) {
      return errorResponse(400, "This reset link has already been used.");
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      return errorResponse(400, "This reset link is invalid or has expired.");
    }

    const passwordHash = await hashPassword(password);

    await query(sql, "UPDATE users SET password_hash = $1, email_confirmed = true, updated_at = NOW() WHERE id = $2", [
      passwordHash,
      tokenRow.user_id,
    ]);

    await query(sql, "UPDATE email_tokens SET used_at = NOW() WHERE id = $1", [tokenRow.id]);

    const user = await queryOne<{ id: string; name: string; email: string; avatar_url: string | null }>(
      sql,
      "SELECT id, name, email, avatar_url FROM users WHERE id = $1",
      [tokenRow.user_id]
    );

    if (!user) {
      return errorResponse(500, "User not found");
    }

    const jwtToken = createJwt({ sub: user.id, email: user.email, name: user.name });
    return jsonResponse({
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url },
      token: jwtToken,
    });
  }

  if (action === "confirm-email") {
    const { token } = body;
    if (!token) {
      return errorResponse(400, "No confirmation token provided.");
    }

    const tokenRow = await queryOne<{ id: string; user_id: string; expires_at: string; used_at: string | null; type: string }>(
      sql,
      "SELECT id, user_id, expires_at, used_at, type FROM email_tokens WHERE token = $1",
      [token]
    );

    if (!tokenRow || tokenRow.type !== "confirmation") {
      return errorResponse(400, "This confirmation link is invalid.");
    }

    if (tokenRow.used_at) {
      return errorResponse(400, "This confirmation link has already been used.");
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      return errorResponse(400, "This confirmation link has expired.");
    }

    await query(sql, "UPDATE users SET email_confirmed = true, updated_at = NOW() WHERE id = $1", [tokenRow.user_id]);
    await query(sql, "UPDATE email_tokens SET used_at = NOW() WHERE id = $1", [tokenRow.id]);

    const user = await queryOne<{ id: string; name: string; email: string; avatar_url: string | null }>(
      sql,
      "SELECT id, name, email, avatar_url FROM users WHERE id = $1",
      [tokenRow.user_id]
    );

    if (!user) {
      return errorResponse(500, "User not found");
    }

    const jwtToken = createJwt({ sub: user.id, email: user.email, name: user.name });
    return jsonResponse({
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url },
      token: jwtToken,
    });
  }

  return errorResponse(400, "Invalid action. Use 'signin', 'signup', 'forgot-password', 'reset-password', or 'confirm-email'.");
}
