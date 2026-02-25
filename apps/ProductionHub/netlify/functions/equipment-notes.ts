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

  if (req.method === "GET") {
    try {
      const equipmentId = url.searchParams.get("equipment_id");
      if (!equipmentId) {
        return new Response(
          JSON.stringify({ error: "equipment_id query param is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const rows = await sql`
        SELECT id, equipment_id, author_name, author_role, text, created_at
        FROM equipment_notes
        WHERE equipment_id = ${equipmentId}::uuid
        ORDER BY created_at DESC
      `;
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Equipment notes GET error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { equipment_id, author_name, author_role, text } = body;

      if (!equipment_id || !text) {
        return new Response(
          JSON.stringify({ error: "equipment_id and text are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const rows = await sql`
        INSERT INTO equipment_notes (equipment_id, author_name, author_role, text)
        VALUES (
          ${equipment_id}::uuid,
          ${author_name || "Admin"},
          ${author_role || "Operator"},
          ${text}
        )
        RETURNING *
      `;
      return new Response(JSON.stringify(rows[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Equipment notes POST error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const segments = url.pathname.split("/").filter(Boolean);
      const noteId = segments[3] || null;

      if (!noteId) {
        return new Response(JSON.stringify({ error: "Note ID required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await sql`DELETE FROM equipment_notes WHERE id = ${noteId}::uuid`;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Equipment notes DELETE error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
