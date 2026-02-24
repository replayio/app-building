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
      const accountRows = await sql`
        SELECT id, name, type, description, is_default, status, created_at
        FROM accounts
        WHERE id = ${id}
      `;

      if (accountRows.length === 0) {
        return Response.json({ error: "Account not found" }, { status: 404 });
      }

      const account = accountRows[0];

      const materials = await sql`
        SELECT
          m.id AS material_id,
          m.name AS material_name,
          mc.name AS category_name,
          m.unit_of_measure,
          COALESCE(SUM(b.quantity), 0) AS total_quantity,
          COUNT(b.id) AS batch_count
        FROM batches b
        JOIN materials m ON m.id = b.material_id
        LEFT JOIN material_categories mc ON mc.id = m.category_id
        WHERE b.account_id = ${id}
        GROUP BY m.id, m.name, mc.name, m.unit_of_measure
        ORDER BY m.name ASC
      `;

      return Response.json({ ...account, materials });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to fetch account detail" },
        { status: 500 }
      );
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
