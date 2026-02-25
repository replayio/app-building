# Accounting Platform — Test Specification

## Page: AccountsPage

### Components: NavBar, AccountsOverviewHeader, CategorySection, AccountCard

#### Component: NavBar

**Test: NavBar displays logo and navigation links**
- **Initial state:** User is on the AccountsPage.
- **Action:** User observes the top navigation bar.
- **Expected:** The NavBar displays the "FINANCEWEB" logo on the left. Four navigation links are visible: "Dashboard", "Accounts", "Reports", and "Budgets". The "Accounts" link is visually highlighted/active since the user is on the AccountsPage. A breadcrumb trail shows "Home > Accounts" below the NavBar.

**Test: NavBar Accounts link navigates to AccountsPage**
- **Initial state:** User is on a different page (e.g., Dashboard).
- **Action:** User clicks the "Accounts" link in the NavBar.
- **Expected:** The app navigates to the AccountsPage. The "Accounts" link becomes highlighted/active.

**Test: NavBar Dashboard link navigates to Dashboard**
- **Initial state:** User is on the AccountsPage.
- **Action:** User clicks the "Dashboard" link in the NavBar.
- **Expected:** The app navigates to the Dashboard page. The "Dashboard" link becomes highlighted/active.

**Test: NavBar Reports link navigates to ReportList**
- **Initial state:** User is on the AccountsPage.
- **Action:** User clicks the "Reports" link in the NavBar.
- **Expected:** The app navigates to the ReportList page. The "Reports" link becomes highlighted/active.

**Test: NavBar Budgets link navigates to Budgets page**
- **Initial state:** User is on the AccountsPage.
- **Action:** User clicks the "Budgets" link in the NavBar.
- **Expected:** The app navigates to the Budgets page. The "Budgets" link becomes highlighted/active.

**Test: NavBar New Transaction button opens NewTransactionModal**
- **Initial state:** User is on the AccountsPage.
- **Action:** User clicks the "+ New Transaction" button in the NavBar.
- **Expected:** The NewTransactionModal dialog opens, overlaying the current page. The button displays a plus icon and the text "New Transaction".

**Test: NavBar displays user name and avatar**
- **Initial state:** User is logged in and on any page.
- **Action:** User observes the right side of the NavBar.
- **Expected:** A user avatar icon and the text "John Doe" (the logged-in user's name) are displayed to the right of the New Transaction button.

**Test: NavBar Log Out button logs the user out**
- **Initial state:** User is logged in and on any page.
- **Action:** User clicks the "Log Out" button in the NavBar.
- **Expected:** The user is logged out and redirected to a login page. The session is terminated.

#### Component: AccountsOverviewHeader

**Test: AccountsOverviewHeader displays page title**
- **Initial state:** User is on the AccountsPage.
- **Action:** User observes the page header area below the breadcrumb.
- **Expected:** The heading "Accounts Overview" is displayed prominently.

**Test: AccountsOverviewHeader Generate Reports button opens CreateReportDialog**
- **Initial state:** User is on the AccountsPage.
- **Action:** User clicks the "Generate Reports" button (which displays a document icon and the text "Generate Reports").
- **Expected:** The CreateReportDialog opens, allowing the user to configure and generate a report. The button is positioned to the right of the page title.

#### Component: CategorySection

**Test: CategorySection displays all five accounting categories**
- **Initial state:** User is on the AccountsPage with accounts in all categories.
- **Action:** User observes the page content.
- **Expected:** Five category sections are displayed in order: "Assets", "Liabilities", "Equity", "Revenue", and "Expenses". Each category section has a header with the category name, a collapse/expand chevron icon, and the category total amount displayed on the right side of the header.

**Test: CategorySection shows correct category totals**
- **Initial state:** User is on the AccountsPage with seeded account data.
- **Action:** User observes the category headers.
- **Expected:** Each category header displays the sum of all account balances in that category. For example, Assets shows "$152,450.00", Liabilities shows "-$85,200.00", Equity shows "$67,250.00", Revenue shows "$110,000.00", and Expenses shows "$55,500.00". Negative totals (like Liabilities) are displayed with a minus sign.

**Test: CategorySection expand reveals account cards**
- **Initial state:** User is on the AccountsPage with the "Equity" category collapsed (showing only the header and total).
- **Action:** User clicks the "Equity" category header or its expand chevron icon.
- **Expected:** The Equity category section expands to reveal AccountCard components for each account in that category. The chevron icon rotates to indicate the expanded state.

**Test: CategorySection collapse hides account cards**
- **Initial state:** User is on the AccountsPage with the "Assets" category expanded showing its account cards.
- **Action:** User clicks the "Assets" category header or its collapse chevron icon.
- **Expected:** The Assets category section collapses, hiding all AccountCard components. Only the category header with name and total remains visible. The chevron icon rotates to indicate the collapsed state.

**Test: CategorySection Assets expanded by default with three accounts**
- **Initial state:** User navigates to the AccountsPage for the first time.
- **Action:** User observes the Assets category section.
- **Expected:** The Assets category is expanded by default, showing three account cards: "Checking Account (Chase Bank)", "Savings Account (Ally)", and "Investment Portfolio (Vanguard)".

**Test: CategorySection Liabilities expanded by default with three accounts**
- **Initial state:** User navigates to the AccountsPage for the first time.
- **Action:** User observes the Liabilities category section.
- **Expected:** The Liabilities category is expanded by default, showing three account cards: "Credit Card (Visa)", "Mortgage Loan (Wells Fargo)", and "Car Loan (Toyota Financial)".

#### Component: AccountCard

**Test: AccountCard displays account name and balance**
- **Initial state:** User is on the AccountsPage with the Assets category expanded.
- **Action:** User observes an account card (e.g., "Checking Account (Chase Bank)").
- **Expected:** The card displays the account name "Checking Account (Chase Bank)" as a prominent title and the balance "Balance: $12,500.00" below it.

**Test: AccountCard displays debits and credits YTD**
- **Initial state:** User is on the AccountsPage with the Assets category expanded.
- **Action:** User observes the "Checking Account (Chase Bank)" card.
- **Expected:** The card shows "Debits (YTD): $45,200.00" on the left and "Credits (YTD): $57,700.00" on the right, displaying year-to-date transaction totals.

**Test: AccountCard displays budget vs actual progress bar**
- **Initial state:** User is on the AccountsPage with the Assets category expanded.
- **Action:** User observes the "Checking Account (Chase Bank)" card.
- **Expected:** The card shows a "Budget vs Actual" section with a colored progress bar. The text reads "$10,000 of $12,500 Budgeted", and the progress bar visually represents the ratio of actual spending to the budgeted amount.

**Test: AccountCard View Budget Details link navigates to budget details**
- **Initial state:** User is on the AccountsPage with the Assets category expanded.
- **Action:** User clicks the "View Budget Details" link on the "Checking Account (Chase Bank)" card.
- **Expected:** The app navigates to the AccountDetailPage for the Checking Account, with the budget details tab or section visible.

**Test: AccountCard three-dot menu opens actions**
- **Initial state:** User is on the AccountsPage with the Assets category expanded.
- **Action:** User clicks the three-dot menu icon (⋮) in the top-right corner of the "Checking Account (Chase Bank)" card.
- **Expected:** A dropdown menu appears with actions for the account (e.g., Edit Account, Delete Account, View Transactions).

**Test: AccountCard click navigates to AccountDetailPage**
- **Initial state:** User is on the AccountsPage with the Assets category expanded.
- **Action:** User clicks on the main body of the "Checking Account (Chase Bank)" card (not on the three-dot menu or View Budget Details link).
- **Expected:** The app navigates to the AccountDetailPage for the Checking Account, showing all transactions that have affected this account.

**Test: AccountCard displays savings goal progress**
- **Initial state:** User is on the AccountsPage with the Assets category expanded.
- **Action:** User observes the "Savings Account (Ally)" card.
- **Expected:** The card shows "Balance: $40,000.00", "Debits (YTD): $45,200.00", "Credits (YTD): $57,700.00", and a savings goal labeled "Vacation Fund" at 95% with a progress bar.

**Test: AccountCard displays investment performance**
- **Initial state:** User is on the AccountsPage with the Assets category expanded.
- **Action:** User observes the "Investment Portfolio (Vanguard)" card.
- **Expected:** The card shows "Balance: $98,450.00" and a "Performance: +7.5%" indicator with an upward trend icon, reflecting investment returns.

**Test: AccountCard displays liability-specific information**
- **Initial state:** User is on the AccountsPage with the Liabilities category expanded.
- **Action:** User observes the liability account cards.
- **Expected:** The "Credit Card (Visa)" card shows "Balance: -$2,500.00", "Debits (YTD): $8,500.00", "Credits (YTD): $6,000.00", a budget bar, and "Credit Limit Usage: 35%". The "Mortgage Loan (Wells Fargo)" card shows "Balance: -$78,000.00", "Monthly Payment: $1,200", and "Interest Rate: 3.5%". The "Car Loan (Toyota Financial)" card shows "Balance: -$4,700.00".

---

## Page: AccountDetailPage

### Components: AccountHeader, BudgetOverview, TransactionsTab, BudgetDetailsTab, ReportingLinks

#### Component: AccountHeader

**Test: AccountHeader displays account name**
- **Initial state:** User navigates to the AccountDetailPage for the "Main Checking" account.
- **Action:** User observes the header area of the page.
- **Expected:** The text "Account: Main Checking" is displayed prominently as the page heading.

**Test: AccountHeader displays category label**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account (an Asset account).
- **Action:** User observes the header area below the account name.
- **Expected:** The text "Category: Asset" is displayed below the account name, identifying the account's category.

**Test: AccountHeader displays breadcrumb navigation**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account.
- **Action:** User observes the breadcrumb area above the account name.
- **Expected:** A breadcrumb trail is shown (e.g., "Page / AccountDetailPage") providing navigation context. Clicking the breadcrumb navigates back to the AccountsPage.

**Test: AccountHeader New Transaction button opens NewTransactionModal**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account.
- **Action:** User clicks the "New Transaction" button displayed in the upper-right area of the header.
- **Expected:** The NewTransactionModal dialog opens, overlaying the current page. The modal allows the user to record a new transaction. The button displays the text "New Transaction" with a filled/prominent style.

**Test: AccountHeader search bar filters transactions**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account with multiple transactions visible.
- **Action:** User types "Grocery" into the search bar in the top navigation area.
- **Expected:** The transactions list is filtered to show only transactions matching the search term "Grocery" (e.g., "Grocery Store"). Non-matching transactions are hidden.

**Test: AccountHeader search bar clears and restores all transactions**
- **Initial state:** User has typed "Grocery" into the search bar and the list is filtered.
- **Action:** User clears the search bar text.
- **Expected:** All transactions are displayed again without any filtering applied.

#### Component: BudgetOverview

**Test: BudgetOverview displays section heading**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account.
- **Action:** User observes the Budget Overview section below the account header.
- **Expected:** The heading "Budget Overview" is displayed at the top of the section.

**Test: BudgetOverview displays actual and budgeted amounts**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account with budget data.
- **Action:** User observes the Budget Overview section.
- **Expected:** The text "Actual: $4,500 / Budgeted: $5,000" (or equivalent amounts for the account) is displayed, showing the actual spending compared to the budgeted amount.

**Test: BudgetOverview displays percentage used**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account with budget data.
- **Action:** User observes the right side of the Budget Overview section.
- **Expected:** The text "90% used" is displayed on the right side, showing the percentage of budget consumed.

**Test: BudgetOverview displays progress bar**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account with budget data.
- **Action:** User observes the Budget Overview section.
- **Expected:** A horizontal progress bar is displayed between the heading and the amounts text. The bar is filled to approximately 90%, visually representing the ratio of actual spending ($4,500) to budgeted amount ($5,000). The bar uses a colored fill (e.g., green/blue) against a lighter background.

**Test: BudgetOverview progress bar color changes when budget is nearly exceeded**
- **Initial state:** User is on the AccountDetailPage for an account where actual spending is at or above 90% of the budget.
- **Action:** User observes the Budget Overview progress bar.
- **Expected:** The progress bar fill color indicates a warning state (e.g., orange or red tint) when the budget is nearly or fully consumed, providing a visual alert to the user.

**Test: BudgetOverview progress bar for under-budget account**
- **Initial state:** User is on the AccountDetailPage for an account where actual spending is well below the budget (e.g., 40%).
- **Action:** User observes the Budget Overview section.
- **Expected:** The progress bar is partially filled (e.g., 40%), the percentage text reflects the lower usage, and the bar color indicates a healthy/normal state (e.g., green or blue).

#### Component: TransactionsTab

**Test: TransactionsTab is active by default**
- **Initial state:** User navigates to the AccountDetailPage for the "Main Checking" account.
- **Action:** User observes the tabbed section below the Budget Overview.
- **Expected:** Two tabs are visible: "Transactions" and "Budget Details". The "Transactions" tab is active/selected by default, indicated by an underline or highlighted style. The transactions table is displayed.

**Test: TransactionsTab displays table with correct column headers**
- **Initial state:** User is on the AccountDetailPage with the "Transactions" tab active.
- **Action:** User observes the transactions table.
- **Expected:** The table displays five column headers: "Date", "Description", "Amount", "Direction", and "Actions".

**Test: TransactionsTab displays transaction rows with correct data**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account with seeded transactions.
- **Action:** User observes the transaction rows in the table.
- **Expected:** Transaction rows are displayed with correct data. For example: row 1 shows "Oct 25, 2023", "Grocery Store", "$125.50", "Debit"; row 2 shows "Oct 24, 2023", "Salary Deposit", "$3,200.00", "Credit"; row 3 shows "Oct 22, 2023", "Electric Bill", "$85.00", "Debit". Transactions are ordered by date descending (most recent first).

**Test: TransactionsTab View/Edit link opens transaction details**
- **Initial state:** User is on the AccountDetailPage with the "Transactions" tab active and transaction rows visible.
- **Action:** User clicks the "View/Edit" link in the Actions column of the "Grocery Store" transaction row.
- **Expected:** The NewTransactionModal opens pre-populated with the transaction details (date: Oct 25, 2023; description: Grocery Store; amount: $125.50; affected accounts with debit/credit allocations), allowing the user to view or edit the transaction.

**Test: TransactionsTab View/Edit link for credit transaction**
- **Initial state:** User is on the AccountDetailPage with the "Transactions" tab active.
- **Action:** User clicks the "View/Edit" link for the "Salary Deposit" transaction (a Credit transaction).
- **Expected:** The NewTransactionModal opens pre-populated with the Salary Deposit transaction details (date: Oct 24, 2023; description: Salary Deposit; amount: $3,200.00; direction: Credit), allowing the user to view or edit it.

**Test: TransactionsTab switching to Budget Details tab**
- **Initial state:** User is on the AccountDetailPage with the "Transactions" tab active.
- **Action:** User clicks the "Budget Details" tab.
- **Expected:** The "Budget Details" tab becomes active/selected (underlined/highlighted). The transactions table is hidden and the budget details content is displayed instead. The "Transactions" tab loses its active styling.

**Test: TransactionsTab switching back from Budget Details**
- **Initial state:** User is on the AccountDetailPage with the "Budget Details" tab active.
- **Action:** User clicks the "Transactions" tab.
- **Expected:** The "Transactions" tab becomes active again. The transactions table is displayed with all transaction rows. The "Budget Details" tab loses its active styling.

**Test: TransactionsTab displays debit direction styling**
- **Initial state:** User is on the AccountDetailPage with the "Transactions" tab active.
- **Action:** User observes a transaction row with Direction "Debit" (e.g., "Grocery Store").
- **Expected:** The Direction column displays the text "Debit" for outgoing transactions.

**Test: TransactionsTab displays credit direction styling**
- **Initial state:** User is on the AccountDetailPage with the "Transactions" tab active.
- **Action:** User observes the "Salary Deposit" transaction row.
- **Expected:** The Direction column displays the text "Credit" for incoming transactions.

**Test: TransactionsTab empty state when no transactions exist**
- **Initial state:** User navigates to the AccountDetailPage for a newly created account with no transactions.
- **Action:** User observes the Transactions tab content.
- **Expected:** An empty state message is displayed (e.g., "No transactions found") indicating that no transactions have been recorded for this account yet.

#### Component: BudgetDetailsTab

**Test: BudgetDetailsTab displays budget line items**
- **Initial state:** User is on the AccountDetailPage and clicks the "Budget Details" tab.
- **Action:** User observes the budget details content.
- **Expected:** Individual budget line items are displayed. Each line item shows a name and the actual vs budgeted amounts. For example: "Rent: $1,500 / $1,500", "Utilities: $200 / $250".

**Test: BudgetDetailsTab displays progress bar for each line item**
- **Initial state:** User is on the AccountDetailPage with the "Budget Details" tab active and budget line items visible.
- **Action:** User observes the progress bars next to each budget line item.
- **Expected:** Each budget line item has a horizontal progress bar showing the ratio of actual to budgeted amounts. "Rent: $1,500 / $1,500" shows a fully filled (100%) progress bar. "Utilities: $200 / $250" shows an 80% filled progress bar.

**Test: BudgetDetailsTab progress bar indicates over-budget items**
- **Initial state:** User is on the AccountDetailPage with the "Budget Details" tab active. One line item has actual spending exceeding the budget (e.g., "Progress: $700 / $100").
- **Action:** User observes the over-budget line item.
- **Expected:** The progress bar for the over-budget item extends beyond 100% or uses a distinct color (e.g., red) to indicate that actual spending ($700) has exceeded the budgeted amount ($100). The amounts text clearly shows the overspend.

**Test: BudgetDetailsTab shows all budget categories for account**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account with the "Budget Details" tab active.
- **Action:** User observes all budget line items.
- **Expected:** All budget items assigned to this account are listed, including at minimum: "Rent" ($1,500 / $1,500), "Utilities" ($200 / $250), and "Progress" ($700 / $100). Each item has its name, actual/budgeted values, and a progress bar.

**Test: BudgetDetailsTab item amounts reflect transaction data**
- **Initial state:** User records a new transaction that affects a budget line item (e.g., a $50 utilities payment).
- **Action:** User navigates to the AccountDetailPage and clicks the "Budget Details" tab.
- **Expected:** The "Utilities" line item actual amount has increased by $50 (e.g., from $200 to $250), and its progress bar updates to reflect the new ratio. The Budget Overview section also updates accordingly.

#### Component: ReportingLinks

**Test: ReportingLinks displays section heading**
- **Initial state:** User is on the AccountDetailPage for any account.
- **Action:** User scrolls down to the Reporting section at the bottom of the page.
- **Expected:** The heading "Reporting" is displayed at the top of the section.

**Test: ReportingLinks displays Actual vs Budget Report link**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account.
- **Action:** User observes the Reporting section.
- **Expected:** A clickable link labeled "Actual vs Budget Report" is displayed in the Reporting section.

**Test: ReportingLinks Actual vs Budget Report link navigates to report**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account.
- **Action:** User clicks the "Actual vs Budget Report" link.
- **Expected:** The app navigates to the CreateReportDialog or generates a report pre-configured to show the Actual vs Budget comparison for the "Main Checking" account. The report type is set to "Budget vs Actual" and the account is pre-selected.

**Test: ReportingLinks displays Transaction History Report link**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account.
- **Action:** User observes the Reporting section.
- **Expected:** A clickable link labeled "Transaction History Report" is displayed in the Reporting section, next to the "Actual vs Budget Report" link.

**Test: ReportingLinks Transaction History Report link navigates to report**
- **Initial state:** User is on the AccountDetailPage for the "Main Checking" account.
- **Action:** User clicks the "Transaction History Report" link.
- **Expected:** The app navigates to the CreateReportDialog or generates a report pre-configured to show the Transaction History for the "Main Checking" account. The report type is set to "Detailed Transactions" and the account is pre-selected.

---

## Page: NewTransactionModal

### Components: TransactionHeaderFields, LineItemsTable, BalanceIndicator, TagsInput

<!-- Tests to be added by PlanPageNewTransactionModal -->

---

## Page: CreateReportDialog

### Components: ReportTypeSelector, DateRangeSelector, AccountCategoryFilter, ReportPreview

<!-- Tests to be added by PlanPageCreateReportDialog -->

---

## Page: ReportDetails

### Components: ReportHeader, VarianceSummary, VarianceChart, DetailedReportTable

<!-- Tests to be added by PlanPageReportDetails -->

---

## Page: ReportList

### Components: ReportListHeader, ReportTable

<!-- Tests to be added by PlanPageReportList -->
