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

### ClientHeader

#### Test: Header displays client name prominently
- **Given** the user navigates to a Client Detail Page (/clients/:clientId) for "Acme Corp"
- **Then** the header displays "Acme Corp" as a large, bold heading at the top of the page

#### Test: Header displays type badge
- **Given** the user is on the Client Detail Page for "Acme Corp" which is an organization
- **Then** the header shows an "Organization" badge next to the client name
- **Given** the user is on the Client Detail Page for an individual client
- **Then** the header shows an "Individual" badge next to the client name

#### Test: Header displays status badge with correct color coding
- **Given** the user is on the Client Detail Page for a client with "Active" status
- **Then** the header shows an "Active" status badge styled with a green color
- **Given** the client has "Inactive" status
- **Then** the badge is styled with a grey color
- **Given** the client has "Prospect" status
- **Then** the badge is styled with a yellow/orange color
- **Given** the client has "Churned" status
- **Then** the badge is styled with a red color

#### Test: Header displays tags as chips
- **Given** the user is on the Client Detail Page for "Acme Corp" which has tags "Enterprise", "Software", "High Priority"
- **Then** the header shows each tag as a distinct chip/badge element: "Enterprise", "Software", "High Priority"

#### Test: Header displays source tag with edit pencil icon
- **Given** the user is on the Client Detail Page for "Acme Corp" with source "Referral"
- **Then** the header shows "Referral" as a tag with a pencil/edit icon next to it

#### Test: Clicking tags area opens edit tags interface
- **Given** the user is on the Client Detail Page for "Acme Corp"
- **When** the user clicks the edit pencil icon next to the tags
- **Then** an edit interface (inline editor or modal) opens allowing the user to add, remove, or modify tags
- **When** the user adds a new tag "VIP" and saves
- **Then** the tag "VIP" appears as a new chip in the header
- **And** the change is persisted to the database

#### Test: Editing tags can be cancelled
- **Given** the tag editing interface is open with modifications made
- **When** the user cancels or closes the edit interface
- **Then** the original tags remain unchanged

### QuickActions

#### Test: Quick action buttons are displayed with correct icons and labels
- **Given** the user is on the Client Detail Page
- **Then** four quick action buttons are displayed: "Add Task" with a list/task icon, "Add Deal" with a clock/deal icon, "Add Attachment" with a paperclip/attachment icon, "Add Person" with a person/user icon

#### Test: Add Task button opens task creation dialog
- **Given** the user is on the Client Detail Page for "Acme Corp"
- **When** the user clicks the "Add Task" quick action button
- **Then** a modal dialog opens with a form for creating a new task
- **And** the form includes fields: Task Name (required text input), Due Date (date/time picker), Priority (dropdown with options: High, Medium, Low, Normal), Assignee (dropdown or search), Deal (optional dropdown listing deals associated with this client)
- **And** the client is automatically pre-associated with the task

#### Test: Add Task form creates task successfully
- **Given** the Add Task dialog is open from the Client Detail Page for "Acme Corp"
- **When** the user enters "Send proposal draft" as Task Name, selects a due date, selects "High" as Priority, and clicks save
- **Then** the dialog closes
- **And** the new task "Send proposal draft" appears in the TasksSection on the Client Detail Page
- **And** a success message is shown (e.g., "Task created successfully")
- **And** the task also appears on the Tasks List Page (/tasks)
- **And** a timeline entry is created recording the task creation

#### Test: Add Task form validates required fields
- **Given** the Add Task dialog is open
- **When** the user leaves the Task Name field empty and clicks save
- **Then** a validation error is shown (e.g., "Task name is required")
- **And** the form is not submitted

#### Test: Add Task dialog can be cancelled
- **Given** the Add Task dialog is open with partial data entered
- **When** the user clicks Cancel or closes the dialog
- **Then** the dialog closes without creating a task
- **And** no new task appears in the TasksSection

#### Test: Add Deal button opens deal creation dialog
- **Given** the user is on the Client Detail Page for "Acme Corp"
- **When** the user clicks the "Add Deal" quick action button
- **Then** a modal dialog opens with a form for creating a new deal
- **And** the form includes fields: Deal Name (required text input), Stage (dropdown with options: Lead, Qualification, Discovery, Proposal, Negotiation, Closed Won), Value (currency input), Owner (dropdown or text input)
- **And** the client is automatically pre-associated with the deal

#### Test: Add Deal form creates deal successfully
- **Given** the Add Deal dialog is open from the Client Detail Page for "Acme Corp"
- **When** the user enters "New Enterprise Deal" as Deal Name, selects "Discovery" as Stage, enters "$100,000" as Value, and clicks save
- **Then** the dialog closes
- **And** the new deal "New Enterprise Deal" appears in the DealsSection on the Client Detail Page with stage "Discovery" and value "$100,000"
- **And** a success message is shown (e.g., "Deal created successfully")
- **And** the deal also appears on the Deals List Page (/deals)
- **And** a timeline entry is created recording the deal creation

#### Test: Add Deal form validates required fields
- **Given** the Add Deal dialog is open
- **When** the user leaves the Deal Name field empty and clicks save
- **Then** a validation error is shown (e.g., "Deal name is required")
- **And** the form is not submitted

#### Test: Add Deal dialog can be cancelled
- **Given** the Add Deal dialog is open with partial data entered
- **When** the user clicks Cancel or closes the dialog
- **Then** the dialog closes without creating a deal
- **And** no new deal appears in the DealsSection

#### Test: Add Attachment button opens file upload dialog
- **Given** the user is on the Client Detail Page for "Acme Corp"
- **When** the user clicks the "Add Attachment" quick action button
- **Then** a file upload dialog opens allowing the user to select files from their device
- **And** the dialog optionally allows associating the attachment with an existing deal for this client

#### Test: Add Attachment uploads file successfully
- **Given** the file upload dialog is open from the Client Detail Page for "Acme Corp"
- **When** the user selects a file (e.g., "Proposal_v2.pdf", 1.2 MB) and confirms the upload
- **Then** the dialog closes
- **And** the new file "Proposal_v2.pdf" appears in the AttachmentsSection with the correct type, created date, and linked deal (if selected)
- **And** a success message is shown
- **And** a timeline entry is created recording the attachment upload

#### Test: Add Attachment dialog can be cancelled
- **Given** the file upload dialog is open
- **When** the user clicks Cancel or closes the dialog
- **Then** the dialog closes without uploading any file
- **And** no new attachment appears in the AttachmentsSection

#### Test: Add Person button opens person association dialog
- **Given** the user is on the Client Detail Page for "Acme Corp"
- **When** the user clicks the "Add Person" quick action button
- **Then** a modal dialog opens allowing the user to search for and select an existing individual from the system, or create a new person
- **And** the dialog includes fields for: Person (required, search/select from existing individuals), Role/Title (text input)

#### Test: Add Person associates person successfully
- **Given** the Add Person dialog is open from the Client Detail Page for "Acme Corp"
- **When** the user selects "Jane Doe" as the person and enters "VP Sales" as the role and clicks save
- **Then** the dialog closes
- **And** "Jane Doe - VP Sales" appears in the PeopleSection on the Client Detail Page with an avatar
- **And** a success message is shown
- **And** "Acme Corp" appears in the Associated Clients section on Jane Doe's Person Detail Page
- **And** a timeline entry is created recording the contact addition

#### Test: Add Person form validates required fields
- **Given** the Add Person dialog is open
- **When** the user leaves the Person field empty and clicks save
- **Then** a validation error is shown (e.g., "Person is required")
- **And** the form is not submitted

#### Test: Add Person dialog can be cancelled
- **Given** the Add Person dialog is open with partial data entered
- **When** the user clicks Cancel or closes the dialog
- **Then** the dialog closes without adding any person
- **And** no new person appears in the PeopleSection

### SourceInfoSection

#### Test: Source Info section displays heading
- **Given** the user is on the Client Detail Page
- **Then** the section heading "Source Info" is visible

#### Test: Source Info displays Acquisition Source field
- **Given** the user is on the Client Detail Page for "Acme Corp" with acquisition source "Referral (John Smith)"
- **Then** the Source Info section displays "Acquisition Source" as a field label with the value "Referral (John Smith)"

#### Test: Source Info displays Campaign field
- **Given** the user is on the Client Detail Page for "Acme Corp" with campaign "None"
- **Then** the Source Info section displays "Campaign" as a field label with the value "None"

#### Test: Source Info displays Channel field
- **Given** the user is on the Client Detail Page for "Acme Corp" with channel "Direct Sales"
- **Then** the Source Info section displays "Channel" as a field label with the value "Direct Sales"

#### Test: Source Info displays Date Acquired field
- **Given** the user is on the Client Detail Page for "Acme Corp" with date acquired "2023-01-15"
- **Then** the Source Info section displays "Date Acquired" as a field label with the value "2023-01-15"

#### Test: Source Info Edit button opens edit form
- **Given** the user is on the Client Detail Page
- **Then** an "Edit" button with a pencil icon is displayed in the Source Info section
- **When** the user clicks the "Edit" button
- **Then** an edit form or inline editing interface opens with editable fields for Acquisition Source, Campaign, Channel, and Date Acquired, pre-populated with current values

#### Test: Source Info edit saves changes
- **Given** the Source Info edit form is open
- **When** the user changes the Campaign from "None" to "Q4 Outreach" and clicks save
- **Then** the edit form closes
- **And** the Campaign field now displays "Q4 Outreach"
- **And** the change is persisted to the database

#### Test: Source Info edit can be cancelled
- **Given** the Source Info edit form is open with changes made
- **When** the user clicks Cancel or closes the form
- **Then** the form closes without saving changes
- **And** the original Source Info values remain unchanged

### TasksSection

#### Test: Tasks section displays heading with unresolved tasks label
- **Given** the user is on the Client Detail Page for a client with unresolved tasks
- **Then** the section heading "Tasks" is visible
- **And** a label "Unresolved tasks" is displayed in the section header area

#### Test: Tasks section shows unresolved tasks with checkboxes
- **Given** the user is on the Client Detail Page for "Acme Corp" with unresolved tasks
- **Then** each task displays: an unchecked checkbox, the task name (e.g., "Follow up on proposal"), a due date (e.g., "Due: Today"), and optionally a linked deal name (e.g., "Deal: 'Acme Software License'")

#### Test: Tasks display due dates in relative format
- **Given** the client has tasks with various due dates
- **Then** a task due today shows "Due: Today"
- **And** a task due tomorrow shows "Due: Tomorrow"
- **And** a task due next week shows "Due: Next Week"

#### Test: Tasks display linked deal name when associated
- **Given** the client has a task "Follow up on proposal" linked to deal "Acme Software License"
- **Then** the task entry shows "Deal: 'Acme Software License'" after the due date
- **Given** the client has a task "Schedule onboarding call" not linked to any deal
- **Then** the task entry does not show a deal association

#### Test: Checking a task checkbox marks it as resolved
- **Given** the task "Follow up on proposal" has an unchecked checkbox
- **When** the user clicks the checkbox for "Follow up on proposal"
- **Then** the task is marked as completed with a checked checkbox
- **And** the change is persisted to the database
- **And** a timeline entry is created recording the task completion
- **And** the task's completed status is reflected on the Tasks List Page (/tasks)
- **And** if the task is linked to a deal, the task's completed status is also reflected in the deal's Linked Tasks section on the Deal Detail Page

#### Test: Unchecking a resolved task marks it as unresolved
- **Given** a task has a checked checkbox (completed)
- **When** the user clicks the checkbox to uncheck it
- **Then** the task is marked as unresolved with an unchecked checkbox
- **And** the change is persisted to the database

#### Test: Tasks section shows empty state when no unresolved tasks exist
- **Given** the client has no unresolved tasks
- **Then** the Tasks section shows an empty state message (e.g., "No tasks for this client." or "No unresolved tasks")

### DealsSection

#### Test: Deals section displays heading
- **Given** the user is on the Client Detail Page
- **Then** the section heading "Deals" is visible

#### Test: Deals section shows deal entries with name, stage, and value
- **Given** the user is on the Client Detail Page for "Acme Corp" with deals
- **Then** each deal entry displays: the deal name (e.g., "Acme Software License"), the stage (e.g., "Stage: Proposal Sent"), and the monetary value (e.g., "Value: $50,000")
- **For example**: "Acme Software License - Stage: Proposal Sent, Value: $50,000"
- **And**: "Additional Services - Stage: Qualification, Value: $10,000"

#### Test: Deal entry is clickable and navigates to deal detail page
- **Given** the Deals section shows deal "Acme Software License"
- **When** the user clicks on the "Acme Software License" deal entry
- **Then** the app navigates to the Deal Detail Page (/deals/:dealId) for "Acme Software License"

#### Test: Each deal entry navigates to the correct deal detail page
- **Given** the Deals section shows deal "Additional Services"
- **When** the user clicks on the "Additional Services" deal entry
- **Then** the app navigates to the Deal Detail Page (/deals/:dealId) for "Additional Services"

#### Test: Deals section shows empty state when no deals exist
- **Given** the client has no deals
- **Then** the Deals section shows an empty state message (e.g., "No deals for this client")

### AttachmentsSection

#### Test: Attachments section displays heading
- **Given** the user is on the Client Detail Page
- **Then** the section heading "Attachments" is visible

#### Test: Attachments section shows file list with all details
- **Given** the user is on the Client Detail Page for "Acme Corp" with attachments
- **Then** each attachment displays: a type icon (document icon for files, link icon for links), the filename (e.g., "Service Agreement.pdf"), the type label (e.g., "Document" or "Link"), the created date (e.g., "Created: 2023-02-01"), and the linked deal (e.g., "Linked Deal: 'Acme Software License'" or "Linked Deal: None")

#### Test: Document attachment shows download and delete actions
- **Given** the Attachments section shows a document file "Service Agreement.pdf"
- **Then** the entry displays a download icon/button and a delete icon/button

#### Test: Link attachment shows view and delete actions
- **Given** the Attachments section shows a link "Client Website Link"
- **Then** the entry displays a view icon/button (eye icon) and a delete icon/button (instead of a download button)

#### Test: Download action downloads the attachment file
- **Given** the Attachments section shows "Service Agreement.pdf" with a download icon
- **When** the user clicks the download icon next to "Service Agreement.pdf"
- **Then** the file is downloaded to the user's device

#### Test: View action opens the link
- **Given** the Attachments section shows "Client Website Link" with a view icon
- **When** the user clicks the view icon next to "Client Website Link"
- **Then** the link opens in a new browser tab

#### Test: Delete action removes attachment with confirmation
- **Given** the Attachments section shows "Project Scope.docx"
- **When** the user clicks the delete icon next to "Project Scope.docx"
- **Then** a confirmation dialog appears (e.g., "Are you sure you want to delete Project Scope.docx?")
- **When** the user confirms deletion
- **Then** the attachment is removed from the Attachments list
- **And** the deletion is persisted to the database
- **And** if the attachment was linked to a deal, it is also removed from the deal's Attachments section on the Deal Detail Page
- **When** the user cancels deletion
- **Then** the attachment remains in the list

#### Test: Attachments display linked deal when associated
- **Given** the attachment "Service Agreement.pdf" is linked to deal "Acme Software License"
- **Then** the entry shows "Linked Deal: 'Acme Software License'"
- **Given** the attachment "Project Scope.docx" is not linked to any deal
- **Then** the entry shows "Linked Deal: None"

#### Test: Attachments section shows empty state when no attachments exist
- **Given** the client has no attachments
- **Then** the Attachments section shows an empty state message (e.g., "No attachments for this client")

### PeopleSection

#### Test: People section displays heading
- **Given** the user is on the Client Detail Page
- **Then** the section heading "People" is visible

#### Test: People section shows person entries with avatar, name, and role
- **Given** the user is on the Client Detail Page for "Acme Corp" with associated individuals
- **Then** each person entry displays: an avatar image, the person's name in bold (e.g., "Sarah Johnson"), a dash separator, and the person's role/title (e.g., "CEO")
- **For example**: avatar, "Sarah Johnson - CEO"
- **And**: avatar, "Michael Chen - CTO"
- **And**: avatar, "Emily Davis - Project Manager"

#### Test: Person entry is clickable and navigates to person detail page
- **Given** the People section shows "Sarah Johnson - CEO"
- **When** the user clicks on the "Sarah Johnson" entry
- **Then** the app navigates to the Person Detail Page (/individuals/:individualId) for "Sarah Johnson"

#### Test: Each person entry navigates to the correct person detail page
- **Given** the People section shows "Michael Chen - CTO"
- **When** the user clicks on the "Michael Chen" entry
- **Then** the app navigates to the Person Detail Page (/individuals/:individualId) for "Michael Chen"

#### Test: People section shows empty state when no individuals are associated
- **Given** the client has no associated individuals
- **Then** the People section shows an empty state message (e.g., "No people associated with this client")

### TimelineSection

#### Test: Timeline section displays heading
- **Given** the user is on the Client Detail Page
- **Then** the section heading "Timeline" is visible

#### Test: Timeline shows entries in reverse chronological order
- **Given** the user is on the Client Detail Page for "Acme Corp" with timeline entries
- **Then** the Timeline section shows entries ordered from most recent first to oldest last
- **And** each entry has a date/time indicator (e.g., "Today", "Yesterday", "2 days ago", "Last Week", "Last Month")

#### Test: Timeline displays task created events
- **Given** the timeline has a task creation event
- **Then** the entry displays the date, "Task Created" as the event type, the task name in quotes (e.g., "'Follow up on proposal'"), and the user who created it as a clickable link (e.g., "by User A")

#### Test: Timeline displays note added events
- **Given** the timeline has a note added event
- **Then** the entry displays the date, "Note Added" as the event type, the note summary in quotes (e.g., "'Client mentioned interest in new features.'"), and the user who added it as a clickable link (e.g., "by User B")

#### Test: Timeline displays deal stage changed events
- **Given** the timeline has a deal stage change event
- **Then** the entry displays the date, "Deal Stage Changed" as the event type, the deal name in quotes (e.g., "'Acme Software License'"), the old and new stages (e.g., "from 'Qualification' to 'Proposal Sent'"), and the user who changed it as a clickable link (e.g., "by User A")

#### Test: Timeline displays email sent events
- **Given** the timeline has an email sent event
- **Then** the entry displays the date, "Email Sent" as the event type, the email subject in quotes (e.g., "'Meeting Confirmation'"), and the recipient as a clickable link (e.g., "to Sarah Johnson")

#### Test: Timeline displays contact added events
- **Given** the timeline has a contact added event
- **Then** the entry displays the date, "Contact Added" as the event type, the contact name in quotes (e.g., "'Michael Chen'"), and the user who added them as a clickable link (e.g., "by User C")

#### Test: Timeline entry user links navigate to correct pages
- **Given** the timeline shows an entry with a clickable user name or contact name
- **When** the user clicks on a person name link (e.g., "Sarah Johnson") in a timeline entry
- **Then** the app navigates to the Person Detail Page (/individuals/:individualId) for that person

#### Test: Timeline updates when new actions occur
- **Given** the user is on the Client Detail Page for "Acme Corp"
- **When** the user creates a new task via the Add Task quick action
- **Then** a new "Task Created" entry appears at the top of the Timeline section with the current date and the action details
- **And** exactly one timeline entry is created (no duplicates)

#### Test: Timeline shows empty state when no events exist
- **Given** the client has no timeline events
- **Then** the Timeline section shows an empty state message (e.g., "No activity yet")

---

## PersonDetailPage (/individuals/:individualId)

### Components
- PersonHeader (name, title, associations, email, phone, location, associated clients links)
- RelationshipsSection (Graph View / List View tabs, relationship entries with name, type, title, client, Link; Filter button, Add Entry button)
- ContactHistorySection (chronological log with date/time, interaction type, summary, team member, edit icon; Filter button, Add Entry button)
- AssociatedClientsSection (client cards with icon, name, status, industry, View Client Detail Page button)

### PersonHeader

#### Test: Header displays person's full name prominently
- **Given** the user navigates to a Person Detail Page (/individuals/:individualId) for "Dr. Anya Sharma"
- **Then** the header displays "Dr. Anya Sharma" as a large, bold heading at the top of the page

#### Test: Header displays title and client associations
- **Given** the user is on the Person Detail Page for "Dr. Anya Sharma"
- **Then** the header shows the person's title "Chief Technology Officer (CTO)" below the name
- **And** the title is followed by a pipe separator and client associations "Innovate Solutions Inc. & FutureTech Corp."

#### Test: Header displays email with mail icon
- **Given** the user is on the Person Detail Page for "Dr. Anya Sharma"
- **Then** the header shows a mail icon followed by the email address "anya.sharma@example.com"

#### Test: Header displays phone number with phone icon
- **Given** the user is on the Person Detail Page for "Dr. Anya Sharma"
- **Then** the header shows a phone icon followed by the phone number "+1 (555) 123-4567"

#### Test: Header displays location with location pin icon
- **Given** the user is on the Person Detail Page for "Dr. Anya Sharma"
- **Then** the header shows a location pin icon followed by the location "San Francisco, CA"

#### Test: Header displays associated clients as clickable links
- **Given** the user is on the Person Detail Page for "Dr. Anya Sharma" who is associated with "Innovate Solutions Inc." and "FutureTech Corp."
- **Then** the header shows "Associated Clients:" followed by "Innovate Solutions Inc." and "FutureTech Corp." as clickable, underlined links separated by commas

#### Test: Associated client link navigates to client detail page
- **Given** the user is on the Person Detail Page for "Dr. Anya Sharma"
- **When** the user clicks the "Innovate Solutions Inc." link in the Associated Clients row
- **Then** the app navigates to the Client Detail Page (/clients/:clientId) for "Innovate Solutions Inc."

#### Test: Each associated client link navigates correctly
- **Given** the user is on the Person Detail Page for "Dr. Anya Sharma"
- **When** the user clicks the "FutureTech Corp." link in the Associated Clients row
- **Then** the app navigates to the Client Detail Page (/clients/:clientId) for "FutureTech Corp."

### RelationshipsSection

#### Test: Relationships section displays heading with icon
- **Given** the user is on the Person Detail Page
- **Then** the section heading "Relationships with Other Individuals" is visible with a relationship/link icon to the left

#### Test: Relationships section shows Graph View and List View tabs
- **Given** the user is on the Person Detail Page
- **Then** the Relationships section displays two tabs: "Graph View" and "List View"
- **And** one tab is visually highlighted as active (e.g., underline or bold text)

#### Test: List View displays relationship entries with all details
- **Given** the user is on the Person Detail Page with List View active in the Relationships section
- **Then** each relationship entry shows: the related person's name in bold, relationship type in parentheses (e.g., "Colleague", "Decision Maker", "Influencer"), a dash separator, their title, their client/company name, and a "[Link]" clickable link
- **For example**: "David Chen (Colleague) - V.P. Engineering, Innovate Solutions Inc. [Link]"

#### Test: Relationship entry Link navigates to the related person's detail page
- **Given** the Relationships section shows "David Chen (Colleague) - V.P. Engineering, Innovate Solutions Inc. [Link]"
- **When** the user clicks the "[Link]" next to "David Chen"
- **Then** the app navigates to the Person Detail Page (/individuals/:individualId) for "David Chen"

#### Test: Each relationship Link navigates to the correct person
- **Given** the Relationships section shows "Maria Rodriguez (Decision Maker) - CEO, FutureTech Corp. [Link]"
- **When** the user clicks the "[Link]" next to "Maria Rodriguez"
- **Then** the app navigates to the Person Detail Page (/individuals/:individualId) for "Maria Rodriguez"

#### Test: Switching to Graph View tab
- **Given** the user is on the Person Detail Page with List View active
- **When** the user clicks the "Graph View" tab
- **Then** the "Graph View" tab becomes visually highlighted as active
- **And** the "List View" tab returns to its default non-active state
- **And** a visual relationship graph is displayed showing the person and their connections

#### Test: Switching back to List View from Graph View
- **Given** the user is on the Person Detail Page with Graph View active
- **When** the user clicks the "List View" tab
- **Then** the "List View" tab becomes visually highlighted as active
- **And** the relationship entries are displayed in list format again

#### Test: Filter button is displayed in Relationships section
- **Given** the user is on the Person Detail Page
- **Then** a "Filter" button with a filter icon is displayed in the Relationships section header area

#### Test: Filter button opens filter options for relationships
- **Given** the user is on the Person Detail Page
- **When** the user clicks the "Filter" button in the Relationships section
- **Then** filter options appear allowing the user to filter relationships by type (e.g., Colleague, Decision Maker, Influencer) or by client

#### Test: Add Entry button is displayed in Relationships section
- **Given** the user is on the Person Detail Page
- **Then** a "+ Add Entry" button is displayed in the Relationships section header area

#### Test: Add Entry button opens relationship creation form
- **Given** the user is on the Person Detail Page
- **When** the user clicks the "+ Add Entry" button in the Relationships section
- **Then** a modal or form opens with fields for: Related Person (required, search/select from existing individuals), Relationship Type (required, dropdown with options such as Colleague, Decision Maker, Influencer), and optionally Client association

#### Test: New relationship entry can be created successfully
- **Given** the relationship creation form is open
- **When** the user selects "Sarah Lee" as the Related Person
- **And** selects "Colleague" as the Relationship Type
- **And** clicks save/submit
- **Then** the form closes
- **And** a new entry "Sarah Lee (Colleague) - Product Lead, Innovate Solutions Inc. [Link]" appears in the Relationships list
- **And** a reciprocal relationship entry is also created on Sarah Lee's Person Detail Page linking back to the current individual

#### Test: Add Entry form validates required fields
- **Given** the relationship creation form is open
- **When** the user leaves the Related Person field empty and clicks save
- **Then** a validation error is shown (e.g., "Related person is required")
- **And** the form is not submitted

#### Test: Add Entry form can be cancelled
- **Given** the relationship creation form is open with partial data entered
- **When** the user clicks Cancel or closes the form
- **Then** the form closes without creating a relationship
- **And** no new entry appears in the Relationships list

#### Test: Relationships section shows empty state when no relationships exist
- **Given** the person has no relationships with other individuals
- **Then** the Relationships section shows an empty state message (e.g., "No relationships yet")

### ContactHistorySection

#### Test: Contact History section displays heading with icon
- **Given** the user is on the Person Detail Page
- **Then** the section heading "History of Contact" is visible with a clock/history icon to the left

#### Test: Contact History shows chronological log entries
- **Given** the user is on the Person Detail Page with contact history entries
- **Then** the Contact History section shows entries in reverse chronological order (most recent first)
- **And** each entry displays: date/time, interaction type, a "Summary:" label followed by the summary text, a "Team Member:" label followed by the team member name and role in parentheses, and an edit (pencil) icon
- **For example**: "Oct 26, 2023, 2:30 PM | Video Call | Summary: Discussed Q4 roadmap integration. Action items assigned. | Team Member: Michael B. (Sales Lead)"

#### Test: Contact History displays various interaction types
- **Given** the person has contact history entries of different types
- **Then** entries display interaction types including "Video Call", "Email", "Meeting (In-person)", and "Note"

#### Test: Contact History entries show team member with role
- **Given** the person has contact history entries
- **Then** single team member entries show format "Team Member: Michael B. (Sales Lead)"
- **And** entries with multiple team members show format "Team Member: Michael B., Emily R."

#### Test: Contact History entry edit icon opens edit form
- **Given** the Contact History section shows entries with edit (pencil) icons
- **When** the user clicks the edit icon on a contact history entry
- **Then** an edit form or modal opens pre-populated with the entry's date/time, interaction type, summary, and team member

#### Test: Contact History entry edit saves changes
- **Given** the edit form is open for a contact history entry
- **When** the user changes the summary text and clicks save
- **Then** the form closes
- **And** the updated summary is displayed in the contact history entry

#### Test: Contact History entry edit can be cancelled
- **Given** the edit form is open for a contact history entry with changes made
- **When** the user clicks Cancel or closes the form
- **Then** the form closes without saving changes
- **And** the original entry content remains unchanged

#### Test: Filter button is displayed in Contact History section
- **Given** the user is on the Person Detail Page
- **Then** a "Filter" button with a filter icon is displayed in the Contact History section header area

#### Test: Filter button opens filter options for contact history
- **Given** the user is on the Person Detail Page
- **When** the user clicks the "Filter" button in the Contact History section
- **Then** filter options appear allowing the user to filter entries by interaction type (e.g., Video Call, Email, Meeting, Note) or by date range

#### Test: Add Entry button is displayed in Contact History section
- **Given** the user is on the Person Detail Page
- **Then** a "+ Add Entry" button is displayed in the Contact History section header area

#### Test: Add Entry button opens contact history creation form
- **Given** the user is on the Person Detail Page
- **When** the user clicks the "+ Add Entry" button in the Contact History section
- **Then** a modal or form opens with fields for: Date/Time (required, date/time picker), Interaction Type (required, dropdown with options: Video Call, Email, Meeting (In-person), Note), Summary (required, text area), Team Member (required, search/select)

#### Test: New contact history entry can be created successfully
- **Given** the contact history creation form is open
- **When** the user selects today's date and time
- **And** selects "Email" as the Interaction Type
- **And** enters "Sent proposal follow-up" as the Summary
- **And** selects "Emily R. (Account Manager)" as the Team Member
- **And** clicks save/submit
- **Then** the form closes
- **And** the new entry appears at the top of the Contact History list with the correct date/time, type, summary, and team member
- **And** a success message is shown

#### Test: Add Entry form validates required fields
- **Given** the contact history creation form is open
- **When** the user leaves the Summary field empty and clicks save
- **Then** a validation error is shown (e.g., "Summary is required")
- **And** the form is not submitted

#### Test: Add Entry form can be cancelled
- **Given** the contact history creation form is open with partial data entered
- **When** the user clicks Cancel or closes the form
- **Then** the form closes without creating an entry
- **And** no new entry appears in the Contact History section

#### Test: Contact History section shows empty state when no history exists
- **Given** the person has no contact history entries
- **Then** the Contact History section shows an empty state message (e.g., "No contact history yet")

### AssociatedClientsSection

#### Test: Associated Clients section displays heading with icon
- **Given** the user is on the Person Detail Page
- **Then** the section heading "Associated Clients" is visible with an icon to the left

#### Test: Associated Clients shows client cards with all details
- **Given** the person is associated with clients "Innovate Solutions Inc." and "FutureTech Corp."
- **Then** the Associated Clients section displays a card for each client
- **And** each card shows: a client icon, the client name in bold (e.g., "Innovate Solutions Inc."), "Status:" followed by the client status (e.g., "Active Client", "Prospect"), "Industry:" followed by the industry (e.g., "Software", "Hardware"), and a "View Client Detail Page" button with an external link icon

#### Test: Client card displays correct status for each client
- **Given** the person is associated with "Innovate Solutions Inc." (Active Client) and "FutureTech Corp." (Prospect)
- **Then** the "Innovate Solutions Inc." card shows "Status: Active Client"
- **And** the "FutureTech Corp." card shows "Status: Prospect"

#### Test: Client card displays correct industry for each client
- **Given** the person is associated with "Innovate Solutions Inc." (Software) and "FutureTech Corp." (Hardware)
- **Then** the "Innovate Solutions Inc." card shows "Industry: Software"
- **And** the "FutureTech Corp." card shows "Industry: Hardware"

#### Test: View Client Detail Page button navigates to client detail page
- **Given** the Associated Clients section shows a card for "Innovate Solutions Inc."
- **When** the user clicks the "View Client Detail Page" button on the "Innovate Solutions Inc." card
- **Then** the app navigates to the Client Detail Page (/clients/:clientId) for "Innovate Solutions Inc."

#### Test: Each View Client Detail Page button navigates correctly
- **Given** the Associated Clients section shows a card for "FutureTech Corp."
- **When** the user clicks the "View Client Detail Page" button on the "FutureTech Corp." card
- **Then** the app navigates to the Client Detail Page (/clients/:clientId) for "FutureTech Corp."

#### Test: Associated Clients section shows empty state when no clients exist
- **Given** the person is not associated with any clients
- **Then** the Associated Clients section shows an empty state message (e.g., "No associated clients")

---

## DealsListPage (/deals)

### Components
- DealsSummaryCards (Total Active Deals, Pipeline Value, Won Q3 count+value, Lost Q3 count+value)
- DealsViewTabs (Table View, Pipeline View)
- DealsFilters (Stage dropdown, Client dropdown, Status dropdown, Date Range picker, Sort by dropdown, Search input)
- DealsTable (columns: Deal Name, Client, Stage, Owner, Value, Close Date, Status badge, row action menu)
- CreateDealButton
- Pagination

### DealsSummaryCards

#### Test: Summary cards display Total Active Deals count
- **Given** the user navigates to the Deals List Page (/deals)
- **Then** a summary card labeled "Total Active Deals:" is displayed
- **And** the card shows the count of all active deals (e.g., "124")
- **And** the card has an icon to the left of the text

#### Test: Summary cards display Pipeline Value
- **Given** the user is on the Deals List Page
- **Then** a summary card labeled "Pipeline Value:" is displayed
- **And** the card shows the total monetary value of the active pipeline (e.g., "$4.5M")
- **And** the card has an icon to the left of the text

#### Test: Summary cards display Won Q3 count and value
- **Given** the user is on the Deals List Page
- **Then** a summary card labeled "Won (Q3):" is displayed
- **And** the card shows the count of deals won in Q3 followed by the total value in parentheses (e.g., "32 ($1.2M)")
- **And** the card has an icon to the left of the text

#### Test: Summary cards display Lost Q3 count and value
- **Given** the user is on the Deals List Page
- **Then** a summary card labeled "Lost (Q3):" is displayed
- **And** the card shows the count of deals lost in Q3 followed by the total value in parentheses (e.g., "18 ($0.6M)")
- **And** the card has an icon to the left of the text

#### Test: Summary cards update when deals data changes
- **Given** the user is on the Deals List Page with summary cards showing current totals
- **When** a new deal is created
- **Then** the "Total Active Deals" count increments by 1
- **And** the "Pipeline Value" updates to include the new deal's value

### DealsViewTabs

#### Test: View tabs display Table View and Pipeline View options
- **Given** the user is on the Deals List Page
- **Then** two view tabs are displayed: "Table View" and "Pipeline View"
- **And** "Table View" is selected/active by default with a visual highlight (e.g., underline or bold text)

#### Test: Table View tab shows deals in table format
- **Given** the user is on the Deals List Page with "Table View" active
- **Then** the deals are displayed in a table with columns: Deal Name, Client, Stage, Owner, Value, Close Date, Status
- **And** each row has a "..." action menu on the right side

#### Test: Pipeline View tab shows deals in pipeline/board format
- **Given** the user is on the Deals List Page
- **When** the user clicks the "Pipeline View" tab
- **Then** the "Pipeline View" tab becomes visually highlighted as active
- **And** the "Table View" tab returns to its default non-active state
- **And** the deals are displayed in a pipeline/board layout grouped by deal stage columns

#### Test: Switching back to Table View from Pipeline View
- **Given** the user is on the Deals List Page with "Pipeline View" active
- **When** the user clicks the "Table View" tab
- **Then** the "Table View" tab becomes visually highlighted as active
- **And** the deals are displayed in the table format again

### DealsFilters

#### Test: Stage dropdown filters by deal stage
- **Given** the Deals List Page is loaded with deals in various stages (e.g., Discovery, Qualification, Proposal Sent, Negotiation, Closed Won)
- **When** the user selects "Discovery" from the Stage dropdown (default "All Stages")
- **Then** only deals with stage "Discovery" are shown in the table
- **And** the Stage dropdown displays "Discovery"
- **When** the user selects "All Stages" from the Stage dropdown
- **Then** all deals are shown regardless of stage

#### Test: Client dropdown filters by associated client
- **Given** the Deals List Page is loaded with deals associated with various clients (e.g., "Acme Corp.", "Beta Industries", "Gamma Solutions")
- **When** the user selects "Acme Corp." from the Client dropdown (default "All Clients")
- **Then** only deals associated with "Acme Corp." are shown in the table
- **And** the Client dropdown displays "Acme Corp."
- **When** the user selects "All Clients" from the Client dropdown
- **Then** all deals are shown regardless of client

#### Test: Status dropdown filters by deal status
- **Given** the Deals List Page is loaded with deals of various statuses (On Track, Needs Attention, At Risk, Won)
- **When** the user selects "On Track" from the Status dropdown (default "Active")
- **Then** only deals with status "On Track" are shown in the table
- **And** the Status dropdown displays "On Track"
- **When** the user selects "Active" from the Status dropdown
- **Then** all active deals are shown

#### Test: Date Range picker filters by close date range
- **Given** the Deals List Page is loaded with deals having various close dates
- **When** the user selects a date range (e.g., from "2023-10-01" to "2023-11-30") using the Date Range picker
- **Then** only deals with a close date within the selected range are shown
- **And** the Date Range picker displays the selected range

#### Test: Sort by dropdown changes table ordering
- **Given** the Deals List Page is loaded with multiple deals
- **When** the user selects "Close Date (Newest)" from the Sort by dropdown
- **Then** deals are ordered by close date with the newest first
- **When** the user selects "Close Date (Oldest)" from the Sort by dropdown
- **Then** deals are ordered by close date with the oldest first
- **When** the user selects "Value (Highest)" from the Sort by dropdown
- **Then** deals are ordered by value with the highest first
- **When** the user selects "Value (Lowest)" from the Sort by dropdown
- **Then** deals are ordered by value with the lowest first

#### Test: Search input filters deals by name
- **Given** the Deals List Page is loaded with multiple deals (e.g., "Project Alpha Expansion", "Q4 Marketing Campaign", "Enterprise License Renewal")
- **When** the user types "Alpha" into the search input (placeholder "Search deals...")
- **Then** only deals whose name matches "Alpha" are shown (e.g., "Project Alpha Expansion")
- **And** non-matching deals are hidden

#### Test: Search input shows empty state when no results match
- **Given** the Deals List Page is loaded with deals
- **When** the user types "zzzznonexistent" into the search input
- **Then** the table shows an empty state message (e.g., "No deals found")
- **And** the pagination is hidden or shows no results

#### Test: Clearing search resets the filter
- **Given** the user has typed "Alpha" into the search input and the table is filtered
- **When** the user clears the search input (backspace or clear icon)
- **Then** all deals are shown again (subject to any active dropdown filters)

#### Test: Multiple filters combine correctly
- **Given** the Deals List Page is loaded with deals
- **When** the user selects "Discovery" from the Stage dropdown
- **And** the user selects "Acme Corp." from the Client dropdown
- **Then** only deals that are in "Discovery" stage AND associated with "Acme Corp." are shown
- **When** the user additionally types "Platform" into the search input
- **Then** only deals matching all three filters are shown

### DealsTable

#### Test: Table displays all column headers
- **Given** the Deals List Page is loaded with Table View active
- **Then** the table shows column headers: Deal Name, Client, Stage, Owner, Value, Close Date, Status
- **And** each row has a "..." action menu on the right side

#### Test: Deal Name column displays deal names as clickable links
- **Given** the table shows deals
- **Then** each deal name is displayed as a clickable link
- **When** the user clicks on a deal name (e.g., "Project Alpha Expansion")
- **Then** the app navigates to the Deal Detail Page (/deals/:dealId) for that deal

#### Test: Client column displays associated client name
- **Given** the table shows deals
- **Then** each row displays the associated client name in the Client column (e.g., "Acme Corp.", "Beta Industries")

#### Test: Stage column displays deal stage
- **Given** the table shows deals in different stages
- **Then** each row displays the deal's current stage (e.g., "Proposal Sent", "Qualification", "Negotiation", "Discovery", "Closed Won")

#### Test: Owner column displays deal owner name
- **Given** the table shows deals with different owners
- **Then** each row displays the deal owner's abbreviated name (e.g., "Sarah K.", "Mike R.", "Emily L.", "Chris B.")

#### Test: Value column displays deal monetary value
- **Given** the table shows deals with different values
- **Then** each row displays the deal's value formatted as currency (e.g., "$250,000", "$75,000", "$450,000")

#### Test: Close Date column displays date and supports sorting
- **Given** the table shows deals with different close dates
- **Then** each row displays the close date (e.g., "2023-11-15", "2023-12-01")
- **And** the Close Date column header has a sort indicator arrow
- **When** the user clicks the Close Date column header
- **Then** the table sorts by close date

#### Test: Status column shows color-coded badges
- **Given** the table shows deals with different statuses
- **Then** "On Track" status is shown as a blue/teal badge
- **And** "Needs Attention" status is shown as a yellow/orange badge
- **And** "At Risk" status is shown as a red badge
- **And** "Won" status is shown as a green badge

#### Test: Row action menu opens with options
- **Given** the table shows deals
- **When** the user clicks the "..." action menu on a deal row
- **Then** a dropdown menu appears with options such as "View Details", "Edit", "Delete"

#### Test: Row action menu "View Details" navigates to deal detail
- **Given** the row action menu is open for deal "Project Alpha Expansion"
- **When** the user clicks "View Details"
- **Then** the app navigates to the Deal Detail Page (/deals/:dealId) for "Project Alpha Expansion"

#### Test: Row action menu "Edit" opens edit dialog
- **Given** the row action menu is open for a deal
- **When** the user clicks "Edit"
- **Then** an edit dialog opens pre-populated with the deal's current data (Deal Name, Client, Stage, Owner, Value, Close Date, Status)
- **When** the user changes the deal value and saves
- **Then** the updated value is reflected in the deals table

#### Test: Row action menu "Edit" dialog can be cancelled
- **Given** the row action menu is open for a deal
- **When** the user clicks "Edit"
- **Then** an edit dialog opens pre-populated with the deal's current data
- **When** the user changes the deal value and clicks Cancel
- **Then** the dialog closes without saving changes
- **And** the original deal value remains unchanged in the table

#### Test: Row action menu "Delete" with confirmation
- **Given** the row action menu is open for deal "Q4 Marketing Campaign"
- **When** the user clicks "Delete"
- **Then** a confirmation dialog appears (e.g., "Are you sure you want to delete Q4 Marketing Campaign?")
- **When** the user confirms deletion
- **Then** the deal is removed from the table
- **And** the summary cards update to reflect the removal (e.g., Total Active Deals decrements)
- **And** the pagination count updates accordingly
- **When** the user cancels deletion
- **Then** the deal remains in the table

#### Test: Table shows empty state when no deals exist
- **Given** there are no deals in the system
- **Then** the table shows an empty state message (e.g., "No deals yet. Create your first deal to get started.")
- **And** there may be a call-to-action button to create a deal

### CreateDealButton

#### Test: Create New Deal button is displayed as a blue primary button
- **Given** the user is on the Deals List Page
- **Then** a "Create New Deal" button is displayed in the top-right area of the page
- **And** the button is styled as a blue primary button

#### Test: Create New Deal button opens creation dialog
- **Given** the user is on the Deals List Page
- **When** the user clicks the "Create New Deal" button
- **Then** a modal dialog opens with a form for creating a new deal
- **And** the form includes fields: Deal Name (required text input), Client (dropdown to select an existing client), Stage (dropdown with options: Lead, Qualification, Discovery, Proposal, Negotiation, Closed Won), Owner (dropdown or text input), Value (currency input), Close Date (date picker), Status (dropdown with options: On Track, Needs Attention, At Risk)

#### Test: Create New Deal form validates required fields
- **Given** the Create New Deal dialog is open
- **When** the user leaves the Deal Name field empty and submits the form
- **Then** a validation error is shown on the Deal Name field (e.g., "Deal name is required")
- **And** the form is not submitted

#### Test: Create New Deal form creates a deal successfully
- **Given** the Create New Deal dialog is open
- **When** the user enters "New Enterprise Deal" as Deal Name, selects "Acme Corp." as Client, selects "Discovery" as Stage, enters "Sarah K." as Owner, enters "$500,000" as Value, selects a close date, and selects "On Track" as Status
- **And** the user clicks the submit/save button
- **Then** the dialog closes
- **And** the new deal "New Enterprise Deal" appears in the deals table with the correct Client, Stage, Owner, Value, Close Date, and Status
- **And** a success message is shown (e.g., "Deal created successfully")
- **And** the summary cards update to reflect the new deal (Total Active Deals increments, Pipeline Value increases)
- **And** the deal appears in the associated client's Deals section on the Client Detail Page

#### Test: Create New Deal dialog can be cancelled
- **Given** the Create New Deal dialog is open and the user has entered partial data
- **When** the user clicks the Cancel button or closes the dialog
- **Then** the dialog closes without creating a deal
- **And** no new deal appears in the table

### Pagination

#### Test: Pagination displays current page information
- **Given** the system has multiple pages of deals and the page size is configured
- **Then** the pagination shows "Page 1 of X" (e.g., "Page 1 of 9")

#### Test: Clicking Next page loads the next set of deals
- **Given** the user is on page 1 of deals
- **When** the user clicks the Next page button
- **Then** the table updates to show the next page of deals
- **And** the pagination text updates to "Page 2 of 9"

#### Test: Clicking Previous page loads the previous set of deals
- **Given** the user is on page 2 of deals
- **When** the user clicks the Previous page button
- **Then** the table updates to show the first page of deals
- **And** the pagination text updates to "Page 1 of 9"

#### Test: Previous button is disabled on first page
- **Given** the user is on the first page of deals
- **Then** the Previous page button is disabled or visually inactive

#### Test: Next button is disabled on last page
- **Given** the user is on the last page of deals
- **Then** the Next page button is disabled or visually inactive

#### Test: Pagination resets when filters change
- **Given** the user is on page 3 of deals
- **When** the user applies a filter (e.g., Stage: Discovery)
- **Then** the pagination resets to page 1
- **And** the page count updates to reflect the filtered total

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

### DealHeader

#### Test: Deal header displays deal title with client name and deal name
- **Given** the user navigates to a deal detail page for "Acme Corp - $250k Expansion Deal"
- **Then** the header displays "DEAL DETAILS: Acme Corp - $250k Expansion Deal" as the page title

#### Test: Deal header displays Client field
- **Given** the user is on the Deal Detail Page
- **Then** the header shows a "Client:" label with an editable text field displaying the client name (e.g., "Acme Corporation")

#### Test: Deal header displays Value field
- **Given** the user is on the Deal Detail Page
- **Then** the header shows a "Value:" label with an editable text field displaying the deal value (e.g., "$250,000")

#### Test: Deal header displays Owner field
- **Given** the user is on the Deal Detail Page
- **Then** the header shows an "Owner:" label with an editable text field displaying the deal owner (e.g., "Sarah Lee")

#### Test: Deal header displays Stage dropdown
- **Given** the user is on the Deal Detail Page
- **Then** the header shows a "Stage:" label with a dropdown displaying the current stage (e.g., "Discovery")
- **And** the dropdown has a chevron icon indicating it is expandable

#### Test: Deal header Stage dropdown shows all stage options
- **Given** the user is on the Deal Detail Page
- **When** the user clicks the Stage dropdown
- **Then** the dropdown shows options: Lead, Qualification, Discovery, Proposal, Negotiation, Closed Won

#### Test: Deal header Change Stage button updates the stage
- **Given** the user is on the Deal Detail Page with the deal in "Discovery" stage
- **When** the user selects "Proposal" from the Stage dropdown
- **And** the user clicks the "Change Stage" button (blue button)
- **Then** the deal's stage updates to "Proposal"
- **And** the Stage dropdown now shows "Proposal"
- **And** the StageProgressBar updates to reflect "Proposal" as the current stage
- **And** a new entry is added to the Deal History section recording the stage change from "Discovery" to "Proposal" with the current date/time and user

#### Test: Deal header Client field is clickable and editable
- **Given** the user is on the Deal Detail Page
- **When** the user clicks the Client field and changes it to "Globex Solutions"
- **And** the change is saved
- **Then** the Client field displays "Globex Solutions"
- **And** the deal title updates to reflect the new client name

#### Test: Deal header Value field is editable
- **Given** the user is on the Deal Detail Page with value "$250,000"
- **When** the user clicks the Value field and changes it to "$300,000"
- **And** the change is saved
- **Then** the Value field displays "$300,000"
- **And** the deal title updates to reflect the new value

#### Test: Deal header Owner field is editable
- **Given** the user is on the Deal Detail Page with owner "Sarah Lee"
- **When** the user clicks the Owner field and changes it to "John Doe"
- **And** the change is saved
- **Then** the Owner field displays "John Doe"

### StageProgressBar

#### Test: Stage progress bar displays all six stages in order
- **Given** the user is on the Deal Detail Page
- **Then** the stage progress bar shows six stages in order: Lead, Qualification, Discovery, Proposal, Negotiation, Closed Won
- **And** each stage has a circular icon and label text

#### Test: Stage progress bar marks completed stages with blue checkmarks
- **Given** the deal is currently in the "Discovery" stage
- **Then** the "Lead" stage shows a blue filled circle with a checkmark icon
- **And** the "Qualification" stage shows a blue filled circle with a checkmark icon
- **And** the progress bar segment between Lead and Qualification is filled blue
- **And** the progress bar segment between Qualification and Discovery is filled blue

#### Test: Stage progress bar marks current stage with "(Current)" label
- **Given** the deal is currently in the "Discovery" stage
- **Then** the "Discovery" stage shows a blue filled circle with a checkmark icon
- **And** the "Discovery" label includes "(Current)" text

#### Test: Stage progress bar marks future stages as grey/incomplete
- **Given** the deal is currently in the "Discovery" stage
- **Then** the "Proposal" stage shows a grey unfilled circle
- **And** the "Negotiation" stage shows a grey unfilled circle
- **And** the "Closed Won" stage shows a grey unfilled circle
- **And** the progress bar segments for future stages are grey/unfilled

#### Test: Stage progress bar updates when stage changes
- **Given** the deal is currently in the "Discovery" stage
- **When** the user changes the stage to "Proposal" via the header Stage dropdown and Change Stage button
- **Then** the "Discovery" stage no longer shows "(Current)"
- **And** the "Discovery" stage still shows a blue checkmark (completed)
- **And** the "Proposal" stage now shows a blue checkmark with "(Current)" label
- **And** the progress bar fills blue up to the Proposal segment

### DealHistorySection

#### Test: Deal History section displays heading
- **Given** the user is on the Deal Detail Page
- **Then** the "Deal History" heading is visible

#### Test: Deal History section shows chronological stage change entries
- **Given** the deal has had stage changes
- **Then** the Deal History section shows entries in reverse chronological order (most recent first)
- **And** each entry displays: date/time, "Changed Stage from [old stage] to [new stage]", and the user who made the change in parentheses
- **For example**: "Oct 25, 2023, 2:30 PM: Changed Stage from Qualification to Discovery (Sarah Lee)"
- **And**: "Oct 18, 2023, 10:15 AM: Changed Stage from Lead to Qualification (John Doe)"

#### Test: Deal History records a new entry when stage is changed
- **Given** the deal is in "Discovery" stage with existing history entries
- **When** the user changes the stage to "Proposal" via the Change Stage button
- **Then** a new entry appears at the top of the Deal History section
- **And** the entry shows the current date/time, "Changed Stage from Discovery to Proposal", and the current user's name
- **And** exactly one new history entry is created (no duplicates)

#### Test: Deal History shows empty state when no history exists
- **Given** a newly created deal with no stage changes
- **Then** the Deal History section shows an empty state or initial creation entry

### DealMetricsSection

#### Test: Deal Metrics section displays heading
- **Given** the user is on the Deal Detail Page
- **Then** the "Deal Metrics" heading is visible

#### Test: Deal Metrics shows probability percentage
- **Given** the deal has a probability of 40%
- **Then** the Deal Metrics section displays "Probability: 40%"

#### Test: Deal Metrics shows expected close date
- **Given** the deal has an expected close date of Dec 15, 2023
- **Then** the Deal Metrics section displays "Expected Close: Dec 15, 2023"

#### Test: Deal Metrics probability is editable
- **Given** the deal has a probability of 40%
- **When** the user clicks on the probability value and changes it to 60%
- **And** the change is saved
- **Then** the Deal Metrics section displays "Probability: 60%"

#### Test: Deal Metrics expected close date is editable
- **Given** the deal has an expected close date of Dec 15, 2023
- **When** the user clicks on the expected close date and changes it to Jan 31, 2024
- **And** the change is saved
- **Then** the Deal Metrics section displays "Expected Close: Jan 31, 2024"

### WriteupsSection

#### Test: Writeups section displays heading and New Entry button
- **Given** the user is on the Deal Detail Page
- **Then** the "Writeups" heading is visible
- **And** a "+ New Entry" button with a plus icon is displayed next to the heading

#### Test: Writeups section shows existing writeup entries
- **Given** the deal has writeup entries
- **Then** each entry displays: a bold title (e.g., "Strategy Update"), date (e.g., "Oct 20"), author name in parentheses (e.g., "Sarah Lee"), and a content summary below
- **For example**: "Strategy Update - Oct 20 (Sarah Lee)" with summary "Emphasizing our cloud integration capabilities. Client seems receptive..."
- **And**: "Needs Analysis - Oct 15 (John Doe)" with summary "Client requires scalability and enhanced security features."

#### Test: Writeup entry has Edit button
- **Given** the Writeups section shows entries
- **Then** each entry shows an "Edit" button with a pencil icon at the bottom
- **When** the user clicks the "Edit" button on "Strategy Update"
- **Then** an edit form or modal opens pre-populated with the writeup title, content, and metadata

#### Test: Writeup entry has Version History button
- **Given** the Writeups section shows entries
- **Then** each entry shows a "Version History" button with a clock/history icon
- **When** the user clicks the "Version History" button on "Strategy Update"
- **Then** a modal or panel shows previous versions of the writeup with dates and content changes

#### Test: New Entry button opens writeup creation form
- **Given** the user is on the Deal Detail Page
- **When** the user clicks the "+ New Entry" button
- **Then** a form or modal opens with fields for: Title (required text input), Content (required rich text or textarea)

#### Test: New writeup entry can be created successfully
- **Given** the writeup creation form is open
- **When** the user enters "Competitive Analysis" as the title
- **And** enters "Identified three competing proposals..." as the content
- **And** clicks save/submit
- **Then** the form closes
- **And** the new entry "Competitive Analysis" appears in the Writeups section with the current date and user
- **And** a success message is shown

#### Test: New writeup entry form validates required fields
- **Given** the writeup creation form is open
- **When** the user leaves the Title field empty and clicks save
- **Then** a validation error is shown (e.g., "Title is required")
- **And** the form is not submitted

#### Test: Writeup edit saves changes
- **Given** the user clicks Edit on the "Strategy Update" writeup
- **And** the edit form is open with existing content
- **When** the user changes the title to "Strategy Update - Revised" and updates the content
- **And** clicks save
- **Then** the updated title and content are displayed in the Writeups section
- **And** a new version is recorded in the version history

#### Test: Writeup creation form can be cancelled
- **Given** the writeup creation form is open with partial data entered
- **When** the user clicks Cancel or closes the form
- **Then** the form closes without creating a new entry
- **And** no new writeup appears in the section

#### Test: Writeup edit form can be cancelled
- **Given** the edit form is open for "Strategy Update" with changes made
- **When** the user clicks Cancel or closes the form
- **Then** the form closes without saving changes
- **And** the original writeup content remains unchanged

### LinkedTasksSection

#### Test: Linked Tasks section displays heading and Add Task button
- **Given** the user is on the Deal Detail Page
- **Then** the "Linked Tasks" heading is visible
- **And** an "Add Task" button is displayed next to the heading

#### Test: Linked Tasks section shows task list with checkboxes
- **Given** the deal has linked tasks
- **Then** each task shows a checkbox, task name, and due date or completed date
- **For example**: an unchecked checkbox with "Prepare Proposal Draft (Due: Oct 30)"
- **And**: a checked checkbox with strikethrough or completed style showing "Schedule Follow-up Meeting (Completed: Oct 22)"

#### Test: Checking a task checkbox marks it as completed
- **Given** the task "Prepare Proposal Draft" is unchecked (incomplete)
- **When** the user clicks the checkbox for "Prepare Proposal Draft"
- **Then** the task is marked as completed with a checked checkbox
- **And** the task display changes to show a completed date instead of due date (e.g., "Completed: [today's date]")
- **And** the change is persisted to the database
- **And** the task's completed status is also reflected on the client's Tasks section

#### Test: Unchecking a completed task marks it as incomplete
- **Given** the task "Schedule Follow-up Meeting" is checked (completed)
- **When** the user clicks the checkbox for "Schedule Follow-up Meeting"
- **Then** the task is marked as incomplete with an unchecked checkbox
- **And** the task display reverts to show the due date

#### Test: Add Task button opens task creation form
- **Given** the user is on the Deal Detail Page
- **When** the user clicks the "Add Task" button
- **Then** a form or modal opens with fields for: Task Name (required), Due Date (date picker)

#### Test: New linked task can be created successfully
- **Given** the task creation form is open
- **When** the user enters "Send revised proposal" as the task name
- **And** selects a due date of Nov 15
- **And** clicks save/submit
- **Then** the form closes
- **And** the new task "Send revised proposal (Due: Nov 15)" appears in the Linked Tasks list with an unchecked checkbox
- **And** the task also appears in the client's Tasks section linked to this deal

#### Test: Add Task form validates required fields
- **Given** the task creation form is open
- **When** the user leaves the Task Name field empty and clicks save
- **Then** a validation error is shown (e.g., "Task name is required")
- **And** the form is not submitted

#### Test: Add Task form can be cancelled
- **Given** the task creation form is open with partial data entered
- **When** the user clicks Cancel or closes the form
- **Then** the form closes without creating a task
- **And** no new task appears in the list

### DealAttachmentsSection

#### Test: Attachments section displays heading and upload button
- **Given** the user is on the Deal Detail Page
- **Then** the "Attachments" heading is visible
- **And** an upload button with a cloud upload icon is displayed next to the heading

#### Test: Attachments section shows file list with details
- **Given** the deal has attachments
- **Then** each attachment displays: filename, file size in parentheses, a "Download" link, and a "Delete" link separated by a pipe
- **For example**: "Acme_Requirements.pdf (2.4 MB) - Download | Delete"
- **And**: "Meeting_Notes_Oct18.docx (50 KB) - Download | Delete"

#### Test: Upload button opens file upload dialog
- **Given** the user is on the Deal Detail Page
- **When** the user clicks the upload button (cloud upload icon)
- **Then** a file upload dialog opens allowing the user to select files from their device

#### Test: File upload adds new attachment to the list
- **Given** the file upload dialog is open
- **When** the user selects a file (e.g., "Proposal_v2.pdf", 1.2 MB)
- **And** the upload completes
- **Then** the new file "Proposal_v2.pdf (1.2 MB)" appears in the attachments list with Download and Delete links
- **And** the attachment is also visible in the associated client's Attachments section linked to this deal

#### Test: Download link downloads the attachment file
- **Given** the attachments section shows "Acme_Requirements.pdf"
- **When** the user clicks the "Download" link next to "Acme_Requirements.pdf"
- **Then** the file is downloaded to the user's device

#### Test: Delete link removes the attachment with confirmation
- **Given** the attachments section shows "Meeting_Notes_Oct18.docx"
- **When** the user clicks the "Delete" link next to "Meeting_Notes_Oct18.docx"
- **Then** a confirmation dialog appears (e.g., "Are you sure you want to delete Meeting_Notes_Oct18.docx?")
- **When** the user confirms deletion
- **Then** the file is removed from the attachments list
- **And** the file is also removed from the client's Attachments section
- **When** the user cancels deletion
- **Then** the file remains in the list

#### Test: Attachments section shows empty state when no files exist
- **Given** the deal has no attachments
- **Then** the section shows an empty state (e.g., "No attachments yet") or just the upload button

### DealContactsSection

#### Test: Contacts/Individuals section displays heading
- **Given** the user is on the Deal Detail Page
- **Then** the "Contacts/Individuals" heading is visible

#### Test: Contacts section shows person entries with details
- **Given** the deal has associated contacts
- **Then** each contact entry shows: an avatar image, the person's name in bold, their role and client in parentheses, and a "View Profile" link
- **For example**: avatar, "Jane Smith (Decision Maker, Acme Corp) - View Profile"
- **And**: avatar, "Bob Johnson (Influencer, Acme Corp) - View Profile"

#### Test: View Profile link navigates to person detail page
- **Given** the contacts section shows "Jane Smith"
- **When** the user clicks the "View Profile" link next to Jane Smith
- **Then** the app navigates to the Person Detail Page (/individuals/:individualId) for Jane Smith

#### Test: View Profile link navigates correctly for each contact
- **Given** the contacts section shows "Bob Johnson"
- **When** the user clicks the "View Profile" link next to Bob Johnson
- **Then** the app navigates to the Person Detail Page (/individuals/:individualId) for Bob Johnson

#### Test: Contacts section shows empty state when no contacts exist
- **Given** the deal has no associated contacts
- **Then** the section shows an empty state (e.g., "No contacts linked to this deal")

#### Test: Add contact to deal
- **Given** the user is on the Deal Detail Page
- **When** the user clicks an "Add Contact" button or action in the Contacts/Individuals section
- **Then** a dialog or form opens allowing the user to search for and select an existing individual from the system
- **When** the user selects "Mike Wilson (Technical Lead, Acme Corp)" and confirms
- **Then** "Mike Wilson (Technical Lead, Acme Corp) - View Profile" appears in the contacts list
- **And** the deal is reflected in the individual's associated deals

#### Test: Add Contact dialog can be cancelled
- **Given** the Add Contact dialog is open
- **When** the user clicks the Cancel button or closes the dialog
- **Then** the dialog closes without adding any contact
- **And** no new contact appears in the contacts list

#### Test: Remove contact from deal
- **Given** the contacts section shows "Bob Johnson"
- **When** the user clicks a remove/unlink action for Bob Johnson
- **Then** a confirmation dialog appears (e.g., "Remove Bob Johnson from this deal?")
- **When** the user confirms
- **Then** Bob Johnson is removed from the contacts list
- **And** the deal is no longer shown in Bob Johnson's associated deals

---

## TasksListPage (/tasks)

### Components
- TasksHeader (page title, New Task button)
- TasksFilter (filter type dropdown, text filter input)
- TasksList (task cards with priority badge color-coded High/Medium/Low/Normal, task name, due date, assignee avatar + name/role, action menu ...)

### TasksHeader

#### Test: Page title displays "Upcoming Tasks"
- **Given** the user navigates to the Tasks List Page (/tasks)
- **Then** the page displays "Upcoming Tasks" as the heading
- **And** the heading is prominently styled (large, bold text)

#### Test: New Task button is displayed as a blue primary button
- **Given** the user is on the Tasks List Page
- **Then** a "New Task" button is displayed in the top-right area of the header
- **And** the button is styled as a blue primary button

#### Test: New Task button opens task creation dialog
- **Given** the user is on the Tasks List Page
- **When** the user clicks the "New Task" button
- **Then** a modal dialog opens with a form for creating a new task
- **And** the form includes fields: Task Name (required text input), Due Date (date/time picker), Priority (dropdown with options: High, Medium, Low, Normal), Assignee (dropdown or search showing user name and role), Client (dropdown to associate the task with a client), Deal (optional dropdown to associate the task with a deal, populated based on selected client)

#### Test: New Task form validates required fields
- **Given** the New Task dialog is open
- **When** the user leaves the Task Name field empty and clicks save/submit
- **Then** a validation error is shown on the Task Name field (e.g., "Task name is required")
- **And** the form is not submitted

#### Test: New Task can be created successfully
- **Given** the New Task dialog is open
- **When** the user enters "Prepare quarterly report" as the Task Name
- **And** selects a due date of tomorrow at 3:00 PM
- **And** selects "High" as the Priority
- **And** selects an assignee from the Assignee dropdown
- **And** selects "Acme Corp" as the Client
- **And** clicks save/submit
- **Then** the dialog closes
- **And** the new task "Prepare quarterly report" appears in the tasks list with a red "High" priority badge, the correct due date ("Due: Tomorrow, ..."), and the selected assignee visible
- **And** a success message is shown (e.g., "Task created successfully")
- **And** the task also appears in the associated client's Tasks section on the Client Detail Page

#### Test: New Task dialog can be cancelled
- **Given** the New Task dialog is open and the user has entered partial data
- **When** the user clicks the Cancel button or closes the dialog
- **Then** the dialog closes without creating a task
- **And** no new task appears in the tasks list

#### Test: New Task with optional deal association
- **Given** the New Task dialog is open
- **When** the user selects "Acme Corp" as the Client
- **And** selects "Acme Corp - $250k Expansion Deal" from the Deal dropdown
- **And** fills in the remaining required fields and submits
- **Then** the task is created and linked to both the client and the deal
- **And** the task appears in the deal's Linked Tasks section on the Deal Detail Page
- **And** the task appears in the client's Tasks section with the deal association visible

### TasksFilter

#### Test: Filter type dropdown is displayed with filter icon
- **Given** the user is on the Tasks List Page
- **Then** a filter type dropdown is displayed with a filter icon (lines icon) and a chevron indicating it is expandable
- **And** the dropdown defaults to a general filter mode (e.g., "All Fields")

#### Test: Filter type dropdown shows filter category options
- **Given** the user is on the Tasks List Page
- **When** the user clicks the filter type dropdown
- **Then** the dropdown shows filter category options such as: All Fields, Priority, Assignee, Client, Due Date

#### Test: Text filter input is displayed with placeholder
- **Given** the user is on the Tasks List Page
- **Then** a text filter input is displayed next to the filter type dropdown
- **And** the input shows the placeholder text "Filter..."

#### Test: Text filter filters tasks by task name
- **Given** the Tasks List Page is loaded with multiple tasks (e.g., "Finalize Q3 Marketing Plan", "Review Client Proposal Draft", "Update Team Documentation", "Prepare Weekly Status Report")
- **When** the user types "Marketing" into the text filter input
- **Then** only tasks whose name contains "Marketing" are shown (e.g., "Finalize Q3 Marketing Plan")
- **And** non-matching tasks are hidden

#### Test: Filter by Priority category
- **Given** the user is on the Tasks List Page with tasks of various priorities
- **When** the user selects "Priority" from the filter type dropdown
- **And** types "High" into the text filter input
- **Then** only tasks with "High" priority are shown
- **And** tasks with Medium, Low, and Normal priorities are hidden

#### Test: Filter by Assignee category
- **Given** the user is on the Tasks List Page with tasks assigned to different people
- **When** the user selects "Assignee" from the filter type dropdown
- **And** types "Sarah" into the text filter input
- **Then** only tasks assigned to users matching "Sarah" are shown (e.g., tasks assigned to "Sarah J. (PM)")
- **And** tasks assigned to other users are hidden

#### Test: Filter by Client category
- **Given** the user is on the Tasks List Page with tasks associated with different clients
- **When** the user selects "Client" from the filter type dropdown
- **And** types "Acme" into the text filter input
- **Then** only tasks associated with clients matching "Acme" are shown
- **And** tasks associated with other clients are hidden

#### Test: Filter by Due Date category
- **Given** the user is on the Tasks List Page with tasks that have different due dates (e.g., one due today and one due in the future)
- **When** the user selects "Due Date" from the filter type dropdown
- **And** types "Today" into the text filter input
- **Then** only tasks whose formatted due date contains "Today" are shown (e.g., a task due today)
- **And** tasks with other due dates are hidden

#### Test: Text filter shows empty state when no results match
- **Given** the Tasks List Page is loaded with tasks
- **When** the user types "zzzznonexistent" into the text filter input
- **Then** an empty state message is shown (e.g., "No tasks found")

#### Test: Clearing the text filter resets results
- **Given** the user has typed "Marketing" into the text filter and the list is filtered
- **When** the user clears the text filter input (backspace or clear action)
- **Then** all tasks are shown again

#### Test: Changing filter type resets the text filter
- **Given** the user has selected "Priority" from the filter type dropdown and typed "High" into the text filter
- **When** the user changes the filter type dropdown to "Assignee"
- **Then** the text filter input is cleared
- **And** all tasks are shown until the user enters a new filter value

### TasksList

#### Test: Task cards display all required elements
- **Given** the Tasks List Page is loaded with tasks
- **Then** each task card displays: a color-coded priority badge, the task name in bold text, a due date, an assignee avatar with abbreviated name and role, and a "..." action menu button

#### Test: Priority badges are color-coded correctly
- **Given** the Tasks List Page shows tasks with different priorities
- **Then** "High" priority tasks show a red/orange badge labeled "High"
- **And** "Medium" priority tasks show a yellow badge labeled "Medium"
- **And** "Low" priority tasks show a green badge labeled "Low"
- **And** "Normal" priority tasks show a blue/teal badge labeled "Normal"

#### Test: Task name is displayed in bold
- **Given** the Tasks List Page shows a task named "Finalize Q3 Marketing Plan"
- **Then** the task name "Finalize Q3 Marketing Plan" is displayed in bold text within the task card

#### Test: Due date displays relative dates for upcoming tasks
- **Given** a task is due today at 5:00 PM
- **Then** the due date displays "Due: Today, 5:00 PM"
- **Given** a task is due tomorrow at 10:00 AM
- **Then** the due date displays "Due: Tomorrow, 10:00 AM"

#### Test: Due date displays absolute dates for future tasks
- **Given** a task is due on Oct 25, 2024
- **Then** the due date displays "Due: Oct 25, 2024"

#### Test: Assignee displays avatar, abbreviated name, and role
- **Given** a task is assigned to Sarah Jenkins who is a PM
- **Then** the task card shows an avatar image, "Sarah J." as the abbreviated name, and "(PM)" as the role in parentheses
- **Given** a task is assigned to David Lee who is in Sales
- **Then** the task card shows an avatar image, "David L." as the abbreviated name, and "(Sales)" as the role

#### Test: Tasks are ordered by due date with soonest first
- **Given** the Tasks List Page is loaded with multiple tasks with different due dates
- **Then** tasks are displayed in chronological order with the soonest due date at the top (e.g., "Due: Today" before "Due: Tomorrow" before "Due: Oct 25, 2024")

#### Test: Action menu opens with options
- **Given** the Tasks List Page shows task cards
- **When** the user clicks the "..." action menu on a task card (e.g., "Finalize Q3 Marketing Plan")
- **Then** a dropdown menu appears with options such as "View Details", "Edit", "Mark as Complete", "Delete"

#### Test: Action menu "View Details" navigates to associated client detail page
- **Given** the action menu is open for task "Finalize Q3 Marketing Plan" which is associated with client "Acme Corp"
- **When** the user clicks "View Details"
- **Then** the app navigates to the Client Detail Page (/clients/:clientId) for "Acme Corp"

#### Test: Action menu "Edit" opens task edit dialog
- **Given** the action menu is open for a task
- **When** the user clicks "Edit"
- **Then** an edit dialog opens pre-populated with the task's current data (name, due date, priority, assignee, client, deal)
- **When** the user changes the priority from "High" to "Medium" and saves
- **Then** the task card updates to show a yellow "Medium" priority badge instead of the red "High" badge
- **And** the change is persisted to the database

#### Test: Action menu "Edit" dialog can be cancelled
- **Given** the edit dialog is open for a task with modifications made
- **When** the user clicks Cancel or closes the dialog
- **Then** the dialog closes without saving changes
- **And** the task card retains its original values

#### Test: Action menu "Mark as Complete" completes the task
- **Given** the action menu is open for task "Finalize Q3 Marketing Plan"
- **When** the user clicks "Mark as Complete"
- **Then** the task is marked as completed
- **And** the task is removed from the "Upcoming Tasks" list (or displayed with a completed visual style such as strikethrough)
- **And** the task's completed status is reflected on the associated client's Tasks section on the Client Detail Page
- **And** if the task is linked to a deal, the task's completed status is also reflected in the deal's Linked Tasks section

#### Test: Action menu "Delete" removes task with confirmation
- **Given** the action menu is open for task "Prepare Weekly Status Report"
- **When** the user clicks "Delete"
- **Then** a confirmation dialog appears (e.g., "Are you sure you want to delete this task?")
- **When** the user confirms deletion
- **Then** the task is removed from the tasks list
- **And** the task is also removed from the associated client's Tasks section
- **And** if linked to a deal, the task is removed from the deal's Linked Tasks section
- **When** the user cancels deletion
- **Then** the task remains in the list

#### Test: Task list shows empty state when no tasks exist
- **Given** there are no upcoming tasks in the system
- **Then** the tasks list shows an empty state message (e.g., "No upcoming tasks. Create a new task to get started.")
- **And** there may be a call-to-action button to create a task

#### Test: Clicking a task card navigates to associated client detail page
- **Given** the Tasks List Page shows a task card for "Review Client Proposal Draft" associated with client "Globex Solutions"
- **When** the user clicks on the task card (on the task name area)
- **Then** the app navigates to the Client Detail Page (/clients/:clientId) for "Globex Solutions"
