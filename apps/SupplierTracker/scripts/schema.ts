import { neon } from "@neondatabase/serverless";

/**
 * Initialize the SupplierTracker database schema.
 * This is the single source of truth for the database schema.
 * Safe to re-run (uses CREATE TABLE IF NOT EXISTS).
 *
 * @param databaseUrl - The Neon database connection URL.
 */
export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);

  // Suppliers: company profiles for supplier relationship management
  await sql`
    CREATE TABLE IF NOT EXISTS suppliers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL DEFAULT '',
      contact_name VARCHAR(255) NOT NULL DEFAULT '',
      phone VARCHAR(100) NOT NULL DEFAULT '',
      email VARCHAR(255) NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      status VARCHAR(50) NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active', 'Inactive', 'On Hold', 'Suspended')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers (name)`;

  // Supplier documents: contracts, certifications, agreements, etc.
  await sql`
    CREATE TABLE IF NOT EXISTS supplier_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
      file_name VARCHAR(500) NOT NULL,
      file_url TEXT NOT NULL DEFAULT '',
      document_type VARCHAR(100) NOT NULL DEFAULT '',
      upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_supplier_documents_supplier ON supplier_documents (supplier_id)`;

  // Supplier comments: notes and discussions about suppliers
  await sql`
    CREATE TABLE IF NOT EXISTS supplier_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
      author_name VARCHAR(255) NOT NULL DEFAULT 'Admin',
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_supplier_comments_supplier ON supplier_comments (supplier_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_supplier_comments_created ON supplier_comments (created_at DESC)`;

  // Orders: purchase orders associated with suppliers
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id VARCHAR(100) NOT NULL UNIQUE,
      supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
      order_date DATE NOT NULL DEFAULT CURRENT_DATE,
      expected_delivery DATE,
      status VARCHAR(50) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Approved', 'Processing', 'In Transit', 'Shipped', 'Delivered', 'Fulfilled', 'Completed', 'Cancelled')),
      subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
      tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
      tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
      discount_label VARCHAR(255) NOT NULL DEFAULT '',
      discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
      total_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'USD',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_orders_supplier ON orders (supplier_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders (order_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_expected_delivery ON orders (expected_delivery)`;

  // Order line items: individual items in a purchase order
  await sql`
    CREATE TABLE IF NOT EXISTS order_line_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      sku VARCHAR(100) NOT NULL DEFAULT '',
      item_name TEXT NOT NULL,
      quantity NUMERIC(15, 2) NOT NULL DEFAULT 0,
      unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
      line_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_order_line_items_order ON order_line_items (order_id)`;

  // Order documents: purchase order PDFs, invoices, shipping documents, etc.
  await sql`
    CREATE TABLE IF NOT EXISTS order_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      file_name VARCHAR(500) NOT NULL,
      file_url TEXT NOT NULL DEFAULT '',
      document_type VARCHAR(100) NOT NULL DEFAULT '',
      upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_order_documents_order ON order_documents (order_id)`;

  // Order history: activity log tracking changes to orders
  await sql`
    CREATE TABLE IF NOT EXISTS order_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      event_type VARCHAR(50) NOT NULL DEFAULT 'updated'
        CHECK (event_type IN ('created', 'status_change', 'approval', 'delivery', 'document', 'line_item_added', 'line_item_updated', 'line_item_deleted', 'updated')),
      description TEXT NOT NULL,
      actor VARCHAR(255) NOT NULL DEFAULT 'System',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_history (order_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_order_history_created ON order_history (created_at DESC)`;
}

/**
 * Run migrations that ALTER TABLE cannot express via CREATE TABLE IF NOT EXISTS.
 */
export async function runMigrations(_databaseUrl: string): Promise<void> {
  // No migrations needed yet.
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
