import { neon } from "@neondatabase/serverless";

export default async (req: Request) => {
  const sql = neon(process.env.DATABASE_URL!);
  const url = new URL(req.url);

  if (req.method === "GET") {
    const dateFrom = url.searchParams.get("date_from");
    const dateTo = url.searchParams.get("date_to");
    const accountsParam = url.searchParams.get("accounts");
    const materialsParam = url.searchParams.get("materials");
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search");
    const sort = url.searchParams.get("sort") || "date_desc";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    try {
      const whereParts: string[] = [];

      if (dateFrom) {
        whereParts.push(`t.date >= '${dateFrom.replace(/'/g, "''")}'`);
      }
      if (dateTo) {
        whereParts.push(`t.date <= '${dateTo.replace(/'/g, "''")}'`);
      }
      if (type) {
        whereParts.push(`t.transaction_type = '${type.replace(/'/g, "''")}'`);
      }
      if (search) {
        const s = search.toLowerCase().replace(/'/g, "''");
        whereParts.push(
          `(LOWER(t.reference_id) LIKE '%${s}%' OR LOWER(t.description) LIKE '%${s}%')`
        );
      }
      if (accountsParam) {
        const accountIds = accountsParam
          .split(",")
          .map((a) => `'${a.trim().replace(/'/g, "''")}'`)
          .join(",");
        whereParts.push(
          `t.id IN (SELECT DISTINCT transaction_id FROM transaction_transfers WHERE source_account_id IN (${accountIds}) OR destination_account_id IN (${accountIds}))`
        );
      }
      if (materialsParam) {
        const materialIds = materialsParam
          .split(",")
          .map((m) => `'${m.trim().replace(/'/g, "''")}'`)
          .join(",");
        whereParts.push(
          `t.id IN (SELECT DISTINCT transaction_id FROM transaction_transfers WHERE material_id IN (${materialIds}))`
        );
      }

      const whereClause =
        whereParts.length > 0 ? "WHERE " + whereParts.join(" AND ") : "";

      let orderClause = "ORDER BY t.date DESC, t.created_at DESC";
      if (sort === "date_asc") orderClause = "ORDER BY t.date ASC, t.created_at ASC";
      else if (sort === "date_desc")
        orderClause = "ORDER BY t.date DESC, t.created_at DESC";
      else if (sort === "id") orderClause = "ORDER BY t.id ASC";
      else if (sort === "id_desc") orderClause = "ORDER BY t.id DESC";

      const countResult = await sql(
        `SELECT COUNT(*) AS total FROM transactions t ${whereClause}`
      );
      const total = parseInt(countResult[0].total as string, 10);

      const transactions = await sql(
        `SELECT t.id, t.date, t.reference_id, t.description,
                t.transaction_type, t.status, t.creator, t.created_at
         FROM transactions t
         ${whereClause}
         ${orderClause}
         LIMIT ${limit} OFFSET ${offset}`
      );

      // For each transaction, fetch accounts affected and materials
      const txnIds = transactions.map((t: Record<string, unknown>) => t.id as string);

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

      const result = transactions.map((t: Record<string, unknown>) => ({
        ...t,
        transfers: transfersByTxn[t.id as string] || [],
      }));

      return Response.json({ transactions: result, total, page, limit });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to fetch transactions" },
        { status: 500 }
      );
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const {
        id,
        date,
        reference_id,
        description,
        transaction_type,
        creator,
        transfers,
        batches_created,
      } = body;

      if (!id) {
        return Response.json(
          { error: "id is required" },
          { status: 400 }
        );
      }

      // Create the transaction
      await sql`
        INSERT INTO transactions (id, date, reference_id, description, transaction_type, creator)
        VALUES (
          ${id},
          ${date ?? new Date().toISOString().split("T")[0]},
          ${reference_id ?? ""},
          ${description ?? ""},
          ${transaction_type ?? "Transfer"},
          ${creator ?? "System"}
        )
      `;

      // Create transfers
      if (Array.isArray(transfers)) {
        for (const tr of transfers) {
          await sql`
            INSERT INTO transaction_transfers (
              transaction_id, source_account_id, destination_account_id,
              material_id, amount, unit, source_batch_id
            )
            VALUES (
              ${id},
              ${tr.source_account_id ?? null},
              ${tr.destination_account_id ?? null},
              ${tr.material_id ?? null},
              ${tr.amount ?? 0},
              ${tr.unit ?? "units"},
              ${tr.source_batch_id ?? null}
            )
          `;

          // Update batch quantities for source batches
          if (tr.source_batch_id && tr.amount) {
            await sql`
              UPDATE batches
              SET quantity = quantity - ${tr.amount}
              WHERE id = ${tr.source_batch_id}
            `;
          }

          // Update destination batch quantities or update account material quantities
          if (tr.destination_account_id && tr.material_id && tr.amount) {
            // If there is a target batch, add to it
            // Otherwise the batch creation section below handles new batches
          }
        }
      }

      // Create batches
      if (Array.isArray(batches_created)) {
        for (const bc of batches_created) {
          await sql`
            INSERT INTO batches (
              id, material_id, account_id, quantity, unit,
              location, lot_number, expiration_date,
              quality_grade, storage_condition, originating_transaction_id
            )
            VALUES (
              ${bc.id},
              ${bc.material_id},
              ${bc.account_id},
              ${bc.quantity ?? 0},
              ${bc.unit ?? "units"},
              ${bc.location ?? ""},
              ${bc.lot_number ?? ""},
              ${bc.expiration_date ?? null},
              ${bc.quality_grade ?? ""},
              ${bc.storage_condition ?? ""},
              ${id}
            )
          `;

          // Link batch to transaction
          await sql`
            INSERT INTO transaction_batches_created (transaction_id, batch_id)
            VALUES (${id}, ${bc.id})
          `;

          // Record batch lineage if source batches are specified
          if (Array.isArray(bc.source_batch_ids)) {
            for (const sourceBatchId of bc.source_batch_ids) {
              await sql`
                INSERT INTO batch_lineage (created_batch_id, source_batch_id)
                VALUES (${bc.id}, ${sourceBatchId})
              `;
            }
          }
        }
      }

      // Return the created transaction
      const result = await sql`
        SELECT * FROM transactions WHERE id = ${id}
      `;

      return Response.json(result[0], { status: 201 });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to create transaction" },
        { status: 500 }
      );
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
