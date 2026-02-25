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

<!-- Tests to be added by PlanPageAccountDetail -->

---

## MaterialsPage (/materials)

Components: NewMaterialButton, NewCategoryButton, SearchBar, CategoryFilter, AccountFilter, SortDropdown, MaterialsTable, Pagination

<!-- Tests to be added by PlanPageMaterials -->

---

## MaterialDetailPage (/materials/:materialId)

Components: MaterialHeader, EditMaterialButton, NewBatchButton, NewTransactionButton, AccountsDistributionTable, AllBatchesTable, TransactionsHistoryTable

<!-- Tests to be added by PlanPageMaterialDetail -->

---

## BatchDetailPage (/batches/:batchId)

Components: BatchHeader, CreateNewTransactionButton, BatchOverview, LineageDiagram, UsageHistoryTable

<!-- Tests to be added by PlanPageBatchDetail -->

---

## TransactionsPage (/transactions)

Components: NewTransactionButton, DateRangeFilter, AccountFilter, MaterialFilter, TransactionTypeFilter, SearchBar, TransactionsTable, Pagination

<!-- Tests to be added by PlanPageTransactions -->

---

## TransactionDetailPage (/transactions/:transactionId)

Components: TransactionHeader, BasicInfoSection, QuantityTransfersTable, BatchesCreatedTable

<!-- Tests to be added by PlanPageTransactionDetail -->

---

## NewTransactionPage (/transactions/new)

Components: BasicInfoForm, QuantityTransfersSection, BatchAllocationSection, PostButton, CancelButton

<!-- Tests to be added by PlanPageNewTransaction -->
