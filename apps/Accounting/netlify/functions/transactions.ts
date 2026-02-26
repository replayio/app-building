import { neon } from "@neondatabase/serverless";
import type { Context } from "@netlify/functions";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

function parseAmount(val: unknown): number {
  if (val === null || val === undefined) return 0;
  return parseFloat(val as string);
}

export default async function handler(req: Request, _context: Context) {
  const sql = getSQL();
  const url = new URL(req.url);
  const segments = url.pathname
    .replace(/^\/\.netlify\/functions\/transactions\/?/, "")
    .split("/")
    .filter(Boolean);
  const id = segments[0] || null;

  try {
    // GET /transactions — list all, optionally filtered by accountId
    if (req.method === "GET" && !id) {
      const accountId = url.searchParams.get("accountId");

      let transactions;
      if (accountId) {
        transactions = await sql`
          SELECT DISTINCT t.*
          FROM transactions t
          JOIN transaction_entries te ON te.transaction_id = t.id
          WHERE te.account_id = ${accountId}
          ORDER BY t.date DESC, t.created_at DESC
        `;
      } else {
        transactions = await sql`
          SELECT * FROM transactions ORDER BY date DESC, created_at DESC
        `;
      }

      // Attach entries and tags for each transaction
      const result = [];
      for (const txn of transactions) {
        const entries = await sql`
          SELECT te.*, a.name as account_name
          FROM transaction_entries te
          LEFT JOIN accounts a ON a.id = te.account_id
          WHERE te.transaction_id = ${txn.id}
          ORDER BY te.created_at
        `;
        const tagRows = await sql`
          SELECT t.id, t.name
          FROM tags t
          JOIN transaction_tags tt ON tt.tag_id = t.id
          WHERE tt.transaction_id = ${txn.id}
          ORDER BY t.name
        `;
        result.push({
          ...txn,
          entries: entries.map((e) => ({
            ...e,
            amount: parseAmount(e.amount),
          })),
          tags: tagRows,
        });
      }

      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /transactions/:id — get single transaction with entries and tags
    if (req.method === "GET" && id) {
      const rows = await sql`SELECT * FROM transactions WHERE id = ${id}`;
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
        });
      }
      const txn = rows[0];
      const entries = await sql`
        SELECT te.*, a.name as account_name
        FROM transaction_entries te
        LEFT JOIN accounts a ON a.id = te.account_id
        WHERE te.transaction_id = ${id}
        ORDER BY te.created_at
      `;
      const tagRows = await sql`
        SELECT t.id, t.name
        FROM tags t
        JOIN transaction_tags tt ON tt.tag_id = t.id
        WHERE tt.transaction_id = ${id}
        ORDER BY t.name
      `;

      return new Response(
        JSON.stringify({
          ...txn,
          entries: entries.map((e) => ({
            ...e,
            amount: parseAmount(e.amount),
          })),
          tags: tagRows,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // POST /transactions — create new transaction
    if (req.method === "POST") {
      const body = (await req.json()) as {
        date: string;
        description: string;
        currency: string;
        entries: Array<{
          account_id: string;
          entry_type: string;
          amount: number;
        }>;
        tags: string[];
      };

      const { date, description, currency, entries, tags } = body;

      // Insert transaction header
      const txnRows = await sql`
        INSERT INTO transactions (date, description, currency)
        VALUES (${date || null}, ${description}, ${currency || "USD"})
        RETURNING *
      `;
      const txn = txnRows[0];

      // Insert entries and update account balances
      const insertedEntries: Record<string, unknown>[] = [];
      for (const entry of entries) {
        const entryRows = await sql`
          INSERT INTO transaction_entries (transaction_id, account_id, entry_type, amount)
          VALUES (${txn.id}, ${entry.account_id}, ${entry.entry_type}, ${entry.amount})
          RETURNING *
        `;
        insertedEntries.push({
          ...entryRows[0],
          amount: entry.amount,
        });

        // Update account balance and YTD totals
        if (entry.entry_type === "debit") {
          await sql`
            UPDATE accounts
            SET balance = balance + ${entry.amount},
                debits_ytd = debits_ytd + ${entry.amount},
                budget_actual = budget_actual + ${entry.amount},
                updated_at = NOW()
            WHERE id = ${entry.account_id}
          `;
        } else {
          await sql`
            UPDATE accounts
            SET balance = balance + ${entry.amount},
                credits_ytd = credits_ytd + ${entry.amount},
                updated_at = NOW()
            WHERE id = ${entry.account_id}
          `;
        }
      }

      // Attach account names to entries
      for (const entry of insertedEntries) {
        const acctRows = await sql`SELECT name FROM accounts WHERE id = ${entry.account_id}`;
        if (acctRows.length > 0) {
          entry.account_name = acctRows[0].name;
        }
      }

      // Insert tags
      const insertedTags = [];
      for (const tagName of tags) {
        // Upsert tag
        let tagRows = await sql`
          SELECT id, name FROM tags WHERE name = ${tagName}
        `;
        if (tagRows.length === 0) {
          tagRows = await sql`
            INSERT INTO tags (name) VALUES (${tagName}) RETURNING id, name
          `;
        }
        const tag = tagRows[0];

        await sql`
          INSERT INTO transaction_tags (transaction_id, tag_id)
          VALUES (${txn.id}, ${tag.id})
          ON CONFLICT DO NOTHING
        `;
        insertedTags.push(tag);
      }

      // Update matching budget items based on transaction tags
      for (const entry of entries) {
        if (entry.entry_type === "debit") {
          for (const tagName of tags) {
            await sql`
              UPDATE budgets
              SET actual_amount = actual_amount + ${entry.amount}
              WHERE account_id = ${entry.account_id}
                AND LOWER(name) = LOWER(${tagName})
            `;
          }
        }
      }

      return new Response(
        JSON.stringify({
          ...txn,
          entries: insertedEntries,
          tags: insertedTags,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // PUT /transactions/:id — update existing transaction
    if (req.method === "PUT" && id) {
      const body = (await req.json()) as {
        date: string;
        description: string;
        currency: string;
        entries: Array<{
          account_id: string;
          entry_type: string;
          amount: number;
        }>;
        tags: string[];
      };

      const { date, description, currency, entries, tags } = body;

      // Reverse old entries from account balances
      const oldEntries = await sql`
        SELECT * FROM transaction_entries WHERE transaction_id = ${id}
      `;
      for (const old of oldEntries) {
        const oldAmount = parseAmount(old.amount);
        if (old.entry_type === "debit") {
          await sql`
            UPDATE accounts
            SET balance = balance - ${oldAmount},
                debits_ytd = debits_ytd - ${oldAmount},
                budget_actual = budget_actual - ${oldAmount},
                updated_at = NOW()
            WHERE id = ${old.account_id}
          `;
        } else {
          await sql`
            UPDATE accounts
            SET balance = balance - ${oldAmount},
                credits_ytd = credits_ytd - ${oldAmount},
                updated_at = NOW()
            WHERE id = ${old.account_id}
          `;
        }
      }

      // Delete old entries and tags
      await sql`DELETE FROM transaction_entries WHERE transaction_id = ${id}`;
      await sql`DELETE FROM transaction_tags WHERE transaction_id = ${id}`;

      // Update transaction header
      const txnRows = await sql`
        UPDATE transactions
        SET date = ${date || null}, description = ${description}, currency = ${currency || "USD"}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      if (txnRows.length === 0) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
        });
      }
      const txn = txnRows[0];

      // Insert new entries and update balances
      const insertedEntries: Record<string, unknown>[] = [];
      for (const entry of entries) {
        const entryRows = await sql`
          INSERT INTO transaction_entries (transaction_id, account_id, entry_type, amount)
          VALUES (${id}, ${entry.account_id}, ${entry.entry_type}, ${entry.amount})
          RETURNING *
        `;
        insertedEntries.push({
          ...entryRows[0],
          amount: entry.amount,
        });

        if (entry.entry_type === "debit") {
          await sql`
            UPDATE accounts
            SET balance = balance + ${entry.amount},
                debits_ytd = debits_ytd + ${entry.amount},
                budget_actual = budget_actual + ${entry.amount},
                updated_at = NOW()
            WHERE id = ${entry.account_id}
          `;
        } else {
          await sql`
            UPDATE accounts
            SET balance = balance + ${entry.amount},
                credits_ytd = credits_ytd + ${entry.amount},
                updated_at = NOW()
            WHERE id = ${entry.account_id}
          `;
        }
      }

      // Attach account names
      for (const entry of insertedEntries) {
        const acctRows = await sql`SELECT name FROM accounts WHERE id = ${entry.account_id}`;
        if (acctRows.length > 0) {
          entry.account_name = acctRows[0].name;
        }
      }

      // Insert new tags
      const insertedTags = [];
      for (const tagName of tags) {
        let tagRows = await sql`
          SELECT id, name FROM tags WHERE name = ${tagName}
        `;
        if (tagRows.length === 0) {
          tagRows = await sql`
            INSERT INTO tags (name) VALUES (${tagName}) RETURNING id, name
          `;
        }
        const tag = tagRows[0];

        await sql`
          INSERT INTO transaction_tags (transaction_id, tag_id)
          VALUES (${id}, ${tag.id})
          ON CONFLICT DO NOTHING
        `;
        insertedTags.push(tag);
      }

      return new Response(
        JSON.stringify({
          ...txn,
          entries: insertedEntries,
          tags: insertedTags,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // DELETE /transactions/:id
    if (req.method === "DELETE" && id) {
      // Reverse entries from account balances before deleting
      const oldEntries = await sql`
        SELECT * FROM transaction_entries WHERE transaction_id = ${id}
      `;
      for (const old of oldEntries) {
        const oldAmount = parseAmount(old.amount);
        if (old.entry_type === "debit") {
          await sql`
            UPDATE accounts
            SET balance = balance - ${oldAmount},
                debits_ytd = debits_ytd - ${oldAmount},
                budget_actual = budget_actual - ${oldAmount},
                updated_at = NOW()
            WHERE id = ${old.account_id}
          `;
        } else {
          await sql`
            UPDATE accounts
            SET balance = balance - ${oldAmount},
                credits_ytd = credits_ytd - ${oldAmount},
                updated_at = NOW()
            WHERE id = ${old.account_id}
          `;
        }
      }

      // Reverse budget item updates based on transaction tags
      const delTagRows = await sql`
        SELECT t.name FROM tags t
        JOIN transaction_tags tt ON tt.tag_id = t.id
        WHERE tt.transaction_id = ${id}
      `;
      for (const old of oldEntries) {
        if (old.entry_type === "debit") {
          const oldAmount = parseAmount(old.amount);
          for (const tagRow of delTagRows) {
            await sql`
              UPDATE budgets
              SET actual_amount = actual_amount - ${oldAmount}
              WHERE account_id = ${old.account_id}
                AND LOWER(name) = LOWER(${tagRow.name})
            `;
          }
        }
      }

      await sql`DELETE FROM transactions WHERE id = ${id}`;
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  } catch (err) {
    console.error("transactions function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
