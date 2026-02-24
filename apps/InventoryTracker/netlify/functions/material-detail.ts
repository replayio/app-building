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
      const materialRows = await sql`
        SELECT
          m.id, m.name, m.description, m.unit_of_measure, m.reorder_point,
          m.category_id, m.created_at,
          mc.name AS category_name
        FROM materials m
        LEFT JOIN material_categories mc ON mc.id = m.category_id
        WHERE m.id = ${id}
      `;

      if (materialRows.length === 0) {
        return Response.json({ error: "Material not found" }, { status: 404 });
      }

      const material = materialRows[0];

      const accounts = await sql`
        SELECT
          a.id AS account_id,
          a.name AS account_name,
          a.type AS account_type,
          COALESCE(SUM(b.quantity), 0) AS total_quantity,
          COUNT(b.id) AS batch_count
        FROM batches b
        JOIN accounts a ON a.id = b.account_id
        WHERE b.material_id = ${id}
        GROUP BY a.id, a.name, a.type
        ORDER BY a.name ASC
      `;

      const batches = await sql`
        SELECT
          b.id, b.material_id, b.account_id, b.quantity, b.unit,
          b.status, b.location, b.lot_number, b.expiration_date,
          b.quality_grade, b.storage_condition,
          b.originating_transaction_id, b.created_at,
          a.name AS account_name
        FROM batches b
        JOIN accounts a ON a.id = b.account_id
        WHERE b.material_id = ${id}
        ORDER BY b.created_at DESC
      `;

      const transactions = await sql`
        SELECT DISTINCT
          t.id, t.date, t.reference_id, t.description,
          t.transaction_type, t.status, t.created_at,
          tt.source_account_id, tt.destination_account_id,
          tt.amount, tt.unit,
          sa.name AS source_account_name,
          da.name AS destination_account_name
        FROM transactions t
        JOIN transaction_transfers tt ON tt.transaction_id = t.id
        LEFT JOIN accounts sa ON sa.id = tt.source_account_id
        LEFT JOIN accounts da ON da.id = tt.destination_account_id
        WHERE tt.material_id = ${id}
        ORDER BY t.date DESC, t.created_at DESC
      `;

      return Response.json({
        ...material,
        accounts,
        batches,
        transactions,
      });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to fetch material detail" },
        { status: 500 }
      );
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
