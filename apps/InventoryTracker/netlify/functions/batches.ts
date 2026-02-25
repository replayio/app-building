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
  const batchId = segments[3] || null;

  try {
    if (req.method === "GET" && !batchId) {
      const materialId = url.searchParams.get("material_id") || null;
      const accountId = url.searchParams.get("account_id") || null;

      const conditions: string[] = [];
      if (materialId) conditions.push("material_id");
      if (accountId) conditions.push("account_id");

      let rows;
      if (materialId && accountId) {
        rows = await sql`
          SELECT b.id, b.material_id, m.name as material_name,
                 b.account_id, a.name as account_name,
                 b.quantity, b.unit, b.location, b.lot_number,
                 b.expiration_date, b.quality_grade, b.storage_condition,
                 b.status, b.originating_transaction_id,
                 b.created_at, b.updated_at
          FROM batches b
          LEFT JOIN materials m ON b.material_id = m.id
          LEFT JOIN accounts a ON b.account_id = a.id
          WHERE b.material_id = ${materialId} AND b.account_id = ${accountId}
          ORDER BY b.created_at DESC
        `;
      } else if (materialId) {
        rows = await sql`
          SELECT b.id, b.material_id, m.name as material_name,
                 b.account_id, a.name as account_name,
                 b.quantity, b.unit, b.location, b.lot_number,
                 b.expiration_date, b.quality_grade, b.storage_condition,
                 b.status, b.originating_transaction_id,
                 b.created_at, b.updated_at
          FROM batches b
          LEFT JOIN materials m ON b.material_id = m.id
          LEFT JOIN accounts a ON b.account_id = a.id
          WHERE b.material_id = ${materialId}
          ORDER BY b.created_at DESC
        `;
      } else if (accountId) {
        rows = await sql`
          SELECT b.id, b.material_id, m.name as material_name,
                 b.account_id, a.name as account_name,
                 b.quantity, b.unit, b.location, b.lot_number,
                 b.expiration_date, b.quality_grade, b.storage_condition,
                 b.status, b.originating_transaction_id,
                 b.created_at, b.updated_at
          FROM batches b
          LEFT JOIN materials m ON b.material_id = m.id
          LEFT JOIN accounts a ON b.account_id = a.id
          WHERE b.account_id = ${accountId}
          ORDER BY b.created_at DESC
        `;
      } else {
        rows = await sql`
          SELECT b.id, b.material_id, m.name as material_name,
                 b.account_id, a.name as account_name,
                 b.quantity, b.unit, b.location, b.lot_number,
                 b.expiration_date, b.quality_grade, b.storage_condition,
                 b.status, b.originating_transaction_id,
                 b.created_at, b.updated_at
          FROM batches b
          LEFT JOIN materials m ON b.material_id = m.id
          LEFT JOIN accounts a ON b.account_id = a.id
          ORDER BY b.created_at DESC
        `;
      }

      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && batchId) {
      const rows = await sql`
        SELECT b.id, b.material_id, m.name as material_name,
               b.account_id, a.name as account_name,
               b.quantity, b.unit, b.location, b.lot_number,
               b.expiration_date, b.quality_grade, b.storage_condition,
               b.status, b.originating_transaction_id,
               b.created_at, b.updated_at
        FROM batches b
        LEFT JOIN materials m ON b.material_id = m.id
        LEFT JOIN accounts a ON b.account_id = a.id
        WHERE b.id = ${batchId}
      `;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Batch not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const lineage = await sql`
        SELECT bl.id, bl.batch_id, bl.source_batch_id,
               m.name as source_material_name, a.name as source_account_name,
               bl.quantity_used, bl.unit
        FROM batch_lineage bl
        LEFT JOIN batches sb ON bl.source_batch_id = sb.id
        LEFT JOIN materials m ON sb.material_id = m.id
        LEFT JOIN accounts a ON sb.account_id = a.id
        WHERE bl.batch_id = ${batchId}
      `;

      return new Response(
        JSON.stringify({ batch: rows[0], lineage }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { material_id, account_id, quantity, unit, location, lot_number, expiration_date } =
        body as {
          material_id?: string;
          account_id?: string;
          quantity?: number;
          unit?: string;
          location?: string;
          lot_number?: string;
          expiration_date?: string;
        };

      if (!material_id) {
        return new Response(
          JSON.stringify({ error: "Material is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!account_id) {
        return new Response(
          JSON.stringify({ error: "Account is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!quantity || quantity <= 0) {
        return new Response(
          JSON.stringify({ error: "Quantity must be a positive number" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const rows = await sql`
        INSERT INTO batches (material_id, account_id, quantity, unit, location, lot_number, expiration_date)
        VALUES (${material_id}, ${account_id}, ${quantity}, ${unit || ""}, ${location || ""},
                ${lot_number || ""}, ${expiration_date || null})
        RETURNING *
      `;

      const batch = rows[0];
      const detailRows = await sql`
        SELECT m.name as material_name, a.name as account_name
        FROM materials m, accounts a
        WHERE m.id = ${material_id} AND a.id = ${account_id}
      `;

      return new Response(
        JSON.stringify({
          ...batch,
          material_name: detailRows[0]?.material_name || "",
          account_name: detailRows[0]?.account_name || "",
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Batches error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
