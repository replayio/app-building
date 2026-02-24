import { neon } from "@neondatabase/serverless";

export default async (req: Request) => {
  const sql = neon(process.env.DATABASE_URL!);
  const url = new URL(req.url);

  if (req.method === "GET") {
    const dateFrom = url.searchParams.get("date_from");
    const dateTo = url.searchParams.get("date_to");
    const category = url.searchParams.get("category");

    try {
      // Low inventory alerts: materials below reorder point
      let alertCategoryFilter = "";
      if (category) {
        alertCategoryFilter = `AND m.category_id = '${category.replace(/'/g, "''")}'`;
      }

      const alerts = await sql(
        `SELECT
           m.id AS material_id,
           m.name AS material_name,
           m.unit_of_measure,
           m.reorder_point,
           mc.name AS category_name,
           COALESCE(SUM(b.quantity), 0) AS current_stock,
           CASE
             WHEN da.id IS NOT NULL THEN true
             ELSE false
           END AS dismissed
         FROM materials m
         LEFT JOIN material_categories mc ON mc.id = m.category_id
         LEFT JOIN batches b ON b.material_id = m.id
         LEFT JOIN dismissed_alerts da ON da.material_id = m.id
         WHERE m.reorder_point > 0
         ${alertCategoryFilter}
         GROUP BY m.id, m.name, m.unit_of_measure, m.reorder_point, mc.name, da.id
         HAVING COALESCE(SUM(b.quantity), 0) < m.reorder_point
         ORDER BY (COALESCE(SUM(b.quantity), 0) / NULLIF(m.reorder_point, 0)) ASC`
      );

      // Category overviews: aggregated data per category
      let categoryOverviewFilter = "";
      if (category) {
        categoryOverviewFilter = `WHERE mc.id = '${category.replace(/'/g, "''")}'`;
      }

      const categoryOverviews = await sql(
        `SELECT
           mc.id AS category_id,
           mc.name AS category_name,
           COUNT(DISTINCT m.id) AS item_count,
           COALESCE(SUM(b.quantity), 0) AS total_units
         FROM material_categories mc
         LEFT JOIN materials m ON m.category_id = mc.id
         LEFT JOIN batches b ON b.material_id = m.id
         ${categoryOverviewFilter}
         GROUP BY mc.id, mc.name
         ORDER BY mc.name ASC`
      );

      // Top materials per category (up to 3 per category)
      const topMaterials = await sql(
        `SELECT
           mc.id AS category_id,
           mc.name AS category_name,
           m.id AS material_id,
           m.name AS material_name,
           m.unit_of_measure,
           COALESCE(SUM(b.quantity), 0) AS total_quantity
         FROM material_categories mc
         JOIN materials m ON m.category_id = mc.id
         LEFT JOIN batches b ON b.material_id = m.id
         ${categoryOverviewFilter}
         GROUP BY mc.id, mc.name, m.id, m.name, m.unit_of_measure
         ORDER BY mc.name ASC, total_quantity DESC`
      );

      // Group top materials by category, limit to 3 per category
      const materialsByCategory: Record<
        string,
        Array<Record<string, unknown>>
      > = {};
      for (const mat of topMaterials) {
        const catId = mat.category_id as string;
        if (!materialsByCategory[catId]) {
          materialsByCategory[catId] = [];
        }
        if (materialsByCategory[catId].length < 3) {
          materialsByCategory[catId].push(mat);
        }
      }

      const categoryData = categoryOverviews.map((cat: Record<string, unknown>) => ({
        ...cat,
        top_materials: materialsByCategory[cat.category_id as string] || [],
      }));

      // Recent transactions (last 5)
      const txnWhereParts: string[] = [];
      if (dateFrom) {
        txnWhereParts.push(`t.date >= '${dateFrom.replace(/'/g, "''")}'`);
      }
      if (dateTo) {
        txnWhereParts.push(`t.date <= '${dateTo.replace(/'/g, "''")}'`);
      }
      if (category) {
        txnWhereParts.push(
          `t.id IN (
            SELECT DISTINCT tt.transaction_id
            FROM transaction_transfers tt
            JOIN materials m ON m.id = tt.material_id
            WHERE m.category_id = '${category.replace(/'/g, "''")}'
          )`
        );
      }

      const txnWhereClause =
        txnWhereParts.length > 0 ? "WHERE " + txnWhereParts.join(" AND ") : "";

      const recentTransactions = await sql(
        `SELECT t.id, t.date, t.reference_id, t.description,
                t.transaction_type, t.status, t.created_at
         FROM transactions t
         ${txnWhereClause}
         ORDER BY t.date DESC, t.created_at DESC
         LIMIT 5`
      );

      // Fetch transfers for recent transactions
      const txnIds = recentTransactions.map((t: Record<string, unknown>) => t.id as string);
      const transfersByTxn: Record<string, Array<Record<string, unknown>>> = {};
      if (txnIds.length > 0) {
        const idsList = txnIds
          .map((id: string) => `'${id.replace(/'/g, "''")}'`)
          .join(",");
        const transfers = await sql(
          `SELECT
             tt.transaction_id,
             tt.source_account_id, tt.destination_account_id,
             tt.material_id, tt.amount, tt.unit,
             sa.name AS source_account_name,
             da.name AS destination_account_name,
             m.name AS material_name
           FROM transaction_transfers tt
           LEFT JOIN accounts sa ON sa.id = tt.source_account_id
           LEFT JOIN accounts da ON da.id = tt.destination_account_id
           LEFT JOIN materials m ON m.id = tt.material_id
           WHERE tt.transaction_id IN (${idsList})`
        );
        for (const tr of transfers) {
          const txnId = tr.transaction_id as string;
          if (!transfersByTxn[txnId]) transfersByTxn[txnId] = [];
          transfersByTxn[txnId].push(tr);
        }
      }

      const recentTxnData = recentTransactions.map((t: Record<string, unknown>) => ({
        ...t,
        transfers: transfersByTxn[t.id as string] || [],
      }));

      return Response.json({
        alerts,
        categories: categoryData,
        recent_transactions: recentTxnData,
      });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to fetch dashboard data" },
        { status: 500 }
      );
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
