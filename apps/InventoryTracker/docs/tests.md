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

<!-- Tests will be added by PlanPageBatchDetail -->

---

## TransactionsPage (`/transactions`)

Components: TransactionsFilterBar, TransactionsTable, Pagination

<!-- Tests will be added by PlanPageTransactions -->

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
