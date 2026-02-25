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

#### Modal-level tests

**Test: NewTransactionModal displays title and close button**
- **Initial state:** User clicks the "+ New Transaction" button from the NavBar or AccountDetailPage.
- **Action:** User observes the modal that opens.
- **Expected:** A modal dialog overlays the page with the title "New Transaction" at the top. An "X" close button is displayed in the top-right corner of the modal.

**Test: NewTransactionModal X button closes modal**
- **Initial state:** The NewTransactionModal is open.
- **Action:** User clicks the "X" close button in the top-right corner of the modal.
- **Expected:** The modal closes and the user returns to the underlying page. No transaction is saved.

**Test: NewTransactionModal Cancel button closes modal without saving**
- **Initial state:** The NewTransactionModal is open with some fields filled in (date, description, line items).
- **Action:** User clicks the "Cancel" button at the bottom of the modal.
- **Expected:** The modal closes without saving any data. No new transaction is created. The underlying page is unchanged.

**Test: NewTransactionModal Save Transaction button saves transaction**
- **Initial state:** The NewTransactionModal is open with valid data: date "Oct 26, 2023", description "October Rent & Utilities Payment", currency "USD ($)", two line items (Checking Account Credit $1,500.00 and Rent Expense Debit $1,500.00), and the transaction is balanced.
- **Action:** User clicks the "Save Transaction" button.
- **Expected:** The transaction is saved. The modal closes. The new transaction appears in the transaction lists of all affected accounts (Checking Account and Rent Expense). Account balances are updated to reflect the new transaction.

**Test: NewTransactionModal saved transaction appears in affected account transaction lists**
- **Initial state:** User has just saved a transaction with line items affecting "Checking Account" (Credit $1,500.00) and "Rent Expense" (Debit $1,500.00).
- **Action:** User navigates to the AccountDetailPage for "Checking Account" and observes the Transactions tab.
- **Expected:** The newly saved transaction appears in the transactions list with the correct date, description "October Rent & Utilities Payment", amount "$1,500.00", and direction "Credit". Navigating to "Rent Expense" AccountDetailPage also shows the transaction with direction "Debit" and amount "$1,350.00".

**Test: NewTransactionModal opens in edit mode with pre-populated fields**
- **Initial state:** User is on the AccountDetailPage with the Transactions tab active and clicks "View/Edit" on an existing transaction.
- **Action:** User observes the modal that opens.
- **Expected:** The NewTransactionModal opens with all fields pre-populated from the existing transaction: date, description, currency, all line items (accounts, types, amounts), and tags. The user can modify any field and save the changes.

**Test: NewTransactionModal editing a transaction updates existing record**
- **Initial state:** The NewTransactionModal is open in edit mode for an existing transaction. The user changes the description from "Grocery Store" to "Grocery Store - Weekly".
- **Action:** User clicks the "Save Transaction" button.
- **Expected:** The existing transaction is updated (not duplicated). The transaction list shows the updated description "Grocery Store - Weekly". Account balances remain correct.

**Test: NewTransactionModal Cancel and Save buttons positioned at bottom right**
- **Initial state:** The NewTransactionModal is open.
- **Action:** User observes the bottom of the modal.
- **Expected:** Two buttons are displayed at the bottom-right: "Cancel" (secondary/outline style) on the left and "Save Transaction" (primary/filled blue style) on the right.

#### Component: TransactionHeaderFields

**Test: TransactionHeaderFields displays Date field with calendar icon**
- **Initial state:** The NewTransactionModal is open (new transaction).
- **Action:** User observes the top row of form fields in the modal.
- **Expected:** A "Date" label is displayed above a date input field. The field shows a calendar icon on the left side and a date value (defaulting to today's date for new transactions). The date is displayed in "MMM DD, YYYY" format (e.g., "Oct 26, 2023").

**Test: TransactionHeaderFields Date picker allows selecting a date**
- **Initial state:** The NewTransactionModal is open with the date field showing "Oct 26, 2023".
- **Action:** User clicks on the Date field to open the date picker.
- **Expected:** A date picker calendar opens, allowing the user to select a different date. After selecting "Nov 15, 2023", the date field updates to show "Nov 15, 2023".

**Test: TransactionHeaderFields displays Description input with placeholder**
- **Initial state:** The NewTransactionModal is open (new transaction) with the description field empty.
- **Action:** User observes the Description field.
- **Expected:** A "Description" label is displayed above a text input field. The field shows the placeholder text "Enter transaction description..." in a muted/gray color.

**Test: TransactionHeaderFields Description input accepts text**
- **Initial state:** The NewTransactionModal is open with the Description field empty.
- **Action:** User types "October Rent & Utilities Payment" into the Description field.
- **Expected:** The text "October Rent & Utilities Payment" is displayed in the Description field, replacing the placeholder text.

**Test: TransactionHeaderFields displays Currency dropdown with default value**
- **Initial state:** The NewTransactionModal is open (new transaction).
- **Action:** User observes the Currency dropdown field.
- **Expected:** A "Currency" label is displayed above a dropdown select. The dropdown shows "USD ($)" as the default selected value with a downward chevron icon indicating it is a dropdown.

**Test: TransactionHeaderFields Currency dropdown allows selecting other currencies**
- **Initial state:** The NewTransactionModal is open with Currency set to "USD ($)".
- **Action:** User clicks the Currency dropdown.
- **Expected:** A dropdown menu opens showing available currency options (e.g., "USD ($)", "EUR (€)", "GBP (£)", "JPY (¥)"). The user can select a different currency, and the dropdown updates to show the selected value.

**Test: TransactionHeaderFields layout shows Date, Description, Currency in a single row**
- **Initial state:** The NewTransactionModal is open.
- **Action:** User observes the header fields layout.
- **Expected:** The Date, Description, and Currency fields are arranged in a single horizontal row at the top of the modal, in that order from left to right. The Description field is the widest, occupying the most horizontal space.

#### Component: LineItemsTable

**Test: LineItemsTable displays section heading**
- **Initial state:** The NewTransactionModal is open.
- **Action:** User observes the area below the header fields.
- **Expected:** The heading "Transaction Details (Line Items)" is displayed above the line items table.

**Test: LineItemsTable displays column headers**
- **Initial state:** The NewTransactionModal is open.
- **Action:** User observes the line items table header row.
- **Expected:** Three column headers are displayed: "Account", "Type", and "Amount". A fourth unlabeled column contains the delete (trash) icon buttons.

**Test: LineItemsTable Account dropdown shows accounts with codes**
- **Initial state:** The NewTransactionModal is open with at least one line item row.
- **Action:** User clicks the Account dropdown on a line item row.
- **Expected:** A dropdown menu opens showing all available accounts with their account codes in parentheses (e.g., "Checking Account (1010)", "Rent Expense (5010)", "Savings Account (1020)"). The user can select an account from the list.

**Test: LineItemsTable Account dropdown placeholder for empty row**
- **Initial state:** The NewTransactionModal is open and a new empty line item row exists.
- **Action:** User observes the Account dropdown on the empty row.
- **Expected:** The Account dropdown displays the placeholder text "Select Account" in a muted/gray color, indicating no account has been selected yet.

**Test: LineItemsTable Type dropdown has Credit and Debit options**
- **Initial state:** The NewTransactionModal is open with a line item row.
- **Action:** User clicks the Type dropdown on a line item row.
- **Expected:** A dropdown menu opens with exactly two options: "Credit" and "Debit". The user can select either option.

**Test: LineItemsTable Type dropdown defaults to Debit for new rows**
- **Initial state:** The NewTransactionModal is open.
- **Action:** User clicks the "+ Add Line Item" button to add a new row.
- **Expected:** The new line item row appears with the Type dropdown defaulted to "Debit".

**Test: LineItemsTable Amount input accepts numeric values**
- **Initial state:** The NewTransactionModal is open with a line item row.
- **Action:** User types "1500.00" into the Amount input field.
- **Expected:** The Amount field displays "1,500.00" (or "1500.00"). The field accepts decimal numeric values for dollar amounts.

**Test: LineItemsTable delete row button removes line item**
- **Initial state:** The NewTransactionModal is open with three line item rows: Checking Account (Credit $1,500.00), Rent Expense (Debit $1,350.00), and an empty row (Debit $150.00).
- **Action:** User clicks the trash icon button on the third (empty account) row.
- **Expected:** The third line item row is removed from the table. Only two rows remain: Checking Account and Rent Expense. The BalanceIndicator totals update to reflect the removal.

**Test: LineItemsTable Add Line Item button adds new row**
- **Initial state:** The NewTransactionModal is open with two line item rows.
- **Action:** User clicks the "+ Add Line Item" button displayed below the existing rows.
- **Expected:** A new empty line item row is appended to the bottom of the table. The new row has an empty Account dropdown ("Select Account"), Type dropdown defaulted to "Debit", an empty Amount field, and a trash icon delete button. The "+ Add Line Item" button text displays a plus icon followed by the text "Add Line Item".

**Test: LineItemsTable supports multiple line items for multi-account transactions**
- **Initial state:** The NewTransactionModal is open with no line items.
- **Action:** User clicks "+ Add Line Item" three times and fills in: row 1 as "Checking Account (1010)" / Credit / 1,500.00; row 2 as "Rent Expense (5010)" / Debit / 1,350.00; row 3 as "Utilities Expense (5020)" / Debit / 150.00.
- **Expected:** All three rows are displayed in the table with the correct account selections, types, and amounts. The BalanceIndicator shows Total Debits: $1,500.00 and Total Credits: $1,500.00.

**Test: LineItemsTable initial state for new transaction has two empty rows**
- **Initial state:** User clicks "+ New Transaction" to open a fresh NewTransactionModal.
- **Action:** User observes the line items table.
- **Expected:** The table starts with two empty line item rows by default, each with an empty Account dropdown, Type dropdown, and Amount field, enabling the user to immediately enter a balanced double-entry transaction.

**Test: LineItemsTable changing account on existing row updates selection**
- **Initial state:** The NewTransactionModal is open with a line item row showing "Checking Account (1010)".
- **Action:** User clicks the Account dropdown on that row and selects "Savings Account (1020)".
- **Expected:** The Account dropdown updates to display "Savings Account (1020)". The Type and Amount values remain unchanged.

#### Component: BalanceIndicator

**Test: BalanceIndicator displays Total Debits sum**
- **Initial state:** The NewTransactionModal is open with line items: Rent Expense (Debit $1,350.00) and Utilities Expense (Debit $150.00).
- **Action:** User observes the balance summary area below the line items table.
- **Expected:** The text "Total Debits:" is displayed followed by "$1,500.00" on the left side of the balance area. The total is the sum of all line items with Type "Debit".

**Test: BalanceIndicator displays Total Credits sum**
- **Initial state:** The NewTransactionModal is open with a line item: Checking Account (Credit $1,500.00).
- **Action:** User observes the balance summary area below the line items table.
- **Expected:** The text "Total Credits:" is displayed followed by "$1,500.00" to the right of the Total Debits display. The total is the sum of all line items with Type "Credit".

**Test: BalanceIndicator shows balanced state when debits equal credits**
- **Initial state:** The NewTransactionModal is open with Total Debits = $1,500.00 and Total Credits = $1,500.00.
- **Action:** User observes the right side of the balance area.
- **Expected:** A green checkmark icon is displayed followed by the text "Transaction is Balanced" in green. This indicates the transaction satisfies double-entry accounting rules.

**Test: BalanceIndicator shows unbalanced state when debits do not equal credits**
- **Initial state:** The NewTransactionModal is open with Total Debits = $1,350.00 and Total Credits = $1,500.00 (a $150.00 imbalance).
- **Action:** User observes the right side of the balance area.
- **Expected:** A warning/error icon (e.g., red X or exclamation) is displayed followed by the text "Transaction is Unbalanced" in red/error color. This indicates the transaction does not balance.

**Test: BalanceIndicator updates dynamically when line items change**
- **Initial state:** The NewTransactionModal is open with Total Debits = $1,350.00 and Total Credits = $1,500.00 (unbalanced, showing "Transaction is Unbalanced").
- **Action:** User changes the Rent Expense Debit amount from $1,350.00 to $1,500.00.
- **Expected:** The Total Debits updates to "$1,500.00". The indicator changes from "Transaction is Unbalanced" (red) to "Transaction is Balanced" (green checkmark) in real time without needing to click save.

**Test: BalanceIndicator validation prevents saving unbalanced transaction**
- **Initial state:** The NewTransactionModal is open with Total Debits = $1,350.00 and Total Credits = $1,500.00 (unbalanced).
- **Action:** User clicks the "Save Transaction" button.
- **Expected:** The transaction is NOT saved. The "Save Transaction" button is either disabled while the transaction is unbalanced, or clicking it shows a validation error message indicating that the transaction must be balanced before saving. The modal remains open.

**Test: BalanceIndicator shows zero totals for empty line items**
- **Initial state:** The NewTransactionModal is open with empty line item rows (no amounts entered).
- **Action:** User observes the balance area.
- **Expected:** Total Debits shows "$0.00" and Total Credits shows "$0.00". The indicator shows "Transaction is Balanced" (since $0.00 = $0.00) or a neutral state prompting the user to add line items.

**Test: BalanceIndicator updates when a line item row is deleted**
- **Initial state:** The NewTransactionModal has three line items: Checking Account (Credit $1,500.00), Rent Expense (Debit $1,350.00), Utilities (Debit $150.00). Total Debits = $1,500.00, Total Credits = $1,500.00, showing "Transaction is Balanced".
- **Action:** User clicks the trash icon to delete the Utilities row ($150.00 Debit).
- **Expected:** Total Debits updates to "$1,350.00". Total Credits remains "$1,500.00". The indicator changes to "Transaction is Unbalanced" (red).

#### Component: TagsInput

**Test: TagsInput displays label with optional indicator**
- **Initial state:** The NewTransactionModal is open.
- **Action:** User observes the Tags / Categories section below the balance area.
- **Expected:** The label "Tags / Categories" is displayed with the text "(optional)" in a muted/lighter style next to it, indicating this field is not required to save the transaction.

**Test: TagsInput displays existing tags as removable chips**
- **Initial state:** The NewTransactionModal is open in edit mode for a transaction that has tags "Housing" and "Recurring".
- **Action:** User observes the Tags / Categories input area.
- **Expected:** Two tag chips are displayed inside the input area: "Housing" with an "×" remove button, and "Recurring" with an "×" remove button. Each chip has a colored background to distinguish it from the input area.

**Test: TagsInput add a new tag by typing**
- **Initial state:** The NewTransactionModal is open with no tags added.
- **Action:** User clicks on the tags input area and types "Housing" followed by pressing Enter (or comma).
- **Expected:** A new tag chip "Housing" with an "×" remove button appears inside the input area. The text input is cleared, ready for the user to type another tag.

**Test: TagsInput remove a tag by clicking X**
- **Initial state:** The NewTransactionModal is open with two tags: "Housing" and "Recurring".
- **Action:** User clicks the "×" button on the "Housing" tag chip.
- **Expected:** The "Housing" tag is removed from the input area. Only the "Recurring" tag chip remains. The removed tag is no longer associated with the transaction.

**Test: TagsInput allows adding multiple tags**
- **Initial state:** The NewTransactionModal is open with no tags.
- **Action:** User adds three tags in sequence: "Housing", "Recurring", and "October".
- **Expected:** Three tag chips are displayed in the input area: "Housing ×", "Recurring ×", and "October ×". All three tags will be saved with the transaction.

**Test: TagsInput field is optional and transaction saves without tags**
- **Initial state:** The NewTransactionModal is open with all required fields filled (date, description, balanced line items) but no tags added.
- **Action:** User clicks "Save Transaction".
- **Expected:** The transaction is saved successfully without any tags. The modal closes. The transaction is recorded with an empty tags list.

**Test: TagsInput tags are persisted with saved transaction**
- **Initial state:** The NewTransactionModal is open with tags "Housing" and "Recurring" added, and all other fields valid.
- **Action:** User clicks "Save Transaction", then later opens the same transaction via "View/Edit".
- **Expected:** The NewTransactionModal opens in edit mode with the tags "Housing" and "Recurring" displayed as chips, confirming tags were persisted with the transaction.

---

## Page: CreateReportDialog

### Components: ReportTypeSelector, DateRangeSelector, AccountCategoryFilter, ReportPreview

#### Dialog-level tests

**Test: CreateReportDialog displays title and subtitle**
- **Initial state:** User clicks the "Generate Reports" button from the AccountsPage or a reporting link from the AccountDetailPage.
- **Action:** User observes the dialog that opens.
- **Expected:** A modal dialog overlays the page with the title "Create New Report" at the top. Below the title, a subtitle reads "Configure parameters to generate a financial report based on accounts and transactions." An "X" close button is displayed in the top-right corner of the dialog.

**Test: CreateReportDialog two-panel layout**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the dialog layout.
- **Expected:** The dialog is divided into two panels side by side. The left panel is titled "Report Settings" and contains the Report Type selector, Date Range pickers, and Filter Accounts & Categories tree. The right panel displays the "Report Preview" with a table showing report data based on the current settings.

**Test: CreateReportDialog X button closes dialog**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User clicks the "X" close button in the top-right corner.
- **Expected:** The dialog closes and the user returns to the underlying page. No report is generated.

**Test: CreateReportDialog Cancel button closes dialog without generating**
- **Initial state:** The CreateReportDialog is open with some settings configured (e.g., report type selected, dates set).
- **Action:** User clicks the "Cancel" button at the bottom-right of the dialog.
- **Expected:** The dialog closes without generating a report. No new report appears in the ReportList. The underlying page is unchanged.

**Test: CreateReportDialog Generate Report button creates report and closes dialog**
- **Initial state:** The CreateReportDialog is open with valid settings: report type "Budget vs. Actual (Comparison)", date range Oct 1–31, 2023, all categories selected.
- **Action:** User clicks the "Generate Report" button (blue primary button) at the bottom-right of the dialog.
- **Expected:** The report is generated and saved. The dialog closes. The new report appears in the ReportList page with the correct report type, date range, and category filters. The user can navigate to the ReportDetails page to view the full report.

**Test: CreateReportDialog Generate Report button disabled when dates are missing**
- **Initial state:** The CreateReportDialog is open with a report type selected but no start date or end date entered.
- **Action:** User observes the "Generate Report" button.
- **Expected:** The "Generate Report" button is disabled (grayed out or unclickable) because required date fields are not filled.

**Test: CreateReportDialog Cancel and Generate Report button positions**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the bottom of the dialog.
- **Expected:** Two buttons are displayed at the bottom-right: "Cancel" (secondary/outline style) on the left and "Generate Report" (primary blue style) on the right.

**Test: CreateReportDialog opened from AccountDetailPage reporting link pre-selects report type**
- **Initial state:** User is on the AccountDetailPage for "Main Checking" and clicks the "Actual vs Budget Report" link in the Reporting section.
- **Action:** User observes the CreateReportDialog that opens.
- **Expected:** The dialog opens with the "Budget vs. Actual (Comparison)" report type pre-selected. The account category filter may be pre-configured to include the relevant category for the Main Checking account.

#### Component: ReportTypeSelector

**Test: ReportTypeSelector displays three report type tabs**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the "Report Type" section in the left panel under "Report Settings".
- **Expected:** Three tab-style buttons are displayed in a horizontal row: "Summary Overview", "Detailed Transactions", and "Budget vs. Actual (Comparison)". Each tab has a distinct icon above its label. The tabs are clearly labeled and visually distinct from each other.

**Test: ReportTypeSelector Summary Overview tab has document icon**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the "Summary Overview" tab.
- **Expected:** The "Summary Overview" tab displays a document/page icon above the text "Summary Overview". The tab is rendered as a clickable button with a border.

**Test: ReportTypeSelector Detailed Transactions tab has list icon**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the "Detailed Transactions" tab.
- **Expected:** The "Detailed Transactions" tab displays a list/detail icon above the text "Detailed Transactions". The tab is rendered as a clickable button with a border.

**Test: ReportTypeSelector Budget vs Actual tab has comparison icon**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the "Budget vs. Actual (Comparison)" tab.
- **Expected:** The "Budget vs. Actual (Comparison)" tab displays a comparison/chart icon above the text "Budget vs. Actual (Comparison)". The tab is rendered as a clickable button with a border.

**Test: ReportTypeSelector default selection**
- **Initial state:** The CreateReportDialog is freshly opened (not pre-configured from a reporting link).
- **Action:** User observes which report type tab is selected.
- **Expected:** The "Summary Overview" tab is selected by default, indicated by a highlighted/active visual style (e.g., blue border and background tint) distinguishing it from the unselected tabs.

**Test: ReportTypeSelector clicking Budget vs Actual selects it**
- **Initial state:** The CreateReportDialog is open with "Summary Overview" selected (default).
- **Action:** User clicks the "Budget vs. Actual (Comparison)" tab.
- **Expected:** The "Budget vs. Actual (Comparison)" tab becomes highlighted/active (blue border and background tint). The "Summary Overview" tab loses its active styling. Only one tab is selected at a time.

**Test: ReportTypeSelector clicking Detailed Transactions selects it**
- **Initial state:** The CreateReportDialog is open with "Budget vs. Actual (Comparison)" selected.
- **Action:** User clicks the "Detailed Transactions" tab.
- **Expected:** The "Detailed Transactions" tab becomes highlighted/active. The "Budget vs. Actual (Comparison)" tab loses its active styling. Only one tab is selected at a time.

**Test: ReportTypeSelector clicking Summary Overview selects it**
- **Initial state:** The CreateReportDialog is open with "Detailed Transactions" selected.
- **Action:** User clicks the "Summary Overview" tab.
- **Expected:** The "Summary Overview" tab becomes highlighted/active. The "Detailed Transactions" tab loses its active styling. Only one tab is selected at a time.

**Test: ReportTypeSelector selection updates preview title**
- **Initial state:** The CreateReportDialog is open with "Summary Overview" selected and a date range of Oct 2023.
- **Action:** User clicks the "Budget vs. Actual (Comparison)" tab.
- **Expected:** The Report Preview panel title updates from "Report Preview (Summary Overview - Oct 2023)" to "Report Preview (Budget vs. Actual - Oct 2023)" to reflect the newly selected report type. The preview table content also updates to show budget vs. actual comparison columns.

**Test: ReportTypeSelector selection persists until changed**
- **Initial state:** The CreateReportDialog is open with "Detailed Transactions" selected.
- **Action:** User changes the date range and category filters without clicking a different report type tab.
- **Expected:** The "Detailed Transactions" tab remains selected/active throughout. The report type selection is independent of other settings changes.

#### Component: DateRangeSelector

**Test: DateRangeSelector displays Date Range heading**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the date range section below the Report Type selector in the left panel.
- **Expected:** The heading "Date Range" is displayed at the top of the section.

**Test: DateRangeSelector displays Start Date and End Date pickers side by side**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the date range inputs.
- **Expected:** Two date picker fields are displayed side by side in a single row. The left field is labeled "Start Date" and the right field is labeled "End Date". Each field has a calendar icon on the left side of the input.

**Test: DateRangeSelector Start Date picker allows selecting a date**
- **Initial state:** The CreateReportDialog is open with the Start Date field empty or showing a default.
- **Action:** User clicks on the Start Date field and selects "Oct 1, 2023" from the date picker calendar.
- **Expected:** The Start Date field updates to display "Oct 1, 2023". The date picker calendar closes after selection.

**Test: DateRangeSelector End Date picker allows selecting a date**
- **Initial state:** The CreateReportDialog is open with the End Date field empty or showing a default.
- **Action:** User clicks on the End Date field and selects "Oct 31, 2023" from the date picker calendar.
- **Expected:** The End Date field updates to display "Oct 31, 2023". The date picker calendar closes after selection.

**Test: DateRangeSelector displays three preset buttons**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the area below the Start Date and End Date pickers.
- **Expected:** Three preset buttons are displayed in a horizontal row: "This Month", "Last Quarter", and "YTD". The buttons are evenly spaced and styled as secondary/outline buttons.

**Test: DateRangeSelector This Month button sets dates to current month**
- **Initial state:** The CreateReportDialog is open with empty or different date values. The current date is in October 2023.
- **Action:** User clicks the "This Month" preset button.
- **Expected:** The Start Date field updates to the first day of the current month (e.g., "Oct 1, 2023") and the End Date field updates to the last day of the current month (e.g., "Oct 31, 2023"). Both date fields reflect the change immediately.

**Test: DateRangeSelector Last Quarter button sets dates to previous quarter**
- **Initial state:** The CreateReportDialog is open with empty or different date values. The current date is in October 2023 (Q4).
- **Action:** User clicks the "Last Quarter" preset button.
- **Expected:** The Start Date field updates to the first day of the previous quarter (e.g., "Jul 1, 2023") and the End Date field updates to the last day of the previous quarter (e.g., "Sep 30, 2023"). Both date fields reflect the change immediately.

**Test: DateRangeSelector YTD button sets dates to year-to-date**
- **Initial state:** The CreateReportDialog is open with empty or different date values. The current date is Oct 15, 2023.
- **Action:** User clicks the "YTD" preset button.
- **Expected:** The Start Date field updates to "Jan 1, 2023" (first day of the current year) and the End Date field updates to the current date (e.g., "Oct 15, 2023"). Both date fields reflect the change immediately.

**Test: DateRangeSelector manual date entry overrides preset**
- **Initial state:** The CreateReportDialog is open. User has clicked "This Month" and dates show Oct 1–31, 2023.
- **Action:** User manually changes the Start Date to "Sep 15, 2023" by clicking the Start Date picker and selecting Sep 15.
- **Expected:** The Start Date field updates to "Sep 15, 2023". The End Date remains "Oct 31, 2023". The preset buttons do not remain visually highlighted since the dates no longer match any preset.

**Test: DateRangeSelector date changes update preview title**
- **Initial state:** The CreateReportDialog is open with "Budget vs. Actual (Comparison)" selected and dates set to Oct 1–31, 2023. The preview title shows "Report Preview (Budget vs. Actual - Oct 2023)".
- **Action:** User clicks the "Last Quarter" preset button, changing dates to Jul 1 – Sep 30, 2023.
- **Expected:** The Report Preview panel title updates to reflect the new date range (e.g., "Report Preview (Budget vs. Actual - Jul–Sep 2023)"). The preview table data refreshes to show data for the new date range.

**Test: DateRangeSelector calendar icon is displayed in date fields**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the Start Date and End Date input fields.
- **Expected:** Both date input fields display a calendar icon on the left side of the input, visually indicating they are date picker fields.

#### Component: AccountCategoryFilter

**Test: AccountCategoryFilter displays section heading**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the filter section below the Date Range in the left panel.
- **Expected:** The heading "Filter Accounts & Categories" is displayed at the top of the section.

**Test: AccountCategoryFilter displays five top-level category checkboxes**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the category tree within the filter section.
- **Expected:** Five top-level categories are listed vertically, each with a checkbox and an expand/collapse arrow: "Assets (All)", "Liabilities (All)", "Equity (All)", "Revenue (All)", and "Expenses (All)". All five checkboxes are checked by default.

**Test: AccountCategoryFilter all categories checked by default**
- **Initial state:** The CreateReportDialog is freshly opened.
- **Action:** User observes the checkboxes next to each category.
- **Expected:** All five category checkboxes (Assets, Liabilities, Equity, Revenue, Expenses) are checked/filled, indicating all categories are included in the report by default.

**Test: AccountCategoryFilter expand category reveals sub-categories**
- **Initial state:** The CreateReportDialog is open with the "Expenses" category collapsed (showing only "Expenses (All)").
- **Action:** User clicks the expand arrow next to "Expenses (All)".
- **Expected:** The Expenses category expands to reveal its sub-categories as indented items with individual checkboxes: "Operating Expenses", "Cost of Goods Sold", and "Non-Operating Expenses". The expand arrow rotates to indicate the expanded state.

**Test: AccountCategoryFilter collapse category hides sub-categories**
- **Initial state:** The CreateReportDialog is open with the "Expenses" category expanded, showing its sub-categories.
- **Action:** User clicks the collapse arrow next to "Expenses (All)".
- **Expected:** The sub-categories (Operating Expenses, Cost of Goods Sold, Non-Operating Expenses) are hidden. Only the "Expenses (All)" top-level item remains visible. The arrow rotates to indicate the collapsed state.

**Test: AccountCategoryFilter sub-category checkboxes are independently selectable**
- **Initial state:** The CreateReportDialog is open with "Expenses" expanded. All sub-categories are checked: "Operating Expenses" (checked), "Cost of Goods Sold" (checked), "Non-Operating Expenses" (checked).
- **Action:** User unchecks the "Non-Operating Expenses" checkbox.
- **Expected:** The "Non-Operating Expenses" checkbox becomes unchecked. "Operating Expenses" and "Cost of Goods Sold" remain checked. The parent "Expenses (All)" checkbox changes to an indeterminate/partial state (e.g., a dash or partial fill) indicating that not all sub-categories are selected.

**Test: AccountCategoryFilter unchecking parent unchecks all sub-categories**
- **Initial state:** The CreateReportDialog is open with "Expenses" expanded. Some or all sub-categories are checked.
- **Action:** User unchecks the "Expenses (All)" parent checkbox.
- **Expected:** All sub-categories under Expenses (Operating Expenses, Cost of Goods Sold, Non-Operating Expenses) become unchecked. The entire Expenses category is excluded from the report filter.

**Test: AccountCategoryFilter checking parent checks all sub-categories**
- **Initial state:** The CreateReportDialog is open with "Expenses" expanded. The "Expenses (All)" parent checkbox is unchecked and all sub-categories are unchecked.
- **Action:** User checks the "Expenses (All)" parent checkbox.
- **Expected:** All sub-categories under Expenses (Operating Expenses, Cost of Goods Sold, Non-Operating Expenses) become checked. The Expenses category with all sub-categories is included in the report filter.

**Test: AccountCategoryFilter checking all sub-categories fills parent checkbox**
- **Initial state:** The CreateReportDialog is open with "Expenses" expanded. "Operating Expenses" and "Cost of Goods Sold" are checked, but "Non-Operating Expenses" is unchecked. The parent shows an indeterminate state.
- **Action:** User checks the "Non-Operating Expenses" checkbox.
- **Expected:** The parent "Expenses (All)" checkbox transitions from the indeterminate state to a fully checked state, since all sub-categories are now selected.

**Test: AccountCategoryFilter unchecking a top-level category removes it from report**
- **Initial state:** The CreateReportDialog is open with all categories checked. The preview shows data for all categories.
- **Action:** User unchecks the "Liabilities (All)" checkbox.
- **Expected:** The "Liabilities (All)" checkbox becomes unchecked. The report preview updates to exclude Liabilities data. All other categories remain checked and their data remains in the preview.

**Test: AccountCategoryFilter Assets category is expandable with sub-categories**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User clicks the expand arrow next to "Assets (All)".
- **Expected:** The Assets category expands to reveal its sub-categories (e.g., Current Assets, Fixed Assets, or specific asset accounts) as indented items with individual checkboxes.

**Test: AccountCategoryFilter Include Zero Balance toggle is displayed**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the area below the category tree.
- **Expected:** A toggle switch is displayed with the label "Include Zero Balance Accounts" to its right. The toggle is in the off/disabled position by default.

**Test: AccountCategoryFilter Include Zero Balance toggle is off by default**
- **Initial state:** The CreateReportDialog is freshly opened.
- **Action:** User observes the "Include Zero Balance Accounts" toggle.
- **Expected:** The toggle switch is in the off position (e.g., gray/uncolored), meaning accounts with zero balance are excluded from the report by default.

**Test: AccountCategoryFilter Include Zero Balance toggle can be turned on**
- **Initial state:** The CreateReportDialog is open with the "Include Zero Balance Accounts" toggle off.
- **Action:** User clicks the "Include Zero Balance Accounts" toggle.
- **Expected:** The toggle switches to the on position (e.g., colored/active). Accounts with zero balance will now be included in the generated report. The preview may update to show additional rows for zero-balance accounts.

**Test: AccountCategoryFilter Include Zero Balance toggle can be turned off again**
- **Initial state:** The CreateReportDialog is open with the "Include Zero Balance Accounts" toggle on.
- **Action:** User clicks the "Include Zero Balance Accounts" toggle again.
- **Expected:** The toggle switches back to the off position. Zero-balance accounts are excluded from the report again.

**Test: AccountCategoryFilter category selection updates preview data**
- **Initial state:** The CreateReportDialog is open with all categories checked and the preview showing data for all categories.
- **Action:** User unchecks "Revenue (All)" and "Expenses (All)".
- **Expected:** The report preview table updates to exclude Revenue and Expenses data. Only rows related to Assets, Liabilities, and Equity remain visible in the preview.

#### Component: ReportPreview

**Test: ReportPreview displays dynamic title based on settings**
- **Initial state:** The CreateReportDialog is open with "Budget vs. Actual (Comparison)" report type selected and date range Oct 1–31, 2023.
- **Action:** User observes the right panel of the dialog.
- **Expected:** The preview panel title reads "Report Preview (Budget vs. Actual - Oct 2023)", dynamically reflecting the selected report type and date range.

**Test: ReportPreview displays Refresh Preview button**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the top-right area of the preview panel.
- **Expected:** A "Refresh Preview" button is displayed with a refresh/reload icon to its left and the text "Refresh Preview". The button is positioned to the right of the preview title.

**Test: ReportPreview Refresh Preview button refreshes data**
- **Initial state:** The CreateReportDialog is open with preview data showing. The user has changed settings (e.g., unchecked a category or changed dates) but the preview has not yet updated.
- **Action:** User clicks the "Refresh Preview" button.
- **Expected:** The preview table data refreshes to reflect the current settings. The table content updates with data matching the selected report type, date range, and category filters. A brief loading indicator may appear during the refresh.

**Test: ReportPreview table displays correct column headers for Budget vs Actual**
- **Initial state:** The CreateReportDialog is open with "Budget vs. Actual (Comparison)" report type selected.
- **Action:** User observes the preview table header row.
- **Expected:** The table displays five column headers: "Category / Account", "Budget", "Actual", "Variance", and "Variance %". The columns are arranged left to right in that order.

**Test: ReportPreview table displays summary rows**
- **Initial state:** The CreateReportDialog is open with "Budget vs. Actual (Comparison)" selected, date range Oct 2023, and all categories included.
- **Action:** User observes the preview table body.
- **Expected:** Three summary rows are displayed at the top of the table: "Total Revenue" (e.g., Budget $50,000, Actual $52,500, Variance $+2,500, Variance % +5.0%), "Total Expenses" (e.g., Budget $35,000, Actual $36,200, Variance $-1,200, Variance % -3.4%), and "Net Income" (e.g., Budget $15,000, Actual $16,300, Variance $+1,300, Variance % +8.7%). Summary rows are visually distinct (e.g., bold text).

**Test: ReportPreview table displays expandable account rows**
- **Initial state:** The CreateReportDialog is open with "Budget vs. Actual (Comparison)" selected and preview data loaded.
- **Action:** User observes the rows below the summary rows in the preview table.
- **Expected:** Individual account rows are displayed below the summary rows, such as "Sales Revenue" and "Rent Expense". Each expandable row has a collapse/expand chevron icon to the left of the account name. The account names are displayed as clickable links (blue/underlined text).

**Test: ReportPreview expand account row reveals sub-accounts**
- **Initial state:** The CreateReportDialog is open with the preview showing "Sales Revenue" as a collapsed row with a right-pointing chevron.
- **Action:** User clicks the expand chevron next to "Sales Revenue".
- **Expected:** The "Sales Revenue" row expands to reveal its sub-account or line-item rows indented below it. The chevron rotates to point downward, indicating the expanded state. Each sub-row shows its own Budget, Actual, Variance, and Variance % values.

**Test: ReportPreview collapse account row hides sub-accounts**
- **Initial state:** The CreateReportDialog preview shows "Sales Revenue" in an expanded state with sub-account rows visible.
- **Action:** User clicks the collapse chevron next to "Sales Revenue".
- **Expected:** The sub-account rows under "Sales Revenue" are hidden. Only the "Sales Revenue" summary row remains visible. The chevron rotates back to point right.

**Test: ReportPreview account name links navigate to AccountDetailPage**
- **Initial state:** The CreateReportDialog preview shows "Sales Revenue" as a clickable link.
- **Action:** User clicks the "Sales Revenue" link text.
- **Expected:** The dialog closes (or a new tab/window opens) and the user is navigated to the AccountDetailPage for the Sales Revenue account, where they can see all transactions and budget details for that account.

**Test: ReportPreview Rent Expense row displays correct data**
- **Initial state:** The CreateReportDialog is open with "Budget vs. Actual (Comparison)" selected and preview data loaded.
- **Action:** User observes the "Rent Expense" row in the preview table.
- **Expected:** The "Rent Expense" row shows Budget $45,000, Actual $47,000, Variance -$1,200, and Variance % -3.4%. The row has an expand chevron and the name is a clickable link.

**Test: ReportPreview positive variance displayed with plus sign**
- **Initial state:** The CreateReportDialog preview is showing data with positive variances.
- **Action:** User observes the Variance and Variance % columns for "Total Revenue".
- **Expected:** Positive variances are displayed with a "+" prefix (e.g., "$+2,500" and "+5.0%"), indicating favorable performance where actual exceeds budget.

**Test: ReportPreview negative variance displayed with minus sign**
- **Initial state:** The CreateReportDialog preview is showing data with negative variances.
- **Action:** User observes the Variance and Variance % columns for "Total Expenses".
- **Expected:** Negative variances are displayed with a "-" prefix (e.g., "$-1,200" and "-3.4%"), indicating unfavorable performance where actual exceeds budget for expense categories.

**Test: ReportPreview Cancel button at dialog bottom**
- **Initial state:** The CreateReportDialog is open.
- **Action:** User observes the bottom-right of the dialog, below the preview panel.
- **Expected:** A "Cancel" button (secondary/outline style) is displayed on the left side of the button group. Clicking it closes the dialog without generating a report.

**Test: ReportPreview Generate Report button at dialog bottom**
- **Initial state:** The CreateReportDialog is open with valid settings configured.
- **Action:** User observes the bottom-right of the dialog, below the preview panel.
- **Expected:** A "Generate Report" button (primary blue style) is displayed on the right side of the button group. Clicking it generates the report based on the current settings and closes the dialog.

**Test: ReportPreview empty state when no data matches filters**
- **Initial state:** The CreateReportDialog is open with all categories unchecked or a date range with no transactions.
- **Action:** User observes the preview table.
- **Expected:** The preview table shows an empty state message (e.g., "No data available for the selected filters") or displays the column headers with no data rows, indicating no matching data was found for the current filter configuration.

**Test: ReportPreview updates when report type changes**
- **Initial state:** The CreateReportDialog is open with "Budget vs. Actual (Comparison)" selected, showing columns Budget, Actual, Variance, Variance %.
- **Action:** User clicks the "Summary Overview" report type tab.
- **Expected:** The preview panel title updates to reflect "Summary Overview". The table columns and data update to match the summary report format, which may show different columns or aggregation levels than the budget vs. actual view.

**Test: ReportPreview updates when date range changes**
- **Initial state:** The CreateReportDialog is open with dates set to Oct 1–31, 2023 and preview showing Oct 2023 data.
- **Action:** User clicks the "YTD" preset button, changing dates to Jan 1 – Oct 15, 2023.
- **Expected:** The preview title updates to reflect the new date range. The table data refreshes to show year-to-date figures instead of just October. Budget and actual amounts reflect the cumulative YTD values.

---

## Page: ReportDetails

### Components: ReportHeader, VarianceSummary, VarianceChart, DetailedReportTable

<!-- Tests to be added by PlanPageReportDetails -->

---

## Page: ReportList

### Components: ReportListHeader, ReportTable

<!-- Tests to be added by PlanPageReportList -->
