import { neon } from "@neondatabase/serverless";

export default async (req: Request) => {
  const sql = neon(process.env.DATABASE_URL!);

  if (req.method === "GET") {
    try {
      const rows = await sql`
        SELECT id, name, created_at
        FROM material_categories
        ORDER BY name ASC
      `;
      return Response.json(rows);
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to fetch categories" },
        { status: 500 }
      );
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { name } = body;
      if (!name) {
        return Response.json({ error: "name is required" }, { status: 400 });
      }
      const rows = await sql`
        INSERT INTO material_categories (name)
        VALUES (${name})
        RETURNING *
      `;
      return Response.json(rows[0], { status: 201 });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to create category" },
        { status: 500 }
      );
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
