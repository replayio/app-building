import { neon } from "@neondatabase/serverless";

export default async (req: Request) => {
  const sql = neon(process.env.DATABASE_URL!);
  const url = new URL(req.url);

  if (req.method === "GET") {
    const type = url.searchParams.get("type");
    let rows;
    if (type) {
      rows = await sql`
        SELECT id, name, type, description, is_default, status, created_at
        FROM accounts
        WHERE status = 'active' AND type = ${type}
        ORDER BY is_default DESC, name ASC
      `;
    } else {
      rows = await sql`
        SELECT id, name, type, description, is_default, status, created_at
        FROM accounts
        WHERE status = 'active'
        ORDER BY type ASC, is_default DESC, name ASC
      `;
    }
    return Response.json(rows);
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { name, type, description } = body;
      if (!name || !type) {
        return Response.json(
          { error: "name and type are required" },
          { status: 400 }
        );
      }
      const rows = await sql`
        INSERT INTO accounts (name, type, description)
        VALUES (${name}, ${type}, ${description ?? ""})
        RETURNING *
      `;
      return Response.json(rows[0], { status: 201 });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to create account" },
        { status: 500 }
      );
    }
  }

  if (req.method === "PUT") {
    try {
      const id = url.searchParams.get("id");
      if (!id) {
        return Response.json({ error: "id is required" }, { status: 400 });
      }
      const body = await req.json();
      const { name, description, status } = body;
      const rows = await sql`
        UPDATE accounts
        SET
          name = COALESCE(${name ?? null}, name),
          description = COALESCE(${description ?? null}, description),
          status = COALESCE(${status ?? null}, status)
        WHERE id = ${id}
        RETURNING *
      `;
      if (rows.length === 0) {
        return Response.json({ error: "Account not found" }, { status: 404 });
      }
      return Response.json(rows[0]);
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to update account" },
        { status: 500 }
      );
    }
  }

  if (req.method === "DELETE") {
    try {
      const id = url.searchParams.get("id");
      if (!id) {
        return Response.json({ error: "id is required" }, { status: 400 });
      }
      const rows = await sql`
        UPDATE accounts
        SET status = 'archived'
        WHERE id = ${id}
        RETURNING *
      `;
      if (rows.length === 0) {
        return Response.json({ error: "Account not found" }, { status: 404 });
      }
      return Response.json(rows[0]);
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to archive account" },
        { status: 500 }
      );
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
