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

<!-- Tests will be added by PlanPageTransactionDetail -->

---

## NewTransactionPage (`/transactions/new`)

Components: BasicInfoForm, QuantityTransfersList, BatchAllocationList

<!-- Tests will be added by PlanPageNewTransaction -->
