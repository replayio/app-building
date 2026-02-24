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
      const txnRows = await sql`
        SELECT id, date, reference_id, description, transaction_type,
               status, creator, created_at
        FROM transactions
        WHERE id = ${id}
      `;

      if (txnRows.length === 0) {
        return Response.json({ error: "Transaction not found" }, { status: 404 });
      }

      const transaction = txnRows[0];

      // Quantity transfers with source/destination accounts
      const transfers = await sql`
        SELECT
          tt.id, tt.transaction_id,
          tt.source_account_id, tt.destination_account_id,
          tt.material_id, tt.amount, tt.unit,
          tt.source_batch_id,
          sa.name AS source_account_name,
          sa.type AS source_account_type,
          da.name AS destination_account_name,
          da.type AS destination_account_type,
          m.name AS material_name,
          m.unit_of_measure
        FROM transaction_transfers tt
        LEFT JOIN accounts sa ON sa.id = tt.source_account_id
        LEFT JOIN accounts da ON da.id = tt.destination_account_id
        LEFT JOIN materials m ON m.id = tt.material_id
        WHERE tt.transaction_id = ${id}
        ORDER BY tt.id ASC
      `;

      // Batches created by this transaction
      const batchesCreated = await sql`
        SELECT
          b.id, b.material_id, b.account_id, b.quantity, b.unit,
          b.status, b.location, b.lot_number, b.created_at,
          m.name AS material_name,
          a.name AS account_name
        FROM transaction_batches_created tbc
        JOIN batches b ON b.id = tbc.batch_id
        JOIN materials m ON m.id = b.material_id
        JOIN accounts a ON a.id = b.account_id
        WHERE tbc.transaction_id = ${id}
        ORDER BY b.created_at ASC
      `;

      return Response.json({
        ...transaction,
        transfers,
        batches_created: batchesCreated,
      });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to fetch transaction detail" },
        { status: 500 }
      );
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
