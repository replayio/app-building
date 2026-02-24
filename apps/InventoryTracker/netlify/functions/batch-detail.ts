import { neon } from "@neondatabase/serverless";

export default async (req: Request) => {
  const sql = neon(process.env.DATABASE_URL!);
  const url = new URL(req.url);

  if (req.method === "GET") {
    const id = url.searchParams.get("id");
    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    try {
      const batchRows = await sql`
        SELECT
          b.id, b.material_id, b.account_id, b.quantity, b.unit,
          b.status, b.location, b.lot_number, b.expiration_date,
          b.quality_grade, b.storage_condition,
          b.originating_transaction_id, b.created_at,
          m.name AS material_name,
          m.unit_of_measure,
          a.name AS account_name,
          a.type AS account_type
        FROM batches b
        JOIN materials m ON m.id = b.material_id
        JOIN accounts a ON a.id = b.account_id
        WHERE b.id = ${id}
      `;

      if (batchRows.length === 0) {
        return Response.json({ error: "Batch not found" }, { status: 404 });
      }

      const batch = batchRows[0];

      // Lineage: source transaction and input batches
      let sourceTransaction = null;
      if (batch.originating_transaction_id) {
        const txnRows = await sql`
          SELECT id, date, reference_id, description, transaction_type, status, created_at
          FROM transactions
          WHERE id = ${batch.originating_transaction_id as string}
        `;
        if (txnRows.length > 0) {
          sourceTransaction = txnRows[0];
        }
      }

      const inputBatches = await sql`
        SELECT
          bl.source_batch_id,
          sb.material_id, sb.account_id, sb.quantity, sb.unit,
          sm.name AS material_name,
          sa.name AS account_name
        FROM batch_lineage bl
        JOIN batches sb ON sb.id = bl.source_batch_id
        JOIN materials sm ON sm.id = sb.material_id
        JOIN accounts sa ON sa.id = sb.account_id
        WHERE bl.created_batch_id = ${id}
      `;

      // Usage history: transactions that used this batch
      const usageHistory = await sql`
        SELECT
          t.id AS transaction_id, t.date, t.reference_id, t.description,
          t.transaction_type,
          tt.amount, tt.unit,
          tt.source_account_id, tt.destination_account_id,
          sa.name AS source_account_name,
          da.name AS destination_account_name
        FROM transaction_transfers tt
        JOIN transactions t ON t.id = tt.transaction_id
        LEFT JOIN accounts sa ON sa.id = tt.source_account_id
        LEFT JOIN accounts da ON da.id = tt.destination_account_id
        WHERE tt.source_batch_id = ${id}
        ORDER BY t.date DESC, t.created_at DESC
      `;

      // Also check if this batch was created from transactions
      const createdIn = await sql`
        SELECT
          t.id AS transaction_id, t.date, t.reference_id, t.description,
          t.transaction_type
        FROM transaction_batches_created tbc
        JOIN transactions t ON t.id = tbc.transaction_id
        WHERE tbc.batch_id = ${id}
      `;

      return Response.json({
        ...batch,
        lineage: {
          source_transaction: sourceTransaction,
          input_batches: inputBatches,
        },
        usage_history: usageHistory,
        created_in: createdIn,
      });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to fetch batch detail" },
        { status: 500 }
      );
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
