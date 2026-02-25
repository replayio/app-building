# Sales CRM — Test Specification

## Sidebar (persistent across all pages)

### Components: SidebarNavigation, SidebarAuth

#### SidebarNavigation

**Sidebar displays all navigation links with icons**
Given the app loads on any page, the sidebar displays exactly six navigation links — Clients, Contacts, Deals, Tasks, Team, and Settings — each with a corresponding icon. No Dashboard, Reports, or other placeholder links are shown.

**Clients link navigates to /clients**
Given the user is on any page, when they click the "Clients" link in the sidebar, the app navigates to /clients and the ClientsListPage is displayed.

**Contacts link navigates to /contacts**
Given the user is on any page, when they click the "Contacts" link in the sidebar, the app navigates to /contacts and the ContactsListPage is displayed.

**Deals link navigates to /deals**
Given the user is on any page, when they click the "Deals" link in the sidebar, the app navigates to /deals and the DealsListPage is displayed.

**Tasks link navigates to /tasks**
Given the user is on any page, when they click the "Tasks" link in the sidebar, the app navigates to /tasks and the TasksListPage is displayed.

**Team link navigates to /users**
Given the user is on any page, when they click the "Team" link in the sidebar, the app navigates to /users and the UsersListPage is displayed.

**Settings link navigates to /settings**
Given the user is on any page, when they click the "Settings" link in the sidebar, the app navigates to /settings and the SettingsPage is displayed.

**Active link is visually highlighted for current page**
Given the user is on /clients, the "Clients" sidebar link has a visually distinct active state (e.g., highlighted background or bold text), and all other links appear in their default inactive style. The same highlighting applies to whichever page is current — navigating to /deals highlights "Deals", navigating to /tasks highlights "Tasks", etc.

**Active state updates on navigation**
Given the user is on /clients with the "Clients" link highlighted, when they click the "Deals" link, the highlight moves from "Clients" to "Deals" and the app navigates to /deals.

**Sidebar persists across page navigation**
When the user navigates between pages (e.g., from /clients to /deals to /tasks), the sidebar remains visible and does not re-mount or lose state.

#### SidebarAuth

**Sign In button displays when not authenticated**
Given the user is not logged in, the sidebar user area (upper left, below the app title) shows a "Sign In" button. No avatar, name, or sign-out control is visible.

**Clicking Sign In reveals inline auth form**
Given the user is not authenticated, when they click the "Sign In" button, an inline form appears within the sidebar containing: an email input field, a password input field, a "Sign In" submit button, a "Forgot password?" link, and a toggle to switch to "Sign Up" mode.

**Sign In form submission with valid credentials**
Given the inline auth form is visible in Sign In mode, when the user enters a valid email and password and clicks the "Sign In" submit button, the user is authenticated, the inline form disappears, and the sidebar user area shows the user's avatar (or initials), name, and a sign-out button.

**Sign In form shows error for invalid credentials**
Given the inline auth form is visible in Sign In mode, when the user enters an invalid email/password combination and clicks "Sign In", an error message is displayed within the form and the form remains visible for correction.

**Sign In / Sign Up toggle switches form mode**
Given the inline auth form is visible in Sign In mode, when the user clicks the "Sign Up" toggle, the form switches to Sign Up mode — the submit button text changes to "Sign Up" and the toggle text changes to allow switching back to "Sign In". Clicking the toggle again returns to Sign In mode.

**Sign Up form submission creates account (test mode)**
Given the inline auth form is in Sign Up mode, when the user fills in an email and password and clicks "Sign Up", in test mode (IS_TEST=true) the account is auto-confirmed, the user is immediately logged in, and the sidebar shows avatar/name/sign-out. In production mode, a message indicates a confirmation email has been sent.

**Forgot password link navigates to /auth/forgot-password**
Given the inline auth form is visible, when the user clicks the "Forgot password?" link, the app navigates to /auth/forgot-password.

**Avatar and name display when authenticated**
Given the user is logged in, the sidebar user area (upper left, below app title) displays the user's avatar (or initials fallback), their display name, and a sign-out control. The "Sign In" button is not visible.

**Sign Out returns to unauthenticated state**
Given the user is logged in and their avatar/name is displayed in the sidebar, when they click the sign-out button, the user is logged out, the avatar/name/sign-out controls disappear, and the "Sign In" button reappears in the sidebar user area.

**Auth state persists across page navigation**
Given the user is logged in, when they navigate between different pages (e.g., /clients to /deals to /settings), their avatar, name, and sign-out button remain visible in the sidebar user area throughout.

---

## ClientsListPage (/clients)

### Components: ClientsListHeader, ClientsSearchAndFilters, ClientsTable, ClientsPagination, AddClientModal, ImportDialog

#### ClientsListHeader

**Page title displays "Clients"**
Given the user navigates to /clients, the page displays the heading "Clients" at the top left of the content area.

**Import button is visible with icon and label**
Given the user is on /clients, the header area displays an "Import" button with a download/import icon and the text "Import".

**Import button opens ImportDialog**
Given the user is on /clients, when they click the "Import" button, an ImportDialog modal opens for importing clients from CSV.

**Export button is visible with icon and label**
Given the user is on /clients, the header area displays an "Export" button with an export icon and the text "Export".

**Export button triggers CSV download**
Given the user is on /clients, when they click the "Export" button, a CSV file containing the current clients data is downloaded. The file includes columns matching the client data fields (Name, Type, Status, Tags, Source Type, Source Detail, Campaign, Channel, Date Acquired).

**Add New Client button is visible with plus icon**
Given the user is on /clients, the header area displays a primary-styled (blue) "+ Add New Client" button with a plus icon and the text "Add New Client".

**Add New Client button opens AddClientModal**
Given the user is on /clients, when they click the "+ Add New Client" button, the AddClientModal dialog opens with a form to create a new client.

#### ClientsSearchAndFilters

**Search bar is visible with placeholder text**
Given the user is on /clients, a search input is displayed with placeholder text "Search clients by name, tag, or contact..." and a search icon.

**Search filters clients by name**
Given the user is on /clients with multiple clients displayed, when the user types "Acme" into the search bar, the table filters to show only clients whose name matches "Acme" (e.g., "Acme Corp"). The filtering applies with debounced input.

**Search filters clients by tag**
Given the user is on /clients, when the user types "Enterprise" into the search bar, the table filters to show clients that have the "Enterprise" tag.

**Search filters clients by contact name**
Given the user is on /clients, when the user types "Sarah" into the search bar, the table filters to show clients whose primary contact name contains "Sarah".

**Search clears results when input is cleared**
Given the user has typed a search term and the table is filtered, when the user clears the search input, all clients are displayed again (unfiltered, subject to other active filters).

**Status dropdown displays "Status: All" by default**
Given the user is on /clients, the Status filter dropdown displays "Status: All" as its default selected value.

**Status dropdown filters by Active**
Given the user is on /clients, when they open the Status dropdown and select "Active", only clients with status "Active" are shown in the table. The dropdown label updates to reflect the selection.

**Status dropdown filters by Inactive**
Given the user is on /clients, when they select "Inactive" from the Status dropdown, only clients with status "Inactive" are shown.

**Status dropdown filters by Prospect**
Given the user is on /clients, when they select "Prospect" from the Status dropdown, only clients with status "Prospect" are shown.

**Status dropdown filters by Churned**
Given the user is on /clients, when they select "Churned" from the Status dropdown, only clients with status "Churned" are shown.

**Status dropdown resets to All**
Given the user has filtered by a specific status, when they select "All" from the Status dropdown, all clients are displayed regardless of status.

**Tags dropdown displays "Tags: All" by default**
Given the user is on /clients, the Tags filter dropdown displays "Tags: All" as its default value.

**Tags dropdown filters by a specific tag**
Given the user is on /clients, when they open the Tags dropdown and select a tag (e.g., "Enterprise"), only clients that have that tag are shown in the table.

**Tags dropdown resets to All**
Given the user has filtered by a tag, when they select "All" from the Tags dropdown, all clients are displayed regardless of tags.

**Source dropdown displays "Source: All" by default**
Given the user is on /clients, the Source filter dropdown displays "Source: All" as its default value.

**Source dropdown filters by a specific source**
Given the user is on /clients, when they open the Source dropdown and select a specific acquisition source, only clients with that source are shown in the table.

**Source dropdown resets to All**
Given the user has filtered by a source, when they select "All" from the Source dropdown, all clients are displayed regardless of source.

**Sort dropdown displays "Sort: Recently Updated" by default**
Given the user is on /clients, the Sort dropdown displays "Sort: Recently Updated" as its default value.

**Sort dropdown changes sort order**
Given the user is on /clients, when they open the Sort dropdown and select a different sort option (e.g., by name, by date created), the table reorders clients according to the selected sort criteria.

**Multiple filters combine together**
Given the user is on /clients, when they set Status to "Active", Tags to "Enterprise", and type "Corp" in the search bar, the table shows only clients that match all three criteria simultaneously (AND logic).

#### ClientsTable

**Table displays correct column headers**
Given the user is on /clients, the clients table displays column headers in this order: Client Name, Type, Status, Tags, Primary Contact, Open Deals, Next Task. An actions column (no header text) is present as the last column.

**Client Name column displays client names**
Given the user is on /clients with client data, each row shows the client's name in the Client Name column (e.g., "Acme Corp", "Jane Doe").

**Type column displays Organization or Individual**
Given the user is on /clients, each row shows the client's type as either "Organization" or "Individual" in the Type column.

**Status column displays color-coded badges**
Given the user is on /clients, each row shows the client's status as a color-coded badge in the Status column: "Active" in green, "Inactive" in gray, "Prospect" in yellow/amber, and "Churned" in red/orange.

**Tags column displays tag badges**
Given the user is on /clients, each row shows the client's tags as comma-separated badges in the Tags column (e.g., "SaaS, Enterprise, Q3-Target"). If a client has no tags, the cell is empty.

**Primary Contact column displays contact name with role**
Given the user is on /clients, each row shows the primary contact's name followed by their role in parentheses (e.g., "Sarah Jenkins (CEO)", "Michael Chen (CTO)"). For individual clients, it shows the client's own name with "(Self)" (e.g., "Jane Doe (Self)").

**Open Deals column displays count and total value**
Given the user is on /clients, each row shows the number of open deals followed by their total value in parentheses (e.g., "3 (Value: $150k)", "5 (Value: $2.1M)"). If a client has zero deals, it shows "0" with no value.

**Next Task column displays upcoming task with date**
Given the user is on /clients, each row shows the next upcoming task description with its due date (e.g., "Follow-up call - Today, 2pm", "Send proposal - Tomorrow"). If no task is scheduled, it shows "No task scheduled" or "N/A".

**Actions menu button visible on each row**
Given the user is on /clients, each row has a three-dot actions menu button ("...") in the last column.

**Actions menu opens on click**
Given the user is on /clients, when they click the three-dot actions menu on a client row, a dropdown menu appears with action options (e.g., Edit, Delete).

**Row click navigates to ClientDetailPage**
Given the user is on /clients, when they click on a client row (anywhere except the actions menu), the app navigates to /clients/:clientId for that client and the ClientDetailPage is displayed.

**Table displays empty state when no clients match filters**
Given the user is on /clients and applies filters that match no clients, the table displays an empty state message indicating no clients were found.

**New client appears in table after creation**
Given the user is on /clients and creates a new client via the AddClientModal, when the modal closes, the newly created client appears in the table without requiring a page refresh.

**Deleted client is removed from table**
Given the user is on /clients and deletes a client via the actions menu, when the deletion is confirmed, the client row is removed from the table without requiring a page refresh.

#### ClientsPagination

**Pagination shows current range and total count**
Given the user is on /clients with more than 50 clients, the pagination area displays text like "Showing 1-50 of 324 clients" indicating the current range and total count.

**Page number buttons are displayed**
Given the user is on /clients with multiple pages of clients, numbered page buttons (1, 2, 3, ...) are displayed in the pagination area, with the current page highlighted.

**Clicking a page number navigates to that page**
Given the user is on /clients viewing page 1, when they click page number "2", the table updates to show the next set of clients (e.g., rows 51-100) and the page 2 button becomes highlighted.

**Previous button is disabled on first page**
Given the user is on /clients viewing page 1, the "Previous" button is disabled or visually inactive, indicating there is no previous page.

**Previous button navigates to the prior page**
Given the user is on /clients viewing page 2, when they click "Previous", the table updates to show page 1 data and the page 1 button becomes highlighted.

**Next button navigates to the next page**
Given the user is on /clients viewing page 1 with multiple pages, when they click "Next", the table updates to show page 2 data and the page 2 button becomes highlighted.

**Next button is disabled on last page**
Given the user is on /clients viewing the last page, the "Next" button is disabled or visually inactive, indicating there is no next page.

**Pagination updates when filters reduce results**
Given the user is on /clients with pagination showing multiple pages, when they apply a filter that reduces the results to fit within one page, the pagination updates to show only one page and the Previous/Next buttons are hidden or disabled.

#### AddClientModal

**Modal opens when Add New Client is clicked**
Given the user is on /clients, when they click "+ Add New Client", a modal dialog appears with a form title (e.g., "Add New Client").

**Modal contains name input field**
Given the AddClientModal is open, the form contains a "Name" text input field that is required.

**Modal contains type selector**
Given the AddClientModal is open, the form contains a "Type" selector allowing choice between "Organization" and "Individual".

**Modal contains status selector**
Given the AddClientModal is open, the form contains a "Status" dropdown with options: Active, Inactive, Prospect, Churned.

**Modal contains tags input**
Given the AddClientModal is open, the form contains a "Tags" input field where the user can add one or more tags.

**Modal contains source fields**
Given the AddClientModal is open, the form contains source-related fields: Source Type, Campaign, and Channel inputs for tracking how the client was acquired.

**Modal submit creates a new client**
Given the AddClientModal is open and the user fills in the required fields (at least name and type) and clicks the submit/save button, the modal closes, the new client is created in the database, and the client appears in the clients table.

**Modal validates required fields**
Given the AddClientModal is open, when the user clicks the submit button without filling in the required Name field, a validation error message is displayed and the form is not submitted.

**Modal cancel closes without saving**
Given the AddClientModal is open and the user has entered some data, when they click the cancel button or close icon, the modal closes and no new client is created.

**Created client appears in table**
Given the user creates a new client via AddClientModal with name "Test Corp", type "Organization", and status "Active", after the modal closes the clients table includes a row for "Test Corp" with the correct type and status.

#### ImportDialog

**ImportDialog opens when Import button is clicked**
Given the user is on /clients, when they click the "Import" button, the ImportDialog modal opens.

**ImportDialog displays CSV format specification table**
Given the ImportDialog is open for clients, it shows a table of expected CSV columns: Name (required), Type (required — Organization or Individual), Status (optional — Active/Inactive/Prospect/Churned), Tags (optional — comma-separated), Source Type (optional), Source Detail (optional), Campaign (optional), Channel (optional), Date Acquired (optional). Each column shows whether it is required or optional and describes valid values.

**ImportDialog has Download CSV template button**
Given the ImportDialog is open, a "Download CSV template" button is visible. When clicked, it downloads a CSV file with the correct column headers pre-filled and no data rows, serving as a template for the user.

**ImportDialog has file upload area**
Given the ImportDialog is open, the dialog contains a file picker or drag-and-drop area for selecting a CSV file to upload.

**ImportDialog validates uploaded CSV**
Given the ImportDialog is open, when the user uploads a CSV file with missing required columns (e.g., no Name column), the dialog displays validation error messages indicating which required columns are missing.

**ImportDialog shows per-row validation errors**
Given the ImportDialog is open, when the user uploads a CSV file where some rows have invalid data (e.g., an invalid Status value or missing Name), the dialog displays per-row error messages indicating which rows failed and why, allowing the user to fix the file and re-upload.

**ImportDialog successfully imports valid CSV**
Given the ImportDialog is open and the user uploads a valid CSV file with properly formatted client data, the import processes successfully, the dialog shows a success message with the count of imported clients, and the clients table updates to include the newly imported clients.

**ImportDialog cancel closes without importing**
Given the ImportDialog is open, when the user clicks the cancel button or close icon, the dialog closes and no data is imported.

---

## ClientDetailPage (/clients/:clientId)

### Components: ClientHeader, QuickActions, SourceInfoSection, TasksSection, DealsSection, AttachmentsSection, PeopleSection, TimelineSection, FollowButton, AddTaskModal, AddDealModal, AddAttachmentModal, AddPersonModal

<!-- Tests for header editing, quick actions, source info, tasks, deals, attachments, people, timeline, follow/unfollow -->

---

## PersonDetailPage (/individuals/:individualId)

### Components: PersonHeader, RelationshipsSection, ContactHistorySection, AssociatedClientsSection

<!-- Tests for header info, relationships graph/list views, contact history entries, associated clients navigation -->

---

## DealsListPage (/deals)

### Components: DealsListHeader, DealsSummaryCards, ViewToggle, DealsFilters, DealsTable, PipelineView, DealsPagination, CreateDealModal, ImportDialog

<!-- Tests for summary stats, table/pipeline views, filtering, sorting, drag-and-drop, create/import deals -->

---

## DealDetailPage (/deals/:dealId)

### Components: DealHeader, DealStagePipeline, DealHistorySection, DealMetricsSection, WriteupsSection, LinkedTasksSection, DealAttachmentsSection, ContactsIndividualsSection

<!-- Tests for header fields, stage changes, history, metrics, writeups, tasks, attachments, contacts -->

---

## TasksListPage (/tasks)

### Components: TasksListHeader, TasksFilter, TaskCardList, CreateTaskModal

<!-- Tests for task cards, filtering, create task, navigation to task detail -->

---

## TaskDetailPage (/tasks/:taskId)

### Components: TaskDetailHeader, TaskNotesSection, TaskActions

<!-- Tests for task info display, notes CRUD, mark complete, cancel -->

---

## ContactsListPage (/contacts)

### Components: ContactsListHeader, ContactsSearch, ContactsTable, ContactsPagination, AddContactModal, ImportDialog

<!-- Tests for search, table columns, pagination, add/import/export contacts, row click navigation -->

---

## SettingsPage (/settings)

### Components: EmailNotificationsSection, ImportExportSection, WebhooksSection, WebhookModal

<!-- Tests for notification toggles, import/export buttons, webhook CRUD, platform setup guides -->

---

## UsersListPage (/users)

### Components: TeamHeader, UserCardGrid

<!-- Tests for user cards display, navigation to user detail -->

---

## UserDetailPage (/users/:userId)

### Components: UserHeader, UserStats, OwnedDealsList, AssignedTasksList, RecentActivityFeed

<!-- Tests for user info, stats, deals list, tasks list, activity feed -->

---

## Auth Pages

### ForgotPasswordPage (/auth/forgot-password)
### Components: ForgotPasswordForm

### ResetPasswordPage (/auth/reset-password)
### Components: ResetPasswordForm

### ConfirmEmailPage (/auth/confirm-email)
### Components: ConfirmEmailHandler

<!-- Tests for forgot password flow, reset password flow, email confirmation flow -->
