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
  const materialId = url.searchParams.get("material_id") || null;

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!materialId) {
    return new Response(
      JSON.stringify({ error: "material_id is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Get account distribution for this material
    const accounts = await sql`
      SELECT a.id as account_id, a.name as account_name, a.account_type,
             COALESCE(SUM(b.quantity), 0)::numeric as total_quantity,
             COUNT(b.id)::int as batch_count
      FROM accounts a
      INNER JOIN batches b ON a.id = b.account_id AND b.material_id = ${materialId}
      WHERE a.status = 'active'
      GROUP BY a.id, a.name, a.account_type
      ORDER BY a.name ASC
    `;

    // Get batches grouped by account
    const batches = await sql`
      SELECT b.id, b.account_id, b.quantity, b.unit, b.created_at, b.status
      FROM batches b
      WHERE b.material_id = ${materialId}
      ORDER BY b.created_at DESC
    `;

    // Group batches by account_id
    const batchesByAccount: Record<string, unknown[]> = {};
    for (const batch of batches) {
      const accId = batch.account_id as string;
      if (!batchesByAccount[accId]) batchesByAccount[accId] = [];
      batchesByAccount[accId].push(batch);
    }

    const result = accounts.map((acc: Record<string, unknown>) => ({
      ...acc,
      batches: batchesByAccount[acc.account_id as string] || [],
    }));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Material distribution error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
