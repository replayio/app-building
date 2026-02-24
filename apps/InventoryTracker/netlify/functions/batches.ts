import { neon } from "@neondatabase/serverless";

export default async (req: Request) => {
  const sql = neon(process.env.DATABASE_URL!);
  const url = new URL(req.url);

  if (req.method === "GET") {
    const materialId = url.searchParams.get("material_id");
    const accountId = url.searchParams.get("account_id");

    try {
      const conditions: string[] = [];
      if (materialId) {
        conditions.push(`b.material_id = '${materialId.replace(/'/g, "''")}'`);
      }
      if (accountId) {
        conditions.push(`b.account_id = '${accountId.replace(/'/g, "''")}'`);
      }

      const whereClause =
        conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

      const rows = await sql(
        `SELECT
           b.id, b.material_id, b.account_id, b.quantity, b.unit,
           b.status, b.location, b.lot_number, b.expiration_date,
           b.quality_grade, b.storage_condition,
           b.originating_transaction_id, b.created_at,
           m.name AS material_name,
           a.name AS account_name
         FROM batches b
         JOIN materials m ON m.id = b.material_id
         JOIN accounts a ON a.id = b.account_id
         ${whereClause}
         ORDER BY b.created_at DESC`
      );

      return Response.json(rows);
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to fetch batches" },
        { status: 500 }
      );
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const {
        id,
        material_id,
        account_id,
        quantity,
        unit,
        location,
        lot_number,
        expiration_date,
        quality_grade,
        storage_condition,
        originating_transaction_id,
      } = body;

      if (!id || !material_id || !account_id) {
        return Response.json(
          { error: "id, material_id, and account_id are required" },
          { status: 400 }
        );
      }

      const rows = await sql`
        INSERT INTO batches (
          id, material_id, account_id, quantity, unit,
          location, lot_number, expiration_date,
          quality_grade, storage_condition, originating_transaction_id
        )
        VALUES (
          ${id},
          ${material_id},
          ${account_id},
          ${quantity ?? 0},
          ${unit ?? "units"},
          ${location ?? ""},
          ${lot_number ?? ""},
          ${expiration_date ?? null},
          ${quality_grade ?? ""},
          ${storage_condition ?? ""},
          ${originating_transaction_id ?? null}
        )
        RETURNING *
      `;

      return Response.json(rows[0], { status: 201 });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to create batch" },
        { status: 500 }
      );
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
