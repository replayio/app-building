# InventoryTracker Test Specification

## DashboardPage (/)

Components: NavigationHeader, DateRangeFilter, CategoryFilter, LowInventoryAlerts, MaterialsCategoriesOverview, RecentTransactionsTable, NewTransactionButton

### NavigationHeader

**Test: Navigation header displays app branding and all navigation links**
- Components: NavigationHeader
- Given: The user loads any page in the app
- Then: The header displays the app name "InventoryFlow" with a logo/icon on the left
- And: The header shows navigation links in order: Accounts, Materials, Batches, Transactions, Settings
- And: The header shows a user avatar/icon with "Admin" label on the right

**Test: Navigation link for Accounts navigates to AccountsPage**
- Components: NavigationHeader
- Given: The user is on the Dashboard page
- When: The user clicks the "Accounts" navigation link
- Then: The app navigates to /accounts (AccountsPage)

**Test: Navigation link for Materials navigates to MaterialsPage**
- Components: NavigationHeader
- Given: The user is on the Dashboard page
- When: The user clicks the "Materials" navigation link
- Then: The app navigates to /materials (MaterialsPage)

**Test: Navigation link for Batches navigates to batch listing**
- Components: NavigationHeader
- Given: The user is on the Dashboard page
- When: The user clicks the "Batches" navigation link
- Then: The app navigates to a batches listing page

**Test: Navigation link for Transactions navigates to TransactionsPage**
- Components: NavigationHeader
- Given: The user is on the Dashboard page
- When: The user clicks the "Transactions" navigation link
- Then: The app navigates to /transactions (TransactionsPage)

**Test: Navigation link for Settings navigates to Settings page**
- Components: NavigationHeader
- Given: The user is on the Dashboard page
- When: The user clicks the "Settings" navigation link
- Then: The app navigates to a settings page

**Test: Active navigation link is visually highlighted for the current page**
- Components: NavigationHeader
- Given: The user is on the Dashboard page (/)
- Then: The current page's navigation link (or the app logo/name) has a visually distinct active state (e.g., different color, underline, or bold)
- When: The user navigates to /accounts
- Then: The "Accounts" link becomes visually highlighted

### LowInventoryAlerts

**Test: Low inventory alerts section displays with heading and warning icon**
- Components: LowInventoryAlerts
- Given: There are materials with quantities below their reorder point
- Then: The "Low Inventory Alerts" section displays with a warning icon and the heading "Low Inventory Alerts"

**Test: Each low inventory alert shows severity, material name, current quantity, and reorder point**
- Components: LowInventoryAlerts
- Given: "Steel Bolts M6" has current quantity 150 units and reorder point 200 units
- And: "Aluminum Sheets" has current quantity 25 kg and reorder point 100 kg
- And: "Copper Wire" has current quantity 80 m and reorder point 150 m
- Then: Each alert row shows a severity indicator icon (Warning or Critical triangle icon)
- And: Each alert shows the severity label ("Warning" or "Critical")
- And: Each alert shows the material name, current quantity with unit, and reorder point with unit
- And: "Aluminum Sheets" is marked as "Critical" because its quantity is far below the reorder point
- And: "Steel Bolts M6" and "Copper Wire" are marked as "Warning"

**Test: Low inventory alert View Details link navigates to material detail page**
- Components: LowInventoryAlerts
- Given: A low inventory alert is displayed for "Steel Bolts M6"
- When: The user clicks the "View Details >" link on the "Steel Bolts M6" alert
- Then: The app navigates to the MaterialDetailPage for "Steel Bolts M6" (/materials/:materialId)

**Test: Low inventory alert Dismiss button removes the alert**
- Components: LowInventoryAlerts
- Given: A low inventory alert is displayed for "Copper Wire"
- When: The user clicks the "Dismiss" button on the "Copper Wire" alert
- Then: The "Copper Wire" alert is removed from the alerts list
- And: The other alerts remain visible
- And: The dismissal is persisted so the alert does not reappear on page reload (until inventory changes again)

**Test: Low inventory alert Reorder button opens new transaction pre-filled for reorder**
- Components: LowInventoryAlerts
- Given: A low inventory alert is displayed for "Steel Bolts M6"
- When: The user clicks the "Reorder" button on the "Steel Bolts M6" alert
- Then: The app navigates to the NewTransactionPage (/transactions/new) or opens a new transaction modal
- And: The transaction form is pre-filled with "Steel Bolts M6" as the material to reorder

**Test: Low inventory alerts section shows empty state when no materials are below reorder point**
- Components: LowInventoryAlerts
- Given: All materials have quantities at or above their reorder points
- Then: The "Low Inventory Alerts" section displays an empty state message (e.g., "No low inventory alerts") or the section is hidden

### MaterialsCategoriesOverview

**Test: Materials categories overview section displays with heading and icon**
- Components: MaterialsCategoriesOverview
- Given: Materials exist in the system across multiple categories
- Then: The "Materials Categories Overview" section displays with an icon and the heading "Materials Categories Overview"

**Test: Each category column shows category name, total items count, and total units count**
- Components: MaterialsCategoriesOverview
- Given: The "Raw Materials" category has 450 items totaling 3,200 units
- And: The "Finished Goods" category has 120 items totaling 550 units
- And: The "Packaging" category has 80 items totaling 900 units
- Then: Three category columns are displayed side by side
- And: Each column header shows the category name in bold followed by "(Total: X Items, Y Units)"
- And: "Raw Materials" shows "(Total: 450 Items, 3,200 Units)"
- And: "Finished Goods" shows "(Total: 120 Items, 550 Units)"
- And: "Packaging" shows "(Total: 80 Items, 900 Units)"

**Test: Each category shows a sample of materials with names and quantities**
- Components: MaterialsCategoriesOverview
- Given: "Raw Materials" category contains Iron Rods (1,200 units), Plastic Granules (800 kg), Wood Planks (500 pieces)
- Then: Under "Raw Materials", the section lists material names with their quantities and units
- And: Each material entry shows the format "Material Name: Quantity unit" (e.g., "Iron Rods: 1,200 units")

**Test: Clicking a material name navigates to the material detail page**
- Components: MaterialsCategoriesOverview
- Given: The "Raw Materials" category lists "Iron Rods" as a clickable link
- When: The user clicks on "Iron Rods"
- Then: The app navigates to the MaterialDetailPage for Iron Rods (/materials/:materialId)

**Test: View All Categories link navigates to MaterialsPage**
- Components: MaterialsCategoriesOverview
- Given: The Materials Categories Overview section is displayed
- When: The user clicks the "View All Categories" link at the bottom of the section
- Then: The app navigates to /materials (MaterialsPage)

**Test: Materials categories overview updates when category filter is applied**
- Components: MaterialsCategoriesOverview, CategoryFilter
- Given: The category filter is set to "All Categories" and all categories are shown
- When: The user selects "Raw Materials" from the category filter
- Then: The Materials Categories Overview shows only the "Raw Materials" category column
- And: Other categories are hidden

### RecentTransactionsTable

**Test: Recent transactions table displays with correct column headers**
- Components: RecentTransactionsTable
- Given: Transactions exist in the system
- Then: The "Recent Transactions" section displays with the heading "Recent Transactions"
- And: The table has columns: Date, Reference, Accounts Affected, Materials & Amounts, Action

**Test: Recent transactions table shows transaction rows with correct data**
- Components: RecentTransactionsTable
- Given: A transaction exists with date "Oct 25, 2023", reference "TRX-20231025-001", accounts "Supplier A -> Warehouse", and materials "Steel Bolts M6: +500 units; Copper Wire: +200 m"
- Then: The transaction row shows the date, reference ID, source and destination accounts with arrow notation, and materials with signed quantities and units

**Test: Recent transactions table shows multiple transactions in reverse chronological order**
- Components: RecentTransactionsTable
- Given: Multiple transactions exist with different dates
- Then: The table displays the most recent transactions first, ordered by date descending

**Test: View Full Details link navigates to TransactionDetailPage**
- Components: RecentTransactionsTable
- Given: A transaction row for "TRX-20231025-001" is displayed
- When: The user clicks the "View Full Details >" link in the Action column
- Then: The app navigates to /transactions/:transactionId (TransactionDetailPage) for that transaction

**Test: View All Transactions link navigates to TransactionsPage**
- Components: RecentTransactionsTable
- Given: The Recent Transactions section is displayed
- When: The user clicks the "View All Transactions" link at the bottom of the table
- Then: The app navigates to /transactions (TransactionsPage)

**Test: Recent transactions table updates when date range filter is applied**
- Components: RecentTransactionsTable, DateRangeFilter
- Given: The date range filter is set to Oct 1 - Oct 31, 2023
- And: Transactions from October and September exist
- Then: Only transactions within the Oct 1 - Oct 31 date range are shown in the table
- When: The user changes the date range to Sep 1 - Sep 30, 2023
- Then: The table updates to show only September transactions

**Test: Recent transactions table shows empty state when no transactions exist**
- Components: RecentTransactionsTable
- Given: No transactions exist in the system (or none match the current filters)
- Then: The table shows an empty state message (e.g., "No recent transactions")

### DateRangeFilter

**Test: Date range filter displays with label, date range, and calendar icon**
- Components: DateRangeFilter
- Given: The user is on the Dashboard page
- Then: A "Filter by Date:" label is shown followed by a date range picker
- And: The date range picker displays start and end dates (e.g., "Oct 1, 2023 - Oct 31, 2023")
- And: A calendar icon is shown that can be clicked to open a date picker

**Test: Clicking the date range picker opens a calendar to select dates**
- Components: DateRangeFilter
- Given: The date range filter shows "Oct 1, 2023 - Oct 31, 2023"
- When: The user clicks on the date range or the calendar icon
- Then: A calendar/date picker popover opens allowing the user to select a new start and end date

**Test: Selecting a new date range updates all dashboard widgets**
- Components: DateRangeFilter, LowInventoryAlerts, MaterialsCategoriesOverview, RecentTransactionsTable
- Given: The date range is set to Oct 1 - Oct 31, 2023
- When: The user selects a new date range of Sep 1 - Sep 30, 2023
- Then: The Recent Transactions table updates to show only transactions from September
- And: The Low Inventory Alerts and Materials Categories Overview sections update to reflect inventory state within the selected range

### CategoryFilter

**Test: Category filter displays as a dropdown with "All Categories" default**
- Components: CategoryFilter
- Given: The user is on the Dashboard page
- Then: A "Category Filter:" label is shown followed by a dropdown
- And: The dropdown displays "All Categories" as the default selection

**Test: Opening the category filter dropdown lists all material categories**
- Components: CategoryFilter
- Given: Material categories "Raw Materials", "Finished Goods", and "Packaging" exist
- When: The user clicks the category filter dropdown
- Then: A dropdown menu opens showing "All Categories" and each existing category name

**Test: Selecting a category filters dashboard content to that category**
- Components: CategoryFilter, LowInventoryAlerts, MaterialsCategoriesOverview
- Given: The category filter is set to "All Categories"
- When: The user selects "Raw Materials" from the dropdown
- Then: The Low Inventory Alerts section shows only alerts for materials in the "Raw Materials" category
- And: The Materials Categories Overview shows only the "Raw Materials" category

**Test: Selecting "All Categories" resets the filter to show all data**
- Components: CategoryFilter
- Given: The category filter is set to "Raw Materials"
- When: The user selects "All Categories" from the dropdown
- Then: All dashboard sections return to showing data across all categories

### NewTransactionButton

**Test: New Transaction button is displayed prominently with plus icon**
- Components: NewTransactionButton
- Given: The user is on the Dashboard page
- Then: A prominent "+ New Transaction" button is visible in the top-right area of the page
- And: The button has a plus (+) icon and the text "New Transaction"
- And: The button is styled as a primary action button (e.g., blue/filled)

**Test: Clicking New Transaction button navigates to NewTransactionPage**
- Components: NewTransactionButton
- Given: The user is on the Dashboard page
- When: The user clicks the "+ New Transaction" button
- Then: The app navigates to /transactions/new (NewTransactionPage) or opens a new transaction modal

---

## AccountsPage (/accounts)

Components: SidebarNavigation, StockAccountsList, InputAccountsList, OutputAccountsList, CreateAccountButton, AccountRowActions

### SidebarNavigation

**Test: Sidebar displays navigation links with Accounts link active**
- Components: SidebarNavigation
- Given: The user navigates to the Accounts page (/accounts)
- Then: The sidebar displays navigation links: Dashboard, Inventory (expandable), Orders, Accounts, Reports, Settings
- And: The "Accounts" link is visually highlighted as active

**Test: Breadcrumb displays Home / Accounts**
- Components: SidebarNavigation
- Given: The user is on the Accounts page
- Then: A breadcrumb trail "Home / Accounts" is displayed below the page header
- And: "Home" is a clickable link that navigates to the Dashboard (/)

### StockAccountsList

**Test: Stock Accounts section displays with heading and table**
- Components: StockAccountsList
- Given: The user navigates to the Accounts page
- Then: A "Stock Accounts" section heading is displayed
- And: A table is shown below the heading with column headers: Account Name, Account Type, Description, Actions

**Test: Stock Accounts table shows default Main Inventory account with "(Default)" badge**
- Components: StockAccountsList
- Given: The system has a default stock account "Main Inventory"
- Then: The Stock Accounts table displays a row for "Main Inventory"
- And: The Account Type column shows "Stock (Default)" indicating it is the default stock account
- And: The Description column shows "Primary storage for all physical goods."

**Test: Stock Accounts table shows additional stock accounts**
- Components: StockAccountsList
- Given: Stock accounts "Raw Materials", "Finished Goods", and "Safety Stock" exist
- Then: The Stock Accounts table displays rows for each account
- And: "Raw Materials" shows Account Type "Stock" and Description "Components for manufacturing."
- And: "Finished Goods" shows Account Type "Stock" and Description "Completed products ready for sale."
- And: "Safety Stock" shows Account Type "Stock" and Description "Buffer inventory for emergencies."

**Test: Clicking a stock account row navigates to Account Detail page**
- Components: StockAccountsList
- Given: The Stock Accounts table shows "Main Inventory"
- When: The user clicks on the "Main Inventory" row (anywhere except the action icons)
- Then: The app navigates to /accounts/:accountId (AccountDetailPage) for "Main Inventory"

**Test: Stock Accounts table shows empty state when no stock accounts exist beyond default**
- Components: StockAccountsList
- Given: Only the default "Main Inventory" stock account exists
- Then: The Stock Accounts table shows exactly one row for "Main Inventory"

### InputAccountsList

**Test: Input Accounts section displays with heading and table**
- Components: InputAccountsList
- Given: The user navigates to the Accounts page
- Then: An "Input Accounts" section heading is displayed below the Stock Accounts section
- And: A table is shown below the heading with column headers: Account Name, Account Type, Description, Actions

**Test: Input Accounts table shows default Purchases account with "(Default)" badge**
- Components: InputAccountsList
- Given: The system has a default input account "Purchases"
- Then: The Input Accounts table displays a row for "Purchases"
- And: The Account Type column shows "Input (Default)" indicating it is the default input account
- And: The Description column shows "General account for acquiring stock."

**Test: Input Accounts table shows additional input accounts**
- Components: InputAccountsList
- Given: Input accounts "Vendor Credits" and "Shipping Costs (Inbound)" exist
- Then: The Input Accounts table displays rows for each account
- And: "Vendor Credits" shows Account Type "Input" and Description "Credits received from suppliers."
- And: "Shipping Costs (Inbound)" shows Account Type "Input" and Description "Freight and delivery fees for purchases."

**Test: Clicking an input account row navigates to Account Detail page**
- Components: InputAccountsList
- Given: The Input Accounts table shows "Purchases"
- When: The user clicks on the "Purchases" row (anywhere except the action icons)
- Then: The app navigates to /accounts/:accountId (AccountDetailPage) for "Purchases"

### OutputAccountsList

**Test: Output Accounts section displays with heading and table**
- Components: OutputAccountsList
- Given: The user navigates to the Accounts page
- Then: An "Output Accounts" section heading is displayed below the Input Accounts section
- And: A table is shown below the heading with column headers: Account Name, Account Type, Description, Actions

**Test: Output Accounts table shows default Sales Revenue account with "(Default)" badge**
- Components: OutputAccountsList
- Given: The system has a default output account "Sales Revenue"
- Then: The Output Accounts table displays a row for "Sales Revenue"
- And: The Account Type column shows "Output (Default)" indicating it is the default output account
- And: The Description column shows "Income from product sales."

**Test: Output Accounts table shows additional output accounts**
- Components: OutputAccountsList
- Given: Output accounts "Service Income" and "Customer Discounts" exist
- Then: The Output Accounts table displays rows for each account
- And: "Service Income" shows Account Type "Output" and Description "Revenue from non-product services."
- And: "Customer Discounts" shows Account Type "Output" and Description "Reductions given to customers."

**Test: Clicking an output account row navigates to Account Detail page**
- Components: OutputAccountsList
- Given: The Output Accounts table shows "Sales Revenue"
- When: The user clicks on the "Sales Revenue" row (anywhere except the action icons)
- Then: The app navigates to /accounts/:accountId (AccountDetailPage) for "Sales Revenue"

### CreateAccountButton

**Test: Create Stock Account button is displayed with plus icon next to Stock Accounts heading**
- Components: CreateAccountButton, StockAccountsList
- Given: The user is on the Accounts page
- Then: A "+ Create Stock Account" button is displayed to the right of the "Stock Accounts" heading
- And: The button has a plus (+) icon and the text "Create Stock Account"
- And: The button is styled as a primary action button (blue/filled)

**Test: Clicking Create Stock Account button opens a create account modal for stock type**
- Components: CreateAccountButton
- Given: The user is on the Accounts page
- When: The user clicks the "+ Create Stock Account" button
- Then: A modal dialog opens with the title "Create Stock Account"
- And: The modal contains form fields for: Account Name (text input), Description (text area)
- And: The Account Type is pre-set to "Stock" and cannot be changed
- And: The modal has "Create" (or "Save") and "Cancel" buttons

**Test: Submitting the create stock account form adds a new stock account**
- Components: CreateAccountButton, StockAccountsList
- Given: The create stock account modal is open
- When: The user enters "Quarantine Storage" in the Account Name field
- And: The user enters "Holding area for quality inspection items." in the Description field
- And: The user clicks the "Create" button
- Then: The modal closes
- And: A new row for "Quarantine Storage" appears in the Stock Accounts table with type "Stock" and the entered description
- And: The new account is persisted to the database

**Test: Create account modal validates that Account Name is required**
- Components: CreateAccountButton
- Given: The create stock account modal is open
- And: The Account Name field is empty
- When: The user clicks the "Create" button
- Then: A validation error is displayed indicating that Account Name is required
- And: The modal remains open and the account is not created

**Test: Cancel button in create account modal closes the modal without creating an account**
- Components: CreateAccountButton
- Given: The create stock account modal is open and the user has entered some data
- When: The user clicks the "Cancel" button
- Then: The modal closes
- And: No new account is created in the Stock Accounts table

**Test: Create Input Account button is displayed next to Input Accounts heading**
- Components: CreateAccountButton, InputAccountsList
- Given: The user is on the Accounts page
- Then: A "+ Create Input Account" button is displayed to the right of the "Input Accounts" heading
- And: The button has a plus (+) icon and the text "Create Input Account"

**Test: Clicking Create Input Account button opens a create account modal for input type**
- Components: CreateAccountButton
- Given: The user is on the Accounts page
- When: The user clicks the "+ Create Input Account" button
- Then: A modal dialog opens with the title "Create Input Account"
- And: The Account Type is pre-set to "Input" and cannot be changed
- And: The modal contains form fields for Account Name and Description

**Test: Submitting the create input account form adds a new input account**
- Components: CreateAccountButton, InputAccountsList
- Given: The create input account modal is open
- When: The user enters "Returns" in the Account Name field
- And: The user enters "Goods returned by customers." in the Description field
- And: The user clicks the "Create" button
- Then: The modal closes
- And: A new row for "Returns" appears in the Input Accounts table with type "Input" and the entered description

**Test: Create Output Account button is displayed next to Output Accounts heading**
- Components: CreateAccountButton, OutputAccountsList
- Given: The user is on the Accounts page
- Then: A "+ Create Output Account" button is displayed to the right of the "Output Accounts" heading
- And: The button has a plus (+) icon and the text "Create Output Account"

**Test: Clicking Create Output Account button opens a create account modal for output type**
- Components: CreateAccountButton
- Given: The user is on the Accounts page
- When: The user clicks the "+ Create Output Account" button
- Then: A modal dialog opens with the title "Create Output Account"
- And: The Account Type is pre-set to "Output" and cannot be changed
- And: The modal contains form fields for Account Name and Description

**Test: Submitting the create output account form adds a new output account**
- Components: CreateAccountButton, OutputAccountsList
- Given: The create output account modal is open
- When: The user enters "Waste Disposal" in the Account Name field
- And: The user enters "Materials discarded or written off." in the Description field
- And: The user clicks the "Create" button
- Then: The modal closes
- And: A new row for "Waste Disposal" appears in the Output Accounts table with type "Output" and the entered description

### AccountRowActions

**Test: Each account row displays View, Edit, and Archive action icons**
- Components: AccountRowActions
- Given: An account row "Main Inventory" is displayed in the Stock Accounts table
- Then: The Actions column shows three icon buttons: an eye icon (View), a pencil icon (Edit), and an archive/trash icon (Archive)

**Test: Clicking the View action icon navigates to Account Detail page**
- Components: AccountRowActions
- Given: The "Raw Materials" row is displayed in the Stock Accounts table
- When: The user clicks the eye (View) icon in the Actions column for "Raw Materials"
- Then: The app navigates to /accounts/:accountId (AccountDetailPage) for "Raw Materials"

**Test: Clicking the Edit action icon opens an edit account modal with pre-filled data**
- Components: AccountRowActions
- Given: The "Vendor Credits" row is displayed in the Input Accounts table
- When: The user clicks the pencil (Edit) icon in the Actions column for "Vendor Credits"
- Then: A modal dialog opens with the title "Edit Account"
- And: The Account Name field is pre-filled with "Vendor Credits"
- And: The Description field is pre-filled with "Credits received from suppliers."
- And: The Account Type field shows "Input" and is read-only
- And: The modal has "Save" and "Cancel" buttons

**Test: Submitting the edit account modal updates the account data**
- Components: AccountRowActions, InputAccountsList
- Given: The edit modal is open for "Vendor Credits"
- When: The user changes the Account Name to "Supplier Credits"
- And: The user changes the Description to "Credits and refunds from suppliers."
- And: The user clicks the "Save" button
- Then: The modal closes
- And: The Input Accounts table row now shows "Supplier Credits" with the updated description
- And: The change is persisted to the database

**Test: Canceling the edit account modal discards changes**
- Components: AccountRowActions
- Given: The edit modal is open for "Vendor Credits" and the user has changed the name
- When: The user clicks the "Cancel" button
- Then: The modal closes
- And: The account row still shows the original "Vendor Credits" name and description

**Test: Clicking the Archive action icon shows a confirmation dialog**
- Components: AccountRowActions
- Given: The "Safety Stock" row is displayed in the Stock Accounts table
- When: The user clicks the archive icon in the Actions column for "Safety Stock"
- Then: A confirmation dialog appears asking "Are you sure you want to archive this account?"
- And: The dialog has "Archive" (or "Confirm") and "Cancel" buttons

**Test: Confirming archive removes the account from the active list**
- Components: AccountRowActions, StockAccountsList
- Given: The archive confirmation dialog is shown for "Safety Stock"
- When: The user clicks the "Archive" (or "Confirm") button
- Then: The dialog closes
- And: "Safety Stock" is removed from the Stock Accounts table
- And: The archived account is persisted as archived in the database

**Test: Canceling archive keeps the account in the active list**
- Components: AccountRowActions
- Given: The archive confirmation dialog is shown for "Safety Stock"
- When: The user clicks the "Cancel" button
- Then: The dialog closes
- And: "Safety Stock" remains in the Stock Accounts table unchanged

**Test: Default accounts cannot be archived**
- Components: AccountRowActions
- Given: The "Main Inventory" row is displayed with type "Stock (Default)"
- Then: The archive icon for "Main Inventory" is either disabled (grayed out) or hidden
- And: The user cannot archive the default account

**Test: Action icons work identically across all three account category tables**
- Components: AccountRowActions, StockAccountsList, InputAccountsList, OutputAccountsList
- Given: Accounts exist in Stock, Input, and Output tables
- Then: Each account row in all three tables has the same View, Edit, and Archive action icons
- And: The View icon navigates to the respective AccountDetailPage for each account
- And: The Edit icon opens the edit modal pre-filled with that account's data
- And: The Archive icon triggers the confirmation dialog for that account

---

## AccountDetailPage (/accounts/:accountId)

Components: AccountHeader, EditAccountButton, NewTransactionButton, TrackedMaterialsTable

### AccountHeader

**Test: Account header displays account name with "Account:" prefix**
- Components: AccountHeader
- Given: The user navigates to the Account Detail page for "Finished Goods Warehouse 2"
- Then: The header displays "Account: Finished Goods Warehouse 2" as a large heading

**Test: Account header displays account type**
- Components: AccountHeader
- Given: The user navigates to the Account Detail page for "Finished Goods Warehouse 2" which has type "Inventory Account"
- Then: The header displays "Type: Inventory Account" below the account name

**Test: Account header displays status badge for active account**
- Components: AccountHeader
- Given: The user navigates to the Account Detail page for "Finished Goods Warehouse 2" which has status "Active"
- Then: The header displays "Status:" followed by an "Active" badge styled in green

**Test: Account header displays status badge for archived account**
- Components: AccountHeader
- Given: The user navigates to the Account Detail page for an archived account
- Then: The header displays "Status:" followed by an "Archived" badge styled in a muted/gray color

**Test: Account header shows correct type for each account category**
- Components: AccountHeader
- Given: A stock account "Main Inventory" exists with type "Stock"
- And: An input account "Purchases" exists with type "Input"
- And: An output account "Sales Revenue" exists with type "Output"
- When: The user navigates to each account's detail page
- Then: The Type field shows the respective account type for each account

**Test: Breadcrumb displays Home / Accounts / Account Name**
- Components: AccountHeader
- Given: The user navigates to the Account Detail page for "Finished Goods Warehouse 2"
- Then: A breadcrumb trail "Home / Accounts / Finished Goods Warehouse 2" is displayed
- And: "Home" is a clickable link that navigates to the Dashboard (/)
- And: "Accounts" is a clickable link that navigates to /accounts (AccountsPage)

**Test: Sidebar shows Accounts link as active on Account Detail page**
- Components: AccountHeader
- Given: The user navigates to the Account Detail page
- Then: The sidebar "Accounts" link is visually highlighted as the active page

### EditAccountButton

**Test: Edit Account button is displayed with pencil icon**
- Components: EditAccountButton
- Given: The user is on the Account Detail page for "Finished Goods Warehouse 2"
- Then: An "Edit Account" button is displayed in the top-right area of the header
- And: The button has a pencil/edit icon and the text "Edit Account"
- And: The button is styled as a secondary/outlined button

**Test: Clicking Edit Account button opens edit modal with pre-filled data**
- Components: EditAccountButton
- Given: The user is on the Account Detail page for "Finished Goods Warehouse 2" with description "Secondary warehouse for finished products"
- When: The user clicks the "Edit Account" button
- Then: A modal dialog opens with the title "Edit Account"
- And: The Account Name field is pre-filled with "Finished Goods Warehouse 2"
- And: The Description field is pre-filled with the account's current description
- And: The Account Type field shows "Inventory Account" and is read-only
- And: The modal has "Save" and "Cancel" buttons

**Test: Submitting edit account modal updates account header immediately**
- Components: EditAccountButton, AccountHeader
- Given: The edit account modal is open for "Finished Goods Warehouse 2"
- When: The user changes the Account Name to "Finished Goods Warehouse 3"
- And: The user clicks the "Save" button
- Then: The modal closes
- And: The account header updates to show "Account: Finished Goods Warehouse 3"
- And: The change is persisted to the database

**Test: Canceling edit account modal discards changes**
- Components: EditAccountButton
- Given: The edit account modal is open for "Finished Goods Warehouse 2"
- And: The user has changed the Account Name to "Something Else"
- When: The user clicks the "Cancel" button
- Then: The modal closes
- And: The account header still shows "Account: Finished Goods Warehouse 2"

**Test: Edit account modal validates that Account Name is required**
- Components: EditAccountButton
- Given: The edit account modal is open
- When: The user clears the Account Name field
- And: The user clicks the "Save" button
- Then: A validation error is displayed indicating that Account Name is required
- And: The modal remains open and changes are not saved

### NewTransactionButton

**Test: New Transaction button is displayed with plus icon**
- Components: NewTransactionButton
- Given: The user is on the Account Detail page for "Finished Goods Warehouse 2"
- Then: A "+ New Transaction" button is displayed in the top-right area of the header, next to the Edit Account button
- And: The button has a plus (+) icon and the text "New Transaction"
- And: The button is styled as a primary action button (filled blue)

**Test: Clicking New Transaction button navigates to NewTransactionPage pre-filled with this account**
- Components: NewTransactionButton
- Given: The user is on the Account Detail page for "Finished Goods Warehouse 2"
- When: The user clicks the "+ New Transaction" button
- Then: The app navigates to /transactions/new (NewTransactionPage)
- And: The transaction form is pre-filled with "Finished Goods Warehouse 2" as one of the accounts in the quantity transfers section

### TrackedMaterialsTable

**Test: Tracked Materials section displays with heading**
- Components: TrackedMaterialsTable
- Given: The user navigates to the Account Detail page for an account that tracks materials
- Then: A "Tracked Materials" heading is displayed below the account header

**Test: Tracked Materials table displays correct column headers**
- Components: TrackedMaterialsTable
- Given: The user navigates to the Account Detail page
- Then: The Tracked Materials table shows columns: Material Name, Category, Unit of Measure, Total Quantity, Number of Batches, Actions

**Test: Tracked Materials table shows material rows with correct data**
- Components: TrackedMaterialsTable
- Given: The account "Finished Goods Warehouse 2" tracks "Steel Sheets (3mm)" in category "Raw Materials" with unit "Sheets", total quantity 1,250.0 across 12 batches
- And: The account tracks "Aluminum Extrusion A" in category "Components" with unit "Meters", total quantity 4,500.0 across 8 batches
- Then: A row for "Steel Sheets (3mm)" shows Material Name "Steel Sheets (3mm)", Category "Raw Materials", Unit of Measure "Sheets", Total Quantity "1,250.0 Sheets" with a sum indicator "(Σ Batches)", and Number of Batches "12 Batches"
- And: A row for "Aluminum Extrusion A" shows Material Name "Aluminum Extrusion A", Category "Components", Unit of Measure "Meters", Total Quantity "4,500.0 Meters" with "(Σ Batches)", and Number of Batches "8 Batches"

**Test: Total Quantity column shows sum across all batches with Σ indicator**
- Components: TrackedMaterialsTable
- Given: The account tracks "Polymer Granules (Blue)" with 3 batches: 250.5 kg, 200.0 kg, and 300.0 kg
- Then: The Total Quantity column shows "750.5 kg" with a "(Σ Batches)" notation indicating the value is summed across batches

**Test: View Material in this Account action button navigates to material detail filtered for this account**
- Components: TrackedMaterialsTable
- Given: A row for "Steel Sheets (3mm)" is displayed in the Tracked Materials table for account "Finished Goods Warehouse 2"
- When: The user clicks the "View Material in this Account" button (with external link icon) for "Steel Sheets (3mm)"
- Then: The app navigates to the MaterialDetailPage for "Steel Sheets (3mm)" (/materials/:materialId) with context indicating the current account

**Test: Tracked Materials table shows multiple materials with different categories and units**
- Components: TrackedMaterialsTable
- Given: The account tracks materials across different categories:
  - "Steel Sheets (3mm)" — Raw Materials — Sheets — 1,250.0 — 12 Batches
  - "Aluminum Extrusion A" — Components — Meters — 4,500.0 — 8 Batches
  - "Polymer Granules (Blue)" — Raw Materials — Kilograms — 750.5 — 15 Batches
  - "Copper Wiring (Rolls)" — Components — Meters — 2,100.0 — 5 Batches
  - "Circuit Boards (Model X)" — Sub-Assemblies — Units — 350 — 20 Batches
- Then: All five material rows are displayed in the table with the correct data for each column

**Test: Tracked Materials table shows empty state when account has no tracked materials**
- Components: TrackedMaterialsTable
- Given: The user navigates to an account that has no materials tracked
- Then: The Tracked Materials table shows an empty state message (e.g., "No materials tracked in this account")

**Test: Clicking a material name in the table navigates to the material detail page**
- Components: TrackedMaterialsTable
- Given: A row for "Copper Wiring (Rolls)" is displayed
- When: The user clicks on the material name "Copper Wiring (Rolls)"
- Then: The app navigates to /materials/:materialId (MaterialDetailPage) for "Copper Wiring (Rolls)"

**Test: Account Detail page loads correctly when navigated from Accounts page row click**
- Components: AccountHeader, TrackedMaterialsTable
- Given: The user is on the Accounts page (/accounts)
- When: The user clicks on the "Main Inventory" row in the Stock Accounts table
- Then: The app navigates to /accounts/:accountId for "Main Inventory"
- And: The AccountHeader shows "Account: Main Inventory" with the correct type and status
- And: The TrackedMaterialsTable shows all materials tracked in the "Main Inventory" account

**Test: Account Detail page loads correctly when navigated from account row View action**
- Components: AccountHeader, TrackedMaterialsTable
- Given: The user is on the Accounts page (/accounts)
- When: The user clicks the View (eye) icon for "Raw Materials" in the Stock Accounts table
- Then: The app navigates to /accounts/:accountId for "Raw Materials"
- And: The AccountHeader shows "Account: Raw Materials" with the correct type and status

---

## MaterialsPage (/materials)

Components: NewMaterialButton, NewCategoryButton, SearchBar, CategoryFilter, AccountFilter, SortDropdown, MaterialsTable, Pagination

### NewMaterialButton

**Test: New Material button is displayed with plus icon as primary action**
- Components: NewMaterialButton
- Given: The user navigates to the Materials page (/materials)
- Then: A "+ New Material" button is displayed at the top of the page, above the filter bar
- And: The button has a plus (+) icon and the text "New Material"
- And: The button is styled as a primary action button (blue/filled)

**Test: Clicking New Material button opens a create material modal**
- Components: NewMaterialButton
- Given: The user is on the Materials page
- When: The user clicks the "+ New Material" button
- Then: A modal dialog opens with the title "Create Material" (or "New Material")
- And: The modal contains form fields for: Material Name (text input), Category (dropdown selecting from existing categories), Unit of Measure (text input), Description (text area)
- And: The modal has "Create" (or "Save") and "Cancel" buttons

**Test: Submitting the create material form adds a new material to the table**
- Components: NewMaterialButton, MaterialsTable
- Given: The create material modal is open
- When: The user enters "Titanium Rod 5mm" in the Material Name field
- And: The user selects "Raw Materials" from the Category dropdown
- And: The user enters "Rod" in the Unit of Measure field
- And: The user clicks the "Create" button
- Then: The modal closes
- And: The new material "Titanium Rod 5mm" appears in the MaterialsTable with Category "Raw Materials", Unit of Measure "Rod", and Stock "0"
- And: The new material is persisted to the database

**Test: Create material modal validates that Material Name is required**
- Components: NewMaterialButton
- Given: The create material modal is open
- And: The Material Name field is empty
- When: The user clicks the "Create" button
- Then: A validation error is displayed indicating that Material Name is required
- And: The modal remains open and the material is not created

**Test: Create material modal validates that Category is required**
- Components: NewMaterialButton
- Given: The create material modal is open
- When: The user fills in Material Name and Unit of Measure but leaves Category unselected
- And: The user clicks the "Create" button
- Then: A validation error is displayed indicating that Category is required
- And: The modal remains open and the material is not created

**Test: Create material modal validates that Unit of Measure is required**
- Components: NewMaterialButton
- Given: The create material modal is open
- When: The user fills in Material Name and Category but leaves Unit of Measure empty
- And: The user clicks the "Create" button
- Then: A validation error is displayed indicating that Unit of Measure is required
- And: The modal remains open and the material is not created

**Test: Cancel button in create material modal closes the modal without creating a material**
- Components: NewMaterialButton
- Given: The create material modal is open and the user has entered some data
- When: The user clicks the "Cancel" button
- Then: The modal closes
- And: No new material is created in the MaterialsTable

### NewCategoryButton

**Test: New Category button is displayed with plus icon as secondary action**
- Components: NewCategoryButton
- Given: The user navigates to the Materials page
- Then: A "+ New Category" button is displayed next to the "+ New Material" button
- And: The button has a plus (+) icon and the text "New Category"
- And: The button is styled as a secondary/outlined button

**Test: Clicking New Category button opens a create category modal**
- Components: NewCategoryButton
- Given: The user is on the Materials page
- When: The user clicks the "+ New Category" button
- Then: A modal dialog opens with the title "Create Category" (or "New Category")
- And: The modal contains a form field for: Category Name (text input)
- And: The modal has "Create" (or "Save") and "Cancel" buttons

**Test: Submitting the create category form adds a new category**
- Components: NewCategoryButton, CategoryFilter
- Given: The create category modal is open
- When: The user enters "Adhesives" in the Category Name field
- And: The user clicks the "Create" button
- Then: The modal closes
- And: The new category "Adhesives" is available in the CategoryFilter dropdown
- And: The new category appears as an option in the Category dropdown when creating or editing a material
- And: The new category is persisted to the database

**Test: Create category modal validates that Category Name is required**
- Components: NewCategoryButton
- Given: The create category modal is open
- And: The Category Name field is empty
- When: The user clicks the "Create" button
- Then: A validation error is displayed indicating that Category Name is required
- And: The modal remains open and the category is not created

**Test: Cancel button in create category modal closes the modal without creating a category**
- Components: NewCategoryButton
- Given: The create category modal is open and the user has entered a name
- When: The user clicks the "Cancel" button
- Then: The modal closes
- And: No new category is created

**Test: Newly created category appears in the Category dropdown when creating a material**
- Components: NewCategoryButton, NewMaterialButton
- Given: The user creates a new category "Adhesives" via the New Category modal
- When: The user opens the New Material modal
- And: The user clicks the Category dropdown
- Then: "Adhesives" is listed as an option in the Category dropdown alongside existing categories

### MaterialsTable

**Test: Breadcrumb displays Home > Materials**
- Components: MaterialsTable
- Given: The user navigates to the Materials page
- Then: A breadcrumb trail "Home > Materials" is displayed below the page heading
- And: "Home" is a clickable link that navigates to the Dashboard (/)

**Test: Sidebar shows Materials link as active**
- Components: MaterialsTable
- Given: The user navigates to the Materials page
- Then: The sidebar "Materials" link is visually highlighted as the active page

**Test: Materials table displays correct column headers**
- Components: MaterialsTable
- Given: The user navigates to the Materials page
- Then: The table shows columns: Material Name, Category, Unit of Measure, Stock, Actions

**Test: Materials table shows material rows with correct data**
- Components: MaterialsTable
- Given: Materials exist in the system including:
  - "Steel Sheet 10Ga" (Raw Materials, Sheet, 1,250)
  - "Aluminum Extrusion X-Profile" (Components, Meter, 850)
  - "Cardboard Box (Small)" (Packaging, Box, 5,000)
  - "Polycarbonate Pellets" (Raw Materials, kg, 2,400)
  - "M6 Bolt & Nut Set" (Components, Set, 10,500)
  - "Shrink Wrap Roll (Clear)" (Packaging, Roll, 120)
  - "Circuit Board v2.1" (Components, Piece, 450)
  - "Copper Wire 16AWG" (Raw Materials, Spool, 30)
- Then: Each material row displays the correct Material Name, Category, Unit of Measure, and Stock value

**Test: Actions column shows View Detail link, Edit link, eye icon, and pencil icon for each row**
- Components: MaterialsTable
- Given: A material row is displayed in the table
- Then: The Actions column shows a "[View Detail]" text link, an "[Edit]" text link, an eye icon button, and a pencil/edit icon button

**Test: Clicking View Detail link navigates to MaterialDetailPage**
- Components: MaterialsTable
- Given: A material row for "Steel Sheet 10Ga" is displayed
- When: The user clicks the "[View Detail]" link in the Actions column
- Then: The app navigates to /materials/:materialId (MaterialDetailPage) for "Steel Sheet 10Ga"

**Test: Clicking the eye icon navigates to MaterialDetailPage**
- Components: MaterialsTable
- Given: A material row for "Aluminum Extrusion X-Profile" is displayed
- When: The user clicks the eye icon in the Actions column
- Then: The app navigates to /materials/:materialId (MaterialDetailPage) for "Aluminum Extrusion X-Profile"

**Test: Clicking Edit link opens an edit material modal with pre-filled data**
- Components: MaterialsTable
- Given: A material row for "Polycarbonate Pellets" with Category "Raw Materials" and Unit "kg" is displayed
- When: The user clicks the "[Edit]" link in the Actions column for "Polycarbonate Pellets"
- Then: A modal dialog opens with the title "Edit Material"
- And: The Material Name field is pre-filled with "Polycarbonate Pellets"
- And: The Category dropdown is pre-set to "Raw Materials"
- And: The Unit of Measure field is pre-filled with "kg"
- And: The modal has "Save" and "Cancel" buttons

**Test: Clicking the pencil icon opens an edit material modal**
- Components: MaterialsTable
- Given: A material row for "Circuit Board v2.1" is displayed
- When: The user clicks the pencil icon in the Actions column
- Then: A modal dialog opens with the title "Edit Material" pre-filled with "Circuit Board v2.1" data

**Test: Submitting the edit material modal updates the material in the table**
- Components: MaterialsTable
- Given: The edit modal is open for "Polycarbonate Pellets"
- When: The user changes the Material Name to "Polycarbonate Pellets (Blue)"
- And: The user clicks the "Save" button
- Then: The modal closes
- And: The MaterialsTable row updates to show "Polycarbonate Pellets (Blue)"
- And: The change is persisted to the database

**Test: Canceling the edit material modal discards changes**
- Components: MaterialsTable
- Given: The edit modal is open for "Polycarbonate Pellets" and the user has changed the name
- When: The user clicks the "Cancel" button
- Then: The modal closes
- And: The MaterialsTable row still shows "Polycarbonate Pellets" with original data

**Test: Edit material modal validates that Material Name is required**
- Components: MaterialsTable
- Given: The edit material modal is open
- When: The user clears the Material Name field
- And: The user clicks the "Save" button
- Then: A validation error is displayed indicating that Material Name is required
- And: The modal remains open and changes are not saved

**Test: Clicking a material name in the table navigates to MaterialDetailPage**
- Components: MaterialsTable
- Given: A material row for "Steel Sheet 10Ga" is displayed
- When: The user clicks on the material name "Steel Sheet 10Ga" in the row
- Then: The app navigates to /materials/:materialId (MaterialDetailPage) for "Steel Sheet 10Ga"

**Test: Materials table shows empty state when no materials exist**
- Components: MaterialsTable
- Given: No materials exist in the system (or no materials match current filters)
- Then: The table shows an empty state message (e.g., "No materials found")

### SearchBar

**Test: Search bar is displayed with magnifying glass icon and placeholder text**
- Components: SearchBar
- Given: The user navigates to the Materials page
- Then: A search input is displayed in the filter/sort bar area
- And: The input has a magnifying glass (search) icon on the left
- And: The input shows placeholder text "Search materials by name..."

**Test: Typing in the search bar filters the materials table by name**
- Components: SearchBar, MaterialsTable
- Given: The MaterialsTable shows all materials (e.g., 45 items)
- When: The user types "Steel" in the search bar
- Then: The MaterialsTable updates to show only materials whose name contains "Steel" (e.g., "Steel Sheet 10Ga")
- And: Materials that don't match are hidden from the table
- And: The pagination updates to reflect the filtered result count

**Test: Search is case-insensitive**
- Components: SearchBar, MaterialsTable
- Given: Materials include "Steel Sheet 10Ga" and "Copper Wire 16AWG"
- When: The user types "steel" (lowercase) in the search bar
- Then: "Steel Sheet 10Ga" is shown in the results

**Test: Clearing the search bar shows all materials again**
- Components: SearchBar, MaterialsTable
- Given: The search bar contains "Steel" and the table shows filtered results
- When: The user clears the search bar (empties the text)
- Then: The MaterialsTable returns to showing all materials
- And: The pagination returns to its unfiltered state

**Test: Search with no matching results shows empty state**
- Components: SearchBar, MaterialsTable
- Given: No material name contains "XYZ123"
- When: The user types "XYZ123" in the search bar
- Then: The MaterialsTable shows an empty state message (e.g., "No materials found")

### CategoryFilter

**Test: Category filter dropdown displays with "Filter by Category" label**
- Components: CategoryFilter
- Given: The user navigates to the Materials page
- Then: A "Filter by Category" dropdown is displayed in the filter/sort bar
- And: The dropdown shows a default selection (e.g., "All Categories" or the label "Filter by Category")

**Test: Opening the category filter dropdown lists all material categories**
- Components: CategoryFilter
- Given: Material categories "Raw Materials", "Components", and "Packaging" exist
- When: The user clicks the category filter dropdown
- Then: A dropdown menu opens showing each existing category name: "Raw Materials", "Components", "Packaging"

**Test: Selecting a category filters the materials table to that category**
- Components: CategoryFilter, MaterialsTable
- Given: The materials table shows materials across all categories
- When: The user selects "Raw Materials" from the category filter dropdown
- Then: The MaterialsTable shows only materials in the "Raw Materials" category (e.g., "Steel Sheet 10Ga", "Polycarbonate Pellets", "Copper Wire 16AWG")
- And: Materials in other categories are hidden
- And: The pagination updates to reflect the filtered count

**Test: Selecting a different category updates the filter**
- Components: CategoryFilter, MaterialsTable
- Given: The category filter is set to "Raw Materials"
- When: The user selects "Components" from the category filter dropdown
- Then: The MaterialsTable updates to show only "Components" materials (e.g., "Aluminum Extrusion X-Profile", "M6 Bolt & Nut Set", "Circuit Board v2.1")

**Test: Resetting the category filter shows all materials**
- Components: CategoryFilter, MaterialsTable
- Given: The category filter is set to "Raw Materials"
- When: The user selects the default/all option to clear the category filter
- Then: The MaterialsTable returns to showing all materials across all categories

### AccountFilter

**Test: Account filter dropdown displays with "Filter by Account" label and "All Accounts" default**
- Components: AccountFilter
- Given: The user navigates to the Materials page
- Then: A "Filter by Account" dropdown is displayed in the filter/sort bar
- And: The dropdown shows "All Accounts" as the default selection

**Test: Opening the account filter dropdown lists all accounts**
- Components: AccountFilter
- Given: Accounts "Account A" and "Account B" exist in the system
- When: The user clicks the account filter dropdown
- Then: A dropdown menu opens showing "All Accounts" and each account name (e.g., "Account A", "Account B")

**Test: Selecting an account filters the materials table to materials in that account**
- Components: AccountFilter, MaterialsTable
- Given: "Account A" contains materials "Steel Sheet 10Ga" and "Copper Wire 16AWG"
- When: The user selects "Account A" from the account filter dropdown
- Then: The MaterialsTable shows only materials tracked in "Account A"
- And: Materials not in "Account A" are hidden
- And: The pagination updates to reflect the filtered count

**Test: Selecting "All Accounts" resets the account filter**
- Components: AccountFilter, MaterialsTable
- Given: The account filter is set to "Account A"
- When: The user selects "All Accounts" from the account filter dropdown
- Then: The MaterialsTable returns to showing all materials across all accounts

### SortDropdown

**Test: Sort dropdown displays with "Sort by: Name (A-Z)" as default**
- Components: SortDropdown
- Given: The user navigates to the Materials page
- Then: A sort dropdown is displayed in the filter/sort bar with the text "Sort by: Name (A-Z)"

**Test: Opening the sort dropdown shows available sort options**
- Components: SortDropdown
- Given: The user is on the Materials page
- When: The user clicks the sort dropdown
- Then: A dropdown menu opens showing sort options: "Name (A-Z)", "Name (Z-A)", "Stock (Low to High)", "Stock (High to Low)", "Category (A-Z)"

**Test: Selecting "Name (Z-A)" sorts the table in reverse alphabetical order**
- Components: SortDropdown, MaterialsTable
- Given: The table is sorted by "Name (A-Z)"
- When: The user selects "Name (Z-A)" from the sort dropdown
- Then: The MaterialsTable rows are reordered so that material names appear in reverse alphabetical order (Z to A)
- And: The sort dropdown label updates to "Sort by: Name (Z-A)"

**Test: Selecting "Stock (Low to High)" sorts the table by stock ascending**
- Components: SortDropdown, MaterialsTable
- Given: The table is sorted by name
- When: The user selects "Stock (Low to High)" from the sort dropdown
- Then: The MaterialsTable rows are reordered so that materials with the lowest stock appear first (e.g., "Copper Wire 16AWG" with 30 at the top)

**Test: Selecting "Stock (High to Low)" sorts the table by stock descending**
- Components: SortDropdown, MaterialsTable
- Given: The table is sorted by name
- When: The user selects "Stock (High to Low)" from the sort dropdown
- Then: The MaterialsTable rows are reordered so that materials with the highest stock appear first (e.g., "M6 Bolt & Nut Set" with 10,500 at the top)

### Pagination

**Test: Pagination displays page numbers, navigation buttons, and item count**
- Components: Pagination
- Given: There are 45 materials and the page size is 8
- Then: The pagination section shows "Previous" and "Next" buttons
- And: Page numbers 1, 2, 3 (and possibly more) are displayed
- And: The current page (1) is visually highlighted
- And: A "Showing 1-8 of 45 items" text is displayed

**Test: Clicking Next button navigates to the next page**
- Components: Pagination, MaterialsTable
- Given: The user is on page 1 of the materials table showing items 1-8
- When: The user clicks the "Next" button
- Then: The MaterialsTable updates to show items 9-16
- And: The pagination text updates to "Showing 9-16 of 45 items"
- And: Page 2 is visually highlighted

**Test: Clicking a page number navigates directly to that page**
- Components: Pagination, MaterialsTable
- Given: The user is on page 1
- When: The user clicks page number "3"
- Then: The MaterialsTable updates to show items 17-24
- And: The pagination text updates to "Showing 17-24 of 45 items"
- And: Page 3 is visually highlighted

**Test: Clicking Previous button navigates to the previous page**
- Components: Pagination, MaterialsTable
- Given: The user is on page 2 showing items 9-16
- When: The user clicks the "Previous" button
- Then: The MaterialsTable updates to show items 1-8
- And: The pagination text updates to "Showing 1-8 of 45 items"
- And: Page 1 is visually highlighted

**Test: Previous button is disabled on first page**
- Components: Pagination
- Given: The user is on page 1 of the materials table
- Then: The "Previous" button is disabled (grayed out or not clickable)

**Test: Next button is disabled on last page**
- Components: Pagination
- Given: The user is on the last page of the materials table (e.g., page 6 showing items 41-45)
- Then: The "Next" button is disabled (grayed out or not clickable)
- And: The pagination text shows "Showing 41-45 of 45 items"

**Test: Pagination updates when filters reduce the number of results**
- Components: Pagination, CategoryFilter, MaterialsTable
- Given: The unfiltered table shows 45 materials across 6 pages
- When: The user selects "Packaging" from the category filter which has only 5 materials
- Then: The pagination shows only 1 page
- And: The pagination text shows "Showing 1-5 of 5 items"
- And: The "Previous" and "Next" buttons are both disabled

**Test: Filters and search work together to narrow results**
- Components: SearchBar, CategoryFilter, AccountFilter, MaterialsTable, Pagination
- Given: The user has selected "Raw Materials" from the category filter
- When: The user types "Steel" in the search bar
- Then: The MaterialsTable shows only raw materials with "Steel" in the name (e.g., "Steel Sheet 10Ga")
- And: The pagination updates to reflect the combined filter results

---

## MaterialDetailPage (/materials/:materialId)

Components: MaterialHeader, EditMaterialButton, NewBatchButton, NewTransactionButton, AccountsDistributionTable, AllBatchesTable, TransactionsHistoryTable

### MaterialHeader

**Test: Material header displays material name as large heading**
- Components: MaterialHeader
- Given: The user navigates to the Material Detail page for "Carbon Fiber Sheets"
- Then: The header displays "Carbon Fiber Sheets" as a large heading

**Test: Material header displays category and unit of measure**
- Components: MaterialHeader
- Given: The user navigates to the Material Detail page for "Carbon Fiber Sheets" which has category "Composite" and unit of measure "sq meters"
- Then: The header displays "Category: Composite | Unit of Measure: sq meters" below the material name

**Test: Material header displays material description**
- Components: MaterialHeader
- Given: The user navigates to the Material Detail page for "Carbon Fiber Sheets" which has description "High-strength, lightweight composite sheets used for structural applications and panels. Standard grade."
- Then: The header displays the description text below the category/unit line

**Test: Breadcrumb displays Home > Materials > Material Name**
- Components: MaterialHeader
- Given: The user navigates to the Material Detail page for "Carbon Fiber Sheets"
- Then: A breadcrumb trail "Home > Materials > Carbon Fiber Sheets" is displayed above the material header
- And: "Home" is a clickable link that navigates to the Dashboard (/)
- And: "Materials" is a clickable link that navigates to /materials (MaterialsPage)

**Test: Sidebar shows Materials link as active on Material Detail page**
- Components: MaterialHeader
- Given: The user navigates to the Material Detail page
- Then: The sidebar "Materials" link is visually highlighted as the active page

### EditMaterialButton

**Test: Edit Material button is displayed with secondary styling**
- Components: EditMaterialButton
- Given: The user is on the Material Detail page for "Carbon Fiber Sheets"
- Then: An "Edit Material" button is displayed in the top-right area of the header
- And: The button is styled as a secondary/outlined button

**Test: Clicking Edit Material button opens edit modal with pre-filled data**
- Components: EditMaterialButton
- Given: The user is on the Material Detail page for "Carbon Fiber Sheets" with category "Composite", unit "sq meters", and a description
- When: The user clicks the "Edit Material" button
- Then: A modal dialog opens with the title "Edit Material"
- And: The Material Name field is pre-filled with "Carbon Fiber Sheets"
- And: The Category dropdown is pre-set to "Composite"
- And: The Unit of Measure field is pre-filled with "sq meters"
- And: The Description field is pre-filled with the current description
- And: The modal has "Save" and "Cancel" buttons

**Test: Submitting edit material modal updates material header immediately**
- Components: EditMaterialButton, MaterialHeader
- Given: The edit material modal is open for "Carbon Fiber Sheets"
- When: The user changes the Material Name to "Carbon Fiber Sheets (Premium)"
- And: The user clicks the "Save" button
- Then: The modal closes
- And: The material header updates to show "Carbon Fiber Sheets (Premium)"
- And: The change is persisted to the database

**Test: Canceling edit material modal discards changes**
- Components: EditMaterialButton
- Given: The edit material modal is open for "Carbon Fiber Sheets"
- And: The user has changed the Material Name to "Something Else"
- When: The user clicks the "Cancel" button
- Then: The modal closes
- And: The material header still shows "Carbon Fiber Sheets"

**Test: Edit material modal validates that Material Name is required**
- Components: EditMaterialButton
- Given: The edit material modal is open
- When: The user clears the Material Name field
- And: The user clicks the "Save" button
- Then: A validation error is displayed indicating that Material Name is required
- And: The modal remains open and changes are not saved

**Test: Edit material modal validates that Category is required**
- Components: EditMaterialButton
- Given: The edit material modal is open
- When: The user clears the Category selection
- And: The user clicks the "Save" button
- Then: A validation error is displayed indicating that Category is required
- And: The modal remains open and changes are not saved

**Test: Edit material modal validates that Unit of Measure is required**
- Components: EditMaterialButton
- Given: The edit material modal is open
- When: The user clears the Unit of Measure field
- And: The user clicks the "Save" button
- Then: A validation error is displayed indicating that Unit of Measure is required
- And: The modal remains open and changes are not saved

### NewBatchButton

**Test: New Batch button is displayed with filled/primary styling**
- Components: NewBatchButton
- Given: The user is on the Material Detail page for "Carbon Fiber Sheets"
- Then: A "New Batch" button is displayed in the top-right area of the header, next to the Edit Material button
- And: The button is styled as a primary action button (filled blue)

**Test: Clicking New Batch button opens a create batch modal pre-filled with this material**
- Components: NewBatchButton
- Given: The user is on the Material Detail page for "Carbon Fiber Sheets"
- When: The user clicks the "New Batch" button
- Then: A modal dialog opens with the title "Create Batch" (or "New Batch")
- And: The Material field is pre-filled with "Carbon Fiber Sheets" and is read-only
- And: The modal contains form fields for: Account (dropdown of available accounts), Quantity (number input), and optional properties (Location, Lot Number, Expiration Date)
- And: The modal has "Create" and "Cancel" buttons

**Test: Submitting the create batch form adds a new batch**
- Components: NewBatchButton, AllBatchesTable, AccountsDistributionTable
- Given: The create batch modal is open with material "Carbon Fiber Sheets"
- When: The user selects "Warehouse A - Main Storage" from the Account dropdown
- And: The user enters "300" in the Quantity field
- And: The user clicks the "Create" button
- Then: The modal closes
- And: A new batch appears in the All Batches table with the entered quantity and location "Warehouse A"
- And: The Accounts Distribution table updates to reflect the new batch count and quantity for "Warehouse A - Main Storage"
- And: The new batch is persisted to the database

**Test: Create batch modal validates that Account is required**
- Components: NewBatchButton
- Given: The create batch modal is open
- And: The Account dropdown is not selected
- When: The user clicks the "Create" button
- Then: A validation error is displayed indicating that Account is required
- And: The modal remains open and the batch is not created

**Test: Create batch modal validates that Quantity is required and positive**
- Components: NewBatchButton
- Given: The create batch modal is open
- And: The Quantity field is empty or set to 0
- When: The user clicks the "Create" button
- Then: A validation error is displayed indicating that Quantity must be a positive number
- And: The modal remains open and the batch is not created

**Test: Cancel button in create batch modal closes the modal without creating a batch**
- Components: NewBatchButton
- Given: The create batch modal is open and the user has entered some data
- When: The user clicks the "Cancel" button
- Then: The modal closes
- And: No new batch is created

### NewTransactionButton

**Test: New Transaction button is displayed with filled/primary styling**
- Components: NewTransactionButton
- Given: The user is on the Material Detail page for "Carbon Fiber Sheets"
- Then: A "New Transaction" button is displayed in the top-right area of the header, next to the New Batch button
- And: The button is styled as a primary action button (filled blue)

**Test: Clicking New Transaction button navigates to NewTransactionPage pre-filled with this material**
- Components: NewTransactionButton
- Given: The user is on the Material Detail page for "Carbon Fiber Sheets"
- When: The user clicks the "New Transaction" button
- Then: The app navigates to /transactions/new (NewTransactionPage)
- And: The transaction form is pre-filled with "Carbon Fiber Sheets" as the material in the batch allocation or quantity transfers section

### AccountsDistributionTable

**Test: Accounts Distribution section displays with heading**
- Components: AccountsDistributionTable
- Given: The user navigates to the Material Detail page for a material that exists in multiple accounts
- Then: An "Accounts Distribution" section heading is displayed below the material header

**Test: Accounts Distribution table displays correct column headers**
- Components: AccountsDistributionTable
- Given: The user navigates to the Material Detail page
- Then: The Accounts Distribution table shows columns: Account Name, Account Type, Quantity (with unit), Number of Batches, Link

**Test: Accounts Distribution table shows account rows with correct data**
- Components: AccountsDistributionTable
- Given: "Carbon Fiber Sheets" exists in "Warehouse A - Main Storage" (Storage, 1,200 sq m, 3 batches) and "Production Line B" (Manufacturing, 450 sq m, 1 batch)
- Then: A row for "Warehouse A - Main Storage" shows Account Name "Warehouse A - Main Storage", Account Type "Storage", Quantity "1,200", Number of Batches "3", and a "View Account" link
- And: A row for "Production Line B" shows Account Name "Production Line B", Account Type "Manufacturing", Quantity "450", Number of Batches "1", and a "View Account" link

**Test: View Account link navigates to the AccountDetailPage for that account**
- Components: AccountsDistributionTable
- Given: The row for "Warehouse A - Main Storage" is displayed with a "View Account" link
- When: The user clicks the "View Account" link on the "Warehouse A - Main Storage" row
- Then: The app navigates to /accounts/:accountId (AccountDetailPage) for "Warehouse A - Main Storage"

**Test: Expanding an account row reveals nested batches in that account**
- Components: AccountsDistributionTable
- Given: The row for "Warehouse A - Main Storage" has an expand/collapse chevron
- When: The user clicks the chevron on the "Warehouse A - Main Storage" row
- Then: A nested sub-table expands below the row with the heading "Batches in Warehouse A - Main Storage"
- And: The sub-table shows columns: Batch ID, Quantity (sq m), Unit, Created Date
- And: The sub-table displays rows for each batch in that account (e.g., B-2023-001 with 500 sq m, Oct 15, 2023 and B-2023-005 with 700 sq m, Oct 22, 2023)

**Test: Collapsing an expanded account row hides the nested batches**
- Components: AccountsDistributionTable
- Given: The "Warehouse A - Main Storage" row is expanded showing its batches
- When: The user clicks the chevron on the "Warehouse A - Main Storage" row again
- Then: The nested batch sub-table collapses and is hidden
- And: The chevron icon rotates back to its collapsed orientation

**Test: Nested batch rows show correct data for each batch**
- Components: AccountsDistributionTable
- Given: The "Warehouse A - Main Storage" row is expanded
- Then: Batch "B-2023-001" shows Quantity "500", Unit "sq m", Created Date "Oct 15, 2023"
- And: Batch "B-2023-005" shows Quantity "700", Unit "sq m", Created Date "Oct 22, 2023"

**Test: Clicking a Batch ID in the nested table navigates to BatchDetailPage**
- Components: AccountsDistributionTable
- Given: The "Warehouse A - Main Storage" row is expanded showing its batches
- When: The user clicks on the Batch ID "B-2023-001" in the nested sub-table
- Then: The app navigates to /batches/:batchId (BatchDetailPage) for batch "B-2023-001"

**Test: Account with one batch shows single nested row when expanded**
- Components: AccountsDistributionTable
- Given: "Production Line B" has 1 batch for this material
- When: The user clicks the chevron on the "Production Line B" row
- Then: A nested sub-table expands showing exactly one batch row

**Test: Accounts Distribution table shows empty state when material is not in any account**
- Components: AccountsDistributionTable
- Given: The user navigates to a material detail page for a material with no batches in any account
- Then: The Accounts Distribution section shows an empty state message (e.g., "This material is not tracked in any account")

### AllBatchesTable

**Test: All Batches section displays with heading**
- Components: AllBatchesTable
- Given: The user navigates to the Material Detail page for a material with batches
- Then: An "All Batches" section heading is displayed below the Accounts Distribution section

**Test: All Batches table displays correct column headers**
- Components: AllBatchesTable
- Given: The user navigates to the Material Detail page
- Then: The All Batches table shows columns: Batch ID, Location, Quantity (with unit), Created Date, Actions

**Test: All Batches table shows batch rows with correct data**
- Components: AllBatchesTable
- Given: "Carbon Fiber Sheets" has batches B-2023-001 (Warehouse A, 500 sq m, Oct 15, 2023), B-2023-005 (Warehouse A, 700 sq m, Oct 22, 2023), and B-2023-010 (Production Line B, 450 sq m, Nov 01, 2023)
- Then: A row for "B-2023-001" shows Batch ID "B-2023-001", Location "Warehouse A", Quantity "500", Created Date "Oct 15, 2023", and a "View Lineage" link
- And: A row for "B-2023-005" shows Batch ID "B-2023-005", Location "Warehouse A", Quantity "700", Created Date "Oct 22, 2023", and a "View Lineage" link
- And: A row for "B-2023-010" shows Batch ID "B-2023-010", Location "Production Line B", Quantity "450", Created Date "Nov 01, 2023", and a "View Lineage" link

**Test: View Lineage link navigates to BatchDetailPage for that batch**
- Components: AllBatchesTable
- Given: The row for batch "B-2023-001" shows a "View Lineage" link with a chain link icon
- When: The user clicks the "View Lineage" link on the "B-2023-001" row
- Then: The app navigates to /batches/:batchId (BatchDetailPage) for batch "B-2023-001"

**Test: Clicking a Batch ID navigates to BatchDetailPage**
- Components: AllBatchesTable
- Given: A row for batch "B-2023-005" is displayed
- When: The user clicks on the Batch ID "B-2023-005"
- Then: The app navigates to /batches/:batchId (BatchDetailPage) for batch "B-2023-005"

**Test: Filter by Account dropdown displays with "All Accounts" default**
- Components: AllBatchesTable
- Given: The user navigates to the Material Detail page
- Then: A "Filter by Account:" dropdown is displayed above the All Batches table with default value "[All Accounts]"

**Test: Opening the Filter by Account dropdown lists all accounts containing this material**
- Components: AllBatchesTable
- Given: "Carbon Fiber Sheets" exists in "Warehouse A - Main Storage" and "Production Line B"
- When: The user clicks the "Filter by Account" dropdown
- Then: The dropdown shows "[All Accounts]", "Warehouse A - Main Storage", and "Production Line B"

**Test: Selecting an account from the Filter by Account dropdown filters batches to that account**
- Components: AllBatchesTable
- Given: The All Batches table shows batches across all accounts
- When: The user selects "Warehouse A - Main Storage" from the "Filter by Account" dropdown
- Then: The table shows only batches in "Warehouse A" (B-2023-001 and B-2023-005)
- And: Batch B-2023-010 (Production Line B) is hidden

**Test: Selecting "All Accounts" resets the account filter**
- Components: AllBatchesTable
- Given: The "Filter by Account" dropdown is set to "Warehouse A - Main Storage"
- When: The user selects "[All Accounts]" from the dropdown
- Then: The All Batches table shows batches across all accounts again

**Test: Filter by Date dropdown displays with "All Dates" default**
- Components: AllBatchesTable
- Given: The user navigates to the Material Detail page
- Then: A "Filter by Date:" dropdown is displayed next to the Account filter with default value "[All Dates]"

**Test: Opening the Filter by Date dropdown shows date range options**
- Components: AllBatchesTable
- Given: The user is on the Material Detail page
- When: The user clicks the "Filter by Date" dropdown
- Then: The dropdown shows date range options such as "[All Dates]", "Last 7 Days", "Last 30 Days", "Last 90 Days", or a custom date range picker

**Test: Selecting a date range from the Filter by Date dropdown filters batches by created date**
- Components: AllBatchesTable
- Given: The All Batches table shows batches created on Oct 15, Oct 22, and Nov 01
- When: The user selects a date range that only includes October dates
- Then: Only batches B-2023-001 (Oct 15) and B-2023-005 (Oct 22) are shown
- And: Batch B-2023-010 (Nov 01) is hidden

**Test: Account and Date filters work together to narrow results**
- Components: AllBatchesTable
- Given: The All Batches table shows batches across multiple accounts and dates
- When: The user selects "Warehouse A - Main Storage" from the Account filter
- And: The user selects a date range that includes only Oct 15
- Then: Only batch B-2023-001 (Warehouse A, Oct 15, 2023) is shown

**Test: All Batches table shows empty state when no batches exist**
- Components: AllBatchesTable
- Given: The user navigates to a material detail page for a material with no batches
- Then: The All Batches table shows an empty state message (e.g., "No batches found for this material")

**Test: All Batches table shows empty state when filters match no batches**
- Components: AllBatchesTable
- Given: The user applies an account filter that has no batches for this material
- Then: The All Batches table shows an empty state message (e.g., "No batches found")

### TransactionsHistoryTable

**Test: Transactions History section displays with heading**
- Components: TransactionsHistoryTable
- Given: The user navigates to the Material Detail page for a material involved in transactions
- Then: A "Transactions History" section heading is displayed below the All Batches section

**Test: Transactions History table displays correct column headers**
- Components: TransactionsHistoryTable
- Given: The user navigates to the Material Detail page
- Then: The Transactions History table shows columns: Date, Transaction ID, Accounts Involved, Batch References, Quantity Moved (with unit)

**Test: Transactions History table shows transaction rows with correct data**
- Components: TransactionsHistoryTable
- Given: "Carbon Fiber Sheets" has transactions: T-2311-567 (Nov 05, 2023, Warehouse A → Production Line B, B-2023-010, 450 sq m), T-2310-210 (Oct 25, 2023, Supplier X → Warehouse A, B-2023-005, 700 sq m), T-2310-015 (Oct 15, 2023, Supplier X → Warehouse A, B-2023-001, 500 sq m)
- Then: A row for "T-2311-567" shows Date "Nov 05, 2023", Transaction ID "T-2311-567", Accounts Involved "Warehouse A → Production Line B", Batch References "B-2023-010", Quantity Moved "450"
- And: A row for "T-2310-210" shows Date "Oct 25, 2023", Transaction ID "T-2310-210", Accounts Involved "Supplier X → Warehouse A", Batch References "B-2023-005", Quantity Moved "700"
- And: A row for "T-2310-015" shows Date "Oct 15, 2023", Transaction ID "T-2310-015", Accounts Involved "Supplier X → Warehouse A", Batch References "B-2023-001", Quantity Moved "500"

**Test: Accounts Involved column shows arrow notation between source and destination**
- Components: TransactionsHistoryTable
- Given: A transaction moves material from "Warehouse A" to "Production Line B"
- Then: The Accounts Involved column displays "Warehouse A → Production Line B" with an arrow symbol between the source and destination account names

**Test: Clicking a Transaction ID navigates to TransactionDetailPage**
- Components: TransactionsHistoryTable
- Given: A transaction row for "T-2311-567" is displayed
- When: The user clicks on the Transaction ID "T-2311-567"
- Then: The app navigates to /transactions/:transactionId (TransactionDetailPage) for that transaction

**Test: Clicking a Batch Reference navigates to BatchDetailPage**
- Components: TransactionsHistoryTable
- Given: A transaction row shows Batch References "B-2023-010"
- When: The user clicks on the batch reference "B-2023-010"
- Then: The app navigates to /batches/:batchId (BatchDetailPage) for batch "B-2023-010"

**Test: Filter by Type dropdown displays with "All Types" default**
- Components: TransactionsHistoryTable
- Given: The user navigates to the Material Detail page
- Then: A "Filter by Type:" dropdown is displayed above the Transactions History table with default value "[All Types]"

**Test: Opening the Filter by Type dropdown lists transaction type options**
- Components: TransactionsHistoryTable
- Given: The user is on the Material Detail page
- When: The user clicks the "Filter by Type" dropdown
- Then: The dropdown shows options such as "[All Types]", "Purchase", "Consumption", "Transfer", and any other transaction types in the system

**Test: Selecting a transaction type from the Filter by Type dropdown filters transactions**
- Components: TransactionsHistoryTable
- Given: The Transactions History table shows transactions of different types
- When: The user selects "Transfer" from the "Filter by Type" dropdown
- Then: Only transactions of type "Transfer" are shown (e.g., T-2311-567 Warehouse A → Production Line B)
- And: Transactions of other types are hidden

**Test: Selecting "All Types" resets the type filter**
- Components: TransactionsHistoryTable
- Given: The "Filter by Type" dropdown is set to "Transfer"
- When: The user selects "[All Types]" from the dropdown
- Then: The Transactions History table shows all transactions again regardless of type

**Test: Filter by Date dropdown displays with "Last 30 Days" default**
- Components: TransactionsHistoryTable
- Given: The user navigates to the Material Detail page
- Then: A "Filter by Date:" dropdown is displayed next to the Type filter with default value "[Last 30 Days]"

**Test: Opening the Filter by Date dropdown shows date range options**
- Components: TransactionsHistoryTable
- Given: The user is on the Material Detail page
- When: The user clicks the "Filter by Date" dropdown
- Then: The dropdown shows date range options such as "[Last 7 Days]", "[Last 30 Days]", "[Last 90 Days]", "[All Time]", or a custom date range option

**Test: Selecting a different date range from the Filter by Date dropdown filters transactions**
- Components: TransactionsHistoryTable
- Given: The Transactions History table shows transactions from October and November
- When: The user selects "[Last 7 Days]" from the "Filter by Date" dropdown (assuming current date only covers recent transactions)
- Then: Only transactions within the last 7 days are shown
- And: Older transactions are hidden

**Test: Type and Date filters work together to narrow results**
- Components: TransactionsHistoryTable
- Given: Transactions of multiple types and dates exist
- When: The user selects "Purchase" from the Type filter
- And: The user selects "[Last 30 Days]" from the Date filter
- Then: Only purchase transactions within the last 30 days are shown

**Test: Transactions History table shows empty state when no transactions exist for this material**
- Components: TransactionsHistoryTable
- Given: The user navigates to a material detail page for a material with no transactions
- Then: The Transactions History table shows an empty state message (e.g., "No transactions found for this material")

**Test: Transactions History table shows empty state when filters match no transactions**
- Components: TransactionsHistoryTable
- Given: The user applies filters that match no transactions
- Then: The Transactions History table shows an empty state message (e.g., "No transactions found")

**Test: Transactions are displayed in reverse chronological order**
- Components: TransactionsHistoryTable
- Given: Transactions exist with dates Nov 05, Oct 25, and Oct 15
- Then: The table rows are ordered with the most recent transaction first (Nov 05 at the top, Oct 15 at the bottom)

**Test: Creating a new transaction from this page adds an entry to Transactions History**
- Components: TransactionsHistoryTable, NewTransactionButton
- Given: The user is on the Material Detail page for "Carbon Fiber Sheets"
- When: The user clicks "New Transaction", creates a transaction involving "Carbon Fiber Sheets", and returns to the Material Detail page
- Then: The new transaction appears in the Transactions History table
- And: The Accounts Distribution and All Batches sections also update to reflect any batch/quantity changes from the transaction

---

## BatchDetailPage (/batches/:batchId)

Components: BatchHeader, CreateNewTransactionButton, BatchOverview, LineageDiagram, UsageHistoryTable

### BatchHeader

**Test: Batch header displays batch ID as large heading with "Batch:" prefix**
- Components: BatchHeader
- Given: The user navigates to the Batch Detail page for batch "BATCH-12345"
- Then: The header displays "Batch: BATCH-12345" as a large heading

**Test: Batch header displays material name**
- Components: BatchHeader
- Given: The user navigates to the Batch Detail page for batch "BATCH-12345" which contains material "Organic Arabica Coffee Beans"
- Then: The header displays "Material" as a label followed by "Organic Arabica Coffee Beans" below it

**Test: Batch header displays account name**
- Components: BatchHeader
- Given: The user navigates to the Batch Detail page for batch "BATCH-12345" which is in account "Global Imports Inc."
- Then: The header displays "Account" as a label followed by "Global Imports Inc." below it

**Test: Batch header displays status badge with green indicator for active batch**
- Components: BatchHeader
- Given: The user navigates to the Batch Detail page for batch "BATCH-12345" which has status "Active"
- Then: The header displays "Status" as a label followed by "Active" with a green dot/circle indicator

**Test: Batch header displays status badge for depleted batch**
- Components: BatchHeader
- Given: The user navigates to the Batch Detail page for a batch with status "Depleted" (quantity is 0)
- Then: The header displays "Status" as a label followed by "Depleted" with a muted/gray or red indicator

**Test: Batch header displays created date and time**
- Components: BatchHeader
- Given: The user navigates to the Batch Detail page for batch "BATCH-12345" which was created on 2023-10-27 at 10:30 AM
- Then: The header displays a badge/pill showing "Created: 2023-10-27 at 10:30 AM"

**Test: Batch header displays originating transaction as clickable link**
- Components: BatchHeader
- Given: The user navigates to the Batch Detail page for batch "BATCH-12345" which was created by transaction "TX-PROD-987"
- Then: The header displays a badge/pill showing "Originating Transaction: TX-PROD-987"
- And: "TX-PROD-987" is styled as a clickable link

**Test: Clicking originating transaction link navigates to TransactionDetailPage**
- Components: BatchHeader
- Given: The batch header displays "Originating Transaction: TX-PROD-987"
- When: The user clicks on "TX-PROD-987" in the originating transaction badge
- Then: The app navigates to /transactions/:transactionId (TransactionDetailPage) for "TX-PROD-987"

**Test: Clicking material name navigates to MaterialDetailPage**
- Components: BatchHeader
- Given: The batch header displays material "Organic Arabica Coffee Beans"
- When: The user clicks on "Organic Arabica Coffee Beans" in the header
- Then: The app navigates to /materials/:materialId (MaterialDetailPage) for "Organic Arabica Coffee Beans"

**Test: Clicking account name navigates to AccountDetailPage**
- Components: BatchHeader
- Given: The batch header displays account "Global Imports Inc."
- When: The user clicks on "Global Imports Inc." in the header
- Then: The app navigates to /accounts/:accountId (AccountDetailPage) for "Global Imports Inc."

**Test: Sidebar shows Batches link as active on Batch Detail page**
- Components: BatchHeader
- Given: The user navigates to the Batch Detail page
- Then: The sidebar "Batches" link is visually highlighted as the active page

**Test: Breadcrumb displays navigation path to batch**
- Components: BatchHeader
- Given: The user navigates to the Batch Detail page for batch "BATCH-12345"
- Then: A breadcrumb trail is displayed (e.g., "Home > Batches > BATCH-12345")
- And: "Home" is a clickable link that navigates to the Dashboard (/)
- And: "Batches" is a clickable link that navigates to the batches listing page

### BatchOverview

**Test: Batch Overview section displays with heading**
- Components: BatchOverview
- Given: The user navigates to the Batch Detail page for batch "BATCH-12345"
- Then: A "Batch Overview" section heading is displayed on the left side of the page

**Test: Batch Overview displays "Current Quantity & Properties" card heading**
- Components: BatchOverview
- Given: The user navigates to the Batch Detail page for batch "BATCH-12345"
- Then: A card is displayed with the heading "Current Quantity & Properties"

**Test: Batch Overview displays current quantity prominently**
- Components: BatchOverview
- Given: Batch "BATCH-12345" has a current quantity of 1500.00 kg
- Then: The "Quantity" label is displayed followed by the value "1500.00 kg" in a large/prominent font size

**Test: Batch Overview displays unit of measure**
- Components: BatchOverview
- Given: Batch "BATCH-12345" has unit of measure "Kilograms (kg)"
- Then: The "Unit" label is displayed followed by the value "Kilograms (kg)"

**Test: Batch Overview displays location property with icon**
- Components: BatchOverview
- Given: Batch "BATCH-12345" has location "Warehouse A, Zone 4"
- Then: A location/pin icon is displayed followed by the label "Location" and the value "Warehouse A, Zone 4"

**Test: Batch Overview displays lot number property with icon**
- Components: BatchOverview
- Given: Batch "BATCH-12345" has lot number "LOT-2023-OCB"
- Then: A document/clipboard icon is displayed followed by the label "Lot Number" and the value "LOT-2023-OCB"

**Test: Batch Overview displays expiration date property with icon**
- Components: BatchOverview
- Given: Batch "BATCH-12345" has expiration date "2024-10-27"
- Then: A calendar icon is displayed followed by the label "Expiration Date" and the value "2024-10-27"

**Test: Batch Overview displays quality grade property with icon**
- Components: BatchOverview
- Given: Batch "BATCH-12345" has quality grade "Premium"
- Then: A quality/shield icon is displayed followed by the label "Quality Grade" and the value "Premium"

**Test: Batch Overview displays storage condition property with icon**
- Components: BatchOverview
- Given: Batch "BATCH-12345" has storage condition "Climate Controlled"
- Then: A temperature/thermometer icon is displayed followed by the label "Storage Condition" and the value "Climate Controlled"

**Test: Batch Overview shows all custom properties when present**
- Components: BatchOverview
- Given: Batch "BATCH-12345" has all custom properties set: Location "Warehouse A, Zone 4", Lot Number "LOT-2023-OCB", Expiration Date "2024-10-27", Quality Grade "Premium", Storage Condition "Climate Controlled"
- Then: All five property fields are displayed vertically below the quantity and unit, each with its respective icon, label, and value

**Test: Batch Overview omits optional properties when not set**
- Components: BatchOverview
- Given: A batch exists with no location, lot number, expiration date, quality grade, or storage condition set
- Then: Only the Quantity and Unit fields are displayed
- And: The optional property rows (Location, Lot Number, Expiration Date, Quality Grade, Storage Condition) are hidden or show a placeholder (e.g., "—" or "Not set")

**Test: Batch Overview quantity updates after a transaction modifies this batch**
- Components: BatchOverview, UsageHistoryTable
- Given: Batch "BATCH-12345" has current quantity 1500.00 kg
- When: A transaction is created that removes 500 kg from this batch
- And: The user returns to or refreshes the Batch Detail page
- Then: The Quantity field updates to show "1000.00 kg"
- And: The new transaction appears in the Usage History table

### LineageDiagram

**Test: Lineage section displays with heading**
- Components: LineageDiagram
- Given: The user navigates to the Batch Detail page for batch "BATCH-12345" which was created by transaction "TX-PROD-987"
- Then: A "Lineage" section heading is displayed on the right side of the page, next to the Batch Overview

**Test: Lineage section displays source transaction heading with transaction ID**
- Components: LineageDiagram
- Given: Batch "BATCH-12345" was created by transaction "TX-PROD-987"
- Then: The Lineage section displays "Source Transaction: TX-PROD-987" as a sub-heading

**Test: Lineage section displays inputs used with batch details**
- Components: LineageDiagram
- Given: Transaction "TX-PROD-987" used input batches:
  - BATCH-11001: Material "Raw Coffee Cherries", Quantity 1800.00 kg, Account "Farm Co-op"
  - BATCH-11002: Material "Water for Washing", Quantity 5000.00 L, Account "Facility Supplies"
- Then: An "Inputs Used:" label is displayed
- And: BATCH-11001 is shown as a clickable blue link with details: "Material: Raw Coffee Cherries", "Quantity: 1800.00 kg", "Account: Farm Co-op"
- And: BATCH-11002 is shown as a clickable blue link with details: "Material: Water for Washing", "Quantity: 5000.00 L", "Account: Facility Supplies"

**Test: Lineage section displays visual flow diagram with arrows**
- Components: LineageDiagram
- Given: Transaction "TX-PROD-987" used input batches and produced output batch "BATCH-12345"
- Then: A visual flow diagram is displayed showing:
  - Input batches on the left
  - Arrows flowing from inputs into a central box labeled with the transaction name and type (e.g., "Washing & Processing (TX-PROD-987)") and date "Date: 2023-10-27"
  - An arrow flowing from the central box to the output batch on the right

**Test: Lineage section displays output batch details**
- Components: LineageDiagram
- Given: Transaction "TX-PROD-987" produced batch "BATCH-12345" with material "Organic Arabica Coffee Beans", quantity 1500.0 kg, in account "Global Imports Inc."
- Then: The output section shows "Output:" label followed by "BATCH-12345" as a clickable blue link
- And: Below the batch ID: "Material: Organic Arabica Coffee Beans", "Quantity: 1500.0 kg", "Account: Global Imports Inc."

**Test: Clicking an input batch ID navigates to BatchDetailPage for that batch**
- Components: LineageDiagram
- Given: The Lineage section shows input batch "BATCH-11001" as a clickable link
- When: The user clicks on "BATCH-11001"
- Then: The app navigates to /batches/:batchId (BatchDetailPage) for batch "BATCH-11001"

**Test: Clicking the second input batch ID navigates to BatchDetailPage for that batch**
- Components: LineageDiagram
- Given: The Lineage section shows input batch "BATCH-11002" as a clickable link
- When: The user clicks on "BATCH-11002"
- Then: The app navigates to /batches/:batchId (BatchDetailPage) for batch "BATCH-11002"

**Test: Clicking the output batch ID navigates to BatchDetailPage for that batch**
- Components: LineageDiagram
- Given: The Lineage section shows output batch "BATCH-12345" as a clickable link
- When: The user clicks on "BATCH-12345" in the output section
- Then: The app navigates to /batches/:batchId (BatchDetailPage) for batch "BATCH-12345" (the current batch, effectively refreshing the page)

**Test: Lineage section shows empty state when batch has no originating transaction**
- Components: LineageDiagram
- Given: The user navigates to a Batch Detail page for a batch that was created directly (not produced by a transaction, e.g., manually entered initial stock)
- Then: The Lineage section displays an empty state message (e.g., "This batch was created directly — no source transaction" or "No lineage information available")

**Test: Lineage section handles single input batch**
- Components: LineageDiagram
- Given: A batch was produced by a transaction that used only one input batch
- Then: The Lineage section shows only one input batch entry under "Inputs Used:"
- And: The flow diagram shows one input arrow leading into the transaction box and one output arrow

**Test: Lineage section handles multiple input batches**
- Components: LineageDiagram
- Given: A batch was produced by a transaction that used three or more input batches
- Then: The Lineage section shows all input batch entries under "Inputs Used:"
- And: Each input batch shows its batch ID (clickable), material, quantity with unit, and account

### UsageHistoryTable

**Test: Usage History section displays with heading**
- Components: UsageHistoryTable
- Given: The user navigates to the Batch Detail page for batch "BATCH-12345"
- Then: A "Usage History" section heading is displayed below the Lineage section

**Test: Usage History table displays correct column headers**
- Components: UsageHistoryTable
- Given: The user navigates to the Batch Detail page
- Then: The Usage History table shows columns: Date & Time, Transaction ID, Type, Movement (In/Out), Amount (with unit), Created Batches

**Test: Usage History table shows transaction rows with correct data**
- Components: UsageHistoryTable
- Given: Batch "BATCH-12345" has the following usage history:
  - 2023-11-05, 14:20 | TX-PACK-221 | Packaging | Out | 500.00 kg | BATCH-12401, BATCH-12402
  - 2023-11-10, 09:15 | TX-ROAST-305 | Roasting | Out | 800.00 kg | BATCH-12500
  - 2023-11-12, 11:00 | TX-ADJ-054 | Inventory Adjustment | Out | 5.00 kg | —
  - 2023-10-27, 10:30 | TX-PROD-987 | Production | In | 1500.00 kg | —
- Then: A row for "TX-PACK-221" shows Date & Time "2023-11-05, 14:20", Transaction ID "TX-PACK-221", Type "Packaging", Movement "Out", Amount "500.00", Created Batches "BATCH-12401, BATCH-12402"
- And: A row for "TX-ROAST-305" shows Date & Time "2023-11-10, 09:15", Transaction ID "TX-ROAST-305", Type "Roasting", Movement "Out", Amount "800.00", Created Batches "BATCH-12500"
- And: A row for "TX-ADJ-054" shows Date & Time "2023-11-12, 11:00", Transaction ID "TX-ADJ-054", Type "Inventory Adjustment", Movement "Out", Amount "5.00", Created Batches "—" (or empty)
- And: A row for "TX-PROD-987" shows Date & Time "2023-10-27, 10:30", Transaction ID "TX-PROD-987", Type "Production", Movement "In", Amount "1500.00", Created Batches "—" (or empty)

**Test: Movement column displays "In" for transactions that added to this batch**
- Components: UsageHistoryTable
- Given: Transaction "TX-PROD-987" created/added to batch "BATCH-12345"
- Then: The Movement column for "TX-PROD-987" shows "In"

**Test: Movement column displays "Out" for transactions that removed from this batch**
- Components: UsageHistoryTable
- Given: Transaction "TX-PACK-221" removed quantity from batch "BATCH-12345"
- Then: The Movement column for "TX-PACK-221" shows "Out"

**Test: Clicking a Transaction ID navigates to TransactionDetailPage**
- Components: UsageHistoryTable
- Given: A usage history row for "TX-PACK-221" is displayed with the Transaction ID as a clickable blue link
- When: The user clicks on "TX-PACK-221"
- Then: The app navigates to /transactions/:transactionId (TransactionDetailPage) for "TX-PACK-221"

**Test: Clicking a created batch ID navigates to BatchDetailPage for that batch**
- Components: UsageHistoryTable
- Given: A usage history row shows "BATCH-12401" in the Created Batches column as a clickable blue link
- When: The user clicks on "BATCH-12401"
- Then: The app navigates to /batches/:batchId (BatchDetailPage) for batch "BATCH-12401"

**Test: Multiple created batches in a row are each individually clickable**
- Components: UsageHistoryTable
- Given: A usage history row for "TX-PACK-221" shows Created Batches "BATCH-12401, BATCH-12402" as clickable links
- When: The user clicks on "BATCH-12402"
- Then: The app navigates to /batches/:batchId (BatchDetailPage) for batch "BATCH-12402"

**Test: Created Batches column shows dash when no batches were created**
- Components: UsageHistoryTable
- Given: Transaction "TX-ADJ-054" is an inventory adjustment that did not create any new batches
- Then: The Created Batches column for "TX-ADJ-054" shows "—" or is empty

**Test: Usage History table rows are displayed in reverse chronological order**
- Components: UsageHistoryTable
- Given: Usage history entries exist with dates 2023-10-27, 2023-11-05, 2023-11-10, 2023-11-12
- Then: The table rows are ordered with the most recent entry first (2023-11-12 at the top, 2023-10-27 at the bottom)

**Test: Usage History table shows empty state when batch has no usage history**
- Components: UsageHistoryTable
- Given: The user navigates to a Batch Detail page for a newly created batch with no transactions
- Then: The Usage History table shows an empty state message (e.g., "No usage history for this batch")

**Test: New transaction using this batch appears in Usage History**
- Components: UsageHistoryTable, CreateNewTransactionButton
- Given: The user is on the Batch Detail page for batch "BATCH-12345" with current usage history entries
- When: The user creates a new transaction that uses this batch and returns to the Batch Detail page
- Then: The new transaction appears as a new row in the Usage History table
- And: The Usage History table reflects the correct movement direction and amount

### CreateNewTransactionButton

**Test: Create New Transaction button is displayed with plus icon and primary styling**
- Components: CreateNewTransactionButton
- Given: The user is on the Batch Detail page for batch "BATCH-12345"
- Then: A "+ Create New Transaction" button is displayed in the top-right area of the header
- And: The button has a plus (+) icon and the text "Create New Transaction"
- And: The button is styled as a primary action button (filled blue)

**Test: Clicking Create New Transaction button navigates to NewTransactionPage pre-filled with this batch**
- Components: CreateNewTransactionButton
- Given: The user is on the Batch Detail page for batch "BATCH-12345" (material "Organic Arabica Coffee Beans", account "Global Imports Inc.")
- When: The user clicks the "+ Create New Transaction" button
- Then: The app navigates to /transactions/new (NewTransactionPage)
- And: The transaction form is pre-filled with batch "BATCH-12345" as the source batch in the quantity transfers or batch allocation section

---

## TransactionsPage (/transactions)

Components: NewTransactionButton, DateRangeFilter, AccountFilter, MaterialFilter, TransactionTypeFilter, SearchBar, TransactionsTable, Pagination

### NewTransactionButton

**Test: Page heading displays "Transactions" as a prominent title**
- Components: NewTransactionButton
- Given: The user navigates to the Transactions page (/transactions)
- Then: A large heading "Transactions" is displayed below the breadcrumb and above the filter bar

**Test: Filters section displays "Filters" label with "Clear Filters" link**
- Components: NewTransactionButton
- Given: The user navigates to the Transactions page
- Then: A "Filters" label is displayed above the filter controls
- And: A "Clear Filters" link is displayed to the right of the "Filters" label

**Test: New Transaction button is displayed as primary action with correct styling**
- Components: NewTransactionButton
- Given: The user navigates to the Transactions page (/transactions)
- Then: A "New Transaction" button is displayed at the top right of the page, above the filter bar
- And: The button is styled as a primary action button (blue/filled)

**Test: Clicking New Transaction button navigates to NewTransactionPage**
- Components: NewTransactionButton
- Given: The user is on the Transactions page
- When: The user clicks the "New Transaction" button
- Then: The app navigates to /transactions/new (NewTransactionPage)

### DateRangeFilter

**Test: Date Range filter displays with calendar icon and default date range**
- Components: DateRangeFilter
- Given: The user navigates to the Transactions page
- Then: A "Date Range" labeled filter is displayed in the Filters section
- And: The filter shows a calendar icon on the left
- And: The filter displays a date range value (e.g., "Oct 1, 2023 - Oct 31, 2023")

**Test: Clicking the date range filter opens a date range picker**
- Components: DateRangeFilter
- Given: The user is on the Transactions page
- When: The user clicks the date range filter
- Then: A date range picker dropdown/popover opens allowing the user to select a start date and end date

**Test: Selecting a new date range filters the transactions table**
- Components: DateRangeFilter, TransactionsTable
- Given: The transactions table shows transactions across all dates
- When: The user selects a date range of "Oct 25, 2023 - Oct 27, 2023" in the date range picker
- Then: The TransactionsTable updates to show only transactions with dates within that range
- And: Transactions outside the selected range are hidden
- And: The date range filter displays "Oct 25, 2023 - Oct 27, 2023"
- And: The pagination updates to reflect the filtered count

**Test: Clearing the date range filter shows all transactions**
- Components: DateRangeFilter, TransactionsTable
- Given: The date range filter is set to "Oct 25, 2023 - Oct 27, 2023"
- When: The user clears the date range filter (e.g., via Clear Filters or resetting the date picker)
- Then: The TransactionsTable returns to showing all transactions
- And: The pagination returns to its unfiltered state

### AccountFilter

**Test: Involved Account(s) filter displays with label and multi-select dropdown**
- Components: AccountFilter
- Given: The user navigates to the Transactions page
- Then: An "Involved Account(s)" labeled filter is displayed in the Filters section
- And: The filter shows a dropdown with a chevron/arrow indicator

**Test: Opening the account filter dropdown lists all accounts with IDs**
- Components: AccountFilter
- Given: Accounts exist including "Raw Materials Inventory (1200)", "Accounts Payable (2100)", "Work in Process (1300)", "Finished Goods Inventory (1400)", "Utilities Expense (6100)", "Cash (1000)"
- When: The user clicks the account filter dropdown
- Then: A dropdown menu opens showing all account names with their account numbers

**Test: Selecting multiple accounts from the account filter shows selected count**
- Components: AccountFilter
- Given: The account filter dropdown is open
- When: The user selects "Raw Materials Inventory (1200)" and "Accounts Payable (2100)"
- Then: The filter displays the selected account names followed by "(2 selected)"
- And: Both selections are visually indicated (e.g., checkmarks)

**Test: Selecting accounts filters the transactions table to matching transactions**
- Components: AccountFilter, TransactionsTable
- Given: The user selects "Raw Materials Inventory (1200)" and "Accounts Payable (2100)" from the account filter
- Then: The TransactionsTable shows only transactions where at least one of the selected accounts is involved (debited or credited)
- And: Transactions not involving either of these accounts are hidden
- And: The pagination updates to reflect the filtered count

**Test: Deselecting all accounts resets the account filter**
- Components: AccountFilter, TransactionsTable
- Given: The account filter has "Raw Materials Inventory (1200)" and "Accounts Payable (2100)" selected
- When: The user deselects all accounts (or clicks Clear Filters)
- Then: The TransactionsTable returns to showing all transactions
- And: The account filter returns to its default unselected state

### MaterialFilter

**Test: Material filter displays with label and multi-select dropdown**
- Components: MaterialFilter
- Given: The user navigates to the Transactions page
- Then: A "Material" labeled filter is displayed in the Filters section
- And: The filter shows a dropdown with a chevron/arrow indicator

**Test: Opening the material filter dropdown lists all materials with codes**
- Components: MaterialFilter
- Given: Materials exist including "Steel Plates (M001)", "Plastic Pellets (M002)", "Widget X Units (P101)"
- When: The user clicks the material filter dropdown
- Then: A dropdown menu opens showing all material names with their material codes

**Test: Selecting multiple materials shows selected count**
- Components: MaterialFilter
- Given: The material filter dropdown is open
- When: The user selects "Steel Plates (M001)" and "Plastic Pellets (M002)"
- Then: The filter displays the selected material names followed by "(2 selected)"
- And: Both selections are visually indicated (e.g., checkmarks)

**Test: Selecting materials filters the transactions table to matching transactions**
- Components: MaterialFilter, TransactionsTable
- Given: The user selects "Steel Plates (M001)" from the material filter
- Then: The TransactionsTable shows only transactions that involve "Steel Plates (M001)" in the Materials and amounts column
- And: Transactions not involving that material are hidden
- And: The pagination updates to reflect the filtered count

**Test: Deselecting all materials resets the material filter**
- Components: MaterialFilter, TransactionsTable
- Given: The material filter has "Steel Plates (M001)" selected
- When: The user deselects all materials (or clicks Clear Filters)
- Then: The TransactionsTable returns to showing all transactions

### TransactionTypeFilter

**Test: Transaction Type filter displays with label and dropdown**
- Components: TransactionTypeFilter
- Given: The user navigates to the Transactions page
- Then: A "Transaction Type" labeled filter is displayed in the Filters section
- And: The filter shows a default value of "All Types (Purchase, Consumption, Transfer...)"

**Test: Opening the transaction type filter dropdown lists all transaction types**
- Components: TransactionTypeFilter
- Given: Transaction types include "Purchase", "Consumption", "Transfer", and other types
- When: The user clicks the transaction type filter dropdown
- Then: A dropdown menu opens showing an "All Types" option and each individual transaction type

**Test: Selecting a transaction type filters the transactions table**
- Components: TransactionTypeFilter, TransactionsTable
- Given: The transaction type filter is set to "All Types"
- When: The user selects "Purchase" from the transaction type filter dropdown
- Then: The TransactionsTable shows only transactions with type "Purchase" (e.g., "Purchase of Steel Plates from Supplier A", "Purchase of Plastic Pellets")
- And: Transactions of other types (Consumption, Transfer) are hidden
- And: The pagination updates to reflect the filtered count

**Test: Selecting "All Types" resets the transaction type filter**
- Components: TransactionTypeFilter, TransactionsTable
- Given: The transaction type filter is set to "Purchase"
- When: The user selects "All Types" from the transaction type filter dropdown
- Then: The TransactionsTable returns to showing transactions of all types

**Test: Clear Filters link resets all filters to defaults**
- Components: DateRangeFilter, AccountFilter, MaterialFilter, TransactionTypeFilter
- Given: The user has active filters: date range "Oct 25, 2023 - Oct 27, 2023", account "Raw Materials Inventory (1200)" selected, material "Steel Plates (M001)" selected, and transaction type "Purchase"
- When: The user clicks the "Clear Filters" link in the Filters section
- Then: All filters reset to their default/unselected states
- And: The TransactionsTable shows all transactions unfiltered
- And: The pagination updates to reflect the full result count

### SearchBar

**Test: Search bar displays with magnifying glass icon and placeholder text**
- Components: SearchBar
- Given: The user navigates to the Transactions page
- Then: A search input is displayed below the filters section
- And: The input has a magnifying glass (search) icon on the left
- And: The input shows placeholder text "Search by ID or description..."

**Test: Typing a transaction ID in the search bar filters transactions**
- Components: SearchBar, TransactionsTable
- Given: The TransactionsTable shows all transactions
- When: The user types "TXN-100245" in the search bar
- Then: The TransactionsTable updates to show only transactions whose Transaction ID contains "TXN-100245"
- And: The pagination updates to reflect the filtered count

**Test: Typing a description keyword in the search bar filters transactions**
- Components: SearchBar, TransactionsTable
- Given: The TransactionsTable shows all transactions
- When: The user types "Purchase" in the search bar
- Then: The TransactionsTable updates to show only transactions whose description contains "Purchase" (e.g., "Purchase of Steel Plates from Supplier A", "Purchase of Plastic Pellets")
- And: Transactions without "Purchase" in their description are hidden

**Test: Search is case-insensitive**
- Components: SearchBar, TransactionsTable
- Given: Transactions include "Purchase of Steel Plates from Supplier A"
- When: The user types "purchase" (lowercase) in the search bar
- Then: "Purchase of Steel Plates from Supplier A" is shown in the results

**Test: Clearing the search bar shows all transactions again**
- Components: SearchBar, TransactionsTable
- Given: The search bar contains "Purchase" and the table shows filtered results
- When: The user clears the search bar (empties the text)
- Then: The TransactionsTable returns to showing all transactions
- And: The pagination returns to its unfiltered state

**Test: Search with no matching results shows empty state**
- Components: SearchBar, TransactionsTable
- Given: No transaction ID or description contains "NONEXISTENT999"
- When: The user types "NONEXISTENT999" in the search bar
- Then: The TransactionsTable shows an empty state message (e.g., "No transactions found")

**Test: Search and filters work together to narrow results**
- Components: SearchBar, AccountFilter, TransactionsTable, Pagination
- Given: The user has selected "Raw Materials Inventory (1200)" from the account filter
- When: The user types "Steel" in the search bar
- Then: The TransactionsTable shows only transactions involving "Raw Materials Inventory (1200)" that also have "Steel" in their description or ID

**Test: Multiple filters combine: date range, material, and transaction type**
- Components: DateRangeFilter, MaterialFilter, TransactionTypeFilter, TransactionsTable, Pagination
- Given: The user selects date range "Oct 25, 2023 - Oct 27, 2023"
- And: The user selects "Steel Plates (M001)" from the material filter
- And: The user selects "Purchase" from the transaction type filter
- Then: The TransactionsTable shows only transactions within that date range that involve Steel Plates and are of type Purchase
- And: The pagination updates to reflect the filtered count

### TransactionsTable

**Test: Breadcrumb displays Home / Transactions**
- Components: TransactionsTable
- Given: The user navigates to the Transactions page
- Then: A breadcrumb trail "Home / Transactions" is displayed at the top of the page
- And: "Home" is a clickable link that navigates to the Dashboard (/)

**Test: Sidebar shows Transactions link as active**
- Components: TransactionsTable
- Given: The user navigates to the Transactions page
- Then: The navigation "Transactions" link is visually highlighted as the active page

**Test: Sort dropdown displays with "Sort by: Date (Newest First)" as default**
- Components: TransactionsTable
- Given: The user navigates to the Transactions page
- Then: A sort dropdown is displayed showing "Sort by: Date (Newest First)"

**Test: Opening the sort dropdown shows available sort options**
- Components: TransactionsTable
- Given: The user is on the Transactions page
- When: The user clicks the sort dropdown
- Then: A dropdown menu opens showing sort options including "Date (Newest First)", "Date (Oldest First)", and other relevant options

**Test: Selecting "Date (Oldest First)" sorts the table by date ascending**
- Components: TransactionsTable
- Given: The table is sorted by "Date (Newest First)"
- When: The user selects "Date (Oldest First)" from the sort dropdown
- Then: The TransactionsTable rows are reordered so that the oldest transactions appear first
- And: The sort dropdown label updates to "Sort by: Date (Oldest First)"

**Test: Result count displays total number of matching results**
- Components: TransactionsTable
- Given: There are 145 transactions matching the current filters
- Then: A text label displays "Showing 1-10 of 145 results" indicating the current page range and total count

**Test: Transactions table displays correct column headers**
- Components: TransactionsTable
- Given: The user navigates to the Transactions page
- Then: The table shows columns: Date, Transaction ID, Description, Accounts affected, Materials and amounts
- And: The "Date" column header has a sort indicator (arrow icon)
- And: The "Transaction ID" column header has a sort indicator (arrow icon)

**Test: Transactions table shows transaction rows with correct data**
- Components: TransactionsTable
- Given: Transactions exist in the system including:
  - Oct 27, 2023 | TXN-100245 | "Purchase of Steel Plates from Supplier A" | Dr: Raw Materials Inventory (1200) | Cr: Accounts Payable (2100) | Steel Plates (M001): 500 kg @ $2.50/kg ($1,250.00)
  - Oct 26, 2023 | TXN-100244 | "Consumption for Production Run #45" | Dr: Work in Process (1300) | Cr: Raw Materials Inventory (1200) | Steel Plates (M001): 120 kg; Plastic Pellets (M002): 30 kg
  - Oct 25, 2023 | TXN-100243 | "Finished Goods Transfer to Warehouse" | Dr: Finished Goods Inventory (1400) | Cr: Work in Process (1300) | Widget X Units (P101): 50 units
  - Oct 24, 2023 | TXN-100242 | "Payment for Utility Bill (Oct)" | Dr: Utilities Expense (6100) | Cr: Cash (1000) | N/A ($350.00)
  - Oct 23, 2023 | TXN-100241 | "Purchase of Plastic Pellets" | Dr: Raw Materials Inventory (1200) | Cr: Accounts Payable (2100) | Plastic Pellets (M002): 200 kg @ $1.10/kg ($220.00)
- Then: Each transaction row displays the correct Date, Transaction ID, Description, Accounts affected (with Dr/Cr notation and account numbers), and Materials and amounts (with quantities, units, and pricing where applicable)

**Test: Accounts affected column displays double-entry Dr/Cr notation with account numbers**
- Components: TransactionsTable
- Given: Transaction TXN-100245 debits "Raw Materials Inventory (1200)" and credits "Accounts Payable (2100)"
- Then: The Accounts affected column shows "Dr: Raw Materials Inventory (1200) | Cr: Accounts Payable (2100)"

**Test: Materials and amounts column displays material codes, quantities, units, and pricing**
- Components: TransactionsTable
- Given: Transaction TXN-100245 involves Steel Plates (M001) at 500 kg for $2.50/kg totaling $1,250.00
- Then: The Materials and amounts column shows "Steel Plates (M001): 500 kg @ $2.50/kg ($1,250.00)"

**Test: Materials and amounts column displays multiple materials separated by semicolons**
- Components: TransactionsTable
- Given: Transaction TXN-100244 involves Steel Plates (M001): 120 kg and Plastic Pellets (M002): 30 kg
- Then: The Materials and amounts column shows "Steel Plates (M001): 120 kg; Plastic Pellets (M002): 30 kg"

**Test: Materials and amounts column shows N/A with amount for non-material transactions**
- Components: TransactionsTable
- Given: Transaction TXN-100242 "Payment for Utility Bill (Oct)" has no specific material but a dollar amount of $350.00
- Then: The Materials and amounts column shows "N/A ($350.00)"

**Test: Clicking the Date column header sorts transactions by date**
- Components: TransactionsTable
- Given: The transactions table is displayed with the Date column header
- When: The user clicks the "Date" column header
- Then: The table rows are re-sorted by date (toggling between ascending and descending order)
- And: The sort indicator on the Date column updates to reflect the sort direction

**Test: Clicking the Transaction ID column header sorts transactions by ID**
- Components: TransactionsTable
- Given: The transactions table is displayed with the Transaction ID column header
- When: The user clicks the "Transaction ID" column header
- Then: The table rows are re-sorted by transaction ID (toggling between ascending and descending order)
- And: The sort indicator on the Transaction ID column updates to reflect the sort direction

**Test: Clicking a transaction row navigates to TransactionDetailPage**
- Components: TransactionsTable
- Given: A transaction row for TXN-100245 is displayed
- When: The user clicks on the row for TXN-100245
- Then: The app navigates to /transactions/:transactionId (TransactionDetailPage) for TXN-100245

**Test: Transactions table shows empty state when no transactions match filters**
- Components: TransactionsTable
- Given: No transactions match the current filter and search criteria
- Then: The table shows an empty state message (e.g., "No transactions found")

### Pagination

**Test: Pagination displays First, Previous, page numbers, Next, Last buttons and result count**
- Components: Pagination
- Given: There are 145 transactions and the page size is 10
- Then: The pagination section shows "First", "Previous", "Next", and "Last" buttons
- And: Page numbers are displayed including 1, 2, 3, with an ellipsis (...) and the last page number (15)
- And: The current page (1) is visually highlighted
- And: A "Showing 1-10 of 145 results" text is displayed

**Test: Rows per page dropdown displays with default value of 10**
- Components: Pagination
- Given: The user navigates to the Transactions page
- Then: A "Rows per page:" dropdown is displayed on the right side of the pagination bar
- And: The default value is "10"

**Test: Changing rows per page updates the number of visible rows**
- Components: Pagination, TransactionsTable
- Given: The rows per page dropdown is set to 10 and 145 transactions exist
- When: The user changes the rows per page dropdown to 25
- Then: The TransactionsTable displays up to 25 rows per page
- And: The pagination text updates (e.g., "Showing 1-25 of 145 results")
- And: The total number of pages recalculates (e.g., from 15 pages to 6 pages)

**Test: Clicking Next button navigates to the next page**
- Components: Pagination, TransactionsTable
- Given: The user is on page 1 showing transactions 1-10
- When: The user clicks the "Next" button
- Then: The TransactionsTable updates to show transactions 11-20
- And: The pagination text updates to "Showing 11-20 of 145 results"
- And: Page 2 is visually highlighted

**Test: Clicking a page number navigates directly to that page**
- Components: Pagination, TransactionsTable
- Given: The user is on page 1
- When: The user clicks page number "3"
- Then: The TransactionsTable updates to show transactions 21-30
- And: The pagination text updates to "Showing 21-30 of 145 results"
- And: Page 3 is visually highlighted

**Test: Clicking Previous button navigates to the previous page**
- Components: Pagination, TransactionsTable
- Given: The user is on page 2 showing transactions 11-20
- When: The user clicks the "Previous" button
- Then: The TransactionsTable updates to show transactions 1-10
- And: The pagination text updates to "Showing 1-10 of 145 results"
- And: Page 1 is visually highlighted

**Test: Clicking First button navigates to the first page**
- Components: Pagination, TransactionsTable
- Given: The user is on page 5
- When: The user clicks the "First" button
- Then: The TransactionsTable updates to show transactions 1-10
- And: Page 1 is visually highlighted

**Test: Clicking Last button navigates to the last page**
- Components: Pagination, TransactionsTable
- Given: There are 145 transactions with 10 per page (15 pages total)
- And: The user is on page 1
- When: The user clicks the "Last" button
- Then: The TransactionsTable updates to show transactions 141-145
- And: The pagination text updates to "Showing 141-145 of 145 results"
- And: Page 15 is visually highlighted

**Test: First and Previous buttons are disabled on first page**
- Components: Pagination
- Given: The user is on page 1 of the transactions table
- Then: The "First" button is disabled (grayed out or not clickable)
- And: The "Previous" button is disabled (grayed out or not clickable)

**Test: Next and Last buttons are disabled on last page**
- Components: Pagination
- Given: The user is on the last page of the transactions table (page 15)
- Then: The "Next" button is disabled (grayed out or not clickable)
- And: The "Last" button is disabled (grayed out or not clickable)

**Test: Pagination updates when filters reduce the number of results**
- Components: Pagination, TransactionTypeFilter, TransactionsTable
- Given: The unfiltered table shows 145 transactions across 15 pages
- When: The user selects "Transfer" from the transaction type filter which has only 8 matching transactions
- Then: The pagination shows only 1 page
- And: The pagination text shows "Showing 1-8 of 8 results"
- And: The "First", "Previous", "Next", and "Last" buttons are all disabled

**Test: Ellipsis is shown between non-contiguous page numbers**
- Components: Pagination
- Given: There are 15 pages of transactions and the user is on page 1
- Then: The pagination shows page numbers "1, 2, 3, ..., 15"
- And: The ellipsis (...) indicates that pages between 3 and 15 are not individually shown but accessible

**Test: Applying a filter resets pagination to page 1**
- Components: Pagination, AccountFilter, TransactionsTable
- Given: The user is on page 3 of the transactions table
- When: The user selects "Raw Materials Inventory (1200)" from the account filter
- Then: The pagination resets to page 1
- And: The TransactionsTable shows the first page of filtered results
- And: The result count updates to reflect the filtered total

**Test: Sort selection persists across page navigation**
- Components: Pagination, TransactionsTable
- Given: The user selects "Date (Oldest First)" from the sort dropdown
- And: The table is sorted by oldest date first
- When: The user clicks the "Next" button to go to page 2
- Then: The transactions on page 2 continue to be sorted by oldest date first
- And: The sort dropdown still shows "Sort by: Date (Oldest First)"

---

## TransactionDetailPage (/transactions/:transactionId)

Components: TransactionHeader, BasicInfoSection, QuantityTransfersTable, BatchesCreatedTable

### TransactionHeader

**Test: Transaction header displays Transaction ID as large heading**
- Components: TransactionHeader
- Given: The user navigates to the Transaction Detail page for transaction "TXN-123456"
- Then: The header displays "Transaction ID: TXN-123456" as a large heading

**Test: Transaction header displays status badge with green styling for completed transaction**
- Components: TransactionHeader
- Given: The user navigates to the Transaction Detail page for transaction "TXN-123456" which has status "Completed"
- Then: A green badge/pill labeled "Completed" is displayed next to the Transaction ID heading

**Test: Transaction header displays status badge for pending transaction**
- Components: TransactionHeader
- Given: The user navigates to the Transaction Detail page for a transaction with status "Pending"
- Then: A yellow/amber badge/pill labeled "Pending" is displayed next to the Transaction ID heading

**Test: Transaction header displays status badge for voided transaction**
- Components: TransactionHeader
- Given: The user navigates to the Transaction Detail page for a transaction with status "Voided"
- Then: A red/muted badge/pill labeled "Voided" is displayed next to the Transaction ID heading

**Test: Transaction header displays date and time with timezone**
- Components: TransactionHeader
- Given: The user navigates to the Transaction Detail page for transaction "TXN-123456" created on Oct 26, 2023 at 10:30 AM PST
- Then: The header displays "Date/Time:" followed by "Oct 26, 2023, 10:30 AM PST"

**Test: Transaction header displays creator name**
- Components: TransactionHeader
- Given: The user navigates to the Transaction Detail page for transaction "TXN-123456" created by "Jane Doe"
- Then: The header displays "Creator:" followed by "Jane Doe"

**Test: Transaction header displays description text**
- Components: TransactionHeader
- Given: The user navigates to the Transaction Detail page for transaction "TXN-123456" with description "Q4 Inventory Adjustment for Raw Materials"
- Then: The header displays "Description:" followed by "Q4 Inventory Adjustment for Raw Materials"

**Test: Breadcrumb displays navigation path to transaction**
- Components: TransactionHeader
- Given: The user navigates to the Transaction Detail page for transaction "TXN-123456"
- Then: A breadcrumb trail is displayed (e.g., "Home > Transactions > TXN-123456")
- And: "Home" is a clickable link that navigates to the Dashboard (/)
- And: "Transactions" is a clickable link that navigates to /transactions (TransactionsPage)

**Test: Clicking Home breadcrumb navigates to Dashboard**
- Components: TransactionHeader
- Given: The breadcrumb shows "Home > Transactions > TXN-123456"
- When: The user clicks "Home" in the breadcrumb
- Then: The app navigates to / (DashboardPage)

**Test: Clicking Transactions breadcrumb navigates to TransactionsPage**
- Components: TransactionHeader
- Given: The breadcrumb shows "Home > Transactions > TXN-123456"
- When: The user clicks "Transactions" in the breadcrumb
- Then: The app navigates to /transactions (TransactionsPage)

**Test: Sidebar shows Transactions link as active on Transaction Detail page**
- Components: TransactionHeader
- Given: The user navigates to the Transaction Detail page
- Then: The sidebar "Transactions" link is visually highlighted as the active page

### BasicInfoSection

**Test: Basic Info section displays with heading**
- Components: BasicInfoSection
- Given: The user navigates to the Transaction Detail page for transaction "TXN-123456"
- Then: A "Basic Info" section heading is displayed

**Test: Basic Info section displays date field**
- Components: BasicInfoSection
- Given: Transaction "TXN-123456" has a date of 10/26/2023
- Then: The Basic Info section shows a "Date" label followed by the value "10/26/2023" in a read-only field

**Test: Basic Info section displays reference ID field**
- Components: BasicInfoSection
- Given: Transaction "TXN-123456" has a reference ID "REF-Q4-ADJ-001"
- Then: The Basic Info section shows a "Reference Id" label followed by the value "REF-Q4-ADJ-001" in a read-only field

**Test: Basic Info section displays description field**
- Components: BasicInfoSection
- Given: Transaction "TXN-123456" has description "Adjustment for end-of-quarter physical count discrepancy in Warehouse A."
- Then: The Basic Info section shows a "Description" label followed by the full description text in a read-only field
- And: The description field is large enough to display multi-line text without truncation

**Test: Basic Info section displays transaction type field**
- Components: BasicInfoSection
- Given: Transaction "TXN-123456" has transaction type "Inventory Adjustment"
- Then: The Basic Info section shows a "Transaction Type" label followed by the value "Inventory Adjustment" in a read-only field

**Test: Basic Info section fields are laid out in a horizontal row**
- Components: BasicInfoSection
- Given: The user navigates to the Transaction Detail page
- Then: The Date, Reference Id, Description, and Transaction Type fields are displayed side by side in a horizontal row (responsive grid layout)

### QuantityTransfersTable

**Test: Quantity Transfers section displays with heading indicating double-entry view**
- Components: QuantityTransfersTable
- Given: The user navigates to the Transaction Detail page for transaction "TXN-123456"
- Then: A section heading "Quantity Transfers (Double-Entry View)" is displayed

**Test: Quantity Transfers section displays balanced indicator with green checkmark when balanced**
- Components: QuantityTransfersTable
- Given: Transaction "TXN-123456" has total debits equal to total credits (515.00 each)
- Then: A green checkmark icon with "Balanced" text is displayed in the top-right corner of the Quantity Transfers section

**Test: Quantity Transfers section displays unbalanced indicator when debits and credits do not match**
- Components: QuantityTransfersTable
- Given: A transaction has total debits of 500.00 and total credits of 515.00
- Then: An indicator (e.g., red X or warning icon with "Unbalanced") is displayed instead of the green "Balanced" indicator

**Test: Quantity Transfers table displays correct column headers**
- Components: QuantityTransfersTable
- Given: The user navigates to the Transaction Detail page
- Then: The Quantity Transfers table shows columns: Source Account, Source Amount, Source Batch ID (Optional), Destination Account, Destination Amount, Net Transfer

**Test: Quantity Transfers table displays transfer rows with source and destination details**
- Components: QuantityTransfersTable
- Given: Transaction "TXN-123456" has a transfer from "Warehouse A - Raw Materials (Asset)" of -500.00 Units with source batch "BATCH-RM-2023-A" to "Production Line B - WIP (Asset)" of +500.00 Units with net transfer 500.00
- Then: A row displays:
  - Source Account: "Warehouse A - Raw Materials (Asset)" with a down-arrow (↓) icon
  - Source Amount: "-500.00 Units"
  - Source Batch ID: "BATCH-RM-2023-A"
  - Destination Account: "Production Line B - WIP (Asset)" with an up-arrow (↑) icon
  - Destination Amount: "+500.00 Units"
  - Net Transfer: "500.00"

**Test: Quantity Transfers table displays second transfer row with N/A batch ID**
- Components: QuantityTransfersTable
- Given: Transaction "TXN-123456" has a second transfer from "Inventory Shrinkage Expense (Expense)" of +15.00 Units with no source batch to "Warehouse A - Raw Materials (Asset)" of -15.00 Units with net transfer 15.00
- Then: A second row displays:
  - Source Account: "Inventory Shrinkage Expense (Expense)" with an up-arrow (↑) icon
  - Source Amount: "+15.00 Units"
  - Source Batch ID: "N/A"
  - Destination Account: "Warehouse A - Raw Materials (Asset)" with a down-arrow (↓) icon
  - Destination Amount: "-15.00 Units"
  - Net Transfer: "15.00"

**Test: Quantity Transfers table shows direction arrows indicating debit/credit on accounts**
- Components: QuantityTransfersTable
- Given: A transfer row debits "Warehouse A - Raw Materials (Asset)" and credits "Production Line B - WIP (Asset)"
- Then: The debited account shows a down-arrow (↓) icon in a distinctive color (e.g., red/orange)
- And: The credited account shows an up-arrow (↑) icon in a distinctive color (e.g., green/blue)

**Test: Quantity Transfers table footer shows Total Debits and Total Credits**
- Components: QuantityTransfersTable
- Given: Transaction "TXN-123456" has total debits of 515.00 and total credits of 515.00
- Then: The table footer displays "Total Debits: 515.00 | Total Credits: 515.00"

**Test: Clicking a Source Batch ID link navigates to BatchDetailPage**
- Components: QuantityTransfersTable
- Given: A transfer row shows Source Batch ID "BATCH-RM-2023-A" as a clickable link
- When: The user clicks on "BATCH-RM-2023-A"
- Then: The app navigates to /batches/:batchId (BatchDetailPage) for batch "BATCH-RM-2023-A"

**Test: Source Batch ID column shows N/A as plain text when no batch is referenced**
- Components: QuantityTransfersTable
- Given: A transfer row has no source batch (batch ID is N/A)
- Then: The Source Batch ID column shows "N/A" as plain non-clickable text

**Test: Clicking a Source Account name navigates to AccountDetailPage**
- Components: QuantityTransfersTable
- Given: A transfer row shows Source Account "Warehouse A - Raw Materials (Asset)"
- When: The user clicks on the source account name
- Then: The app navigates to /accounts/:accountId (AccountDetailPage) for "Warehouse A - Raw Materials"

**Test: Clicking a Destination Account name navigates to AccountDetailPage**
- Components: QuantityTransfersTable
- Given: A transfer row shows Destination Account "Production Line B - WIP (Asset)"
- When: The user clicks on the destination account name
- Then: The app navigates to /accounts/:accountId (AccountDetailPage) for "Production Line B - WIP"

**Test: Quantity Transfers table shows empty state when transaction has no transfers**
- Components: QuantityTransfersTable
- Given: A transaction has no quantity transfers recorded
- Then: The Quantity Transfers table shows an empty state message (e.g., "No quantity transfers for this transaction")

**Test: Quantity Transfers table handles multiple transfer rows**
- Components: QuantityTransfersTable
- Given: A transaction has three or more transfer rows
- Then: All transfer rows are displayed in the table with correct source/destination accounts, amounts, batch IDs, and net transfer values

### BatchesCreatedTable

**Test: Batches Created section displays with heading**
- Components: BatchesCreatedTable
- Given: The user navigates to the Transaction Detail page for transaction "TXN-123456"
- Then: A "Batches Created" section heading is displayed below the Quantity Transfers section

**Test: Batches Created table displays correct column headers**
- Components: BatchesCreatedTable
- Given: The user navigates to the Transaction Detail page
- Then: The Batches Created table shows columns: Batch ID, Material, Quantity

**Test: Batches Created table displays batch rows with correct data**
- Components: BatchesCreatedTable
- Given: Transaction "TXN-123456" created batches:
  - BATCH-WIP-2023-Q4-001: Material "Widget Assembly Component X", Quantity 500.00
  - BATCH-SCRAP-2023-Q4-005: Material "Scrap Material - Metal", Quantity 15.00
- Then: A row for "BATCH-WIP-2023-Q4-001" shows Batch ID "BATCH-WIP-2023-Q4-001", Material "Widget Assembly Component X", Quantity "500.00"
- And: A row for "BATCH-SCRAP-2023-Q4-005" shows Batch ID "BATCH-SCRAP-2023-Q4-005", Material "Scrap Material - Metal", Quantity "15.00"

**Test: Clicking a Batch ID in Batches Created table navigates to BatchDetailPage**
- Components: BatchesCreatedTable
- Given: The Batches Created table shows "BATCH-WIP-2023-Q4-001" as a clickable link
- When: The user clicks on "BATCH-WIP-2023-Q4-001"
- Then: The app navigates to /batches/:batchId (BatchDetailPage) for batch "BATCH-WIP-2023-Q4-001"

**Test: Clicking second Batch ID in Batches Created table navigates to its BatchDetailPage**
- Components: BatchesCreatedTable
- Given: The Batches Created table shows "BATCH-SCRAP-2023-Q4-005" as a clickable link
- When: The user clicks on "BATCH-SCRAP-2023-Q4-005"
- Then: The app navigates to /batches/:batchId (BatchDetailPage) for batch "BATCH-SCRAP-2023-Q4-005"

**Test: Clicking a Material name in Batches Created table navigates to MaterialDetailPage**
- Components: BatchesCreatedTable
- Given: The Batches Created table shows "Widget Assembly Component X" in the Material column
- When: The user clicks on "Widget Assembly Component X"
- Then: The app navigates to /materials/:materialId (MaterialDetailPage) for "Widget Assembly Component X"

**Test: Batches Created table shows empty state when no batches were created**
- Components: BatchesCreatedTable
- Given: A transaction did not create any new batches
- Then: The Batches Created table shows an empty state message (e.g., "No batches were created in this transaction")

**Test: Batches Created table handles single batch row**
- Components: BatchesCreatedTable
- Given: A transaction created exactly one batch
- Then: The Batches Created table shows one row with the batch ID, material, and quantity

**Test: Batches Created table handles many batch rows**
- Components: BatchesCreatedTable
- Given: A transaction created five or more batches
- Then: All batch rows are displayed in the table with correct Batch ID, Material, and Quantity values

**Test: New transaction creating batches updates related pages**
- Components: BatchesCreatedTable, QuantityTransfersTable
- Given: The user views the Transaction Detail page for a transaction that created batches
- When: The user navigates to the MaterialDetailPage for one of the created batch's materials
- Then: The material's batch list includes the newly created batch
- And: The material's transaction history includes this transaction

---

## NewTransactionPage (/transactions/new)

Components: BasicInfoForm, QuantityTransfersSection, BatchAllocationSection, PostButton, CancelButton

### BasicInfoForm

**Test: Basic Info section displays with numbered heading "1. Basic Info"**
- Components: BasicInfoForm
- Given: The user navigates to /transactions/new (NewTransactionPage)
- Then: A section heading "1. Basic Info" is displayed at the top of the form

**Test: Date field displays a date picker defaulting to today's date**
- Components: BasicInfoForm
- Given: The user navigates to /transactions/new
- Then: A "Date" label is displayed with a date picker input below it
- And: The date picker shows a calendar icon on the left side
- And: The date field defaults to today's date in YYYY-MM-DD format (e.g., "2024-05-23")

**Test: User can change the date using the date picker**
- Components: BasicInfoForm
- Given: The user is on the NewTransactionPage with the date set to "2024-05-23"
- When: The user clicks the date field and selects a different date (e.g., "2024-06-15")
- Then: The date field updates to show "2024-06-15"

**Test: Reference ID field displays a text input**
- Components: BasicInfoForm
- Given: The user navigates to /transactions/new
- Then: A "Reference ID" label is displayed with a text input below it
- And: The input shows placeholder text (e.g., "TRX-20240523-001")

**Test: User can type a reference ID**
- Components: BasicInfoForm
- Given: The user is on the NewTransactionPage
- When: The user types "TRX-20240601-005" into the Reference ID input
- Then: The input displays "TRX-20240601-005"

**Test: Description field displays a multi-line textarea**
- Components: BasicInfoForm
- Given: The user navigates to /transactions/new
- Then: A "Description" label is displayed with a textarea input below it
- And: The textarea is larger than the other fields to accommodate multi-line text

**Test: User can type a multi-line description**
- Components: BasicInfoForm
- Given: The user is on the NewTransactionPage
- When: The user types "Q2 Inventory Adjustment for raw materials and finished goods." into the Description textarea
- Then: The textarea displays the full text without truncation

**Test: Transaction Type field displays a dropdown selector**
- Components: BasicInfoForm
- Given: The user navigates to /transactions/new
- Then: A "Transaction Type" label is displayed with a dropdown/select input below it
- And: The dropdown shows a chevron/arrow indicating it can be opened

**Test: Transaction Type dropdown shows available transaction types**
- Components: BasicInfoForm
- Given: The user is on the NewTransactionPage
- When: The user clicks the Transaction Type dropdown
- Then: A list of transaction types is displayed (e.g., "Transfer", "Purchase", "Consumption", "Adjustment", "Production")

**Test: User can select a transaction type from the dropdown**
- Components: BasicInfoForm
- Given: The user is on the NewTransactionPage and the Transaction Type dropdown is open
- When: The user selects "Transfer"
- Then: The dropdown closes and displays "Transfer" as the selected value

**Test: Basic Info fields are laid out in a horizontal row**
- Components: BasicInfoForm
- Given: The user navigates to /transactions/new
- Then: The Date, Reference ID, Description, and Transaction Type fields are displayed side by side in a horizontal row (responsive grid layout)
- And: The Description field is wider than the other fields to accommodate text

### QuantityTransfersSection

**Test: Quantity Transfers section displays with numbered heading "2. Quantity Transfers"**
- Components: QuantityTransfersSection
- Given: The user navigates to /transactions/new
- Then: A section heading "2. Quantity Transfers" is displayed below the Basic Info section

**Test: Quantity Transfers table displays correct column headers**
- Components: QuantityTransfersSection
- Given: The user navigates to /transactions/new
- Then: The Quantity Transfers table shows columns: Source Account, Destination Account, Amount, Source Batch ID (Optional)
- And: A delete/remove icon column is shown on the far right

**Test: Quantity Transfers table is initially empty**
- Components: QuantityTransfersSection
- Given: The user navigates to /transactions/new without any pre-filled data
- Then: The Quantity Transfers table has no data rows
- And: The "+ Add Quantity Transfer" button and inline input row are visible below the table

**Test: Add Quantity Transfer row shows inline input controls**
- Components: QuantityTransfersSection
- Given: The user is on the NewTransactionPage
- Then: Below the table rows, an inline row displays:
  - A "Source Account" dropdown selector
  - A "Destination Account" dropdown selector
  - An "Amount" numeric input field
  - A unit dropdown/label next to the Amount field (e.g., "unit")
  - A "Source Batch ID" text input field

**Test: Clicking "+ Add Quantity Transfer" button adds a new transfer row**
- Components: QuantityTransfersSection
- Given: The user has filled in the inline input row with:
  - Source Account: "Raw Materials - Warehouse A (1010)"
  - Destination Account: "WIP - Production Line 1 (1020)"
  - Amount: "500"
  - Unit: "kg"
  - Source Batch ID: "BATCH-RM-A-001"
- When: The user clicks the "+ Add Quantity Transfer" button
- Then: A new row appears in the Quantity Transfers table with:
  - Source Account: "Raw Materials - Warehouse A (1010)"
  - Destination Account: "WIP - Production Line 1 (1020)"
  - Amount: "500 kg"
  - Source Batch ID: "BATCH-RM-A-001"
- And: The inline input fields are cleared for the next entry

**Test: Source Account dropdown shows available accounts**
- Components: QuantityTransfersSection
- Given: The user is on the NewTransactionPage
- When: The user clicks the "Source Account" dropdown in the add-transfer row
- Then: A list of available accounts is displayed with account name and number (e.g., "Raw Materials - Warehouse A (1010)")

**Test: Destination Account dropdown shows available accounts**
- Components: QuantityTransfersSection
- Given: The user is on the NewTransactionPage
- When: The user clicks the "Destination Account" dropdown in the add-transfer row
- Then: A list of available accounts is displayed with account name and number (e.g., "WIP - Production Line 1 (1020)")

**Test: Amount field accepts numeric values only**
- Components: QuantityTransfersSection
- Given: The user is on the NewTransactionPage
- When: The user types "500" into the Amount field in the add-transfer row
- Then: The field displays "500"
- And: The field does not accept non-numeric characters

**Test: Source Batch ID field is optional and accepts free text**
- Components: QuantityTransfersSection
- Given: The user is on the NewTransactionPage
- When: The user leaves the Source Batch ID field empty and adds a transfer
- Then: The transfer row is added successfully with the Source Batch ID column showing empty or "N/A"

**Test: Adding multiple transfer rows**
- Components: QuantityTransfersSection
- Given: The user has added one transfer row from "Raw Materials - Warehouse A (1010)" to "WIP - Production Line 1 (1020)" for "500 kg"
- When: The user fills in a second transfer with Source Account "Finished Goods - Warehouse B (1030)", Destination Account "Cost of Goods Sold (5010)", Amount "200 Units"
- And: The user clicks "+ Add Quantity Transfer"
- Then: Two rows are displayed in the Quantity Transfers table:
  - Row 1: "Raw Materials - Warehouse A (1010)" → "WIP - Production Line 1 (1020)", 500 kg, BATCH-RM-A-001
  - Row 2: "Finished Goods - Warehouse B (1030)" → "Cost of Goods Sold (5010)", 200 Units

**Test: Delete button removes a transfer row**
- Components: QuantityTransfersSection
- Given: The Quantity Transfers table has two transfer rows
- When: The user clicks the delete/trash icon on the first transfer row
- Then: The first transfer row is removed from the table
- And: Only the second transfer row remains

**Test: Delete icon is displayed on each transfer row**
- Components: QuantityTransfersSection
- Given: The Quantity Transfers table has one or more transfer rows
- Then: Each row displays a delete/trash icon on the far right side

**Test: Unit selector allows choosing the unit of measure**
- Components: QuantityTransfersSection
- Given: The user is on the NewTransactionPage
- When: The user clicks the unit dropdown next to the Amount field
- Then: Available units are displayed (e.g., "unit", "kg", "m", "L")
- And: The user can select a unit for the transfer amount

**Test: Pre-filled transfer data from navigation**
- Components: QuantityTransfersSection
- Given: The user navigated to /transactions/new from an account or material page with pre-filled data
- Then: The Quantity Transfers section shows the pre-filled transfer row(s) with the correct source/destination accounts and material information

### BatchAllocationSection

**Test: Batch Allocation section displays with numbered heading "3. Batch Allocation"**
- Components: BatchAllocationSection
- Given: The user navigates to /transactions/new
- Then: A section heading "3. Batch Allocation" is displayed below the Quantity Transfers section

**Test: Batch Allocation table displays correct column headers**
- Components: BatchAllocationSection
- Given: The user navigates to /transactions/new
- Then: The Batch Allocation table shows columns: Material, Amount
- And: A delete/remove icon column is shown on the far right

**Test: Batch Allocation table is initially empty**
- Components: BatchAllocationSection
- Given: The user navigates to /transactions/new without any pre-filled data
- Then: The Batch Allocation table has no data rows
- And: The "+ Create New Batch" button and inline input row are visible below the table

**Test: Add batch inline row shows Material dropdown and Amount input**
- Components: BatchAllocationSection
- Given: The user is on the NewTransactionPage
- Then: Below the table rows, an inline row displays:
  - A "Material" dropdown selector
  - An "Amount" numeric input field with a spinner/increment control

**Test: Clicking "+ Create New Batch" button adds a new batch row**
- Components: BatchAllocationSection
- Given: The user has filled in the inline input row with:
  - Material: "FG-Product-X"
  - Amount: "200"
- When: The user clicks the "+ Create New Batch" button
- Then: A new row appears in the Batch Allocation table with:
  - Material: "FG-Product-X"
  - Amount: "200 Units"
- And: The inline input fields are cleared for the next entry

**Test: Material dropdown shows available materials**
- Components: BatchAllocationSection
- Given: The user is on the NewTransactionPage
- When: The user clicks the "Material" dropdown in the add-batch row
- Then: A list of available materials is displayed (e.g., "FG-Product-X", "FG-Product-Y", "Raw Material A")

**Test: Amount field in batch allocation accepts numeric values**
- Components: BatchAllocationSection
- Given: The user is on the NewTransactionPage
- When: The user types "150" into the Amount field in the add-batch row
- Then: The field displays "150"

**Test: Adding multiple batch rows**
- Components: BatchAllocationSection
- Given: The user has added one batch row for "FG-Product-X" with amount "200 Units"
- When: The user fills in Material "FG-Product-Y" and Amount "150" and clicks "+ Create New Batch"
- Then: Two rows are displayed in the Batch Allocation table:
  - Row 1: FG-Product-X, 200 Units
  - Row 2: FG-Product-Y, 150 Units

**Test: Delete button removes a batch row**
- Components: BatchAllocationSection
- Given: The Batch Allocation table has two batch rows
- When: The user clicks the delete/trash icon on the first batch row
- Then: The first batch row is removed from the table
- And: Only the second batch row remains

**Test: Delete icon is displayed on each batch row**
- Components: BatchAllocationSection
- Given: The Batch Allocation table has one or more batch rows
- Then: Each row displays a delete/trash icon on the far right side

**Test: Batch amount field shows unit from the selected material**
- Components: BatchAllocationSection
- Given: The user selects "FG-Product-X" which uses "Units" as its unit of measure
- Then: The Amount column for that batch row displays the value with "Units" (e.g., "200 Units")

### PostButton

**Test: Post button is displayed in the page header with primary styling**
- Components: PostButton
- Given: The user navigates to /transactions/new
- Then: A "Post" button is displayed in the top-right corner of the page header
- And: The button has primary/prominent styling (e.g., filled blue/green background, white text)

**Test: Clicking Post button with valid data creates the transaction and navigates to detail page**
- Components: PostButton, BasicInfoForm, QuantityTransfersSection, BatchAllocationSection
- Given: The user has filled in:
  - Date: "2024-05-23"
  - Reference ID: "TRX-20240523-001"
  - Description: "Q2 Inventory Adjustment for raw materials and finished goods."
  - Transaction Type: "Transfer"
  - One quantity transfer: Raw Materials - Warehouse A (1010) → WIP - Production Line 1 (1020), 500 kg, BATCH-RM-A-001
  - One batch: FG-Product-X, 200 Units
- When: The user clicks the "Post" button
- Then: The transaction is created and persisted in the database
- And: The app navigates to the TransactionDetailPage (/transactions/:transactionId) for the newly created transaction

**Test: Posted transaction appears in TransactionsPage listing**
- Components: PostButton
- Given: The user has created a new transaction with Reference ID "TRX-20240523-001"
- When: The user navigates to /transactions (TransactionsPage)
- Then: The newly created transaction appears in the transactions table with the correct date, reference ID, description, and accounts affected

**Test: Posted transaction updates account balances**
- Components: PostButton
- Given: The user has created a transaction transferring 500 kg from "Raw Materials - Warehouse A" to "WIP - Production Line 1"
- When: The user navigates to the AccountDetailPage for "Raw Materials - Warehouse A"
- Then: The material quantities reflect the deduction of 500 kg
- When: The user navigates to the AccountDetailPage for "WIP - Production Line 1"
- Then: The material quantities reflect the addition of 500 kg

**Test: Posted transaction with batch allocation creates new batches**
- Components: PostButton, BatchAllocationSection
- Given: The user has created a transaction with a batch allocation for "FG-Product-X", 200 Units
- When: The user navigates to the MaterialDetailPage for "FG-Product-X"
- Then: A new batch appears in the batches list with 200 Units
- And: The batch's lineage references the creating transaction

**Test: Post button validates that required fields are filled**
- Components: PostButton, BasicInfoForm
- Given: The user is on the NewTransactionPage with the Date field empty or the Transaction Type not selected
- When: The user clicks the "Post" button
- Then: Validation errors are displayed on the missing required fields (e.g., "Date is required", "Transaction Type is required")
- And: The transaction is not created

**Test: Post button validates that at least one quantity transfer exists**
- Components: PostButton, QuantityTransfersSection
- Given: The user has filled in Basic Info fields but has not added any quantity transfers
- When: The user clicks the "Post" button
- Then: A validation error is displayed (e.g., "At least one quantity transfer is required")
- And: The transaction is not created

**Test: Post button validates double-entry balance (debits equal credits)**
- Components: PostButton, QuantityTransfersSection
- Given: The user has added transfers that do not balance (e.g., source amounts do not equal destination amounts across transfers)
- When: The user clicks the "Post" button
- Then: A validation error is displayed (e.g., "Transaction is unbalanced: debits must equal credits")
- And: The transaction is not created

**Test: Post button is disabled or shows loading state while submitting**
- Components: PostButton
- Given: The user has filled in valid data and clicks "Post"
- Then: The "Post" button shows a loading/spinner state or becomes disabled to prevent double submission
- And: The button returns to normal state if submission fails

### CancelButton

**Test: Cancel button is displayed in the page header with secondary styling**
- Components: CancelButton
- Given: The user navigates to /transactions/new
- Then: A "Cancel" button is displayed in the top-right corner of the page header, to the left of the "Post" button
- And: The button has secondary/outline styling (e.g., outlined, less prominent than the Post button)

**Test: Clicking Cancel button navigates back to TransactionsPage**
- Components: CancelButton
- Given: The user is on the NewTransactionPage
- When: The user clicks the "Cancel" button
- Then: The app navigates to /transactions (TransactionsPage)
- And: No transaction is created

**Test: Clicking Cancel button with unsaved data shows confirmation dialog**
- Components: CancelButton
- Given: The user has entered data in the form (e.g., typed a description or added a transfer row)
- When: The user clicks the "Cancel" button
- Then: A confirmation dialog appears asking "Are you sure you want to cancel? Unsaved changes will be lost."
- And: The dialog shows "Confirm" and "Stay" buttons

**Test: Confirming cancel discards changes and navigates away**
- Components: CancelButton
- Given: The cancel confirmation dialog is showing
- When: The user clicks "Confirm" in the dialog
- Then: The app navigates to /transactions (TransactionsPage)
- And: All entered data is discarded

**Test: Clicking Stay in cancel dialog returns to the form**
- Components: CancelButton
- Given: The cancel confirmation dialog is showing
- When: The user clicks "Stay" in the dialog
- Then: The dialog closes
- And: The user remains on the NewTransactionPage with all entered data preserved

**Test: Page header displays "New Transaction" title**
- Components: PostButton, CancelButton
- Given: The user navigates to /transactions/new
- Then: The page header displays "New Transaction" as a large heading on the left
- And: The Cancel and Post buttons are on the right side of the header

**Test: Sidebar shows Transactions link as active on New Transaction page**
- Components: PostButton, CancelButton
- Given: The user navigates to /transactions/new
- Then: The sidebar "Transactions" link is visually highlighted as the active page
