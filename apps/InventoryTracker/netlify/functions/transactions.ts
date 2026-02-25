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
  const transactionId = segments[3] || null;

  try {
    if (req.method === "GET" && !transactionId) {
      const accountId = url.searchParams.get("account_id") || null;
      const materialId = url.searchParams.get("material_id") || null;
      const transactionType = url.searchParams.get("transaction_type") || null;
      const dateFrom = url.searchParams.get("date_from") || null;
      const dateTo = url.searchParams.get("date_to") || null;
      const search = url.searchParams.get("search") || null;

      // Build dynamic query with filters
      // We need to join with quantity_transfers and batches_created to get related data
      let rows;

      if (materialId) {
        // Filter transactions involving this material
        const baseRows = await sql`
          SELECT DISTINCT t.id, t.date, t.reference_id, t.description,
                 t.transaction_type, t.status, t.created_by,
                 t.created_at, t.updated_at
          FROM transactions t
          LEFT JOIN quantity_transfers qt ON t.id = qt.transaction_id
          LEFT JOIN batches_created bc ON t.id = bc.transaction_id
          WHERE (qt.material_id = ${materialId} OR bc.material_id = ${materialId})
            ${transactionType ? sql`AND t.transaction_type = ${transactionType}` : sql``}
            ${dateFrom ? sql`AND t.date >= ${dateFrom}::date` : sql``}
            ${dateTo ? sql`AND t.date <= ${dateTo}::date` : sql``}
            ${search ? sql`AND (t.reference_id ILIKE ${"%" + search + "%"} OR t.description ILIKE ${"%" + search + "%"})` : sql``}
          ORDER BY t.date DESC, t.created_at DESC
        `;
        rows = baseRows;
      } else if (accountId) {
        const baseRows = await sql`
          SELECT DISTINCT t.id, t.date, t.reference_id, t.description,
                 t.transaction_type, t.status, t.created_by,
                 t.created_at, t.updated_at
          FROM transactions t
          LEFT JOIN quantity_transfers qt ON t.id = qt.transaction_id
          WHERE (qt.source_account_id = ${accountId} OR qt.destination_account_id = ${accountId})
            ${transactionType ? sql`AND t.transaction_type = ${transactionType}` : sql``}
            ${dateFrom ? sql`AND t.date >= ${dateFrom}::date` : sql``}
            ${dateTo ? sql`AND t.date <= ${dateTo}::date` : sql``}
            ${search ? sql`AND (t.reference_id ILIKE ${"%" + search + "%"} OR t.description ILIKE ${"%" + search + "%"})` : sql``}
          ORDER BY t.date DESC, t.created_at DESC
        `;
        rows = baseRows;
      } else {
        rows = await sql`
          SELECT t.id, t.date, t.reference_id, t.description,
                 t.transaction_type, t.status, t.created_by,
                 t.created_at, t.updated_at
          FROM transactions t
          WHERE 1=1
            ${transactionType ? sql`AND t.transaction_type = ${transactionType}` : sql``}
            ${dateFrom ? sql`AND t.date >= ${dateFrom}::date` : sql``}
            ${dateTo ? sql`AND t.date <= ${dateTo}::date` : sql``}
            ${search ? sql`AND (t.reference_id ILIKE ${"%" + search + "%"} OR t.description ILIKE ${"%" + search + "%"})` : sql``}
          ORDER BY t.date DESC, t.created_at DESC
        `;
      }

      // For each transaction, fetch transfers and batches_created
      const result = await Promise.all(
        rows.map(async (t: Record<string, unknown>) => {
          const transfers = await sql`
            SELECT qt.id, qt.transaction_id,
                   qt.source_account_id, sa.name as source_account_name,
                   qt.destination_account_id, da.name as destination_account_name,
                   qt.material_id, m.name as material_name,
                   qt.amount, qt.unit, qt.source_batch_id,
                   sb.lot_number as source_batch_label
            FROM quantity_transfers qt
            LEFT JOIN accounts sa ON qt.source_account_id = sa.id
            LEFT JOIN accounts da ON qt.destination_account_id = da.id
            LEFT JOIN materials m ON qt.material_id = m.id
            LEFT JOIN batches sb ON qt.source_batch_id = sb.id
            WHERE qt.transaction_id = ${t.id as string}
          `;

          const batchesCreated = await sql`
            SELECT bc.id, bc.transaction_id, bc.batch_id,
                   bc.material_id, m.name as material_name,
                   bc.quantity, bc.unit
            FROM batches_created bc
            LEFT JOIN materials m ON bc.material_id = m.id
            WHERE bc.transaction_id = ${t.id as string}
          `;

          return {
            ...t,
            transfers,
            batches_created: batchesCreated,
          };
        })
      );

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && transactionId) {
      const rows = await sql`
        SELECT t.id, t.date, t.reference_id, t.description,
               t.transaction_type, t.status, t.created_by,
               t.created_at, t.updated_at
        FROM transactions t
        WHERE t.id = ${transactionId}
      `;
      if (rows.length === 0) {
        return new Response(
          JSON.stringify({ error: "Transaction not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      const transfers = await sql`
        SELECT qt.id, qt.transaction_id,
               qt.source_account_id, sa.name as source_account_name,
               qt.destination_account_id, da.name as destination_account_name,
               qt.material_id, m.name as material_name,
               qt.amount, qt.unit, qt.source_batch_id,
               sb.lot_number as source_batch_label
        FROM quantity_transfers qt
        LEFT JOIN accounts sa ON qt.source_account_id = sa.id
        LEFT JOIN accounts da ON qt.destination_account_id = da.id
        LEFT JOIN materials m ON qt.material_id = m.id
        LEFT JOIN batches sb ON qt.source_batch_id = sb.id
        WHERE qt.transaction_id = ${transactionId}
      `;

      const batchesCreated = await sql`
        SELECT bc.id, bc.transaction_id, bc.batch_id,
               bc.material_id, m.name as material_name,
               bc.quantity, bc.unit
        FROM batches_created bc
        LEFT JOIN materials m ON bc.material_id = m.id
        WHERE bc.transaction_id = ${transactionId}
      `;

      return new Response(
        JSON.stringify({
          ...rows[0],
          transfers,
          batches_created: batchesCreated,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { date, reference_id, description, transaction_type, transfers, batches_created } =
        body as {
          date: string;
          reference_id: string;
          description: string;
          transaction_type: string;
          transfers: {
            source_account_id: string;
            destination_account_id: string;
            material_id: string;
            amount: number;
            unit: string;
            source_batch_id?: string;
          }[];
          batches_created: {
            material_id: string;
            quantity: number;
            unit: string;
          }[];
        };

      if (!date) {
        return new Response(
          JSON.stringify({ error: "Date is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!transaction_type) {
        return new Response(
          JSON.stringify({ error: "Transaction type is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Create the transaction
      const txnRows = await sql`
        INSERT INTO transactions (date, reference_id, description, transaction_type)
        VALUES (${date}, ${reference_id || ""}, ${description || ""}, ${transaction_type})
        RETURNING *
      `;
      const txn = txnRows[0];
      const txnId = txn.id as string;

      // Create quantity transfers
      const createdTransfers = [];
      if (transfers && transfers.length > 0) {
        for (const t of transfers) {
          const rows = await sql`
            INSERT INTO quantity_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit, source_batch_id)
            VALUES (${txnId}, ${t.source_account_id}, ${t.destination_account_id}, ${t.material_id}, ${t.amount}, ${t.unit}, ${t.source_batch_id || null})
            RETURNING *
          `;
          createdTransfers.push(rows[0]);
        }
      }

      // Create batches
      const createdBatches = [];
      if (batches_created && batches_created.length > 0) {
        for (const bc of batches_created) {
          // Create the actual batch first
          const batchRows = await sql`
            INSERT INTO batches (material_id, account_id, quantity, unit, originating_transaction_id)
            VALUES (${bc.material_id}, ${transfers?.[0]?.destination_account_id || ""}, ${bc.quantity}, ${bc.unit}, ${txnId})
            RETURNING *
          `;
          const batch = batchRows[0];

          // Create the batches_created record
          const bcRows = await sql`
            INSERT INTO batches_created (transaction_id, batch_id, material_id, quantity, unit)
            VALUES (${txnId}, ${batch.id as string}, ${bc.material_id}, ${bc.quantity}, ${bc.unit})
            RETURNING *
          `;
          createdBatches.push(bcRows[0]);
        }
      }

      return new Response(
        JSON.stringify({
          ...txn,
          transfers: createdTransfers,
          batches_created: createdBatches,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "DELETE" && transactionId) {
      const rows = await sql`
        DELETE FROM transactions WHERE id = ${transactionId} RETURNING id
      `;
      if (rows.length === 0) {
        return new Response(
          JSON.stringify({ error: "Transaction not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ id: transactionId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Transactions error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
