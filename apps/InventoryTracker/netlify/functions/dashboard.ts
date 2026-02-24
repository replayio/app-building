import { neon } from "@neondatabase/serverless";
import type { Context } from "@netlify/functions";

export default async function handler(req: Request, _context: Context) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: "DATABASE_URL not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sql = neon(dbUrl);
  const url = new URL(req.url);
  const dateFrom = url.searchParams.get("date_from");
  const dateTo = url.searchParams.get("date_to");
  const categoryId = url.searchParams.get("category_id");

  try {
    // 1. Low inventory alerts
    const alertRows = await sql`
      SELECT m.id as material_id, m.name as material_name,
             COALESCE(SUM(CASE WHEN b.status = 'active' THEN b.quantity ELSE 0 END), 0)::float as current_quantity,
             m.reorder_point::float as reorder_point,
             m.unit_of_measure as unit,
             m.category_id
      FROM materials m
      LEFT JOIN batches b ON b.material_id = m.id
      LEFT JOIN dismissed_alerts da ON da.material_id = m.id
      WHERE da.id IS NULL
      GROUP BY m.id, m.name, m.reorder_point, m.unit_of_measure, m.category_id
      HAVING COALESCE(SUM(CASE WHEN b.status = 'active' THEN b.quantity ELSE 0 END), 0) < m.reorder_point
      ORDER BY (COALESCE(SUM(CASE WHEN b.status = 'active' THEN b.quantity ELSE 0 END), 0) / NULLIF(m.reorder_point, 0)) ASC
    `;

    let alerts = alertRows.map((row) => {
      const ratio = (row.current_quantity as number) / (row.reorder_point as number);
      return {
        material_id: row.material_id as string,
        material_name: row.material_name as string,
        current_quantity: row.current_quantity as number,
        reorder_point: row.reorder_point as number,
        unit: row.unit as string,
        severity: (ratio < 0.5 ? "critical" : "warning") as "critical" | "warning",
        dismissed: false,
        category_id: row.category_id as string,
      };
    });

    if (categoryId) {
      alerts = alerts.filter((a) => a.category_id === categoryId);
    }

    // 2. Category overviews
    const categoryRows = await sql`
      SELECT mc.id as category_id, mc.name as category_name,
             COUNT(DISTINCT m.id)::int as total_items,
             COALESCE(SUM(CASE WHEN b.status = 'active' THEN b.quantity ELSE 0 END), 0)::float as total_quantity
      FROM material_categories mc
      LEFT JOIN materials m ON m.category_id = mc.id
      LEFT JOIN batches b ON b.material_id = m.id
      GROUP BY mc.id, mc.name
      ORDER BY mc.name
    `;

    const materialRows = await sql`
      SELECT m.id, m.name, m.category_id,
             COALESCE(SUM(CASE WHEN b.status = 'active' THEN b.quantity ELSE 0 END), 0)::float as quantity,
             m.unit_of_measure as unit
      FROM materials m
      LEFT JOIN batches b ON b.material_id = m.id
      GROUP BY m.id, m.name, m.category_id, m.unit_of_measure
      ORDER BY m.name
    `;

    let categoryOverviews = categoryRows.map((cat) => ({
      category_id: cat.category_id as string,
      category_name: cat.category_name as string,
      total_items: cat.total_items as number,
      total_quantity: cat.total_quantity as number,
      materials: materialRows
        .filter((m) => m.category_id === cat.category_id)
        .map((m) => ({
          id: m.id as string,
          name: m.name as string,
          quantity: m.quantity as number,
          unit: m.unit as string,
        })),
    }));

    if (categoryId) {
      categoryOverviews = categoryOverviews.filter(
        (c) => c.category_id === categoryId
      );
    }

    // 3. Recent transactions with transfers
    let transactionRows;
    if (dateFrom && dateTo) {
      transactionRows = await sql`
        SELECT t.id, t.date, t.reference_id, t.description,
               t.transaction_type, t.status, t.created_by,
               t.created_at, t.updated_at
        FROM transactions t
        WHERE t.date >= ${dateFrom}::date AND t.date <= ${dateTo}::date
        ORDER BY t.date DESC, t.created_at DESC
        LIMIT 20
      `;
    } else {
      transactionRows = await sql`
        SELECT t.id, t.date, t.reference_id, t.description,
               t.transaction_type, t.status, t.created_by,
               t.created_at, t.updated_at
        FROM transactions t
        ORDER BY t.date DESC, t.created_at DESC
        LIMIT 20
      `;
    }

    const txnIds = transactionRows.map((t) => t.id as string);

    let transferRows: Record<string, unknown>[] = [];
    if (txnIds.length > 0) {
      transferRows = await sql`
        SELECT qt.id, qt.transaction_id,
               qt.source_account_id, sa.name as source_account_name,
               qt.destination_account_id, da.name as destination_account_name,
               qt.material_id, m.name as material_name,
               qt.amount::float as amount, qt.unit,
               qt.source_batch_id
        FROM quantity_transfers qt
        JOIN accounts sa ON sa.id = qt.source_account_id
        JOIN accounts da ON da.id = qt.destination_account_id
        JOIN materials m ON m.id = qt.material_id
        WHERE qt.transaction_id = ANY(${txnIds})
        ORDER BY qt.id
      `;
    }

    const recentTransactions = transactionRows.map((t) => ({
      id: t.id as string,
      date: t.date as string,
      reference_id: t.reference_id as string,
      description: t.description as string,
      transaction_type: t.transaction_type as string,
      status: t.status as string,
      created_by: t.created_by as string,
      created_at: t.created_at as string,
      updated_at: t.updated_at as string,
      transfers: transferRows
        .filter((tr) => tr.transaction_id === t.id)
        .map((tr) => ({
          id: tr.id as string,
          transaction_id: tr.transaction_id as string,
          source_account_id: tr.source_account_id as string,
          source_account_name: tr.source_account_name as string,
          destination_account_id: tr.destination_account_id as string,
          destination_account_name: tr.destination_account_name as string,
          material_id: tr.material_id as string,
          material_name: tr.material_name as string,
          amount: tr.amount as number,
          unit: tr.unit as string,
          source_batch_id: (tr.source_batch_id as string) || null,
        })),
    }));

    return new Response(
      JSON.stringify({
        alerts: alerts.map(({ category_id: _cid, ...rest }) => rest),
        categoryOverviews,
        recentTransactions,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Dashboard error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
