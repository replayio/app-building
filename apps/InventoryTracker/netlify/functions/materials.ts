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
  const materialId = segments[3] || null;

  try {
    if (req.method === "GET" && !materialId) {
      const accountId = url.searchParams.get("account_id") || null;

      let rows;
      if (accountId) {
        rows = await sql`
          SELECT m.id, m.name, m.category_id, mc.name as category_name,
                 m.unit_of_measure, m.description, m.reorder_point,
                 m.created_at, m.updated_at,
                 COALESCE(SUM(b.quantity), 0)::numeric as stock
          FROM materials m
          LEFT JOIN material_categories mc ON m.category_id = mc.id
          LEFT JOIN batches b ON m.id = b.material_id AND b.status = 'active'
                     AND b.account_id = ${accountId}
          WHERE EXISTS (
            SELECT 1 FROM batches b2
            WHERE b2.material_id = m.id AND b2.account_id = ${accountId}
          )
          GROUP BY m.id, mc.name
          ORDER BY m.name ASC
        `;
      } else {
        rows = await sql`
          SELECT m.id, m.name, m.category_id, mc.name as category_name,
                 m.unit_of_measure, m.description, m.reorder_point,
                 m.created_at, m.updated_at,
                 COALESCE(SUM(b.quantity), 0)::numeric as stock
          FROM materials m
          LEFT JOIN material_categories mc ON m.category_id = mc.id
          LEFT JOIN batches b ON m.id = b.material_id AND b.status = 'active'
          GROUP BY m.id, mc.name
          ORDER BY m.name ASC
        `;
      }

      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && materialId) {
      const rows = await sql`
        SELECT m.id, m.name, m.category_id, mc.name as category_name,
               m.unit_of_measure, m.description, m.reorder_point,
               m.created_at, m.updated_at,
               COALESCE(SUM(b.quantity), 0)::numeric as stock
        FROM materials m
        LEFT JOIN material_categories mc ON m.category_id = mc.id
        LEFT JOIN batches b ON m.id = b.material_id AND b.status = 'active'
        WHERE m.id = ${materialId}
        GROUP BY m.id, mc.name
      `;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Material not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(rows[0]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { name, category_id, unit_of_measure, description, reorder_point } =
        body as {
          name?: string;
          category_id?: string;
          unit_of_measure?: string;
          description?: string;
          reorder_point?: number;
        };
      if (!name || !name.trim()) {
        return new Response(
          JSON.stringify({ error: "Material Name is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!category_id) {
        return new Response(
          JSON.stringify({ error: "Category is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!unit_of_measure || !unit_of_measure.trim()) {
        return new Response(
          JSON.stringify({ error: "Unit of Measure is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const rows = await sql`
        INSERT INTO materials (name, category_id, unit_of_measure, description, reorder_point)
        VALUES (${name.trim()}, ${category_id}, ${unit_of_measure.trim()},
                ${(description || "").trim()}, ${reorder_point || 0})
        RETURNING id, name, category_id, unit_of_measure, description, reorder_point,
                  created_at, updated_at
      `;
      const mat = rows[0];
      const catRows = await sql`
        SELECT name FROM material_categories WHERE id = ${mat.category_id}
      `;
      return new Response(
        JSON.stringify({
          ...mat,
          category_name: catRows[0]?.name || "",
          stock: 0,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "PUT" && materialId) {
      const body = await req.json();
      const { name, category_id, unit_of_measure, description, reorder_point } =
        body as {
          name?: string;
          category_id?: string;
          unit_of_measure?: string;
          description?: string;
          reorder_point?: number;
        };
      if (!name || !name.trim()) {
        return new Response(
          JSON.stringify({ error: "Material Name is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const rows = await sql`
        UPDATE materials
        SET name = ${name.trim()},
            category_id = ${category_id || null},
            unit_of_measure = ${(unit_of_measure || "").trim()},
            description = ${(description || "").trim()},
            reorder_point = ${reorder_point || 0},
            updated_at = NOW()
        WHERE id = ${materialId}
        RETURNING id, name, category_id, unit_of_measure, description, reorder_point,
                  created_at, updated_at
      `;
      if (rows.length === 0) {
        return new Response(
          JSON.stringify({ error: "Material not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const mat = rows[0];
      const detailRows = await sql`
        SELECT mc.name as category_name,
               COALESCE(SUM(b.quantity), 0)::numeric as stock
        FROM materials m
        LEFT JOIN material_categories mc ON m.category_id = mc.id
        LEFT JOIN batches b ON m.id = b.material_id AND b.status = 'active'
        WHERE m.id = ${materialId}
        GROUP BY mc.name
      `;
      return new Response(
        JSON.stringify({
          ...mat,
          category_name: detailRows[0]?.category_name || "",
          stock: Number(detailRows[0]?.stock || 0),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Materials error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
