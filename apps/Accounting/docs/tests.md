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

<!-- Tests to be added by PlanPageAccountDetailPage -->

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
