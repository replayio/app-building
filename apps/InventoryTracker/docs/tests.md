# InventoryTracker Test Specification

## Navigation & Layout

_Consistent sidebar navigation across all pages: Dashboard, Accounts, Materials, Batches, Transactions, Settings. Clicking each nav item navigates to the corresponding page. Active page is highlighted in the sidebar._

---

## DashboardPage (`/`)

Components: LowInventoryAlerts, MaterialsCategoriesOverview, RecentTransactionsTable, DateRangeFilter, CategoryFilter, NewTransactionButton

<!-- Tests will be added by PlanPageDashboard -->

---

## AccountsPage (`/accounts`)

Components: StockAccountsList, InputAccountsList, OutputAccountsList, CreateAccountButton, AccountRowActions

<!-- Tests will be added by PlanPageAccounts -->

---

## AccountDetailPage (`/accounts/:accountId`)

Components: AccountHeader, TrackedMaterialsTable

<!-- Tests will be added by PlanPageAccountDetail -->

---

## MaterialsPage (`/materials`)

Components: MaterialsToolbar, MaterialsFilterBar, MaterialsTable, Pagination

<!-- Tests will be added by PlanPageMaterials -->

---

## MaterialDetailPage (`/materials/:materialId`)

Components: MaterialHeader, AccountsDistribution, AllBatchesList, TransactionsHistory

<!-- Tests will be added by PlanPageMaterialDetail -->

---

## BatchDetailPage (`/batches/:batchId`)

Components: BatchHeader, BatchOverview, LineageDiagram, UsageHistoryTable

### BatchHeader

#### Test: Batch ID is displayed as the primary page heading
- **Components:** BatchHeader
- **Initial state:** User navigates to `/batches/BATCH-12345`.
- **Action:** Page loads.
- **Expected:** The header displays "Batch: BATCH-12345" in large, bold text as the primary heading of the page.

#### Test: Material name is displayed in the header
- **Components:** BatchHeader
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch is for material "Organic Arabica Coffee Beans".
- **Action:** Page loads.
- **Expected:** A "Material" label is displayed in the header area with the value "Organic Arabica Coffee Beans" below it, to the right of the Batch ID heading.

#### Test: Account name is displayed in the header
- **Components:** BatchHeader
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch belongs to account "Global Imports Inc.".
- **Action:** Page loads.
- **Expected:** An "Account" label is displayed in the header area with the value "Global Imports Inc." below it, to the right of the Material field.

#### Test: Status badge with green dot is displayed for active batch
- **Components:** BatchHeader
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch has an "Active" status.
- **Action:** Page loads.
- **Expected:** A "Status" label is displayed in the header area with a green dot indicator and the text "Active" below it, to the right of the Account field. The green dot visually indicates the active state.

#### Test: Created date and time are displayed below the heading
- **Components:** BatchHeader
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch was created on 2023-10-27 at 10:30 AM.
- **Action:** Page loads.
- **Expected:** A pill/badge below the Batch ID heading displays "Created: 2023-10-27 at 10:30 AM". The date and time are formatted clearly.

#### Test: Originating Transaction link is displayed and clickable
- **Components:** BatchHeader
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch was created by transaction TX-PROD-987.
- **Action:** Page loads.
- **Expected:** A pill/badge below the Batch ID heading displays "Originating Transaction: TX-PROD-987". The transaction ID "TX-PROD-987" portion is a clickable link.

#### Test: Clicking Originating Transaction link navigates to TransactionDetailPage
- **Components:** BatchHeader
- **Initial state:** User is on `/batches/BATCH-12345`. The header shows "Originating Transaction: TX-PROD-987" as a clickable link.
- **Action:** User clicks the "TX-PROD-987" link.
- **Expected:** User is navigated to the TransactionDetailPage (`/transactions/TX-PROD-987`).

#### Test: Create New Transaction button is displayed in the header
- **Components:** BatchHeader
- **Initial state:** User navigates to `/batches/BATCH-12345`.
- **Action:** Page loads.
- **Expected:** A blue/primary "+ Create New Transaction" button with a plus icon is displayed in the top-right area of the header.

#### Test: Create New Transaction button navigates to NewTransactionPage
- **Components:** BatchHeader
- **Initial state:** User is on `/batches/BATCH-12345`.
- **Action:** User clicks the "+ Create New Transaction" button.
- **Expected:** User is navigated to the NewTransactionPage (`/transactions/new`).

### BatchOverview

#### Test: Batch Overview section heading is displayed
- **Components:** BatchOverview
- **Initial state:** User navigates to `/batches/BATCH-12345`.
- **Action:** Page loads.
- **Expected:** A "Batch Overview" heading is displayed on the left side of the main content area, above a card containing quantity and properties.

#### Test: Current Quantity & Properties subheading is displayed
- **Components:** BatchOverview
- **Initial state:** User navigates to `/batches/BATCH-12345`.
- **Action:** Page loads.
- **Expected:** Within the Batch Overview card, a "Current Quantity & Properties" subheading is displayed at the top of the card.

#### Test: Quantity is displayed in large prominent format
- **Components:** BatchOverview
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch has a quantity of 1500.00 kg.
- **Action:** Page loads.
- **Expected:** A "Quantity" label is displayed followed by "1500.00 kg" in large, bold text. The quantity value is visually prominent with a larger font size than surrounding text.

#### Test: Unit of measure is displayed below quantity
- **Components:** BatchOverview
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch unit is Kilograms (kg).
- **Action:** Page loads.
- **Expected:** A "Unit" label is displayed below the quantity with the value "Kilograms (kg)" showing both the full unit name and abbreviation.

#### Test: Location property is displayed with icon
- **Components:** BatchOverview
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch location is "Warehouse A, Zone 4".
- **Action:** Page loads.
- **Expected:** A location pin icon is displayed followed by a "Location" label and the value "Warehouse A, Zone 4" below the unit section, separated by a divider line.

#### Test: Lot Number property is displayed with icon
- **Components:** BatchOverview
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch lot number is "LOT-2023-OCB".
- **Action:** Page loads.
- **Expected:** A document icon is displayed followed by a "Lot Number" label and the value "LOT-2023-OCB".

#### Test: Expiration Date property is displayed with icon
- **Components:** BatchOverview
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch expiration date is 2024-10-27.
- **Action:** Page loads.
- **Expected:** A calendar icon is displayed followed by an "Expiration Date" label and the value "2024-10-27".

#### Test: Quality Grade property is displayed with icon
- **Components:** BatchOverview
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch quality grade is "Premium".
- **Action:** Page loads.
- **Expected:** A badge/star icon is displayed followed by a "Quality Grade" label and the value "Premium".

#### Test: Storage Condition property is displayed with icon
- **Components:** BatchOverview
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch storage condition is "Climate Controlled".
- **Action:** Page loads.
- **Expected:** A temperature/storage icon is displayed followed by a "Storage Condition" label and the value "Climate Controlled".

### LineageDiagram

#### Test: Lineage section heading is displayed
- **Components:** LineageDiagram
- **Initial state:** User navigates to `/batches/BATCH-12345`.
- **Action:** Page loads.
- **Expected:** A "Lineage" heading is displayed on the right side of the main content area, above the lineage diagram card.

#### Test: Source Transaction heading displays transaction ID
- **Components:** LineageDiagram
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch was created by transaction TX-PROD-987.
- **Action:** Page loads.
- **Expected:** Within the Lineage card, a heading "Source Transaction: TX-PROD-987" is displayed at the top.

#### Test: Inputs Used section lists input batches with details
- **Components:** LineageDiagram
- **Initial state:** User navigates to `/batches/BATCH-12345`. The originating transaction TX-PROD-987 used two input batches: BATCH-11001 (Raw Coffee Cherries, 1800.00 kg, Farm Co-op) and BATCH-11002 (Water for Washing, 5000.00 L, Facility Supplies).
- **Action:** Page loads.
- **Expected:** An "Inputs Used:" label is displayed. Below it, two input batch entries are listed. Each entry shows: Batch ID as a clickable blue link, "Material:" with material name, "Quantity:" with amount and unit, and "Account:" with account name. Specifically: (1) "BATCH-11001" link, Material: Raw Coffee Cherries, Quantity: 1800.00 kg, Account: Farm Co-op. (2) "BATCH-11002" link, Material: Water for Washing, Quantity: 5000.00 L, Account: Facility Supplies.

#### Test: Clicking an input batch ID link navigates to that batch's detail page
- **Components:** LineageDiagram
- **Initial state:** User is on `/batches/BATCH-12345`. The Lineage section shows input batch "BATCH-11001" as a clickable blue link.
- **Action:** User clicks "BATCH-11001".
- **Expected:** User is navigated to the BatchDetailPage (`/batches/BATCH-11001`).

#### Test: Process box displays transaction name and date
- **Components:** LineageDiagram
- **Initial state:** User navigates to `/batches/BATCH-12345`. The originating transaction is TX-PROD-987 of type "Washing & Processing" on 2023-10-27.
- **Action:** Page loads.
- **Expected:** A central process box in the lineage diagram displays the transaction description "Washing & Processing" with the transaction ID "(TX-PROD-987)" and "Date: 2023-10-27". The box is styled distinctly (e.g., with a border and background color) to represent the transformation process.

#### Test: Visual flow arrows connect inputs to process box and process box to output
- **Components:** LineageDiagram
- **Initial state:** User navigates to `/batches/BATCH-12345`. The lineage has input batches, a process box, and an output batch.
- **Action:** Page loads.
- **Expected:** Visual arrow lines flow from the input batches on the left to the central process box, and from the process box to the output batch on the right. The arrows indicate the direction of material flow (left to right).

#### Test: Output batch displays batch ID, material, quantity, and account
- **Components:** LineageDiagram
- **Initial state:** User navigates to `/batches/BATCH-12345`. This is the output batch of transaction TX-PROD-987.
- **Action:** Page loads.
- **Expected:** On the right side of the lineage diagram, an "Output:" label is displayed followed by "BATCH-12345" as a clickable blue link, "Material: Organic Arabica Coffee Beans", "Quantity: 1500.00 kg", and "Account: Global Imports Inc.".

#### Test: Clicking output batch ID link navigates to that batch's detail page
- **Components:** LineageDiagram
- **Initial state:** User is on `/batches/BATCH-12345`. The output section shows "BATCH-12345" as a clickable link.
- **Action:** User clicks "BATCH-12345" in the output section.
- **Expected:** User is navigated to the BatchDetailPage (`/batches/BATCH-12345`) (reloads/stays on the same page since this is the current batch).

### UsageHistoryTable

#### Test: Usage History section heading is displayed
- **Components:** UsageHistoryTable
- **Initial state:** User navigates to `/batches/BATCH-12345`.
- **Action:** Page loads.
- **Expected:** A "Usage History" heading is displayed below the Lineage section on the right side of the page.

#### Test: Usage History table displays all column headers
- **Components:** UsageHistoryTable
- **Initial state:** User navigates to `/batches/BATCH-12345`.
- **Action:** Page loads.
- **Expected:** The table displays column headers: "Date & Time", "Transaction ID", "Type", "Movement (In/Out)", "Amount (kg)", and "Created Batches".

#### Test: Date & Time column displays formatted timestamps
- **Components:** UsageHistoryTable
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch has usage history entries.
- **Action:** Page loads.
- **Expected:** The Date & Time column displays formatted date and time values (e.g., "2023-11-05, 14:20", "2023-11-10, 09:15") for each usage history row.

#### Test: Transaction ID column displays clickable links
- **Components:** UsageHistoryTable
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch has usage history entries with transactions TX-PACK-221, TX-ROAST-305, TX-ADJ-054, and TX-PROD-987.
- **Action:** Page loads.
- **Expected:** The Transaction ID column displays each transaction ID (e.g., "TX-PACK-221", "TX-ROAST-305") as clickable blue links.

#### Test: Clicking a Transaction ID link navigates to TransactionDetailPage
- **Components:** UsageHistoryTable
- **Initial state:** User is on `/batches/BATCH-12345`. The Usage History table shows "TX-PACK-221" as a clickable link.
- **Action:** User clicks "TX-PACK-221".
- **Expected:** User is navigated to the TransactionDetailPage (`/transactions/TX-PACK-221`).

#### Test: Type column displays transaction type labels
- **Components:** UsageHistoryTable
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch has usage history entries of various types.
- **Action:** Page loads.
- **Expected:** The Type column displays the type of each transaction (e.g., "Packaging", "Roasting", "Inventory Adjustment", "Production").

#### Test: Movement column indicates In or Out direction
- **Components:** UsageHistoryTable
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch has usage history with both inbound (Production creating the batch) and outbound (Packaging, Roasting, Adjustment consuming from the batch) movements.
- **Action:** Page loads.
- **Expected:** The Movement (In/Out) column displays "In" for transactions that added quantity to this batch (e.g., the originating Production transaction) and "Out" for transactions that consumed quantity from this batch (e.g., Packaging, Roasting, Inventory Adjustment).

#### Test: Amount column displays quantities
- **Components:** UsageHistoryTable
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch has usage history entries with various amounts.
- **Action:** Page loads.
- **Expected:** The Amount column displays the numeric quantity for each transaction (e.g., "500.00", "800.00", "5.00", "1500.00"). The column header includes the unit in parentheses matching the batch's unit of measure (e.g., "Amount (kg)").

#### Test: Created Batches column displays clickable batch links
- **Components:** UsageHistoryTable
- **Initial state:** User navigates to `/batches/BATCH-12345`. Some usage history transactions created new batches: TX-PACK-221 created BATCH-12401 and BATCH-12402, TX-ROAST-305 created BATCH-12500.
- **Action:** Page loads.
- **Expected:** The Created Batches column displays batch IDs as clickable blue links, comma-separated when multiple batches were created (e.g., "BATCH-12401, BATCH-12402" for the Packaging row, "BATCH-12500" for the Roasting row). Rows where no batches were created show a dash "-".

#### Test: Clicking a Created Batch link navigates to that batch's detail page
- **Components:** UsageHistoryTable
- **Initial state:** User is on `/batches/BATCH-12345`. The Usage History table shows "BATCH-12401" as a clickable link in the Created Batches column.
- **Action:** User clicks "BATCH-12401".
- **Expected:** User is navigated to the BatchDetailPage (`/batches/BATCH-12401`).

#### Test: Usage History displays multiple rows in chronological order
- **Components:** UsageHistoryTable
- **Initial state:** User navigates to `/batches/BATCH-12345`. The batch has four usage history entries.
- **Action:** Page loads.
- **Expected:** Four rows are displayed in the Usage History table: (1) 2023-11-05, 14:20 | TX-PACK-221 | Packaging | Out | 500.00 | BATCH-12401, BATCH-12402. (2) 2023-11-10, 09:15 | TX-ROAST-305 | Roasting | Out | 800.00 | BATCH-12500. (3) 2023-11-12, 11:00 | TX-ADJ-054 | Inventory Adjustment | Out | 5.00 | -. (4) 2023-10-27, 10:30 | TX-PROD-987 | Production | In | 1500.00 | -.

#### Test: Empty Usage History when batch has no transactions
- **Components:** UsageHistoryTable
- **Initial state:** User navigates to a newly created batch that has only the originating transaction and no subsequent usage.
- **Action:** Page loads.
- **Expected:** The Usage History table displays column headers and at minimum the originating transaction row showing the "In" movement. If no other transactions exist, only the single originating row is shown.

---

## TransactionsPage (`/transactions`)

Components: TransactionsFilterBar, TransactionsTable, NewTransactionButton

### Page Header

#### Test: Breadcrumb navigation displays Home / Transactions
- **Components:** TransactionsFilterBar
- **Initial state:** User navigates to `/transactions`.
- **Action:** Page loads.
- **Expected:** A breadcrumb trail is displayed showing "Home / Transactions". "Home" is a clickable link. "Transactions" is the current page label and is not clickable. The "/" separator is visible between each breadcrumb segment.

#### Test: Breadcrumb Home link navigates to Dashboard
- **Components:** TransactionsFilterBar
- **Initial state:** User is on `/transactions`. Breadcrumb shows "Home / Transactions".
- **Action:** User clicks "Home" in the breadcrumb.
- **Expected:** User is navigated to the DashboardPage (`/`).

#### Test: New Transaction button is displayed in the page header
- **Components:** NewTransactionButton
- **Initial state:** User navigates to `/transactions`.
- **Action:** Page loads.
- **Expected:** A blue/primary "+ New Transaction" button is displayed in the top-right area of the page header, to the right of the breadcrumb/title area.

#### Test: New Transaction button navigates to NewTransactionPage
- **Components:** NewTransactionButton
- **Initial state:** User is on `/transactions`.
- **Action:** User clicks the "+ New Transaction" button.
- **Expected:** User is navigated to the NewTransactionPage (`/transactions/new`).

### TransactionsFilterBar

#### Test: Filters section is displayed with label and Clear Filters button
- **Components:** TransactionsFilterBar
- **Initial state:** User navigates to `/transactions`.
- **Action:** Page loads.
- **Expected:** A "Filters" label is displayed above the filter controls. A "Clear Filters" text button is displayed to the right of the "Filters" label. Four filter controls are arranged in a horizontal row below the label: Date Range, Involved Account(s), Material, and Transaction Type.

#### Test: Date Range picker displays selected range with calendar icon
- **Components:** TransactionsFilterBar
- **Initial state:** User navigates to `/transactions`. A date range filter is applied showing Oct 1, 2023 to Oct 31, 2023.
- **Action:** Page loads.
- **Expected:** The Date Range filter shows a calendar icon on the left and displays the selected range as "Oct 1, 2023 - Oct 31, 2023" within the input field. The field has a "Date Range" label above it.

#### Test: Date Range picker opens calendar for date selection
- **Components:** TransactionsFilterBar
- **Initial state:** User is on `/transactions`.
- **Action:** User clicks the Date Range picker input.
- **Expected:** A calendar popup or date range picker opens allowing the user to select a start and end date. The user can navigate between months and select individual dates for both the start and end of the range.

#### Test: Selecting a date range filters the transactions table
- **Components:** TransactionsFilterBar, TransactionsTable
- **Initial state:** User is on `/transactions`. The table shows transactions across multiple dates.
- **Action:** User opens the Date Range picker and selects Oct 25, 2023 to Oct 27, 2023.
- **Expected:** The Date Range field updates to show "Oct 25, 2023 - Oct 27, 2023". The TransactionsTable updates to show only transactions with dates falling within the selected range. The "Showing X of Y results" count updates accordingly.

#### Test: Involved Account(s) multi-select displays selected accounts with count
- **Components:** TransactionsFilterBar
- **Initial state:** User navigates to `/transactions`. Two accounts are selected in the Involved Account(s) filter.
- **Action:** Page loads.
- **Expected:** The Involved Account(s) field displays the selected account names (e.g., "Raw Materials Inventory (1200), Accounts Payable (2100)") followed by a count indicator "(2 selected)". The field has an "Involved Account(s)" label above it.

#### Test: Involved Account(s) multi-select opens dropdown with available accounts
- **Components:** TransactionsFilterBar
- **Initial state:** User is on `/transactions`. Multiple accounts exist in the system.
- **Action:** User clicks the Involved Account(s) multi-select field.
- **Expected:** A dropdown opens listing all available accounts in the system with checkboxes. Each account shows its name and ID (e.g., "Raw Materials Inventory (1200)"). Previously selected accounts have their checkboxes checked.

#### Test: Selecting and deselecting accounts in Involved Account(s) updates filter
- **Components:** TransactionsFilterBar, TransactionsTable
- **Initial state:** User is on `/transactions`. No accounts are selected in the Involved Account(s) filter. The table shows all transactions.
- **Action:** User opens the Involved Account(s) dropdown, checks "Raw Materials Inventory (1200)" and "Accounts Payable (2100)", then closes the dropdown.
- **Expected:** The Involved Account(s) field shows the two selected account names with "(2 selected)". The TransactionsTable updates to show only transactions that involve at least one of the selected accounts. The "Showing X of Y results" count updates.

#### Test: Material multi-select displays selected materials with count
- **Components:** TransactionsFilterBar
- **Initial state:** User navigates to `/transactions`. Two materials are selected in the Material filter.
- **Action:** Page loads.
- **Expected:** The Material field displays the selected material names (e.g., "Steel Plates (M001), Plastic Pellets (M002)") followed by a count indicator "(2 selected)". The field has a "Material" label above it.

#### Test: Material multi-select opens dropdown with available materials
- **Components:** TransactionsFilterBar
- **Initial state:** User is on `/transactions`. Multiple materials exist in the system.
- **Action:** User clicks the Material multi-select field.
- **Expected:** A dropdown opens listing all available materials in the system with checkboxes. Each material shows its name and code (e.g., "Steel Plates (M001)"). Previously selected materials have their checkboxes checked.

#### Test: Selecting materials filters the transactions table
- **Components:** TransactionsFilterBar, TransactionsTable
- **Initial state:** User is on `/transactions`. No materials are selected. The table shows all transactions.
- **Action:** User opens the Material dropdown and checks "Steel Plates (M001)".
- **Expected:** The Material field shows "Steel Plates (M001) (1 selected)". The TransactionsTable updates to show only transactions that involve Steel Plates. The "Showing X of Y results" count updates.

#### Test: Transaction Type dropdown displays current selection
- **Components:** TransactionsFilterBar
- **Initial state:** User navigates to `/transactions`. No specific transaction type is filtered.
- **Action:** Page loads.
- **Expected:** The Transaction Type dropdown displays "All Types (Purchase, Consumption, Transfer...)" as the default value. The field has a "Transaction Type" label above it.

#### Test: Transaction Type dropdown opens with available types
- **Components:** TransactionsFilterBar
- **Initial state:** User is on `/transactions`.
- **Action:** User clicks the Transaction Type dropdown.
- **Expected:** A dropdown menu opens listing the available transaction types (e.g., Purchase, Consumption, Transfer, Inventory Adjustment, and an "All Types" option). The user can select one type.

#### Test: Selecting a transaction type filters the table
- **Components:** TransactionsFilterBar, TransactionsTable
- **Initial state:** User is on `/transactions`. Transaction Type is set to "All Types". The table shows transactions of various types.
- **Action:** User opens the Transaction Type dropdown and selects "Purchase".
- **Expected:** The Transaction Type dropdown displays "Purchase". The TransactionsTable updates to show only purchase transactions. The "Showing X of Y results" count updates.

#### Test: Clear Filters button resets all filters to defaults
- **Components:** TransactionsFilterBar, TransactionsTable
- **Initial state:** User is on `/transactions`. Filters are applied: Date Range is "Oct 1, 2023 - Oct 31, 2023", Involved Account(s) has 2 accounts selected, Material has 2 materials selected, Transaction Type is "Purchase".
- **Action:** User clicks the "Clear Filters" button.
- **Expected:** All filter controls are reset to their default state: Date Range is cleared/empty, Involved Account(s) shows no selections, Material shows no selections, Transaction Type resets to "All Types". The TransactionsTable updates to show all unfiltered transactions. The "Showing X of Y results" count reflects the full unfiltered dataset.

#### Test: Search bar displays placeholder text and magnifying glass icon
- **Components:** TransactionsFilterBar
- **Initial state:** User navigates to `/transactions`. No search query is entered.
- **Action:** Page loads.
- **Expected:** A search input is displayed below the filter controls with a magnifying glass icon on the left and placeholder text "Search by ID or description...".

#### Test: Typing in search bar filters transactions by ID
- **Components:** TransactionsFilterBar, TransactionsTable
- **Initial state:** User is on `/transactions`. The table shows multiple transactions.
- **Action:** User types "TXN-100245" into the search bar.
- **Expected:** The TransactionsTable updates to show only the transaction with ID "TXN-100245". The "Showing X of Y results" count updates to reflect the filtered results.

#### Test: Typing in search bar filters transactions by description
- **Components:** TransactionsFilterBar, TransactionsTable
- **Initial state:** User is on `/transactions`. The table shows multiple transactions.
- **Action:** User types "Steel Plates" into the search bar.
- **Expected:** The TransactionsTable updates to show only transactions whose description contains "Steel Plates" (e.g., "Purchase of Steel Plates from Supplier A"). The "Showing X of Y results" count updates accordingly.

#### Test: Clearing the search bar restores unfiltered results
- **Components:** TransactionsFilterBar, TransactionsTable
- **Initial state:** User is on `/transactions`. The search bar contains "Steel Plates" and the table is filtered.
- **Action:** User clears the search bar text (backspace or clear button).
- **Expected:** The TransactionsTable returns to showing the unfiltered results (subject to any active filter controls). The "Showing X of Y results" count updates.

#### Test: Filters and search bar work together
- **Components:** TransactionsFilterBar, TransactionsTable
- **Initial state:** User is on `/transactions`. Transaction Type is set to "Purchase". The table shows purchase transactions.
- **Action:** User types "Steel" into the search bar.
- **Expected:** The TransactionsTable shows only transactions that are of type "Purchase" AND whose ID or description matches "Steel". Both the Transaction Type filter and search are applied simultaneously.

### TransactionsTable

#### Test: Table displays all column headers
- **Components:** TransactionsTable
- **Initial state:** User navigates to `/transactions`.
- **Action:** Page loads.
- **Expected:** The table displays column headers: "Date", "Transaction ID", "Description", "Accounts affected", and "Materials and amounts". The Date column header has a sort indicator arrow (↓ for descending by default).

#### Test: Date column displays formatted dates and is sortable
- **Components:** TransactionsTable
- **Initial state:** User navigates to `/transactions`. Transactions exist with various dates.
- **Action:** Page loads.
- **Expected:** The Date column displays dates in a formatted style (e.g., "Oct 27, 2023"). The Date column header shows a sort arrow (↓) indicating the current sort direction. Dates are displayed in descending order by default (newest first).

#### Test: Clicking Date column header toggles sort direction
- **Components:** TransactionsTable
- **Initial state:** User is on `/transactions`. Transactions are sorted by Date descending (newest first). The Date column header shows a down arrow (↓).
- **Action:** User clicks the "Date" column header.
- **Expected:** The sort direction toggles to ascending (oldest first). The Date column header arrow changes to up (↑). The table rows reorder so the earliest date appears first. The Sort by dropdown updates to reflect "Date (Oldest First)".

#### Test: Transaction ID column displays transaction IDs
- **Components:** TransactionsTable
- **Initial state:** User navigates to `/transactions`. Transactions exist in the system.
- **Action:** Page loads.
- **Expected:** The Transaction ID column displays unique transaction identifiers (e.g., "TXN-100245", "TXN-100244", "TXN-100243") for each row.

#### Test: Description column displays transaction descriptions
- **Components:** TransactionsTable
- **Initial state:** User navigates to `/transactions`.
- **Action:** Page loads.
- **Expected:** The Description column displays the full description text for each transaction (e.g., "Purchase of Steel Plates from Supplier A", "Consumption for Production Run #45", "Finished Goods Transfer to Warehouse").

#### Test: Accounts affected column shows Dr/Cr notation with account names and IDs
- **Components:** TransactionsTable
- **Initial state:** User navigates to `/transactions`. A transaction debits "Raw Materials Inventory (1200)" and credits "Accounts Payable (2100)".
- **Action:** Page loads.
- **Expected:** The Accounts affected column displays the debit and credit accounts using Dr/Cr notation, e.g., "Dr: Raw Materials Inventory [1200] | Cr: Accounts Payable (2100)". Both the account name and account ID number are shown. Debit accounts are prefixed with "Dr:" and credit accounts with "Cr:". Multiple accounts are separated by a pipe character "|".

#### Test: Materials and amounts column shows material details with quantities and pricing
- **Components:** TransactionsTable
- **Initial state:** User navigates to `/transactions`. A purchase transaction for Steel Plates exists with 500 kg at $2.50/kg.
- **Action:** Page loads.
- **Expected:** The Materials and amounts column displays the material name, code, quantity, unit, unit price, and total cost, e.g., "Steel Plates (M001): 500 kg @ $2.50/kg ($1,250.00)".

#### Test: Materials and amounts column shows multiple materials separated by semicolons
- **Components:** TransactionsTable
- **Initial state:** User navigates to `/transactions`. A consumption transaction involves both Steel Plates and Plastic Pellets.
- **Action:** Page loads.
- **Expected:** The Materials and amounts column displays multiple materials separated by semicolons, e.g., "Steel Plates (M001): 120 kg; Plastic Pellets (M002): 30 kg".

#### Test: Materials and amounts column shows N/A for non-material transactions
- **Components:** TransactionsTable
- **Initial state:** User navigates to `/transactions`. A utility bill payment transaction exists that does not involve materials.
- **Action:** Page loads.
- **Expected:** The Materials and amounts column displays "N/A ($350.00)" indicating no material is involved but showing the monetary amount.

#### Test: Clicking a table row navigates to TransactionDetailPage
- **Components:** TransactionsTable
- **Initial state:** User is on `/transactions`. The table shows transaction TXN-100245.
- **Action:** User clicks the row for TXN-100245.
- **Expected:** User is navigated to the TransactionDetailPage (`/transactions/TXN-100245`) for that transaction.

#### Test: Sort by dropdown displays current sort option
- **Components:** TransactionsTable
- **Initial state:** User navigates to `/transactions`.
- **Action:** Page loads.
- **Expected:** A "Sort by:" dropdown is displayed above the table on the right side, showing the current sort option "Date (Newest First)" as the default value.

#### Test: Sort by dropdown allows changing sort criteria
- **Components:** TransactionsTable
- **Initial state:** User is on `/transactions`. The Sort by dropdown shows "Date (Newest First)".
- **Action:** User clicks the Sort by dropdown and selects a different option (e.g., "Date (Oldest First)").
- **Expected:** The dropdown updates to show the selected sort option. The table rows reorder according to the new sort criteria. The Date column sort arrow updates to reflect the new direction.

#### Test: Showing X of Y results displays correct count
- **Components:** TransactionsTable
- **Initial state:** User navigates to `/transactions`. There are 145 total transactions. Rows per page is set to 10.
- **Action:** Page loads.
- **Expected:** A text label "Showing 1-10 of 145 results" is displayed above the table, to the right of the Sort by dropdown, indicating the current range and total count of results.

#### Test: Showing X of Y results updates when filters are applied
- **Components:** TransactionsTable, TransactionsFilterBar
- **Initial state:** User is on `/transactions`. "Showing 1-10 of 145 results" is displayed. No filters are applied.
- **Action:** User selects Transaction Type "Purchase" from the filter.
- **Expected:** The results count updates to reflect the filtered count, e.g., "Showing 1-10 of 42 results" (the exact count depends on how many purchase transactions exist).

#### Test: Pagination displays page numbers and navigation controls
- **Components:** TransactionsTable
- **Initial state:** User navigates to `/transactions`. There are 145 results with 10 per page (15 pages total).
- **Action:** Page loads.
- **Expected:** Pagination controls are displayed below the table showing: "First" button, "Previous" button, page number buttons (1, 2, 3, ..., 15), "Next" button, and "Last" button. Page 1 is highlighted as the current page. "First" and "Previous" buttons are disabled on the first page.

#### Test: Clicking Next button goes to the next page
- **Components:** TransactionsTable
- **Initial state:** User is on `/transactions`. Currently on page 1 of 15. The table shows transactions 1-10.
- **Action:** User clicks the "Next" button.
- **Expected:** The table updates to show the next set of transactions (11-20). The results count updates to "Showing 11-20 of 145 results". Page 2 is highlighted in the pagination. "Previous" and "First" buttons become enabled.

#### Test: Clicking Previous button goes to the previous page
- **Components:** TransactionsTable
- **Initial state:** User is on `/transactions`. Currently on page 2 of 15. The table shows transactions 11-20.
- **Action:** User clicks the "Previous" button.
- **Expected:** The table updates to show the first set of transactions (1-10). The results count updates to "Showing 1-10 of 145 results". Page 1 is highlighted in the pagination.

#### Test: Clicking a page number goes directly to that page
- **Components:** TransactionsTable
- **Initial state:** User is on `/transactions`. Currently on page 1 of 15.
- **Action:** User clicks page number "3" in the pagination controls.
- **Expected:** The table updates to show transactions 21-30. The results count updates to "Showing 21-30 of 145 results". Page 3 is highlighted in the pagination.

#### Test: First and Last buttons navigate to first and last pages
- **Components:** TransactionsTable
- **Initial state:** User is on `/transactions`. Currently on page 3 of 15.
- **Action:** User clicks the "Last" button.
- **Expected:** The table updates to show the last page of results (transactions 141-145). The results count updates to "Showing 141-145 of 145 results". Page 15 is highlighted. "Next" and "Last" buttons become disabled. Then user clicks "First" button and the table returns to page 1 showing transactions 1-10.

#### Test: Rows per page dropdown changes the number of displayed rows
- **Components:** TransactionsTable
- **Initial state:** User is on `/transactions`. "Rows per page: 10" is displayed to the right of the pagination. The table shows 10 rows.
- **Action:** User clicks the "Rows per page" dropdown and selects a different value (e.g., 25).
- **Expected:** The dropdown updates to show "Rows per page: 25". The table now displays up to 25 rows per page. The pagination updates (fewer total pages). The "Showing X of Y results" count updates (e.g., "Showing 1-25 of 145 results").

#### Test: Empty state when no transactions match filters
- **Components:** TransactionsTable, TransactionsFilterBar
- **Initial state:** User is on `/transactions`.
- **Action:** User applies filters that match no transactions (e.g., selects a date range with no recorded transactions).
- **Expected:** The table displays column headers but no data rows. An empty state message such as "No transactions found" is displayed. The results count shows "Showing 0 of 0 results". Pagination controls are hidden or disabled.

---

## TransactionDetailPage (`/transactions/:transactionId`)

Components: TransactionHeader, BasicInfoSection, QuantityTransfersTable, BatchesCreatedTable

### TransactionHeader

#### Test: Breadcrumb navigation displays Home > Transactions > TXN-ID
- **Components:** TransactionHeader
- **Initial state:** User navigates to `/transactions/TXN-123456`.
- **Action:** Page loads.
- **Expected:** A breadcrumb trail is displayed below the app header showing "Home > Transactions > TXN-123456". "Home" is a clickable link. "Transactions" is a clickable link. "TXN-123456" is the current page label and is not clickable. The ">" separator characters are visible between each breadcrumb segment.

#### Test: Breadcrumb Home link navigates to Dashboard
- **Components:** TransactionHeader
- **Initial state:** User is on `/transactions/TXN-123456`. Breadcrumb shows "Home > Transactions > TXN-123456".
- **Action:** User clicks "Home" in the breadcrumb.
- **Expected:** User is navigated to the DashboardPage (`/`).

#### Test: Breadcrumb Transactions link navigates to Transactions list
- **Components:** TransactionHeader
- **Initial state:** User is on `/transactions/TXN-123456`. Breadcrumb shows "Home > Transactions > TXN-123456".
- **Action:** User clicks "Transactions" in the breadcrumb.
- **Expected:** User is navigated to the TransactionsPage (`/transactions`).

#### Test: Transaction ID is displayed prominently in the header
- **Components:** TransactionHeader
- **Initial state:** User navigates to `/transactions/TXN-123456`.
- **Action:** Page loads.
- **Expected:** The header section displays "Transaction ID: TXN-123456" in large, bold text as the primary heading of the page.

#### Test: Completed status badge is displayed next to Transaction ID
- **Components:** TransactionHeader
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction has a "Completed" status.
- **Action:** Page loads.
- **Expected:** A green badge with the text "Completed" is displayed inline immediately to the right of the Transaction ID heading. The badge has a distinct green background color to indicate the completed state.

#### Test: Date/Time field is displayed in the header
- **Components:** TransactionHeader
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction was created on Oct 26, 2023 at 10:30 AM PST.
- **Action:** Page loads.
- **Expected:** The header displays a "Date/Time:" label followed by the formatted date and time (e.g., "Oct 26, 2023, 10:30 AM PST"). This field is read-only and displayed as text below the Transaction ID line.

#### Test: Creator field is displayed in the header
- **Components:** TransactionHeader
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction was created by "Jane Doe".
- **Action:** Page loads.
- **Expected:** The header displays a "Creator:" label followed by the creator's name (e.g., "Jane Doe"). This field is read-only and displayed as text below the Date/Time line.

#### Test: Description field is displayed in the header
- **Components:** TransactionHeader
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction has a description "Q4 Inventory Adjustment for Raw Materials".
- **Action:** Page loads.
- **Expected:** The header displays a "Description:" label followed by the description text (e.g., "Q4 Inventory Adjustment for Raw Materials"). This field is read-only and displayed as text below the Creator line.

### BasicInfoSection

#### Test: Basic Info section displays section heading
- **Components:** BasicInfoSection
- **Initial state:** User navigates to `/transactions/TXN-123456`.
- **Action:** Page loads.
- **Expected:** A section titled "Basic Info" is displayed below the TransactionHeader, inside a card or bordered container.

#### Test: Date field displays the transaction date in read-only format
- **Components:** BasicInfoSection
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction date is 10/26/2023.
- **Action:** Page loads.
- **Expected:** A "Date" label is displayed with the value "10/26/2023" below it in a read-only input field. The field is not editable by the user.

#### Test: Reference ID field displays the reference identifier in read-only format
- **Components:** BasicInfoSection
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction reference ID is "REF-Q4-ADJ-001".
- **Action:** Page loads.
- **Expected:** A "Reference Id" label is displayed with the value "REF-Q4-ADJ-001" below it in a read-only input field. The field is not editable by the user.

#### Test: Description field displays the transaction description in read-only format
- **Components:** BasicInfoSection
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction description is "Adjustment for end-of-quarter physical count discrepancy in Warehouse A."
- **Action:** Page loads.
- **Expected:** A "Description" label is displayed with the full description text below it in a read-only textarea or text block. The text may wrap across multiple lines. The field is not editable by the user.

#### Test: Transaction Type field displays the type in read-only format
- **Components:** BasicInfoSection
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction type is "Inventory Adjustment".
- **Action:** Page loads.
- **Expected:** A "Transaction Type" label is displayed with the value "Inventory Adjustment" below it in a read-only input field. The field is not editable by the user.

#### Test: Basic Info fields are arranged in a horizontal row layout
- **Components:** BasicInfoSection
- **Initial state:** User navigates to `/transactions/TXN-123456`.
- **Action:** Page loads.
- **Expected:** The four fields (Date, Reference Id, Description, Transaction Type) are laid out horizontally in a single row within the Basic Info card. Each field has its label above the value. The Description field is wider than the others to accommodate longer text.

### QuantityTransfersTable

#### Test: Quantity Transfers section displays heading
- **Components:** QuantityTransfersTable
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction has quantity transfers.
- **Action:** Page loads.
- **Expected:** A section titled "Quantity Transfers (Double-Entry View)" is displayed below the BasicInfoSection, inside a card or bordered container.

#### Test: Balanced indicator checkmark is shown when debits equal credits
- **Components:** QuantityTransfersTable
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction's total debits equal total credits (e.g., both 515.00).
- **Action:** Page loads.
- **Expected:** A green checkmark icon with the text "Balanced" is displayed in the top-right corner of the Quantity Transfers section header, indicating the double-entry transaction is balanced.

#### Test: Quantity Transfers table displays all column headers
- **Components:** QuantityTransfersTable
- **Initial state:** User navigates to `/transactions/TXN-123456`.
- **Action:** Page loads.
- **Expected:** The table displays column headers: "Source Account", "Source Amount", "Source Batch ID (Optional)", "Destination Account", "Destination Amount", and "Net Transfer".

#### Test: Source Account column shows account name with direction icon
- **Components:** QuantityTransfersTable
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction has a transfer where "Warehouse A - Raw Materials (Asset)" is the source account with a debit.
- **Action:** Page loads.
- **Expected:** The Source Account cell displays a directional arrow icon (down arrow ↓ for debit/outgoing) followed by the account name and type, e.g., "↓ Warehouse A - Raw Materials (Asset)". The icon visually indicates the direction of the flow.

#### Test: Source Amount column shows negative amount with units
- **Components:** QuantityTransfersTable
- **Initial state:** User navigates to `/transactions/TXN-123456`. A transfer debits 500 Units from the source account.
- **Action:** Page loads.
- **Expected:** The Source Amount cell displays "-500.00 Units" — a negative value with the unit of measure, indicating the amount leaving the source account.

#### Test: Source Batch ID column shows batch reference or N/A
- **Components:** QuantityTransfersTable
- **Initial state:** User navigates to `/transactions/TXN-123456`. The first transfer references source batch "BATCH-RM-2023-A". The second transfer has no source batch.
- **Action:** Page loads.
- **Expected:** The first row's Source Batch ID cell displays "BATCH-RM-2023-A". The second row's Source Batch ID cell displays "N/A". Batch IDs that are present are clickable links that navigate to the corresponding BatchDetailPage (`/batches/:batchId`).

#### Test: Destination Account column shows account name with direction icon
- **Components:** QuantityTransfersTable
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction has a transfer where "Production Line B - WIP (Asset)" is the destination account with a credit.
- **Action:** Page loads.
- **Expected:** The Destination Account cell displays a directional arrow icon (up arrow ↑ for credit/incoming) followed by the account name and type, e.g., "↑ Production Line B - WIP (Asset)". The icon visually indicates the direction of the flow.

#### Test: Destination Amount column shows positive amount with units
- **Components:** QuantityTransfersTable
- **Initial state:** User navigates to `/transactions/TXN-123456`. A transfer credits 500 Units to the destination account.
- **Action:** Page loads.
- **Expected:** The Destination Amount cell displays "+500.00 Units" — a positive value with the unit of measure, indicating the amount entering the destination account.

#### Test: Net Transfer column shows absolute transfer amount
- **Components:** QuantityTransfersTable
- **Initial state:** User navigates to `/transactions/TXN-123456`. A transfer moves 500 Units between accounts.
- **Action:** Page loads.
- **Expected:** The Net Transfer cell displays "500.00" — the absolute amount transferred without sign or unit, representing the net quantity moved in that transfer line.

#### Test: Multiple transfer rows are displayed
- **Components:** QuantityTransfersTable
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction has two quantity transfers: (1) 500 Units from Warehouse A to Production Line B, (2) 15 Units from Inventory Shrinkage Expense to Warehouse A.
- **Action:** Page loads.
- **Expected:** Two rows are displayed in the table. Row 1: Source "↓ Warehouse A - Raw Materials (Asset)", Source Amount "-500.00 Units", Source Batch ID "BATCH-RM-2023-A", Destination "↑ Production Line B - WIP (Asset)", Destination Amount "+500.00 Units", Net Transfer "500.00". Row 2: Source "↑ Inventory Shrinkage Expense (Expense)", Source Amount "+15.00 Units", Source Batch ID "N/A", Destination "↓ Warehouse A - Raw Materials (Asset)", Destination Amount "-15.00 Units", Net Transfer "15.00".

#### Test: Total Debits and Total Credits are displayed in footer row
- **Components:** QuantityTransfersTable
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction has total debits of 515.00 and total credits of 515.00.
- **Action:** Page loads.
- **Expected:** A footer row at the bottom of the table displays "Total Debits: 515.00 | Total Credits: 515.00" right-aligned. Both values match, confirming the double-entry balance.

#### Test: Clicking a Source Batch ID link navigates to BatchDetailPage
- **Components:** QuantityTransfersTable
- **Initial state:** User is on `/transactions/TXN-123456`. The first transfer row shows Source Batch ID "BATCH-RM-2023-A" as a clickable link.
- **Action:** User clicks "BATCH-RM-2023-A" in the Source Batch ID column.
- **Expected:** User is navigated to the BatchDetailPage (`/batches/BATCH-RM-2023-A`) for that batch.

### BatchesCreatedTable

#### Test: Batches Created section displays heading
- **Components:** BatchesCreatedTable
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction created batches.
- **Action:** Page loads.
- **Expected:** A section titled "Batches Created" is displayed below the QuantityTransfersTable, inside a card or bordered container.

#### Test: Batches Created table displays all column headers
- **Components:** BatchesCreatedTable
- **Initial state:** User navigates to `/transactions/TXN-123456`.
- **Action:** Page loads.
- **Expected:** The table displays column headers: "Batch ID", "Material", and "Quantity".

#### Test: Batch rows display correct data
- **Components:** BatchesCreatedTable
- **Initial state:** User navigates to `/transactions/TXN-123456`. The transaction created two batches: (1) BATCH-WIP-2023-Q4-001 for "Widget Assembly Component X" with quantity 500.00, (2) BATCH-SCRAP-2023-Q4-005 for "Scrap Material - Metal" with quantity 15.00.
- **Action:** Page loads.
- **Expected:** Two rows are displayed. Row 1: Batch ID "BATCH-WIP-2023-Q4-001", Material "Widget Assembly Component X", Quantity "500.00". Row 2: Batch ID "BATCH-SCRAP-2023-Q4-005", Material "Scrap Material - Metal", Quantity "15.00".

#### Test: Clicking a Batch ID navigates to BatchDetailPage
- **Components:** BatchesCreatedTable
- **Initial state:** User is on `/transactions/TXN-123456`. The Batches Created table shows "BATCH-WIP-2023-Q4-001" as a clickable link.
- **Action:** User clicks "BATCH-WIP-2023-Q4-001" in the Batch ID column.
- **Expected:** User is navigated to the BatchDetailPage (`/batches/BATCH-WIP-2023-Q4-001`) for that batch.

#### Test: Clicking a Material name navigates to MaterialDetailPage
- **Components:** BatchesCreatedTable
- **Initial state:** User is on `/transactions/TXN-123456`. The Batches Created table shows "Widget Assembly Component X" as a clickable link.
- **Action:** User clicks "Widget Assembly Component X" in the Material column.
- **Expected:** User is navigated to the MaterialDetailPage (`/materials/:materialId`) for "Widget Assembly Component X".

#### Test: Empty Batches Created section when no batches were created
- **Components:** BatchesCreatedTable
- **Initial state:** User navigates to a transaction that did not create any new batches (e.g., a pure transfer between existing batches).
- **Action:** Page loads.
- **Expected:** The "Batches Created" section is displayed with the table headers but no data rows. An empty state message such as "No batches were created in this transaction" is shown.

---

## NewTransactionPage (`/transactions/new`)

Components: BasicInfoForm, QuantityTransfersList, BatchAllocationList

### Page Header

#### Test: New Transaction page displays header with title and action buttons
- **Components:** BasicInfoForm
- **Initial state:** User navigates to `/transactions/new`.
- **Action:** Page loads.
- **Expected:** Page displays a "New Transaction" title. A "Cancel" button (outline/secondary style) and a "Post" button (primary/blue style) are visible in the header area to the right of the title.

#### Test: Cancel button navigates back to Transactions list
- **Components:** BasicInfoForm
- **Initial state:** User is on `/transactions/new` with some form fields filled in.
- **Action:** User clicks the "Cancel" button.
- **Expected:** User is navigated back to `/transactions`. No transaction is created. Form data is discarded.

#### Test: Post button submits a valid transaction
- **Components:** BasicInfoForm, QuantityTransfersList, BatchAllocationList
- **Initial state:** User is on `/transactions/new`. Basic Info fields are filled in (Date, Reference ID, Description, Transaction Type). At least one quantity transfer has been added. The total debits equal total credits (double-entry balanced).
- **Action:** User clicks the "Post" button.
- **Expected:** The transaction is persisted to the database. User is navigated to the TransactionDetailPage (`/transactions/:transactionId`) for the newly created transaction. The detail page shows all the data that was entered. The new transaction appears in the TransactionsPage list.

#### Test: Post button is disabled when form is incomplete
- **Components:** BasicInfoForm, QuantityTransfersList
- **Initial state:** User is on `/transactions/new`. No quantity transfers have been added and required Basic Info fields are empty.
- **Action:** User attempts to click the "Post" button.
- **Expected:** The "Post" button is disabled or clicking it shows validation errors. The transaction is not created. Validation messages indicate which required fields are missing.

#### Test: Post button blocked when debits do not equal credits
- **Components:** BasicInfoForm, QuantityTransfersList, BatchAllocationList
- **Initial state:** User is on `/transactions/new`. Basic Info is filled in. One quantity transfer exists transferring 500 kg from one account to another. A batch allocation exists for a different amount (e.g., 300 Units) such that total debits do not equal total credits.
- **Action:** User clicks the "Post" button.
- **Expected:** A validation error is displayed indicating that debits must equal credits before the transaction can be posted. The transaction is not created.

### BasicInfoForm

#### Test: Date picker displays and allows date selection
- **Components:** BasicInfoForm
- **Initial state:** User is on `/transactions/new`. The Date field shows a date picker input with a calendar icon.
- **Action:** User clicks the Date field and selects a date (e.g., 2024-05-23).
- **Expected:** The selected date is displayed in the Date field in a formatted date string (e.g., "2024-05-23"). The calendar picker closes after selection.

#### Test: Reference ID text input accepts free-form text
- **Components:** BasicInfoForm
- **Initial state:** User is on `/transactions/new`. The Reference ID field is an empty text input.
- **Action:** User types "TRX-20240523-001" into the Reference ID field.
- **Expected:** The Reference ID field displays "TRX-20240523-001".

#### Test: Description textarea accepts multi-line text
- **Components:** BasicInfoForm
- **Initial state:** User is on `/transactions/new`. The Description field is a resizable textarea.
- **Action:** User types "Q2 Inventory Adjustment for raw materials and finished goods." into the Description textarea.
- **Expected:** The Description textarea displays the entered multi-line text. The textarea is visually larger than a single-line input (multi-row).

#### Test: Transaction Type dropdown shows available types
- **Components:** BasicInfoForm
- **Initial state:** User is on `/transactions/new`. The Transaction Type field is a dropdown selector.
- **Action:** User clicks the Transaction Type dropdown.
- **Expected:** A dropdown menu opens showing available transaction types (e.g., Transfer, Purchase, Consumption, Inventory Adjustment). The user can select one type.

#### Test: Transaction Type dropdown selection persists
- **Components:** BasicInfoForm
- **Initial state:** User is on `/transactions/new`. The Transaction Type dropdown is open.
- **Action:** User selects "Transfer" from the dropdown.
- **Expected:** The dropdown closes. The Transaction Type field displays "Transfer" as the selected value.

### QuantityTransfersList

#### Test: Quantity Transfers section header is displayed
- **Components:** QuantityTransfersList
- **Initial state:** User is on `/transactions/new`.
- **Action:** Page loads.
- **Expected:** A section titled "2. Quantity Transfers" is visible below the Basic Info section.

#### Test: Empty Quantity Transfers list shows no rows
- **Components:** QuantityTransfersList
- **Initial state:** User is on `/transactions/new`. No quantity transfers have been added yet.
- **Action:** Page loads.
- **Expected:** The Quantity Transfers table shows column headers (Source Account, Destination Account, Amount, Source Batch ID (Optional)) but no data rows. The "+ Add Quantity Transfer" button and the inline form row are visible below the table.

#### Test: Existing quantity transfers display with all columns
- **Components:** QuantityTransfersList
- **Initial state:** User is on `/transactions/new`. Two quantity transfers have been added: (1) Source "Raw Materials - Warehouse A (1010)" to Destination "WIP - Production Line 1 (1020)", Amount "500 kg", Source Batch ID "BATCH-RM-A-001"; (2) Source "Finished Goods - Warehouse B (1030)" to Destination "Cost of Goods Sold (5010)", Amount "200 Units", no Source Batch ID.
- **Action:** User views the Quantity Transfers table.
- **Expected:** Two rows are displayed. Each row shows Source Account, Destination Account, Amount (with unit), and Source Batch ID (or empty if not provided). Each row has a delete (trash icon) button on the right.

#### Test: Delete button removes a quantity transfer row
- **Components:** QuantityTransfersList
- **Initial state:** Two quantity transfers exist in the list.
- **Action:** User clicks the delete (trash icon) button on the first row.
- **Expected:** The first quantity transfer row is removed from the list. Only the second row remains. The amounts/balances update accordingly.

#### Test: Add Quantity Transfer button triggers inline form submission
- **Components:** QuantityTransfersList
- **Initial state:** User is on `/transactions/new`. The inline form row at the bottom of the Quantity Transfers section has Source Account dropdown, Destination Account dropdown, Amount input, unit selector, and Source Batch ID text input.
- **Action:** User selects "Raw Materials - Warehouse A (1010)" from the Source Account dropdown, selects "WIP - Production Line 1 (1020)" from the Destination Account dropdown, enters "500" in the Amount input, selects "kg" from the unit selector, enters "BATCH-RM-A-001" in the Source Batch ID input, then clicks the "+ Add Quantity Transfer" button.
- **Expected:** A new row appears in the Quantity Transfers table with the entered values: Source Account "Raw Materials - Warehouse A (1010)", Destination Account "WIP - Production Line 1 (1020)", Amount "500 kg", Source Batch ID "BATCH-RM-A-001". The inline form fields are cleared and ready for the next entry.

#### Test: Source Account dropdown lists all available accounts
- **Components:** QuantityTransfersList
- **Initial state:** User is on `/transactions/new`. Accounts exist in the system (stock, input, output types).
- **Action:** User clicks the Source Account dropdown in the inline form row.
- **Expected:** A dropdown opens listing all available accounts in the system, showing account name and ID (e.g., "Raw Materials - Warehouse A (1010)").

#### Test: Destination Account dropdown lists all available accounts
- **Components:** QuantityTransfersList
- **Initial state:** User is on `/transactions/new`. Accounts exist in the system.
- **Action:** User clicks the Destination Account dropdown in the inline form row.
- **Expected:** A dropdown opens listing all available accounts, showing account name and ID.

#### Test: Amount input accepts numeric values
- **Components:** QuantityTransfersList
- **Initial state:** User is on `/transactions/new`. The Amount input in the inline form row is empty.
- **Action:** User types "500" into the Amount input.
- **Expected:** The Amount field displays "500". Non-numeric input is prevented or rejected.

#### Test: Unit selector allows choosing a unit of measure
- **Components:** QuantityTransfersList
- **Initial state:** User is on `/transactions/new`. The unit selector in the inline form row shows a default "unit" label.
- **Action:** User clicks the unit selector dropdown.
- **Expected:** A dropdown opens showing available units of measure (e.g., kg, Units, liters, etc.). User can select one.

#### Test: Source Batch ID input is optional
- **Components:** QuantityTransfersList
- **Initial state:** User is on `/transactions/new`. The inline form has Source Account, Destination Account, Amount, and unit filled in. Source Batch ID is left empty.
- **Action:** User clicks "+ Add Quantity Transfer".
- **Expected:** A new row is added to the table without a Source Batch ID. The Source Batch ID column for this row is empty or shows "N/A". The transfer is valid without a batch reference.

#### Test: Add Quantity Transfer with missing required fields shows validation
- **Components:** QuantityTransfersList
- **Initial state:** User is on `/transactions/new`. The inline form has only Source Account selected; Destination Account, Amount, and unit are not filled.
- **Action:** User clicks "+ Add Quantity Transfer".
- **Expected:** Validation errors appear indicating that Destination Account and Amount are required. No row is added to the table.

### BatchAllocationList

#### Test: Batch Allocation section header is displayed
- **Components:** BatchAllocationList
- **Initial state:** User is on `/transactions/new`.
- **Action:** Page loads.
- **Expected:** A section titled "3. Batch Allocation" is visible below the Quantity Transfers section.

#### Test: Empty Batch Allocation list shows no rows
- **Components:** BatchAllocationList
- **Initial state:** User is on `/transactions/new`. No batches have been added yet.
- **Action:** Page loads.
- **Expected:** The Batch Allocation table shows column headers (Material, Amount) but no data rows. The "+ Create New Batch" button and inline form are visible below the table.

#### Test: Existing batch allocations display with all columns
- **Components:** BatchAllocationList
- **Initial state:** User is on `/transactions/new`. Two batch allocations have been added: (1) Material "FG-Product-X", Amount "200 Units"; (2) Material "FG-Product-Y", Amount "150 Units".
- **Action:** User views the Batch Allocation table.
- **Expected:** Two rows are displayed. Each row shows Material name and Amount (with unit). Each row has a delete (trash icon) button on the right.

#### Test: Delete button removes a batch allocation row
- **Components:** BatchAllocationList
- **Initial state:** Two batch allocations exist in the list.
- **Action:** User clicks the delete (trash icon) button on the first row ("FG-Product-X").
- **Expected:** The first batch allocation row is removed. Only the second row ("FG-Product-Y", "150 Units") remains.

#### Test: Create New Batch button adds a batch from inline form
- **Components:** BatchAllocationList
- **Initial state:** User is on `/transactions/new`. The inline form at the bottom of the Batch Allocation section has a Material dropdown and an Amount input.
- **Action:** User selects "FG-Product-X" from the Material dropdown, enters "200" in the Amount input, then clicks the "+ Create New Batch" button.
- **Expected:** A new row appears in the Batch Allocation table with Material "FG-Product-X" and Amount "200 Units" (unit inferred from the selected material's unit of measure). The inline form fields are cleared for the next entry.

#### Test: Material dropdown lists available materials
- **Components:** BatchAllocationList
- **Initial state:** User is on `/transactions/new`. Materials exist in the system.
- **Action:** User clicks the Material dropdown in the inline form.
- **Expected:** A dropdown opens listing all available materials in the system by name.

#### Test: Amount input for batch accepts numeric values
- **Components:** BatchAllocationList
- **Initial state:** User is on `/transactions/new`. The Amount input in the batch inline form is empty.
- **Action:** User types "200" into the Amount input.
- **Expected:** The Amount field displays "200". The input has a numeric spinner control. Non-numeric input is prevented or rejected.

#### Test: Create New Batch with missing required fields shows validation
- **Components:** BatchAllocationList
- **Initial state:** User is on `/transactions/new`. The inline form has Material selected but Amount is empty.
- **Action:** User clicks "+ Create New Batch".
- **Expected:** Validation error appears indicating that Amount is required. No row is added to the table.

#### Test: Double-entry validation ensures debits equal credits before Post
- **Components:** BatchAllocationList, QuantityTransfersList, BasicInfoForm
- **Initial state:** User is on `/transactions/new`. Basic Info is filled. Quantity transfers total 500 kg debit and 500 kg credit (balanced transfers). Batch allocations total 200 Units for one material — but these batch amounts are not balanced against any corresponding transfer.
- **Action:** User clicks the "Post" button.
- **Expected:** A validation error is displayed indicating that the total debits must equal total credits across all quantity transfers and batch allocations. The transaction is not saved until the double-entry equation balances.

#### Test: Successful Post with balanced debits and credits
- **Components:** BatchAllocationList, QuantityTransfersList, BasicInfoForm
- **Initial state:** User is on `/transactions/new`. Basic Info is filled (Date: 2024-05-23, Reference ID: TRX-20240523-001, Description: "Q2 Inventory Adjustment", Type: Transfer). Quantity transfers are added that balance correctly. Batch allocations are added with matching amounts. Total debits equal total credits.
- **Action:** User clicks the "Post" button.
- **Expected:** The transaction is created and persisted. User is redirected to the TransactionDetailPage for the new transaction. The detail page shows all entered data: Basic Info fields, Quantity Transfers with source/destination accounts and amounts, and Batches Created with material and quantity. The new batches are created in the system and appear on their respective material detail pages. The new transaction appears in the TransactionsPage list and in the Recent Transactions on the Dashboard.

#### Test: Newly created batches record lineage from source batches
- **Components:** BatchAllocationList, QuantityTransfersList
- **Initial state:** User is on `/transactions/new`. A quantity transfer references Source Batch ID "BATCH-RM-A-001". A new batch is created in the Batch Allocation section.
- **Action:** User posts the transaction successfully.
- **Expected:** The newly created batch's BatchDetailPage shows lineage information linking back to the source batch "BATCH-RM-A-001" and the originating transaction. The source batch's usage history is updated to include this transaction.
