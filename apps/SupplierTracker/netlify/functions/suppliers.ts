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
  const supplierId = segments[3] || null;

  if (req.method === "GET") {
    try {
      if (supplierId) {
        const rows = await sql`
          SELECT s.*,
            COALESCE(oc.cnt, 0)::int AS open_orders_count,
            COALESCE(oc.total, 0)::float AS open_orders_value
          FROM suppliers s
          LEFT JOIN (
            SELECT supplier_id,
              COUNT(*)::int AS cnt,
              SUM(total_cost)::float AS total
            FROM orders
            WHERE status NOT IN ('Completed', 'Cancelled', 'Fulfilled', 'Delivered')
            GROUP BY supplier_id
          ) oc ON oc.supplier_id = s.id
          WHERE s.id = ${supplierId}::uuid
          LIMIT 1
        `;
        if (rows.length === 0) {
          return new Response(JSON.stringify({ error: "Supplier not found" }), {
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
        SELECT s.*,
          COALESCE(oc.cnt, 0)::int AS open_orders_count,
          COALESCE(oc.total, 0)::float AS open_orders_value
        FROM suppliers s
        LEFT JOIN (
          SELECT supplier_id,
            COUNT(*)::int AS cnt,
            SUM(total_cost)::float AS total
          FROM orders
          WHERE status NOT IN ('Completed', 'Cancelled', 'Fulfilled', 'Delivered')
          GROUP BY supplier_id
        ) oc ON oc.supplier_id = s.id
        ORDER BY s.name
      `;
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Suppliers GET error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { name, address, contact_name, phone, email, description, status } = body;

      if (!name) {
        return new Response(JSON.stringify({ error: "name is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const rows = await sql`
        INSERT INTO suppliers (name, address, contact_name, phone, email, description, status)
        VALUES (
          ${name},
          ${address || ""},
          ${contact_name || ""},
          ${phone || ""},
          ${email || ""},
          ${description || ""},
          ${status || "Active"}
        )
        RETURNING *
      `;
      return new Response(JSON.stringify(rows[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Suppliers POST error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "PUT") {
    if (!supplierId) {
      return new Response(JSON.stringify({ error: "Supplier ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await req.json();
      const { name, address, contact_name, phone, email, description, status } = body;

      const rows = await sql`
        UPDATE suppliers SET
          name = COALESCE(${name ?? null}, name),
          address = COALESCE(${address ?? null}, address),
          contact_name = COALESCE(${contact_name ?? null}, contact_name),
          phone = COALESCE(${phone ?? null}, phone),
          email = COALESCE(${email ?? null}, email),
          description = COALESCE(${description ?? null}, description),
          status = COALESCE(${status ?? null}, status),
          updated_at = NOW()
        WHERE id = ${supplierId}::uuid
        RETURNING *
      `;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Supplier not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(rows[0]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Suppliers PUT error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "DELETE") {
    if (!supplierId) {
      return new Response(JSON.stringify({ error: "Supplier ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      await sql`DELETE FROM suppliers WHERE id = ${supplierId}::uuid`;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Suppliers DELETE error:", err);
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
