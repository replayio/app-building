import { neon } from "@neondatabase/serverless";

/**
 * Initialize the ProductionHub database schema.
 * This is the single source of truth for the database schema.
 * Safe to re-run (uses CREATE TABLE IF NOT EXISTS).
 *
 * @param databaseUrl - The Neon database connection URL.
 */
export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);

  // Equipment: manufacturing equipment available for production
  await sql`
    CREATE TABLE IF NOT EXISTS equipment (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      available_units INT NOT NULL DEFAULT 1,
      status VARCHAR(50) NOT NULL DEFAULT 'Operational'
        CHECK (status IN ('Operational', 'Maintenance', 'Decommissioned')),
      model VARCHAR(255) NOT NULL DEFAULT '',
      serial_number VARCHAR(255) NOT NULL DEFAULT '',
      location VARCHAR(255) NOT NULL DEFAULT '',
      manufacturer VARCHAR(255) NOT NULL DEFAULT '',
      installation_date DATE,
      photo_url TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_equipment_name ON equipment (name)`;

  // Equipment notes: maintenance comments on equipment
  await sql`
    CREATE TABLE IF NOT EXISTS equipment_notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
      author_name VARCHAR(255) NOT NULL DEFAULT 'Admin',
      author_role VARCHAR(255) NOT NULL DEFAULT 'Operator',
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_equipment_notes_equipment ON equipment_notes (equipment_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_equipment_notes_created ON equipment_notes (created_at DESC)`;

  // Recipes: manufacturing recipe definitions
  await sql`
    CREATE TABLE IF NOT EXISTS recipes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      product VARCHAR(255) NOT NULL DEFAULT '',
      version VARCHAR(50) NOT NULL DEFAULT '1.0',
      status VARCHAR(20) NOT NULL DEFAULT 'Draft'
        CHECK (status IN ('Active', 'Draft', 'Archived')),
      description TEXT NOT NULL DEFAULT '',
      instructions TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_recipes_status ON recipes (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes (name)`;

  // Recipe materials: raw materials required per batch
  await sql`
    CREATE TABLE IF NOT EXISTS recipe_materials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      material_name VARCHAR(255) NOT NULL,
      quantity NUMERIC(15, 2) NOT NULL DEFAULT 0,
      unit VARCHAR(50) NOT NULL DEFAULT 'kg'
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_recipe_materials_recipe ON recipe_materials (recipe_id)`;

  // Recipe products: output products per batch
  await sql`
    CREATE TABLE IF NOT EXISTS recipe_products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      product_name VARCHAR(255) NOT NULL,
      amount VARCHAR(100) NOT NULL DEFAULT ''
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_recipe_products_recipe ON recipe_products (recipe_id)`;

  // Recipe equipment: equipment required by a recipe
  await sql`
    CREATE TABLE IF NOT EXISTS recipe_equipment (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_recipe_equipment_recipe ON recipe_equipment (recipe_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_recipe_equipment_equipment ON recipe_equipment (equipment_id)`;

  // Production runs: scheduled production events
  await sql`
    CREATE TABLE IF NOT EXISTS production_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
      start_date TIMESTAMPTZ NOT NULL,
      end_date TIMESTAMPTZ NOT NULL,
      planned_quantity NUMERIC(15, 2) NOT NULL DEFAULT 0,
      unit VARCHAR(50) NOT NULL DEFAULT 'Units',
      status VARCHAR(50) NOT NULL DEFAULT 'Scheduled'
        CHECK (status IN ('Scheduled', 'Confirmed', 'In Progress', 'On Track',
          'Material Shortage', 'Pending Approval', 'Cancelled', 'Completed')),
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_runs_recipe ON production_runs (recipe_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_runs_status ON production_runs (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_runs_start_date ON production_runs (start_date)`;

  // Run forecast data: material availability forecasts for a run
  await sql`
    CREATE TABLE IF NOT EXISTS run_forecasts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      run_id UUID NOT NULL REFERENCES production_runs(id) ON DELETE CASCADE,
      material_name VARCHAR(255) NOT NULL,
      required_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
      forecast_available NUMERIC(15, 2) NOT NULL DEFAULT 0,
      unit VARCHAR(50) NOT NULL DEFAULT 'kg',
      pending_delivery VARCHAR(255) NOT NULL DEFAULT ''
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_run_forecasts_run ON run_forecasts (run_id)`;

  // Run equipment: equipment assigned to a production run
  await sql`
    CREATE TABLE IF NOT EXISTS run_equipment (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      run_id UUID NOT NULL REFERENCES production_runs(id) ON DELETE CASCADE,
      equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
      status VARCHAR(100) NOT NULL DEFAULT 'Available',
      notes TEXT NOT NULL DEFAULT ''
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_run_equipment_run ON run_equipment (run_id)`;
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
