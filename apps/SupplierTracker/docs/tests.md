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

Breadcrumb navigation shows "Home > Suppliers > \<Supplier Name\> > Supplier Details". Clicking "Home" navigates to /. Clicking "Suppliers" navigates to /.

Below the SupplierOverview section, three tab links appear: "Documents", "Comments", "Orders". Clicking a tab scrolls to or reveals that section's content. All sections are visible on the page.

### SupplierOverview

**Display Supplier Name**
Given a supplier "Apex Global Logistics" exists,
When the user navigates to /suppliers/\<supplierId\>,
Then the SupplierOverview section displays the heading "Supplier Overview" and the label "Supplier Name" with the value "Apex Global Logistics".

**Display Supplier Address**
Given the supplier has address "123 Commerce Way, Suite 400, Seattle, WA 98101",
When the SupplierDetailsPage loads,
Then the "Address" field displays the full multi-line address: "123 Commerce Way", "Suite 400", "Seattle, WA 98101".

**Display Contact Information**
Given the supplier has contact "John Smith" with phone "(206) 555-0123" and email "contact@apexglobal.com",
When the SupplierDetailsPage loads,
Then the "Contact" field displays the contact name "John Smith", the phone number "(206) 555-0123", and the email "contact@apexglobal.com".

**Display Supplier Description**
Given the supplier has a description "Leading provider of integrated logistics solutions and supply chain management. Specializing in international freight and warehousing.",
When the SupplierDetailsPage loads,
Then the "Description" field displays the full description text.

**Display Status Badge**
Given the supplier has status "Active",
When the SupplierDetailsPage loads,
Then a status badge appears in the top-right area of SupplierOverview showing a green dot indicator and the text "Status: Active".
Statuses should be color-coded: "Active" green, "Inactive" gray, "On Hold" yellow, "Suspended" red.

**Back to Dashboard Button Navigates to Dashboard**
Given the user is viewing the SupplierDetailsPage,
When the user clicks the "Back to Dashboard" button in the top-right of SupplierOverview,
Then the user is navigated to the DashboardPage (/).

**Edit Supplier Opens Edit Dialog**
Given the user is viewing the SupplierDetailsPage,
When the user clicks the "Edit" button in SupplierOverview,
Then a modal dialog opens pre-filled with the supplier's current values (name, address, contact name, phone, email, description, status),
And when the user changes the contact phone number and clicks "Save",
Then the updated phone number is persisted and reflected in SupplierOverview.

**Delete Supplier with Confirmation**
Given the user is viewing the SupplierDetailsPage,
When the user clicks the "Delete" button in SupplierOverview,
Then a confirmation dialog appears asking "Are you sure you want to delete this supplier? This action cannot be undone.",
And when the user confirms the deletion,
Then the supplier is removed from the database,
And the user is navigated to the DashboardPage (/),
And the deleted supplier no longer appears in the SuppliersList on the Dashboard.

### DocumentsTab

**Display Document Cards with Details**
Given the supplier has associated documents,
When the SupplierDetailsPage loads and the Documents section is visible,
Then the DocumentsTab displays document cards, each showing the file name (bold), document type label and value, upload date label and value, and action icons.

**Display Multiple Document Cards**
Given the supplier has three documents,
When the DocumentsTab loads,
Then all three document cards are displayed:
- "Service Agreement 2024.pdf", Type: "Contract", Upload Date: "Oct 15, 2023"
- "ISO 9001 Certification.pdf", Type: "Certification", Upload Date: "Sep 01, 2023"
- "Non-Disclosure Agreement.docx", Type: "Agreement", Upload Date: "Aug 20, 2023"

**Search Documents by Name**
Given the DocumentsTab displays three documents,
When the user types "ISO" into the "Search documents..." search field,
Then only documents whose name contains "ISO" are shown (e.g., "ISO 9001 Certification.pdf"),
And the other document cards are hidden.

**Search Documents Clears Results**
Given the user has filtered documents by typing "ISO" in the search field,
When the user clears the search field,
Then all documents reappear in the DocumentsTab.

**Upload Document Button Opens Upload Dialog**
Given the user is viewing the DocumentsTab,
When the user clicks the "Upload Document" button,
Then a file upload dialog opens allowing the user to select a file from their device,
And the dialog includes a field to specify the document type (e.g., "Contract", "Certification", "Agreement"),
And after selecting a file and entering the type, when the user confirms the upload,
Then the document is uploaded via file upload and appears as a new card in the DocumentsTab with the correct file name, selected type, and the current date as the upload date.

**View Document Action**
Given a document "Service Agreement 2024.pdf" is displayed in the DocumentsTab,
When the user clicks the view icon (eye icon) on that document card,
Then the document opens in a new browser tab for viewing.

**Download Document Action**
Given a document "Service Agreement 2024.pdf" is displayed in the DocumentsTab,
When the user clicks the download icon on that document card,
Then the document file is downloaded to the user's device.

### CommentsSection

**Display Comments Header with Count**
Given the supplier has 3 comments,
When the SupplierDetailsPage loads,
Then the CommentsSection displays the heading "Comments (3)" with a collapse/expand toggle icon.

**Display Comment List with Timestamps and Authors**
Given the supplier has three comments,
When the CommentsSection loads,
Then all three comments are displayed in reverse chronological order:
- "10/20/2023 - Discussed Q4 shipment projections. They are confident in meeting deadlines. - Sarah L."
- "09/05/2023 - Payment terms updated to net 60 days. - Michael B."
- "08/15/2023 - Initial onboarding meeting completed. - David K."
Each comment shows the date, the comment text, and the author name.

**Add Comment via Input Field**
Given the user is viewing the CommentsSection,
When the user clicks the input area with placeholder "Add a note about this supplier...",
And types "Reviewed annual pricing terms." and submits (presses Enter or clicks a submit button),
Then the new comment appears at the top of the comment list with the current date, the entered text, and the current user's name as the author,
And the Comments header count increments by one (e.g., "Comments (4)"),
And the comment input field is cleared.

**Add Comment Persists After Reload**
Given the user has added a new comment "Reviewed annual pricing terms.",
When the user navigates away from the SupplierDetailsPage and returns,
Then the newly added comment is still present in the comment list with the correct date, text, and author.

**Collapse and Expand Comments Section**
Given the CommentsSection is expanded and showing comments,
When the user clicks the collapse toggle icon on the "Comments (3)" header,
Then the comment list and input field are hidden,
And when the user clicks the toggle icon again,
Then the comment list and input field are shown again.

**Empty Comment Validation**
Given the user is viewing the CommentsSection,
When the user attempts to submit a comment with an empty input field,
Then no comment is added and the count does not change.

### OrdersSection

**Display Upcoming and Historical Order Tabs**
Given the supplier has both upcoming and historical orders,
When the SupplierDetailsPage loads and the Orders section is visible,
Then the OrdersSection displays a heading "Orders" with two tab links: "Upcoming Orders" (active/underlined by default) and "Historical Orders".

**Display Upcoming Orders Table with Correct Columns**
Given the supplier has upcoming orders,
When the "Upcoming Orders" tab is active,
Then a table is displayed with columns: Order ID, Expected Delivery, Status, Total Cost.

**Display Upcoming Orders Data**
Given the supplier has three upcoming orders,
When the "Upcoming Orders" tab is active,
Then all three orders are displayed:
- [PO-78901], Nov 15, 2023, Pending, $15,500.00
- [PO-78902], Dec 01, 2023, In Transit, $8,200.50
- [PO-78903], Dec 20, 2023, Processing, $12,000.00
Order IDs are displayed as clickable links.

**Upcoming Order ID Links Navigate to Order Details**
Given the upcoming orders table is displayed,
When the user clicks the Order ID link "[PO-78901]",
Then the user is navigated to /orders/PO-78901 (the OrderDetailsPage for that order).

**Display Historical Orders Table with Correct Columns**
Given the supplier has historical orders,
When the user clicks the "Historical Orders" tab,
Then a table is displayed with columns: Order ID, Delivery Date, Status, Final Cost.

**Display Historical Orders Data**
Given the supplier has three historical orders,
When the "Historical Orders" tab is active,
Then all three orders are displayed:
- [PO-78801], Oct 05, 2023, Completed, $10,000.00
- [PO-78802], Sep 15, 2023, Completed, $22,500.00
- [PO-78803], Aug 01, 2023, Cancelled, $5,000.00
Order IDs are displayed as clickable links.

**Historical Order ID Links Navigate to Order Details**
Given the historical orders table is displayed,
When the user clicks the Order ID link "[PO-78801]",
Then the user is navigated to /orders/PO-78801 (the OrderDetailsPage for that order).

**Search Upcoming Orders**
Given the "Upcoming Orders" tab is active and the table shows three orders,
When the user types "78901" into the "Search orders..." field on the upcoming orders side,
Then only orders whose ID contains "78901" are shown (e.g., PO-78901),
And the other rows are hidden.

**Search Historical Orders**
Given the "Historical Orders" tab is active and the table shows three orders,
When the user types "78802" into the "Search orders..." field on the historical orders side,
Then only orders whose ID contains "78802" are shown (e.g., PO-78802),
And the other rows are hidden.

**Filter Upcoming Orders by Status**
Given the "Upcoming Orders" tab is active and the table shows orders with statuses "Pending", "In Transit", and "Processing",
When the user clicks the "Filter by Status" dropdown and selects "Pending",
Then only orders with status "Pending" are displayed in the upcoming orders table,
And when the user clears the filter,
Then all upcoming orders are shown again.

**Status Badges in Upcoming Orders**
Given the upcoming orders table is displayed,
When the table loads,
Then each order's status is displayed as a color-coded badge: "Pending" yellow, "In Transit" blue, "Processing" orange.

**Status Badges in Historical Orders**
Given the historical orders table is displayed,
When the table loads,
Then each order's status is displayed as a color-coded badge: "Completed" green, "Cancelled" red.

**Switch Between Tabs**
Given the user is viewing the "Upcoming Orders" tab,
When the user clicks the "Historical Orders" tab,
Then the upcoming orders table is hidden and the historical orders table is shown with its own search field,
And the "Historical Orders" tab appears active/underlined,
And when the user clicks "Upcoming Orders" tab again,
Then the historical orders table is hidden and the upcoming orders table is shown with its search field and filter dropdown.

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
