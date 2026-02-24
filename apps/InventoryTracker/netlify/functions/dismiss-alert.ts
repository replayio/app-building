import { neon } from "@neondatabase/serverless";

export default async (req: Request) => {
  const sql = neon(process.env.DATABASE_URL!);

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { material_id } = body;
      if (!material_id) {
        return Response.json(
          { error: "material_id is required" },
          { status: 400 }
        );
      }

      // Check if already dismissed
      const existing = await sql`
        SELECT id FROM dismissed_alerts WHERE material_id = ${material_id}
      `;

      if (existing.length > 0) {
        return Response.json({ message: "Alert already dismissed" });
      }

      const rows = await sql`
        INSERT INTO dismissed_alerts (material_id)
        VALUES (${material_id})
        RETURNING *
      `;

      return Response.json(rows[0], { status: 201 });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to dismiss alert" },
        { status: 500 }
      );
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
