import { neon } from "@neondatabase/serverless";

export default async (req: Request) => {
  const sql = neon(process.env.DATABASE_URL!);
  const url = new URL(req.url);

  if (req.method === "GET") {
    const category = url.searchParams.get("category");
    const account = url.searchParams.get("account");
    const search = url.searchParams.get("search");
    const sort = url.searchParams.get("sort") || "name";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    try {
      let whereClause = "";
      const whereParts: string[] = [];

      if (category) {
        whereParts.push(`mc.id = '${category.replace(/'/g, "''")}'`);
      }
      if (search) {
        whereParts.push(
          `(LOWER(m.name) LIKE '%${search.toLowerCase().replace(/'/g, "''")}%' OR LOWER(m.description) LIKE '%${search.toLowerCase().replace(/'/g, "''")}%')`
        );
      }
      if (account) {
        whereParts.push(
          `m.id IN (SELECT DISTINCT material_id FROM batches WHERE account_id = '${account.replace(/'/g, "''")}')`
        );
      }
      if (whereParts.length > 0) {
        whereClause = "WHERE " + whereParts.join(" AND ");
      }

      let orderClause = "ORDER BY m.name ASC";
      if (sort === "name") orderClause = "ORDER BY m.name ASC";
      else if (sort === "name_desc") orderClause = "ORDER BY m.name DESC";
      else if (sort === "category") orderClause = "ORDER BY mc.name ASC, m.name ASC";
      else if (sort === "stock") orderClause = "ORDER BY stock ASC";
      else if (sort === "stock_desc") orderClause = "ORDER BY stock DESC";
      else if (sort === "created_at") orderClause = "ORDER BY m.created_at DESC";

      const countResult = await sql(
        `SELECT COUNT(DISTINCT m.id) AS total
         FROM materials m
         LEFT JOIN material_categories mc ON mc.id = m.category_id
         ${whereClause}`
      );

      const total = parseInt(countResult[0].total as string, 10);

      const rows = await sql(
        `SELECT
           m.id, m.name, m.description, m.unit_of_measure, m.reorder_point, m.created_at,
           m.category_id,
           mc.name AS category_name,
           COALESCE(SUM(b.quantity), 0) AS stock
         FROM materials m
         LEFT JOIN material_categories mc ON mc.id = m.category_id
         LEFT JOIN batches b ON b.material_id = m.id
         ${whereClause}
         GROUP BY m.id, m.name, m.description, m.unit_of_measure, m.reorder_point, m.created_at, m.category_id, mc.name
         ${orderClause}
         LIMIT ${limit} OFFSET ${offset}`
      );

      return Response.json({ materials: rows, total, page, limit });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to fetch materials" },
        { status: 500 }
      );
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { name, category_id, unit_of_measure, description, reorder_point } = body;
      if (!name) {
        return Response.json({ error: "name is required" }, { status: 400 });
      }
      const rows = await sql`
        INSERT INTO materials (name, category_id, unit_of_measure, description, reorder_point)
        VALUES (
          ${name},
          ${category_id ?? null},
          ${unit_of_measure ?? "units"},
          ${description ?? ""},
          ${reorder_point ?? 0}
        )
        RETURNING *
      `;
      return Response.json(rows[0], { status: 201 });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to create material" },
        { status: 500 }
      );
    }
  }

  if (req.method === "PUT") {
    try {
      const id = url.searchParams.get("id");
      if (!id) {
        return Response.json({ error: "id is required" }, { status: 400 });
      }
      const body = await req.json();
      const { name, category_id, unit_of_measure, description, reorder_point } = body;
      const rows = await sql`
        UPDATE materials
        SET
          name = COALESCE(${name ?? null}, name),
          category_id = COALESCE(${category_id ?? null}, category_id),
          unit_of_measure = COALESCE(${unit_of_measure ?? null}, unit_of_measure),
          description = COALESCE(${description ?? null}, description),
          reorder_point = COALESCE(${reorder_point ?? null}, reorder_point)
        WHERE id = ${id}
        RETURNING *
      `;
      if (rows.length === 0) {
        return Response.json({ error: "Material not found" }, { status: 404 });
      }
      return Response.json(rows[0]);
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to update material" },
        { status: 500 }
      );
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
