# SupplierTracker Test Specification

## Navigation

### TopNavBar

**Display App Logo with Icon and Name**
Given the user is on any page,
When the page loads,
Then the top navigation bar displays a package/box icon followed by the text "SupplyChain Pro" on the left side.

**Click App Logo Navigates to Dashboard**
Given the user is on any page,
When the user clicks the "SupplyChain Pro" logo,
Then the user is navigated to / (the DashboardPage).

**Display Dashboard Nav Link**
Given the user is on any page,
When the page loads,
Then the top navigation bar displays a "Dashboard" link.

**Click Dashboard Nav Link Navigates to Dashboard**
Given the user is on any page,
When the user clicks the "Dashboard" nav link,
Then the user is navigated to / (the DashboardPage).

**Display Suppliers Nav Link**
Given the user is on any page,
When the page loads,
Then the top navigation bar displays a "Suppliers" link.

**Click Suppliers Nav Link Navigates to Dashboard**
Given the user is on any page,
When the user clicks the "Suppliers" nav link,
Then the user is navigated to / (the DashboardPage).

**Display Orders Nav Link**
Given the user is on any page,
When the page loads,
Then the top navigation bar displays an "Orders" link.

**Click Orders Nav Link Navigates to Dashboard**
Given the user is on any page,
When the user clicks the "Orders" nav link,
Then the user is navigated to / (the DashboardPage).

**Display Inventory Nav Link**
Given the user is on any page,
When the page loads,
Then the top navigation bar displays an "Inventory" link.

**Click Inventory Nav Link Navigates to Dashboard**
Given the user is on any page,
When the user clicks the "Inventory" nav link,
Then the user is navigated to / (the DashboardPage).

**Active Nav Link Highlights Current Page**
Given the user is on the DashboardPage,
When the page loads,
Then the "Dashboard" nav link appears with active/highlighted styling,
And when the user is on a SupplierDetailsPage, the "Suppliers" nav link appears active,
And when the user is on an OrderDetailsPage, the "Orders" nav link appears active.

**Display User Profile Button**
Given the user is on any page,
When the page loads,
Then the top navigation bar displays a user profile button on the right side with a circular avatar showing the letter "U" and a dropdown chevron icon.

**Nav Bar Consistent Across All Pages**
Given the user navigates between the DashboardPage, SupplierDetailsPage, and OrderDetailsPage,
When each page loads,
Then the same top navigation bar is displayed with the logo, all four nav links (Dashboard, Suppliers, Orders, Inventory), and the user profile button.

### Breadcrumbs

**Display Breadcrumbs on SupplierDetailsPage**
Given a supplier "Apex Global Logistics" exists,
When the user navigates to /suppliers/\<supplierId\>,
Then a breadcrumb trail is displayed showing "Home > Suppliers > Apex Global Logistics > Supplier Details".

**SupplierDetailsPage Breadcrumb Home Navigates to Dashboard**
Given the user is on the SupplierDetailsPage,
When the user clicks "Home" in the breadcrumb trail,
Then the user is navigated to / (the DashboardPage).

**SupplierDetailsPage Breadcrumb Suppliers Navigates to Dashboard**
Given the user is on the SupplierDetailsPage,
When the user clicks "Suppliers" in the breadcrumb trail,
Then the user is navigated to / (the DashboardPage).

**SupplierDetailsPage Breadcrumb Supplier Name and Supplier Details Are Not Clickable**
Given the user is on the SupplierDetailsPage for "Apex Global Logistics",
When the breadcrumb trail is displayed,
Then "Apex Global Logistics" and "Supplier Details" are displayed as plain text (not clickable links).

**Display Breadcrumbs on OrderDetailsPage**
Given an order with ID "PO-2024-10-1234" exists,
When the user navigates to /orders/PO-2024-10-1234,
Then a breadcrumb trail is displayed showing "Dashboard > Orders > Order #PO-2024-10-1234".

**OrderDetailsPage Breadcrumb Dashboard Navigates to Dashboard**
Given the user is on the OrderDetailsPage,
When the user clicks "Dashboard" in the breadcrumb trail,
Then the user is navigated to / (the DashboardPage).

**OrderDetailsPage Breadcrumb Orders Navigates to Dashboard**
Given the user is on the OrderDetailsPage,
When the user clicks "Orders" in the breadcrumb trail,
Then the user is navigated to / (the DashboardPage).

**OrderDetailsPage Breadcrumb Order ID Is Not Clickable**
Given the user is on the OrderDetailsPage for order "PO-2024-10-1234",
When the breadcrumb trail is displayed,
Then "Order #PO-2024-10-1234" is displayed as plain text (not a clickable link).

---

## DashboardPage (/)

### QuickActions

**Display Quick Actions Heading**
Given the user is on the DashboardPage,
When the page loads,
Then the QuickActions section displays the heading "Quick Actions".

**Display Add New Supplier Button**
Given the user is on the DashboardPage,
When the page loads,
Then the QuickActions section displays a large "Add New Supplier" button with a person-plus icon on the left side.

**Display Create Purchase Order Button**
Given the user is on the DashboardPage,
When the page loads,
Then the QuickActions section displays a large "Create Purchase Order" button with a document icon on the right side, next to the "Add New Supplier" button.

**Add New Supplier Button Opens Create Supplier Dialog**
Given the user is on the DashboardPage,
When the user clicks the "Add New Supplier" button,
Then a modal dialog opens with the title "Add New Supplier" and fields for: Supplier Name, Address (multi-line), Contact Name, Phone, Email, Description, and Status (dropdown with options: Active, Inactive, On Hold, Suspended),
And the Status field defaults to "Active".

**Create Supplier via Dialog Saves and Updates Dashboard**
Given the "Add New Supplier" dialog is open,
When the user fills in Supplier Name "New Parts Co.", Address "456 Industrial Blvd, Chicago, IL 60601", Contact Name "Alice Johnson", Phone "(312) 555-0199", Email "alice@newparts.com", Description "Precision parts manufacturer", Status "Active", and clicks "Save",
Then the dialog closes,
And the new supplier "New Parts Co." appears as a card in the SuppliersList section on the DashboardPage with status "Active", contact "Alice Johnson", email "alice@newparts.com", and an orders summary.

**Create Supplier Dialog Cancel Does Not Create Supplier**
Given the "Add New Supplier" dialog is open and the user has entered some data,
When the user clicks "Cancel" or closes the dialog,
Then no supplier is created,
And the SuppliersList remains unchanged.

**Create Supplier Dialog Validation**
Given the "Add New Supplier" dialog is open,
When the user attempts to save without filling in the required Supplier Name field,
Then a validation error is shown on the Supplier Name field and the dialog does not close.

**Create Purchase Order Button Opens Create Order Dialog**
Given the user is on the DashboardPage,
When the user clicks the "Create Purchase Order" button,
Then a modal dialog opens with the title "Create Purchase Order" and fields for: Supplier (dropdown of existing suppliers), Order Date (date picker, defaults to today), Expected Delivery (date picker), and an initial line item section with fields for SKU, Item Name / Description, Qty, and Unit Price.

**Create Order via Dialog Saves and Updates Dashboard**
Given the "Create Purchase Order" dialog is open,
When the user selects supplier "Apex Logistics", sets Expected Delivery to "Dec 15, 2023", adds a line item (SKU "SKU-X100", Item Name "Widget A", Qty 10, Unit Price $25.00), and clicks "Save",
Then the dialog closes,
And the new order appears in the UpcomingOrdersTable with the assigned Order ID, supplier "Apex Logistics", expected delivery "Dec 15, 2023", status "Pending", and total cost "$250.00",
And navigating to the new order's OrderDetailsPage shows an OrderHistory entry "Order <orderId> created" appearing exactly once.

**Create Order Dialog Cancel Does Not Create Order**
Given the "Create Purchase Order" dialog is open and the user has entered some data,
When the user clicks "Cancel" or closes the dialog,
Then no order is created,
And the UpcomingOrdersTable remains unchanged.

**Create Order Dialog Validation**
Given the "Create Purchase Order" dialog is open,
When the user attempts to save without selecting a Supplier,
Then a validation error is shown on the Supplier field and the dialog does not close.

### UpcomingOrdersTable

**Display Upcoming Orders Heading**
Given the user is on the DashboardPage,
When the page loads,
Then the UpcomingOrdersTable section displays the heading "Upcoming Orders".

**Display Table with Correct Columns**
Given the user is on the DashboardPage and there are upcoming orders,
When the page loads,
Then the UpcomingOrdersTable displays a table with columns: Order Id, Supplier, Expected Delivery, Status, Total Cost.

**Display Order Data Rows**
Given there are five upcoming orders,
When the DashboardPage loads,
Then all five orders are displayed in the table:
- #PO-2023-001, Techcom Solutions, Oct 28, 2023, In Transit, $4,500.00
- #PO-2023-002, Techcom Solutions, Oct 28, 2023, Pending, $4,500.00
- #PO-2023-003, Techcom Solutions, Oct 28, 2023, Fulfilled, $2,500.00
- #PO-2023-004, Techcom Solutions, Dec 17, 2023, Fulfilled, $1,700.00
- #PO-2023-005, Techcom Solutions, Nov 20, 2023, Fulfilled, $3,500.00

**Order ID Links Navigate to Order Details**
Given the UpcomingOrdersTable displays order rows,
When the user clicks the Order ID link "#PO-2023-001",
Then the user is navigated to /orders/PO-2023-001 (the OrderDetailsPage for that order).

**Order ID Links Are Styled as Clickable**
Given the UpcomingOrdersTable displays order rows,
When the table loads,
Then each Order ID is displayed as a blue underlined link, indicating it is clickable.

**Status Badges with Correct Colors**
Given the UpcomingOrdersTable displays orders with various statuses,
When the table loads,
Then each order's status is displayed as a color-coded badge:
- "In Transit" displayed with a blue/teal badge
- "Pending" displayed with a yellow badge
- "Fulfilled" displayed with a green badge

**Filter by Status Dropdown**
Given the UpcomingOrdersTable displays orders with statuses "In Transit", "Pending", and "Fulfilled",
When the user clicks the first "Filter" dropdown in the top-right of the UpcomingOrdersTable and selects "Pending",
Then only orders with status "Pending" are displayed in the table,
And when the user clears the filter (selects "All" or resets),
Then all upcoming orders are shown again.

**Filter by Supplier Dropdown**
Given the UpcomingOrdersTable displays orders from multiple suppliers,
When the user clicks the second filter dropdown in the top-right of the UpcomingOrdersTable and selects a specific supplier,
Then only orders from that supplier are displayed in the table,
And when the user clears the filter,
Then all upcoming orders are shown again.

**Both Filters Applied Together**
Given the user has selected a status filter of "Pending" and a supplier filter,
When both filters are active,
Then only orders matching both the selected status and selected supplier are displayed,
And when one filter is cleared, the remaining filter still applies.

**Empty State When No Orders Match Filters**
Given the user has applied filters that match no orders,
When the filters are active,
Then the table displays an empty state message such as "No upcoming orders match the selected filters."

**Empty State When No Upcoming Orders Exist**
Given no upcoming orders exist in the system,
When the DashboardPage loads,
Then the UpcomingOrdersTable section displays an empty state message such as "No upcoming orders."

**Currency Formatting in Total Cost Column**
Given orders have various total costs,
When the UpcomingOrdersTable loads,
Then the Total Cost column displays values with proper currency formatting (dollar sign, comma separators, two decimal places, e.g. "$4,500.00").

**Date Formatting in Expected Delivery Column**
Given orders have expected delivery dates,
When the UpcomingOrdersTable loads,
Then the Expected Delivery column displays dates in "MMM DD, YYYY" format (e.g. "Oct 28, 2023").

### SuppliersList

**Display Suppliers List Heading**
Given the user is on the DashboardPage,
When the page loads,
Then the SuppliersList section displays the heading "Suppliers List".

**Display Supplier Cards in Grid Layout**
Given there are eight suppliers in the system,
When the DashboardPage loads,
Then the SuppliersList displays supplier cards in a grid layout with up to four cards per row.

**Supplier Card Displays Supplier Name**
Given a supplier "Apex Logistics" exists,
When the DashboardPage loads,
Then the supplier card for "Apex Logistics" displays the supplier name in bold text at the top-left of the card.

**Supplier Card Displays Status Badge**
Given a supplier "Apex Logistics" has status "Active",
When the DashboardPage loads,
Then the supplier card displays a status badge in the top-right corner showing "Active" with a green background.
Status badges should be color-coded: "Active" green, "On Hold" yellow/amber.

**Supplier Card Displays Contact Name**
Given a supplier has primary contact "John Smith",
When the DashboardPage loads,
Then the supplier card displays the contact name "John Smith" below the supplier name.

**Supplier Card Displays Contact Email**
Given a supplier has contact email "jane.doe@example.com",
When the DashboardPage loads,
Then the supplier card displays the email "jane.doe@example.com" below the contact name.

**Supplier Card Displays Orders Summary**
Given a supplier has 3 open orders totaling $12k in value,
When the DashboardPage loads,
Then the supplier card displays a summary line "3 Open Orders, $12k Value" at the bottom of the card.

**Supplier Card Shows All Fields Together**
Given a supplier "Global Sourcing Inc." exists with status "On Hold", contact "John Smith", email "jane.doe@example.com", and 3 open orders worth $12k,
When the DashboardPage loads,
Then the card for "Global Sourcing Inc." shows:
- "Global Sourcing Inc." (bold, top-left)
- "On Hold" badge (yellow/amber, top-right)
- "John Smith" (contact name)
- "jane.doe@example.com" (email)
- "3 Open Orders, $12k Value" (summary)

**Clicking Supplier Card Navigates to Supplier Details**
Given the SuppliersList displays supplier cards,
When the user clicks on the card for "Apex Logistics",
Then the user is navigated to /suppliers/<supplierId> (the SupplierDetailsPage for Apex Logistics).

**Multiple Supplier Cards Displayed**
Given there are eight suppliers in the system,
When the DashboardPage loads,
Then all eight supplier cards are displayed in the grid:
- Apex Logistics (Active)
- Global Sourcing Inc. (On Hold)
- Binmant Inc. (On Hold)
- Minmer Logistics (Active)
- Charralets Inc. (On Hold)
- Merianastillers Inc. (Active)
- Apex Logistics (Active)
- Peaor Logistics (Active)

**Empty State When No Suppliers Exist**
Given no suppliers exist in the system,
When the DashboardPage loads,
Then the SuppliersList section displays an empty state message such as "No suppliers found. Click 'Add New Supplier' to get started."

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

**Edit Order Dialog Cancel Does Not Modify Order**
Given the "Edit Order" dialog is open and the user has changed the status,
When the user clicks "Cancel" or closes the dialog,
Then the dialog closes,
And the order status and expected delivery date remain unchanged in the OrderSummary.

**Edit Order Dialog Validation**
Given the "Edit Order" dialog is open,
When the user clears the expected delivery date field and clicks "Save",
Then a validation error is shown on the expected delivery field and the dialog does not close.

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

**Add Line Item Dialog Cancel Does Not Add Item**
Given the "Add Line Item" dialog is open and the user has entered some data,
When the user clicks "Cancel" or closes the dialog,
Then no line item is added,
And the LineItemsTable row count remains unchanged.

**Add Line Item Dialog Validation**
Given the "Add Line Item" dialog is open,
When the user attempts to save without filling in the required Item Name / Description field,
Then a validation error is shown on the Item Name / Description field and the dialog does not close.

**Edit Line Item Dialog Cancel Does Not Modify Item**
Given the "Edit Line Item" dialog is open for an existing line item and the user has changed the quantity,
When the user clicks "Cancel" or closes the dialog,
Then the dialog closes,
And the line item's quantity and other fields remain unchanged in the LineItemsTable.

**Delete Line Item Confirmation Dismiss Does Not Delete Item**
Given the delete confirmation dialog is open for a line item,
When the user clicks "Cancel" to dismiss the confirmation,
Then the confirmation dialog closes,
And the line item remains in the LineItemsTable,
And the row count is unchanged.

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

**Upload Document Dialog Cancel Does Not Upload**
Given the upload document dialog is open after selecting a file,
When the user clicks "Cancel" or closes the dialog,
Then the dialog closes,
And no document is added to the document list,
And the document count remains unchanged.

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
