import { neon } from "@neondatabase/serverless";

export default async (request) => {
  try {
    const sql = neon(process.env.DATABASE_URL);

    if (request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch {}
      // Use settings table (no FK constraints)
      await sql.query(
        "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2",
        ["bg_test_marker", JSON.stringify({ ...body, ts: new Date().toISOString() })]
      );
      return new Response(JSON.stringify({ written: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const rows = await sql.query("SELECT * FROM settings WHERE key = 'bg_test_marker'");
    return new Response(JSON.stringify({ count: rows.length, rows }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
