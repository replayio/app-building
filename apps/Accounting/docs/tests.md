# Accounting Platform — Test Specification

## Page: AccountsPage

### Components: NavBar, AccountsOverviewHeader, CategorySection, AccountCard

#### Component: NavBar

**Test: NavBar displays logo and navigation links**
- **Initial state:** User is on the AccountsPage.
- **Action:** User observes the top navigation bar.
- **Expected:** The NavBar displays the "FINANCEWEB" logo on the left. Five navigation links are visible: "Dashboard", "Accounts", "Transactions", "Reports", and "Budgets". The "Accounts" link is visually highlighted/active since the user is on the AccountsPage. A breadcrumb trail shows "Home > Accounts" below the NavBar.

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

**Test: NavBar Transactions link navigates to TransactionsPage**
- **Initial state:** User is on the AccountsPage.
- **Action:** User clicks the "Transactions" link in the NavBar.
- **Expected:** The app navigates to the TransactionsPage. The "Transactions" link becomes highlighted/active.

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

**Test: BudgetDetailsTab empty state when no budget items exist**
- **Initial state:** User navigates to the AccountDetailPage for an account that has no budget items assigned.
- **Action:** User clicks the "Budget Details" tab.
- **Expected:** An empty state message "No budget items found for this account." is displayed, indicating that no budget line items have been configured for this account yet.

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

**Test: NewTransactionModal clicking overlay backdrop closes modal without saving**
- **Initial state:** The NewTransactionModal is open with some fields filled in (date, description, line items).
- **Action:** User clicks on the dark overlay/backdrop area outside the modal content.
- **Expected:** The modal closes without saving any data. No new transaction is created. Clicking inside the modal content area does not close the modal (only the backdrop area outside).

**Test: NewTransactionModal Save Transaction button saves transaction**
- **Initial state:** The NewTransactionModal is open with valid data: date "Oct 26, 2023", description "October Rent & Utilities Payment", currency "USD ($)", two line items (Checking Account Credit $1,500.00 and Rent Expense Debit $1,500.00), and the transaction is balanced.
- **Action:** User clicks the "Save Transaction" button.
- **Expected:** The transaction is saved. The modal closes. The new transaction appears in the transaction lists of all affected accounts (Checking Account and Rent Expense). Account balances are updated to reflect the new transaction.

**Test: NewTransactionModal saved transaction appears in affected account transaction lists**
- **Initial state:** User has just saved a transaction with line items affecting "Checking Account" (Credit $1,500.00) and "Rent Expense" (Debit $1,500.00).
- **Action:** User navigates to the AccountDetailPage for "Checking Account" and observes the Transactions tab.
- **Expected:** The newly saved transaction appears in the transactions list with the correct date, description "October Rent & Utilities Payment", amount "$1,500.00", and direction "Credit". Navigating to "Rent Expense" AccountDetailPage also shows the transaction with direction "Debit" and amount "$1,500.00".

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
- **Expected:** The transaction is NOT saved. The "Save Transaction" button is disabled while the transaction is unbalanced. The modal remains open.

**Test: BalanceIndicator shows zero totals for empty line items**
- **Initial state:** The NewTransactionModal is open with empty line item rows (no amounts entered).
- **Action:** User observes the balance area.
- **Expected:** Total Debits shows "$0.00" and Total Credits shows "$0.00". The indicator shows "Transaction is Balanced" (since $0.00 = $0.00) with a green checkmark.

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

**Test: CreateReportDialog clicking overlay backdrop closes dialog without generating**
- **Initial state:** The CreateReportDialog is open with some settings configured (e.g., report type selected, dates set).
- **Action:** User clicks on the dark overlay/backdrop area outside the dialog content.
- **Expected:** The dialog closes without generating a report. No new report is created. Clicking inside the dialog content area does not close the dialog (only the backdrop area outside).

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
- **Expected:** The application navigates via client-side routing to the AccountDetailPage for the Sales Revenue account (URL path `/accounts/{accountId}`). The dialog is no longer visible because the page has changed. The user can see all transactions and budget details for that account on the AccountDetailPage.

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

#### Component: ReportHeader

**Test: ReportHeader displays report title with ID**
- **Initial state:** User navigates to the ReportDetails page for a generated report (e.g., "Q3 2024 Budget Variance Report" with ID "REP-2024-Q3-001").
- **Action:** User observes the header area at the top of the page content.
- **Expected:** The heading "Q3 2024 Budget Variance Report (ID: REP-2024-Q3-001)" is displayed prominently. The title includes the report name followed by the report's unique ID in parentheses.

**Test: ReportHeader displays breadcrumb navigation**
- **Initial state:** User is on the ReportDetails page for the "Q3 2024 Budget Variance Report".
- **Action:** User observes the breadcrumb area above the report title.
- **Expected:** A breadcrumb trail is displayed showing "Reports > Q3 2024 Budget Variance Report". The "Reports" segment is a clickable link and the current report name is the final non-clickable segment.

**Test: ReportHeader breadcrumb Reports link navigates to ReportList**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User clicks the "Reports" link in the breadcrumb trail.
- **Expected:** The app navigates to the ReportList page, showing all generated reports. The ReportDetails page is no longer displayed.

**Test: ReportHeader displays Export PDF button with outline style**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User observes the top-right area of the header, next to the report title.
- **Expected:** An "Export PDF" button is displayed with an outline/secondary style (not filled). The button text reads "Export PDF".

**Test: ReportHeader displays Export CSV button with primary style**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User observes the top-right area of the header, next to the Export PDF button.
- **Expected:** An "Export CSV" button is displayed with a blue/primary filled style. The button is positioned to the right of the Export PDF button.

**Test: ReportHeader Export PDF button downloads a PDF file**
- **Initial state:** User is on the ReportDetails page for the "Q3 2024 Budget Variance Report".
- **Action:** User clicks the "Export PDF" button.
- **Expected:** A PDF file download is initiated. The downloaded file contains the report data (title, variance summary, chart representation, and detailed table) formatted as a PDF document. The filename includes the report name or ID.

**Test: ReportHeader Export CSV button downloads a CSV file**
- **Initial state:** User is on the ReportDetails page for the "Q3 2024 Budget Variance Report".
- **Action:** User clicks the "Export CSV" button.
- **Expected:** A CSV file download is initiated. The downloaded file contains the detailed report table data with columns matching the on-screen table (Account/Item, Actual, Budget, Variance $, Variance %). The filename includes the report name or ID.

**Test: ReportHeader title reflects the specific report from the database**
- **Initial state:** Two reports exist: "Q3 2024 Budget Variance Report (ID: REP-2024-Q3-001)" and "Q2 2024 Summary Report (ID: REP-2024-Q2-005)".
- **Action:** User navigates to the ReportDetails page for the Q2 report.
- **Expected:** The heading displays "Q2 2024 Summary Report (ID: REP-2024-Q2-005)". The breadcrumb shows "Reports > Q2 2024 Summary Report". The page content reflects the Q2 report data, not the Q3 report.

#### Component: VarianceSummary

**Test: VarianceSummary displays Total Variance with amount and percentage**
- **Initial state:** User is on the ReportDetails page for a report where the total variance is -$12,500 (9.4% over budget).
- **Action:** User observes the summary card below the report header.
- **Expected:** A "Total Variance:" label is displayed followed by "-$12,500 (9.4%)" on the next line. The variance amount and percentage are shown together.

**Test: VarianceSummary negative variance shown in red with down arrow**
- **Initial state:** User is on the ReportDetails page for a report where actual spend exceeds the budget (unfavorable variance).
- **Action:** User observes the Total Variance value in the summary card.
- **Expected:** The variance amount "-$12,500 (9.4%)" is displayed in red text. A downward-pointing arrow icon (↓) is shown next to the percentage, indicating an unfavorable/over-budget direction.

**Test: VarianceSummary positive variance shown in green with up arrow**
- **Initial state:** User is on the ReportDetails page for a report where actual spend is below the budget (favorable variance).
- **Action:** User observes the Total Variance value in the summary card.
- **Expected:** The variance amount is displayed in green text with a positive prefix (e.g., "+$5,000 (3.2%)"). An upward-pointing arrow icon (↑) is shown next to the percentage, indicating a favorable/under-budget direction.

**Test: VarianceSummary displays Actual Spend with dollar amount**
- **Initial state:** User is on the ReportDetails page for a report with actual spend of $145,000.
- **Action:** User observes the summary card.
- **Expected:** An "Actual Spend:" label is displayed with "$145,000" beneath it in a prominent font. The Actual Spend is positioned to the right of the Total Variance in the same horizontal row.

**Test: VarianceSummary displays Budgeted Spend with dollar amount**
- **Initial state:** User is on the ReportDetails page for a report with budgeted spend of $132,500.
- **Action:** User observes the summary card.
- **Expected:** A "Budgeted Spend:" label is displayed with "$132,500" beneath it in a prominent font. The Budgeted Spend is positioned to the right of the Actual Spend in the same horizontal row.

**Test: VarianceSummary displays mini trend chart on the right**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User observes the right side of the summary card.
- **Expected:** A small line chart (sparkline/mini trend chart) is displayed on the far right side of the summary card. The chart shows the variance trend over the report period, providing a quick visual of how variance has changed.

**Test: VarianceSummary card layout shows all metrics in a single row**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User observes the overall layout of the summary card.
- **Expected:** The summary card is a single horizontal row containing, from left to right: Total Variance (with amount, percentage, and directional arrow), Actual Spend (label and amount), Budgeted Spend (label and amount), and the mini trend chart. All elements are vertically centered within the card.

#### Component: VarianceChart

**Test: VarianceChart displays heading and subtitle**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User observes the chart section below the variance summary card.
- **Expected:** The heading "Top Account Variances" is displayed at the top of the section. Below it, the subtitle "Actual vs. Budgeted" is displayed in a smaller/muted font.

**Test: VarianceChart displays bar chart with paired bars per account**
- **Initial state:** User is on the ReportDetails page for a report that includes accounts Marketing, Operations, R&D, Sales, and G&A.
- **Action:** User observes the bar chart.
- **Expected:** The chart displays grouped/paired bars for each account, showing the variance between Actual and Budgeted amounts. Each account has a visual representation of its budget variance.

**Test: VarianceChart displays account labels on x-axis**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User observes the x-axis of the bar chart.
- **Expected:** Account names are displayed as labels along the x-axis: "Marketing", "Operations", "R&D", "Sales", "G&A". The labels are centered beneath their respective bar groups.

**Test: VarianceChart y-axis shows dollar amounts**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User observes the y-axis of the bar chart.
- **Expected:** The y-axis displays dollar amount labels (e.g., "$50", "$60", "0", "-$30", "-$10") representing the variance scale. A zero line is clearly visible as the baseline dividing over-budget (positive) and under-budget (negative) values.

**Test: VarianceChart over-budget accounts displayed with red bars**
- **Initial state:** User is on the ReportDetails page for a report where Marketing, Operations, and R&D are over budget.
- **Action:** User observes the bars for these over-budget accounts.
- **Expected:** The bars for Marketing, Operations, and R&D are displayed in red, extending above the zero line, visually indicating unfavorable budget variance (actual exceeds budget).

**Test: VarianceChart under-budget accounts displayed with green bars**
- **Initial state:** User is on the ReportDetails page for a report where Sales and G&A are under budget.
- **Action:** User observes the bars for these under-budget accounts.
- **Expected:** The bars for Sales and G&A are displayed in green, extending below the zero line, visually indicating favorable budget variance (actual is less than budget).

**Test: VarianceChart displays data for all accounts in the report**
- **Initial state:** User is on the ReportDetails page for a report that covers five accounts.
- **Action:** User observes the full bar chart.
- **Expected:** All five accounts (Marketing, Operations, R&D, Sales, G&A) have bars rendered in the chart. No account from the report is missing from the chart visualization.

**Test: VarianceChart bar heights are proportional to variance amounts**
- **Initial state:** User is on the ReportDetails page for a report where Marketing has a larger variance than R&D.
- **Action:** User observes the relative heights of bars for Marketing and R&D.
- **Expected:** The Marketing bar is taller than the R&D bar, reflecting the larger variance amount for Marketing. The bar heights are proportional to the absolute dollar variance for each account.

#### Component: DetailedReportTable

**Test: DetailedReportTable displays heading**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User observes the section below the variance chart.
- **Expected:** The heading "Detailed Report" is displayed at the top of the section.

**Test: DetailedReportTable displays correct column headers**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User observes the table header row.
- **Expected:** The table displays seven column headers from left to right: "Account / Item", "Actual ($)", "Budget ($)", "Variance ($)", "Variance (%)", "Trend", and "Actions".

**Test: DetailedReportTable displays account rows with name and label**
- **Initial state:** User is on the ReportDetails page for a report with accounts Marketing, Operations, R&D, Sales, and G&A.
- **Action:** User observes the table rows.
- **Expected:** Each account is displayed as a row with the account name in bold (e.g., "Marketing") followed by "(Account)" as a label beneath or beside the name. All accounts from the report are listed.

**Test: DetailedReportTable account rows display Actual, Budget, Variance, and Variance % values**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User observes the "Marketing" account row.
- **Expected:** The Marketing row displays: Actual ($) "$42,000", Budget ($) "$38,000", Variance ($) "-$4,000", Variance (%) "(10.5%)". The values are aligned in their respective columns.

**Test: DetailedReportTable account rows have expand/collapse chevron**
- **Initial state:** User is on the ReportDetails page for a report with account rows displayed.
- **Action:** User observes the left side of each account row.
- **Expected:** Each account row has a right-pointing chevron (▶) icon to the left of the account name, indicating the row can be expanded to reveal sub-item details.

**Test: DetailedReportTable clicking expand chevron reveals sub-item rows**
- **Initial state:** User is on the ReportDetails page with the "Operations" account row collapsed (chevron pointing right).
- **Action:** User clicks the expand chevron on the "Operations" row.
- **Expected:** The chevron rotates to point downward (▼). Sub-item rows appear below the Operations account row, indented to show they are children: "Cloud Infrastructure (Item)" with Actual $8,500, Budget $5,000, Variance -$3,500, Variance % (70%); "Office Lease (Item)" with Actual $6,000, Budget $6,000, Variance $0, Variance % (0%); "Travel (Item)" with Actual $2,500, Budget $3,500, Variance +$1,000, Variance % 28.6%.

**Test: DetailedReportTable sub-item rows display item name with Item label**
- **Initial state:** User has expanded the "Operations" account row to reveal sub-items.
- **Action:** User observes the sub-item rows.
- **Expected:** Each sub-item row displays the item name followed by "(Item)" as a label (e.g., "Cloud Infrastructure (Item)", "Office Lease (Item)", "Travel (Item)"). The sub-item rows are indented relative to the parent account row.

**Test: DetailedReportTable clicking collapse chevron hides sub-item rows**
- **Initial state:** User is on the ReportDetails page with the "Operations" account row expanded, showing its sub-item rows.
- **Action:** User clicks the collapse chevron (downward-pointing) on the "Operations" row.
- **Expected:** The sub-item rows (Cloud Infrastructure, Office Lease, Travel) are hidden. Only the Operations account summary row remains visible. The chevron rotates back to point right.

**Test: DetailedReportTable negative variance amounts shown in red**
- **Initial state:** User is on the ReportDetails page for a report with over-budget accounts.
- **Action:** User observes the Variance ($) column for "Marketing" (which shows -$4,000).
- **Expected:** The text "-$4,000" is displayed in red, indicating an unfavorable variance where actual spending exceeds the budget.

**Test: DetailedReportTable negative variance percentages shown in red with parentheses**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User observes the Variance (%) column for "Marketing".
- **Expected:** The text "(10.5%)" is displayed in red with parentheses, following accounting convention for negative/unfavorable values.

**Test: DetailedReportTable positive variance amounts shown in green with plus prefix**
- **Initial state:** User has expanded the "Operations" row and the sub-item "Travel" has a favorable variance.
- **Action:** User observes the Variance ($) column for the "Travel" sub-item.
- **Expected:** The text "+$1,000" is displayed in green, indicating a favorable variance where actual spending is below the budget.

**Test: DetailedReportTable positive variance percentages shown in green**
- **Initial state:** User has expanded the "Operations" row.
- **Action:** User observes the Variance (%) column for the "Travel" sub-item.
- **Expected:** The text "28.6%" is displayed in green (without parentheses), indicating a favorable variance percentage.

**Test: DetailedReportTable zero variance displayed correctly**
- **Initial state:** User has expanded the "Operations" row and the sub-item "Office Lease" has no variance.
- **Action:** User observes the Variance ($) and Variance (%) columns for "Office Lease".
- **Expected:** The Variance ($) column shows "$0" and the Variance (%) column shows "(0%)". The text is displayed in a neutral color (not red or green).

**Test: DetailedReportTable Trend column displays sparkline for each row**
- **Initial state:** User is on the ReportDetails page for a report.
- **Action:** User observes the Trend column across multiple rows.
- **Expected:** Each account row and sub-item row displays a small sparkline (mini line chart) in the Trend column. The sparklines show the variance trend over time for that specific account or item. Unfavorable trends show declining lines and favorable trends show rising lines.

**Test: DetailedReportTable Actions column displays View button for account rows**
- **Initial state:** User is on the ReportDetails page for a report with account rows displayed.
- **Action:** User observes the Actions column for the "Marketing" account row.
- **Expected:** A "View" button is displayed in the Actions column for the Marketing account row. The button is styled with a border/outline.

**Test: DetailedReportTable View button navigates to AccountDetailPage**
- **Initial state:** User is on the ReportDetails page with account rows displayed.
- **Action:** User clicks the "View" button in the Actions column for the "Marketing" row.
- **Expected:** The app navigates to the AccountDetailPage for the Marketing account, showing all transactions and budget details for that account.

**Test: DetailedReportTable sub-item rows do not display View button**
- **Initial state:** User has expanded the "Operations" account row to show sub-item rows (Cloud Infrastructure, Office Lease, Travel).
- **Action:** User observes the Actions column for the sub-item rows.
- **Expected:** The sub-item rows do not have a "View" button in the Actions column. Only the parent account rows have the View button.

**Test: DetailedReportTable multiple accounts are listed**
- **Initial state:** User is on the ReportDetails page for a report covering accounts Marketing, Operations, R&D, Sales, and G&A.
- **Action:** User scrolls through the detailed report table.
- **Expected:** All five account rows are present in the table: Marketing (Account), Operations (Account), R&D (Account), Sales (Account), and G&A (Account). Each row has complete data in all columns.

**Test: DetailedReportTable expanding one account does not affect others**
- **Initial state:** User is on the ReportDetails page with all account rows collapsed.
- **Action:** User clicks the expand chevron on "Operations".
- **Expected:** Only the "Operations" row expands to show its sub-items. All other account rows (Marketing, R&D, Sales, G&A) remain collapsed with their chevrons pointing right.

**Test: DetailedReportTable multiple accounts can be expanded simultaneously**
- **Initial state:** User has expanded the "Operations" account row showing its sub-items.
- **Action:** User clicks the expand chevron on "Marketing".
- **Expected:** The "Marketing" row expands to show its sub-items. The "Operations" row remains expanded as well. Both sets of sub-items are visible simultaneously.

---

## Page: ReportList

### Components: ReportListHeader, ReportTable

#### Component: ReportListHeader

**Test: ReportListHeader displays page title**
- **Initial state:** User navigates to the ReportList page.
- **Action:** User observes the header area at the top of the page content.
- **Expected:** The heading "ReportList" is displayed prominently as the page title.

**Test: ReportListHeader displays breadcrumb navigation**
- **Initial state:** User is on the ReportList page.
- **Action:** User observes the breadcrumb area above the page title.
- **Expected:** A breadcrumb trail is shown (e.g., "Page / reports") providing navigation context. Clicking the "Page" breadcrumb segment navigates back to the home/dashboard page.

**Test: ReportListHeader displays search bar with search icon**
- **Initial state:** User is on the ReportList page.
- **Action:** User observes the header area to the right of the page title.
- **Expected:** A search input field is displayed with a magnifying glass search icon on the left side and placeholder text "Search..." in a muted/gray color. The search bar is positioned between the page title and the Generate New Report button.

**Test: ReportListHeader search bar filters reports by name**
- **Initial state:** User is on the ReportList page with multiple reports listed (e.g., "Q3 2023 Financial Summary", "September Expense Detail", "Budget vs. Actual - Marketing", "YTD Asset Overview").
- **Action:** User types "Budget" into the search bar.
- **Expected:** The ReportTable filters to show only reports whose name contains "Budget" (e.g., "Budget vs. Actual - Marketing" rows). Non-matching reports are hidden from the table.

**Test: ReportListHeader search bar clears and restores all reports**
- **Initial state:** User has typed "Budget" into the search bar and the table is filtered.
- **Action:** User clears the search bar text.
- **Expected:** All reports are displayed again in the ReportTable without any filtering applied.

**Test: ReportListHeader displays Generate New Report button**
- **Initial state:** User is on the ReportList page.
- **Action:** User observes the right side of the header area.
- **Expected:** A "Generate New Report" button is displayed with a blue/primary filled style. The button text reads "Generate New Report".

**Test: ReportListHeader Generate New Report button opens CreateReportDialog**
- **Initial state:** User is on the ReportList page.
- **Action:** User clicks the "Generate New Report" button.
- **Expected:** The CreateReportDialog opens, allowing the user to configure report type, date range, account/category filters, and preview the report before generating it.

#### Component: ReportTable

**Test: ReportTable displays correct column headers**
- **Initial state:** User is on the ReportList page with reports available.
- **Action:** User observes the table header row.
- **Expected:** The table displays six column headers from left to right: "Report Name", "Type", "Date Range", "Accounts Included", "Status", and "Actions".

**Test: ReportTable Report Name column is sortable with ascending indicator by default**
- **Initial state:** User navigates to the ReportList page.
- **Action:** User observes the "Report Name" column header.
- **Expected:** The "Report Name" column header displays an upward arrow (↑) icon indicating the column is sorted in ascending alphabetical order by default. The arrow icon distinguishes this column as sortable.

**Test: ReportTable clicking Report Name header toggles sort to descending**
- **Initial state:** User is on the ReportList page with the Report Name column sorted ascending (↑).
- **Action:** User clicks the "Report Name" column header.
- **Expected:** The sort direction toggles to descending (Z–A). The arrow icon changes to a downward arrow (↓). Report rows are reordered so that names starting with later letters appear first (e.g., "YTD Asset Overview" before "Budget vs. Actual - Marketing").

**Test: ReportTable clicking Report Name header again toggles sort back to ascending**
- **Initial state:** User is on the ReportList page with the Report Name column sorted descending (↓).
- **Action:** User clicks the "Report Name" column header again.
- **Expected:** The sort direction toggles back to ascending (A–Z). The arrow icon changes to an upward arrow (↑). Report rows are reordered so that names starting with earlier letters appear first.

**Test: ReportTable displays report rows with correct data**
- **Initial state:** User is on the ReportList page with seeded report data.
- **Action:** User observes the table rows.
- **Expected:** Report rows are displayed with correct data. For example: "Q3 2023 Financial Summary" has Type "Financial Report", Date Range "01/1/23 - 01/1/23", Accounts Included "Accounts", Status "Complete". "September Expense Detail" has Type "Expense Detail". Each row contains data in all six columns.

**Test: ReportTable Type column displays report type**
- **Initial state:** User is on the ReportList page with reports available.
- **Action:** User observes the Type column for various report rows.
- **Expected:** The Type column displays the type of each report, such as "Financial Report" or "Expense Detail", matching the report type selected when the report was generated.

**Test: ReportTable Date Range column displays formatted date range**
- **Initial state:** User is on the ReportList page with reports available.
- **Action:** User observes the Date Range column for various report rows.
- **Expected:** The Date Range column displays the start and end dates for each report in a formatted range (e.g., "01/1/23 - 01/1/23", "01/1/23 - 02/23", "01/1/23 - 05/23"). The dates reflect the date range selected when the report was generated.

**Test: ReportTable Accounts Included column displays included accounts**
- **Initial state:** User is on the ReportList page with reports available.
- **Action:** User observes the Accounts Included column for various report rows.
- **Expected:** The Accounts Included column displays a summary of the accounts or categories that were included in the report (e.g., "Accounts"). This reflects the account/category filter settings used when generating the report.

**Test: ReportTable Status column displays Complete badge**
- **Initial state:** User is on the ReportList page with reports that have finished generating.
- **Action:** User observes the Status column for a completed report row.
- **Expected:** The Status column displays a "Complete" badge with a distinct visual style (e.g., colored chip/tag) indicating the report has been successfully generated and is ready for viewing.

**Test: ReportTable Status column displays Pending badge for in-progress report**
- **Initial state:** User is on the ReportList page and a report is currently being generated.
- **Action:** User observes the Status column for the in-progress report.
- **Expected:** The Status column displays a "Pending" or "Generating" badge with a distinct visual style (e.g., different color from the Complete badge) indicating the report is still being processed.

**Test: ReportTable Actions column displays refresh icon button**
- **Initial state:** User is on the ReportList page with reports available.
- **Action:** User observes the Actions column for a report row.
- **Expected:** A refresh/reload icon button (↻) is displayed in the Actions column. The icon is clickable and styled as a small icon button.

**Test: ReportTable Actions refresh button regenerates the report**
- **Initial state:** User is on the ReportList page with a completed report "Q3 2023 Financial Summary".
- **Action:** User clicks the refresh icon button (↻) in the Actions column for that report.
- **Expected:** The report is regenerated using its original settings (report type, date range, account filters). The Status badge may temporarily change to "Pending" or "Generating" while the report regenerates, then return to "Complete" when done. The report data is updated to reflect the latest account and transaction data.

**Test: ReportTable Actions column displays download icon button**
- **Initial state:** User is on the ReportList page with reports available.
- **Action:** User observes the Actions column for a report row.
- **Expected:** A download icon button (↓) is displayed in the Actions column, positioned to the right of the refresh icon. The icon is clickable and styled as a small icon button.

**Test: ReportTable Actions download button downloads the report**
- **Initial state:** User is on the ReportList page with a completed report.
- **Action:** User clicks the download icon button (↓) in the Actions column for that report.
- **Expected:** A file download is initiated. The downloaded file contains the report data (e.g., CSV or PDF format). The filename includes the report name or ID.

**Test: ReportTable Actions column displays View Details link**
- **Initial state:** User is on the ReportList page with reports available.
- **Action:** User observes the Actions column for a report row.
- **Expected:** A "View Details" text link is displayed in the Actions column, positioned to the right of the download icon. The link text is styled as a clickable blue/link color text.

**Test: ReportTable Actions View Details link navigates to ReportDetails page**
- **Initial state:** User is on the ReportList page with the "Q3 2023 Financial Summary" report listed.
- **Action:** User clicks the "View Details" link in the Actions column for that report row.
- **Expected:** The app navigates to the ReportDetails page for the "Q3 2023 Financial Summary" report, displaying the full report with variance summary, chart, and detailed table.

**Test: ReportTable pagination is displayed below the table**
- **Initial state:** User is on the ReportList page with more reports than fit on a single page.
- **Action:** User observes the area below the report table.
- **Expected:** Pagination controls are displayed below the table, showing the current page number, total pages, and navigation buttons (e.g., previous/next page arrows). The controls allow the user to navigate between pages of reports.

**Test: ReportTable pagination navigates to the next page**
- **Initial state:** User is on the ReportList page viewing page 1 of reports with pagination controls visible.
- **Action:** User clicks the next page button in the pagination controls.
- **Expected:** The table updates to display the next set of report rows (page 2). The pagination controls update to reflect the current page number. The previous page button becomes enabled.

**Test: ReportTable pagination navigates to the previous page**
- **Initial state:** User is on page 2 of the ReportList table.
- **Action:** User clicks the previous page button in the pagination controls.
- **Expected:** The table updates to display the first set of report rows (page 1). The pagination controls update to reflect page 1. The previous page button becomes disabled (since the user is on the first page).

**Test: ReportTable empty state when no reports exist**
- **Initial state:** User navigates to the ReportList page and no reports have been generated yet.
- **Action:** User observes the table area.
- **Expected:** An empty state message is displayed (e.g., "No reports found") indicating that no reports have been generated yet. The "Generate New Report" button is still accessible in the header to create the first report.

**Test: ReportTable newly generated report appears in the list**
- **Initial state:** User is on the ReportList page with existing reports. User clicks "Generate New Report", configures a new report in the CreateReportDialog, and clicks "Generate Report".
- **Action:** User observes the ReportTable after the dialog closes.
- **Expected:** The newly generated report appears in the ReportTable with the correct Report Name, Type, Date Range, Accounts Included, and a Status badge of "Complete" (or "Pending" if still generating). The report row includes all three Actions (refresh, download, View Details).

---

## Page: TransactionsPage

### Components: TransactionsPageHeader, DateRangeFilter, AccountFilter, MaterialFilter, TransactionTypeFilter, SearchBar, TransactionsTable, Pagination, NewTransactionButton

#### Component: TransactionsPageHeader

**Test: TransactionsPageHeader displays page title**
- **Initial state:** User navigates to the TransactionsPage.
- **Action:** User observes the header area at the top of the page content.
- **Expected:** The heading "Transactions" is displayed prominently as the page title.

**Test: TransactionsPageHeader displays breadcrumb navigation**
- **Initial state:** User is on the TransactionsPage.
- **Action:** User observes the breadcrumb area above the page title.
- **Expected:** A breadcrumb trail is shown (e.g., "Home > Transactions") providing navigation context. Clicking the "Home" breadcrumb segment navigates back to the Dashboard page.

**Test: TransactionsPageHeader NavBar Transactions link is active**
- **Initial state:** User is on the TransactionsPage.
- **Action:** User observes the NavBar at the top of the page.
- **Expected:** The "Transactions" link in the NavBar is visually highlighted/active, indicating the user is currently on the TransactionsPage. All other NavBar links (Dashboard, Accounts, Reports, Budgets) are not highlighted.

**Test: TransactionsPageHeader displays filter bar below title**
- **Initial state:** User is on the TransactionsPage.
- **Action:** User observes the area below the page title.
- **Expected:** A horizontal filter bar is displayed containing the DateRangeFilter, AccountFilter, MaterialFilter, TransactionTypeFilter, and SearchBar controls arranged in a single row. The filter bar is positioned between the page header and the TransactionsTable.

#### Component: DateRangeFilter

**Test: DateRangeFilter displays Start Date and End Date pickers**
- **Initial state:** User is on the TransactionsPage.
- **Action:** User observes the DateRangeFilter in the filter bar.
- **Expected:** Two date picker fields are displayed side by side. The left field is labeled "Start Date" and the right field is labeled "End Date". Each field has a calendar icon on the left side of the input. Both fields show placeholder text (e.g., "Select date") when no date is selected.

**Test: DateRangeFilter Start Date picker allows selecting a date**
- **Initial state:** User is on the TransactionsPage with the Start Date field empty.
- **Action:** User clicks on the Start Date field and selects "Jan 1, 2024" from the date picker calendar.
- **Expected:** The Start Date field updates to display "Jan 1, 2024". The date picker calendar closes after selection. The TransactionsTable filters to show only transactions on or after Jan 1, 2024.

**Test: DateRangeFilter End Date picker allows selecting a date**
- **Initial state:** User is on the TransactionsPage with the End Date field empty.
- **Action:** User clicks on the End Date field and selects "Mar 31, 2024" from the date picker calendar.
- **Expected:** The End Date field updates to display "Mar 31, 2024". The date picker calendar closes after selection. The TransactionsTable filters to show only transactions on or before Mar 31, 2024.

**Test: DateRangeFilter filters transactions by date range**
- **Initial state:** User is on the TransactionsPage with transactions spanning multiple months. The Start Date is set to "Feb 1, 2024" and the End Date is set to "Feb 29, 2024".
- **Action:** User observes the TransactionsTable.
- **Expected:** Only transactions with dates between Feb 1, 2024 and Feb 29, 2024 (inclusive) are displayed. Transactions outside this range are hidden. The Pagination updates to reflect the filtered result count.

**Test: DateRangeFilter clearing Start Date removes lower bound**
- **Initial state:** User is on the TransactionsPage with Start Date set to "Jan 1, 2024" and End Date set to "Mar 31, 2024".
- **Action:** User clears the Start Date field (e.g., by clicking a clear/X button or deleting the text).
- **Expected:** The Start Date field returns to its empty/placeholder state. The TransactionsTable now shows all transactions up to Mar 31, 2024 with no lower date bound.

**Test: DateRangeFilter clearing End Date removes upper bound**
- **Initial state:** User is on the TransactionsPage with Start Date set to "Jan 1, 2024" and End Date set to "Mar 31, 2024".
- **Action:** User clears the End Date field.
- **Expected:** The End Date field returns to its empty/placeholder state. The TransactionsTable now shows all transactions from Jan 1, 2024 onward with no upper date bound.

**Test: DateRangeFilter clearing both dates shows all transactions**
- **Initial state:** User is on the TransactionsPage with both Start Date and End Date set, filtering the table.
- **Action:** User clears both the Start Date and End Date fields.
- **Expected:** All transactions are displayed in the TransactionsTable without any date filtering. The Pagination updates to reflect the full transaction count.

#### Component: AccountFilter

**Test: AccountFilter displays dropdown with placeholder**
- **Initial state:** User is on the TransactionsPage with no account filter applied.
- **Action:** User observes the AccountFilter dropdown in the filter bar.
- **Expected:** A dropdown select is displayed with the placeholder text "All Accounts" and a downward chevron icon indicating it is a dropdown. The dropdown is positioned in the filter bar after the DateRangeFilter.

**Test: AccountFilter dropdown shows all accounts**
- **Initial state:** User is on the TransactionsPage.
- **Action:** User clicks the AccountFilter dropdown.
- **Expected:** A dropdown menu opens listing all accounts, including "All Accounts" at the top as the default option, followed by individual accounts grouped by category (e.g., Assets: "Checking Account (Chase Bank)", "Savings Account (Ally)", "Investment Portfolio (Vanguard)"; Liabilities: "Credit Card (Visa)", "Mortgage Loan (Wells Fargo)", "Car Loan (Toyota Financial)"). Each account name is displayed with its parent institution in parentheses.

**Test: AccountFilter selecting an account filters transactions**
- **Initial state:** User is on the TransactionsPage with "All Accounts" selected (showing all transactions).
- **Action:** User clicks the AccountFilter dropdown and selects "Checking Account (Chase Bank)".
- **Expected:** The dropdown updates to display "Checking Account (Chase Bank)". The TransactionsTable filters to show only transactions that affect the Checking Account. Transactions involving other accounts are hidden. The Pagination updates to reflect the filtered result count.

**Test: AccountFilter selecting All Accounts removes filter**
- **Initial state:** User is on the TransactionsPage with "Checking Account (Chase Bank)" selected in the AccountFilter, showing filtered transactions.
- **Action:** User clicks the AccountFilter dropdown and selects "All Accounts".
- **Expected:** The dropdown updates to display "All Accounts". The TransactionsTable shows all transactions across all accounts without any account filtering.

**Test: AccountFilter combines with other filters**
- **Initial state:** User is on the TransactionsPage with DateRangeFilter set to "Jan 1, 2024" – "Mar 31, 2024".
- **Action:** User selects "Savings Account (Ally)" in the AccountFilter dropdown.
- **Expected:** The TransactionsTable shows only transactions that both affect the Savings Account AND fall within Jan 1–Mar 31, 2024. Both filters are applied simultaneously.

#### Component: MaterialFilter

**Test: MaterialFilter displays dropdown with placeholder**
- **Initial state:** User is on the TransactionsPage with no material filter applied.
- **Action:** User observes the MaterialFilter dropdown in the filter bar.
- **Expected:** A dropdown select is displayed with the placeholder text "All Materials" and a downward chevron icon indicating it is a dropdown. The dropdown is positioned in the filter bar after the AccountFilter.

**Test: MaterialFilter dropdown shows all materials**
- **Initial state:** User is on the TransactionsPage.
- **Action:** User clicks the MaterialFilter dropdown.
- **Expected:** A dropdown menu opens listing "All Materials" at the top as the default option, followed by all available material/category tags that have been applied to transactions (e.g., "Housing", "Recurring", "Utilities", "Groceries", "Salary", "Rent"). The list is sorted alphabetically.

**Test: MaterialFilter selecting a material filters transactions**
- **Initial state:** User is on the TransactionsPage with "All Materials" selected (showing all transactions).
- **Action:** User clicks the MaterialFilter dropdown and selects "Housing".
- **Expected:** The dropdown updates to display "Housing". The TransactionsTable filters to show only transactions that have the "Housing" tag/category. Transactions without the "Housing" tag are hidden. The Pagination updates to reflect the filtered result count.

**Test: MaterialFilter selecting All Materials removes filter**
- **Initial state:** User is on the TransactionsPage with "Housing" selected in the MaterialFilter, showing filtered transactions.
- **Action:** User clicks the MaterialFilter dropdown and selects "All Materials".
- **Expected:** The dropdown updates to display "All Materials". The TransactionsTable shows all transactions without any material/category filtering.

**Test: MaterialFilter combines with other filters**
- **Initial state:** User is on the TransactionsPage with AccountFilter set to "Checking Account (Chase Bank)".
- **Action:** User selects "Recurring" in the MaterialFilter dropdown.
- **Expected:** The TransactionsTable shows only transactions that both affect the Checking Account AND have the "Recurring" tag. Both filters are applied simultaneously.

#### Component: TransactionTypeFilter

**Test: TransactionTypeFilter displays dropdown with placeholder**
- **Initial state:** User is on the TransactionsPage with no type filter applied.
- **Action:** User observes the TransactionTypeFilter dropdown in the filter bar.
- **Expected:** A dropdown select is displayed with the placeholder text "All Types" and a downward chevron icon indicating it is a dropdown. The dropdown is positioned in the filter bar after the MaterialFilter.

**Test: TransactionTypeFilter dropdown shows type options**
- **Initial state:** User is on the TransactionsPage.
- **Action:** User clicks the TransactionTypeFilter dropdown.
- **Expected:** A dropdown menu opens listing three options: "All Types" (default), "Debit", and "Credit".

**Test: TransactionTypeFilter selecting Debit filters transactions**
- **Initial state:** User is on the TransactionsPage with "All Types" selected (showing all transactions).
- **Action:** User clicks the TransactionTypeFilter dropdown and selects "Debit".
- **Expected:** The dropdown updates to display "Debit". The TransactionsTable filters to show only transactions with a Debit direction. Credit transactions are hidden. The Pagination updates to reflect the filtered result count.

**Test: TransactionTypeFilter selecting Credit filters transactions**
- **Initial state:** User is on the TransactionsPage with "All Types" selected (showing all transactions).
- **Action:** User clicks the TransactionTypeFilter dropdown and selects "Credit".
- **Expected:** The dropdown updates to display "Credit". The TransactionsTable filters to show only transactions with a Credit direction. Debit transactions are hidden. The Pagination updates to reflect the filtered result count.

**Test: TransactionTypeFilter selecting All Types removes filter**
- **Initial state:** User is on the TransactionsPage with "Debit" selected in the TransactionTypeFilter, showing filtered transactions.
- **Action:** User clicks the TransactionTypeFilter dropdown and selects "All Types".
- **Expected:** The dropdown updates to display "All Types". The TransactionsTable shows all transactions regardless of type (both debits and credits).

**Test: TransactionTypeFilter combines with other filters**
- **Initial state:** User is on the TransactionsPage with DateRangeFilter set to "Jan 1, 2024" – "Jan 31, 2024" and AccountFilter set to "Checking Account (Chase Bank)".
- **Action:** User selects "Credit" in the TransactionTypeFilter dropdown.
- **Expected:** The TransactionsTable shows only transactions that are Credits AND affect the Checking Account AND fall within January 2024. All three filters are applied simultaneously.

#### Component: SearchBar

**Test: SearchBar displays input with search icon and placeholder**
- **Initial state:** User is on the TransactionsPage with no search text entered.
- **Action:** User observes the SearchBar in the filter bar.
- **Expected:** A text input field is displayed with a magnifying glass search icon on the left side and placeholder text "Search transactions..." in a muted/gray color. The SearchBar is positioned at the right end of the filter bar, after the TransactionTypeFilter.

**Test: SearchBar filters transactions by description**
- **Initial state:** User is on the TransactionsPage with multiple transactions visible (e.g., "Grocery Store", "Salary Deposit", "Electric Bill", "Rent Payment").
- **Action:** User types "Grocery" into the SearchBar.
- **Expected:** The TransactionsTable filters to show only transactions whose description contains "Grocery" (e.g., "Grocery Store"). Non-matching transactions are hidden. The filtering occurs in real time as the user types. The Pagination updates to reflect the filtered result count.

**Test: SearchBar search is case-insensitive**
- **Initial state:** User is on the TransactionsPage with a transaction described as "Salary Deposit".
- **Action:** User types "salary" (lowercase) into the SearchBar.
- **Expected:** The "Salary Deposit" transaction is displayed in the TransactionsTable. The search matches regardless of case.

**Test: SearchBar clearing text restores all transactions**
- **Initial state:** User has typed "Grocery" into the SearchBar and the table is filtered.
- **Action:** User clears the SearchBar text (e.g., by selecting all and deleting, or clicking a clear button).
- **Expected:** All transactions are displayed again in the TransactionsTable without any search filtering. The Pagination updates to reflect the full result count.

**Test: SearchBar combines with other filters**
- **Initial state:** User is on the TransactionsPage with AccountFilter set to "Checking Account (Chase Bank)" and TransactionTypeFilter set to "Debit".
- **Action:** User types "Rent" into the SearchBar.
- **Expected:** The TransactionsTable shows only transactions that match all three criteria: description contains "Rent", affect the Checking Account, and are Debit type. All filters and the search are applied simultaneously.

**Test: SearchBar no results displays empty state**
- **Initial state:** User is on the TransactionsPage with transactions visible.
- **Action:** User types "xyznonexistent" into the SearchBar (a term that matches no transactions).
- **Expected:** The TransactionsTable displays an empty state message (e.g., "No transactions found") indicating no transactions match the search criteria. The Pagination shows zero results.

#### Component: TransactionsTable

**Test: TransactionsTable displays correct column headers**
- **Initial state:** User is on the TransactionsPage with transactions available.
- **Action:** User observes the table header row.
- **Expected:** The table displays six column headers from left to right: "Date", "Description", "Account", "Type", "Amount", and "Tags". Each column header text is clearly visible.

**Test: TransactionsTable displays transaction rows with correct data**
- **Initial state:** User is on the TransactionsPage with seeded transactions.
- **Action:** User observes the transaction rows in the table.
- **Expected:** Transaction rows are displayed with correct data in all columns. For example: row 1 shows Date "Oct 25, 2023", Description "Grocery Store", Account "Checking Account", Type "Debit", Amount "$125.50", Tags "Groceries". Row 2 shows Date "Oct 24, 2023", Description "Salary Deposit", Account "Checking Account", Type "Credit", Amount "$3,200.00", Tags "Salary". Transactions are ordered by date descending (most recent first) by default.

**Test: TransactionsTable Date column is sortable ascending**
- **Initial state:** User is on the TransactionsPage with transactions sorted by date descending (default).
- **Action:** User clicks the "Date" column header.
- **Expected:** The transactions are re-sorted by date in ascending order (oldest first). An upward arrow (↑) icon appears next to the "Date" column header indicating ascending sort. The previously displayed sort indicator (if any) is removed from other columns.

**Test: TransactionsTable Date column is sortable descending**
- **Initial state:** User is on the TransactionsPage with transactions sorted by date ascending (↑).
- **Action:** User clicks the "Date" column header again.
- **Expected:** The transactions are re-sorted by date in descending order (most recent first). A downward arrow (↓) icon appears next to the "Date" column header indicating descending sort.

**Test: TransactionsTable Description column is sortable**
- **Initial state:** User is on the TransactionsPage with transactions sorted by date.
- **Action:** User clicks the "Description" column header.
- **Expected:** The transactions are re-sorted alphabetically by description in ascending order (A–Z). An upward arrow (↑) icon appears next to the "Description" column header. Clicking again toggles to descending (Z–A) with a downward arrow (↓).

**Test: TransactionsTable Account column is sortable**
- **Initial state:** User is on the TransactionsPage with transactions sorted by date.
- **Action:** User clicks the "Account" column header.
- **Expected:** The transactions are re-sorted alphabetically by account name in ascending order (A–Z). An upward arrow (↑) icon appears next to the "Account" column header. Clicking again toggles to descending (Z–A) with a downward arrow (↓).

**Test: TransactionsTable Type column is sortable**
- **Initial state:** User is on the TransactionsPage with transactions sorted by date.
- **Action:** User clicks the "Type" column header.
- **Expected:** The transactions are re-sorted by type, grouping all "Credit" transactions before "Debit" (ascending) or vice versa (descending). A sort direction arrow appears next to the "Type" column header.

**Test: TransactionsTable Amount column is sortable**
- **Initial state:** User is on the TransactionsPage with transactions sorted by date.
- **Action:** User clicks the "Amount" column header.
- **Expected:** The transactions are re-sorted by amount in ascending order (smallest first). An upward arrow (↑) icon appears next to the "Amount" column header. Clicking again toggles to descending (largest first) with a downward arrow (↓).

**Test: TransactionsTable only one column sorted at a time**
- **Initial state:** User is on the TransactionsPage with the "Date" column sorted descending (↓).
- **Action:** User clicks the "Amount" column header.
- **Expected:** The "Amount" column becomes the active sort column with an ascending arrow (↑). The "Date" column loses its sort indicator arrow. Only one column displays a sort direction arrow at a time.

**Test: TransactionsTable row click navigates to transaction detail**
- **Initial state:** User is on the TransactionsPage with transaction rows visible.
- **Action:** User clicks on the "Grocery Store" transaction row.
- **Expected:** The NewTransactionModal opens in edit mode, pre-populated with the Grocery Store transaction details (date: Oct 25, 2023; description: Grocery Store; all line items with accounts, types, and amounts; tags). The user can view or edit the transaction.

**Test: TransactionsTable row click for credit transaction navigates to detail**
- **Initial state:** User is on the TransactionsPage with transaction rows visible.
- **Action:** User clicks on the "Salary Deposit" transaction row (a Credit transaction).
- **Expected:** The NewTransactionModal opens in edit mode, pre-populated with the Salary Deposit transaction details (date: Oct 24, 2023; description: Salary Deposit; amount: $3,200.00; type: Credit; affected accounts with debit/credit allocations).

**Test: TransactionsTable Debit type displays with distinct styling**
- **Initial state:** User is on the TransactionsPage with both Debit and Credit transactions visible.
- **Action:** User observes the Type column for a Debit transaction (e.g., "Grocery Store").
- **Expected:** The Type column displays the text "Debit" for the transaction. The text or its background may use a distinct color (e.g., red tint or a badge) to differentiate it from Credit entries.

**Test: TransactionsTable Credit type displays with distinct styling**
- **Initial state:** User is on the TransactionsPage with both Debit and Credit transactions visible.
- **Action:** User observes the Type column for a Credit transaction (e.g., "Salary Deposit").
- **Expected:** The Type column displays the text "Credit" for the transaction. The text or its background may use a distinct color (e.g., green tint or a badge) to differentiate it from Debit entries.

**Test: TransactionsTable Tags column displays tag chips**
- **Initial state:** User is on the TransactionsPage with transactions that have tags.
- **Action:** User observes the Tags column for a transaction with tags (e.g., "Rent Payment" with tags "Housing" and "Recurring").
- **Expected:** The Tags column displays the tags as small chips/badges (e.g., "Housing", "Recurring"). Each tag chip has a colored background to visually distinguish it.

**Test: TransactionsTable Tags column empty for untagged transactions**
- **Initial state:** User is on the TransactionsPage with transactions that have no tags.
- **Action:** User observes the Tags column for a transaction without tags.
- **Expected:** The Tags column is empty or displays a dash/placeholder for transactions that have no tags/categories assigned.

**Test: TransactionsTable empty state when no transactions exist**
- **Initial state:** User navigates to the TransactionsPage and no transactions have been recorded yet.
- **Action:** User observes the table area.
- **Expected:** An empty state message is displayed (e.g., "No transactions found") indicating that no transactions have been recorded. The NewTransactionButton is still accessible to create the first transaction.

**Test: TransactionsTable empty state when filters produce no results**
- **Initial state:** User is on the TransactionsPage with filters applied that match no transactions (e.g., AccountFilter set to a newly created account with no transactions).
- **Action:** User observes the table area.
- **Expected:** An empty state message is displayed (e.g., "No transactions found matching your filters") indicating no transactions match the current filter criteria. The filter controls remain accessible so the user can adjust or clear them.

**Test: TransactionsTable updates after saving a new transaction**
- **Initial state:** User is on the TransactionsPage with existing transactions listed.
- **Action:** User clicks the NewTransactionButton, fills in the NewTransactionModal with a new transaction (date: "Nov 1, 2023", description: "Office Supplies", account: Checking Account, type: Debit, amount: $75.00), and clicks "Save Transaction".
- **Expected:** After the modal closes, the TransactionsTable updates to include the new "Office Supplies" transaction. The new row appears in the correct position based on the current sort order (e.g., at the top if sorted by date descending). The Pagination total updates to reflect the additional transaction.

**Test: TransactionsTable updates after editing a transaction**
- **Initial state:** User is on the TransactionsPage. User clicks on the "Grocery Store" row to open it in the NewTransactionModal, changes the description to "Grocery Store - Weekly", and clicks "Save Transaction".
- **Action:** User observes the TransactionsTable after the modal closes.
- **Expected:** The "Grocery Store" row now displays the updated description "Grocery Store - Weekly". No duplicate row is created. All other columns remain unchanged.

#### Component: Pagination

**Test: Pagination displays below the TransactionsTable**
- **Initial state:** User is on the TransactionsPage with more transactions than fit on a single page (e.g., more than 10 or 20 transactions depending on page size).
- **Action:** User observes the area below the TransactionsTable.
- **Expected:** Pagination controls are displayed below the table, showing the current page number, total pages, and navigation buttons. The controls include: a previous page button (left arrow), page number indicators, and a next page button (right arrow). A label such as "Page 1 of 5" or "Showing 1–20 of 95 transactions" is displayed.

**Test: Pagination navigates to the next page**
- **Initial state:** User is on the TransactionsPage viewing page 1 of transactions with pagination controls visible.
- **Action:** User clicks the next page button (right arrow).
- **Expected:** The TransactionsTable updates to display the next set of transaction rows (page 2). The pagination label updates to reflect the current page (e.g., "Page 2 of 5"). The previous page button becomes enabled. The page scrolls to the top of the table.

**Test: Pagination navigates to the previous page**
- **Initial state:** User is on page 2 of the TransactionsPage table.
- **Action:** User clicks the previous page button (left arrow).
- **Expected:** The TransactionsTable updates to display the first set of transaction rows (page 1). The pagination label updates to reflect page 1. The previous page button becomes disabled since the user is on the first page.

**Test: Pagination previous button disabled on first page**
- **Initial state:** User is on the TransactionsPage viewing page 1.
- **Action:** User observes the previous page button.
- **Expected:** The previous page button (left arrow) is disabled/grayed out, indicating there is no previous page to navigate to.

**Test: Pagination next button disabled on last page**
- **Initial state:** User is on the TransactionsPage viewing the last page of transactions (e.g., page 5 of 5).
- **Action:** User observes the next page button.
- **Expected:** The next page button (right arrow) is disabled/grayed out, indicating there is no next page to navigate to.

**Test: Pagination clicking a specific page number navigates to that page**
- **Initial state:** User is on the TransactionsPage viewing page 1 with page number indicators visible (e.g., 1, 2, 3, 4, 5).
- **Action:** User clicks the page number "3".
- **Expected:** The TransactionsTable updates to display the transactions for page 3. The page number "3" is highlighted/active. The pagination label updates to reflect page 3.

**Test: Pagination updates when filters change result count**
- **Initial state:** User is on the TransactionsPage viewing page 3 of 5 pages of transactions.
- **Action:** User applies a filter (e.g., selects "Checking Account (Chase Bank)" in the AccountFilter) that reduces the total results to a single page.
- **Expected:** The Pagination resets to page 1. The page number indicators update to show fewer pages (e.g., "Page 1 of 1"). The previous and next buttons are both disabled since all filtered results fit on one page.

**Test: Pagination hidden when all transactions fit on one page**
- **Initial state:** User is on the TransactionsPage with very few transactions (e.g., 5 transactions when page size is 20).
- **Action:** User observes the area below the TransactionsTable.
- **Expected:** Pagination controls are either hidden or displayed in a minimal state (e.g., "Page 1 of 1") since all transactions fit on a single page. The previous and next buttons are both disabled.

#### Component: NewTransactionButton

**Test: NewTransactionButton displays with plus icon and text**
- **Initial state:** User is on the TransactionsPage.
- **Action:** User observes the top-right area of the page header, to the right of the filter bar.
- **Expected:** A "New Transaction" button is displayed with a blue/primary filled style. The button shows a plus icon (+) followed by the text "New Transaction". The button is prominently positioned for easy access.

**Test: NewTransactionButton opens NewTransactionModal**
- **Initial state:** User is on the TransactionsPage.
- **Action:** User clicks the "New Transaction" button.
- **Expected:** The NewTransactionModal dialog opens, overlaying the TransactionsPage. The modal is in new transaction mode with empty fields (date defaulting to today, empty description, default currency USD, two empty line item rows). The user can fill in the transaction details and save.

**Test: NewTransactionButton saving transaction updates table**
- **Initial state:** User is on the TransactionsPage and clicks the "New Transaction" button. The NewTransactionModal opens. User fills in: date "Nov 5, 2023", description "Monthly Subscription", selects "Checking Account" with Debit type and amount $15.99, selects "Expenses" with Credit type and amount $15.99, adds tag "Recurring".
- **Action:** User clicks "Save Transaction" in the modal.
- **Expected:** The modal closes. The TransactionsPage returns to view. The new "Monthly Subscription" transaction appears in the TransactionsTable with the correct date, description, account, type, amount, and "Recurring" tag. The Pagination total updates to include the new transaction.

**Test: NewTransactionButton cancelling does not affect table**
- **Initial state:** User is on the TransactionsPage with a known set of transactions. User clicks the "New Transaction" button and begins filling in fields.
- **Action:** User clicks "Cancel" in the NewTransactionModal.
- **Expected:** The modal closes. The TransactionsTable remains unchanged with the same transactions as before the modal was opened. No new transaction is created.
