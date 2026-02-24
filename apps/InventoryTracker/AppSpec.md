App: Inventory Tracker
Initial Prompt: Inventory and batch management system for a small business.  The app is tracking the inventory held of a variety of categorized materials and is broadly similar to an accounting platform.  There is a global set of accounts (inventory, consumer, producer) which can be customized, and within each account there are a variety of materials and their quantity (in customizable units).  Each account / material can be further subdivided into batches where the amount of material in each batch is tracked separately.  Transactions can be recorded and use a double entry system where credits / debits must balance.  Transactions can either reuse batches or create new ones.  newly created batches remember the lineage of batches they were created from.

Pages:

1. DashboardPage (/)
   Description: Main overview page of the inventory and batch management system. Layout: a header with app name and primary navigation (links to Accounts, Materials, Batches, Transactions, Settings). A main content area with key summary widgets: (1) Alerts for low inventory (2) categories of materials and quantity details of a few of each of them (3) Recent Transactions list (table with date, reference, accounts affected, materials and amounts for each, link to full details). Show these one over the other.  Functionality: click-through from summary widgets to detailed pages (accounts, materials, transactions), basic filters by date range and category, and a prominent button to create a new transaction that opens the New Transaction page or modal.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdmmdyCj3ilup1KN8SoFabELxfTc5X9nIgQzUM

2. AccountsPage (/accounts)
   Description: Page for managing the global set of accounts.  Categories for accounts are stock, input, output, each of these has one account by default but custom accounts can be created as well. Layout: separate lists of all the accounts in each category, with button to create new account. List columns: Account Name, Account Type, Description, Actions (View, Edit, Archive). Clicking an account row navigates to the Account Detail page.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdBP3aAsMnmAIsi8awdrfjCvQq9WMFZL56Dg2e

3. AccountDetailPage (/accounts/:accountId)
   Description: Detail view for a specific account (inventory, consumer, producer, or custom). Layout: header showing account name, type, and status with action buttons (Edit Account, New Transaction). Below the header.  Below is a table of all materials tracked in this account with columns for Material Name, Category, Unit of Measure, Total Quantity (sum across all batches in this account), Number of Batches, and Actions (View Material in this Account). Functionality: drill down to material details within this account, and initiate a new transaction pre-filled with this account.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdmCC9w153ilup1KN8SoFabELxfTc5X9nIgQzU

4. MaterialsPage (/materials)
   Description: Global list of materials tracked in the system, across all accounts. Layout: buttons at the top to create a new material or new material category, then filter/sort bar to filter by category or account; a main table with columns: Material Name, Category, Unit of Measure, Stock, and Actions (View Detail, Edit). Functionality: search materials by name, filter by category, define and edit categories, and navigate to a material’s detailed view.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdjdGFPlUektSnylW57BEZobPcKpDY4LHifIMz

5. MaterialDetailPage (/materials/:materialId)
   Description: Detail view for a specific material across accounts. Layout: header displaying material name, category, description, and unit of measure with buttons (Edit Material, New Batch, New Transaction). Below, sections: (1) Accounts Distribution – table listing each account where the material exists, with columns: Account Name, Account Type, Quantity, Number of Batches, and link to that material within the account. (2) Under each account list any batches which that account contains, including Batch ID, Quantity, Unit, Created Date. (3) Batches - list of all batches created for this material and their info (4) Transactions – list of all transactions involving this material, showing Date, Transaction ID, Accounts involved, Batch references, and Quantity moved. Functionality: jump to specific account detail, filter batches by account or date, see lineage chains for this material’s batches, and start a new transaction pre-filled with this material.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdPzzArnafjDSRHCyvJs4Ih5EgFTpY2aun16bt

6. BatchDetailPage (/batches/:batchId)
   Description: Detailed view of a single batch including its quantity and lineage. Layout: header with Batch ID, Material, Account, Status, and core properties (created date/time, originating transaction). Main content split into: (1) Batch Overview – current quantity, unit, and any custom properties (e.g., location, lot number, expiration if applicable). (2) Lineage section – source transaction that produced this batch, including their IDs, materials, accounts, quantities, and any batches used. (3) Usage History – list of transactions in which this batch was used or split, with date, transaction ID, type of movement (in/out), amount, and any batches that were created. Functionality: button to create a new transaction that uses this batch as input or target, batches in lineage / usage are clickable to open the details for them.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdcDho3KFKzt163rD7EIyabhkd9nPmXLveYAUR

7. TransactionsPage (/transactions)
   Description: List and search page for all double-entry transactions recorded in the system. Layout: filter bar allowing filtering by date range, involved account(s), material, and transaction type (e.g., purchase, consumption, transfer). Main table with columns: Date, Transaction ID, Description, Accounts affected, Materials and amounts. Each row can be clicked to view full details. Functionality: sort by date or ID, search by ID or description, filter by account or material, and start creation of a new transaction.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdSGpDj0qefARIFYtCwpzUK5jMihmgauDVxb2H

8. TransactionDetailPage (/transactions/:transactionId)
   Description: Full detail view for a specific double-entry transaction. Layout: header area with Transaction ID, date/time, creator, and description. Main form sections: (1) Basic Info – date, reference ID, description, and transaction type. (2) List of quantity transfers - must indicate source and destination account and amount transferred, optionally a batch ID for the source of the transferred amounts.  (3) List of batches created, the material and quantity
   Mockup: https://utfs.io/f/g4w5SXU7E8KdjiaB0RUektSnylW57BEZobPcKpDY4LHifIMz

9. NewTransactionPage (/transactions/new)
   Description: Form page for creating a new transaction using a double-entry system. Layout: header with title and buttons (Post, Cancel). Main form sections: (1) Basic Info – date, reference ID, description, and transaction type. (2) List of quantity transfers - must indicate source and destination account and amount transferred, optionally a batch ID for the source of the transferred amounts.  UI to fill in data to add a new quantity transfer. (3) Batch Allocation – list of batches being created.  each created batch has an associated material and amount.  UI to fill in data to add a new batch.
   Mockup: https://utfs.io/f/g4w5SXU7E8Kdhiom5TpSrNZHUl9gz7BLkn3OpaDe15F84CwY
