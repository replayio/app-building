import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Context } from "@netlify/functions";

async function recalcOrderTotals(sql: NeonQueryFunction<false, false>, orderId: string) {
  const items = await sql`
    SELECT COALESCE(SUM(line_total), 0)::float AS subtotal
    FROM order_line_items
    WHERE order_id = ${orderId}::uuid
  `;
  const subtotal = (items as Record<string, unknown>[])[0]?.subtotal as number ?? 0;

  const order = await sql`
    SELECT tax_rate, discount_amount FROM orders WHERE id = ${orderId}::uuid LIMIT 1
  `;
  const orderRow = (order as Record<string, unknown>[])[0];
  const taxRate = (orderRow?.tax_rate as number) ?? 0;
  const discountAmount = (orderRow?.discount_amount as number) ?? 0;
  const taxAmount = subtotal * (taxRate / 100);
  const totalCost = subtotal + taxAmount - discountAmount;

  await sql`
    UPDATE orders SET
      subtotal = ${subtotal},
      tax_amount = ${taxAmount},
      total_cost = ${totalCost},
      updated_at = NOW()
    WHERE id = ${orderId}::uuid
  `;
}

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

  if (!orderId) {
    return new Response(JSON.stringify({ error: "Order ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET") {
    try {
      const rows = await sql`
        SELECT id, order_id, sku, item_name, quantity, unit_price, line_total
        FROM order_line_items
        WHERE order_id = ${orderId}::uuid
        ORDER BY created_at
      `;
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Order line items GET error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { sku, item_name, quantity, unit_price } = body;

      if (!item_name) {
        return new Response(JSON.stringify({ error: "item_name is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const lineTotal = (quantity || 0) * (unit_price || 0);

      const rows = await sql`
        INSERT INTO order_line_items (order_id, sku, item_name, quantity, unit_price, line_total)
        VALUES (
          ${orderId}::uuid,
          ${sku || ""},
          ${item_name},
          ${quantity || 0},
          ${unit_price || 0},
          ${lineTotal}
        )
        RETURNING id, order_id, sku, item_name, quantity, unit_price, line_total
      `;

      // Recalculate order totals
      await recalcOrderTotals(sql, orderId);

      // Add history entry
      await sql`
        INSERT INTO order_history (order_id, event_type, description, actor)
        VALUES (
          ${orderId}::uuid,
          'line_item_added',
          ${"Line item added: " + item_name},
          'System'
        )
      `;

      return new Response(JSON.stringify(rows[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Order line items POST error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "PUT") {
    try {
      const lineItemId = url.searchParams.get("lineItemId");
      if (!lineItemId) {
        return new Response(JSON.stringify({ error: "lineItemId query param is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { sku, item_name, quantity, unit_price } = body;
      const lineTotal = (quantity || 0) * (unit_price || 0);

      const rows = await sql`
        UPDATE order_line_items SET
          sku = COALESCE(${sku ?? null}, sku),
          item_name = COALESCE(${item_name ?? null}, item_name),
          quantity = COALESCE(${quantity ?? null}, quantity),
          unit_price = COALESCE(${unit_price ?? null}, unit_price),
          line_total = ${lineTotal}
        WHERE id = ${lineItemId}::uuid AND order_id = ${orderId}::uuid
        RETURNING id, order_id, sku, item_name, quantity, unit_price, line_total
      `;

      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Line item not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Recalculate order totals
      await recalcOrderTotals(sql, orderId);

      // Add history entry
      await sql`
        INSERT INTO order_history (order_id, event_type, description, actor)
        VALUES (
          ${orderId}::uuid,
          'line_item_updated',
          ${"Line item updated: " + (item_name || rows[0].item_name)},
          'System'
        )
      `;

      return new Response(JSON.stringify(rows[0]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Order line items PUT error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const lineItemId = url.searchParams.get("lineItemId");
      if (!lineItemId) {
        return new Response(JSON.stringify({ error: "lineItemId query param is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Get item name for history before deleting
      const existing = await sql`
        SELECT item_name FROM order_line_items
        WHERE id = ${lineItemId}::uuid AND order_id = ${orderId}::uuid
      `;
      const itemName = existing[0]?.item_name || "Unknown item";

      await sql`
        DELETE FROM order_line_items
        WHERE id = ${lineItemId}::uuid AND order_id = ${orderId}::uuid
      `;

      // Recalculate order totals
      await recalcOrderTotals(sql, orderId);

      // Add history entry
      await sql`
        INSERT INTO order_history (order_id, event_type, description, actor)
        VALUES (
          ${orderId}::uuid,
          'line_item_deleted',
          ${"Line item removed: " + itemName},
          'System'
        )
      `;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Order line items DELETE error:", err);
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
