import { neon } from "@neondatabase/serverless";

/**
 * Initialize the InventoryTracker database schema.
 * This is the single source of truth for the database schema.
 * Safe to re-run (uses CREATE TABLE IF NOT EXISTS).
 *
 * @param databaseUrl - The Neon database connection URL.
 */
export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);

  // Accounts: global inventory accounts (stock, input, output)
  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('stock', 'input', 'output')),
      description TEXT NOT NULL DEFAULT '',
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts (account_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts (status)`;

  // Material categories: groupings for materials (e.g., Raw Materials, Finished Goods, Packaging)
  await sql`
    CREATE TABLE IF NOT EXISTS material_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Materials: items tracked in the inventory system
  await sql`
    CREATE TABLE IF NOT EXISTS materials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      category_id UUID NOT NULL REFERENCES material_categories(id),
      unit_of_measure VARCHAR(50) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      reorder_point NUMERIC(15, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_materials_category ON materials (category_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_materials_name ON materials (name)`;

  // Batches: subdivisions of material within an account
  await sql`
    CREATE TABLE IF NOT EXISTS batches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      material_id UUID NOT NULL REFERENCES materials(id),
      account_id UUID NOT NULL REFERENCES accounts(id),
      quantity NUMERIC(15, 2) NOT NULL DEFAULT 0,
      unit VARCHAR(50) NOT NULL,
      location VARCHAR(255) NOT NULL DEFAULT '',
      lot_number VARCHAR(100) NOT NULL DEFAULT '',
      expiration_date DATE,
      quality_grade VARCHAR(50) NOT NULL DEFAULT '',
      storage_condition VARCHAR(100) NOT NULL DEFAULT '',
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'depleted', 'expired')),
      originating_transaction_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_batches_material ON batches (material_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_batches_account ON batches (account_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_batches_status ON batches (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_batches_originating_txn ON batches (originating_transaction_id)`;

  // Transactions: double-entry inventory transactions
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date DATE NOT NULL,
      reference_id VARCHAR(100) NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('purchase', 'consumption', 'transfer', 'production', 'adjustment')),
      status VARCHAR(20) NOT NULL DEFAULT 'posted' CHECK (status IN ('posted', 'draft', 'void')),
      created_by VARCHAR(255) NOT NULL DEFAULT 'Admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (transaction_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions (reference_id)`;

  // Quantity transfers: double-entry line items moving material between accounts
  await sql`
    CREATE TABLE IF NOT EXISTS quantity_transfers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      source_account_id UUID NOT NULL REFERENCES accounts(id),
      destination_account_id UUID NOT NULL REFERENCES accounts(id),
      material_id UUID NOT NULL REFERENCES materials(id),
      amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
      unit VARCHAR(50) NOT NULL,
      source_batch_id UUID REFERENCES batches(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_qty_transfers_transaction ON quantity_transfers (transaction_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_qty_transfers_source ON quantity_transfers (source_account_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_qty_transfers_dest ON quantity_transfers (destination_account_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_qty_transfers_material ON quantity_transfers (material_id)`;

  // Batches created: batches produced by a transaction
  await sql`
    CREATE TABLE IF NOT EXISTS batches_created (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      material_id UUID NOT NULL REFERENCES materials(id),
      quantity NUMERIC(15, 2) NOT NULL CHECK (quantity > 0),
      unit VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_batches_created_transaction ON batches_created (transaction_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_batches_created_batch ON batches_created (batch_id)`;

  // Batch lineage: tracks which source batches were used to create a new batch
  await sql`
    CREATE TABLE IF NOT EXISTS batch_lineage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      source_batch_id UUID NOT NULL REFERENCES batches(id),
      quantity_used NUMERIC(15, 2) NOT NULL CHECK (quantity_used > 0),
      unit VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_batch_lineage_batch ON batch_lineage (batch_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_batch_lineage_source ON batch_lineage (source_batch_id)`;

  // Dismissed alerts: tracks which low inventory alerts have been dismissed
  await sql`
    CREATE TABLE IF NOT EXISTS dismissed_alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
      dismissed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      dismissed_until TIMESTAMPTZ
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_dismissed_alerts_material ON dismissed_alerts (material_id)`;

  // Add originating_transaction_id FK to batches (deferred because transactions table may not exist yet)
  // This is handled via ALTER TABLE migration below.
}

/**
 * Run migrations that ALTER TABLE cannot express via CREATE TABLE IF NOT EXISTS.
 */
export async function runMigrations(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);

  // Add FK from batches.originating_transaction_id to transactions(id) if not exists
  const fkExists = await sql`
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_batches_originating_txn'
      AND table_name = 'batches'
    LIMIT 1
  `;
  if (fkExists.length === 0) {
    await sql`
      ALTER TABLE batches
      ADD CONSTRAINT fk_batches_originating_txn
      FOREIGN KEY (originating_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
    `;
  }
}

// Run directly: npx tsx scripts/schema.ts <DATABASE_URL>
if (process.argv[1]?.endsWith("schema.ts")) {
  const url = process.argv[2] || process.env.DATABASE_URL;
  if (!url) {
    console.error("Usage: npx tsx scripts/schema.ts <DATABASE_URL>");
    process.exit(1);
  }
  initSchema(url)
    .then(() => runMigrations(url))
    .then(() => console.log("Schema initialized successfully."))
    .catch((err) => {
      console.error("Schema initialization failed:", err);
      process.exit(1);
    });
}
