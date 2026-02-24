# Sales CRM Test Specification

## ClientsListPage (/clients)

### Components
- Sidebar Navigation (logo, nav links: Dashboard, Clients, Deals, Tasks, Reports, Settings; user profile avatar with dropdown at bottom)
- ClientsSearchAndFilters (search bar with placeholder "Search clients by name, tag, or contact...", Status dropdown defaulting to "All", Tags dropdown defaulting to "All", Source dropdown defaulting to "All", Sort dropdown defaulting to "Recently Updated")
- ClientsActions (Import button with download icon, Export button with upload icon, "+ Add New Client" primary blue button)
- ClientsTable (columns: Client Name, Type, Status badge color-coded Active/Inactive/Prospect/Churned, Tags as chips, Primary Contact with name and role, Open Deals count with total value, Next Task with description and date; row action menu "..." on each row)
- Pagination ("Showing X-Y of Z clients" text, Previous button, numbered page buttons, "..." ellipsis, Next button)

### Sidebar Navigation

#### Test: Sidebar displays all navigation links with correct icons
- **Given** the user is on the Clients List Page
- **Then** the sidebar displays the app logo at the top
- **And** the sidebar shows navigation links: Dashboard, Clients, Deals, Tasks, Reports, Settings, each with a distinct icon
- **And** the "Clients" link is visually highlighted as the active page
- **And** a user profile avatar with a dropdown chevron is shown at the bottom of the sidebar

#### Test: Sidebar navigation links route to correct pages
- **Given** the user is on the Clients List Page
- **When** the user clicks "Dashboard" in the sidebar
- **Then** the app navigates to the Dashboard page (/dashboard)
- **When** the user clicks "Deals" in the sidebar
- **Then** the app navigates to the Deals List Page (/deals)
- **When** the user clicks "Tasks" in the sidebar
- **Then** the app navigates to the Tasks List Page (/tasks)
- **When** the user clicks "Reports" in the sidebar
- **Then** the app navigates to the Reports page (/reports)
- **When** the user clicks "Settings" in the sidebar
- **Then** the app navigates to the Settings page (/settings)

#### Test: Sidebar highlights the active page
- **Given** the user navigates to /clients
- **Then** the "Clients" link in the sidebar has an active/highlighted visual state (e.g., background highlight, bold text)
- **And** all other sidebar links appear in their default non-active state

#### Test: Sidebar user profile dropdown
- **Given** the user is on any page
- **When** the user clicks the user profile avatar/dropdown at the bottom of the sidebar
- **Then** a dropdown menu appears with options such as "Profile", "Log Out"
- **When** the user clicks "Log Out"
- **Then** the user is logged out and redirected to the login page

### ClientsSearchAndFilters

#### Test: Search bar filters clients by name
- **Given** the Clients List Page is loaded with multiple clients (e.g., "Acme Corp", "Globex Solutions", "Jane Doe")
- **When** the user types "Acme" into the search bar
- **Then** only clients whose name matches "Acme" are shown in the table (e.g., "Acme Corp")
- **And** non-matching clients are hidden from the table

#### Test: Search bar filters clients by tag
- **Given** the Clients List Page is loaded with clients that have various tags (e.g., "SaaS", "Enterprise", "Consultant")
- **When** the user types "SaaS" into the search bar
- **Then** clients with a "SaaS" tag are shown in the table
- **And** clients without a "SaaS" tag are hidden

#### Test: Search bar filters clients by contact name
- **Given** the Clients List Page is loaded with clients having primary contacts (e.g., "Sarah Jenkins", "Michael Chen")
- **When** the user types "Sarah" into the search bar
- **Then** clients whose primary contact name contains "Sarah" are shown
- **And** other clients are hidden

#### Test: Search bar shows empty state when no results match
- **Given** the Clients List Page is loaded with clients
- **When** the user types "zzzznonexistent" into the search bar
- **Then** the table shows an empty state message (e.g., "No clients found")
- **And** the pagination is hidden or shows "Showing 0 of 0 clients"

#### Test: Status dropdown filters by client status
- **Given** the Clients List Page is loaded with clients of various statuses (Active, Inactive, Prospect, Churned)
- **When** the user selects "Active" from the Status dropdown
- **Then** only clients with status "Active" are shown in the table
- **And** the Status dropdown displays "Status: Active"
- **When** the user selects "All" from the Status dropdown
- **Then** all clients are shown regardless of status

#### Test: Tags dropdown filters by tag
- **Given** the Clients List Page is loaded with clients that have tags like "Enterprise", "SaaS", "VIP"
- **When** the user selects "Enterprise" from the Tags dropdown
- **Then** only clients that have the "Enterprise" tag are shown
- **And** the Tags dropdown displays "Tags: Enterprise"

#### Test: Source dropdown filters by acquisition source
- **Given** the Clients List Page is loaded with clients from different sources (e.g., "Referral", "Campaign", "Direct")
- **When** the user selects "Referral" from the Source dropdown
- **Then** only clients whose source is "Referral" are shown
- **And** the Source dropdown displays "Source: Referral"

#### Test: Sort dropdown changes table ordering
- **Given** the Clients List Page is loaded with multiple clients
- **When** the user selects "Recently Updated" from the Sort dropdown
- **Then** clients are ordered by most recently updated first
- **When** the user selects "Name A-Z" from the Sort dropdown
- **Then** clients are ordered alphabetically by name ascending
- **When** the user selects "Name Z-A" from the Sort dropdown
- **Then** clients are ordered alphabetically by name descending

#### Test: Multiple filters combine correctly
- **Given** the Clients List Page is loaded with clients
- **When** the user selects "Active" from the Status dropdown
- **And** the user selects "Enterprise" from the Tags dropdown
- **Then** only clients that are both "Active" AND have the "Enterprise" tag are shown
- **When** the user additionally types "Acme" into the search bar
- **Then** only "Active" clients with "Enterprise" tag whose name/tag/contact matches "Acme" are shown

#### Test: Clearing search resets the filter
- **Given** the user has typed "Acme" into the search bar and the table is filtered
- **When** the user clears the search bar (backspace or clear icon)
- **Then** all clients are shown again (subject to any active dropdown filters)

### ClientsActions

#### Test: Import button opens import dialog
- **Given** the user is on the Clients List Page
- **When** the user clicks the "Import" button (with download icon)
- **Then** an import dialog/modal opens
- **And** the dialog shows instructions for the expected CSV format including required columns (Client Name, Type, Status) and optional columns (Tags, Source, Primary Contact)
- **And** the dialog provides a file upload area accepting .csv files

#### Test: Import dialog processes valid CSV file
- **Given** the import dialog is open
- **When** the user uploads a valid CSV file with correctly formatted client data
- **Then** the dialog shows a preview of the clients to be imported with row count
- **When** the user confirms the import
- **Then** the new clients appear in the clients table
- **And** a success message is shown (e.g., "X clients imported successfully")
- **And** the import dialog closes

#### Test: Import dialog can be cancelled
- **Given** the import dialog is open
- **When** the user clicks the Cancel button or closes the dialog
- **Then** the dialog closes without importing any data
- **And** no new clients appear in the table

#### Test: Import dialog rejects invalid file
- **Given** the import dialog is open
- **When** the user uploads a file that is not a CSV or has missing required columns
- **Then** the dialog shows an error message describing the issue (e.g., "Missing required column: Client Name")
- **And** the import does not proceed

#### Test: Export button downloads client data
- **Given** the Clients List Page is loaded with clients
- **When** the user clicks the "Export" button (with upload icon)
- **Then** a CSV file containing all current clients is downloaded
- **And** the file includes columns: Client Name, Type, Status, Tags, Source, Primary Contact, Open Deals, Next Task

#### Test: Export respects current filters
- **Given** the user has filtered the clients table (e.g., Status: Active)
- **When** the user clicks the "Export" button
- **Then** the exported CSV contains only the filtered clients, not all clients

#### Test: Add New Client button opens creation dialog
- **Given** the user is on the Clients List Page
- **When** the user clicks the "+ Add New Client" button (blue primary button)
- **Then** a modal dialog opens with a form for creating a new client
- **And** the form includes fields: Client Name (required text input), Type (Organization/Individual radio or dropdown), Status (dropdown: Active/Inactive/Prospect/Churned), Tags (multi-select or tag input), Source (dropdown or text input)

#### Test: Add New Client form validates required fields
- **Given** the Add New Client dialog is open
- **When** the user leaves the Client Name field empty and submits the form
- **Then** a validation error is shown on the Client Name field (e.g., "Client name is required")
- **And** the form is not submitted

#### Test: Add New Client form creates a client successfully
- **Given** the Add New Client dialog is open
- **When** the user enters "New Corp" as Client Name, selects "Organization" as Type, selects "Prospect" as Status, adds tags "SaaS" and "Startup", and selects "Referral" as Source
- **And** the user clicks the submit/save button
- **Then** the dialog closes
- **And** the new client "New Corp" appears in the clients table with the correct Type, Status, Tags, and Source
- **And** a success message is shown (e.g., "Client created successfully")

#### Test: Add New Client dialog can be cancelled
- **Given** the Add New Client dialog is open and the user has entered partial data
- **When** the user clicks the Cancel button or closes the dialog
- **Then** the dialog closes without creating a client
- **And** no new client appears in the table

### ClientsTable

#### Test: Table displays all column headers
- **Given** the Clients List Page is loaded
- **Then** the table shows column headers: Client Name, Type, Status, Tags, Primary Contact, Open Deals, Next Task
- **And** each row has a "..." action menu on the right side

#### Test: Client Name column displays client names as clickable links
- **Given** the table shows clients
- **Then** each client name is displayed as a clickable link
- **When** the user clicks on a client name (e.g., "Acme Corp")
- **Then** the app navigates to the Client Detail Page (/clients/:clientId) for that client

#### Test: Type column displays Organization or Individual
- **Given** the table shows clients of both types
- **Then** organization clients display "Organization" in the Type column
- **And** individual clients display "Individual" in the Type column

#### Test: Status column shows color-coded badges
- **Given** the table shows clients with different statuses
- **Then** "Active" status is shown as a green badge
- **And** "Inactive" status is shown as a grey badge
- **And** "Prospect" status is shown as a yellow/orange badge
- **And** "Churned" status is shown as a red badge

#### Test: Tags column displays multiple tags as chips
- **Given** a client has multiple tags (e.g., "SaaS", "Enterprise", "Q3-Target")
- **Then** all tags are displayed as individual chip/badge elements in the Tags column
- **And** each tag is visually distinct and readable

#### Test: Primary Contact column shows name and role
- **Given** a client has a primary contact (e.g., "Sarah Jenkins" with role "CEO")
- **Then** the Primary Contact column shows "Sarah Jenkins (CEO)"
- **Given** an individual client where the person is the primary contact
- **Then** the Primary Contact column shows the individual's name with "(Self)"

#### Test: Open Deals column shows count and total value
- **Given** a client has 3 open deals worth a total of $150k
- **Then** the Open Deals column displays "3 (Value: $150k)"
- **Given** a client has 0 open deals
- **Then** the Open Deals column displays "0"

#### Test: Next Task column shows upcoming task description and date
- **Given** a client has an upcoming task (e.g., "Follow-up call" due "Today, 2pm")
- **Then** the Next Task column displays "Follow-up call - Today, 2pm"
- **Given** a client has no upcoming tasks
- **Then** the Next Task column displays "No task scheduled" or "N/A"

#### Test: Row action menu opens with options
- **Given** the table shows clients
- **When** the user clicks the "..." action menu on a client row
- **Then** a dropdown menu appears with options such as "View Details", "Edit", "Delete"

#### Test: Row action menu "View Details" navigates to client detail
- **Given** the row action menu is open for client "Acme Corp"
- **When** the user clicks "View Details"
- **Then** the app navigates to the Client Detail Page (/clients/:clientId) for "Acme Corp"

#### Test: Row action menu "Edit" opens edit dialog
- **Given** the row action menu is open for a client
- **When** the user clicks "Edit"
- **Then** an edit dialog opens pre-populated with the client's current data
- **When** the user changes the client name and saves
- **Then** the updated name is reflected in the clients table

#### Test: Row action menu "Edit" dialog can be cancelled
- **Given** the row action menu is open for a client
- **When** the user clicks "Edit"
- **Then** an edit dialog opens pre-populated with the client's current data
- **When** the user changes the client name and clicks Cancel
- **Then** the dialog closes without saving changes
- **And** the original client name remains unchanged in the table

#### Test: Row action menu "Delete" with confirmation
- **Given** the row action menu is open for client "Globex Solutions"
- **When** the user clicks "Delete"
- **Then** a confirmation dialog appears (e.g., "Are you sure you want to delete Globex Solutions?")
- **When** the user confirms deletion
- **Then** the client is removed from the table
- **And** the pagination count updates accordingly
- **When** the user cancels deletion
- **Then** the client remains in the table

#### Test: Table shows empty state when no clients exist
- **Given** there are no clients in the system
- **Then** the table shows an empty state message (e.g., "No clients yet. Add your first client to get started.")
- **And** there may be a call-to-action button to add a client

### Pagination

#### Test: Pagination displays correct count information
- **Given** the system has 324 clients and the page size is 50
- **Then** the pagination shows "Showing 1-50 of 324 clients"

#### Test: Clicking Next page loads the next set of clients
- **Given** the user is on page 1 showing clients 1-50 of 324
- **When** the user clicks the "Next" button
- **Then** the table updates to show clients 51-100
- **And** the pagination text updates to "Showing 51-100 of 324 clients"
- **And** the "Previous" button becomes enabled

#### Test: Clicking Previous page loads the previous set of clients
- **Given** the user is on page 2 showing clients 51-100
- **When** the user clicks the "Previous" button
- **Then** the table updates to show clients 1-50
- **And** the pagination text updates to "Showing 1-50 of 324 clients"

#### Test: Previous button is disabled on first page
- **Given** the user is on the first page of results
- **Then** the "Previous" button is disabled or visually inactive

#### Test: Next button is disabled on last page
- **Given** the user is on the last page of results
- **Then** the "Next" button is disabled or visually inactive

#### Test: Clicking a specific page number navigates to that page
- **Given** the pagination shows page numbers 1, 2, 3, ...
- **When** the user clicks page number "3"
- **Then** the table updates to show the corresponding range of clients (e.g., clients 101-150)
- **And** page number "3" is visually highlighted as the current page

#### Test: Current page number is visually highlighted
- **Given** the user is on page 1
- **Then** page number "1" is visually highlighted (e.g., bordered, different background)
- **And** other page numbers are not highlighted

#### Test: Pagination resets when filters change
- **Given** the user is on page 3 of unfiltered results
- **When** the user applies a filter (e.g., Status: Active)
- **Then** the pagination resets to page 1
- **And** the count updates to reflect the filtered total (e.g., "Showing 1-50 of 128 clients")

---

## ClientDetailPage (/clients/:clientId)

### Components
- ClientHeader (name, type badge, status badge, tags with edit pencil icon)
- QuickActions (Add Task, Add Deal, Add Attachment, Add Person buttons)
- SourceInfoSection (Acquisition Source, Campaign, Channel, Date Acquired, Edit button)
- TasksSection (unresolved tasks list with checkboxes, due dates, linked deals)
- DealsSection (deal entries with name, stage, value)
- AttachmentsSection (file list with type icon, filename, type label, created date, linked deal, download/view/delete actions)
- PeopleSection (list of associated individuals with avatar, name, role/title)
- TimelineSection (chronological feed: task created, note added, deal stage changed, email sent, contact added)

<!-- Test entries will be added by PlanComponent jobs -->

---

## PersonDetailPage (/individuals/:individualId)

### Components
- PersonHeader (name, title, associations, email, phone, location, associated clients links)
- RelationshipsSection (Graph View / List View tabs, relationship entries with name, type, title, client, Link; Filter button, Add Entry button)
- ContactHistorySection (chronological log with date/time, interaction type, summary, team member, edit icon; Filter button, Add Entry button)
- AssociatedClientsSection (client cards with icon, name, status, industry, View Client Detail Page button)

<!-- Test entries will be added by PlanComponent jobs -->

---

## DealsListPage (/deals)

### Components
- DealsSummaryCards (Total Active Deals, Pipeline Value, Won Q3 count+value, Lost Q3 count+value)
- DealsViewTabs (Table View, Pipeline View)
- DealsFilters (Stage dropdown, Client dropdown, Status dropdown, Date Range picker, Sort by dropdown, Search input)
- DealsTable (columns: Deal Name, Client, Stage, Owner, Value, Close Date, Status badge, row action menu)
- CreateDealButton
- Pagination

<!-- Test entries will be added by PlanComponent jobs -->

---

## DealDetailPage (/deals/:dealId)

### Components
- DealHeader (deal title, Client field, Value field, Owner field, Stage dropdown, Change Stage button)
- StageProgressBar (Lead, Qualification, Discovery, Proposal, Negotiation, Closed Won with visual progress)
- DealHistorySection (chronological stage change log with date/time, old stage, new stage, user)
- DealMetricsSection (Probability percentage, Expected Close date)
- WriteupsSection (entries with title, date, author, content summary, Edit button, Version History button; New Entry button)
- LinkedTasksSection (task list with checkboxes, task name, due date, completed status; Add Task button)
- DealAttachmentsSection (file list with filename, size, Download link, Delete link; upload button)
- DealContactsSection (person entries with avatar, name, role, client, View Profile link)

<!-- Test entries will be added by PlanComponent jobs -->

---

## TasksListPage (/tasks)

### Components
- TasksHeader (page title, New Task button)
- TasksFilter (filter type dropdown, text filter input)
- TasksList (task cards with priority badge color-coded High/Medium/Low/Normal, task name, due date, assignee avatar + name/role, action menu ...)

<!-- Test entries will be added by PlanComponent jobs -->
