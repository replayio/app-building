import { neon } from "@neondatabase/serverless";

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Usage: npx tsx scripts/seed-db.ts <DATABASE_URL>");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function seed() {
  // Clear existing data in dependency order (children before parents)
  await sql`DELETE FROM order_history`;
  await sql`DELETE FROM order_documents`;
  await sql`DELETE FROM order_line_items`;
  await sql`DELETE FROM orders`;
  await sql`DELETE FROM supplier_comments`;
  await sql`DELETE FROM supplier_documents`;
  await sql`DELETE FROM suppliers`;

  // ---- Suppliers ----
  const supplierRows = await sql`
    INSERT INTO suppliers (name, address, contact_name, phone, email, description, status)
    VALUES
      ('Apex Logistics', '123 Commerce Way, Suite 400, Seattle, WA 98101', 'John Smith', '(206) 555-0123', 'jane.doe@example.com', 'Leading provider of integrated logistics solutions and supply chain management. Specializing in international freight and warehousing.', 'Active'),
      ('Global Sourcing Inc.', '456 Trade Blvd, Chicago, IL 60601', 'John Smith', '(312) 555-0456', 'jane.doe@example.com', 'Global procurement and sourcing specialists.', 'On Hold'),
      ('Binmant Inc.', '789 Industrial Ave, Dallas, TX 75201', 'John Smith', '(214) 555-0789', 'jane.doe@example.com', 'Manufacturing components supplier.', 'On Hold'),
      ('Minmer Logistics', '321 Harbor Dr, San Francisco, CA 94102', 'John Smith', '(415) 555-0321', 'jane.doe@example.com', 'West coast logistics partner.', 'Active'),
      ('Charralets Inc.', '555 Commerce Park, Boston, MA 02101', 'John Smith', '(617) 555-0555', 'jane.doe@example.com', 'Specialty materials distributor.', 'On Hold'),
      ('Merianastillers Inc.', '777 Business Center, Atlanta, GA 30301', 'John Smith', '(404) 555-0777', 'jane.doe@example.com', 'Chemical and industrial supplies.', 'Active'),
      ('Apex Logistics', '888 Warehouse Row, Phoenix, AZ 85001', 'John Smith', '(602) 555-0888', 'jane.doe@example.com', 'Regional logistics operations center.', 'Active'),
      ('Peaor Logistics', '999 Transport Way, Denver, CO 80201', 'John Smith', '(303) 555-0999', 'jane.doe@example.com', 'Mountain region distribution services.', 'Active')
    RETURNING id, name
  `;

  const suppliers: Record<string, string> = {};
  for (let i = 0; i < supplierRows.length; i++) {
    // Use index-based key to handle duplicate names
    const key = `supplier_${i}`;
    suppliers[key] = supplierRows[i].id as string;
  }
  // Also store by index for easy reference
  const apexId = supplierRows[0].id as string;
  const techcomSupplierId = supplierRows[0].id as string; // Use first supplier for dashboard orders

  // ---- Supplier Documents (for first supplier: Apex Logistics) ----
  await sql`
    INSERT INTO supplier_documents (supplier_id, file_name, file_url, document_type, upload_date)
    VALUES
      (${apexId}, 'Service Agreement 2024.pdf', 'https://example.com/docs/service-agreement.pdf', 'Contract', '2023-10-15'),
      (${apexId}, 'ISO 9001 Certification.pdf', 'https://example.com/docs/iso-cert.pdf', 'Certification', '2023-09-01'),
      (${apexId}, 'Non-Disclosure Agreement.docx', 'https://example.com/docs/nda.docx', 'Agreement', '2023-08-20')
  `;

  // ---- Supplier Comments (for first supplier: Apex Logistics) ----
  await sql`
    INSERT INTO supplier_comments (supplier_id, author_name, text, created_at)
    VALUES
      (${apexId}, 'Sarah L.', 'Discussed Q4 shipment projections. They are confident in meeting deadlines.', '2023-10-20T10:00:00Z'),
      (${apexId}, 'Michael B.', 'Payment terms updated to net 60 days.', '2023-09-05T14:00:00Z'),
      (${apexId}, 'David K.', 'Initial onboarding meeting completed.', '2023-08-15T09:00:00Z')
  `;

  // ---- Dashboard Upcoming Orders (5 orders from Techcom Solutions) ----
  // Since the test spec expects "Techcom Solutions" as the supplier for dashboard orders,
  // we create a temporary supplier for that
  const techcomRows = await sql`
    INSERT INTO suppliers (name, address, contact_name, phone, email, description, status)
    VALUES ('Techcom Solutions', '100 Tech Park Dr, Austin, TX 73301', 'Jane Tech', '(512) 555-0100', 'contact@techcom.com', 'Technology solutions provider.', 'Active')
    RETURNING id
  `;
  const techcomId = techcomRows[0].id as string;
  void techcomSupplierId;

  const dashboardOrders = await sql`
    INSERT INTO orders (order_id, supplier_id, order_date, expected_delivery, status, subtotal, tax_rate, tax_amount, discount_label, discount_amount, total_cost)
    VALUES
      ('PO-2023-001', ${techcomId}, '2023-10-01', '2023-10-28', 'In Transit', 4166.67, 8, 333.33, '', 0, 4500.00),
      ('PO-2023-002', ${techcomId}, '2023-10-05', '2023-10-28', 'Pending', 4166.67, 8, 333.33, '', 0, 4500.00),
      ('PO-2023-003', ${techcomId}, '2023-10-10', '2023-10-28', 'Fulfilled', 2314.81, 8, 185.19, '', 0, 2500.00),
      ('PO-2023-004', ${techcomId}, '2023-11-01', '2023-12-17', 'Fulfilled', 1574.07, 8, 125.93, '', 0, 1700.00),
      ('PO-2023-005', ${techcomId}, '2023-10-20', '2023-11-20', 'Fulfilled', 3240.74, 8, 259.26, '', 0, 3500.00)
    RETURNING id
  `;
  void dashboardOrders;

  // ---- Supplier Detail Page Orders (for first supplier: Apex Logistics) ----

  // Upcoming orders for Apex supplier
  const supplierUpcomingOrders = await sql`
    INSERT INTO orders (order_id, supplier_id, order_date, expected_delivery, status, subtotal, tax_rate, tax_amount, discount_label, discount_amount, total_cost)
    VALUES
      ('PO-78901', ${apexId}, '2023-10-01', '2023-11-15', 'Pending', 14351.85, 8, 1148.15, '', 0, 15500.00),
      ('PO-78902', ${apexId}, '2023-10-15', '2023-12-01', 'In Transit', 7593.06, 8, 607.44, '', 0, 8200.50),
      ('PO-78903', ${apexId}, '2023-11-01', '2023-12-20', 'Processing', 11111.11, 8, 888.89, '', 0, 12000.00)
    RETURNING id
  `;
  void supplierUpcomingOrders;

  // Historical orders for Apex supplier
  const supplierHistoricalOrders = await sql`
    INSERT INTO orders (order_id, supplier_id, order_date, expected_delivery, status, subtotal, tax_rate, tax_amount, discount_label, discount_amount, total_cost)
    VALUES
      ('PO-78801', ${apexId}, '2023-09-01', '2023-10-05', 'Completed', 9259.26, 8, 740.74, '', 0, 10000.00),
      ('PO-78802', ${apexId}, '2023-08-15', '2023-09-15', 'Completed', 20833.33, 8, 1666.67, '', 0, 22500.00),
      ('PO-78803', ${apexId}, '2023-07-01', '2023-08-01', 'Cancelled', 4629.63, 8, 370.37, '', 0, 5000.00)
    RETURNING id
  `;
  void supplierHistoricalOrders;

  // ---- Order Details Page (the detailed order with line items, docs, history) ----
  // We'll create a separate supplier "Acme Corp" for the order details page
  const acmeRows = await sql`
    INSERT INTO suppliers (name, address, contact_name, phone, email, description, status)
    VALUES ('Acme Corp', '500 Main St, Suite 200, New York, NY 10001', 'Bob Wilson', '(212) 555-0500', 'orders@acmecorp.com', 'Industrial supplies and office equipment.', 'Active')
    RETURNING id
  `;
  const acmeId = acmeRows[0].id as string;

  const detailOrderRows = await sql`
    INSERT INTO orders (order_id, supplier_id, order_date, expected_delivery, status, subtotal, tax_rate, tax_amount, discount_label, discount_amount, total_cost, currency)
    VALUES ('PO-2024-10-1234', ${acmeId}, '2024-10-26', '2024-11-15', 'Approved', 12250.00, 8, 980.00, 'Contract Pricing', 780.00, 12450.00, 'USD')
    RETURNING id
  `;
  const detailOrderId = detailOrderRows[0].id as string;

  // Line items for the detail order
  await sql`
    INSERT INTO order_line_items (order_id, sku, item_name, quantity, unit_price, line_total)
    VALUES
      (${detailOrderId}, 'SKU-A101', 'Ergonomic Office Chair - Black, Mesh Back', 20, 350.00, 7000.00),
      (${detailOrderId}, 'SKU-B202', '27-inch 4K Monitor - IPS Panel', 10, 450.00, 4500.00),
      (${detailOrderId}, 'SKU-C303', 'Wireless Keyboard & Mouse Combo', 10, 75.00, 750.00)
  `;

  // Documents for the detail order
  await sql`
    INSERT INTO order_documents (order_id, file_name, file_url, document_type, upload_date)
    VALUES
      (${detailOrderId}, 'PO-2024-10-1234.pdf', 'https://example.com/docs/po-2024-10-1234.pdf', 'Purchase Order', '2024-10-26'),
      (${detailOrderId}, 'Invoice_OCT24_Acme.pdf', 'https://example.com/docs/invoice-oct24.pdf', 'Invoice', '2024-10-28'),
      (${detailOrderId}, 'Shipping_Label_Manifest.png', 'https://example.com/docs/shipping-label.png', 'Shipping', '2024-10-30')
  `;

  // History for the detail order
  await sql`
    INSERT INTO order_history (order_id, event_type, description, actor, created_at)
    VALUES
      (${detailOrderId}, 'status_change', 'Status changed to ''Shipped'' by System.', 'System', '2024-10-30T10:30:00Z'),
      (${detailOrderId}, 'document', 'Invoice received and linked.', 'System', '2024-10-28T14:15:00Z'),
      (${detailOrderId}, 'approval', 'Order Approved by Jane Doe.', 'Jane Doe', '2024-10-26T16:00:00Z'),
      (${detailOrderId}, 'created', 'Order Created by John Smith.', 'John Smith', '2024-10-26T09:00:00Z')
  `;

  console.log("Seed data inserted successfully.");
  console.log(`  - ${supplierRows.length + 2} suppliers`);
  console.log("  - 3 supplier documents");
  console.log("  - 3 supplier comments");
  console.log("  - 9 orders (5 dashboard + 3 upcoming + 3 historical + 1 detail)");
  console.log("  - 3 line items");
  console.log("  - 3 order documents");
  console.log("  - 4 order history entries");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
