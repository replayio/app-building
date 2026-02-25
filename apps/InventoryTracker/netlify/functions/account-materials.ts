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

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const accountId = url.searchParams.get("account_id");
  if (!accountId) {
    return new Response(
      JSON.stringify({ error: "account_id query parameter is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const rows = await sql`
      SELECT
        b.material_id,
        m.name AS material_name,
        mc.name AS category_name,
        m.unit_of_measure,
        COALESCE(SUM(b.quantity), 0)::numeric AS total_quantity,
        COUNT(b.id)::int AS batch_count
      FROM batches b
      JOIN materials m ON m.id = b.material_id
      JOIN material_categories mc ON mc.id = m.category_id
      WHERE b.account_id = ${accountId}
        AND b.status = 'active'
      GROUP BY b.material_id, m.name, mc.name, m.unit_of_measure
      ORDER BY m.name ASC
    `;

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Account materials error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
