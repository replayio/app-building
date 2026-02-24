import { neon } from "@neondatabase/serverless";

export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);

  console.log("Creating material_categories table...");
  await sql`
    CREATE TABLE IF NOT EXISTS material_categories (
      id TEXT PRIMARY KEY DEFAULT 'CAT-' || substr(md5(random()::text), 1, 8),
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Creating accounts table...");
  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY DEFAULT 'ACC-' || substr(md5(random()::text), 1, 8),
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('stock', 'input', 'output')),
      description TEXT DEFAULT '',
      is_default BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Creating materials table...");
  await sql`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY DEFAULT 'MAT-' || substr(md5(random()::text), 1, 8),
      name TEXT NOT NULL,
      category_id TEXT REFERENCES material_categories(id),
      unit_of_measure TEXT NOT NULL DEFAULT 'units',
      description TEXT DEFAULT '',
      reorder_point NUMERIC DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Creating batches table...");
  await sql`
    CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY,
      material_id TEXT NOT NULL REFERENCES materials(id),
      account_id TEXT NOT NULL REFERENCES accounts(id),
      quantity NUMERIC NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'units',
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'depleted', 'expired')),
      location TEXT DEFAULT '',
      lot_number TEXT DEFAULT '',
      expiration_date DATE,
      quality_grade TEXT DEFAULT '',
      storage_condition TEXT DEFAULT '',
      originating_transaction_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Creating transactions table...");
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      reference_id TEXT DEFAULT '',
      description TEXT DEFAULT '',
      transaction_type TEXT DEFAULT 'Transfer',
      status TEXT DEFAULT 'Completed',
      creator TEXT DEFAULT 'System',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Creating transaction_transfers table...");
  await sql`
    CREATE TABLE IF NOT EXISTS transaction_transfers (
      id SERIAL PRIMARY KEY,
      transaction_id TEXT NOT NULL REFERENCES transactions(id),
      source_account_id TEXT REFERENCES accounts(id),
      destination_account_id TEXT REFERENCES accounts(id),
      material_id TEXT REFERENCES materials(id),
      amount NUMERIC NOT NULL DEFAULT 0,
      unit TEXT DEFAULT 'units',
      source_batch_id TEXT REFERENCES batches(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Creating transaction_batches_created table...");
  await sql`
    CREATE TABLE IF NOT EXISTS transaction_batches_created (
      id SERIAL PRIMARY KEY,
      transaction_id TEXT NOT NULL REFERENCES transactions(id),
      batch_id TEXT NOT NULL REFERENCES batches(id)
    )
  `;

  console.log("Creating batch_lineage table...");
  await sql`
    CREATE TABLE IF NOT EXISTS batch_lineage (
      id SERIAL PRIMARY KEY,
      created_batch_id TEXT NOT NULL REFERENCES batches(id),
      source_batch_id TEXT NOT NULL REFERENCES batches(id)
    )
  `;

  console.log("Creating dismissed_alerts table...");
  await sql`
    CREATE TABLE IF NOT EXISTS dismissed_alerts (
      id SERIAL PRIMARY KEY,
      material_id TEXT NOT NULL REFERENCES materials(id),
      dismissed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Schema initialization complete.");
}
