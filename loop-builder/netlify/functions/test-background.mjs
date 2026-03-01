import { neon } from "@neondatabase/serverless";

export default async (request, context) => {
  const sql = neon(process.env.DATABASE_URL);
  await sql.query(
    "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2",
    ["bg_test_marker", JSON.stringify({ source: "test-background", ts: new Date().toISOString() })]
  );
  return new Response("done");
};
