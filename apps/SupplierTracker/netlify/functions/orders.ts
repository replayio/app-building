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
  const orderId = segments[3] || null;

  if (req.method === "GET") {
    try {
      if (orderId) {
        const rows = await sql`
          SELECT o.*, s.name AS supplier_name
          FROM orders o
          LEFT JOIN suppliers s ON s.id = o.supplier_id
          WHERE o.id = ${orderId}::uuid
          LIMIT 1
        `;
        if (rows.length === 0) {
          return new Response(JSON.stringify({ error: "Order not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(rows[0]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const supplierId = url.searchParams.get("supplierId");

      if (supplierId) {
        const rows = await sql`
          SELECT o.*, s.name AS supplier_name
          FROM orders o
          LEFT JOIN suppliers s ON s.id = o.supplier_id
          WHERE o.supplier_id = ${supplierId}::uuid
          ORDER BY o.order_date DESC
        `;
        return new Response(JSON.stringify(rows), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const rows = await sql`
        SELECT o.*, s.name AS supplier_name
        FROM orders o
        LEFT JOIN suppliers s ON s.id = o.supplier_id
        ORDER BY o.order_date DESC
      `;
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Orders GET error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { supplier_id, order_date, expected_delivery, line_items } = body;

      if (!supplier_id) {
        return new Response(JSON.stringify({ error: "supplier_id is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Generate a unique order ID (PO-XXXXXX format)
      const countRows = await sql`SELECT COUNT(*)::int AS cnt FROM orders`;
      const count = (countRows[0]?.cnt as number) || 0;
      const generatedOrderId = `PO-${String(count + 1).padStart(6, "0")}`;

      // Calculate subtotal from line items
      const items = Array.isArray(line_items) ? line_items : [];
      let subtotal = 0;
      for (const item of items) {
        subtotal += (item.quantity || 0) * (item.unit_price || 0);
      }
      const totalCost = subtotal;

      const orderRows = await sql`
        INSERT INTO orders (order_id, supplier_id, order_date, expected_delivery, subtotal, total_cost)
        VALUES (
          ${generatedOrderId},
          ${supplier_id}::uuid,
          ${order_date || null},
          ${expected_delivery || null},
          ${subtotal},
          ${totalCost}
        )
        RETURNING *
      `;
      const order = orderRows[0];

      // Insert line items
      for (const item of items) {
        const lineTotal = (item.quantity || 0) * (item.unit_price || 0);
        await sql`
          INSERT INTO order_line_items (order_id, sku, item_name, quantity, unit_price, line_total)
          VALUES (
            ${order.id}::uuid,
            ${item.sku || ""},
            ${item.item_name || ""},
            ${item.quantity || 0},
            ${item.unit_price || 0},
            ${lineTotal}
          )
        `;
      }

      // Add history entry for creation
      await sql`
        INSERT INTO order_history (order_id, event_type, description, actor)
        VALUES (
          ${order.id}::uuid,
          'created',
          ${"Order " + generatedOrderId + " created"},
          'System'
        )
      `;

      // Re-fetch with supplier name
      const result = await sql`
        SELECT o.*, s.name AS supplier_name
        FROM orders o
        LEFT JOIN suppliers s ON s.id = o.supplier_id
        WHERE o.id = ${order.id}::uuid
        LIMIT 1
      `;

      return new Response(JSON.stringify(result[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Orders POST error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "PUT") {
    if (!orderId) {
      return new Response(JSON.stringify({ error: "Order ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await req.json();
      const { status, expected_delivery } = body;

      // Fetch existing order for change detection
      const existing = await sql`
        SELECT status, expected_delivery, order_id FROM orders WHERE id = ${orderId}::uuid LIMIT 1
      `;

      // If status is changing, record it in history
      if (status && existing.length > 0 && existing[0].status !== status) {
        await sql`
          INSERT INTO order_history (order_id, event_type, description, actor)
          VALUES (
            ${orderId}::uuid,
            'status_change',
            ${"Status changed from " + existing[0].status + " to " + status},
            'System'
          )
        `;
      }

      // If expected delivery is changing, record it in history
      if (expected_delivery && existing.length > 0) {
        const oldDate = existing[0].expected_delivery ? new Date(existing[0].expected_delivery).toISOString().slice(0, 10) : null;
        const newDate = new Date(expected_delivery).toISOString().slice(0, 10);
        if (oldDate !== newDate) {
          const fmtOld = oldDate ? new Date(oldDate + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "none";
          const fmtNew = new Date(newDate + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
          await sql`
            INSERT INTO order_history (order_id, event_type, description, actor)
            VALUES (
              ${orderId}::uuid,
              'delivery_change',
              ${"Expected delivery changed from " + fmtOld + " to " + fmtNew},
              'System'
            )
          `;
        }
      }

      const rows = await sql`
        UPDATE orders SET
          status = COALESCE(${status ?? null}, status),
          expected_delivery = COALESCE(${expected_delivery || null}, expected_delivery),
          updated_at = NOW()
        WHERE id = ${orderId}::uuid
        RETURNING *
      `;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Re-fetch with supplier name
      const result = await sql`
        SELECT o.*, s.name AS supplier_name
        FROM orders o
        LEFT JOIN suppliers s ON s.id = o.supplier_id
        WHERE o.id = ${orderId}::uuid
        LIMIT 1
      `;

      return new Response(JSON.stringify(result[0]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Orders PUT error:", err);
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
