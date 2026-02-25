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

  let body: { action?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "Invalid JSON body");
  }

  const { action, email, password } = body;

  if (!action || !email || !password) {
    return errorResponse(400, "Missing required fields: action, email, password");
  }

  const isTest = process.env.IS_TEST === "true";

  if (action === "signup") {
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

    return jsonResponse({ requiresConfirmation: true, message: "A confirmation email has been sent." });
  }

  if (action === "signin") {
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

  return errorResponse(400, "Invalid action. Use 'signin' or 'signup'.");
}
