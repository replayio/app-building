# SupplierTracker Test Specification

## Navigation

The app has a consistent top navigation bar across all pages with:
- App logo/name ("SupplyChain Pro")
- Navigation links: Dashboard, Suppliers, Orders, Inventory
- User profile icon/dropdown

Breadcrumb navigation appears on detail pages (SupplierDetailsPage, OrderDetailsPage).

---

## DashboardPage (/)

### QuickActions

<!-- tests planned in PlanPage task -->

### UpcomingOrdersTable

<!-- tests planned in PlanPage task -->

### SuppliersList

<!-- tests planned in PlanPage task -->

---

## SupplierDetailsPage (/suppliers/:supplierId)

### SupplierOverview

<!-- tests planned in PlanPage task -->

### DocumentsTab

<!-- tests planned in PlanPage task -->

### CommentsSection

<!-- tests planned in PlanPage task -->

### OrdersSection

<!-- tests planned in PlanPage task -->

---

## OrderDetailsPage (/orders/:orderId)

Breadcrumb navigation shows "Dashboard > Orders > Order #\<orderId\>". Clicking "Dashboard" navigates to /. Clicking "Orders" navigates to /.

### OrderSummary

**Display Order ID in Header**
Given an order with ID "PO-2024-10-1234" exists,
When the user navigates to /orders/PO-2024-10-1234,
Then the OrderSummary section displays the heading "Order Summary" and the subtitle "Purchase Order #PO-2024-10-1234 Details".

**Display Supplier Name as Link**
Given the order is associated with supplier "Acme Corp",
When the OrderDetailsPage loads,
Then the Supplier field shows "Acme Corp" as a clickable link with an external-link icon,
And clicking the supplier name navigates to /suppliers/\<supplierId\> (the SupplierDetailsPage for Acme Corp).

**Display Order Date**
Given the order has an order date of Oct 26, 2024,
When the OrderDetailsPage loads,
Then the "Order Date" field displays "Oct 26, 2024".

**Display Expected Delivery Date**
Given the order has an expected delivery date of Nov 15, 2024,
When the OrderDetailsPage loads,
Then the "Expected Delivery" field displays "Nov 15, 2024".

**Display Status Badge**
Given the order has status "Approved",
When the OrderDetailsPage loads,
Then the "Status" field displays a green badge with a checkmark icon and the text "Approved".
Statuses should be color-coded: "Approved" green, "Pending" yellow, "Shipped" blue, "Delivered" gray, "Cancelled" red.

**Display Overall Cost**
Given the order has a total cost of $12,450.00,
When the OrderDetailsPage loads,
Then the "Overall Cost" field displays "$12,450.00" in large, prominent text.

**Edit Button Opens Edit Dialog**
Given the user is viewing the OrderDetailsPage,
When the user clicks the "Edit" button (pencil icon + "Edit" text) in the top-right of OrderSummary,
Then a modal dialog opens allowing the user to edit order fields: expected delivery date and status,
And upon saving, the updated values are persisted and reflected in the OrderSummary,
And a new entry is added to OrderHistory recording what changed, the timestamp, and the actor.

**Print Button Triggers Print**
Given the user is viewing the OrderDetailsPage,
When the user clicks the "Print" button (printer icon + "Print" text) in the top-right of OrderSummary,
Then the browser print dialog opens with a print-friendly view of the order details.

### LineItemsTable

**Display Line Items Table with Correct Columns**
Given the order has line items,
When the OrderDetailsPage loads,
Then the "Line Items" section displays a table with columns: SKU, Item Name / Description, Qty, Unit Price, Line Total.

**Display Line Item Row Data**
Given the order has a line item with SKU "SKU-A101", description "Ergonomic Office Chair - Black, Mesh Back", qty 20, unit price $350.00, line total $7,000.00,
When the OrderDetailsPage loads,
Then that row displays all values correctly with proper currency formatting for Unit Price ("$350.00") and Line Total ("$7,000.00").

**Display Multiple Line Items**
Given the order has three line items,
When the OrderDetailsPage loads,
Then all three line items are displayed in the table:
- SKU-A101: Ergonomic Office Chair - Black, Mesh Back, 20, $350.00, $7,000.00
- SKU-B202: 27-inch 4K Monitor - IPS Panel, 10, $450.00, $4,500.00
- SKU-C303: Wireless Keyboard & Mouse Combo, 10, $75.00, $750.00

**Add Line Item**
Given the user is viewing the LineItemsTable,
When the user clicks the "Add Item" button,
Then a modal dialog opens with fields for SKU, Item Name / Description, Qty, and Unit Price,
And when the user fills in all fields and clicks "Save",
Then the new line item appears in the table with the correct Line Total computed as Qty × Unit Price,
And the CostBreakdown section updates to reflect the new subtotal,
And a new entry is added to OrderHistory recording the addition.

**Edit Line Item**
Given the user is viewing a line item row,
When the user clicks the edit action on that row,
Then a modal dialog opens pre-filled with the line item's current values (SKU, Item Name / Description, Qty, Unit Price),
And when the user changes the Qty and clicks "Save",
Then the line item row updates with the new Qty and recomputed Line Total,
And the CostBreakdown section updates to reflect the new subtotal,
And a new entry is added to OrderHistory recording the change.

**Delete Line Item**
Given the user is viewing a line item row,
When the user clicks the delete action on that row,
Then a confirmation dialog appears asking "Are you sure you want to delete this line item?",
And when the user confirms,
Then the line item is removed from the table,
And the CostBreakdown section updates to reflect the new subtotal,
And a new entry is added to OrderHistory recording the deletion.

### CostBreakdown

**Display Subtotal**
Given the order has line items totaling $12,250.00,
When the OrderDetailsPage loads,
Then the CostBreakdown section displays "Subtotal:" with the value "$12,250.00".

**Display Tax with Percentage**
Given the order has tax at 8% amounting to $980.00,
When the OrderDetailsPage loads,
Then the CostBreakdown section displays "Tax (8%):" with the value "$980.00".

**Display Discount with Label**
Given the order has a discount labeled "Contract Pricing" of $780.00,
When the OrderDetailsPage loads,
Then the CostBreakdown section displays "Discount (Contract Pricing):" with the value "-$780.00" (negative, indicating a reduction).

**Display Total Cost with Currency**
Given the subtotal is $12,250.00, tax is $980.00, and discount is $780.00,
When the OrderDetailsPage loads,
Then the CostBreakdown section displays "Total Cost:" with the value "$12,450.00 (USD)" in bold/prominent styling.

**Cost Breakdown Updates When Line Items Change**
Given the user adds, edits, or deletes a line item,
When the line items table changes,
Then the CostBreakdown subtotal recalculates based on the sum of all line item totals,
And the tax recalculates based on the new subtotal,
And the total cost updates accordingly (subtotal + tax - discount).

### OrderDocuments

**Display Document List**
Given the order has associated documents,
When the OrderDetailsPage loads,
Then the "Documents" section displays a list of documents, each showing a file icon, file name, document type, and date.

**Display Document Details**
Given a document "PO-2024-10-1234.pdf" of type "Purchase Order" dated "Oct 26, 2024" is attached,
When the OrderDetailsPage loads,
Then that document entry shows the file name "PO-2024-10-1234.pdf", type "Purchase Order", and date "Oct 26, 2024".

**Display Multiple Documents**
Given the order has three documents,
When the OrderDetailsPage loads,
Then all three are displayed:
- PO-2024-10-1234.pdf, Purchase Order, Oct 26, 2024
- Invoice_OCT24_Acme.pdf, Invoice, Oct 28, 2024
- Shipping_Label_Manifest.png, Shipping, Oct 30, 2024

**View Button Opens Document**
Given a document is listed in OrderDocuments,
When the user clicks the "View" text button on that document row,
Then the document opens in a new browser tab for viewing.

**Download Button Downloads Document**
Given a document is listed in OrderDocuments,
When the user clicks the download icon button on that document row,
Then the document file is downloaded to the user's device.

**Upload Document**
Given the user is viewing the OrderDocuments section,
When the user clicks the "Upload Document" button,
Then a file upload dialog opens allowing the user to select a file from their device,
And after selecting a file, the user can enter document type (e.g. "Invoice", "Purchase Order", "Shipping"),
And when the user confirms the upload,
Then the document is uploaded and appears in the document list with the correct name, type, and current date,
And a new entry is added to OrderHistory recording that a document was uploaded.

### OrderHistory

**Display Timeline of Events**
Given the order has history entries,
When the OrderDetailsPage loads,
Then the "Order History" section displays a vertical timeline of events in reverse chronological order (newest first).

**Display Event Timestamp and Description**
Given a history entry for "Oct 30, 2024, 10:30 AM" with description "Status changed to 'Shipped' by System.",
When the OrderDetailsPage loads,
Then that timeline entry shows the date "Oct 30, 2024, 10:30 AM" and the text "Status changed to 'Shipped' by System.".

**Display All History Entries**
Given the order has four history entries,
When the OrderDetailsPage loads,
Then all four entries are displayed in reverse chronological order:
- Oct 30, 2024, 10:30 AM — Status changed to 'Shipped' by System.
- Oct 28, 2024, 2:15 PM — Invoice received and linked.
- Oct 26, 2024, 4:00 PM — Order Approved by Jane Doe.
- Oct 26, 2024, 9:00 AM — Order Created by John Smith.

**Timeline Entry Icons**
Given history entries have different event types,
When the OrderDetailsPage loads,
Then each timeline entry displays a distinct icon based on event type: status change icon for status changes, document icon for document events, approval/checkmark icon for approvals, and plus icon for creation.

**History Entry Created on Status Change**
Given the user edits the order status via the Edit dialog in OrderSummary,
When the user changes the status from "Approved" to "Shipped" and saves,
Then exactly one new history entry is added to OrderHistory with the timestamp of the change, the description of what changed (e.g. "Status changed to 'Shipped'"), and the actor who made the change.

**History Entry Created on Line Item Modification**
Given the user adds, edits, or deletes a line item,
When the modification is saved,
Then exactly one new history entry is added to OrderHistory describing the line item change (e.g. "Line item SKU-A101 quantity changed from 20 to 25" or "Line item SKU-D404 added") with the timestamp and actor.
