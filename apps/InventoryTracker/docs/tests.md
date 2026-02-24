# InventoryTracker Test Specification

## DashboardPage (/)

Components: NavigationHeader, DateRangeFilter, CategoryFilter, LowInventoryAlerts, MaterialsCategoriesOverview, RecentTransactionsTable, NewTransactionButton

<!-- Tests to be added by PlanPageDashboard -->

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
