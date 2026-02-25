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
  const batchId = segments[3] || null;

  if (req.method !== "GET" || !batchId) {
    return new Response(JSON.stringify({ error: "GET /batch-usage/:batchId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Find transactions where this batch was created (In movement)
    const inRows = await sql`
      SELECT t.id as transaction_id, t.reference_id, t.date,
             t.transaction_type, t.created_at,
             bc.quantity as amount, bc.unit,
             'in' as movement
      FROM batches_created bc
      JOIN transactions t ON bc.transaction_id = t.id
      WHERE bc.batch_id = ${batchId}
    `;

    // Find transactions where this batch was used as source (Out movement)
    const outRows = await sql`
      SELECT t.id as transaction_id, t.reference_id, t.date,
             t.transaction_type, t.created_at,
             qt.amount, qt.unit,
             'out' as movement
      FROM quantity_transfers qt
      JOIN transactions t ON qt.transaction_id = t.id
      WHERE qt.source_batch_id = ${batchId}
    `;

    // Combine and get unique transaction IDs
    const allEntries = [...inRows, ...outRows];
    const txnIds = [...new Set(allEntries.map((e) => e.transaction_id as string))];

    // For each transaction, find any batches that were created
    const createdBatchesMap: Record<string, { batch_id: string; reference: string }[]> = {};
    if (txnIds.length > 0) {
      for (const txnId of txnIds) {
        const batchRows = await sql`
          SELECT bc.batch_id, b.lot_number
          FROM batches_created bc
          LEFT JOIN batches b ON bc.batch_id = b.id
          WHERE bc.transaction_id = ${txnId}
            AND bc.batch_id != ${batchId}
        `;
        createdBatchesMap[txnId] = batchRows.map((r) => ({
          batch_id: r.batch_id as string,
          reference: (r.lot_number as string) || (r.batch_id as string).substring(0, 13),
        }));
      }
    }

    // Build result entries
    const result = allEntries.map((entry) => ({
      transaction_id: entry.transaction_id as string,
      reference_id: entry.reference_id as string,
      date: entry.date as string,
      created_at: entry.created_at as string,
      transaction_type: entry.transaction_type as string,
      movement: entry.movement as string,
      amount: Number(entry.amount),
      unit: entry.unit as string,
      created_batches: createdBatchesMap[entry.transaction_id as string] || [],
    }));

    // Sort by created_at descending (most recent first)
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Batch usage error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
