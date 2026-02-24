# InventoryTracker Test Specification

## Navigation & Layout

_Consistent sidebar navigation across all pages: Dashboard, Accounts, Materials, Batches, Transactions, Settings. Clicking each nav item navigates to the corresponding page. Active page is highlighted in the sidebar._

---

## DashboardPage (`/`)

Components: LowInventoryAlerts, MaterialsCategoriesOverview, RecentTransactionsTable, DateRangeFilter, CategoryFilter, NewTransactionButton

<!-- Tests will be added by PlanPageDashboard -->

---

## AccountsPage (`/accounts`)

Components: AccountsPageHeader, StockAccountsList, InputAccountsList, OutputAccountsList, CreateAccountButton, AccountRowActions

### AccountsPageHeader

#### Test: Breadcrumb navigation displays Home > Accounts
- **Components:** AccountsPageHeader
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** A breadcrumb trail is displayed showing "Home > Accounts". "Home" is a clickable link that navigates to the DashboardPage (`/`). "Accounts" is the current page label and is not clickable.

#### Test: Breadcrumb Home link navigates to Dashboard
- **Components:** AccountsPageHeader
- **Initial state:** User is on `/accounts`. Breadcrumb shows "Home > Accounts".
- **Action:** User clicks "Home" in the breadcrumb.
- **Expected:** User is navigated to the DashboardPage (`/`).

#### Test: Page heading displays "Accounts"
- **Components:** AccountsPageHeader
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** The page heading "Accounts" is displayed in large, bold text as the primary heading of the page, above the breadcrumb.

### StockAccountsList

#### Test: Stock Accounts section heading is displayed
- **Components:** StockAccountsList
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** A "Stock Accounts" heading is displayed as the first section on the page, in large bold text.

#### Test: Stock Accounts table displays all column headers
- **Components:** StockAccountsList
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** The Stock Accounts table displays column headers in order: "Account Name", "Account Type", "Description", "Actions".

#### Test: Stock Accounts table shows correct account data
- **Components:** StockAccountsList
- **Initial state:** User navigates to `/accounts`. The system has four stock accounts: "Main Inventory" (default, "Primary storage for all physical goods."), "Raw Materials" ("Components for manufacturing."), "Finished Goods" ("Completed products ready for sale."), "Safety Stock" ("Buffer inventory for emergencies.").
- **Action:** Page loads.
- **Expected:** Four rows are displayed in the Stock Accounts table. Row 1: Account Name "Main Inventory", Account Type "Stock (Default)", Description "Primary storage for all physical goods.". Row 2: Account Name "Raw Materials", Account Type "Stock", Description "Components for manufacturing.". Row 3: Account Name "Finished Goods", Account Type "Stock", Description "Completed products ready for sale.". Row 4: Account Name "Safety Stock", Account Type "Stock", Description "Buffer inventory for emergencies.". Each row has three action icons in the Actions column.

#### Test: Default stock account shows "(Default)" indicator in Account Type
- **Components:** StockAccountsList
- **Initial state:** User navigates to `/accounts`. "Main Inventory" is the default stock account.
- **Action:** Page loads.
- **Expected:** The Account Type column for "Main Inventory" displays "Stock (Default)". Non-default stock accounts display just "Stock" without the "(Default)" suffix.

#### Test: Stock Accounts empty state when no stock accounts exist
- **Components:** StockAccountsList
- **Initial state:** User navigates to `/accounts`. No stock accounts exist in the system.
- **Action:** Page loads.
- **Expected:** The "Stock Accounts" heading is displayed. The table shows column headers but no data rows. An empty state message such as "No stock accounts found" is displayed.

### InputAccountsList

#### Test: Input Accounts section heading is displayed
- **Components:** InputAccountsList
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** An "Input Accounts" heading is displayed as the second section on the page, below the Stock Accounts section, in large bold text.

#### Test: Input Accounts table displays all column headers
- **Components:** InputAccountsList
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** The Input Accounts table displays column headers in order: "Account Name", "Account Type", "Description", "Actions".

#### Test: Input Accounts table shows correct account data
- **Components:** InputAccountsList
- **Initial state:** User navigates to `/accounts`. The system has three input accounts: "Purchases" (default, "General account for acquiring stock."), "Vendor Credits" ("Credits received from suppliers."), "Shipping Costs (Inbound)" ("Freight and delivery fees for purchases.").
- **Action:** Page loads.
- **Expected:** Three rows are displayed in the Input Accounts table. Row 1: Account Name "Purchases", Account Type "Input (Default)", Description "General account for acquiring stock.". Row 2: Account Name "Vendor Credits", Account Type "Input", Description "Credits received from suppliers.". Row 3: Account Name "Shipping Costs (Inbound)", Account Type "Input", Description "Freight and delivery fees for purchases.". Each row has three action icons in the Actions column.

#### Test: Default input account shows "(Default)" indicator in Account Type
- **Components:** InputAccountsList
- **Initial state:** User navigates to `/accounts`. "Purchases" is the default input account.
- **Action:** Page loads.
- **Expected:** The Account Type column for "Purchases" displays "Input (Default)". Non-default input accounts display just "Input" without the "(Default)" suffix.

#### Test: Input Accounts empty state when no input accounts exist
- **Components:** InputAccountsList
- **Initial state:** User navigates to `/accounts`. No input accounts exist in the system.
- **Action:** Page loads.
- **Expected:** The "Input Accounts" heading is displayed. The table shows column headers but no data rows. An empty state message such as "No input accounts found" is displayed.

### OutputAccountsList

#### Test: Output Accounts section heading is displayed
- **Components:** OutputAccountsList
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** An "Output Accounts" heading is displayed as the third section on the page, below the Input Accounts section, in large bold text.

#### Test: Output Accounts table displays all column headers
- **Components:** OutputAccountsList
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** The Output Accounts table displays column headers in order: "Account Name", "Account Type", "Description", "Actions".

#### Test: Output Accounts table shows correct account data
- **Components:** OutputAccountsList
- **Initial state:** User navigates to `/accounts`. The system has four output accounts: "Sales Revenue" (default, "Income from product sales."), "Service Income" ("Revenue from non-product services."), "Customer Discounts" ("Reductions given to customers."), "Returns & Damages" ("Buffer for returned or damaged goods.").
- **Action:** Page loads.
- **Expected:** Four rows are displayed in the Output Accounts table. Row 1: Account Name "Sales Revenue", Account Type "Output (Default)", Description "Income from product sales.". Row 2: Account Name "Service Income", Account Type "Output", Description "Revenue from non-product services.". Row 3: Account Name "Customer Discounts", Account Type "Output", Description "Reductions given to customers.". Row 4: Account Name "Returns & Damages", Account Type "Output", Description "Buffer for returned or damaged goods.". Each row has three action icons in the Actions column.

#### Test: Default output account shows "(Default)" indicator in Account Type
- **Components:** OutputAccountsList
- **Initial state:** User navigates to `/accounts`. "Sales Revenue" is the default output account.
- **Action:** Page loads.
- **Expected:** The Account Type column for "Sales Revenue" displays "Output (Default)". Non-default output accounts display just "Output" without the "(Default)" suffix.

#### Test: Output Accounts empty state when no output accounts exist
- **Components:** OutputAccountsList
- **Initial state:** User navigates to `/accounts`. No output accounts exist in the system.
- **Action:** Page loads.
- **Expected:** The "Output Accounts" heading is displayed. The table shows column headers but no data rows. An empty state message such as "No output accounts found" is displayed.

### CreateAccountButton

#### Test: Create Stock Account button is displayed with plus icon
- **Components:** CreateAccountButton, StockAccountsList
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** A "+ Create Stock Account" button is displayed in the top-right area of the Stock Accounts section header, styled as a primary/filled blue button with a "+" icon preceding the text "Create Stock Account".

#### Test: Create Stock Account button opens create account form
- **Components:** CreateAccountButton
- **Initial state:** User is on `/accounts`.
- **Action:** User clicks the "+ Create Stock Account" button.
- **Expected:** A create account form or modal opens. The form contains fields for Account Name (text input) and Description (text area). The Account Type is pre-set to "Stock" and is not editable. The form has Save and Cancel buttons. All fields are initially empty.

#### Test: Saving create stock account form persists new account
- **Components:** CreateAccountButton, StockAccountsList
- **Initial state:** User clicked "+ Create Stock Account" on `/accounts`. The form is open. User fills in: Account Name "Overflow Storage", Description "Secondary storage for excess inventory.".
- **Action:** User saves the form.
- **Expected:** The form closes. The new account "Overflow Storage" is persisted to the database. The StockAccountsList updates to include a new row with Account Name "Overflow Storage", Account Type "Stock", Description "Secondary storage for excess inventory.". The new account is not marked as "(Default)".

#### Test: Cancelling create stock account form does not persist changes
- **Components:** CreateAccountButton, StockAccountsList
- **Initial state:** User clicked "+ Create Stock Account" on `/accounts`. The form is open. User has entered Account Name "Overflow Storage".
- **Action:** User cancels the form.
- **Expected:** The form closes. No new account is created. The StockAccountsList is unchanged.

#### Test: Create Input Account button is displayed with plus icon
- **Components:** CreateAccountButton, InputAccountsList
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** A "+ Create Input Account" button is displayed in the top-right area of the Input Accounts section header, styled as a primary/filled blue button with a "+" icon preceding the text "Create Input Account".

#### Test: Create Input Account button opens create account form
- **Components:** CreateAccountButton
- **Initial state:** User is on `/accounts`.
- **Action:** User clicks the "+ Create Input Account" button.
- **Expected:** A create account form or modal opens. The form contains fields for Account Name (text input) and Description (text area). The Account Type is pre-set to "Input" and is not editable. The form has Save and Cancel buttons. All fields are initially empty.

#### Test: Saving create input account form persists new account
- **Components:** CreateAccountButton, InputAccountsList
- **Initial state:** User clicked "+ Create Input Account" on `/accounts`. The form is open. User fills in: Account Name "Supplier Returns", Description "Goods returned to suppliers for credit.".
- **Action:** User saves the form.
- **Expected:** The form closes. The new account "Supplier Returns" is persisted to the database. The InputAccountsList updates to include a new row with Account Name "Supplier Returns", Account Type "Input", Description "Goods returned to suppliers for credit.". The new account is not marked as "(Default)".

#### Test: Cancelling create input account form does not persist changes
- **Components:** CreateAccountButton, InputAccountsList
- **Initial state:** User clicked "+ Create Input Account" on `/accounts`. The form is open. User has entered Account Name "Supplier Returns".
- **Action:** User cancels the form.
- **Expected:** The form closes. No new account is created. The InputAccountsList is unchanged.

#### Test: Create Output Account button is displayed with plus icon
- **Components:** CreateAccountButton, OutputAccountsList
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** A "+ Create Output Account" button is displayed in the top-right area of the Output Accounts section header, styled as a primary/filled blue button with a "+" icon preceding the text "Create Output Account".

#### Test: Create Output Account button opens create account form
- **Components:** CreateAccountButton
- **Initial state:** User is on `/accounts`.
- **Action:** User clicks the "+ Create Output Account" button.
- **Expected:** A create account form or modal opens. The form contains fields for Account Name (text input) and Description (text area). The Account Type is pre-set to "Output" and is not editable. The form has Save and Cancel buttons. All fields are initially empty.

#### Test: Saving create output account form persists new account
- **Components:** CreateAccountButton, OutputAccountsList
- **Initial state:** User clicked "+ Create Output Account" on `/accounts`. The form is open. User fills in: Account Name "Waste Disposal", Description "Materials disposed of or written off.".
- **Action:** User saves the form.
- **Expected:** The form closes. The new account "Waste Disposal" is persisted to the database. The OutputAccountsList updates to include a new row with Account Name "Waste Disposal", Account Type "Output", Description "Materials disposed of or written off.". The new account is not marked as "(Default)".

#### Test: Cancelling create output account form does not persist changes
- **Components:** CreateAccountButton, OutputAccountsList
- **Initial state:** User clicked "+ Create Output Account" on `/accounts`. The form is open. User has entered Account Name "Waste Disposal".
- **Action:** User cancels the form.
- **Expected:** The form closes. No new account is created. The OutputAccountsList is unchanged.

#### Test: Create account form validates required Account Name field
- **Components:** CreateAccountButton
- **Initial state:** User clicked "+ Create Stock Account" on `/accounts`. The form is open. The Account Name field is left empty. Description is "Some description.".
- **Action:** User attempts to save the form.
- **Expected:** The form does not submit. A validation error message is displayed on the Account Name field indicating it is required (e.g., "Account Name is required"). The form remains open.

### AccountRowActions

#### Test: Clicking an account row navigates to AccountDetailPage
- **Components:** AccountRowActions, StockAccountsList
- **Initial state:** User is on `/accounts`. The Stock Accounts table shows "Main Inventory" in the first row.
- **Action:** User clicks on the "Main Inventory" row (on the account name, type, or description area — not on an action icon).
- **Expected:** User is navigated to the AccountDetailPage (`/accounts/:accountId`) for "Main Inventory".

#### Test: View action icon is displayed as eye icon on each row
- **Components:** AccountRowActions
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** Each account row in all three category tables (Stock, Input, Output) displays a View action icon in the Actions column, rendered as an eye icon. The icon is the first of the three action icons.

#### Test: Clicking View icon navigates to AccountDetailPage
- **Components:** AccountRowActions, InputAccountsList
- **Initial state:** User is on `/accounts`. The Input Accounts table shows "Purchases" with a View (eye) icon in the Actions column.
- **Action:** User clicks the View (eye) icon on the "Purchases" row.
- **Expected:** User is navigated to the AccountDetailPage (`/accounts/:accountId`) for "Purchases".

#### Test: Edit action icon is displayed as pencil icon on each row
- **Components:** AccountRowActions
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** Each account row in all three category tables (Stock, Input, Output) displays an Edit action icon in the Actions column, rendered as a pencil icon. The icon is the second of the three action icons.

#### Test: Clicking Edit icon opens edit form pre-filled with account data
- **Components:** AccountRowActions, StockAccountsList
- **Initial state:** User is on `/accounts`. The Stock Accounts table shows "Raw Materials" with Account Type "Stock" and Description "Components for manufacturing.".
- **Action:** User clicks the Edit (pencil) icon on the "Raw Materials" row.
- **Expected:** An edit form or modal opens. The form contains fields for Account Name (pre-filled with "Raw Materials"), Description (pre-filled with "Components for manufacturing."). The Account Type "Stock" is displayed but not editable. The form has Save and Cancel buttons.

#### Test: Saving edit account form persists changes
- **Components:** AccountRowActions, StockAccountsList
- **Initial state:** User clicked the Edit icon on "Raw Materials" in the Stock Accounts table. The edit form is open with Account Name "Raw Materials" and Description "Components for manufacturing.".
- **Action:** User changes the Account Name to "Raw Materials & Supplies" and the Description to "Components and supplies for manufacturing." and saves the form.
- **Expected:** The form closes. The StockAccountsList updates the row to show Account Name "Raw Materials & Supplies" and Description "Components and supplies for manufacturing.". The changes are persisted to the database. The Account Type remains "Stock".

#### Test: Cancelling edit account form does not persist changes
- **Components:** AccountRowActions, StockAccountsList
- **Initial state:** User clicked the Edit icon on "Raw Materials" in the Stock Accounts table. The edit form is open. User has changed the Account Name to "Raw Materials & Supplies".
- **Action:** User cancels the form.
- **Expected:** The form closes. The StockAccountsList still shows Account Name "Raw Materials" and the original Description. No changes are persisted to the database.

#### Test: Archive action icon is displayed as archive icon on each row
- **Components:** AccountRowActions
- **Initial state:** User navigates to `/accounts`.
- **Action:** Page loads.
- **Expected:** Each account row in all three category tables (Stock, Input, Output) displays an Archive action icon in the Actions column, rendered as an archive/box icon. The icon is the third of the three action icons.

#### Test: Clicking Archive icon shows confirmation dialog
- **Components:** AccountRowActions, StockAccountsList
- **Initial state:** User is on `/accounts`. The Stock Accounts table shows "Safety Stock" (a non-default account).
- **Action:** User clicks the Archive (archive/box) icon on the "Safety Stock" row.
- **Expected:** A confirmation dialog appears asking the user to confirm archiving the account, e.g., "Are you sure you want to archive 'Safety Stock'? This account will no longer appear in active lists." The dialog has Confirm and Cancel buttons.

#### Test: Confirming archive removes account from active list
- **Components:** AccountRowActions, StockAccountsList
- **Initial state:** User clicked the Archive icon on "Safety Stock". The confirmation dialog is displayed.
- **Action:** User clicks the Confirm button.
- **Expected:** The confirmation dialog closes. "Safety Stock" is removed from the StockAccountsList. The account is marked as archived in the database. The archived account no longer appears in the active accounts list.

#### Test: Cancelling archive does not change account
- **Components:** AccountRowActions, StockAccountsList
- **Initial state:** User clicked the Archive icon on "Safety Stock". The confirmation dialog is displayed.
- **Action:** User clicks the Cancel button.
- **Expected:** The confirmation dialog closes. "Safety Stock" remains in the StockAccountsList with unchanged data. No changes are persisted to the database.

#### Test: Clicking row in Input Accounts navigates to correct AccountDetailPage
- **Components:** AccountRowActions, InputAccountsList
- **Initial state:** User is on `/accounts`. The Input Accounts table shows "Vendor Credits".
- **Action:** User clicks on the "Vendor Credits" row.
- **Expected:** User is navigated to the AccountDetailPage (`/accounts/:accountId`) for "Vendor Credits".

#### Test: Clicking row in Output Accounts navigates to correct AccountDetailPage
- **Components:** AccountRowActions, OutputAccountsList
- **Initial state:** User is on `/accounts`. The Output Accounts table shows "Service Income".
- **Action:** User clicks on the "Service Income" row.
- **Expected:** User is navigated to the AccountDetailPage (`/accounts/:accountId`) for "Service Income".

#### Test: Edit action works on Input Accounts
- **Components:** AccountRowActions, InputAccountsList
- **Initial state:** User is on `/accounts`. The Input Accounts table shows "Shipping Costs (Inbound)" with Description "Freight and delivery fees for purchases.".
- **Action:** User clicks the Edit (pencil) icon on the "Shipping Costs (Inbound)" row.
- **Expected:** An edit form or modal opens with Account Name pre-filled as "Shipping Costs (Inbound)" and Description pre-filled as "Freight and delivery fees for purchases.". The Account Type "Input" is displayed but not editable.

#### Test: Edit action works on Output Accounts
- **Components:** AccountRowActions, OutputAccountsList
- **Initial state:** User is on `/accounts`. The Output Accounts table shows "Customer Discounts" with Description "Reductions given to customers.".
- **Action:** User clicks the Edit (pencil) icon on the "Customer Discounts" row.
- **Expected:** An edit form or modal opens with Account Name pre-filled as "Customer Discounts" and Description pre-filled as "Reductions given to customers.". The Account Type "Output" is displayed but not editable.

#### Test: Archive action works on Input Accounts
- **Components:** AccountRowActions, InputAccountsList
- **Initial state:** User is on `/accounts`. The Input Accounts table shows "Shipping Costs (Inbound)" (a non-default account).
- **Action:** User clicks the Archive icon on the "Shipping Costs (Inbound)" row, then confirms in the dialog.
- **Expected:** "Shipping Costs (Inbound)" is removed from the InputAccountsList. The account is marked as archived in the database.

#### Test: Archive action works on Output Accounts
- **Components:** AccountRowActions, OutputAccountsList
- **Initial state:** User is on `/accounts`. The Output Accounts table shows "Customer Discounts" (a non-default account).
- **Action:** User clicks the Archive icon on the "Customer Discounts" row, then confirms in the dialog.
- **Expected:** "Customer Discounts" is removed from the OutputAccountsList. The account is marked as archived in the database.

---

## AccountDetailPage (`/accounts/:accountId`)

Components: AccountHeader, TrackedMaterialsTable

### AccountHeader

#### Test: Breadcrumb navigation displays Home > Accounts > Account Name
- **Components:** AccountHeader
- **Initial state:** User navigates to `/accounts/A-1024-INV`. The account name is "Finished Goods Warehouse 2".
- **Action:** Page loads.
- **Expected:** A breadcrumb trail is displayed showing "Home > Accounts > Finished Goods Warehouse 2". "Home" is a clickable link that navigates to the DashboardPage (`/`). "Accounts" is a clickable link that navigates to the AccountsPage (`/accounts`). "Finished Goods Warehouse 2" is the current page label and is not clickable.

#### Test: Breadcrumb Home link navigates to Dashboard
- **Components:** AccountHeader
- **Initial state:** User is on `/accounts/A-1024-INV`. Breadcrumb shows "Home > Accounts > Finished Goods Warehouse 2".
- **Action:** User clicks "Home" in the breadcrumb.
- **Expected:** User is navigated to the DashboardPage (`/`).

#### Test: Breadcrumb Accounts link navigates to Accounts list
- **Components:** AccountHeader
- **Initial state:** User is on `/accounts/A-1024-INV`. Breadcrumb shows "Home > Accounts > Finished Goods Warehouse 2".
- **Action:** User clicks "Accounts" in the breadcrumb.
- **Expected:** User is navigated to the AccountsPage (`/accounts`).

#### Test: Account name is displayed as the primary page heading
- **Components:** AccountHeader
- **Initial state:** User navigates to `/accounts/A-1024-INV`. The account name is "Finished Goods Warehouse 2".
- **Action:** Page loads.
- **Expected:** The header displays "Account: Finished Goods Warehouse 2" in large, bold text as the primary heading of the page. The "Account:" prefix label precedes the account name.

#### Test: Account type is displayed below the account name
- **Components:** AccountHeader
- **Initial state:** User navigates to `/accounts/A-1024-INV`. The account type is "Inventory Account".
- **Action:** Page loads.
- **Expected:** A "Type:" label is displayed below the account name heading with the value "Inventory Account" inline.

#### Test: Status badge is displayed next to the account type
- **Components:** AccountHeader
- **Initial state:** User navigates to `/accounts/A-1024-INV`. The account status is "Active".
- **Action:** Page loads.
- **Expected:** A "Status:" label is displayed inline after the account type, separated by a pipe character "|", with the value "Active" shown as a green-colored badge or text indicating the active status.

#### Test: Edit Account button is displayed with pencil icon
- **Components:** AccountHeader
- **Initial state:** User navigates to `/accounts/A-1024-INV`.
- **Action:** Page loads.
- **Expected:** An "Edit Account" button is displayed in the top-right area of the header, styled as an outline/secondary button with a pencil icon preceding the text.

#### Test: Edit Account button opens edit form
- **Components:** AccountHeader
- **Initial state:** User is on `/accounts/A-1024-INV`.
- **Action:** User clicks the "Edit Account" button.
- **Expected:** An edit form or modal opens allowing the user to modify the account's name, type, description, and status. The form is pre-filled with the current values (Name: "Finished Goods Warehouse 2", Type: "Inventory Account", Status: "Active"). The user can save changes or cancel.

#### Test: Saving Edit Account form persists changes
- **Components:** AccountHeader
- **Initial state:** User has clicked "Edit Account" on `/accounts/A-1024-INV`. The edit form is open with the current account name "Finished Goods Warehouse 2".
- **Action:** User changes the name to "Finished Goods Warehouse 3" and saves the form.
- **Expected:** The edit form closes. The AccountHeader updates to show "Account: Finished Goods Warehouse 3" as the heading. The change is persisted to the database. The breadcrumb also updates to show the new name "Finished Goods Warehouse 3".

#### Test: Cancelling Edit Account form does not persist changes
- **Components:** AccountHeader
- **Initial state:** User has clicked "Edit Account" on `/accounts/A-1024-INV`. The edit form is open. User has changed the name to "Finished Goods Warehouse 3".
- **Action:** User cancels the form.
- **Expected:** The edit form closes. The AccountHeader continues to show "Account: Finished Goods Warehouse 2" as the heading. No changes are persisted to the database.

#### Test: New Transaction button is displayed with plus icon
- **Components:** AccountHeader
- **Initial state:** User navigates to `/accounts/A-1024-INV`.
- **Action:** Page loads.
- **Expected:** A "+ New Transaction" button is displayed in the top-right area of the header next to the Edit Account button, styled as a primary/filled button with a "+" icon preceding the text.

#### Test: New Transaction button navigates to NewTransactionPage pre-filled with account
- **Components:** AccountHeader
- **Initial state:** User is on `/accounts/A-1024-INV` for "Finished Goods Warehouse 2".
- **Action:** User clicks the "+ New Transaction" button.
- **Expected:** User is navigated to the NewTransactionPage (`/transactions/new`). The new transaction form is pre-filled or pre-configured to reference the current account "Finished Goods Warehouse 2" as the source or destination account.

### TrackedMaterialsTable

#### Test: Tracked Materials section heading is displayed
- **Components:** TrackedMaterialsTable
- **Initial state:** User navigates to `/accounts/A-1024-INV`.
- **Action:** Page loads.
- **Expected:** A "Tracked Materials" heading is displayed below the AccountHeader, above the tracked materials table.

#### Test: Table displays all column headers
- **Components:** TrackedMaterialsTable
- **Initial state:** User navigates to `/accounts/A-1024-INV`.
- **Action:** Page loads.
- **Expected:** The table displays column headers in order: "Material Name", "Category", "Unit of Measure", "Total Quantity", "Number of Batches", "Actions".

#### Test: Table rows display correct material data
- **Components:** TrackedMaterialsTable
- **Initial state:** User navigates to `/accounts/A-1024-INV`. The account "Finished Goods Warehouse 2" tracks five materials: "Steel Sheets (3mm)" (Raw Materials, Sheets, 1250.0, 12 batches), "Aluminum Extrusion A" (Components, Meters, 4500.0, 8 batches), "Polymer Granules (Blue)" (Raw Materials, Kilograms, 750.5, 15 batches), "Copper Wiring (Rolls)" (Components, Meters, 2100.0, 5 batches), "Circuit Boards (Model X)" (Sub-Assemblies, Units, 350, 20 batches).
- **Action:** Page loads.
- **Expected:** Five rows are displayed. Each row shows the material's name, category, unit of measure, total quantity with unit, number of batches, and an action link. For example, Row 1: Material Name "Steel Sheets (3mm)", Category "Raw Materials", Unit of Measure "Sheets", Total Quantity "1,250.0 Sheets", Number of Batches "12 Batches", Actions "View Material in this Account".

#### Test: Total Quantity column displays sum across batches with sigma icon
- **Components:** TrackedMaterialsTable
- **Initial state:** User navigates to `/accounts/A-1024-INV`. The material "Steel Sheets (3mm)" has 12 batches in this account totaling 1,250.0 sheets.
- **Action:** Page loads.
- **Expected:** The Total Quantity cell for "Steel Sheets (3mm)" displays "1,250.0 Sheets" with a sigma (Σ) icon and "Batches" label below (displayed as "Σ Batches"), indicating the value is the sum across all batches in this account for that material. The unit of measure is appended to the numeric value.

#### Test: Number of Batches column displays batch count
- **Components:** TrackedMaterialsTable
- **Initial state:** User navigates to `/accounts/A-1024-INV`. The material "Steel Sheets (3mm)" has 12 batches in this account.
- **Action:** Page loads.
- **Expected:** The Number of Batches cell for "Steel Sheets (3mm)" displays "12 Batches". The word "Batches" is appended to the count.

#### Test: View Material in this Account link navigates to MaterialDetailPage
- **Components:** TrackedMaterialsTable
- **Initial state:** User is on `/accounts/A-1024-INV`. The table shows "Steel Sheets (3mm)" with a "View Material in this Account" link and an external link icon (↗) in the Actions column.
- **Action:** User clicks the "View Material in this Account" link on the "Steel Sheets (3mm)" row.
- **Expected:** User is navigated to the MaterialDetailPage (`/materials/:materialId`) for "Steel Sheets (3mm)", filtered or scrolled to show the material's details within the context of account "Finished Goods Warehouse 2".

#### Test: Empty state when no materials are tracked in the account
- **Components:** TrackedMaterialsTable
- **Initial state:** User navigates to an account that has no materials tracked in it.
- **Action:** Page loads.
- **Expected:** The "Tracked Materials" heading is displayed. The table shows column headers but no data rows. An empty state message such as "No materials are currently tracked in this account" is displayed.

---

## MaterialsPage (`/materials`)

Components: MaterialsToolbar, MaterialsFilterBar, MaterialsTable, Pagination

### MaterialsToolbar

#### Test: Breadcrumb navigation displays Home > Materials
- **Components:** MaterialsToolbar
- **Initial state:** User navigates to `/materials`.
- **Action:** Page loads.
- **Expected:** A breadcrumb trail is displayed showing "Home > Materials". "Home" is a clickable link that navigates to the DashboardPage (`/`). "Materials" is the current page label and is not clickable.

#### Test: Page heading displays "Materials"
- **Components:** MaterialsToolbar
- **Initial state:** User navigates to `/materials`.
- **Action:** Page loads.
- **Expected:** The page heading "Materials" is displayed in large, bold text above the breadcrumb.

#### Test: New Material button is displayed with plus icon
- **Components:** MaterialsToolbar
- **Initial state:** User navigates to `/materials`.
- **Action:** Page loads.
- **Expected:** A "+ New Material" button is displayed below the breadcrumb, styled as a primary/filled blue button with a "+" icon preceding the text.

#### Test: New Material button opens create material form
- **Components:** MaterialsToolbar
- **Initial state:** User is on `/materials`.
- **Action:** User clicks the "+ New Material" button.
- **Expected:** A create material form or modal opens. The form contains fields for Material Name, Category (dropdown of existing categories), Unit of Measure, and Description. All fields are initially empty. The user can fill in the fields and save or cancel.

#### Test: Saving create material form persists new material
- **Components:** MaterialsToolbar, MaterialsTable
- **Initial state:** User clicked "+ New Material" on `/materials`. The form is open. User fills in: Material Name "Titanium Rod", Category "Raw Materials", Unit of Measure "Meter".
- **Action:** User saves the form.
- **Expected:** The form closes. The new material "Titanium Rod" is persisted to the database. The MaterialsTable updates to include the new material row with Material Name "Titanium Rod", Category "Raw Materials", Unit of Measure "Meter", and Stock "0".

#### Test: Cancelling create material form does not persist changes
- **Components:** MaterialsToolbar, MaterialsTable
- **Initial state:** User clicked "+ New Material" on `/materials`. The form is open. User has entered Material Name "Titanium Rod".
- **Action:** User cancels the form.
- **Expected:** The form closes. No new material is created. The MaterialsTable is unchanged.

#### Test: New Category button is displayed with plus icon
- **Components:** MaterialsToolbar
- **Initial state:** User navigates to `/materials`.
- **Action:** Page loads.
- **Expected:** A "+ New Category" button is displayed next to the "+ New Material" button, styled as an outline/secondary button with a "+" icon preceding the text.

#### Test: New Category button opens create category form
- **Components:** MaterialsToolbar
- **Initial state:** User is on `/materials`.
- **Action:** User clicks the "+ New Category" button.
- **Expected:** A create category form or modal opens. The form contains a field for Category Name. The user can fill in the field and save or cancel.

#### Test: Saving create category form persists new category
- **Components:** MaterialsToolbar, MaterialsFilterBar
- **Initial state:** User clicked "+ New Category" on `/materials`. The form is open. User fills in: Category Name "Electronics".
- **Action:** User saves the form.
- **Expected:** The form closes. The new category "Electronics" is persisted to the database. The "Filter by Category" dropdown in MaterialsFilterBar now includes "Electronics" as an option. The new category is available when creating or editing materials.

#### Test: Cancelling create category form does not persist changes
- **Components:** MaterialsToolbar
- **Initial state:** User clicked "+ New Category" on `/materials`. The form is open. User has entered Category Name "Electronics".
- **Action:** User cancels the form.
- **Expected:** The form closes. No new category is created.

### MaterialsFilterBar

#### Test: Search by name input is displayed with placeholder text
- **Components:** MaterialsFilterBar
- **Initial state:** User navigates to `/materials`.
- **Action:** Page loads.
- **Expected:** A search input field is displayed with a search icon and placeholder text "Search materials by name...". The input is initially empty.

#### Test: Typing in search input filters materials table by name
- **Components:** MaterialsFilterBar, MaterialsTable
- **Initial state:** User is on `/materials`. The table displays 8 materials including "Steel Sheet 10Ga" and "Copper Wire 16AWG".
- **Action:** User types "Steel" into the search input.
- **Expected:** The MaterialsTable updates to show only materials whose name contains "Steel". "Steel Sheet 10Ga" is displayed. Other materials that do not contain "Steel" in their name are hidden. The pagination updates to reflect the filtered count.

#### Test: Clearing search input restores full materials list
- **Components:** MaterialsFilterBar, MaterialsTable
- **Initial state:** User is on `/materials` with "Steel" typed in the search input. The table shows filtered results.
- **Action:** User clears the search input (removes all text).
- **Expected:** The MaterialsTable updates to show all materials (unfiltered). The pagination updates to reflect the total count.

#### Test: Filter by Category dropdown is displayed with category options
- **Components:** MaterialsFilterBar
- **Initial state:** User navigates to `/materials`. The system has categories: "Raw Materials", "Components", "Packaging".
- **Action:** User clicks the "Filter by Category" dropdown.
- **Expected:** A dropdown opens showing category options: "Raw Materials", "Components", "Packaging". An "All Categories" or default option is available to show all materials.

#### Test: Selecting a category filters materials table
- **Components:** MaterialsFilterBar, MaterialsTable
- **Initial state:** User is on `/materials`. The table shows all materials. Categories include "Raw Materials", "Components", "Packaging".
- **Action:** User selects "Components" from the "Filter by Category" dropdown.
- **Expected:** The MaterialsTable updates to show only materials with category "Components" (e.g., "Aluminum Extrusion X-Profile", "M6 Bolt & Nut Set", "Circuit Board v2.1"). Materials in other categories are hidden. The pagination updates to reflect the filtered count.

#### Test: Selecting All Categories in the category filter shows all materials
- **Components:** MaterialsFilterBar, MaterialsTable
- **Initial state:** User is on `/materials` with "Components" selected in the category filter. Only component materials are shown.
- **Action:** User selects the "All Categories" (or default) option from the "Filter by Category" dropdown.
- **Expected:** The MaterialsTable updates to show all materials regardless of category. The pagination updates to reflect the total count.

#### Test: Filter by Account dropdown is displayed with account options
- **Components:** MaterialsFilterBar
- **Initial state:** User navigates to `/materials`. The system has accounts including "Account A", "Account B".
- **Action:** User clicks the "Filter by Account" dropdown.
- **Expected:** A dropdown opens showing account options: "All Accounts", "Account A", "Account B", and any other accounts in the system.

#### Test: Selecting an account filters materials table
- **Components:** MaterialsFilterBar, MaterialsTable
- **Initial state:** User is on `/materials`. The table shows all materials.
- **Action:** User selects "Account A" from the "Filter by Account" dropdown.
- **Expected:** The MaterialsTable updates to show only materials that have stock in "Account A". Materials not present in "Account A" are hidden. The Stock column reflects the quantity in that specific account. The pagination updates to reflect the filtered count.

#### Test: Selecting All Accounts in the account filter shows all materials
- **Components:** MaterialsFilterBar, MaterialsTable
- **Initial state:** User is on `/materials` with "Account A" selected in the account filter. Only materials in Account A are shown.
- **Action:** User selects "All Accounts" from the "Filter by Account" dropdown.
- **Expected:** The MaterialsTable updates to show all materials across all accounts. The Stock column reflects the total stock across all accounts. The pagination updates to reflect the total count.

#### Test: Sort by dropdown is displayed with default "Name (A-Z)"
- **Components:** MaterialsFilterBar
- **Initial state:** User navigates to `/materials`.
- **Action:** Page loads.
- **Expected:** A "Sort by:" dropdown is displayed showing the default value "Name (A-Z)". The materials in the table are sorted alphabetically by name in ascending order.

#### Test: Sort by dropdown shows sort options
- **Components:** MaterialsFilterBar
- **Initial state:** User is on `/materials`.
- **Action:** User clicks the "Sort by:" dropdown.
- **Expected:** A dropdown opens showing sort options including at least: "Name (A-Z)", "Name (Z-A)", "Stock (Low to High)", "Stock (High to Low)", "Category (A-Z)", "Category (Z-A)".

#### Test: Changing sort order re-sorts the materials table
- **Components:** MaterialsFilterBar, MaterialsTable
- **Initial state:** User is on `/materials`. Materials are sorted by "Name (A-Z)".
- **Action:** User selects "Stock (High to Low)" from the "Sort by:" dropdown.
- **Expected:** The MaterialsTable re-sorts rows so that materials with the highest stock appear first. For example, "M6 Bolt & Nut Set" (10,500) appears before "Cardboard Box (Small)" (5,000), which appears before "Polycarbonate Pellets" (2,400), and so on.

#### Test: Combining search, category filter, and sort works together
- **Components:** MaterialsFilterBar, MaterialsTable
- **Initial state:** User is on `/materials`. The table shows all materials sorted by Name (A-Z).
- **Action:** User selects "Raw Materials" from the "Filter by Category" dropdown, then types "Co" in the search input, then selects "Stock (Low to High)" from the sort dropdown.
- **Expected:** The MaterialsTable shows only materials in the "Raw Materials" category whose name contains "Co" (e.g., "Copper Wire 16AWG"), sorted by stock ascending. All three filters are applied simultaneously.

### MaterialsTable

#### Test: Table displays all column headers
- **Components:** MaterialsTable
- **Initial state:** User navigates to `/materials`.
- **Action:** Page loads.
- **Expected:** The table displays column headers in order: "Material Name", "Category", "Unit of Measure", "Stock", "Actions".

#### Test: Table rows display correct material data
- **Components:** MaterialsTable
- **Initial state:** User navigates to `/materials`. Materials exist including "Steel Sheet 10Ga" (Raw Materials, Sheet, 1,250 stock).
- **Action:** Page loads.
- **Expected:** Each material row displays the material's name, category, unit of measure, and total stock quantity. For example, the first row shows: Material Name "Steel Sheet 10Ga", Category "Raw Materials", Unit of Measure "Sheet", Stock "1,250".

#### Test: View Detail link navigates to MaterialDetailPage
- **Components:** MaterialsTable
- **Initial state:** User is on `/materials`. The table shows "Steel Sheet 10Ga" with a "[View Detail]" link in the Actions column.
- **Action:** User clicks the "[View Detail]" link on the "Steel Sheet 10Ga" row.
- **Expected:** User is navigated to the MaterialDetailPage (`/materials/:materialId`) for "Steel Sheet 10Ga".

#### Test: Edit link opens edit form for the material
- **Components:** MaterialsTable
- **Initial state:** User is on `/materials`. The table shows "Steel Sheet 10Ga" with an "[Edit]" link in the Actions column.
- **Action:** User clicks the "[Edit]" link on the "Steel Sheet 10Ga" row.
- **Expected:** An edit form or modal opens for "Steel Sheet 10Ga". The form is pre-filled with the material's current values (name, category, unit of measure, description). The user can modify fields and save or cancel.

#### Test: Saving edit from table row persists changes
- **Components:** MaterialsTable
- **Initial state:** User clicked "[Edit]" on "Steel Sheet 10Ga" row. The edit form is open with the current name "Steel Sheet 10Ga".
- **Action:** User changes the name to "Steel Sheet 12Ga" and saves.
- **Expected:** The edit form closes. The table row updates to show "Steel Sheet 12Ga" as the Material Name. The change is persisted to the database.

#### Test: Eye icon navigates to MaterialDetailPage
- **Components:** MaterialsTable
- **Initial state:** User is on `/materials`. The table shows "Steel Sheet 10Ga" with an eye icon in the Actions column.
- **Action:** User clicks the eye icon on the "Steel Sheet 10Ga" row.
- **Expected:** User is navigated to the MaterialDetailPage (`/materials/:materialId`) for "Steel Sheet 10Ga".

#### Test: Edit pencil icon opens edit form for the material
- **Components:** MaterialsTable
- **Initial state:** User is on `/materials`. The table shows "Steel Sheet 10Ga" with a pencil/edit icon in the Actions column.
- **Action:** User clicks the pencil icon on the "Steel Sheet 10Ga" row.
- **Expected:** An edit form or modal opens for "Steel Sheet 10Ga", pre-filled with the material's current values. The user can modify fields and save or cancel. This behaves identically to clicking the "[Edit]" text link.

#### Test: Table displays up to 8 rows per page
- **Components:** MaterialsTable, Pagination
- **Initial state:** User navigates to `/materials`. There are 45 total materials.
- **Action:** Page loads.
- **Expected:** The table displays exactly 8 material rows on the first page.

### Pagination

#### Test: Pagination controls are displayed below the table
- **Components:** Pagination
- **Initial state:** User navigates to `/materials`. There are 45 total materials.
- **Action:** Page loads.
- **Expected:** Pagination controls are displayed below the table showing: a "Previous" button, page number buttons (1, 2, 3, ...), a "Next" button, and a label "Showing 1-8 of 45 items".

#### Test: Previous button is disabled on the first page
- **Components:** Pagination
- **Initial state:** User is on `/materials` viewing page 1 of results.
- **Action:** Page loads.
- **Expected:** The "Previous" button is disabled (not clickable or visually grayed out). Page 1 is highlighted as the current page.

#### Test: Clicking Next navigates to the next page of results
- **Components:** Pagination, MaterialsTable
- **Initial state:** User is on `/materials` viewing page 1 of 45 items (8 per page).
- **Action:** User clicks the "Next" button.
- **Expected:** The MaterialsTable updates to show the next 8 materials (items 9-16). The pagination label updates to "Showing 9-16 of 45 items". Page 2 is highlighted as the current page. The "Previous" button becomes enabled.

#### Test: Clicking a page number navigates to that page
- **Components:** Pagination, MaterialsTable
- **Initial state:** User is on `/materials` viewing page 1.
- **Action:** User clicks page number "3".
- **Expected:** The MaterialsTable updates to show materials for page 3 (items 17-24). The pagination label updates to "Showing 17-24 of 45 items". Page 3 is highlighted as the current page.

#### Test: Previous button navigates to the previous page
- **Components:** Pagination, MaterialsTable
- **Initial state:** User is on `/materials` viewing page 2 (items 9-16).
- **Action:** User clicks the "Previous" button.
- **Expected:** The MaterialsTable updates to show the first page of materials (items 1-8). The pagination label updates to "Showing 1-8 of 45 items". Page 1 is highlighted as the current page.

#### Test: Next button is disabled on the last page
- **Components:** Pagination
- **Initial state:** User is on `/materials` viewing the last page of results. There are 45 items total with 8 per page, so the last page is page 6 showing items 41-45.
- **Action:** User navigates to the last page.
- **Expected:** The "Next" button is disabled (not clickable or visually grayed out). The pagination label shows "Showing 41-45 of 45 items".

#### Test: Pagination updates when filters reduce the result set
- **Components:** Pagination, MaterialsFilterBar, MaterialsTable
- **Initial state:** User is on `/materials` with 45 total items. Pagination shows "Showing 1-8 of 45 items".
- **Action:** User selects "Packaging" from the "Filter by Category" dropdown. There are 5 materials in the "Packaging" category.
- **Expected:** The MaterialsTable shows only packaging materials. Pagination updates to show "Showing 1-5 of 5 items". Page number buttons update to show only page 1. The "Previous" and "Next" buttons are both disabled since all results fit on one page.

---

## MaterialDetailPage (`/materials/:materialId`)

Components: MaterialHeader, AccountsDistribution, AllBatchesList, TransactionsHistory

### MaterialHeader

#### Test: Breadcrumb navigation displays Home > Materials > Material Name
- **Components:** MaterialHeader
- **Initial state:** User navigates to `/materials/M-CFS-001`. The material name is "Carbon Fiber Sheets".
- **Action:** Page loads.
- **Expected:** A breadcrumb trail is displayed showing "Home > Materials > Carbon Fiber Sheets". "Home" is a clickable link. "Materials" is a clickable link. "Carbon Fiber Sheets" is the current page label and is not clickable. The ">" separator characters are visible between each breadcrumb segment.

#### Test: Breadcrumb Home link navigates to Dashboard
- **Components:** MaterialHeader
- **Initial state:** User is on `/materials/M-CFS-001`. Breadcrumb shows "Home > Materials > Carbon Fiber Sheets".
- **Action:** User clicks "Home" in the breadcrumb.
- **Expected:** User is navigated to the DashboardPage (`/`).

#### Test: Breadcrumb Materials link navigates to Materials list
- **Components:** MaterialHeader
- **Initial state:** User is on `/materials/M-CFS-001`. Breadcrumb shows "Home > Materials > Carbon Fiber Sheets".
- **Action:** User clicks "Materials" in the breadcrumb.
- **Expected:** User is navigated to the MaterialsPage (`/materials`).

#### Test: Material name is displayed as the primary page heading
- **Components:** MaterialHeader
- **Initial state:** User navigates to `/materials/M-CFS-001`. The material name is "Carbon Fiber Sheets".
- **Action:** Page loads.
- **Expected:** The header displays "Carbon Fiber Sheets" in large, bold text as the primary heading of the page.

#### Test: Category is displayed below the material name
- **Components:** MaterialHeader
- **Initial state:** User navigates to `/materials/M-CFS-001`. The material category is "Composite".
- **Action:** Page loads.
- **Expected:** A "Category:" label is displayed below the material name heading with the value "Composite" inline. The category is separated from the Unit of Measure by a pipe character "|".

#### Test: Unit of Measure is displayed next to the category
- **Components:** MaterialHeader
- **Initial state:** User navigates to `/materials/M-CFS-001`. The material unit of measure is "sq meters".
- **Action:** Page loads.
- **Expected:** A "Unit of Measure:" label is displayed inline after the category, separated by a pipe character "|", with the value "sq meters".

#### Test: Description text is displayed below category and unit of measure
- **Components:** MaterialHeader
- **Initial state:** User navigates to `/materials/M-CFS-001`. The material has a description "High-strength, lightweight composite sheets used for structural applications and panels. Standard grade."
- **Action:** Page loads.
- **Expected:** The description text is displayed below the category/unit of measure line as a paragraph of body text. The full description is visible without truncation.

#### Test: Edit Material button is displayed in the header
- **Components:** MaterialHeader
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** An "Edit Material" button is displayed in the top-right area of the header, styled as an outline/secondary button.

#### Test: Edit Material button opens an edit form for the material
- **Components:** MaterialHeader
- **Initial state:** User is on `/materials/M-CFS-001`.
- **Action:** User clicks the "Edit Material" button.
- **Expected:** An edit form or modal opens allowing the user to modify the material's name, category, unit of measure, and description. The form is pre-filled with the current values. The user can save changes or cancel.

#### Test: Saving Edit Material form persists changes
- **Components:** MaterialHeader
- **Initial state:** User has clicked "Edit Material" on `/materials/M-CFS-001`. The edit form is open with the current material name "Carbon Fiber Sheets".
- **Action:** User changes the description to "Updated description for carbon fiber sheets." and saves the form.
- **Expected:** The edit form closes. The MaterialHeader updates to show the new description "Updated description for carbon fiber sheets." The change is persisted to the database.

#### Test: New Batch button is displayed in the header
- **Components:** MaterialHeader
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** A "New Batch" button is displayed in the top-right area of the header next to the Edit Material button, styled as a primary/filled button.

#### Test: New Batch button opens a form to create a new batch for this material
- **Components:** MaterialHeader
- **Initial state:** User is on `/materials/M-CFS-001`.
- **Action:** User clicks the "New Batch" button.
- **Expected:** A form or modal opens for creating a new batch. The material field is pre-filled with "Carbon Fiber Sheets" and is read-only or pre-selected. The user can enter batch details (quantity, account/location, and any custom properties such as lot number or expiration date). The user can save or cancel.

#### Test: Saving New Batch form creates a batch and updates the page
- **Components:** MaterialHeader, AccountsDistribution, AllBatchesList
- **Initial state:** User clicked "New Batch" on `/materials/M-CFS-001`. The form is open. User fills in: Account "Warehouse A - Main Storage", Quantity "300".
- **Action:** User saves the new batch form.
- **Expected:** The form closes. A new batch is created in the database for "Carbon Fiber Sheets" in "Warehouse A - Main Storage" with quantity 300. The AccountsDistribution table updates to reflect the new quantity and batch count for "Warehouse A - Main Storage". The AllBatchesList table includes the newly created batch row.

#### Test: New Transaction button is displayed in the header
- **Components:** MaterialHeader
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** A "New Transaction" button is displayed in the top-right area of the header next to the New Batch button, styled as a primary/filled button.

#### Test: New Transaction button navigates to NewTransactionPage
- **Components:** MaterialHeader
- **Initial state:** User is on `/materials/M-CFS-001`.
- **Action:** User clicks the "New Transaction" button.
- **Expected:** User is navigated to the NewTransactionPage (`/transactions/new`). The new transaction form is pre-filled or pre-configured to reference the current material "Carbon Fiber Sheets".

### AccountsDistribution

#### Test: Accounts Distribution section heading is displayed
- **Components:** AccountsDistribution
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** An "Accounts Distribution" heading is displayed below the MaterialHeader, above the accounts distribution table.

#### Test: Accounts Distribution table displays all column headers
- **Components:** AccountsDistribution
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** The table displays column headers: "Account Name", "Account Type", "Quantity (sq m)", "Number of Batches", and "Link". The Quantity column header includes the material's unit of measure in parentheses.

#### Test: Account rows display correct data
- **Components:** AccountsDistribution
- **Initial state:** User navigates to `/materials/M-CFS-001`. The material "Carbon Fiber Sheets" exists in two accounts: "Warehouse A - Main Storage" (Storage, 1200 sq m, 3 batches) and "Production Line B" (Manufacturing, 450 sq m, 1 batch).
- **Action:** Page loads.
- **Expected:** Two rows are displayed. Row 1: Account Name "Warehouse A - Main Storage", Account Type "Storage", Quantity "1,200", Number of Batches "3", Link "View Account". Row 2: Account Name "Production Line B", Account Type "Manufacturing", Quantity "450", Number of Batches "1", Link "View Account".

#### Test: View Account link navigates to AccountDetailPage
- **Components:** AccountsDistribution
- **Initial state:** User is on `/materials/M-CFS-001`. The Accounts Distribution table shows "Warehouse A - Main Storage" with a "View Account" link.
- **Action:** User clicks the "View Account" link on the "Warehouse A - Main Storage" row.
- **Expected:** User is navigated to the AccountDetailPage (`/accounts/:accountId`) for "Warehouse A - Main Storage".

#### Test: Account row has a collapse/expand chevron to show batches
- **Components:** AccountsDistribution
- **Initial state:** User navigates to `/materials/M-CFS-001`. The Accounts Distribution table shows account rows.
- **Action:** Page loads.
- **Expected:** Each account row in the Account Name column has a chevron icon (▶ or ▼) that can be clicked to expand or collapse the batch details for that account. By default, rows may be collapsed.

#### Test: Expanding an account row reveals batches sub-table
- **Components:** AccountsDistribution
- **Initial state:** User is on `/materials/M-CFS-001`. The "Warehouse A - Main Storage" row is collapsed (chevron pointing right ▶).
- **Action:** User clicks the chevron on the "Warehouse A - Main Storage" row.
- **Expected:** The row expands and a sub-section appears below it titled "Batches in Warehouse A - Main Storage". A sub-table is displayed with columns: "Batch ID", "Quantity (sq m)", "Unit", and "Created Date". The chevron rotates to point downward (▼) indicating the expanded state.

#### Test: Expanded batches sub-table displays correct batch data
- **Components:** AccountsDistribution
- **Initial state:** User is on `/materials/M-CFS-001`. The "Warehouse A - Main Storage" row is expanded. This account has 3 batches for the material (two shown in mockup: B-2023-001 and B-2023-005).
- **Action:** User views the expanded sub-table.
- **Expected:** The sub-table rows display batch details. Row 1: Batch ID "B-2023-001", Quantity "500", Unit "sq m", Created Date "Oct 15, 2023". Row 2: Batch ID "B-2023-005", Quantity "700", Unit "sq m", Created Date "Oct 22, 2023". All batches belonging to this account for this material are listed.

#### Test: Batch ID in expanded sub-table is a clickable link
- **Components:** AccountsDistribution
- **Initial state:** User is on `/materials/M-CFS-001`. The "Warehouse A - Main Storage" row is expanded showing batches.
- **Action:** User clicks "B-2023-001" in the Batch ID column of the sub-table.
- **Expected:** User is navigated to the BatchDetailPage (`/batches/B-2023-001`).

#### Test: Collapsing an expanded account row hides the batches sub-table
- **Components:** AccountsDistribution
- **Initial state:** User is on `/materials/M-CFS-001`. The "Warehouse A - Main Storage" row is expanded (chevron pointing down ▼), showing the batches sub-table.
- **Action:** User clicks the chevron on the "Warehouse A - Main Storage" row again.
- **Expected:** The batches sub-table collapses and is hidden. The chevron rotates back to pointing right (▶). The main account row remains visible.

#### Test: Multiple account rows can be expanded independently
- **Components:** AccountsDistribution
- **Initial state:** User is on `/materials/M-CFS-001`. Both "Warehouse A - Main Storage" and "Production Line B" rows are collapsed.
- **Action:** User expands "Warehouse A - Main Storage" and then expands "Production Line B".
- **Expected:** Both account rows are expanded simultaneously, each showing their own batches sub-table. Expanding one row does not collapse the other.

#### Test: Empty Accounts Distribution when material is not in any account
- **Components:** AccountsDistribution
- **Initial state:** User navigates to a material that has not been added to any account yet.
- **Action:** Page loads.
- **Expected:** The "Accounts Distribution" heading is displayed. The table shows column headers but no data rows. An empty state message such as "This material is not currently tracked in any account" is displayed.

### AllBatchesList

#### Test: All Batches section heading is displayed
- **Components:** AllBatchesList
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** An "All Batches" heading is displayed below the Accounts Distribution section.

#### Test: Filter by Account dropdown is displayed with default value
- **Components:** AllBatchesList
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** A "Filter by Account:" dropdown is displayed above the All Batches table with the default value "[All Accounts]".

#### Test: Filter by Account dropdown lists all accounts containing this material
- **Components:** AllBatchesList
- **Initial state:** User is on `/materials/M-CFS-001`. The material exists in "Warehouse A - Main Storage" and "Production Line B".
- **Action:** User clicks the "Filter by Account" dropdown.
- **Expected:** A dropdown opens listing "[All Accounts]", "Warehouse A - Main Storage", and "Production Line B" as options.

#### Test: Selecting an account from Filter by Account filters the batches table
- **Components:** AllBatchesList
- **Initial state:** User is on `/materials/M-CFS-001`. The All Batches table shows 3 batches across two accounts.
- **Action:** User selects "Warehouse A - Main Storage" from the Filter by Account dropdown.
- **Expected:** The dropdown displays "Warehouse A - Main Storage". The All Batches table updates to show only batches located in "Warehouse A - Main Storage" (e.g., B-2023-001 and B-2023-005). Batches in other accounts are hidden.

#### Test: Filter by Date dropdown is displayed with default value
- **Components:** AllBatchesList
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** A "Filter by Date:" dropdown is displayed next to the Filter by Account dropdown, with the default value "[All Dates]".

#### Test: Selecting a date range from Filter by Date filters the batches table
- **Components:** AllBatchesList
- **Initial state:** User is on `/materials/M-CFS-001`. The All Batches table shows batches created on Oct 15, Oct 22, and Nov 01 2023.
- **Action:** User selects a date range option from the Filter by Date dropdown that covers only October 2023.
- **Expected:** The All Batches table updates to show only batches created within October 2023 (B-2023-001 and B-2023-005). The batch created in November (B-2023-010) is hidden.

#### Test: All Batches table displays all column headers
- **Components:** AllBatchesList
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** The table displays column headers: "Batch ID", "Location", "Quantity (sq m)", "Created Date", and "Actions". The Quantity column header includes the material's unit of measure in parentheses.

#### Test: All Batches table rows display correct data
- **Components:** AllBatchesList
- **Initial state:** User navigates to `/materials/M-CFS-001`. The material has three batches: B-2023-001 (Warehouse A, 500, Oct 15 2023), B-2023-005 (Warehouse A, 700, Oct 22 2023), B-2023-010 (Production Line B, 450, Nov 01 2023).
- **Action:** Page loads.
- **Expected:** Three rows are displayed. Row 1: Batch ID "B-2023-001", Location "Warehouse A", Quantity "500", Created Date "Oct 15, 2023", Actions "View Lineage". Row 2: Batch ID "B-2023-005", Location "Warehouse A", Quantity "700", Created Date "Oct 22, 2023", Actions "View Lineage". Row 3: Batch ID "B-2023-010", Location "Production Line B", Quantity "450", Created Date "Nov 01, 2023", Actions "View Lineage".

#### Test: Batch ID in All Batches table is clickable and navigates to BatchDetailPage
- **Components:** AllBatchesList
- **Initial state:** User is on `/materials/M-CFS-001`. The All Batches table shows batch "B-2023-001".
- **Action:** User clicks "B-2023-001" in the Batch ID column.
- **Expected:** User is navigated to the BatchDetailPage (`/batches/B-2023-001`).

#### Test: View Lineage link navigates to BatchDetailPage lineage section
- **Components:** AllBatchesList
- **Initial state:** User is on `/materials/M-CFS-001`. The All Batches table shows a "View Lineage" link in the Actions column for batch "B-2023-001".
- **Action:** User clicks the "View Lineage" link for batch "B-2023-001".
- **Expected:** User is navigated to the BatchDetailPage (`/batches/B-2023-001`) where the lineage information for that batch is displayed.

#### Test: Filters work together to narrow batch results
- **Components:** AllBatchesList
- **Initial state:** User is on `/materials/M-CFS-001`. All Batches table shows 3 batches. Filter by Account is "[All Accounts]" and Filter by Date is "[All Dates]".
- **Action:** User selects "Warehouse A - Main Storage" from Filter by Account and selects an October 2023 date range from Filter by Date.
- **Expected:** The All Batches table shows only batches that are both in "Warehouse A - Main Storage" AND created within October 2023 (B-2023-001 and B-2023-005). B-2023-010 is excluded because it is in a different account.

#### Test: Empty All Batches when no batches exist for this material
- **Components:** AllBatchesList
- **Initial state:** User navigates to a material that has no batches created yet.
- **Action:** Page loads.
- **Expected:** The "All Batches" heading is displayed. The table shows column headers but no data rows. An empty state message such as "No batches found" is displayed. Filter dropdowns are still visible.

#### Test: Empty All Batches when filters match no results
- **Components:** AllBatchesList
- **Initial state:** User is on `/materials/M-CFS-001`. The material has batches, but the user applies filters that exclude all of them.
- **Action:** User selects "Production Line B" from Filter by Account and a date range that contains no batches from Production Line B.
- **Expected:** The table shows column headers but no data rows. An empty state message such as "No batches found" is displayed.

### TransactionsHistory

#### Test: Transactions History section heading is displayed
- **Components:** TransactionsHistory
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** A "Transactions History" heading is displayed below the All Batches section.

#### Test: Filter by Type dropdown is displayed with default value
- **Components:** TransactionsHistory
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** A "Filter by Type:" dropdown is displayed above the Transactions History table with the default value "[All Types]".

#### Test: Filter by Type dropdown lists available transaction types
- **Components:** TransactionsHistory
- **Initial state:** User is on `/materials/M-CFS-001`.
- **Action:** User clicks the "Filter by Type" dropdown.
- **Expected:** A dropdown opens listing "[All Types]" and the available transaction types (e.g., Purchase, Consumption, Transfer, Inventory Adjustment, Production).

#### Test: Selecting a type from Filter by Type filters the transactions table
- **Components:** TransactionsHistory
- **Initial state:** User is on `/materials/M-CFS-001`. The Transactions History table shows transactions of various types.
- **Action:** User selects "Purchase" from the Filter by Type dropdown.
- **Expected:** The dropdown displays "Purchase". The Transactions History table updates to show only purchase transactions involving this material.

#### Test: Filter by Date dropdown is displayed with default value
- **Components:** TransactionsHistory
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** A "Filter by Date:" dropdown is displayed next to the Filter by Type dropdown, with the default value "[Last 30 Days]".

#### Test: Selecting a date range from Filter by Date filters the transactions table
- **Components:** TransactionsHistory
- **Initial state:** User is on `/materials/M-CFS-001`. The Transactions History table shows transactions from multiple dates.
- **Action:** User selects a different date range option from the Filter by Date dropdown (e.g., "Last 7 Days").
- **Expected:** The Transactions History table updates to show only transactions within the selected date range. Transactions outside the range are hidden.

#### Test: Transactions History table displays all column headers
- **Components:** TransactionsHistory
- **Initial state:** User navigates to `/materials/M-CFS-001`.
- **Action:** Page loads.
- **Expected:** The table displays column headers: "Date", "Transaction ID", "Accounts Involved", "Batch References", and "Quantity Moved (sq m)". The Quantity Moved column header includes the material's unit of measure in parentheses.

#### Test: Transactions History table rows display correct data
- **Components:** TransactionsHistory
- **Initial state:** User navigates to `/materials/M-CFS-001`. The material has three transactions: (1) Nov 05, 2023 | T-2311-567 | Warehouse A → Production Line B | B-2023-010 | 450, (2) Oct 25, 2023 | T-2310-210 | Supplier X → Warehouse A | B-2023-005 | 700, (3) Oct 15, 2023 | T-2310-015 | Supplier X → Warehouse A | B-2023-001 | 500.
- **Action:** Page loads.
- **Expected:** Three rows are displayed in chronological order (newest first). Row 1: Date "Nov 05, 2023", Transaction ID "T-2311-567", Accounts Involved "Warehouse A → Production Line B", Batch References "B-2023-010", Quantity Moved "450". Row 2: Date "Oct 25, 2023", Transaction ID "T-2310-210", Accounts Involved "Supplier X → Warehouse A", Batch References "B-2023-005", Quantity Moved "700". Row 3: Date "Oct 15, 2023", Transaction ID "T-2310-015", Accounts Involved "Supplier X → Warehouse A", Batch References "B-2023-001", Quantity Moved "500".

#### Test: Accounts Involved column shows directional arrow between source and destination
- **Components:** TransactionsHistory
- **Initial state:** User navigates to `/materials/M-CFS-001`. A transaction moved material from "Warehouse A" to "Production Line B".
- **Action:** Page loads.
- **Expected:** The Accounts Involved column displays the source account followed by an arrow "→" and the destination account, e.g., "Warehouse A → Production Line B". The arrow indicates the direction of material flow.

#### Test: Transaction ID in Transactions History is clickable
- **Components:** TransactionsHistory
- **Initial state:** User is on `/materials/M-CFS-001`. The Transactions History table shows transaction "T-2311-567".
- **Action:** User clicks "T-2311-567" in the Transaction ID column.
- **Expected:** User is navigated to the TransactionDetailPage (`/transactions/T-2311-567`).

#### Test: Batch References in Transactions History are clickable
- **Components:** TransactionsHistory
- **Initial state:** User is on `/materials/M-CFS-001`. The Transactions History table shows batch reference "B-2023-010" for transaction T-2311-567.
- **Action:** User clicks "B-2023-010" in the Batch References column.
- **Expected:** User is navigated to the BatchDetailPage (`/batches/B-2023-010`).

#### Test: Filters work together to narrow transaction results
- **Components:** TransactionsHistory
- **Initial state:** User is on `/materials/M-CFS-001`. Transactions History shows transactions of various types and dates.
- **Action:** User selects a specific type from Filter by Type and a specific date range from Filter by Date.
- **Expected:** The Transactions History table shows only transactions that match both the selected type AND fall within the selected date range.

#### Test: Empty Transactions History when no transactions exist for this material
- **Components:** TransactionsHistory
- **Initial state:** User navigates to a material that has no transactions recorded.
- **Action:** Page loads.
- **Expected:** The "Transactions History" heading is displayed. The table shows column headers but no data rows. An empty state message such as "No transactions found" is displayed. Filter dropdowns are still visible.

#### Test: Empty Transactions History when filters match no results
- **Components:** TransactionsHistory
- **Initial state:** User is on `/materials/M-CFS-001`. The material has transactions, but the user applies filters that exclude all of them.
- **Action:** User selects a transaction type from Filter by Type that has no matching transactions for this material.
- **Expected:** The table shows column headers but no data rows. An empty state message such as "No transactions found" is displayed.

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
