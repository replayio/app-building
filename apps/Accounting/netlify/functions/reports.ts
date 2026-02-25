import { neon } from "@neondatabase/serverless";
import type { Context } from "@netlify/functions";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

const NUMERIC_FIELDS = [
  "budget_amount",
  "actual_amount",
  "variance",
  "variance_pct",
  "sort_order",
];

function parseNumericFields(
  row: Record<string, unknown>
): Record<string, unknown> {
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
  const segments = url.pathname
    .replace(/^\/\.netlify\/functions\/reports\/?/, "")
    .split("/")
    .filter(Boolean);
  const id = segments[0] || null;

  try {
    if (req.method === "GET" && !id) {
      const rows = await sql`SELECT * FROM reports ORDER BY created_at DESC`;
      return new Response(JSON.stringify(rows), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && id) {
      const reportRows = await sql`SELECT * FROM reports WHERE id = ${id}`;
      if (reportRows.length === 0) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
        });
      }
      const report = reportRows[0];
      const items =
        await sql`SELECT * FROM report_items WHERE report_id = ${id} ORDER BY sort_order`;
      return new Response(
        JSON.stringify({
          report,
          items: items.map(parseNumericFields),
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST") {
      const body = (await req.json()) as {
        name: string;
        report_type: string;
        date_range_start: string;
        date_range_end: string;
        categories_filter: string | null;
        include_zero_balance: boolean;
      };

      const {
        name,
        report_type,
        date_range_start,
        date_range_end,
        categories_filter,
        include_zero_balance,
      } = body;

      const reportRows = await sql`
        INSERT INTO reports (name, report_type, date_range_start, date_range_end, categories_filter, include_zero_balance, status)
        VALUES (${name}, ${report_type}, ${date_range_start || null}, ${date_range_end || null}, ${categories_filter || null}, ${include_zero_balance}, 'complete')
        RETURNING *
      `;
      const report = reportRows[0];

      // Build category filter
      const categories = categories_filter
        ? categories_filter.split(",").map((c: string) => c.trim())
        : null;

      // Fetch accounts with optional category filter
      let accounts;
      if (categories && categories.length > 0) {
        accounts =
          await sql`SELECT * FROM accounts WHERE category = ANY(${categories}) ORDER BY category, name`;
      } else {
        accounts =
          await sql`SELECT * FROM accounts ORDER BY category, name`;
      }

      // Filter out zero-balance accounts if needed
      const filteredAccounts = include_zero_balance
        ? accounts
        : accounts.filter(
            (a: Record<string, unknown>) =>
              parseFloat(a.budget_amount as string) !== 0 ||
              parseFloat(a.budget_actual as string) !== 0
          );

      // Create report items for each account
      let sortOrder = 0;
      for (const acct of filteredAccounts) {
        const budgetAmount = parseFloat(acct.budget_amount as string) || 0;
        const actualAmount = parseFloat(acct.budget_actual as string) || 0;
        const variance = budgetAmount - actualAmount;
        const variancePct =
          budgetAmount !== 0
            ? Math.round((variance / budgetAmount) * 10000) / 100
            : 0;

        await sql`
          INSERT INTO report_items (report_id, account_id, item_name, item_type, budget_amount, actual_amount, variance, variance_pct, sort_order)
          VALUES (${report.id}, ${acct.id}, ${acct.name}, 'account', ${budgetAmount}, ${actualAmount}, ${variance}, ${variancePct}, ${sortOrder})
        `;
        sortOrder++;

        // Fetch budgets for this account to create sub-items
        const budgets =
          await sql`SELECT * FROM budgets WHERE account_id = ${acct.id} ORDER BY name`;
        for (const budget of budgets) {
          const bAmount = parseFloat(budget.amount as string) || 0;
          const bActual = parseFloat(budget.actual_amount as string) || 0;
          const bVariance = bAmount - bActual;
          const bVariancePct =
            bAmount !== 0
              ? Math.round((bVariance / bAmount) * 10000) / 100
              : 0;

          // Get parent item id
          const parentRows =
            await sql`SELECT id FROM report_items WHERE report_id = ${report.id} AND account_id = ${acct.id} AND item_type = 'account' LIMIT 1`;
          const parentId = parentRows.length > 0 ? parentRows[0].id : null;

          await sql`
            INSERT INTO report_items (report_id, account_id, item_name, item_type, parent_item_id, budget_amount, actual_amount, variance, variance_pct, sort_order)
            VALUES (${report.id}, ${acct.id}, ${budget.name}, 'item', ${parentId}, ${bAmount}, ${bActual}, ${bVariance}, ${bVariancePct}, ${sortOrder})
          `;
          sortOrder++;
        }
      }

      return new Response(JSON.stringify(report), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE" && id) {
      await sql`DELETE FROM reports WHERE id = ${id}`;
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  } catch (err) {
    console.error("reports function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
