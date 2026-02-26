import { neon } from "@neondatabase/serverless";
import type { Context } from "@netlify/functions";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

const NUMERIC_FIELDS = [
  "balance", "budget_amount", "budget_actual", "interest_rate",
  "credit_limit", "monthly_payment", "savings_goal_target",
  "savings_goal_current", "performance_pct", "debits_ytd", "credits_ytd",
];

function parseNumericFields(row: Record<string, unknown>): Record<string, unknown> {
  const parsed = { ...row };
  for (const field of NUMERIC_FIELDS) {
    if (parsed[field] !== null && parsed[field] !== undefined) {
      parsed[field] = parseFloat(parsed[field] as string);
    }
  }
  return parsed;
}

export default async function handler(req: Request, _context: Context) {
  const sql = getSQL();
  const url = new URL(req.url);
  const segments = url.pathname.replace(/^\/\.netlify\/functions\/accounts\/?/, "").split("/").filter(Boolean);
  const id = segments[0] || null;

  try {
    if (req.method === "GET" && !id) {
      const rows = await sql`SELECT * FROM accounts ORDER BY category, name`;
      return new Response(JSON.stringify(rows.map(parseNumericFields)), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && id) {
      const rows = await sql`SELECT * FROM accounts WHERE id = ${id}`;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      }
      return new Response(JSON.stringify(parseNumericFields(rows[0])), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const rows = await sql`
        INSERT INTO accounts (name, code, category, balance, institution, description,
          budget_amount, budget_actual, debits_ytd, credits_ytd,
          savings_goal_name, savings_goal_target, savings_goal_current,
          performance_pct, interest_rate, credit_limit, monthly_payment)
        VALUES (${body.name}, ${body.code}, ${body.category}, ${body.balance ?? 0},
          ${body.institution ?? null}, ${body.description ?? null},
          ${body.budget_amount ?? 0}, ${body.budget_actual ?? 0},
          ${body.debits_ytd ?? 0}, ${body.credits_ytd ?? 0},
          ${body.savings_goal_name ?? null}, ${body.savings_goal_target ?? null},
          ${body.savings_goal_current ?? null}, ${body.performance_pct ?? null},
          ${body.interest_rate ?? null}, ${body.credit_limit ?? null},
          ${body.monthly_payment ?? null})
        RETURNING *
      `;
      return new Response(JSON.stringify(parseNumericFields(rows[0])), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE" && id) {
      await sql`DELETE FROM transaction_entries WHERE account_id = ${id}`;
      await sql`UPDATE report_items SET account_id = NULL WHERE account_id = ${id}`;
      await sql`DELETE FROM accounts WHERE id = ${id}`;
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (err) {
    console.error("accounts function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
