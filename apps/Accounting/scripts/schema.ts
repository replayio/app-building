import { neon } from "@neondatabase/serverless";

/**
 * Initialize the Accounting Platform database schema.
 * This is the single source of truth for the database schema.
 * Safe to re-run (uses CREATE TABLE IF NOT EXISTS).
 *
 * @param databaseUrl - The Neon database connection URL.
 */
export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);

  // Accounts: the core entity — assets, liabilities, equity, revenue, expenses
  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50),
      category VARCHAR(50) NOT NULL CHECK (category IN ('assets', 'liabilities', 'equity', 'revenue', 'expenses')),
      balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
      institution VARCHAR(255),
      description TEXT,
      budget_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
      budget_actual NUMERIC(15, 2) NOT NULL DEFAULT 0,
      interest_rate NUMERIC(5, 2),
      credit_limit NUMERIC(15, 2),
      monthly_payment NUMERIC(15, 2),
      savings_goal_name VARCHAR(255),
      savings_goal_target NUMERIC(15, 2),
      savings_goal_current NUMERIC(15, 2),
      performance_pct NUMERIC(8, 2),
      debits_ytd NUMERIC(15, 2) NOT NULL DEFAULT 0,
      credits_ytd NUMERIC(15, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_accounts_category ON accounts (category)`;

  // Transactions: each financial transaction (header)
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date DATE NOT NULL,
      description VARCHAR(500) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'USD',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date DESC)`;

  // Transaction entries: double-entry line items for each transaction
  await sql`
    CREATE TABLE IF NOT EXISTS transaction_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      account_id UUID NOT NULL REFERENCES accounts(id),
      entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('debit', 'credit')),
      amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_transaction_entries_transaction ON transaction_entries (transaction_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transaction_entries_account ON transaction_entries (account_id)`;

  // Tags: free-form labels for transactions
  await sql`
    CREATE TABLE IF NOT EXISTS tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL UNIQUE
    )
  `;

  // Transaction-tag junction table
  await sql`
    CREATE TABLE IF NOT EXISTS transaction_tags (
      transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (transaction_id, tag_id)
    )
  `;

  // Budgets: per-account budget items (e.g., Rent: $1,500/month for Checking)
  await sql`
    CREATE TABLE IF NOT EXISTS budgets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      amount NUMERIC(15, 2) NOT NULL,
      actual_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
      period VARCHAR(20) NOT NULL DEFAULT 'monthly',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_budgets_account ON budgets (account_id)`;

  // Reports: generated report configurations and metadata
  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('summary', 'detailed', 'budget_vs_actual')),
      date_range_start DATE NOT NULL,
      date_range_end DATE NOT NULL,
      accounts_included TEXT NOT NULL DEFAULT 'all',
      categories_filter TEXT,
      include_zero_balance BOOLEAN NOT NULL DEFAULT FALSE,
      status VARCHAR(20) NOT NULL DEFAULT 'complete',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_reports_type ON reports (report_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reports_created ON reports (created_at DESC)`;

  // Report items: individual rows in a generated report
  await sql`
    CREATE TABLE IF NOT EXISTS report_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      account_id UUID REFERENCES accounts(id),
      item_name VARCHAR(255),
      item_type VARCHAR(20) NOT NULL DEFAULT 'account' CHECK (item_type IN ('account', 'category', 'item')),
      parent_item_id UUID REFERENCES report_items(id),
      budget_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
      actual_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
      variance NUMERIC(15, 2) NOT NULL DEFAULT 0,
      variance_pct NUMERIC(8, 2) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_report_items_report ON report_items (report_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_report_items_parent ON report_items (parent_item_id)`;
}

// Run directly: npx tsx scripts/schema.ts
if (process.argv[1]?.endsWith("schema.ts")) {
  const url = process.argv[2] || process.env.DATABASE_URL;
  if (!url) {
    console.error("Usage: npx tsx scripts/schema.ts <DATABASE_URL>");
    process.exit(1);
  }
  initSchema(url)
    .then(() => console.log("Schema initialized successfully."))
    .catch((err) => {
      console.error("Schema initialization failed:", err);
      process.exit(1);
    });
}
