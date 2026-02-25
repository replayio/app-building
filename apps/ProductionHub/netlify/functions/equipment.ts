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
  // segments: ["", ".netlify", "functions", "equipment", "<id>?"]
  const equipmentId = segments[3] || null;

  if (req.method === "GET") {
    try {
      if (equipmentId) {
        const rows = await sql`
          SELECT id, name, description, available_units, status,
                 model, serial_number, location, manufacturer,
                 installation_date, photo_url, created_at, updated_at
          FROM equipment
          WHERE id = ${equipmentId}::uuid
          LIMIT 1
        `;
        if (rows.length === 0) {
          return new Response(JSON.stringify({ error: "Equipment not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(rows[0]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const rows = await sql`
        SELECT id, name, description, available_units, status,
               model, serial_number, location, manufacturer,
               installation_date, photo_url, created_at, updated_at
        FROM equipment
        ORDER BY name
      `;
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Equipment GET error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const {
        name,
        description,
        available_units,
        status,
        model,
        serial_number,
        location,
        manufacturer,
        installation_date,
        photo_url,
      } = body;

      if (!name) {
        return new Response(JSON.stringify({ error: "name is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const rows = await sql`
        INSERT INTO equipment (name, description, available_units, status,
          model, serial_number, location, manufacturer, installation_date, photo_url)
        VALUES (
          ${name},
          ${description || ""},
          ${available_units || 1},
          ${status || "Operational"},
          ${model || ""},
          ${serial_number || ""},
          ${location || ""},
          ${manufacturer || ""},
          ${installation_date || null},
          ${photo_url || ""}
        )
        RETURNING *
      `;
      return new Response(JSON.stringify(rows[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Equipment POST error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "PUT") {
    if (!equipmentId) {
      return new Response(JSON.stringify({ error: "Equipment ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await req.json();
      const {
        name,
        description,
        available_units,
        status,
        model,
        serial_number,
        location,
        manufacturer,
        installation_date,
        photo_url,
      } = body;

      const rows = await sql`
        UPDATE equipment SET
          name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          available_units = COALESCE(${available_units}, available_units),
          status = COALESCE(${status}, status),
          model = COALESCE(${model}, model),
          serial_number = COALESCE(${serial_number}, serial_number),
          location = COALESCE(${location}, location),
          manufacturer = COALESCE(${manufacturer}, manufacturer),
          installation_date = COALESCE(${installation_date || null}, installation_date),
          photo_url = COALESCE(${photo_url}, photo_url),
          updated_at = NOW()
        WHERE id = ${equipmentId}::uuid
        RETURNING *
      `;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Equipment not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(rows[0]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Equipment PUT error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "DELETE") {
    if (!equipmentId) {
      return new Response(JSON.stringify({ error: "Equipment ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      await sql`DELETE FROM equipment WHERE id = ${equipmentId}::uuid`;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Equipment DELETE error:", err);
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
