import { neon } from "@neondatabase/serverless";

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Usage: npx tsx scripts/seed-db.ts <DATABASE_URL>");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function seed() {
  // Clear existing data in dependency order (children before parents)
  await sql`DELETE FROM run_equipment`;
  await sql`DELETE FROM run_forecasts`;
  await sql`DELETE FROM production_runs`;
  await sql`DELETE FROM recipe_equipment`;
  await sql`DELETE FROM recipe_products`;
  await sql`DELETE FROM recipe_materials`;
  await sql`DELETE FROM recipes`;
  await sql`DELETE FROM equipment_notes`;
  await sql`DELETE FROM equipment`;

  // ---- Equipment ----
  const equipmentRows = await sql`
    INSERT INTO equipment (name, description, available_units, status, model, serial_number, location, manufacturer, installation_date)
    VALUES
      ('Industrial Mixer', 'Heavy-duty mixer for blending raw materials', 3, 'Operational', 'MX-5000', 'SN-MX-001', 'Building A, Bay 1', 'MixTech Industries', '2024-03-15'),
      ('Packaging Line', 'Automated packaging and labeling line', 2, 'Operational', 'PK-3200', 'SN-PK-001', 'Building B, Bay 3', 'PackPro Systems', '2023-11-20'),
      ('Conveyor Belt', 'Main production floor conveyor system', 4, 'Operational', 'CB-1200', 'SN-CB-001', 'Building A, Main Floor', 'ConveyAll Corp', '2023-06-10'),
      ('Heat Press', 'Industrial heat press for molding operations', 2, 'Operational', 'HP-800', 'SN-HP-001', 'Building A, Bay 2', 'ThermoForge Ltd', '2024-01-08'),
      ('CNC Router', 'Computer-controlled cutting and shaping machine', 1, 'Maintenance', 'CNC-4500', 'SN-CNC-001', 'Building C, Workshop', 'PrecisionCut Inc', '2022-09-25'),
      ('Quality Scanner', 'Optical inspection and quality control scanner', 2, 'Operational', 'QS-200', 'SN-QS-001', 'Building B, QC Area', 'VisionTech', '2024-06-01')
    RETURNING id, name
  `;

  const equip: Record<string, string> = {};
  for (const row of equipmentRows) {
    equip[row.name as string] = row.id as string;
  }

  // ---- Equipment Notes ----
  await sql`
    INSERT INTO equipment_notes (equipment_id, author_name, author_role, text)
    VALUES
      (${equip["CNC Router"]}, 'Mike Thompson', 'Maintenance Tech', 'Spindle bearing replacement scheduled. Parts on order, expected delivery Feb 28.'),
      (${equip["CNC Router"]}, 'Sarah Chen', 'Floor Supervisor', 'Noticed unusual vibration during last run. Flagged for maintenance review.'),
      (${equip["Industrial Mixer"]}, 'James Wilson', 'Operator', 'Calibrated speed settings for new granola recipe. Optimal at 120 RPM for 8 minutes.'),
      (${equip["Quality Scanner"]}, 'Lisa Park', 'QC Manager', 'Updated firmware to v3.2. Detection accuracy improved for micro-defects.')
  `;

  // ---- Recipes ----
  const recipeRows = await sql`
    INSERT INTO recipes (name, product, version, status, description, instructions)
    VALUES
      ('Organic Granola Mix', 'Granola', '2.1', 'Active', 'Premium organic granola with dried fruits and nuts', 'Step 1: Combine oats, nuts, and seeds in mixer at low speed for 2 min.\nStep 2: Add honey and oil blend, mix at medium speed for 5 min.\nStep 3: Spread on trays and bake at 150°C for 25 min.\nStep 4: Cool, add dried fruits, and package.'),
      ('Protein Energy Bar', 'Energy Bar', '1.3', 'Active', 'High-protein energy bar with chocolate coating', 'Step 1: Mix protein powder, oat flour, and binding agents.\nStep 2: Press mixture into bar molds using heat press.\nStep 3: Apply chocolate coating.\nStep 4: Cool, wrap, and package.'),
      ('Fruit Preserve - Strawberry', 'Strawberry Jam', '3.0', 'Active', 'All-natural strawberry preserve with pectin', 'Step 1: Wash and hull strawberries.\nStep 2: Cook with sugar and pectin in industrial mixer.\nStep 3: Fill jars on packaging line.\nStep 4: Seal and label.'),
      ('Trail Mix Classic', 'Trail Mix', '1.0', 'Draft', 'Classic trail mix blend with peanuts, raisins, and chocolate chips', 'Step 1: Measure and weigh all components.\nStep 2: Combine in mixer at low speed for 3 min.\nStep 3: Quality check for even distribution.\nStep 4: Package in bags.'),
      ('Almond Butter Smooth', 'Almond Butter', '1.5', 'Archived', 'Creamy almond butter, no additives', ''),
      ('Honey Roasted Peanuts', 'Roasted Peanuts', '1.0', 'Active', 'Sweet and savory honey roasted peanuts', 'Step 1: Blanch and dry raw peanuts.\nStep 2: Toss with honey glaze.\nStep 3: Roast at 170°C for 15 min.\nStep 4: Cool and package.'),
      ('Cashew Butter Creamy', 'Cashew Butter', '2.0', 'Active', 'Ultra-smooth cashew butter', 'Step 1: Roast cashews at 150°C for 10 min.\nStep 2: Grind in stages until creamy.\nStep 3: Add coconut oil and blend.\nStep 4: Jar and seal.'),
      ('Yogurt Bark Bites', 'Yogurt Bark', '2.0.1', 'Draft', 'Frozen yogurt bark with fruit toppings', 'Step 1: Spread yogurt on lined trays.\nStep 2: Add berry toppings.\nStep 3: Freeze for 4 hours.\nStep 4: Break into pieces and package.'),
      ('Coconut Chips Toasted', 'Coconut Chips', '1.0', 'Active', 'Lightly sweetened toasted coconut chips', 'Step 1: Slice coconut into thin chips.\nStep 2: Toss with sugar solution.\nStep 3: Toast at 160°C for 8 min.\nStep 4: Cool and package.'),
      ('Dried Mango Slices', 'Dried Mango', '1.2', 'Active', 'Premium dried mango slices', 'Step 1: Peel and slice fresh mangoes.\nStep 2: Arrange on dehydrator trays.\nStep 3: Dehydrate at 57°C for 12 hours.\nStep 4: Package in sealed bags.'),
      ('Mixed Seed Brittle', 'Seed Brittle', '1.0', 'Active', 'Crunchy mixed seed brittle with honey', ''),
      ('Pumpkin Spice Blend', 'Spice Blend', '1.4', 'Archived', 'Seasonal pumpkin spice blend', 'Step 1: Measure cinnamon, nutmeg, ginger, and cloves.\nStep 2: Blend in mixer at low speed.\nStep 3: Sift to remove clumps.\nStep 4: Package in jars.')
    RETURNING id, name
  `;

  const recipe: Record<string, string> = {};
  for (const row of recipeRows) {
    recipe[row.name as string] = row.id as string;
  }

  // ---- Recipe Materials ----
  await sql`
    INSERT INTO recipe_materials (recipe_id, material_name, quantity, unit)
    VALUES
      (${recipe["Organic Granola Mix"]}, 'Rolled Oats', 50.00, 'kg'),
      (${recipe["Organic Granola Mix"]}, 'Honey', 10.00, 'kg'),
      (${recipe["Organic Granola Mix"]}, 'Sunflower Oil', 5.00, 'L'),
      (${recipe["Organic Granola Mix"]}, 'Almonds', 8.00, 'kg'),
      (${recipe["Organic Granola Mix"]}, 'Dried Cranberries', 6.00, 'kg'),
      (${recipe["Protein Energy Bar"]}, 'Whey Protein Powder', 20.00, 'kg'),
      (${recipe["Protein Energy Bar"]}, 'Oat Flour', 15.00, 'kg'),
      (${recipe["Protein Energy Bar"]}, 'Chocolate Coating', 8.00, 'kg'),
      (${recipe["Protein Energy Bar"]}, 'Honey', 4.00, 'kg'),
      (${recipe["Fruit Preserve - Strawberry"]}, 'Strawberries', 40.00, 'kg'),
      (${recipe["Fruit Preserve - Strawberry"]}, 'Cane Sugar', 20.00, 'kg'),
      (${recipe["Fruit Preserve - Strawberry"]}, 'Pectin', 0.50, 'kg'),
      (${recipe["Trail Mix Classic"]}, 'Peanuts', 15.00, 'kg'),
      (${recipe["Trail Mix Classic"]}, 'Raisins', 10.00, 'kg'),
      (${recipe["Trail Mix Classic"]}, 'Chocolate Chips', 8.00, 'kg'),
      (${recipe["Trail Mix Classic"]}, 'Sunflower Seeds', 5.00, 'kg'),
      (${recipe["Honey Roasted Peanuts"]}, 'Raw Peanuts', 30.00, 'kg'),
      (${recipe["Honey Roasted Peanuts"]}, 'Honey', 5.00, 'kg'),
      (${recipe["Honey Roasted Peanuts"]}, 'Salt', 0.50, 'kg'),
      (${recipe["Cashew Butter Creamy"]}, 'Raw Cashews', 25.00, 'kg'),
      (${recipe["Cashew Butter Creamy"]}, 'Coconut Oil', 2.00, 'L'),
      (${recipe["Yogurt Bark Bites"]}, 'Greek Yogurt', 20.00, 'kg'),
      (${recipe["Yogurt Bark Bites"]}, 'Mixed Berries', 5.00, 'kg'),
      (${recipe["Coconut Chips Toasted"]}, 'Raw Coconut', 15.00, 'kg'),
      (${recipe["Coconut Chips Toasted"]}, 'Cane Sugar', 2.00, 'kg'),
      (${recipe["Dried Mango Slices"]}, 'Fresh Mangoes', 40.00, 'kg'),
      (${recipe["Mixed Seed Brittle"]}, 'Sunflower Seeds', 10.00, 'kg'),
      (${recipe["Mixed Seed Brittle"]}, 'Pumpkin Seeds', 8.00, 'kg'),
      (${recipe["Mixed Seed Brittle"]}, 'Honey', 5.00, 'kg'),
      (${recipe["Pumpkin Spice Blend"]}, 'Cinnamon', 3.00, 'kg'),
      (${recipe["Pumpkin Spice Blend"]}, 'Nutmeg', 1.00, 'kg'),
      (${recipe["Pumpkin Spice Blend"]}, 'Ginger Powder', 1.50, 'kg')
  `;

  // ---- Recipe Products ----
  await sql`
    INSERT INTO recipe_products (recipe_id, product_name, amount)
    VALUES
      (${recipe["Organic Granola Mix"]}, 'Granola 500g Bag', '158 bags'),
      (${recipe["Protein Energy Bar"]}, 'Protein Bar 60g', '783 bars'),
      (${recipe["Fruit Preserve - Strawberry"]}, 'Strawberry Jam 340g Jar', '176 jars'),
      (${recipe["Trail Mix Classic"]}, 'Trail Mix 200g Bag', '190 bags'),
      (${recipe["Almond Butter Smooth"]}, 'Almond Butter 250g Jar', '120 jars'),
      (${recipe["Honey Roasted Peanuts"]}, 'Roasted Peanuts 250g Bag', '140 bags'),
      (${recipe["Cashew Butter Creamy"]}, 'Cashew Butter 250g Jar', '108 jars'),
      (${recipe["Yogurt Bark Bites"]}, 'Yogurt Bark 150g Pack', '166 packs'),
      (${recipe["Coconut Chips Toasted"]}, 'Coconut Chips 100g Bag', '170 bags'),
      (${recipe["Dried Mango Slices"]}, 'Dried Mango 200g Bag', '200 bags'),
      (${recipe["Mixed Seed Brittle"]}, 'Seed Brittle 180g Bar', '127 bars'),
      (${recipe["Pumpkin Spice Blend"]}, 'Spice Blend 50g Jar', '110 jars')
  `;

  // ---- Recipe Equipment ----
  await sql`
    INSERT INTO recipe_equipment (recipe_id, equipment_id)
    VALUES
      (${recipe["Organic Granola Mix"]}, ${equip["Industrial Mixer"]}),
      (${recipe["Organic Granola Mix"]}, ${equip["Packaging Line"]}),
      (${recipe["Organic Granola Mix"]}, ${equip["Quality Scanner"]}),
      (${recipe["Protein Energy Bar"]}, ${equip["Industrial Mixer"]}),
      (${recipe["Protein Energy Bar"]}, ${equip["Heat Press"]}),
      (${recipe["Protein Energy Bar"]}, ${equip["Packaging Line"]}),
      (${recipe["Fruit Preserve - Strawberry"]}, ${equip["Industrial Mixer"]}),
      (${recipe["Fruit Preserve - Strawberry"]}, ${equip["Packaging Line"]}),
      (${recipe["Trail Mix Classic"]}, ${equip["Industrial Mixer"]}),
      (${recipe["Trail Mix Classic"]}, ${equip["Packaging Line"]}),
      (${recipe["Honey Roasted Peanuts"]}, ${equip["Industrial Mixer"]}),
      (${recipe["Honey Roasted Peanuts"]}, ${equip["Packaging Line"]}),
      (${recipe["Cashew Butter Creamy"]}, ${equip["Industrial Mixer"]}),
      (${recipe["Cashew Butter Creamy"]}, ${equip["Packaging Line"]}),
      (${recipe["Yogurt Bark Bites"]}, ${equip["Packaging Line"]}),
      (${recipe["Coconut Chips Toasted"]}, ${equip["Packaging Line"]}),
      (${recipe["Dried Mango Slices"]}, ${equip["Packaging Line"]}),
      (${recipe["Mixed Seed Brittle"]}, ${equip["Industrial Mixer"]}),
      (${recipe["Mixed Seed Brittle"]}, ${equip["Packaging Line"]}),
      (${recipe["Pumpkin Spice Blend"]}, ${equip["Industrial Mixer"]})
  `;

  // ---- Production Runs ----
  const runRows = await sql`
    INSERT INTO production_runs (recipe_id, start_date, end_date, planned_quantity, unit, status, notes)
    VALUES
      (${recipe["Organic Granola Mix"]}, '2026-02-24T08:00:00Z', '2026-02-24T16:00:00Z', 500, 'kg', 'Completed', 'Monthly granola production batch completed on schedule.'),
      (${recipe["Protein Energy Bar"]}, '2026-02-26T07:00:00Z', '2026-02-26T15:00:00Z', 300, 'kg', 'Scheduled', 'Regular energy bar production run.'),
      (${recipe["Fruit Preserve - Strawberry"]}, '2026-02-27T06:00:00Z', '2026-02-27T14:00:00Z', 400, 'kg', 'Confirmed', 'Strawberry shipment confirmed for Feb 26. Ready to proceed.'),
      (${recipe["Organic Granola Mix"]}, '2026-03-03T08:00:00Z', '2026-03-03T16:00:00Z', 600, 'kg', 'Scheduled', 'Increased quantity for spring demand.'),
      (${recipe["Protein Energy Bar"]}, '2026-03-10T07:00:00Z', '2026-03-10T15:00:00Z', 250, 'kg', 'Material Shortage', 'Waiting on whey protein delivery. Expected March 7.'),
      (${recipe["Trail Mix Classic"]}, '2026-03-15T08:00:00Z', '2026-03-15T14:00:00Z', 200, 'kg', 'Pending Approval', 'First production run for new trail mix recipe. Needs QA sign-off.')
    RETURNING id, notes
  `;

  // Map runs by index for reference
  const runIds = runRows.map((r) => r.id as string);

  // ---- Run Forecasts ----
  await sql`
    INSERT INTO run_forecasts (run_id, material_name, required_amount, forecast_available, unit, pending_delivery)
    VALUES
      (${runIds[1]}, 'Whey Protein Powder', 20.00, 25.00, 'kg', ''),
      (${runIds[1]}, 'Oat Flour', 15.00, 40.00, 'kg', ''),
      (${runIds[1]}, 'Chocolate Coating', 8.00, 12.00, 'kg', ''),
      (${runIds[1]}, 'Honey', 4.00, 18.00, 'kg', ''),
      (${runIds[2]}, 'Strawberries', 40.00, 45.00, 'kg', 'PO-2026-045 arriving Feb 26'),
      (${runIds[2]}, 'Cane Sugar', 20.00, 60.00, 'kg', ''),
      (${runIds[2]}, 'Pectin', 0.50, 2.00, 'kg', ''),
      (${runIds[3]}, 'Rolled Oats', 60.00, 80.00, 'kg', ''),
      (${runIds[3]}, 'Honey', 12.00, 18.00, 'kg', ''),
      (${runIds[3]}, 'Sunflower Oil', 6.00, 10.00, 'L', ''),
      (${runIds[3]}, 'Almonds', 9.60, 5.00, 'kg', 'PO-2026-052 arriving March 1'),
      (${runIds[3]}, 'Dried Cranberries', 7.20, 8.00, 'kg', ''),
      (${runIds[4]}, 'Whey Protein Powder', 16.67, 5.00, 'kg', 'PO-2026-060 arriving March 7'),
      (${runIds[4]}, 'Oat Flour', 12.50, 25.00, 'kg', ''),
      (${runIds[4]}, 'Chocolate Coating', 6.67, 4.00, 'kg', 'PO-2026-061 arriving March 8'),
      (${runIds[4]}, 'Honey', 3.33, 6.00, 'kg', '')
  `;

  // ---- Run Equipment ----
  await sql`
    INSERT INTO run_equipment (run_id, equipment_id, status, notes)
    VALUES
      (${runIds[1]}, ${equip["Industrial Mixer"]}, 'Reserved', ''),
      (${runIds[1]}, ${equip["Heat Press"]}, 'Reserved', ''),
      (${runIds[1]}, ${equip["Packaging Line"]}, 'Reserved', ''),
      (${runIds[2]}, ${equip["Industrial Mixer"]}, 'Reserved', ''),
      (${runIds[2]}, ${equip["Packaging Line"]}, 'Reserved', ''),
      (${runIds[3]}, ${equip["Industrial Mixer"]}, 'Reserved', ''),
      (${runIds[3]}, ${equip["Packaging Line"]}, 'Reserved', ''),
      (${runIds[3]}, ${equip["Quality Scanner"]}, 'Reserved', ''),
      (${runIds[4]}, ${equip["Industrial Mixer"]}, 'Unavailable', 'Dependent on CNC Router maintenance completion'),
      (${runIds[4]}, ${equip["Heat Press"]}, 'Reserved', ''),
      (${runIds[4]}, ${equip["Packaging Line"]}, 'Reserved', ''),
      (${runIds[5]}, ${equip["Industrial Mixer"]}, 'Pending', 'Awaiting recipe approval'),
      (${runIds[5]}, ${equip["Packaging Line"]}, 'Pending', 'Awaiting recipe approval')
  `;

  console.log("Seed data inserted successfully.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
