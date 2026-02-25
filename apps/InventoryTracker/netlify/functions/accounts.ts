import { neon } from "@neondatabase/serverless";
import type { Context } from "@netlify/functions";

export default async function handler(req: Request, _context: Context) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: "DATABASE_URL not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sql = neon(dbUrl);
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  // segments: ["", ".netlify", "functions", "accounts", "<id>?"]
  const accountId = segments[3] || null;

  try {
    if (req.method === "GET" && !accountId) {
      // List all active accounts
      const rows = await sql`
        SELECT id, name, account_type, description, is_default, status,
               created_at, updated_at
        FROM accounts
        WHERE status = 'active'
        ORDER BY
          CASE account_type WHEN 'stock' THEN 1 WHEN 'input' THEN 2 WHEN 'output' THEN 3 END,
          is_default DESC,
          name ASC
      `;
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && accountId) {
      // Get single account
      const rows = await sql`
        SELECT id, name, account_type, description, is_default, status,
               created_at, updated_at
        FROM accounts
        WHERE id = ${accountId}
      `;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Account not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(rows[0]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { name, account_type, description } = body as {
        name?: string;
        account_type?: string;
        description?: string;
      };
      if (!name || !name.trim()) {
        return new Response(
          JSON.stringify({ error: "Account Name is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!account_type || !["stock", "input", "output"].includes(account_type)) {
        return new Response(
          JSON.stringify({ error: "Invalid account_type" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const rows = await sql`
        INSERT INTO accounts (name, account_type, description, is_default)
        VALUES (${name.trim()}, ${account_type}, ${(description || "").trim()}, FALSE)
        RETURNING id, name, account_type, description, is_default, status, created_at, updated_at
      `;
      return new Response(JSON.stringify(rows[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT" && accountId) {
      const body = await req.json();
      const { name, description } = body as {
        name?: string;
        description?: string;
      };
      if (!name || !name.trim()) {
        return new Response(
          JSON.stringify({ error: "Account Name is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const rows = await sql`
        UPDATE accounts
        SET name = ${name.trim()},
            description = ${(description || "").trim()},
            updated_at = NOW()
        WHERE id = ${accountId}
        RETURNING id, name, account_type, description, is_default, status, created_at, updated_at
      `;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Account not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(rows[0]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE" && accountId) {
      // Archive the account (soft delete)
      const rows = await sql`
        UPDATE accounts
        SET status = 'archived', updated_at = NOW()
        WHERE id = ${accountId}
        RETURNING id
      `;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Account not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Accounts error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
