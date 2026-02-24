import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function seed(): Promise<void> {
  console.log("Truncating existing data...");
  await sql`
    TRUNCATE
      dismissed_alerts,
      batch_lineage,
      transaction_batches_created,
      transaction_transfers,
      transactions,
      batches,
      materials,
      accounts,
      material_categories
    CASCADE
  `;

  // =========================================================================
  // Categories
  // =========================================================================
  console.log("Seeding categories...");
  await sql`
    INSERT INTO material_categories (id, name) VALUES
      ('CAT-RAW', 'Raw Materials'),
      ('CAT-FIN', 'Finished Goods'),
      ('CAT-PKG', 'Packaging'),
      ('CAT-CMP', 'Components'),
      ('CAT-SUB', 'Sub-Assemblies'),
      ('CAT-COM', 'Composite')
  `;

  // =========================================================================
  // Accounts
  // =========================================================================
  console.log("Seeding accounts...");

  // Stock accounts (main set shown on AccountsPage)
  await sql`
    INSERT INTO accounts (id, name, type, description, is_default) VALUES
      ('ACC-MAIN-INV',    'Main Inventory',    'stock',  'Primary storage for all physical goods.',    true),
      ('ACC-RAW-MAT',     'Raw Materials',     'stock',  'Components for manufacturing.',              false),
      ('ACC-FIN-GOODS',   'Finished Goods',    'stock',  'Completed products ready for sale.',         false),
      ('ACC-SAFETY',      'Safety Stock',      'stock',  'Buffer inventory for emergencies.',          false)
  `;

  // Input accounts (main set)
  await sql`
    INSERT INTO accounts (id, name, type, description, is_default) VALUES
      ('ACC-PURCHASES',   'Purchases',                  'input',  'General account for acquiring stock.',        true),
      ('ACC-VENDOR-CR',   'Vendor Credits',              'input',  'Credits received from suppliers.',            false),
      ('ACC-SHIP-IN',     'Shipping Costs (Inbound)',    'input',  'Freight and delivery fees for purchases.',   false)
  `;

  // Output accounts (main set)
  await sql`
    INSERT INTO accounts (id, name, type, description, is_default) VALUES
      ('ACC-SALES',       'Sales Revenue',        'output', 'Income from product sales.',                 true),
      ('ACC-SERVICE',     'Service Income',        'output', 'Revenue from non-product services.',         false),
      ('ACC-DISCOUNT',    'Customer Discounts',    'output', 'Reductions given to customers.',             false),
      ('ACC-RETURNS',     'Returns & Damages',     'output', 'Buffer for returned or damaged goods.',      false)
  `;

  // Additional accounts for detail pages
  await sql`
    INSERT INTO accounts (id, name, type, description, is_default) VALUES
      ('A-1024-INV',       'Finished Goods Warehouse 2',    'stock',  'Storage for finished goods overflow.',      false),
      ('ACC-WAREHOUSE-A',  'Warehouse A - Main Storage',    'stock',  'Main warehouse storage.',                   false),
      ('ACC-PROD-B',       'Production Line B',             'stock',  'Manufacturing production line.',             false),
      ('ACC-SUPPLIER-X',   'Supplier X',                    'input',  'Primary supplier.',                         false),
      ('ACC-SUPPLIER-B',   'Supplier B',                    'input',  'Secondary supplier.',                       false),
      ('ACC-CUSTOMER-X',   'Customer X',                    'output', 'Key customer account.',                     false),
      ('ACC-GLOBAL-IMP',   'Global Imports Inc.',           'input',  'Global imports provider.',                  false),
      ('ACC-FARM-COOP',    'Farm Co-op',                    'input',  'Agricultural supplier cooperative.',        false),
      ('ACC-FAC-SUPP',     'Facility Supplies',             'input',  'Facility supplies provider.',               false),
      ('ACC-RAW-MAT-INV',  'Raw Materials Inventory',       'stock',  'Raw materials inventory for TXN page.',     false),
      ('ACC-PAYABLE',      'Accounts Payable',              'output', 'Payable account for TXN page testing.',     false),
      ('ACC-WIP-PROD',     'Production Line B - WIP',       'stock',  'Work in progress production.',              false),
      ('ACC-SHRINKAGE',    'Inventory Shrinkage Expense',   'output', 'Expense account for shrinkage.',            false)
  `;

  // =========================================================================
  // Materials
  // =========================================================================
  console.log("Seeding materials...");

  // Dashboard LowInventoryAlerts materials (with reorder points)
  // Steel Bolts M6: current stock 150, reorder 200 => Warning
  // Aluminum Sheets: current stock 25 kg, reorder 100 => Critical
  // Copper Wire: current stock 80 m, reorder 150 => Warning
  await sql`
    INSERT INTO materials (id, name, category_id, unit_of_measure, description, reorder_point) VALUES
      ('MAT-BOLTS',   'Steel Bolts M6',     'CAT-RAW', 'units',  'M6 steel bolts for assembly.',       200),
      ('MAT-ALUM',    'Aluminum Sheets',     'CAT-RAW', 'kg',     'Aluminum sheet material.',            100),
      ('MAT-COPPER',  'Copper Wire',         'CAT-RAW', 'm',      'Copper wire for electronics.',        150)
  `;

  // Dashboard MaterialsCategoriesOverview materials
  // Raw Materials: Iron Rods (1200 units), Plastic Granules (800 kg), Wood Planks (500 pieces)
  // Finished Goods: Chair A (150 units), Table B (80 units), Shelf C (100 units)
  // Packaging: Cardboard Boxes (500 units), Bubble Wrap (200 m), Tape Rolls (150 rolls)
  await sql`
    INSERT INTO materials (id, name, category_id, unit_of_measure, description, reorder_point) VALUES
      ('MAT-IRON',      'Iron Rods',          'CAT-RAW', 'units',   'Iron rods for construction.',        50),
      ('MAT-PLASTIC',   'Plastic Granules',   'CAT-RAW', 'kg',      'Plastic granules for molding.',      100),
      ('MAT-WOOD',      'Wood Planks',        'CAT-RAW', 'pieces',  'Wooden planks for furniture.',       50),
      ('MAT-CHAIRA',    'Chair A',            'CAT-FIN', 'units',   'Standard office chair.',             20),
      ('MAT-TABLEB',    'Table B',            'CAT-FIN', 'units',   'Conference table.',                  10),
      ('MAT-SHELFC',    'Shelf C',            'CAT-FIN', 'units',   'Storage shelf unit.',                15),
      ('MAT-CARDBOX',   'Cardboard Boxes',    'CAT-PKG', 'units',   'Standard shipping boxes.',           100),
      ('MAT-BUBBLE',    'Bubble Wrap',        'CAT-PKG', 'm',       'Protective bubble wrap.',            50),
      ('MAT-TAPE',      'Tape Rolls',         'CAT-PKG', 'rolls',   'Packaging tape rolls.',              30)
  `;

  // AccountDetailPage (A-1024-INV) tracked materials
  await sql`
    INSERT INTO materials (id, name, category_id, unit_of_measure, description, reorder_point) VALUES
      ('MAT-SS3MM',    'Steel Sheets (3mm)',          'CAT-RAW', 'Sheets',     'Steel sheets 3mm thickness.',          100),
      ('MAT-ALEXTA',   'Aluminum Extrusion A',        'CAT-CMP', 'Meters',     'Aluminum extrusion profile A.',        50),
      ('MAT-POLYBLUE', 'Polymer Granules (Blue)',      'CAT-RAW', 'Kilograms',  'Blue polymer granules.',               100),
      ('MAT-COPWIRE',  'Copper Wiring (Rolls)',        'CAT-CMP', 'Meters',     'Copper wiring in roll form.',          200),
      ('MAT-CIRCBRD',  'Circuit Boards (Model X)',     'CAT-SUB', 'Units',      'Model X circuit boards.',              50)
  `;

  // MaterialsPage table materials
  await sql`
    INSERT INTO materials (id, name, category_id, unit_of_measure, description, reorder_point) VALUES
      ('MAT-SS10',     'Steel Sheet 10Ga',            'CAT-RAW', 'Sheet',      'Steel sheet 10 gauge.',                100),
      ('MAT-CW16',     'Copper Wire 16AWG',           'CAT-RAW', 'Meter',      'Copper wire 16 AWG.',                  50),
      ('MAT-ALEXTP',   'Aluminum Extrusion X-Profile', 'CAT-CMP', 'Meter',     'Aluminum extrusion X-profile.',        50),
      ('MAT-M6SET',    'M6 Bolt & Nut Set',           'CAT-CMP', 'Set',        'M6 bolt and nut sets.',                200),
      ('MAT-CB21',     'Circuit Board v2.1',           'CAT-CMP', 'Unit',       'Circuit board version 2.1.',           50),
      ('MAT-POLYPEL',  'Polycarbonate Pellets',        'CAT-RAW', 'kg',         'Polycarbonate pellets.',               100),
      ('MAT-CBOXSM',   'Cardboard Box (Small)',        'CAT-PKG', 'Unit',       'Small cardboard shipping box.',        200)
  `;

  // MaterialDetailPage (Carbon Fiber Sheets)
  await sql`
    INSERT INTO materials (id, name, category_id, unit_of_measure, description, reorder_point) VALUES
      ('M-CFS-001',    'Carbon Fiber Sheets',         'CAT-COM', 'sq meters',  'High-strength, lightweight composite sheets used for structural applications and panels. Standard grade.', 50)
  `;

  // BatchDetailPage materials
  await sql`
    INSERT INTO materials (id, name, category_id, unit_of_measure, description, reorder_point) VALUES
      ('MAT-COFFEE',   'Organic Arabica Coffee Beans', 'CAT-RAW', 'kg',         'Premium organic arabica coffee beans.', 100),
      ('MAT-CHERRY',   'Raw Coffee Cherries',           'CAT-RAW', 'kg',         'Raw coffee cherries for processing.',  200),
      ('MAT-WATER',    'Water for Washing',             'CAT-RAW', 'L',          'Clean water for coffee washing.',      500)
  `;

  // TransactionDetailPage (TXN-123456) materials
  await sql`
    INSERT INTO materials (id, name, category_id, unit_of_measure, description, reorder_point) VALUES
      ('MAT-WIDGET',   'Widget Assembly Component X',  'CAT-CMP', 'Units',      'Widget assembly component.',           50),
      ('MAT-SCRAP',    'Scrap Material - Metal',        'CAT-RAW', 'Units',      'Metal scrap from production.',         0)
  `;

  // NewTransactionPage batch allocation materials
  await sql`
    INSERT INTO materials (id, name, category_id, unit_of_measure, description, reorder_point) VALUES
      ('MAT-FGX',      'FG-Product-X',                'CAT-FIN', 'Units',      'Finished goods product X.',            20),
      ('MAT-FGY',      'FG-Product-Y',                'CAT-FIN', 'Units',      'Finished goods product Y.',            20)
  `;

  // TransactionsPage materials
  await sql`
    INSERT INTO materials (id, name, category_id, unit_of_measure, description, reorder_point) VALUES
      ('MAT-STPL',     'Steel Plates',                'CAT-RAW', 'kg',         'Steel plates for fabrication.',        100),
      ('MAT-PLPEL',    'Plastic Pellets',             'CAT-RAW', 'kg',         'Plastic pellets for molding.',         100)
  `;

  // Titanium Rod for create test (NOT seeded - should not exist until user creates it)
  // 'Titanium Rod' is intentionally NOT added

  // Extra filler materials to reach 45 total for pagination tests on MaterialsPage
  // Currently we have 35 materials, need 10 more
  await sql`
    INSERT INTO materials (id, name, category_id, unit_of_measure, description, reorder_point) VALUES
      ('MAT-FILL-01', 'Nylon Fasteners',          'CAT-CMP', 'units',  'Nylon fastener components.',     50),
      ('MAT-FILL-02', 'Rubber Gaskets',            'CAT-CMP', 'units',  'Rubber gasket seals.',           30),
      ('MAT-FILL-03', 'Brass Fittings',            'CAT-CMP', 'units',  'Brass plumbing fittings.',       40),
      ('MAT-FILL-04', 'Silicone Tubing',           'CAT-RAW', 'm',      'Silicone tubing material.',      20),
      ('MAT-FILL-05', 'Glass Panels',              'CAT-RAW', 'sheets', 'Tempered glass panels.',         10),
      ('MAT-FILL-06', 'Foam Padding',              'CAT-PKG', 'sheets', 'Foam padding for packaging.',    50),
      ('MAT-FILL-07', 'Shrink Wrap',               'CAT-PKG', 'rolls',  'Shrink wrap for pallets.',       25),
      ('MAT-FILL-08', 'Pallet Strapping',          'CAT-PKG', 'rolls',  'Pallet strapping tape.',         30),
      ('MAT-FILL-09', 'LED Module A',              'CAT-SUB', 'units',  'LED lighting module type A.',    20),
      ('MAT-FILL-10', 'Motor Assembly B',           'CAT-SUB', 'units',  'Motor assembly type B.',         15),
      ('MAT-FILL-11', 'Zinc Coating Powder',        'CAT-RAW', 'kg',     'Zinc powder for coating.',       25)
  `;

  // =========================================================================
  // Batches
  // =========================================================================
  console.log("Seeding batches...");

  // Dashboard LowInventoryAlerts batches (to set stock levels)
  // Steel Bolts M6: 150 units in Main Inventory
  // Aluminum Sheets: 25 kg in Main Inventory
  // Copper Wire: 80 m in Main Inventory
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location) VALUES
      ('BATCH-BOLTS-01',  'MAT-BOLTS',   'ACC-MAIN-INV', 150,  'units', 'active', 'Warehouse A'),
      ('BATCH-ALUM-01',   'MAT-ALUM',    'ACC-MAIN-INV', 25,   'kg',    'active', 'Warehouse A'),
      ('BATCH-COPPER-01', 'MAT-COPPER',  'ACC-MAIN-INV', 80,   'm',     'active', 'Warehouse A')
  `;

  // Dashboard MaterialsCategoriesOverview batches
  // Raw Materials totals: Iron Rods 1200, Plastic Granules 800, Wood Planks 500
  // Plus existing: Steel Bolts M6 150, Aluminum Sheets 25, Copper Wire 80
  // Total distinct items in Raw Materials = 6 (Bolts, Alum, Copper, Iron, Plastic, Wood) + others
  // The test says "Raw Materials" has 450 items totaling 3200 units - these are aggregate totals
  // We need to match the per-material quantities exactly
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location) VALUES
      ('BATCH-IRON-01',    'MAT-IRON',    'ACC-MAIN-INV', 1200, 'units',   'active', 'Warehouse A'),
      ('BATCH-PLAST-01',   'MAT-PLASTIC', 'ACC-MAIN-INV', 800,  'kg',      'active', 'Warehouse A'),
      ('BATCH-WOOD-01',    'MAT-WOOD',    'ACC-MAIN-INV', 500,  'pieces',  'active', 'Warehouse A')
  `;

  // Finished Goods: Chair A 150, Table B 80, Shelf C 100
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location) VALUES
      ('BATCH-CHAIRA-01',  'MAT-CHAIRA',  'ACC-FIN-GOODS', 150, 'units', 'active', 'Warehouse B'),
      ('BATCH-TABLEB-01',  'MAT-TABLEB',  'ACC-FIN-GOODS', 80,  'units', 'active', 'Warehouse B'),
      ('BATCH-SHELFC-01',  'MAT-SHELFC',  'ACC-FIN-GOODS', 100, 'units', 'active', 'Warehouse B')
  `;

  // Packaging: Cardboard Boxes 500, Bubble Wrap 200, Tape Rolls 150
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location) VALUES
      ('BATCH-CARDBOX-01', 'MAT-CARDBOX', 'ACC-MAIN-INV', 500, 'units', 'active', 'Warehouse A'),
      ('BATCH-BUBBLE-01',  'MAT-BUBBLE',  'ACC-MAIN-INV', 200, 'm',     'active', 'Warehouse A'),
      ('BATCH-TAPE-01',    'MAT-TAPE',    'ACC-MAIN-INV', 150, 'rolls', 'active', 'Warehouse A')
  `;

  // AccountDetailPage (A-1024-INV) batches
  // Steel Sheets (3mm): 1250.0 total, 12 batches
  // Aluminum Extrusion A: 4500.0 total, 8 batches
  // Polymer Granules (Blue): 750.5 total, 15 batches
  // Copper Wiring (Rolls): 2100.0 total, 5 batches
  // Circuit Boards (Model X): 350 total, 20 batches

  // Steel Sheets (3mm) - 12 batches totaling 1250.0
  for (let i = 1; i <= 12; i++) {
    const qty = i <= 11 ? 104 : 106; // 11*104 + 106 = 1144 + 106 = 1250
    await sql`
      INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location)
      VALUES (${`BATCH-SS3MM-${String(i).padStart(2, "0")}`}, 'MAT-SS3MM', 'A-1024-INV', ${qty}, 'Sheets', 'active', 'Warehouse 2')
    `;
  }

  // Aluminum Extrusion A - 8 batches totaling 4500.0
  for (let i = 1; i <= 8; i++) {
    const qty = i <= 7 ? 562 : 566; // 7*562 + 566 = 3934 + 566 = 4500
    await sql`
      INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location)
      VALUES (${`BATCH-ALEXTA-${String(i).padStart(2, "0")}`}, 'MAT-ALEXTA', 'A-1024-INV', ${qty}, 'Meters', 'active', 'Warehouse 2')
    `;
  }

  // Polymer Granules (Blue) - 15 batches totaling 750.5
  for (let i = 1; i <= 15; i++) {
    const qty = i <= 14 ? 50 : 50.5; // 14*50 + 50.5 = 700 + 50.5 = 750.5
    await sql`
      INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location)
      VALUES (${`BATCH-POLYBLUE-${String(i).padStart(2, "0")}`}, 'MAT-POLYBLUE', 'A-1024-INV', ${qty}, 'Kilograms', 'active', 'Warehouse 2')
    `;
  }

  // Copper Wiring (Rolls) - 5 batches totaling 2100.0
  for (let i = 1; i <= 5; i++) {
    const qty = 420; // 5*420 = 2100
    await sql`
      INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location)
      VALUES (${`BATCH-COPWIRE-${String(i).padStart(2, "0")}`}, 'MAT-COPWIRE', 'A-1024-INV', ${qty}, 'Meters', 'active', 'Warehouse 2')
    `;
  }

  // Circuit Boards (Model X) - 20 batches totaling 350
  for (let i = 1; i <= 20; i++) {
    const qty = i <= 19 ? 17 : 27; // 19*17 + 27 = 323 + 27 = 350
    await sql`
      INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location)
      VALUES (${`BATCH-CIRCBRD-${String(i).padStart(2, "0")}`}, 'MAT-CIRCBRD', 'A-1024-INV', ${qty}, 'Units', 'active', 'Warehouse 2')
    `;
  }

  // MaterialDetailPage (Carbon Fiber Sheets M-CFS-001) batches
  // Warehouse A - Main Storage: 3 batches (B-2023-001: 500, B-2023-005: 700, plus one more for the 3rd)
  // Total in Warehouse A: 1200 sq m
  // Production Line B: 1 batch (B-2023-010: 450)
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location, created_at) VALUES
      ('B-2023-001', 'M-CFS-001', 'ACC-WAREHOUSE-A', 500, 'sq m', 'active', 'Warehouse A', '2023-10-15T10:00:00Z'),
      ('B-2023-005', 'M-CFS-001', 'ACC-WAREHOUSE-A', 700, 'sq m', 'active', 'Warehouse A', '2023-10-22T10:00:00Z'),
      ('B-2023-003', 'M-CFS-001', 'ACC-WAREHOUSE-A', 0,   'sq m', 'depleted', 'Warehouse A', '2023-10-18T10:00:00Z'),
      ('B-2023-010', 'M-CFS-001', 'ACC-PROD-B',      450, 'sq m', 'active', 'Production Line B', '2023-11-01T10:00:00Z')
  `;

  // BatchDetailPage (BATCH-12345) - Organic Arabica Coffee Beans
  // Material: Organic Arabica Coffee Beans, Account: Global Imports Inc., Status: Active
  // Quantity: 1500.00 kg, Location: Warehouse A Zone 4, Lot: LOT-2023-OCB
  // Expiration: 2024-10-27, Quality: Premium, Storage: Climate Controlled
  // Originating Transaction: TX-PROD-987, Created: 2023-10-27 10:30 AM
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location, lot_number, expiration_date, quality_grade, storage_condition, originating_transaction_id, created_at) VALUES
      ('BATCH-12345', 'MAT-COFFEE', 'ACC-GLOBAL-IMP', 1500.00, 'kg', 'active', 'Warehouse A, Zone 4', 'LOT-2023-OCB', '2024-10-27', 'Premium', 'Climate Controlled', 'TX-PROD-987', '2023-10-27T10:30:00Z')
  `;

  // Source batches for BATCH-12345 lineage
  // BATCH-11001: Raw Coffee Cherries, 1800.00 kg, Farm Co-op
  // BATCH-11002: Water for Washing, 5000.00 L, Facility Supplies
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location, created_at) VALUES
      ('BATCH-11001', 'MAT-CHERRY', 'ACC-FARM-COOP', 1800.00, 'kg', 'active', 'Farm Storage', '2023-10-20T08:00:00Z'),
      ('BATCH-11002', 'MAT-WATER',  'ACC-FAC-SUPP',  5000.00, 'L',  'active', 'Water Tank',   '2023-10-20T08:00:00Z')
  `;

  // Batches created by usage history transactions of BATCH-12345
  // TX-PACK-221 created BATCH-12401 and BATCH-12402
  // TX-ROAST-305 created BATCH-12500
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location, created_at) VALUES
      ('BATCH-12401', 'MAT-COFFEE', 'ACC-MAIN-INV',  250.00, 'kg', 'active', 'Packaging Area', '2023-11-05T14:20:00Z'),
      ('BATCH-12402', 'MAT-COFFEE', 'ACC-MAIN-INV',  250.00, 'kg', 'active', 'Packaging Area', '2023-11-05T14:20:00Z'),
      ('BATCH-12500', 'MAT-COFFEE', 'ACC-MAIN-INV',  800.00, 'kg', 'active', 'Roasting Area',  '2023-11-10T09:15:00Z')
  `;

  // TransactionDetailPage (TXN-123456) batches
  // Source batch: BATCH-RM-2023-A (in Warehouse A - Raw Materials = ACC-RAW-MAT-INV)
  // Created batches: BATCH-WIP-2023-Q4-001 (Widget Assembly Component X, 500 Units)
  //                  BATCH-SCRAP-2023-Q4-005 (Scrap Material - Metal, 15 Units)
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location, created_at) VALUES
      ('BATCH-RM-2023-A',          'MAT-WIDGET',  'ACC-RAW-MAT-INV', 0,      'Units', 'depleted', 'Warehouse A',         '2023-09-15T10:00:00Z'),
      ('BATCH-WIP-2023-Q4-001',    'MAT-WIDGET',  'ACC-WIP-PROD',    500.00, 'Units', 'active',   'Production Line B',   '2023-10-26T10:30:00Z'),
      ('BATCH-SCRAP-2023-Q4-005',  'MAT-SCRAP',   'ACC-SHRINKAGE',   15.00,  'Units', 'active',   'Scrap Yard',          '2023-10-26T10:30:00Z')
  `;

  // MaterialsPage stock batches for sort tests
  // M6 Bolt & Nut Set: 10500
  // Cardboard Box (Small): 5000
  // Polycarbonate Pellets: 2400
  // Steel Sheet 10Ga: 1250
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location) VALUES
      ('BATCH-SS10-01',    'MAT-SS10',    'ACC-MAIN-INV', 1250,  'Sheet', 'active', 'Warehouse A'),
      ('BATCH-CW16-01',   'MAT-CW16',    'ACC-MAIN-INV', 800,   'Meter', 'active', 'Warehouse A'),
      ('BATCH-ALEXTP-01', 'MAT-ALEXTP',  'ACC-MAIN-INV', 600,   'Meter', 'active', 'Warehouse A'),
      ('BATCH-M6SET-01',  'MAT-M6SET',   'ACC-MAIN-INV', 10500, 'Set',   'active', 'Warehouse A'),
      ('BATCH-CB21-01',   'MAT-CB21',    'ACC-MAIN-INV', 400,   'Unit',  'active', 'Warehouse A'),
      ('BATCH-POLYPEL-01','MAT-POLYPEL', 'ACC-MAIN-INV', 2400,  'kg',    'active', 'Warehouse A'),
      ('BATCH-CBOXSM-01', 'MAT-CBOXSM', 'ACC-MAIN-INV', 5000,  'Unit',  'active', 'Warehouse A')
  `;

  // Batches for TransactionsPage materials
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location) VALUES
      ('BATCH-STPL-01',  'MAT-STPL',   'ACC-RAW-MAT-INV', 500,  'kg', 'active', 'Warehouse A'),
      ('BATCH-PLPEL-01', 'MAT-PLPEL',  'ACC-RAW-MAT-INV', 300,  'kg', 'active', 'Warehouse A')
  `;

  // FG batches for NewTransactionPage
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location) VALUES
      ('BATCH-FGX-01', 'MAT-FGX', 'ACC-FIN-GOODS', 200, 'Units', 'active', 'Warehouse B'),
      ('BATCH-FGY-01', 'MAT-FGY', 'ACC-FIN-GOODS', 150, 'Units', 'active', 'Warehouse B')
  `;

  // Filler batches for extra materials
  await sql`
    INSERT INTO batches (id, material_id, account_id, quantity, unit, status, location) VALUES
      ('BATCH-FILL-01', 'MAT-FILL-01', 'ACC-MAIN-INV', 300,  'units',  'active', 'Warehouse A'),
      ('BATCH-FILL-02', 'MAT-FILL-02', 'ACC-MAIN-INV', 250,  'units',  'active', 'Warehouse A'),
      ('BATCH-FILL-03', 'MAT-FILL-03', 'ACC-MAIN-INV', 180,  'units',  'active', 'Warehouse A'),
      ('BATCH-FILL-04', 'MAT-FILL-04', 'ACC-MAIN-INV', 120,  'm',      'active', 'Warehouse A'),
      ('BATCH-FILL-05', 'MAT-FILL-05', 'ACC-MAIN-INV', 60,   'sheets', 'active', 'Warehouse A'),
      ('BATCH-FILL-06', 'MAT-FILL-06', 'ACC-MAIN-INV', 400,  'sheets', 'active', 'Warehouse A'),
      ('BATCH-FILL-07', 'MAT-FILL-07', 'ACC-MAIN-INV', 150,  'rolls',  'active', 'Warehouse A'),
      ('BATCH-FILL-08', 'MAT-FILL-08', 'ACC-MAIN-INV', 200,  'rolls',  'active', 'Warehouse A'),
      ('BATCH-FILL-09', 'MAT-FILL-09', 'ACC-MAIN-INV', 90,   'units',  'active', 'Warehouse A'),
      ('BATCH-FILL-10', 'MAT-FILL-10', 'ACC-MAIN-INV', 45,   'units',  'active', 'Warehouse A'),
      ('BATCH-FILL-11', 'MAT-FILL-11', 'ACC-MAIN-INV', 75,   'kg',     'active', 'Warehouse A')
  `;

  // =========================================================================
  // Transactions
  // =========================================================================
  console.log("Seeding transactions...");

  // Dashboard RecentTransactionsTable - 5 recent transactions
  // Row 1: Oct 25, 2023 — TRX-20231025-001 — Supplier A -> Warehouse — Steel Bolts M6: +500 units; Copper Wire: +200 m
  // Row 2: Oct 24, 2023 — TRX-20231024-012 — Warehouse -> Production — Aluminum Sheets: -50 kg; Plastic Granules: -100 kg
  // Row 3: Oct 24, 2023 — TRX-20231024-011 — Production -> Finished Goods — Chair A: +20 units; Table B: +10 units
  // Row 4: Oct 23, 2023 — TRX-20231023-005 — Warehouse -> Customer X — Chair A: -5 units
  // Row 5: Oct 23, 2023 — TRX-20231023-004 — Supplier B -> Warehouse — Wood Planks: +300 pieces
  await sql`
    INSERT INTO transactions (id, date, reference_id, description, transaction_type, status, creator, created_at) VALUES
      ('TRX-20231025-001', '2023-10-25', 'TRX-20231025-001', 'Purchase of steel bolts and copper wire from Supplier A',    'Purchase',  'Completed', 'System', '2023-10-25T09:00:00Z'),
      ('TRX-20231024-012', '2023-10-24', 'TRX-20231024-012', 'Transfer of aluminum sheets and plastic granules to production', 'Transfer', 'Completed', 'System', '2023-10-24T14:00:00Z'),
      ('TRX-20231024-011', '2023-10-24', 'TRX-20231024-011', 'Production output of chairs and tables',                      'Production', 'Completed', 'System', '2023-10-24T11:00:00Z'),
      ('TRX-20231023-005', '2023-10-23', 'TRX-20231023-005', 'Sale of chairs to Customer X',                                 'Consumption', 'Completed', 'System', '2023-10-23T16:00:00Z'),
      ('TRX-20231023-004', '2023-10-23', 'TRX-20231023-004', 'Purchase of wood planks from Supplier B',                      'Purchase',  'Completed', 'System', '2023-10-23T10:00:00Z')
  `;

  // MaterialDetailPage (Carbon Fiber Sheets) transactions
  // T-2310-015: Oct 15, 2023, Supplier X -> Warehouse A, B-2023-001, 500 sq m (Purchase)
  // T-2310-210: Oct 25, 2023, Supplier X -> Warehouse A, B-2023-005, 700 sq m (Purchase)
  // T-2311-567: Nov 05, 2023, Warehouse A -> Production Line B, B-2023-010, 450 sq m (Transfer)
  await sql`
    INSERT INTO transactions (id, date, reference_id, description, transaction_type, status, creator, created_at) VALUES
      ('T-2310-015', '2023-10-15', 'T-2310-015', 'Purchase of Carbon Fiber Sheets from Supplier X',   'Purchase',  'Completed', 'System', '2023-10-15T10:00:00Z'),
      ('T-2310-210', '2023-10-25', 'T-2310-210', 'Purchase of Carbon Fiber Sheets from Supplier X',   'Purchase',  'Completed', 'System', '2023-10-25T10:00:00Z'),
      ('T-2311-567', '2023-11-05', 'T-2311-567', 'Transfer of Carbon Fiber Sheets to Production',     'Transfer',  'Completed', 'System', '2023-11-05T10:00:00Z')
  `;

  // BatchDetailPage (BATCH-12345) transactions
  // TX-PROD-987: Production (In), 2023-10-27 10:30, 1500.00 kg — created BATCH-12345
  // TX-PACK-221: Packaging (Out), 2023-11-05 14:20, 500.00 kg — created BATCH-12401, BATCH-12402
  // TX-ROAST-305: Roasting (Out), 2023-11-10 09:15, 800.00 kg — created BATCH-12500
  // TX-ADJ-054: Inventory Adjustment (Out), 2023-11-12 11:00, 5.00 kg — no batches created
  await sql`
    INSERT INTO transactions (id, date, reference_id, description, transaction_type, status, creator, created_at) VALUES
      ('TX-PROD-987',  '2023-10-27', 'TX-PROD-987',  'Washing & Processing',           'Production',            'Completed', 'System', '2023-10-27T10:30:00Z'),
      ('TX-PACK-221',  '2023-11-05', 'TX-PACK-221',  'Packaging coffee beans',          'Packaging',             'Completed', 'System', '2023-11-05T14:20:00Z'),
      ('TX-ROAST-305', '2023-11-10', 'TX-ROAST-305', 'Roasting coffee beans',           'Roasting',              'Completed', 'System', '2023-11-10T09:15:00Z'),
      ('TX-ADJ-054',   '2023-11-12', 'TX-ADJ-054',   'Inventory adjustment for coffee', 'Inventory Adjustment',  'Completed', 'System', '2023-11-12T11:00:00Z')
  `;

  // TransactionDetailPage (TXN-123456)
  // Date: Oct 26, 2023, Creator: Jane Doe, Description: Q4 Inventory Adjustment for Raw Materials
  // Basic Info: date 10/26/2023, reference REF-Q4-ADJ-001, description: Adjustment for end-of-quarter physical count discrepancy in Warehouse A.
  // Type: Inventory Adjustment, Status: Completed
  // Transfers: (1) 500 Units from Warehouse A (ACC-RAW-MAT-INV) to Production Line B - WIP (ACC-WIP-PROD), source batch BATCH-RM-2023-A
  //            (2) 15 Units from Inventory Shrinkage Expense (ACC-SHRINKAGE) to Warehouse A (ACC-RAW-MAT-INV), no source batch
  // Total debits: 515, total credits: 515
  // Batches created: BATCH-WIP-2023-Q4-001 (Widget Assembly Component X, 500), BATCH-SCRAP-2023-Q4-005 (Scrap Material - Metal, 15)
  await sql`
    INSERT INTO transactions (id, date, reference_id, description, transaction_type, status, creator, created_at) VALUES
      ('TXN-123456', '2023-10-26', 'REF-Q4-ADJ-001', 'Adjustment for end-of-quarter physical count discrepancy in Warehouse A.', 'Inventory Adjustment', 'Completed', 'Jane Doe', '2023-10-26T10:30:00Z')
  `;

  // TransactionsPage transactions - need enough for 145 total for pagination
  // TXN-100245: Purchase of Steel Plates from Supplier A
  // TXN-100244: Consumption for Production Run #45
  // TXN-100243: Finished Goods Transfer to Warehouse
  await sql`
    INSERT INTO transactions (id, date, reference_id, description, transaction_type, status, creator, created_at) VALUES
      ('TXN-100245', '2023-10-27', 'TXN-100245', 'Purchase of Steel Plates from Supplier A',       'Purchase',     'Completed', 'System', '2023-10-27T10:00:00Z'),
      ('TXN-100244', '2023-10-26', 'TXN-100244', 'Consumption for Production Run #45',              'Consumption',  'Completed', 'System', '2023-10-26T09:00:00Z'),
      ('TXN-100243', '2023-10-25', 'TXN-100243', 'Finished Goods Transfer to Warehouse',            'Transfer',     'Completed', 'System', '2023-10-25T08:00:00Z')
  `;

  // Utility bill payment (no materials) for N/A test
  await sql`
    INSERT INTO transactions (id, date, reference_id, description, transaction_type, status, creator, created_at) VALUES
      ('TXN-100242', '2023-10-24', 'TXN-100242', 'Utility Bill Payment',                            'Transfer',     'Completed', 'System', '2023-10-24T07:00:00Z')
  `;

  // Generate filler transactions to reach ~145 total
  // We currently have: 5 (dashboard) + 3 (material detail) + 4 (batch detail) + 1 (TXN-123456) + 4 (transactions page) = 17
  // Need 128 more
  for (let i = 1; i <= 128; i++) {
    const dayOffset = Math.floor(i / 3);
    const dateStr = new Date(2023, 9, 27 - dayOffset).toISOString().split("T")[0]; // Start from Oct 27, go backwards
    const types = ["Purchase", "Consumption", "Transfer", "Inventory Adjustment", "Production"];
    const txnType = types[i % types.length];
    const txnId = `TXN-FILL-${String(i).padStart(3, "0")}`;
    await sql`
      INSERT INTO transactions (id, date, reference_id, description, transaction_type, status, creator, created_at)
      VALUES (${txnId}, ${dateStr}, ${txnId}, ${"Auto-generated transaction " + i}, ${txnType}, 'Completed', 'System', ${dateStr + "T12:00:00Z"})
    `;
  }

  // =========================================================================
  // Transaction Transfers
  // =========================================================================
  console.log("Seeding transaction transfers...");

  // Dashboard TRX-20231025-001: Supplier A -> Warehouse, Steel Bolts M6: +500 units, Copper Wire: +200 m
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit) VALUES
      ('TRX-20231025-001', 'ACC-SUPPLIER-X', 'ACC-MAIN-INV', 'MAT-BOLTS',  500, 'units'),
      ('TRX-20231025-001', 'ACC-SUPPLIER-X', 'ACC-MAIN-INV', 'MAT-COPPER', 200, 'm')
  `;

  // Dashboard TRX-20231024-012: Warehouse -> Production, Aluminum Sheets: -50 kg, Plastic Granules: -100 kg
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit) VALUES
      ('TRX-20231024-012', 'ACC-MAIN-INV', 'ACC-PROD-B', 'MAT-ALUM',    50,  'kg'),
      ('TRX-20231024-012', 'ACC-MAIN-INV', 'ACC-PROD-B', 'MAT-PLASTIC', 100, 'kg')
  `;

  // Dashboard TRX-20231024-011: Production -> Finished Goods, Chair A: +20 units, Table B: +10 units
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit) VALUES
      ('TRX-20231024-011', 'ACC-PROD-B',   'ACC-FIN-GOODS', 'MAT-CHAIRA', 20, 'units'),
      ('TRX-20231024-011', 'ACC-PROD-B',   'ACC-FIN-GOODS', 'MAT-TABLEB', 10, 'units')
  `;

  // Dashboard TRX-20231023-005: Warehouse -> Customer X, Chair A: -5 units
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit) VALUES
      ('TRX-20231023-005', 'ACC-FIN-GOODS', 'ACC-CUSTOMER-X', 'MAT-CHAIRA', 5, 'units')
  `;

  // Dashboard TRX-20231023-004: Supplier B -> Warehouse, Wood Planks: +300 pieces
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit) VALUES
      ('TRX-20231023-004', 'ACC-SUPPLIER-B', 'ACC-MAIN-INV', 'MAT-WOOD', 300, 'pieces')
  `;

  // MaterialDetailPage: T-2310-015 — Supplier X -> Warehouse A, Carbon Fiber Sheets, 500 sq m
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit, source_batch_id) VALUES
      ('T-2310-015', 'ACC-SUPPLIER-X', 'ACC-WAREHOUSE-A', 'M-CFS-001', 500, 'sq m', NULL)
  `;

  // MaterialDetailPage: T-2310-210 — Supplier X -> Warehouse A, Carbon Fiber Sheets, 700 sq m
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit, source_batch_id) VALUES
      ('T-2310-210', 'ACC-SUPPLIER-X', 'ACC-WAREHOUSE-A', 'M-CFS-001', 700, 'sq m', NULL)
  `;

  // MaterialDetailPage: T-2311-567 — Warehouse A -> Production Line B, Carbon Fiber Sheets, 450 sq m
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit, source_batch_id) VALUES
      ('T-2311-567', 'ACC-WAREHOUSE-A', 'ACC-PROD-B', 'M-CFS-001', 450, 'sq m', NULL)
  `;

  // BatchDetailPage: TX-PROD-987 — Production (In), created BATCH-12345 from BATCH-11001 and BATCH-11002
  // This represents input batches being consumed and output batch being created
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit, source_batch_id) VALUES
      ('TX-PROD-987', 'ACC-FARM-COOP', 'ACC-GLOBAL-IMP', 'MAT-CHERRY', 1800.00, 'kg', 'BATCH-11001'),
      ('TX-PROD-987', 'ACC-FAC-SUPP',  'ACC-GLOBAL-IMP', 'MAT-WATER',  5000.00, 'L',  'BATCH-11002'),
      ('TX-PROD-987', NULL,            'ACC-GLOBAL-IMP', 'MAT-COFFEE', 1500.00, 'kg', NULL)
  `;

  // TX-PACK-221: Packaging (Out), 500.00 kg from BATCH-12345
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit, source_batch_id) VALUES
      ('TX-PACK-221', 'ACC-GLOBAL-IMP', 'ACC-MAIN-INV', 'MAT-COFFEE', 500.00, 'kg', 'BATCH-12345')
  `;

  // TX-ROAST-305: Roasting (Out), 800.00 kg from BATCH-12345
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit, source_batch_id) VALUES
      ('TX-ROAST-305', 'ACC-GLOBAL-IMP', 'ACC-MAIN-INV', 'MAT-COFFEE', 800.00, 'kg', 'BATCH-12345')
  `;

  // TX-ADJ-054: Inventory Adjustment (Out), 5.00 kg from BATCH-12345
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit, source_batch_id) VALUES
      ('TX-ADJ-054', 'ACC-GLOBAL-IMP', 'ACC-SHRINKAGE', 'MAT-COFFEE', 5.00, 'kg', 'BATCH-12345')
  `;

  // TransactionDetailPage (TXN-123456) transfers
  // Transfer 1: 500 Units from Warehouse A - Raw Materials (ACC-RAW-MAT-INV) to Production Line B - WIP (ACC-WIP-PROD), source batch BATCH-RM-2023-A
  // Transfer 2: 15 Units from Inventory Shrinkage Expense (ACC-SHRINKAGE) to Warehouse A - Raw Materials (ACC-RAW-MAT-INV), no source batch
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit, source_batch_id) VALUES
      ('TXN-123456', 'ACC-RAW-MAT-INV', 'ACC-WIP-PROD',    'MAT-WIDGET', 500.00, 'Units', 'BATCH-RM-2023-A'),
      ('TXN-123456', 'ACC-SHRINKAGE',   'ACC-RAW-MAT-INV', 'MAT-SCRAP',  15.00,  'Units', NULL)
  `;

  // TransactionsPage: TXN-100245 (Purchase of Steel Plates from Supplier A, 500 kg @ $2.50/kg)
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit) VALUES
      ('TXN-100245', 'ACC-SUPPLIER-X', 'ACC-RAW-MAT-INV', 'MAT-STPL', 500, 'kg')
  `;

  // TransactionsPage: TXN-100244 (Consumption for Production Run #45 - Steel Plates and Plastic Pellets)
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit) VALUES
      ('TXN-100244', 'ACC-RAW-MAT-INV', 'ACC-WIP-PROD', 'MAT-STPL',  120, 'kg'),
      ('TXN-100244', 'ACC-RAW-MAT-INV', 'ACC-WIP-PROD', 'MAT-PLPEL', 30,  'kg')
  `;

  // TransactionsPage: TXN-100243 (Finished Goods Transfer)
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit) VALUES
      ('TXN-100243', 'ACC-WIP-PROD', 'ACC-FIN-GOODS', 'MAT-FGX', 100, 'Units')
  `;

  // TransactionsPage: TXN-100242 (Utility Bill Payment - no materials, $350 transfer)
  await sql`
    INSERT INTO transaction_transfers (transaction_id, source_account_id, destination_account_id, material_id, amount, unit) VALUES
      ('TXN-100242', 'ACC-PURCHASES', 'ACC-PAYABLE', NULL, 350, 'USD')
  `;

  // =========================================================================
  // Transaction Batches Created
  // =========================================================================
  console.log("Seeding transaction batches created...");

  // TX-PROD-987 created BATCH-12345
  await sql`
    INSERT INTO transaction_batches_created (transaction_id, batch_id) VALUES
      ('TX-PROD-987', 'BATCH-12345')
  `;

  // TX-PACK-221 created BATCH-12401 and BATCH-12402
  await sql`
    INSERT INTO transaction_batches_created (transaction_id, batch_id) VALUES
      ('TX-PACK-221', 'BATCH-12401'),
      ('TX-PACK-221', 'BATCH-12402')
  `;

  // TX-ROAST-305 created BATCH-12500
  await sql`
    INSERT INTO transaction_batches_created (transaction_id, batch_id) VALUES
      ('TX-ROAST-305', 'BATCH-12500')
  `;

  // TXN-123456 created BATCH-WIP-2023-Q4-001 and BATCH-SCRAP-2023-Q4-005
  await sql`
    INSERT INTO transaction_batches_created (transaction_id, batch_id) VALUES
      ('TXN-123456', 'BATCH-WIP-2023-Q4-001'),
      ('TXN-123456', 'BATCH-SCRAP-2023-Q4-005')
  `;

  // MaterialDetailPage: T-2310-015 created B-2023-001
  await sql`
    INSERT INTO transaction_batches_created (transaction_id, batch_id) VALUES
      ('T-2310-015', 'B-2023-001')
  `;

  // MaterialDetailPage: T-2310-210 created B-2023-005
  await sql`
    INSERT INTO transaction_batches_created (transaction_id, batch_id) VALUES
      ('T-2310-210', 'B-2023-005')
  `;

  // MaterialDetailPage: T-2311-567 created B-2023-010
  await sql`
    INSERT INTO transaction_batches_created (transaction_id, batch_id) VALUES
      ('T-2311-567', 'B-2023-010')
  `;

  // =========================================================================
  // Batch Lineage
  // =========================================================================
  console.log("Seeding batch lineage...");

  // BATCH-12345 was created from BATCH-11001 and BATCH-11002
  await sql`
    INSERT INTO batch_lineage (created_batch_id, source_batch_id) VALUES
      ('BATCH-12345', 'BATCH-11001'),
      ('BATCH-12345', 'BATCH-11002')
  `;

  // BATCH-12401 and BATCH-12402 sourced from BATCH-12345
  await sql`
    INSERT INTO batch_lineage (created_batch_id, source_batch_id) VALUES
      ('BATCH-12401', 'BATCH-12345'),
      ('BATCH-12402', 'BATCH-12345')
  `;

  // BATCH-12500 sourced from BATCH-12345
  await sql`
    INSERT INTO batch_lineage (created_batch_id, source_batch_id) VALUES
      ('BATCH-12500', 'BATCH-12345')
  `;

  // BATCH-WIP-2023-Q4-001 sourced from BATCH-RM-2023-A
  await sql`
    INSERT INTO batch_lineage (created_batch_id, source_batch_id) VALUES
      ('BATCH-WIP-2023-Q4-001', 'BATCH-RM-2023-A')
  `;

  console.log("Seed data complete!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
