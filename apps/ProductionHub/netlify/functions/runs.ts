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
  const runId = segments[3] || null;

  if (req.method === "GET") {
    try {
      if (runId) {
        const rows = await sql`
          SELECT pr.id, pr.recipe_id, pr.start_date, pr.end_date,
                 pr.planned_quantity, pr.unit, pr.status, pr.notes,
                 pr.created_at, pr.updated_at,
                 r.name AS recipe_name, r.product AS product_name
          FROM production_runs pr
          LEFT JOIN recipes r ON r.id = pr.recipe_id
          WHERE pr.id = ${runId}::uuid
          LIMIT 1
        `;
        if (rows.length === 0) {
          return new Response(JSON.stringify({ error: "Run not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        const run = rows[0];

        // Fetch recipe materials (per-batch amounts) if recipe exists
        let materials: Record<string, unknown>[] = [];
        if (run.recipe_id) {
          materials = await sql`
            SELECT id, recipe_id, material_name, quantity, unit
            FROM recipe_materials
            WHERE recipe_id = ${run.recipe_id}::uuid
            ORDER BY material_name
          `;
        }

        // Fetch run forecasts
        const forecasts = await sql`
          SELECT id, run_id, material_name, required_amount,
                 forecast_available, unit, pending_delivery
          FROM run_forecasts
          WHERE run_id = ${runId}::uuid
          ORDER BY material_name
        `;

        // Fetch run equipment with equipment names
        const equipment = await sql`
          SELECT re.id, re.run_id, re.equipment_id, re.status, re.notes,
                 e.name AS equipment_name
          FROM run_equipment re
          JOIN equipment e ON e.id = re.equipment_id
          WHERE re.run_id = ${runId}::uuid
          ORDER BY e.name
        `;

        return new Response(
          JSON.stringify({
            ...run,
            materials,
            forecasts,
            equipment,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // List all runs
      const statusFilter = url.searchParams.get("status");
      let rows;
      if (statusFilter && statusFilter !== "All") {
        rows = await sql`
          SELECT pr.id, pr.recipe_id, pr.start_date, pr.end_date,
                 pr.planned_quantity, pr.unit, pr.status, pr.notes,
                 pr.created_at, pr.updated_at,
                 r.name AS recipe_name, r.product AS product_name
          FROM production_runs pr
          LEFT JOIN recipes r ON r.id = pr.recipe_id
          WHERE pr.status = ${statusFilter}
          ORDER BY pr.start_date DESC
        `;
      } else {
        rows = await sql`
          SELECT pr.id, pr.recipe_id, pr.start_date, pr.end_date,
                 pr.planned_quantity, pr.unit, pr.status, pr.notes,
                 pr.created_at, pr.updated_at,
                 r.name AS recipe_name, r.product AS product_name
          FROM production_runs pr
          LEFT JOIN recipes r ON r.id = pr.recipe_id
          ORDER BY pr.start_date DESC
        `;
      }
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Runs GET error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { recipe_id, start_date, end_date, planned_quantity, unit, status, notes } = body;

      if (!start_date || !end_date) {
        return new Response(
          JSON.stringify({ error: "start_date and end_date are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const rows = await sql`
        INSERT INTO production_runs (recipe_id, start_date, end_date, planned_quantity, unit, status, notes)
        VALUES (
          ${recipe_id || null},
          ${start_date},
          ${end_date},
          ${planned_quantity || 0},
          ${unit || "Units"},
          ${status || "Scheduled"},
          ${notes || ""}
        )
        RETURNING *
      `;

      // Re-fetch with recipe name
      const full = await sql`
        SELECT pr.*, r.name AS recipe_name, r.product AS product_name
        FROM production_runs pr
        LEFT JOIN recipes r ON r.id = pr.recipe_id
        WHERE pr.id = ${rows[0].id}::uuid
      `;

      return new Response(JSON.stringify(full[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Runs POST error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "PUT") {
    if (!runId) {
      return new Response(JSON.stringify({ error: "Run ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await req.json();
      const { planned_quantity, unit, status, notes, start_date, end_date, recipe_id } = body;

      const rows = await sql`
        UPDATE production_runs SET
          planned_quantity = COALESCE(${planned_quantity ?? null}, planned_quantity),
          unit = COALESCE(${unit ?? null}, unit),
          status = COALESCE(${status ?? null}, status),
          notes = COALESCE(${notes ?? null}, notes),
          start_date = COALESCE(${start_date ?? null}, start_date),
          end_date = COALESCE(${end_date ?? null}, end_date),
          recipe_id = COALESCE(${recipe_id ?? null}, recipe_id),
          updated_at = NOW()
        WHERE id = ${runId}::uuid
        RETURNING *
      `;

      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Run not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Re-fetch with full data
      const full = await sql`
        SELECT pr.*, r.name AS recipe_name, r.product AS product_name
        FROM production_runs pr
        LEFT JOIN recipes r ON r.id = pr.recipe_id
        WHERE pr.id = ${runId}::uuid
      `;

      // Fetch recipe materials
      let materials: Record<string, unknown>[] = [];
      if (full[0].recipe_id) {
        materials = await sql`
          SELECT id, recipe_id, material_name, quantity, unit
          FROM recipe_materials
          WHERE recipe_id = ${full[0].recipe_id}::uuid
          ORDER BY material_name
        `;
      }

      const forecasts = await sql`
        SELECT id, run_id, material_name, required_amount,
               forecast_available, unit, pending_delivery
        FROM run_forecasts
        WHERE run_id = ${runId}::uuid
        ORDER BY material_name
      `;

      const equipment = await sql`
        SELECT re.id, re.run_id, re.equipment_id, re.status, re.notes,
               e.name AS equipment_name
        FROM run_equipment re
        JOIN equipment e ON e.id = re.equipment_id
        WHERE re.run_id = ${runId}::uuid
        ORDER BY e.name
      `;

      return new Response(
        JSON.stringify({
          ...full[0],
          materials,
          forecasts,
          equipment,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      console.error("Runs PUT error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "DELETE") {
    if (!runId) {
      return new Response(JSON.stringify({ error: "Run ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      await sql`DELETE FROM production_runs WHERE id = ${runId}::uuid`;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Runs DELETE error:", err);
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
