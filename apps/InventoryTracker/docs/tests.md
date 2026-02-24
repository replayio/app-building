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

<!-- Tests to be added by PlanPageAccounts -->

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
