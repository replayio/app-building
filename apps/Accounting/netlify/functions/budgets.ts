import { neon } from "@neondatabase/serverless";
import type { Context } from "@netlify/functions";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

function parseAmount(val: unknown): number {
  if (val === null || val === undefined) return 0;
  return parseFloat(val as string);
}

function parseBudgetRow(row: Record<string, unknown>) {
  return {
    ...row,
    amount: parseAmount(row.amount),
    actual_amount: parseAmount(row.actual_amount),
  };
}

export default async function handler(req: Request, _context: Context) {
  const sql = getSQL();
  const url = new URL(req.url);
  const segments = url.pathname
    .replace(/^\/\.netlify\/functions\/budgets\/?/, "")
    .split("/")
    .filter(Boolean);
  const id = segments[0] || null;

  try {
    if (req.method === "GET" && !id) {
      const accountId = url.searchParams.get("accountId");
      let rows;
      if (accountId) {
        rows = await sql`SELECT * FROM budgets WHERE account_id = ${accountId} ORDER BY name`;
      } else {
        rows = await sql`SELECT * FROM budgets ORDER BY name`;
      }
      return new Response(JSON.stringify(rows.map(parseBudgetRow)), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && id) {
      const rows = await sql`SELECT * FROM budgets WHERE id = ${id}`;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      }
      return new Response(JSON.stringify(parseBudgetRow(rows[0])), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = (await req.json()) as {
        account_id: string;
        name: string;
        amount: number;
        actual_amount?: number;
        period: string;
      };
      const rows = await sql`
        INSERT INTO budgets (account_id, name, amount, actual_amount, period)
        VALUES (${body.account_id}, ${body.name}, ${body.amount}, ${body.actual_amount ?? 0}, ${body.period})
        RETURNING *
      `;
      return new Response(JSON.stringify(parseBudgetRow(rows[0])), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT" && id) {
      const body = (await req.json()) as {
        name: string;
        amount: number;
        period: string;
      };
      const rows = await sql`
        UPDATE budgets SET name = ${body.name}, amount = ${body.amount}, period = ${body.period}
        WHERE id = ${id} RETURNING *
      `;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      }
      return new Response(JSON.stringify(parseBudgetRow(rows[0])), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE" && id) {
      await sql`DELETE FROM budgets WHERE id = ${id}`;
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (err) {
    console.error("budgets function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
