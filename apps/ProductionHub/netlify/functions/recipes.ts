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
  const recipeId = segments[3] || null;

  if (req.method === "GET") {
    try {
      if (recipeId) {
        const rows = await sql`
          SELECT id, name, product, version, status, description,
                 instructions, created_at, updated_at
          FROM recipes
          WHERE id = ${recipeId}::uuid
          LIMIT 1
        `;
        if (rows.length === 0) {
          return new Response(JSON.stringify({ error: "Recipe not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        const recipe = rows[0];

        const materials = await sql`
          SELECT id, recipe_id, material_name, quantity, unit
          FROM recipe_materials
          WHERE recipe_id = ${recipeId}::uuid
          ORDER BY material_name
        `;

        const products = await sql`
          SELECT id, recipe_id, product_name, amount
          FROM recipe_products
          WHERE recipe_id = ${recipeId}::uuid
          ORDER BY product_name
        `;

        const equipment = await sql`
          SELECT re.id, re.recipe_id, re.equipment_id, e.name AS equipment_name
          FROM recipe_equipment re
          JOIN equipment e ON e.id = re.equipment_id
          WHERE re.recipe_id = ${recipeId}::uuid
          ORDER BY e.name
        `;

        return new Response(
          JSON.stringify({
            ...recipe,
            materials,
            products,
            equipment,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const rows = await sql`
        SELECT id, name, product, version, status, description,
               instructions, created_at, updated_at
        FROM recipes
        ORDER BY name
      `;
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Recipes GET error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { name, product, version, status, description, instructions } = body;

      if (!name) {
        return new Response(JSON.stringify({ error: "name is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const rows = await sql`
        INSERT INTO recipes (name, product, version, status, description, instructions)
        VALUES (
          ${name},
          ${product || ""},
          ${version || "1.0"},
          ${status || "Draft"},
          ${description || ""},
          ${instructions || ""}
        )
        RETURNING *
      `;
      return new Response(JSON.stringify(rows[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Recipes POST error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "PUT") {
    if (!recipeId) {
      return new Response(JSON.stringify({ error: "Recipe ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await req.json();
      const { name, product, version, status, description, instructions, materials, products, equipment } = body;

      const rows = await sql`
        UPDATE recipes SET
          name = COALESCE(${name}, name),
          product = COALESCE(${product}, product),
          version = COALESCE(${version}, version),
          status = COALESCE(${status}, status),
          description = COALESCE(${description}, description),
          instructions = COALESCE(${instructions}, instructions),
          updated_at = NOW()
        WHERE id = ${recipeId}::uuid
        RETURNING *
      `;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Recipe not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // If materials were provided, replace them
      if (materials !== undefined) {
        await sql`DELETE FROM recipe_materials WHERE recipe_id = ${recipeId}::uuid`;
        for (const m of materials) {
          await sql`
            INSERT INTO recipe_materials (recipe_id, material_name, quantity, unit)
            VALUES (${recipeId}::uuid, ${m.material_name}, ${m.quantity}, ${m.unit || "kg"})
          `;
        }
      }

      // If products were provided, replace them
      if (products !== undefined) {
        await sql`DELETE FROM recipe_products WHERE recipe_id = ${recipeId}::uuid`;
        for (const p of products) {
          await sql`
            INSERT INTO recipe_products (recipe_id, product_name, amount)
            VALUES (${recipeId}::uuid, ${p.product_name}, ${p.amount || ""})
          `;
        }
      }

      // If equipment were provided, replace them
      if (equipment !== undefined) {
        await sql`DELETE FROM recipe_equipment WHERE recipe_id = ${recipeId}::uuid`;
        for (const e of equipment) {
          await sql`
            INSERT INTO recipe_equipment (recipe_id, equipment_id)
            VALUES (${recipeId}::uuid, ${e.equipment_id}::uuid)
          `;
        }
      }

      // Re-fetch full recipe with related data
      const updatedMaterials = await sql`
        SELECT id, recipe_id, material_name, quantity, unit
        FROM recipe_materials WHERE recipe_id = ${recipeId}::uuid ORDER BY material_name
      `;
      const updatedProducts = await sql`
        SELECT id, recipe_id, product_name, amount
        FROM recipe_products WHERE recipe_id = ${recipeId}::uuid ORDER BY product_name
      `;
      const updatedEquipment = await sql`
        SELECT re.id, re.recipe_id, re.equipment_id, e.name AS equipment_name
        FROM recipe_equipment re
        JOIN equipment e ON e.id = re.equipment_id
        WHERE re.recipe_id = ${recipeId}::uuid ORDER BY e.name
      `;

      return new Response(
        JSON.stringify({
          ...rows[0],
          materials: updatedMaterials,
          products: updatedProducts,
          equipment: updatedEquipment,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      console.error("Recipes PUT error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "DELETE") {
    if (!recipeId) {
      return new Response(JSON.stringify({ error: "Recipe ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      await sql`DELETE FROM recipes WHERE id = ${recipeId}::uuid`;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Recipes DELETE error:", err);
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
