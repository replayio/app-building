import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _sql = neon(url);
  }
  return _sql;
}

/** Run a parameterized query and return rows. */
export async function query<T = Record<string, unknown>>(
  sql: NeonQueryFunction<false, false>,
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await sql(text, params);
  return result as T[];
}

/** Run a parameterized query and return the first row or null. */
export async function queryOne<T = Record<string, unknown>>(
  sql: NeonQueryFunction<false, false>,
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, text, params);
  return rows[0] ?? null;
}

/** Standard JSON error response for Netlify functions. */
export function errorResponse(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Standard JSON success response for Netlify functions. */
export function jsonResponse<T>(data: T, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
