import { neon } from "@neondatabase/serverless";

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Usage: npx tsx scripts/seed-db.ts <DATABASE_URL>");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function seed() {
  // Clear existing data in dependency order
  await sql`DELETE FROM batch_lineage`;
  await sql`DELETE FROM batches_created`;
  await sql`DELETE FROM quantity_transfers`;
  await sql`DELETE FROM dismissed_alerts`;
  await sql`DELETE FROM batches`;
  await sql`DELETE FROM transactions`;
  await sql`DELETE FROM materials`;
  await sql`DELETE FROM material_categories`;
  await sql`DELETE FROM accounts`;

  // ---- Accounts ----
  const accountRows = await sql`
    INSERT INTO accounts (name, account_type, description, is_default, status)
    VALUES
      ('Main Warehouse', 'stock', 'Primary storage facility', TRUE, 'active'),
      ('Secondary Warehouse', 'stock', 'Overflow storage facility', FALSE, 'active'),
      ('Receiving Dock', 'input', 'Incoming goods receiving area', TRUE, 'active'),
      ('Supplier Returns', 'output', 'Goods returned to suppliers', FALSE, 'active'),
      ('Production Floor', 'output', 'Materials consumed in production', TRUE, 'active'),
      ('Quality Hold', 'stock', 'Items pending quality inspection', FALSE, 'active')
    RETURNING id, name
  `;

  const acct: Record<string, string> = {};
  for (const row of accountRows) {
    acct[row.name as string] = row.id as string;
  }

  // ---- Material Categories ----
  const categoryRows = await sql`
    INSERT INTO material_categories (name, description)
    VALUES
      ('Raw Materials', 'Unprocessed input materials'),
      ('Finished Goods', 'Completed products ready for sale'),
      ('Packaging', 'Packaging supplies and containers'),
      ('Components', 'Sub-assemblies and parts')
    RETURNING id, name
  `;

  const cat: Record<string, string> = {};
  for (const row of categoryRows) {
    cat[row.name as string] = row.id as string;
  }

  // ---- Materials ----
  const materialRows = await sql`
    INSERT INTO materials (name, category_id, unit_of_measure, description, reorder_point)
    VALUES
      ('Steel Sheet', ${cat["Raw Materials"]}, 'kg', 'Cold-rolled steel sheets', 500),
      ('Aluminum Rod', ${cat["Raw Materials"]}, 'kg', 'Extruded aluminum rods', 200),
      ('Copper Wire', ${cat["Raw Materials"]}, 'm', 'Insulated copper wiring', 150),
      ('Steel Bolts M6', ${cat["Raw Materials"]}, 'units', 'M6 hex bolts, stainless steel', 200),
      ('Aluminum Sheets', ${cat["Raw Materials"]}, 'kg', 'Flat aluminum sheet stock', 100),
      ('Widget A', ${cat["Finished Goods"]}, 'units', 'Standard widget model A', 100),
      ('Widget B', ${cat["Finished Goods"]}, 'units', 'Premium widget model B', 50),
      ('Cardboard Box (Small)', ${cat["Packaging"]}, 'units', 'Small shipping box 30x20x15cm', 300),
      ('Cardboard Box (Large)', ${cat["Packaging"]}, 'units', 'Large shipping box 60x40x30cm', 150),
      ('Motor Assembly', ${cat["Components"]}, 'units', '12V DC motor sub-assembly', 25),
      ('Circuit Board', ${cat["Components"]}, 'units', 'Main control PCB', 40)
    RETURNING id, name
  `;

  const mat: Record<string, string> = {};
  for (const row of materialRows) {
    mat[row.name as string] = row.id as string;
  }

  // ---- Transactions ----
  const txnRows = await sql`
    INSERT INTO transactions (date, reference_id, description, transaction_type, status, created_by)
    VALUES
      ('2026-01-10', 'PO-2026-001', 'Initial steel stock purchase', 'purchase', 'posted', 'Admin'),
      ('2026-01-12', 'PO-2026-002', 'Aluminum and copper purchase', 'purchase', 'posted', 'Admin'),
      ('2026-01-15', 'PO-2026-003', 'Steel bolts purchase', 'purchase', 'posted', 'Admin'),
      ('2026-01-18', 'PO-2026-004', 'Aluminum sheets purchase', 'purchase', 'posted', 'Admin'),
      ('2026-01-20', 'WO-2026-001', 'Widget A production run', 'production', 'posted', 'Admin'),
      ('2026-02-01', 'TR-2026-001', 'Transfer packaging to secondary warehouse', 'transfer', 'posted', 'Admin'),
      ('2026-02-10', 'CO-2026-001', 'Steel consumed for widget production', 'consumption', 'posted', 'Admin'),
      ('2026-02-15', 'ADJ-2026-001', 'Inventory count adjustment - motor assembly', 'adjustment', 'posted', 'Admin')
    RETURNING id, reference_id
  `;

  const txn: Record<string, string> = {};
  for (const row of txnRows) {
    txn[row.reference_id as string] = row.id as string;
  }

  // ---- Batches ----
  const batchRows = await sql`
    INSERT INTO batches (material_id, account_id, quantity, unit, location, lot_number, expiration_date, quality_grade, storage_condition, status, originating_transaction_id)
    VALUES
      (${mat["Steel Sheet"]}, ${acct["Main Warehouse"]}, 1200, 'kg', 'Aisle 3, Rack B', 'LOT-STL-001', NULL, 'A', 'Dry, room temp', 'active', ${txn["PO-2026-001"]}),
      (${mat["Steel Sheet"]}, ${acct["Main Warehouse"]}, 800, 'kg', 'Aisle 3, Rack C', 'LOT-STL-002', NULL, 'A', 'Dry, room temp', 'active', ${txn["PO-2026-001"]}),
      (${mat["Aluminum Rod"]}, ${acct["Main Warehouse"]}, 450, 'kg', 'Aisle 4, Rack A', 'LOT-ALU-001', NULL, 'A', 'Dry, room temp', 'active', ${txn["PO-2026-002"]}),
      (${mat["Copper Wire"]}, ${acct["Main Warehouse"]}, 80, 'm', 'Aisle 5, Rack A', 'LOT-COP-001', NULL, 'A', 'Dry, cool', 'active', ${txn["PO-2026-002"]}),
      (${mat["Steel Bolts M6"]}, ${acct["Main Warehouse"]}, 150, 'units', 'Aisle 3, Rack D', 'LOT-SBM-001', NULL, 'A', 'Dry, room temp', 'active', ${txn["PO-2026-003"]}),
      (${mat["Aluminum Sheets"]}, ${acct["Main Warehouse"]}, 25, 'kg', 'Aisle 4, Rack B', 'LOT-ALS-001', NULL, 'A', 'Dry, room temp', 'active', ${txn["PO-2026-004"]}),
      (${mat["Widget A"]}, ${acct["Main Warehouse"]}, 150, 'units', 'Aisle 1, Shelf 2', 'LOT-WA-001', NULL, 'A', 'Room temp', 'active', ${txn["WO-2026-001"]}),
      (${mat["Widget B"]}, ${acct["Main Warehouse"]}, 35, 'units', 'Aisle 1, Shelf 3', 'LOT-WB-001', NULL, 'A', 'Room temp', 'active', NULL),
      (${mat["Cardboard Box (Small)"]}, ${acct["Main Warehouse"]}, 500, 'units', 'Aisle 6, Bay 1', 'LOT-BOX-S-001', NULL, 'B', 'Dry', 'active', NULL),
      (${mat["Cardboard Box (Large)"]}, ${acct["Secondary Warehouse"]}, 200, 'units', 'Bay 2', 'LOT-BOX-L-001', NULL, 'B', 'Dry', 'active', ${txn["TR-2026-001"]}),
      (${mat["Motor Assembly"]}, ${acct["Main Warehouse"]}, 60, 'units', 'Aisle 2, Shelf 1', 'LOT-MOT-001', NULL, 'A', 'ESD protected', 'active', NULL),
      (${mat["Circuit Board"]}, ${acct["Main Warehouse"]}, 80, 'units', 'Aisle 2, Shelf 2', 'LOT-PCB-001', '2027-06-30', 'A', 'ESD protected, dry', 'active', NULL),
      (${mat["Steel Sheet"]}, ${acct["Production Floor"]}, 0, 'kg', 'Line 1', 'LOT-STL-003', NULL, 'A', 'N/A', 'depleted', ${txn["CO-2026-001"]})
    RETURNING id, lot_number
  `;

  const batch: Record<string, string> = {};
  for (const row of batchRows) {
    batch[row.lot_number as string] = row.id as string;
  }

  // ---- Quantity Transfers ----
  await sql`
    INSERT INTO quantity_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit, source_batch_id)
    VALUES
      (${txn["PO-2026-001"]}, ${acct["Receiving Dock"]}, ${acct["Main Warehouse"]}, ${mat["Steel Sheet"]}, 2000, 'kg', NULL),
      (${txn["PO-2026-002"]}, ${acct["Receiving Dock"]}, ${acct["Main Warehouse"]}, ${mat["Aluminum Rod"]}, 450, 'kg', NULL),
      (${txn["PO-2026-002"]}, ${acct["Receiving Dock"]}, ${acct["Main Warehouse"]}, ${mat["Copper Wire"]}, 80, 'm', NULL),
      (${txn["PO-2026-003"]}, ${acct["Receiving Dock"]}, ${acct["Main Warehouse"]}, ${mat["Steel Bolts M6"]}, 150, 'units', NULL),
      (${txn["PO-2026-004"]}, ${acct["Receiving Dock"]}, ${acct["Main Warehouse"]}, ${mat["Aluminum Sheets"]}, 25, 'kg', NULL),
      (${txn["TR-2026-001"]}, ${acct["Main Warehouse"]}, ${acct["Secondary Warehouse"]}, ${mat["Cardboard Box (Large)"]}, 200, 'units', NULL),
      (${txn["CO-2026-001"]}, ${acct["Main Warehouse"]}, ${acct["Production Floor"]}, ${mat["Steel Sheet"]}, 300, 'kg', ${batch["LOT-STL-001"]}),
      (${txn["ADJ-2026-001"]}, ${acct["Receiving Dock"]}, ${acct["Main Warehouse"]}, ${mat["Motor Assembly"]}, 10, 'units', NULL)
  `;

  // ---- Batches Created ----
  await sql`
    INSERT INTO batches_created (transaction_id, batch_id, material_id, quantity, unit)
    VALUES
      (${txn["PO-2026-001"]}, ${batch["LOT-STL-001"]}, ${mat["Steel Sheet"]}, 1200, 'kg'),
      (${txn["PO-2026-001"]}, ${batch["LOT-STL-002"]}, ${mat["Steel Sheet"]}, 800, 'kg'),
      (${txn["WO-2026-001"]}, ${batch["LOT-WA-001"]}, ${mat["Widget A"]}, 150, 'units')
  `;

  console.log("Seed data inserted successfully.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
