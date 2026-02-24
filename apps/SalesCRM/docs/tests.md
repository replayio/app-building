# Sales CRM Test Specification

## Sidebar Navigation

Components: SidebarNavLinks, SidebarUserArea

### SidebarNavLinks

#### Sidebar displays all navigation links with icons
- **Initial state:** App is loaded on any page.
- **Expected:** The sidebar displays six navigation links in order: Clients, Contacts, Deals, Tasks, Team, Settings. Each link has an icon to its left. The sidebar also displays the app logo/title at the top.

#### Clicking Clients link navigates to /clients
- **Initial state:** User is on any page other than Clients.
- **Action:** User clicks the "Clients" link in the sidebar.
- **Expected:** The browser navigates to /clients, the ClientsListPage is displayed, and the "Clients" link in the sidebar is visually highlighted as the active link.

#### Clicking Contacts link navigates to /contacts
- **Initial state:** User is on any page other than Contacts.
- **Action:** User clicks the "Contacts" link in the sidebar.
- **Expected:** The browser navigates to /contacts, the ContactsListPage is displayed, and the "Contacts" link in the sidebar is visually highlighted as the active link.

#### Clicking Deals link navigates to /deals
- **Initial state:** User is on any page other than Deals.
- **Action:** User clicks the "Deals" link in the sidebar.
- **Expected:** The browser navigates to /deals, the DealsListPage is displayed, and the "Deals" link in the sidebar is visually highlighted as the active link.

#### Clicking Tasks link navigates to /tasks
- **Initial state:** User is on any page other than Tasks.
- **Action:** User clicks the "Tasks" link in the sidebar.
- **Expected:** The browser navigates to /tasks, the TasksListPage is displayed, and the "Tasks" link in the sidebar is visually highlighted as the active link.

#### Clicking Team link navigates to /users
- **Initial state:** User is on any page other than Team.
- **Action:** User clicks the "Team" link in the sidebar.
- **Expected:** The browser navigates to /users, the UsersListPage is displayed, and the "Team" link in the sidebar is visually highlighted as the active link.

#### Clicking Settings link navigates to /settings
- **Initial state:** User is on any page other than Settings.
- **Action:** User clicks the "Settings" link in the sidebar.
- **Expected:** The browser navigates to /settings, the SettingsPage is displayed, and the "Settings" link in the sidebar is visually highlighted as the active link.

#### Active link highlights based on current route
- **Initial state:** User navigates to /clients directly via URL.
- **Expected:** The "Clients" link in the sidebar has a highlighted/active background style (e.g., darker background) distinguishing it from the other non-active links. Other links have the default transparent background.

#### Active link updates on sub-routes
- **Initial state:** User navigates to /clients/123 (a client detail page).
- **Expected:** The "Clients" link in the sidebar is highlighted as the active link, since the route is a sub-route of /clients.

#### Sidebar is persistent across all pages
- **Initial state:** User navigates between different pages (Clients, Deals, Tasks, etc.).
- **Expected:** The sidebar remains visible and in the same position on every page. The sidebar width is consistent (approximately 244px). Navigation links remain functional throughout.

### SidebarUserArea

#### Sign In button shown when not logged in
- **Initial state:** User is not authenticated (no active session).
- **Expected:** The sidebar user area (below the app title) displays a "Sign In" button. No avatar, user name, or sign-out option is visible.

#### Clicking Sign In reveals inline auth form
- **Initial state:** User is not authenticated. The "Sign In" button is visible in the sidebar.
- **Action:** User clicks the "Sign In" button.
- **Expected:** An inline authentication form appears in the sidebar with: an email input field, a password input field, a "Sign In" submit button, a "Forgot password?" link, and a toggle to switch to "Sign Up" mode. The form replaces or expands below the "Sign In" button.

#### Sign In form submits with email and password
- **Initial state:** The inline auth form is open in Sign In mode.
- **Action:** User enters a valid email and password into the form fields and clicks the "Sign In" submit button.
- **Expected:** The form submits the credentials. On success, the user is authenticated: the inline form is replaced by the user's avatar, display name, and a sign-out button. On failure (invalid credentials), an error message is displayed inline near the form.

#### Forgot password link navigates to /auth/forgot-password
- **Initial state:** The inline auth form is open in Sign In mode.
- **Action:** User clicks the "Forgot password?" link.
- **Expected:** The browser navigates to /auth/forgot-password, displaying the ForgotPasswordPage where the user can enter their email to receive a password reset link.

#### Toggle switches between Sign In and Sign Up modes
- **Initial state:** The inline auth form is open in Sign In mode.
- **Action:** User clicks the Sign In/Sign Up toggle.
- **Expected:** The form switches to Sign Up mode. The submit button text changes to "Sign Up". The toggle text updates to indicate the user can switch back to Sign In mode. A Name input field appears (not present in Sign In mode). The email and password fields remain visible.

#### Sign Up form submits and requires email confirmation
- **Initial state:** The inline auth form is open in Sign Up mode.
- **Action:** User enters a name, a new email, and password and clicks the "Sign Up" submit button.
- **Expected:** The form submits the registration. A message is displayed informing the user that a confirmation email has been sent and they must confirm their email before logging in. The user is not yet authenticated. (In test mode with IS_TEST=true, signup auto-confirms and returns a session immediately.)

#### Logged in state shows avatar, name, and sign-out
- **Initial state:** User is authenticated with an active session.
- **Expected:** The sidebar user area displays the user's avatar (or initials), the user's display name, and a sign-out button or icon. The "Sign In" button is not visible.

#### Clicking sign-out logs the user out
- **Initial state:** User is authenticated. The sidebar shows avatar, name, and sign-out.
- **Action:** User clicks the sign-out button.
- **Expected:** The user's session is ended. The sidebar user area reverts to showing the "Sign In" button. The avatar and name are no longer displayed. The app continues to function in unauthenticated mode (all pages remain accessible).

## ClientsListPage (/clients)

Components: ClientsTable, ClientsSearchAndFilters, ClientsPagination, AddClientModal, ClientsImportExport, ClientsListContent

### ClientsTable

#### Table displays correct column headers
- **Initial state:** ClientsListPage is loaded with clients.
- **Expected:** The table displays seven column headers in order: Client Name, Type, Status, Tags, Primary Contact, Open Deals, Next Task. The headers are visible and clearly labeled.

#### Table rows display client name
- **Initial state:** ClientsListPage is loaded with clients (e.g., "Acme Corp", "Globex Solutions", "Jane Doe").
- **Expected:** Each table row displays the client's name in the Client Name column as the primary identifier (e.g., "Acme Corp"). The name is prominent and clearly readable.

#### Table rows display client type
- **Initial state:** ClientsListPage is loaded with clients of different types.
- **Expected:** Each table row displays the client type in the Type column as either "Organization" or "Individual" (e.g., "Acme Corp" shows "Organization", "Jane Doe" shows "Individual").

#### Table rows display status badge with correct color
- **Initial state:** ClientsListPage is loaded with clients having different statuses.
- **Expected:** Each table row displays the client's status as a colored badge in the Status column. "Active" has a green background, "Inactive" has a gray background, "Prospect" has a yellow/amber background, and "Churned" has a red/orange background. The badge text matches the client's current status.

#### Table rows display tags as badges
- **Initial state:** ClientsListPage is loaded with clients that have tags assigned.
- **Expected:** Each table row displays the client's tags as comma-separated badges in the Tags column (e.g., "SaaS, Enterprise, Q3-Target" for Acme Corp; "Legacy, Partner" for Globex Solutions). Clients with no tags show an empty cell or placeholder.

#### Table rows display primary contact with name and title
- **Initial state:** ClientsListPage is loaded with organization clients that have associated contacts.
- **Expected:** Each table row displays the primary contact's name followed by their title in parentheses in the Primary Contact column (e.g., "Sarah Jenkins (CEO)" for Acme Corp, "Michael Chen (CTO)" for Globex Solutions). For individual-type clients, the primary contact shows the client's own name with "(Self)" (e.g., "Jane Doe (Self)"). Clients with no primary contact show an empty cell or placeholder.

#### Table rows display open deals count with total value
- **Initial state:** ClientsListPage is loaded with clients that have deals.
- **Expected:** Each table row displays the number of open deals and their total value in the Open Deals column (e.g., "3 (Value: $150k)" for Acme Corp, "1 (Value: $15k)" for Jane Doe). Clients with no open deals show "0". The value is formatted with appropriate abbreviations (k for thousands, M for millions). Clients with deals but zero value show just the count (e.g., "N/A" for churned clients with no deals).

#### Table rows display next task with description and date
- **Initial state:** ClientsListPage is loaded with clients that have upcoming tasks.
- **Expected:** Each table row displays the next upcoming task description and its due date in the Next Task column (e.g., "Follow-up call - Today, 2pm" for Acme Corp, "Send proposal - Tomorrow" for Jane Doe, "Review contract - Next Week" for Stark Industries). Clients with no upcoming tasks show "No task scheduled". Dates for today and tomorrow show relative labels with time.

#### Clicking a client row navigates to ClientDetailPage
- **Initial state:** ClientsListPage is loaded with clients.
- **Action:** User clicks on a client row (e.g., the row for "Acme Corp" with client id 1).
- **Expected:** The browser navigates to /clients/1 and the ClientDetailPage is displayed showing the full details for that client.

#### Clicking an individual client row navigates to ClientDetailPage
- **Initial state:** ClientsListPage is loaded with individual-type clients.
- **Action:** User clicks on an individual client row (e.g., the row for "Jane Doe" with client id 3).
- **Expected:** The browser navigates to /clients/3 and the ClientDetailPage is displayed showing the full details for that individual client.

#### Action menu icon displayed on each row
- **Initial state:** ClientsListPage is loaded with clients.
- **Expected:** Each table row has a three-dot menu icon ("...") on the far right side. The icon is visible and clickable.

#### Action menu shows options on click
- **Initial state:** ClientsListPage is loaded with clients.
- **Action:** User clicks the three-dot menu icon ("...") on a client row.
- **Expected:** A dropdown menu appears with options including: "View Details", "Edit", and "Delete". The menu is positioned near the three-dot icon.

#### Action menu View Details navigates to ClientDetailPage
- **Initial state:** The three-dot action menu is open on a client row (e.g., client id 2).
- **Action:** User clicks "View Details" from the action menu.
- **Expected:** The browser navigates to /clients/2 and the ClientDetailPage is displayed.

#### Action menu Edit opens edit functionality
- **Initial state:** The three-dot action menu is open on a client row.
- **Action:** User clicks "Edit" from the action menu.
- **Expected:** An edit modal or inline edit mode opens, allowing the user to modify the client's details (name, type, status, tags, source info). The current client data is pre-populated in the form fields.

#### Action menu Delete removes the client with confirmation
- **Initial state:** The three-dot action menu is open on a client row.
- **Action:** User clicks "Delete" from the action menu.
- **Expected:** A confirmation dialog appears asking the user to confirm deletion (e.g., "Are you sure you want to delete this client?"). Upon confirmation, the client is deleted via the API and the row is removed from the table. The total client count decreases by one.

#### Action menu Delete cancellation keeps the client
- **Initial state:** The delete confirmation dialog is open for a client.
- **Action:** User clicks "Cancel" on the confirmation dialog.
- **Expected:** The dialog closes. The client remains in the table unchanged.

### ClientsSearchAndFilters

#### Search input filters clients by name
- **Initial state:** ClientsListPage is loaded with multiple clients visible (e.g., "Acme Corp", "Globex Solutions", "Stark Industries").
- **Action:** User types "Acme" into the search input (placeholder text "Search clients by name, tag, or contact...").
- **Expected:** The clients table updates to show only clients whose name contains "Acme" (e.g., "Acme Corp"). Non-matching clients are hidden. The search is case-insensitive and debounced.

#### Search input filters clients by tag
- **Initial state:** ClientsListPage is loaded with clients that have various tags (e.g., "SaaS", "Enterprise", "Legacy", "Partner").
- **Action:** User types "Enterprise" into the search input.
- **Expected:** The clients table updates to show only clients that have a tag containing "Enterprise" (e.g., "Acme Corp" with tags "SaaS, Enterprise, Q3-Target"). Clients without a matching tag are hidden.

#### Search input filters clients by contact name
- **Initial state:** ClientsListPage is loaded with clients that have primary contacts (e.g., "Sarah Jenkins", "Michael Chen").
- **Action:** User types "Sarah" into the search input.
- **Expected:** The clients table updates to show only clients whose primary contact name contains "Sarah" (e.g., "Acme Corp" with primary contact "Sarah Jenkins (CEO)"). Clients without a matching contact are hidden.

#### Search input clears and shows all clients
- **Initial state:** The search input contains "Acme" and only matching clients are shown.
- **Action:** User clears the search input.
- **Expected:** All clients are displayed again without any name/tag/contact filter applied.

#### Status filter dropdown shows all status options
- **Initial state:** ClientsListPage is loaded.
- **Action:** User clicks the Status filter dropdown (showing "Status: All").
- **Expected:** A dropdown appears with options: "All", "Active", "Inactive", "Prospect", and "Churned". The dropdown uses the custom styled FilterSelect component matching the app's design system.

#### Status filter dropdown filters by Active status
- **Initial state:** ClientsListPage is loaded with clients of various statuses.
- **Action:** User selects "Active" from the Status filter dropdown.
- **Expected:** The clients table updates to show only clients with "Active" status (e.g., "Acme Corp", "Stark Industries"). Clients with Inactive, Prospect, and Churned statuses are hidden. The dropdown label updates to indicate the active filter (e.g., "Status: Active").

#### Status filter dropdown filters by Inactive status
- **Initial state:** ClientsListPage is loaded with clients of various statuses.
- **Action:** User selects "Inactive" from the Status filter dropdown.
- **Expected:** The clients table updates to show only clients with "Inactive" status (e.g., "Globex Solutions"). Clients with other statuses are hidden.

#### Status filter dropdown filters by Prospect status
- **Initial state:** ClientsListPage is loaded with clients of various statuses.
- **Action:** User selects "Prospect" from the Status filter dropdown.
- **Expected:** The clients table updates to show only clients with "Prospect" status (e.g., "Jane Doe", "Liam Smith"). Clients with other statuses are hidden.

#### Status filter dropdown filters by Churned status
- **Initial state:** ClientsListPage is loaded with clients of various statuses.
- **Action:** User selects "Churned" from the Status filter dropdown.
- **Expected:** The clients table updates to show only clients with "Churned" status (e.g., "Wayne Enterprises"). Clients with other statuses are hidden.

#### Status filter can be reset to All
- **Initial state:** The Status filter is set to "Active", showing only active clients.
- **Action:** User opens the Status filter dropdown and selects "All".
- **Expected:** All clients are displayed regardless of status. The dropdown label returns to "Status: All".

#### Tags filter dropdown shows available tags
- **Initial state:** ClientsListPage is loaded.
- **Action:** User clicks the Tags filter dropdown (showing "Tags: All").
- **Expected:** A dropdown appears listing all available tags from the system (e.g., "SaaS", "Enterprise", "Q3-Target", "Legacy", "Partner", "Consultant", "Hot Lead", "Manufacturing", "Key Account", "VIP", "Lost", "Competitor", "Freelancer", "Referral") plus an "All" option. The dropdown uses the custom styled FilterSelect component.

#### Tags filter dropdown filters by a specific tag
- **Initial state:** ClientsListPage is loaded with clients that have various tags.
- **Action:** User selects "Enterprise" from the Tags filter dropdown.
- **Expected:** The clients table updates to show only clients that have the "Enterprise" tag (e.g., "Acme Corp"). Clients without the "Enterprise" tag are hidden. The dropdown label updates to indicate the active filter (e.g., "Tags: Enterprise").

#### Tags filter can be reset to All
- **Initial state:** The Tags filter is set to "Enterprise", showing only enterprise-tagged clients.
- **Action:** User opens the Tags filter dropdown and selects "All".
- **Expected:** All clients are displayed regardless of tags. The dropdown label returns to "Tags: All".

#### Source filter dropdown shows available source options
- **Initial state:** ClientsListPage is loaded.
- **Action:** User clicks the Source filter dropdown (showing "Source: All").
- **Expected:** A dropdown appears listing all available source types from the system (e.g., "Referral", "Campaign", "Website", "Cold Call", "Event") plus an "All" option. The dropdown uses the custom styled FilterSelect component.

#### Source filter dropdown filters by a specific source
- **Initial state:** ClientsListPage is loaded with clients that have various source types.
- **Action:** User selects "Referral" from the Source filter dropdown.
- **Expected:** The clients table updates to show only clients whose source type is "Referral". Clients with other source types are hidden. The dropdown label updates to indicate the active filter (e.g., "Source: Referral").

#### Source filter can be reset to All
- **Initial state:** The Source filter is set to "Referral", showing only referral-sourced clients.
- **Action:** User opens the Source filter dropdown and selects "All".
- **Expected:** All clients are displayed regardless of source. The dropdown label returns to "Source: All".

#### Sort dropdown defaults to Recently Updated
- **Initial state:** User navigates to /clients.
- **Expected:** The Sort dropdown shows "Sort: Recently Updated" as the default sort order. Clients are listed with the most recently updated clients first.

#### Sort dropdown shows sort options
- **Initial state:** ClientsListPage is loaded.
- **Action:** User clicks the Sort dropdown (showing "Sort: Recently Updated").
- **Expected:** A dropdown appears with sort options including at least: "Recently Updated", "Name A-Z", "Name Z-A", "Newest First", "Oldest First". The dropdown uses the custom styled FilterSelect component.

#### Changing sort order re-sorts the table
- **Initial state:** ClientsListPage is loaded with clients sorted by "Recently Updated".
- **Action:** User selects "Name A-Z" from the Sort dropdown.
- **Expected:** The clients table re-sorts to display clients in alphabetical order by name (e.g., "Acme Corp" before "Globex Solutions" before "Jane Doe"). The dropdown label updates to "Sort: Name A-Z".

#### Multiple filters can be combined with search
- **Initial state:** ClientsListPage is loaded with clients of varying statuses, tags, and sources.
- **Action:** User sets the Status filter to "Active", the Tags filter to "Enterprise", and types "Acme" in the search input.
- **Expected:** Only clients matching all three criteria are shown (Active status AND has "Enterprise" tag AND name/tag/contact contains "Acme"). Changing any filter updates the results immediately.

#### Filters persist when changing sort order
- **Initial state:** Status filter is set to "Active" and search contains "Corp".
- **Action:** User changes the Sort dropdown to "Name A-Z".
- **Expected:** The filtered results (Active clients matching "Corp") are re-sorted alphabetically. The Status filter and search term remain applied.

### ClientsPagination

#### Pagination controls appear when clients exceed page size
- **Initial state:** The system has more than 50 clients (e.g., 324 clients).
- **Expected:** Pagination controls are displayed below the clients table. The controls include a "Previous" button, numbered page buttons (e.g., 1, 2, 3, ...), and a "Next" button. A text indicator shows "Showing 1-50 of 324 clients". Each page shows up to 50 clients. The current page number (1) is visually highlighted/selected.

#### Clicking Next loads the next page of clients
- **Initial state:** ClientsListPage is loaded with pagination controls visible. User is on page 1.
- **Action:** User clicks the "Next" button.
- **Expected:** The clients table updates to show the next page of clients (clients 51–100). The text indicator updates to "Showing 51-100 of 324 clients". The page number 2 becomes highlighted. The "Previous" button becomes enabled.

#### Clicking Previous loads the previous page of clients
- **Initial state:** User is on page 2 of the clients list.
- **Action:** User clicks the "Previous" button.
- **Expected:** The clients table updates to show the first page of clients (clients 1–50). The text indicator updates to "Showing 1-50 of 324 clients". The page number 1 becomes highlighted. The "Previous" button becomes disabled (since it's the first page).

#### Clicking a page number navigates directly to that page
- **Initial state:** ClientsListPage is loaded with pagination visible. User is on page 1.
- **Action:** User clicks page number "3".
- **Expected:** The clients table updates to show page 3 of clients (clients 101–150). The text indicator updates to "Showing 101-150 of 324 clients". Page number 3 becomes highlighted. Both "Previous" and "Next" buttons are enabled.

#### Previous button is disabled on first page
- **Initial state:** User is on page 1 of the clients list.
- **Expected:** The "Previous" button is disabled (visually grayed out and not clickable). The "Next" button is enabled. Page number 1 is highlighted.

#### Next button is disabled on last page
- **Initial state:** User navigates to the last page of clients (e.g., page 7 of 324 clients with 50 per page).
- **Expected:** The "Next" button is disabled (visually grayed out and not clickable). The "Previous" button is enabled. The last page number is highlighted. The text indicator shows the remaining clients (e.g., "Showing 301-324 of 324 clients").

#### Pagination updates when filters reduce result count
- **Initial state:** ClientsListPage shows 324 clients with 7 pages of pagination.
- **Action:** User sets the Status filter to "Active", which returns only 40 clients.
- **Expected:** The pagination controls update to reflect the filtered count. The text indicator shows "Showing 1-40 of 40 clients". Since all results fit on one page, the "Previous" and "Next" buttons are both disabled and page numbers show only page 1.

#### Pagination hidden when all results fit on one page
- **Initial state:** ClientsListPage is loaded with filters applied that return fewer than 50 clients.
- **Expected:** The pagination controls are either hidden or show a single page with no Previous/Next navigation needed. The text indicator still shows the count (e.g., "Showing 1-25 of 25 clients").

### AddClientModal

#### Clicking Add New Client button opens AddClientModal
- **Initial state:** ClientsListPage is loaded. A blue "+ Add New Client" button is visible in the top-right area of the page header.
- **Action:** User clicks the "+ Add New Client" button.
- **Expected:** A modal dialog opens with the title "Add New Client" (or "Create Client"). The modal contains a form with fields for: Name (text input, required), Type (dropdown with options: Organization, Individual), Status (dropdown with options: Active, Inactive, Prospect, Churned), Tags (text input or multi-select for adding tags), Source Type (dropdown, e.g., Referral, Campaign, Website, Cold Call, Event), Source Detail (text input), Campaign (text input), Channel (text input). The modal has "Cancel" and "Create" (or "Save") buttons at the bottom.

#### AddClientModal form validates required name field
- **Initial state:** AddClientModal is open with all fields empty or at defaults.
- **Action:** User clicks the "Create" submit button without filling in the Name field.
- **Expected:** The form displays a validation error for the Name field indicating it is required. The client is not created. The modal remains open.

#### AddClientModal successfully creates an organization client
- **Initial state:** AddClientModal is open.
- **Action:** User fills in: Name = "NewCo Industries", Type = "Organization", Status = "Prospect", Tags = "SaaS, Enterprise", Source Type = "Referral", Source Detail = "John from TechStart". User clicks the "Create" button.
- **Expected:** The client is created via the API. The modal closes. The new client "NewCo Industries" appears in the clients table with type "Organization", status badge "Prospect" (yellow), tags "SaaS, Enterprise", and source info saved. A timeline entry is created for the new client. The total client count increases by one.

#### AddClientModal successfully creates an individual client
- **Initial state:** AddClientModal is open.
- **Action:** User fills in: Name = "Alex Turner", Type = "Individual", Status = "Active". User clicks the "Create" button.
- **Expected:** The client is created via the API. The modal closes. The new client "Alex Turner" appears in the clients table with type "Individual", status badge "Active" (green), and primary contact showing "Alex Turner (Self)".

#### AddClientModal type dropdown shows Organization and Individual options
- **Initial state:** AddClientModal is open.
- **Action:** User clicks the Type dropdown.
- **Expected:** A dropdown appears with two options: "Organization" and "Individual". Selecting a type populates the Type field.

#### AddClientModal status dropdown shows all status options
- **Initial state:** AddClientModal is open.
- **Action:** User clicks the Status dropdown.
- **Expected:** A dropdown appears with four options: "Active", "Inactive", "Prospect", and "Churned". Selecting a status populates the Status field.

#### AddClientModal tags field accepts multiple tags
- **Initial state:** AddClientModal is open.
- **Action:** User adds tags "SaaS", "Enterprise", and "Q3-Target" to the Tags field.
- **Expected:** All three tags are displayed in the Tags field as separate badges or chips. Tags can be individually removed. The tags will be saved with the client when the form is submitted.

#### AddClientModal source type dropdown shows source options
- **Initial state:** AddClientModal is open.
- **Action:** User clicks the Source Type dropdown.
- **Expected:** A dropdown appears with source type options (e.g., "Referral", "Campaign", "Website", "Cold Call", "Event"). Selecting a source type populates the Source Type field.

#### AddClientModal cancel button closes modal without creating
- **Initial state:** AddClientModal is open with some fields filled in.
- **Action:** User clicks the "Cancel" button.
- **Expected:** The modal closes. No client is created. The clients table remains unchanged.

#### AddClientModal closes on overlay click
- **Initial state:** AddClientModal is open.
- **Action:** User clicks the modal overlay (area outside the modal dialog).
- **Expected:** The modal closes. No client is created.

#### Created client appears in table after modal closes
- **Initial state:** AddClientModal was just used to create a new client "NewCo Industries".
- **Expected:** After the modal closes, the clients table refreshes and the new client "NewCo Industries" appears in the list according to the current sort order. If sorted by "Recently Updated", the new client appears near the top.

### ClientsImportExport

#### Import button displayed in page header
- **Initial state:** ClientsListPage is loaded.
- **Expected:** An "Import" button with a download/import icon is visible in the top-right area of the page header, to the left of the "Export" button and "+ Add New Client" button.

#### Export button displayed in page header
- **Initial state:** ClientsListPage is loaded.
- **Expected:** An "Export" button with an upload/export icon is visible in the top-right area of the page header, between the "Import" button and the "+ Add New Client" button.

#### Clicking Import button opens ImportDialog for clients
- **Initial state:** ClientsListPage is loaded.
- **Action:** User clicks the "Import" button.
- **Expected:** An ImportDialog modal opens with the title indicating clients import. The dialog displays a CSV column format specification table listing all supported columns (Name, Type, Status, Tags, Source Type, Source Detail, Campaign, Channel, Date Acquired) with required/optional indicators and value descriptions. The Name column is marked as required. Type accepted values are "Organization" or "Individual". Status accepted values are "Active", "Inactive", "Prospect", or "Churned". A "Download CSV template" button is available. A file upload area or file picker is present for selecting a CSV file.

#### ImportDialog CSV format specification is visible before upload
- **Initial state:** The ImportDialog for clients is open.
- **Expected:** The CSV column format specification table is immediately visible to the user before they attempt any upload. The table lists each column name, whether it is required or optional, and a description of accepted values. This ensures the user knows the expected format before preparing their CSV.

#### ImportDialog Download CSV template button generates template
- **Initial state:** The ImportDialog for clients is open.
- **Action:** User clicks the "Download CSV template" button.
- **Expected:** A CSV template file is downloaded containing the correct column headers for clients (Name, Type, Status, Tags, Source Type, Source Detail, Campaign, Channel, Date Acquired) with no data rows. The template can be used as a starting point for populating import data.

#### ImportDialog processes valid CSV file and creates clients
- **Initial state:** The ImportDialog is open. User has a valid CSV file with client data matching the expected format (e.g., rows with Name, Type, Status, Tags).
- **Action:** User uploads the CSV file and confirms the import.
- **Expected:** The clients from the CSV are created via the bulk import API. The dialog shows a success message with the count of clients imported (e.g., "Successfully imported 15 clients"). After closing the dialog, the clients table refreshes and the newly imported clients appear in the list. The total client count increases accordingly.

#### ImportDialog shows validation errors for invalid CSV data
- **Initial state:** The ImportDialog is open. User has a CSV file with invalid data (e.g., missing required Name column, invalid status value "Unknown", invalid type "Group").
- **Action:** User uploads the invalid CSV file and confirms the import.
- **Expected:** The dialog displays per-row validation errors indicating which rows failed and why (e.g., "Row 3: Name is required", "Row 5: Invalid status 'Unknown'", "Row 7: Invalid type 'Group'"). The error messages are specific enough for the user to correct the CSV. Valid rows may still be imported, or the user may be asked to fix errors and retry.

#### ImportDialog cancel button closes without importing
- **Initial state:** The ImportDialog is open with a file selected.
- **Action:** User clicks the "Cancel" button.
- **Expected:** The dialog closes. No data is imported. The clients table remains unchanged.

#### ImportDialog closes on overlay click without importing
- **Initial state:** The ImportDialog is open.
- **Action:** User clicks the modal overlay (area outside the dialog).
- **Expected:** The dialog closes. No data is imported.

#### Clicking Export button downloads clients CSV
- **Initial state:** ClientsListPage is loaded with clients in the system.
- **Action:** User clicks the "Export" button.
- **Expected:** A CSV file is downloaded containing all client data. The CSV includes columns: Name, Type, Status, Tags, Source Type, Source Detail, Campaign, Channel, Date Acquired. Each row corresponds to a client in the system. The file name includes "clients" (e.g., "clients.csv" or "clients-export.csv").

#### Exported CSV contains correct data for all clients
- **Initial state:** The system has clients with various types, statuses, tags, and source info.
- **Action:** User clicks the "Export" button and opens the downloaded CSV.
- **Expected:** The CSV correctly contains all clients' data. Tags are formatted as comma-separated values within a single column. Status values match the client's current status. Source fields are populated when available and empty when not set.

### ClientsListContent

#### Page displays heading and action buttons
- **Initial state:** User navigates to /clients.
- **Expected:** The page displays a heading "Clients" at the top. Three buttons are displayed in the top-right area: "Import" button with an import icon, "Export" button with an export icon, and a blue "+ Add New Client" button. The sidebar "Clients" link is highlighted as active.

#### Loading state shows while clients are being fetched
- **Initial state:** User navigates to /clients and the API request for clients is in progress.
- **Expected:** A loading indicator (spinner or skeleton) is displayed in the clients table area while data is being fetched. The page heading, search bar, filter dropdowns, and action buttons are still visible.

#### Empty state shown when no clients match filters
- **Initial state:** ClientsListPage is loaded. User applies filters or search that match no clients (e.g., search for "xyznonexistent").
- **Expected:** The clients table area displays an empty state message (e.g., "No clients found" or "No matching clients") instead of table rows. The search bar and filter dropdowns remain visible so the user can adjust filters.

#### Empty state shown when no clients exist
- **Initial state:** User navigates to /clients and there are no clients in the system.
- **Expected:** The clients table area displays an empty state message (e.g., "No clients yet") with a prompt or button to add the first client. The "+ Add New Client" button remains visible in the header.

## ClientDetailPage (/clients/:clientId)

Components: ClientHeader, ClientQuickActions, ClientSourceInfo, ClientTasks, ClientDeals, ClientAttachments, ClientPeople, ClientTimeline

### ClientHeader

#### Header displays client name prominently
- **Initial state:** User navigates to /clients/:clientId for a client named "Acme Corp".
- **Expected:** The page header displays the client name "Acme Corp" as the primary heading text, large and prominent.

#### Header displays type badge for organization client
- **Initial state:** ClientDetailPage is loaded for an organization-type client "Acme Corp".
- **Expected:** A badge next to the client name shows "Organization". The badge is visually distinct (e.g., outlined or lightly colored background).

#### Header displays type badge for individual client
- **Initial state:** ClientDetailPage is loaded for an individual-type client "Jane Doe".
- **Expected:** A badge next to the client name shows "Individual". The badge is visually distinct.

#### Header displays status badge with correct color for Active
- **Initial state:** ClientDetailPage is loaded for a client with "Active" status.
- **Expected:** A status badge is displayed near the client name showing "Active" with a green background.

#### Header displays status badge with correct color for Inactive
- **Initial state:** ClientDetailPage is loaded for a client with "Inactive" status.
- **Expected:** A status badge is displayed near the client name showing "Inactive" with a gray background.

#### Header displays status badge with correct color for Prospect
- **Initial state:** ClientDetailPage is loaded for a client with "Prospect" status.
- **Expected:** A status badge is displayed near the client name showing "Prospect" with a yellow/amber background.

#### Header displays status badge with correct color for Churned
- **Initial state:** ClientDetailPage is loaded for a client with "Churned" status.
- **Expected:** A status badge is displayed near the client name showing "Churned" with a red/orange background.

#### Header displays tags as badges
- **Initial state:** ClientDetailPage is loaded for a client with tags "Enterprise", "Software", "High Priority".
- **Expected:** Tags are displayed as individual badges/chips below or next to the client name (e.g., "Enterprise", "Software", "High Priority"). Each tag is a separate visual element.

#### Header displays tags with empty state when no tags
- **Initial state:** ClientDetailPage is loaded for a client with no tags.
- **Expected:** The tags area shows no badges. The layout does not break or show an error.

#### Clicking edit icon on header opens edit functionality
- **Initial state:** ClientDetailPage is loaded for a client. An edit pencil icon is visible in the header area (near the source/referral label or as a general edit button).
- **Action:** User clicks the edit pencil icon on the header.
- **Expected:** An edit modal or inline edit mode opens, allowing the user to modify the client's details (name, type, status, tags). The current client data is pre-populated in the form fields.

#### Edit saves changes and updates the header
- **Initial state:** The edit modal/form is open for a client with name "Acme Corp" and status "Active".
- **Action:** User changes the status to "Inactive" and adds a new tag "VIP". User clicks "Save".
- **Expected:** The client is updated via the API. The header now shows the status badge as "Inactive" with a gray background. The new tag "VIP" appears as an additional badge. A timeline entry is created recording the client update. If any user is following the client, they receive a client-updated notification (if their notification preferences allow).

#### Follow button displayed when authenticated
- **Initial state:** Authenticated user navigates to a ClientDetailPage for a client they are not following.
- **Expected:** A follow/unfollow toggle button is visible in the header area (e.g., "Follow" with a bell or star icon). The button indicates the user is not currently following this client.

#### Follow button not displayed when not authenticated
- **Initial state:** User is not authenticated (no active session). User navigates to a ClientDetailPage.
- **Expected:** The follow/unfollow toggle button is not visible in the header.

#### Clicking Follow toggles to following state
- **Initial state:** Authenticated user is on a ClientDetailPage for a client they are not following. The button shows "Follow".
- **Action:** User clicks the "Follow" button.
- **Expected:** The button toggles to "Following" (or "Unfollow") state via the POST /.netlify/functions/client-follow API. The button visual changes to indicate the user is now following the client.

#### Clicking Unfollow toggles to not following state
- **Initial state:** Authenticated user is on a ClientDetailPage for a client they are following. The button shows "Following" (or "Unfollow").
- **Action:** User clicks the "Following"/"Unfollow" button.
- **Expected:** The button toggles back to "Follow" state via the POST /.netlify/functions/client-follow API. The button visual changes to indicate the user is no longer following the client.

#### Loading state shows while client data is being fetched
- **Initial state:** User navigates to /clients/:clientId and the API request for client data is in progress.
- **Expected:** A loading indicator (spinner or skeleton) is displayed while data is being fetched. The page layout skeleton is visible.

#### Back navigation returns to clients list
- **Initial state:** ClientDetailPage is loaded for any client.
- **Action:** User clicks the back navigation element (breadcrumb or back link showing the route path).
- **Expected:** The browser navigates to /clients and the ClientsListPage is displayed.

### ClientQuickActions

#### Four quick action buttons displayed with icons
- **Initial state:** ClientDetailPage is loaded for any client.
- **Expected:** Four quick action buttons are displayed in the header area to the right of the client name/badges: "Add Task" (with a list/check icon), "Add Deal" (with a clock/timer icon), "Add Attachment" (with a paperclip/attachment icon), and "Add Person" (with a person/user-plus icon). Each button has an icon above the label text.

#### Clicking Add Task opens a task creation modal
- **Initial state:** ClientDetailPage is loaded for client "Acme Corp".
- **Action:** User clicks the "Add Task" quick action button.
- **Expected:** A modal dialog opens for creating a new task. The modal contains form fields for: Title (text input, required), Description (textarea), Due Date (date/time picker), Priority (dropdown with High, Medium, Normal, Low), Assignee (searchable FilterSelect dropdown populated from users API). The Client field is pre-populated with "Acme Corp" and may be read-only or pre-selected. The modal has "Cancel" and "Create" buttons.

#### Add Task modal validates required title field
- **Initial state:** The Add Task modal is open from the ClientDetailPage.
- **Action:** User clicks "Create" without entering a title.
- **Expected:** A validation error is displayed for the Title field indicating it is required. The task is not created. The modal remains open.

#### Add Task modal successfully creates a task for this client
- **Initial state:** The Add Task modal is open from the ClientDetailPage for "Acme Corp".
- **Action:** User fills in Title = "Prepare quarterly report", Due Date = next week, Priority = "Medium", Assignee = "Sarah Johnson". User clicks "Create".
- **Expected:** The task is created via the API with the client automatically set to "Acme Corp". The modal closes. The new task "Prepare quarterly report" appears in the Tasks section of the ClientDetailPage with due date "Due: Next Week". A timeline entry is created on the client's timeline for the task creation (e.g., "Task Created: 'Prepare quarterly report' by [user]"). If any user is following "Acme Corp", they receive a task-created notification.

#### Add Task modal cancel closes without creating
- **Initial state:** The Add Task modal is open with some fields filled in.
- **Action:** User clicks "Cancel".
- **Expected:** The modal closes. No task is created. The Tasks section remains unchanged.

#### Clicking Add Deal opens a deal creation modal
- **Initial state:** ClientDetailPage is loaded for client "Acme Corp".
- **Action:** User clicks the "Add Deal" quick action button.
- **Expected:** A modal dialog opens for creating a new deal. The modal contains form fields for: Deal Name (text input, required), Value (number input for dollar amount), Stage (dropdown with pipeline stages e.g., Qualification, Proposal Sent, Negotiation, Closed Won, Closed Lost), Owner (searchable FilterSelect dropdown populated from users API), Probability (number input, percentage), Expected Close Date (date picker). The Client field is pre-populated with "Acme Corp". The modal has "Cancel" and "Create" buttons.

#### Add Deal modal validates required name field
- **Initial state:** The Add Deal modal is open from the ClientDetailPage.
- **Action:** User clicks "Create" without entering a deal name.
- **Expected:** A validation error is displayed for the Deal Name field indicating it is required. The deal is not created. The modal remains open.

#### Add Deal modal successfully creates a deal for this client
- **Initial state:** The Add Deal modal is open from the ClientDetailPage for "Acme Corp".
- **Action:** User fills in Deal Name = "Enterprise Upgrade", Value = 75000, Stage = "Qualification", Owner = "David Lee". User clicks "Create".
- **Expected:** The deal is created via the API with the client automatically set to "Acme Corp". The modal closes. The new deal "Enterprise Upgrade" appears in the Deals section showing "Stage: Qualification, Value: $75,000". A timeline entry is created on the client's timeline for the deal creation (e.g., "Deal Created: 'Enterprise Upgrade' by [user]"). If any user is following "Acme Corp", they receive a deal-created notification.

#### Add Deal modal cancel closes without creating
- **Initial state:** The Add Deal modal is open with some fields filled in.
- **Action:** User clicks "Cancel".
- **Expected:** The modal closes. No deal is created. The Deals section remains unchanged.

#### Clicking Add Attachment opens an upload modal
- **Initial state:** ClientDetailPage is loaded for client "Acme Corp".
- **Action:** User clicks the "Add Attachment" quick action button.
- **Expected:** A modal dialog opens for adding an attachment. The modal includes a toggle to switch between "File Upload" and "Link URL" modes. In File Upload mode: a file picker/drag-and-drop area is present for selecting a file. In Link URL mode: a URL text input and a Name/Label text input are present. An optional "Linked Deal" dropdown (populated from the client's deals) allows associating the attachment with a deal. The modal has "Cancel" and "Upload"/"Add" buttons.

#### Add Attachment modal file upload mode works
- **Initial state:** The Add Attachment modal is open in "File Upload" mode.
- **Action:** User selects a file (e.g., "contract.pdf") via the file picker and clicks "Upload".
- **Expected:** The file is uploaded via the API. The modal closes. The new attachment "contract.pdf" appears in the Attachments section with type "Document", the current date as created date, and a file-type icon for PDFs.

#### Add Attachment modal link mode works
- **Initial state:** The Add Attachment modal is open. User toggles to "Link URL" mode.
- **Action:** User enters URL = "https://example.com/resources" and Name = "Resource Page". User clicks "Add".
- **Expected:** The link attachment is created via the API. The modal closes. The new attachment "Resource Page" appears in the Attachments section with type "Link", the current date as created date, and a link icon.

#### Add Attachment modal toggle switches between file and link modes
- **Initial state:** The Add Attachment modal is open in "File Upload" mode.
- **Action:** User clicks the toggle to switch to "Link URL" mode.
- **Expected:** The file picker/drag-and-drop area is replaced by URL and Name text input fields. Clicking the toggle again switches back to File Upload mode with the file picker visible.

#### Add Attachment modal allows linking to a deal
- **Initial state:** The Add Attachment modal is open. The client "Acme Corp" has deals ("Acme Software License", "Additional Services").
- **Action:** User selects "Acme Software License" from the Linked Deal dropdown and uploads a file.
- **Expected:** The attachment is created with the deal association. In the Attachments section, the new attachment shows "Linked Deal: Acme Software License".

#### Add Attachment modal cancel closes without uploading
- **Initial state:** The Add Attachment modal is open with a file selected.
- **Action:** User clicks "Cancel".
- **Expected:** The modal closes. No attachment is created. The Attachments section remains unchanged.

#### Clicking Add Person opens a person creation modal
- **Initial state:** ClientDetailPage is loaded for client "Acme Corp".
- **Action:** User clicks the "Add Person" quick action button.
- **Expected:** A modal dialog opens for adding a person/contact to this client. The modal contains form fields for: Name (text input, required), Title/Role (text input, e.g., "CEO", "CTO"), Email (text input), Phone (text input), Location (text input). The client association is automatic. The modal has "Cancel" and "Create" (or "Add") buttons.

#### Add Person modal validates required name field
- **Initial state:** The Add Person modal is open from the ClientDetailPage.
- **Action:** User clicks "Create" without entering a name.
- **Expected:** A validation error is displayed for the Name field indicating it is required. The person is not created. The modal remains open.

#### Add Person modal successfully creates a person for this client
- **Initial state:** The Add Person modal is open from the ClientDetailPage for "Acme Corp".
- **Action:** User fills in Name = "Robert Kim", Title = "VP of Engineering", Email = "robert@acme.com". User clicks "Create".
- **Expected:** The person/contact is created via the API and automatically associated with "Acme Corp". The modal closes. The new person "Robert Kim - VP of Engineering" appears in the People section. A timeline entry is created on the client's timeline for the contact addition (e.g., "Contact Added: 'Robert Kim' by [user]"). If any user is following "Acme Corp", they receive a contact-added notification.

#### Add Person modal cancel closes without creating
- **Initial state:** The Add Person modal is open with some fields filled in.
- **Action:** User clicks "Cancel".
- **Expected:** The modal closes. No person is created. The People section remains unchanged.

### ClientSourceInfo

#### Source Info section displays heading and Edit button
- **Initial state:** ClientDetailPage is loaded for a client with source information.
- **Expected:** The Source Info section displays a "Source Info" heading. An "Edit" button (with a pencil icon) is visible at the top-right of the section.

#### Source Info displays Acquisition Source field
- **Initial state:** ClientDetailPage is loaded for a client with acquisition source "Referral (John Smith)".
- **Expected:** The Source Info section displays a field labeled "Acquisition Source" with the value "Referral (John Smith)". The source type and detail are shown together.

#### Source Info displays Campaign field
- **Initial state:** ClientDetailPage is loaded for a client with campaign "None".
- **Expected:** The Source Info section displays a field labeled "Campaign" with the value "None" (or the actual campaign name if set, e.g., "Q3 Enterprise Push").

#### Source Info displays Channel field
- **Initial state:** ClientDetailPage is loaded for a client with channel "Direct Sales".
- **Expected:** The Source Info section displays a field labeled "Channel" with the value "Direct Sales".

#### Source Info displays Date Acquired field
- **Initial state:** ClientDetailPage is loaded for a client with date acquired "2023-01-15".
- **Expected:** The Source Info section displays a field labeled "Date Acquired" with the value "2023-01-15" (or a formatted date such as "Jan 15, 2023").

#### Source Info shows placeholders for empty fields
- **Initial state:** ClientDetailPage is loaded for a client with no campaign and no channel set.
- **Expected:** The Campaign and Channel fields show "None" or "—" as placeholders. The layout does not break.

#### Clicking Edit button opens source info edit form
- **Initial state:** ClientDetailPage is loaded for a client. The Source Info section has an "Edit" button.
- **Action:** User clicks the "Edit" button in the Source Info section.
- **Expected:** An edit modal or inline edit mode opens with fields for: Source Type (dropdown, e.g., Referral, Campaign, Website, Cold Call, Event), Source Detail (text input), Campaign (text input), Channel (text input), Date Acquired (date picker). The current values are pre-populated.

#### Edit source info saves changes and updates the section
- **Initial state:** The source info edit form is open for a client with Acquisition Source "Referral (John Smith)" and Channel "Direct Sales".
- **Action:** User changes Channel to "Partner Referral" and sets Campaign to "Q3 Enterprise Push". User clicks "Save".
- **Expected:** The source info is updated via the API. The Source Info section now shows Channel as "Partner Referral" and Campaign as "Q3 Enterprise Push". A timeline entry is created recording the client update. If any user is following the client, they receive a client-updated notification.

#### Edit source info cancel closes without saving
- **Initial state:** The source info edit form is open with modifications.
- **Action:** User clicks "Cancel".
- **Expected:** The form closes. The Source Info section displays the original values unchanged.

### ClientTasks

#### Tasks section displays heading with unresolved tasks label
- **Initial state:** ClientDetailPage is loaded for a client with unresolved tasks.
- **Expected:** The Tasks section displays a "Tasks" heading on the left and an "Unresolved tasks" label on the right side of the heading, indicating the list shows only unresolved/open tasks.

#### Tasks section displays list of unresolved tasks
- **Initial state:** ClientDetailPage is loaded for a client with three unresolved tasks: "Follow up on proposal" (due today), "Schedule onboarding call" (due tomorrow), "Prepare Q3 Review" (due next week).
- **Expected:** The Tasks section displays all three tasks in a list. Each task row shows a checkbox on the left, the task title, and the due date. Tasks are listed in order.

#### Task row displays checkbox
- **Initial state:** ClientDetailPage is loaded for a client with unresolved tasks.
- **Expected:** Each task row has an unchecked checkbox on the left side. The checkbox is clickable.

#### Task row displays task title
- **Initial state:** ClientDetailPage is loaded for a client with a task titled "Follow up on proposal".
- **Expected:** The task row displays the task title "Follow up on proposal" prominently as the main text of the row.

#### Task row displays formatted due date
- **Initial state:** ClientDetailPage is loaded for a client with tasks having various due dates.
- **Expected:** Each task row displays the due date prefixed with "Due:" (e.g., "Due: Today", "Due: Tomorrow", "Due: Next Week"). Dates for today and tomorrow show relative labels, while other dates show the calendar date or relative labels like "Next Week".

#### Task row displays associated deal name when linked
- **Initial state:** ClientDetailPage is loaded for a client with a task "Follow up on proposal" that is associated with deal "Acme Software License".
- **Expected:** The task row displays the associated deal name (e.g., "Deal: 'Acme Software License'") alongside the due date. The deal association is visually indicated with a separator (e.g., "· Due: Today, Deal: 'Acme Software License'").

#### Task row does not display deal info when no deal is linked
- **Initial state:** ClientDetailPage is loaded for a client with a task "Schedule onboarding call" that has no associated deal.
- **Expected:** The task row displays only the due date without any deal reference (e.g., "· Due: Tomorrow").

#### Clicking task checkbox marks task as complete
- **Initial state:** ClientDetailPage is loaded for a client with an unresolved task "Follow up on proposal".
- **Action:** User clicks the checkbox on the "Follow up on proposal" task row.
- **Expected:** The task status is updated to "completed" via the API. The task is removed from the unresolved tasks list (since the section only shows unresolved tasks). A timeline entry is created on the client's timeline recording the task completion (e.g., "Task Completed: 'Follow up on proposal' by [user]"). If any user is following the client, they receive a task-completed notification.

#### Clicking task title navigates to /tasks/:taskId
- **Initial state:** ClientDetailPage is loaded for a client with a task "Follow up on proposal" with task id 42.
- **Action:** User clicks the task title "Follow up on proposal".
- **Expected:** The browser navigates to /tasks/42 and the TaskDetailPage is displayed showing the full details for that task.

#### Empty state when no unresolved tasks exist
- **Initial state:** ClientDetailPage is loaded for a client with no unresolved tasks (all tasks are completed or cancelled, or no tasks exist).
- **Expected:** The Tasks section displays an empty state message (e.g., "No unresolved tasks") instead of task rows. The section heading is still visible.

### ClientDeals

#### Deals section displays heading
- **Initial state:** ClientDetailPage is loaded for a client with deals.
- **Expected:** The Deals section displays a "Deals" heading.

#### Deals section displays list of deals
- **Initial state:** ClientDetailPage is loaded for a client with two deals: "Acme Software License" (Stage: Proposal Sent, Value: $50,000) and "Additional Services" (Stage: Qualification, Value: $10,000).
- **Expected:** The Deals section lists both deals. Each deal row shows the deal name, stage, and value.

#### Deal row displays deal name
- **Initial state:** ClientDetailPage is loaded for a client with a deal named "Acme Software License".
- **Expected:** The deal row displays the deal name "Acme Software License" as the primary text.

#### Deal row displays deal stage
- **Initial state:** ClientDetailPage is loaded for a client with a deal in "Proposal Sent" stage.
- **Expected:** The deal row displays the stage (e.g., "Stage: Proposal Sent") next to or below the deal name. The stage is clearly labeled.

#### Deal row displays deal value
- **Initial state:** ClientDetailPage is loaded for a client with a deal valued at $50,000.
- **Expected:** The deal row displays the value formatted as currency (e.g., "Value: $50,000"). The value is clearly labeled and formatted with commas/abbreviations as appropriate.

#### Clicking a deal row navigates to /deals/:dealId
- **Initial state:** ClientDetailPage is loaded for a client with a deal "Acme Software License" with deal id 10.
- **Action:** User clicks on the "Acme Software License" deal row.
- **Expected:** The browser navigates to /deals/10 and the DealDetailPage is displayed showing the full details for that deal.

#### Clicking a different deal navigates to the correct deal detail page
- **Initial state:** ClientDetailPage is loaded for a client with a deal "Additional Services" with deal id 15.
- **Action:** User clicks on the "Additional Services" deal row.
- **Expected:** The browser navigates to /deals/15 and the DealDetailPage is displayed showing the full details for "Additional Services".

#### Empty state when no deals exist for this client
- **Initial state:** ClientDetailPage is loaded for a client with no deals.
- **Expected:** The Deals section displays an empty state message (e.g., "No deals") instead of deal rows. The section heading is still visible.

### ClientAttachments

#### Attachments section displays heading
- **Initial state:** ClientDetailPage is loaded for a client with attachments.
- **Expected:** The Attachments section displays an "Attachments" heading.

#### Attachments section displays list of attachments
- **Initial state:** ClientDetailPage is loaded for a client with three attachments: "Service Agreement.pdf" (Document, 2023-02-01, linked to Acme Software License deal), "Project Scope.docx" (Document, 2023-02-10, no linked deal), "Client Website Link" (Link, 2023-01-15, no linked deal).
- **Expected:** The Attachments section lists all three attachments in a table-like layout. Each row shows an icon, filename, type, created date, linked deal, and action buttons.

#### Attachment row displays file-type icon for documents
- **Initial state:** ClientDetailPage is loaded for a client with a PDF attachment "Service Agreement.pdf".
- **Expected:** The attachment row displays a file-type-specific icon to the left of the filename. PDF and document files show a document icon. The icon is visually distinct from link icons.

#### Attachment row displays file-type icon for spreadsheets
- **Initial state:** ClientDetailPage is loaded for a client with a spreadsheet attachment (e.g., "budget.xlsx").
- **Expected:** The attachment row displays a spreadsheet-specific icon to the left of the filename, distinct from the document icon.

#### Attachment row displays link icon for link attachments
- **Initial state:** ClientDetailPage is loaded for a client with a link attachment "Client Website Link".
- **Expected:** The attachment row displays a link/chain icon to the left of the attachment name, visually distinct from file-type icons.

#### Attachment row displays thumbnail preview for image files
- **Initial state:** ClientDetailPage is loaded for a client with an image attachment (e.g., "logo.png").
- **Expected:** The attachment row displays a thumbnail preview of the image instead of a generic file-type icon. The thumbnail is small and proportionally sized.

#### Attachment row displays filename
- **Initial state:** ClientDetailPage is loaded for a client with an attachment named "Service Agreement.pdf".
- **Expected:** The attachment row displays the filename "Service Agreement.pdf" as the primary text.

#### Attachment row displays type label
- **Initial state:** ClientDetailPage is loaded for a client with attachments of different types.
- **Expected:** Each attachment row displays the type label: "Document" for uploaded files, "Link" for URL attachments. The type is shown as a text label (e.g., "Document", "Link").

#### Attachment row displays created date
- **Initial state:** ClientDetailPage is loaded for a client with an attachment created on 2023-02-01.
- **Expected:** The attachment row displays the created date formatted as "Created: 2023-02-01" (or "Feb 1, 2023"). The date is clearly labeled.

#### Attachment row displays linked deal when associated
- **Initial state:** ClientDetailPage is loaded for a client with an attachment "Service Agreement.pdf" linked to deal "Acme Software License".
- **Expected:** The attachment row displays "Linked Deal: Acme Software License" (or similar text showing the deal association). The deal name is visible.

#### Attachment row shows no deal label when not linked
- **Initial state:** ClientDetailPage is loaded for a client with an attachment "Project Scope.docx" not linked to any deal.
- **Expected:** The attachment row displays "Linked Deal: None" (or "—") for the linked deal field.

#### Download button on file attachment triggers download
- **Initial state:** ClientDetailPage is loaded for a client with a file attachment "Service Agreement.pdf".
- **Action:** User clicks the download icon/button on the "Service Agreement.pdf" row.
- **Expected:** The file is downloaded to the user's device. The download starts immediately or a save dialog appears.

#### View button on link attachment opens the link
- **Initial state:** ClientDetailPage is loaded for a client with a link attachment "Client Website Link".
- **Action:** User clicks the view icon/button (eye icon) on the "Client Website Link" row.
- **Expected:** The linked URL opens in a new browser tab/window.

#### Delete button removes an attachment with confirmation
- **Initial state:** ClientDetailPage is loaded for a client with an attachment "Project Scope.docx".
- **Action:** User clicks the delete icon/button (trash icon) on the "Project Scope.docx" row.
- **Expected:** A confirmation dialog appears asking the user to confirm deletion (e.g., "Are you sure you want to delete this attachment?"). Upon confirmation, the attachment is deleted via the API. The attachment row is removed from the list.

#### Delete attachment cancellation keeps the attachment
- **Initial state:** The delete confirmation dialog is open for an attachment.
- **Action:** User clicks "Cancel" on the confirmation dialog.
- **Expected:** The dialog closes. The attachment remains in the list unchanged.

#### Empty state when no attachments exist
- **Initial state:** ClientDetailPage is loaded for a client with no attachments.
- **Expected:** The Attachments section displays an empty state message (e.g., "No attachments") instead of attachment rows. The section heading is still visible.

### ClientPeople

#### People section displays heading
- **Initial state:** ClientDetailPage is loaded for a client with associated people.
- **Expected:** The People section displays a "People" heading.

#### People section displays list of associated individuals
- **Initial state:** ClientDetailPage is loaded for a client with three associated people: "Sarah Johnson - CEO", "Michael Chen - CTO", "Emily Davis - Project Manager".
- **Expected:** The People section lists all three people. Each entry shows the person's avatar, name, and role/title.

#### Person entry displays avatar
- **Initial state:** ClientDetailPage is loaded for a client with associated people who have avatar images.
- **Expected:** Each person entry displays a circular avatar image to the left of the person's name. If no avatar is available, a fallback with initials is shown.

#### Person entry displays name
- **Initial state:** ClientDetailPage is loaded for a client with an associated person "Sarah Johnson".
- **Expected:** The person entry displays the full name "Sarah Johnson" as the primary text.

#### Person entry displays role/title
- **Initial state:** ClientDetailPage is loaded for a client with an associated person "Sarah Johnson" who has the title "CEO".
- **Expected:** The person entry displays the role/title "CEO" after the name, separated by a dash or in a secondary text style (e.g., "Sarah Johnson - CEO").

#### Person entry with no title shows name only
- **Initial state:** ClientDetailPage is loaded for a client with an associated person who has no title set.
- **Expected:** The person entry displays the person's name without a title. The layout does not break or show "undefined".

#### Clicking a person entry navigates to /individuals/:id
- **Initial state:** ClientDetailPage is loaded for a client with an associated person "Sarah Johnson" with individual id 5.
- **Action:** User clicks on the "Sarah Johnson" person entry.
- **Expected:** The browser navigates to /individuals/5 and the PersonDetailPage is displayed showing the full details for Sarah Johnson.

#### Clicking a different person navigates to the correct person detail page
- **Initial state:** ClientDetailPage is loaded for a client with an associated person "Michael Chen" with individual id 8.
- **Action:** User clicks on the "Michael Chen" person entry.
- **Expected:** The browser navigates to /individuals/8 and the PersonDetailPage is displayed showing the full details for Michael Chen.

#### Empty state when no people are associated with this client
- **Initial state:** ClientDetailPage is loaded for a client with no associated people.
- **Expected:** The People section displays an empty state message (e.g., "No contacts") instead of person entries. The section heading is still visible.

### ClientTimeline

#### Timeline section displays heading
- **Initial state:** ClientDetailPage is loaded for a client with timeline events.
- **Expected:** The Timeline section displays a "Timeline" heading.

#### Timeline displays events in reverse chronological order
- **Initial state:** ClientDetailPage is loaded for a client with multiple timeline events spanning different dates (today, yesterday, 2 days ago, last week, last month).
- **Expected:** The Timeline section displays events in reverse chronological order (most recent first). Each event is positioned along a vertical timeline with dot indicators. Events are grouped by relative date labels (e.g., "Today", "Yesterday", "2 days ago", "Last Week", "Last Month").

#### Timeline displays Task Created event
- **Initial state:** ClientDetailPage is loaded for a client. A task "Follow up on proposal" was created today by User A.
- **Expected:** The timeline shows an entry: "Today - Task Created: 'Follow up on proposal' by User A". The event text includes the task name in quotes and the user who created it as a clickable link. The date label shows "Today".

#### Timeline displays Note Added event
- **Initial state:** ClientDetailPage is loaded for a client. A note "Client mentioned interest in new features." was added yesterday by User B.
- **Expected:** The timeline shows an entry: "Yesterday - Note Added: 'Client mentioned interest in new features.' by User B". The event text includes the note content (or excerpt) in quotes and the user who added it as a clickable link. The date label shows "Yesterday".

#### Timeline displays Deal Stage Changed event
- **Initial state:** ClientDetailPage is loaded for a client. The deal "Acme Software License" had its stage changed from "Qualification" to "Proposal Sent" 2 days ago by User A.
- **Expected:** The timeline shows an entry: "2 days ago - Deal Stage Changed: 'Acme Software License' from 'Qualification' to 'Proposal Sent' by User A". The event text includes the deal name, old stage, new stage, and the user who made the change. The user name is a clickable link.

#### Timeline displays Email Sent event
- **Initial state:** ClientDetailPage is loaded for a client. An email "Meeting Confirmation" was sent to Sarah Johnson last week.
- **Expected:** The timeline shows an entry: "Last Week - Email Sent: 'Meeting Confirmation' to Sarah Johnson". The event text includes the email subject and the recipient name. The recipient name is a clickable link.

#### Timeline displays Contact Added event
- **Initial state:** ClientDetailPage is loaded for a client. Contact "Michael Chen" was added last month by User C.
- **Expected:** The timeline shows an entry: "Last Month - Contact Added: 'Michael Chen' by User C". The event text includes the contact name and the user who added them. The user name is a clickable link.

#### Timeline displays Status Changed event
- **Initial state:** ClientDetailPage is loaded for a client whose status was changed from "Prospect" to "Active".
- **Expected:** The timeline shows an entry describing the status change (e.g., "Client Status Changed: from 'Prospect' to 'Active' by [user]"). The event includes the old and new status values and the user who made the change.

#### Timeline displays Task Completed event
- **Initial state:** ClientDetailPage is loaded for a client. A task "Initial consultation" was completed.
- **Expected:** The timeline shows an entry: "Task Completed: 'Initial consultation' by [user]". The event text includes the task name and the user who completed it.

#### Timeline user attribution shows user name as clickable link
- **Initial state:** ClientDetailPage is loaded for a client with timeline events attributed to specific users (e.g., "User A", "User B").
- **Expected:** Each timeline event that was performed by a user displays the user's name as a clickable link. Clicking the user name navigates to /users/:userId for that user.

#### Timeline user attribution shows "System" for unauthenticated actions
- **Initial state:** ClientDetailPage is loaded for a client with timeline events that were created without authentication.
- **Expected:** Timeline events without an associated user show "System" as the attribution instead of a user name. "System" is not a clickable link.

#### Clicking a task event navigates to the task detail page
- **Initial state:** ClientDetailPage is loaded for a client with a "Task Created" timeline event for task "Follow up on proposal" with task id 42.
- **Action:** User clicks the task name "Follow up on proposal" in the timeline event.
- **Expected:** The browser navigates to /tasks/42 and the TaskDetailPage is displayed.

#### Clicking a deal event navigates to the deal detail page
- **Initial state:** ClientDetailPage is loaded for a client with a "Deal Stage Changed" timeline event for deal "Acme Software License" with deal id 10.
- **Action:** User clicks the deal name "Acme Software License" in the timeline event.
- **Expected:** The browser navigates to /deals/10 and the DealDetailPage is displayed.

#### Clicking a contact event navigates to the person detail page
- **Initial state:** ClientDetailPage is loaded for a client with a "Contact Added" timeline event for contact "Michael Chen" with individual id 8.
- **Action:** User clicks the contact name "Michael Chen" in the timeline event.
- **Expected:** The browser navigates to /individuals/8 and the PersonDetailPage is displayed.

#### Timeline dot indicators and vertical line
- **Initial state:** ClientDetailPage is loaded for a client with multiple timeline events.
- **Expected:** Each timeline event has a circular dot indicator to its left. A vertical line connects the dots, creating a visual timeline. The dots are consistently styled and positioned along the vertical line.

#### Empty state when no timeline events exist
- **Initial state:** ClientDetailPage is loaded for a newly created client with no timeline events (other than perhaps the creation event itself).
- **Expected:** The Timeline section displays an empty state message (e.g., "No activity yet") or shows only the client creation event. The section heading is still visible.

#### New timeline event appears after action on client
- **Initial state:** ClientDetailPage is loaded for a client. The timeline shows existing events.
- **Action:** User creates a new task for this client via the "Add Task" quick action.
- **Expected:** After the task is created and the page updates, a new "Task Created" event appears at the top of the timeline (most recent). Only one timeline entry is created per action (no duplicates from re-renders).

## PersonDetailPage (/individuals/:individualId)

Components: PersonHeader, PersonRelationships, PersonContactHistory, PersonAssociatedClients

### PersonHeader

#### Header displays person name prominently
- **Initial state:** User navigates to /individuals/:individualId for a person named "Dr. Anya Sharma".
- **Expected:** The page header displays the person's name "Dr. Anya Sharma" as the primary heading text, large and prominent at the top of the page.

#### Header displays title and associated organizations
- **Initial state:** PersonDetailPage is loaded for a person with title "Chief Technology Officer (CTO)" who is associated with clients "Innovate Solutions Inc." and "FutureTech Corp.".
- **Expected:** Below the person's name, the title is displayed followed by a pipe separator and the names of associated client organizations (e.g., "Chief Technology Officer (CTO) | Innovate Solutions Inc. & FutureTech Corp.").

#### Header displays email with mail icon
- **Initial state:** PersonDetailPage is loaded for a person with email "anya.sharma@example.com".
- **Expected:** The header shows an envelope/mail icon followed by the email address "anya.sharma@example.com". The email is displayed as a clickable link.

#### Header displays phone number with phone icon
- **Initial state:** PersonDetailPage is loaded for a person with phone "+1 (555) 123-4567".
- **Expected:** The header shows a phone icon followed by the phone number "+1 (555) 123-4567".

#### Header displays location with pin icon
- **Initial state:** PersonDetailPage is loaded for a person with location "San Francisco, CA".
- **Expected:** The header shows a map pin/location icon followed by the location text "San Francisco, CA".

#### Header displays Associated Clients links
- **Initial state:** PersonDetailPage is loaded for a person associated with clients "Innovate Solutions Inc." and "FutureTech Corp.".
- **Expected:** Below the contact info row, the text "Associated Clients:" is displayed followed by clickable links for each associated client name separated by commas (e.g., "Innovate Solutions Inc., FutureTech Corp."). The links are visually styled as hyperlinks (underlined or colored).

#### Clicking an associated client link in the header navigates to client detail page
- **Initial state:** PersonDetailPage is loaded for a person associated with client "Innovate Solutions Inc." (clientId: 1).
- **Action:** User clicks the "Innovate Solutions Inc." link in the header's Associated Clients row.
- **Expected:** The browser navigates to /clients/1 and the ClientDetailPage for "Innovate Solutions Inc." is displayed.

#### Header handles person with no title gracefully
- **Initial state:** PersonDetailPage is loaded for a person who has no title set.
- **Expected:** The header displays the person's name. The title/organization line is omitted or shows only the associated client names without a pipe separator. No layout breakage or error occurs.

#### Header handles person with no email gracefully
- **Initial state:** PersonDetailPage is loaded for a person who has no email set.
- **Expected:** The email row (envelope icon and email) is not displayed. The remaining contact fields (phone, location) still display correctly.

#### Header handles person with no phone gracefully
- **Initial state:** PersonDetailPage is loaded for a person who has no phone number set.
- **Expected:** The phone row (phone icon and number) is not displayed. The remaining contact fields (email, location) still display correctly.

#### Header handles person with no location gracefully
- **Initial state:** PersonDetailPage is loaded for a person who has no location set.
- **Expected:** The location row (pin icon and location text) is not displayed. The remaining contact fields (email, phone) still display correctly.

#### Header handles person with single associated client
- **Initial state:** PersonDetailPage is loaded for a person associated with only one client "Innovate Solutions Inc.".
- **Expected:** The Associated Clients row shows "Innovate Solutions Inc." as a single clickable link with no trailing comma or separator.

#### Loading state shows while person data is being fetched
- **Initial state:** User navigates to /individuals/:individualId and the API request for person data is in progress.
- **Expected:** A loading indicator (spinner or skeleton) is displayed while data is being fetched. The page layout skeleton is visible.

### PersonRelationships

#### Relationships section displays section header with icon
- **Initial state:** PersonDetailPage is loaded for a person with relationships.
- **Expected:** A section titled "Relationships with Other Individuals" is displayed with a chain/link icon to the left of the heading. The section has a Filter button and a "+ Add Entry" button to the right of the heading.

#### Relationships section displays Graph View and List View tabs
- **Initial state:** PersonDetailPage is loaded for a person with relationships.
- **Expected:** Below the section heading, two tabs are displayed: "Graph View" and "List View". One tab is active/selected (visually distinct with underline or bold text). By default, the List View tab is active.

#### List View displays relationship entries with name, type, org, and link
- **Initial state:** PersonDetailPage is loaded in List View for a person with relationships. The person has a relationship with "David Chen" (Colleague) who is "V.P. Engineering" at "Innovate Solutions Inc.".
- **Expected:** Each relationship entry shows: the related person's name ("David Chen"), the relationship type in parentheses ("Colleague"), a dash separator, the person's title and organization ("V.P. Engineering, Innovate Solutions Inc."), and a clickable "[Link]" text. All relationship entries are listed vertically.

#### Clicking Link on a relationship entry navigates to that person's detail page
- **Initial state:** PersonDetailPage is loaded in List View. A relationship entry for "David Chen" shows a "[Link]" element.
- **Action:** User clicks the "[Link]" text next to "David Chen".
- **Expected:** The browser navigates to /individuals/:davidChenId and the PersonDetailPage for "David Chen" is displayed.

#### Switching to Graph View tab displays relationship graph
- **Initial state:** PersonDetailPage is loaded with the List View tab active.
- **Action:** User clicks the "Graph View" tab.
- **Expected:** The Graph View tab becomes active (visually highlighted). The list view content is replaced with a graphical/visual representation of the person's relationship network showing connected nodes for each related individual.

#### Switching back to List View tab from Graph View
- **Initial state:** PersonDetailPage is loaded with the Graph View tab active.
- **Action:** User clicks the "List View" tab.
- **Expected:** The List View tab becomes active. The graph is replaced with the list of relationship entries showing name, type, org, and link for each relationship.

#### Filter button opens filter controls for relationships
- **Initial state:** PersonDetailPage is loaded. The Relationships section is visible with a Filter button (with filter icon).
- **Action:** User clicks the "Filter" button in the Relationships section.
- **Expected:** A filter dropdown or panel appears allowing the user to filter relationships by type (e.g., Colleague, Decision Maker, Influencer). The filter options correspond to the relationship types present in the data.

#### Filtering relationships by type shows only matching entries
- **Initial state:** PersonDetailPage is loaded with relationships of types Colleague, Decision Maker, and Influencer. The filter controls are open.
- **Action:** User selects "Decision Maker" from the filter options.
- **Expected:** Only relationship entries with type "Decision Maker" are displayed (e.g., "Maria Rodriguez (Decision Maker)"). Other entries (Colleague, Influencer) are hidden. The filter indicator shows that a filter is active.

#### Clearing relationship filter shows all entries again
- **Initial state:** PersonDetailPage is loaded with a relationship type filter active showing only "Decision Maker" entries.
- **Action:** User clears the filter (clicks a clear/reset option or deselects the filter).
- **Expected:** All relationship entries are displayed again regardless of type.

#### Add Entry button opens add relationship modal
- **Initial state:** PersonDetailPage is loaded. The Relationships section is visible with a "+ Add Entry" button.
- **Action:** User clicks the "+ Add Entry" button in the Relationships section.
- **Expected:** A modal dialog opens for adding a new relationship. The modal contains: a field to select or search for an existing individual (person), a dropdown or input for relationship type (e.g., Colleague, Decision Maker, Influencer), the related person's title and organization (auto-populated or manually entered), and Save/Cancel buttons.

#### Submitting add relationship modal creates a new relationship entry
- **Initial state:** The add relationship modal is open. User has selected an individual "Alex Kim" and chosen relationship type "Colleague".
- **Action:** User clicks "Save" in the modal.
- **Expected:** The modal closes. A new relationship entry for "Alex Kim (Colleague)" appears in the List View. The relationship is persisted via the API. A reciprocal relationship is also created on Alex Kim's PersonDetailPage linking back to the current person with the corresponding relationship type.

#### Reciprocal relationship is created when adding a relationship
- **Initial state:** PersonDetailPage is loaded for "Dr. Anya Sharma". A relationship to "Alex Kim" (Colleague) has just been added.
- **Action:** User navigates to /individuals/:alexKimId (Alex Kim's PersonDetailPage).
- **Expected:** Alex Kim's Relationships section contains a reciprocal entry showing "Dr. Anya Sharma (Colleague)" with a link back to Anya Sharma's PersonDetailPage.

#### Deleting a relationship removes it from both sides
- **Initial state:** PersonDetailPage is loaded for "Dr. Anya Sharma" with a relationship to "David Chen" (Colleague). David Chen also has a reciprocal relationship to Anya Sharma.
- **Action:** User deletes the relationship to "David Chen" (via a delete/remove action on the relationship entry).
- **Expected:** The relationship entry for "David Chen" is removed from Anya Sharma's Relationships section. Navigating to David Chen's PersonDetailPage confirms the reciprocal relationship to "Dr. Anya Sharma" is also removed.

#### Relationships section shows empty state when no relationships exist
- **Initial state:** PersonDetailPage is loaded for a person with no relationships.
- **Expected:** The Relationships section is displayed with the heading, Graph View/List View tabs, Filter button, and "+ Add Entry" button. The list area shows an empty state message (e.g., "No relationships found") instead of relationship entries.

### PersonContactHistory

#### History of Contact section displays section header with icon
- **Initial state:** PersonDetailPage is loaded for a person with contact history entries.
- **Expected:** A section titled "History of Contact" is displayed with a clock icon to the left of the heading. The section has a Filter button (with filter icon) and a "+ Add Entry" button to the right of the heading.

#### Contact history displays entries with date/time, type, summary, and team member
- **Initial state:** PersonDetailPage is loaded for a person with contact history entries.
- **Expected:** Each history entry displays in a row with the following columns: date and time (e.g., "Oct 26, 2023, 2:30 PM"), interaction type (e.g., "Video Call", "Email", "Meeting (In-person)", "Note"), a summary prefixed with "Summary:" (e.g., "Summary: Discussed Q4 roadmap integration. Action items assigned."), team member prefixed with "Team Member:" (e.g., "Team Member: Michael B. (Sales Lead)"), and an edit pencil icon on the right.

#### Contact history entries are displayed in reverse chronological order
- **Initial state:** PersonDetailPage is loaded for a person with multiple contact history entries at different dates.
- **Expected:** The most recent contact history entry appears first (at the top), followed by older entries in descending date/time order.

#### Contact history shows Video Call type correctly
- **Initial state:** PersonDetailPage is loaded with a contact history entry of type "Video Call".
- **Expected:** The entry displays "Video Call" in the type column. The text is clearly readable and distinguishable from other types.

#### Contact history shows Email type correctly
- **Initial state:** PersonDetailPage is loaded with a contact history entry of type "Email".
- **Expected:** The entry displays "Email" in the type column.

#### Contact history shows Meeting type correctly
- **Initial state:** PersonDetailPage is loaded with a contact history entry of type "Meeting (In-person)".
- **Expected:** The entry displays "Meeting (In-person)" in the type column.

#### Contact history shows Note type correctly
- **Initial state:** PersonDetailPage is loaded with a contact history entry of type "Note".
- **Expected:** The entry displays "Note" in the type column.

#### Contact history shows team member with role
- **Initial state:** PersonDetailPage is loaded with a contact history entry performed by team member "Michael B." with role "Sales Lead".
- **Expected:** The team member column shows "Team Member: Michael B. (Sales Lead)".

#### Contact history shows multiple team members on a single entry
- **Initial state:** PersonDetailPage is loaded with a contact history entry involving multiple team members "Michael B." and "Emily R.".
- **Expected:** The team member column shows "Team Member: Michael B., Emily R." with both names separated by a comma.

#### Contact history shows auto-logged entries with System as team member
- **Initial state:** PersonDetailPage is loaded with a contact history entry that was auto-logged (not manually created by a team member).
- **Expected:** The team member column shows "Team Member: System (Auto-logged)".

#### Filter button opens filter controls for contact history
- **Initial state:** PersonDetailPage is loaded. The History of Contact section is visible with a Filter button.
- **Action:** User clicks the "Filter" button in the History of Contact section.
- **Expected:** A filter dropdown or panel appears allowing the user to filter contact history by interaction type (Video Call, Email, Meeting, Note) and/or by team member. The filter options correspond to the types and team members present in the data.

#### Filtering contact history by type shows only matching entries
- **Initial state:** PersonDetailPage is loaded with contact history entries of types Video Call, Email, Meeting, and Note. The filter controls are open.
- **Action:** User selects "Email" from the type filter options.
- **Expected:** Only contact history entries with type "Email" are displayed. Other entries (Video Call, Meeting, Note) are hidden. The filter indicator shows that a filter is active.

#### Clearing contact history filter shows all entries again
- **Initial state:** PersonDetailPage is loaded with a contact history type filter active showing only "Email" entries.
- **Action:** User clears the filter.
- **Expected:** All contact history entries are displayed again regardless of type, in reverse chronological order.

#### Add Entry button opens add contact history modal
- **Initial state:** PersonDetailPage is loaded. The History of Contact section is visible with a "+ Add Entry" button.
- **Action:** User clicks the "+ Add Entry" button in the History of Contact section.
- **Expected:** A modal dialog opens for adding a new contact history entry. The modal contains: a date/time picker (defaulting to the current date and time), a dropdown for interaction type (Video Call, Email, Meeting (In-person), Note), a text area for the summary, a field to select the team member(s) who participated, and Save/Cancel buttons.

#### Submitting add contact history modal creates a new entry
- **Initial state:** The add contact history modal is open. User has set the date to "Nov 1, 2023, 3:00 PM", selected type "Email", entered summary "Sent pricing proposal for Q1 renewal.", and selected team member "Emily R.".
- **Action:** User clicks "Save" in the modal.
- **Expected:** The modal closes. A new contact history entry appears in the list at the correct chronological position with the entered date/time, type "Email", the summary text, and "Team Member: Emily R.". The entry is persisted via the API.

#### Edit icon opens edit contact history modal with pre-populated data
- **Initial state:** PersonDetailPage is loaded with a contact history entry for "Oct 26, 2023, 2:30 PM" of type "Video Call" with summary "Discussed Q4 roadmap integration. Action items assigned." and team member "Michael B. (Sales Lead)".
- **Action:** User clicks the edit pencil icon on that entry.
- **Expected:** A modal dialog opens pre-populated with the existing entry data: the date/time is set to "Oct 26, 2023, 2:30 PM", the type dropdown shows "Video Call", the summary text area contains "Discussed Q4 roadmap integration. Action items assigned.", and the team member field shows "Michael B.". The modal has Save/Cancel buttons.

#### Saving edits to contact history entry updates the entry
- **Initial state:** The edit contact history modal is open for an entry. The user has changed the summary from "Discussed Q4 roadmap integration. Action items assigned." to "Discussed Q4 roadmap integration. Action items assigned. Follow-up scheduled for next week.".
- **Action:** User clicks "Save" in the modal.
- **Expected:** The modal closes. The contact history entry is updated to show the new summary text. The change is persisted via the API.

#### Cancel button on add/edit modal closes without saving
- **Initial state:** The add or edit contact history modal is open. User has made changes to the form fields.
- **Action:** User clicks "Cancel" in the modal.
- **Expected:** The modal closes. No new entry is created and no existing entry is modified. The contact history list remains unchanged.

#### Contact history section shows empty state when no history exists
- **Initial state:** PersonDetailPage is loaded for a person with no contact history entries.
- **Expected:** The History of Contact section is displayed with the heading, Filter button, and "+ Add Entry" button. The list area shows an empty state message (e.g., "No contact history found") instead of history entries.

### PersonAssociatedClients

#### Associated Clients section displays section header with icon
- **Initial state:** PersonDetailPage is loaded for a person associated with one or more clients.
- **Expected:** A section titled "Associated Clients" is displayed with a building/grid icon to the left of the heading.

#### Associated Clients displays client cards with name, status, and industry
- **Initial state:** PersonDetailPage is loaded for a person associated with clients "Innovate Solutions Inc." (Active, Software) and "FutureTech Corp." (Prospect, Hardware).
- **Expected:** Two client cards are displayed side by side. Each card shows: a client icon, the client name (e.g., "Innovate Solutions Inc."), "Status:" followed by the status value (e.g., "Active Client"), "Industry:" followed by the industry value (e.g., "Software"), and a "View Client Detail Page" button/link with an external link icon.

#### Client card displays correct status for Active client
- **Initial state:** PersonDetailPage is loaded for a person associated with a client with "Active" status.
- **Expected:** The client card shows "Status: Active Client" for that client.

#### Client card displays correct status for Prospect client
- **Initial state:** PersonDetailPage is loaded for a person associated with a client with "Prospect" status.
- **Expected:** The client card shows "Status: Prospect" for that client.

#### View Client Detail Page link navigates to /clients/:clientId
- **Initial state:** PersonDetailPage is loaded for a person associated with client "Innovate Solutions Inc." (clientId: 1). The client card shows a "View Client Detail Page" button.
- **Action:** User clicks the "View Client Detail Page" button on the "Innovate Solutions Inc." card.
- **Expected:** The browser navigates to /clients/1 and the ClientDetailPage for "Innovate Solutions Inc." is displayed.

#### View Client Detail Page link navigates correctly for second client
- **Initial state:** PersonDetailPage is loaded for a person associated with client "FutureTech Corp." (clientId: 2). The client card shows a "View Client Detail Page" button.
- **Action:** User clicks the "View Client Detail Page" button on the "FutureTech Corp." card.
- **Expected:** The browser navigates to /clients/2 and the ClientDetailPage for "FutureTech Corp." is displayed.

#### Associated Clients section shows multiple cards for person with many clients
- **Initial state:** PersonDetailPage is loaded for a person associated with three or more clients.
- **Expected:** All associated client cards are displayed. Each card has the same layout with name, status, industry, and "View Client Detail Page" link. Cards are arranged in a responsive grid or row layout.

#### Associated Clients section shows empty state when no clients are associated
- **Initial state:** PersonDetailPage is loaded for a person with no associated clients.
- **Expected:** The Associated Clients section is displayed with the heading and icon. The content area shows an empty state message (e.g., "No associated clients") instead of client cards.

## DealsListPage (/deals)

Components: DealsSummaryCards, DealsTableView, DealsPipelineView, DealsFiltersAndSearch, CreateDealModal, DealsImportExport, DealsListContent

### DealsSummaryCards

#### Summary cards section displays four metric cards
- **Initial state:** DealsListPage is loaded with deals in the database.
- **Expected:** Four summary cards are displayed in a horizontal row at the top of the page below the page heading. Each card has an icon on the left, a label, and a prominent metric value. The four cards are: "Total Active Deals", "Pipeline Value", "Won (Q3)", and "Lost (Q3)".

#### Total Active Deals card shows count of active deals
- **Initial state:** DealsListPage is loaded with deals in various statuses (e.g., 124 active deals).
- **Expected:** The first summary card displays the label "Total Active Deals:" with a document/clipboard icon on the left. The metric value shows the count of deals with active status (e.g., "124"). The count updates to reflect the actual number of active deals in the database.

#### Pipeline Value card shows total value of active pipeline
- **Initial state:** DealsListPage is loaded with deals that have monetary values.
- **Expected:** The second summary card displays the label "Pipeline Value:" with a document/chart icon on the left. The metric value shows the total dollar value of all active pipeline deals formatted with appropriate abbreviations (e.g., "$4.5M" for $4,500,000). Values in thousands use "K" suffix, values in millions use "M" suffix.

#### Won Q3 card shows count and value of won deals in Q3
- **Initial state:** DealsListPage is loaded with deals including some with "Closed Won" stage in Q3.
- **Expected:** The third summary card displays the label "Won (Q3):" with a trophy/award icon on the left. The metric value shows the count of won deals in Q3 followed by the total value in parentheses (e.g., "32 ($1.2M)"). The count and value reflect only deals that were won during the Q3 period.

#### Lost Q3 card shows count and value of lost deals in Q3
- **Initial state:** DealsListPage is loaded with deals including some with "Closed Lost" stage in Q3.
- **Expected:** The fourth summary card displays the label "Lost (Q3):" with an icon on the left. The metric value shows the count of lost deals in Q3 followed by the total value in parentheses (e.g., "18 ($0.6M)"). The count and value reflect only deals that were lost during the Q3 period.

#### Summary cards reflect filtered data
- **Initial state:** DealsListPage is loaded with all deals visible and summary cards showing totals.
- **Action:** User applies a filter (e.g., selects "Negotiation" in the Stage filter).
- **Expected:** The summary cards update to reflect the filtered dataset. Total Active Deals count, Pipeline Value, Won Q3 count/value, and Lost Q3 count/value all recalculate based on the currently filtered deals.

### DealsTableView

#### Table displays correct column headers
- **Initial state:** DealsListPage is loaded with deals, Table View is active.
- **Expected:** The table displays eight column headers in order: Deal Name, Client, Stage, Owner, Value, Close Date, Status. An action menu column (no header text) is present as the last column. The headers are visible and clearly labeled.

#### Table rows display deal name
- **Initial state:** DealsListPage is loaded with deals (e.g., "Project Alpha Expansion", "Q4 Marketing Campaign", "Enterprise License Renewal").
- **Expected:** Each table row displays the deal's name in the Deal Name column as the primary identifier. The name is prominent and clearly readable.

#### Table rows display associated client name
- **Initial state:** DealsListPage is loaded with deals associated with clients.
- **Expected:** Each table row displays the associated client's name in the Client column (e.g., "Acme Corp.", "Beta Industries", "Gamma Solutions"). The client name corresponds to the client linked to the deal.

#### Table rows display deal stage
- **Initial state:** DealsListPage is loaded with deals in various stages.
- **Expected:** Each table row displays the deal's current stage in the Stage column (e.g., "Proposal Sent", "Qualification", "Negotiation", "Discovery", "Closed Won"). The stage text reflects the deal's current position in the pipeline.

#### Table rows display deal owner
- **Initial state:** DealsListPage is loaded with deals assigned to different owners.
- **Expected:** Each table row displays the deal owner's name in the Owner column (e.g., "Sarah K.", "Mike R.", "Emily L.", "Chris B."). The owner name is displayed in a short format (first name + last initial).

#### Table rows display deal value formatted as currency
- **Initial state:** DealsListPage is loaded with deals that have monetary values.
- **Expected:** Each table row displays the deal's value in the Value column formatted as currency with a dollar sign and comma separators (e.g., "$250,000", "$75,000", "$450,000", "$180,000", "$120,000"). Values are right-aligned or consistently formatted.

#### Table rows display close date
- **Initial state:** DealsListPage is loaded with deals with expected close dates.
- **Expected:** Each table row displays the deal's expected close date in the Close Date column in YYYY-MM-DD format (e.g., "2023-11-15", "2023-12-01", "2023-10-28", "2024-01-10").

#### Close Date column header shows sort arrow indicator
- **Initial state:** DealsListPage is loaded with deals, Table View is active. Sort is set to "Close Date (Newest)".
- **Expected:** The Close Date column header displays a clickable sort button with a directional arrow icon. When sorted descending (newest first), it shows an ArrowDown icon. When sorted ascending (oldest first), it shows an ArrowUp icon. When not sorted by close date, it shows an ArrowUpDown icon. The sort button has a `data-sort-direction` attribute reflecting the current direction ("desc", "asc", or "none").

#### Clicking Close Date header toggles sort direction
- **Initial state:** DealsListPage is loaded with deals sorted by Close Date descending (newest first). The Close Date header shows an ArrowDown icon.
- **Action:** User clicks the Close Date column header sort button.
- **Expected:** The sort direction toggles to ascending (oldest first). The ArrowDown icon changes to ArrowUp. The table rows reorder so that the earliest close dates appear first. The `data-sort-direction` attribute updates to "asc".

#### Table rows display status badges with correct colors
- **Initial state:** DealsListPage is loaded with deals in different statuses.
- **Expected:** Each table row displays the deal's status as a colored badge in the Status column. "On Track" has a blue/teal background, "Needs Attention" has an amber/yellow background, "At Risk" has a red/pink background, and "Won" has a green background. The badge text matches the deal's current status.

#### Clicking a deal row navigates to DealDetailPage
- **Initial state:** DealsListPage is loaded with deals in Table View.
- **Action:** User clicks on a deal row (e.g., the row for "Project Alpha Expansion" with deal id 1).
- **Expected:** The browser navigates to /deals/1 and the DealDetailPage is displayed showing the full details for that deal.

#### Action menu icon displayed on each row
- **Initial state:** DealsListPage is loaded with deals in Table View.
- **Expected:** Each table row has a three-dot menu icon ("...") on the far right side. The icon is visible and clickable.

#### Action menu shows options on click
- **Initial state:** DealsListPage is loaded with deals in Table View.
- **Action:** User clicks the three-dot menu icon ("...") on a deal row.
- **Expected:** A dropdown menu appears with options including: "View Details", "Edit", and "Delete". The menu is positioned near the three-dot icon.

#### Action menu View Details navigates to DealDetailPage
- **Initial state:** The three-dot action menu is open on a deal row (e.g., deal id 2).
- **Action:** User clicks "View Details" from the action menu.
- **Expected:** The browser navigates to /deals/2 and the DealDetailPage is displayed.

#### Action menu Edit opens edit functionality
- **Initial state:** The three-dot action menu is open on a deal row.
- **Action:** User clicks "Edit" from the action menu.
- **Expected:** An edit modal or inline edit mode opens, allowing the user to modify the deal's details (name, client, stage, owner, value, probability, expected close date, status). The current deal data is pre-populated in the form fields.

#### Action menu Delete removes the deal with confirmation
- **Initial state:** The three-dot action menu is open on a deal row.
- **Action:** User clicks "Delete" from the action menu.
- **Expected:** A confirmation dialog appears asking the user to confirm deletion (e.g., "Are you sure you want to delete this deal?"). Upon confirmation, the deal is deleted via the API and the row is removed from the table. The summary cards update to reflect the removal. A timeline entry is created for the associated client recording the deal deletion.

#### Action menu Delete cancellation keeps the deal
- **Initial state:** The delete confirmation dialog is open for a deal.
- **Action:** User clicks "Cancel" on the confirmation dialog.
- **Expected:** The dialog closes. The deal remains in the table unchanged.

#### Pagination displays current page and total pages
- **Initial state:** DealsListPage is loaded with more deals than fit on one page (e.g., 15 deals per page, 130 total deals).
- **Expected:** A pagination control is displayed below the table showing the current page number and total pages (e.g., "Page 1 of 9"). Navigation buttons (previous/next) are visible.

#### Pagination next button loads next page
- **Initial state:** DealsListPage is loaded showing page 1 of 9 in Table View.
- **Action:** User clicks the next page button.
- **Expected:** The table updates to show the next set of deals (page 2). The pagination indicator updates to "Page 2 of 9". The previous button becomes enabled. The table scrolls to the top.

#### Pagination previous button loads previous page
- **Initial state:** DealsListPage is showing page 2 of 9 in Table View.
- **Action:** User clicks the previous page button.
- **Expected:** The table updates to show the previous set of deals (page 1). The pagination indicator updates to "Page 1 of 9". The previous button becomes disabled (since it's the first page).

#### Pagination previous button is disabled on first page
- **Initial state:** DealsListPage is loaded showing page 1 of 9.
- **Expected:** The previous page button is disabled/grayed out and not clickable. The next page button is enabled.

#### Pagination next button is disabled on last page
- **Initial state:** DealsListPage is showing the last page (e.g., page 9 of 9).
- **Expected:** The next page button is disabled/grayed out and not clickable. The previous page button is enabled.

### DealsPipelineView

#### Pipeline view displays stage columns
- **Initial state:** DealsListPage is loaded with deals, Pipeline View tab is selected.
- **Expected:** The pipeline view displays one column for each deal stage (e.g., "Discovery", "Qualification", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"). Each column has a header showing the stage name. Columns are arranged horizontally and scrollable if they exceed the viewport width.

#### Pipeline view shows deal cards in correct stage columns
- **Initial state:** DealsListPage is loaded with deals in various stages, Pipeline View is active.
- **Expected:** Each deal appears as a card in the column corresponding to its current stage. For example, a deal in "Discovery" stage appears in the Discovery column, a deal in "Negotiation" appears in the Negotiation column. Each card shows the deal name, client name, and value.

#### Deal cards display deal information
- **Initial state:** DealsListPage is loaded with deals, Pipeline View is active.
- **Expected:** Each deal card in the pipeline view displays the deal name prominently, the associated client name, and the deal value formatted as currency. The card may also show the deal owner and status badge.

#### Deal cards are draggable
- **Initial state:** DealsListPage is loaded with deals, Pipeline View is active.
- **Expected:** Each deal card has a draggable appearance (e.g., grab cursor on hover). The user can click and hold a deal card to initiate a drag operation. A visual drag preview follows the cursor.

#### Drag-and-drop deal card to different stage column updates stage via API
- **Initial state:** DealsListPage is loaded with deals, Pipeline View is active. A deal (e.g., "Project Alpha Expansion") is in the "Proposal Sent" column.
- **Action:** User drags the deal card from "Proposal Sent" and drops it onto the "Negotiation" column.
- **Expected:** The deal card moves to the "Negotiation" column. The deal's stage is updated to "Negotiation" via an API call. A timeline entry is created on the associated client recording the stage change from "Proposal Sent" to "Negotiation". The summary cards update to reflect the change.

#### Drag-and-drop to same column does not trigger update
- **Initial state:** DealsListPage is loaded with deals, Pipeline View is active. A deal is in the "Discovery" column.
- **Action:** User drags a deal card within the "Discovery" column and drops it back in the same column.
- **Expected:** No API call is made. The deal remains in its current stage. No timeline entry is created.

#### Pipeline view reflects filters
- **Initial state:** DealsListPage is loaded with deals in Pipeline View with filters applied (e.g., Client filter set to "Acme Corp.").
- **Expected:** Only deals matching the active filters appear as cards in the pipeline columns. Other deals are hidden. The stage column headers remain visible even if a column has no matching deals.

#### Clicking a deal card in pipeline view navigates to DealDetailPage
- **Initial state:** DealsListPage is loaded with deals, Pipeline View is active.
- **Action:** User clicks on a deal card (e.g., "Enterprise License Renewal" with deal id 3).
- **Expected:** The browser navigates to /deals/3 and the DealDetailPage is displayed showing the full details for that deal.

### DealsFiltersAndSearch

#### Filter bar displays all filter controls
- **Initial state:** DealsListPage is loaded with deals.
- **Expected:** A filter bar is displayed between the summary cards and the table/pipeline view. The filter bar contains six controls in order: Stage dropdown (labeled "Stage:"), Client dropdown (labeled "Client:"), Status dropdown (labeled "Status:"), Date Range picker (labeled "Date - Range"), Sort by dropdown (labeled "Sort by:"), and a Search input with a search icon. All controls use custom styled FilterSelect dropdown components (not native HTML select elements).

#### Stage dropdown shows all stage options
- **Initial state:** DealsListPage is loaded.
- **Action:** User clicks the Stage dropdown.
- **Expected:** A custom FilterSelect dropdown opens showing stage options: "All Stages", "Discovery", "Qualification", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost". The default selected value is "All Stages".

#### Stage dropdown filters deals by selected stage
- **Initial state:** DealsListPage is loaded with deals in various stages. Stage dropdown shows "All Stages".
- **Action:** User opens the Stage dropdown and selects "Negotiation".
- **Expected:** The table/pipeline view updates to show only deals with "Negotiation" stage. The Stage dropdown displays "Negotiation" as the selected value. The summary cards update to reflect the filtered data. The pagination updates to reflect the new total count.

#### Client dropdown is searchable with FilterSelect
- **Initial state:** DealsListPage is loaded.
- **Action:** User clicks the Client dropdown.
- **Expected:** A custom FilterSelect dropdown opens with "All Clients" as the default option. Because the client list may contain many entries, a search input field appears at the top of the dropdown that auto-focuses when opened. The dropdown lists all clients available in the system.

#### Client dropdown search filters options as user types
- **Initial state:** The Client FilterSelect dropdown is open showing all clients.
- **Action:** User types "Acme" into the search input within the dropdown.
- **Expected:** The dropdown options filter in real-time to show only clients whose names match the search text (e.g., "Acme Corp." appears, other clients are hidden). The filtering is case-insensitive.

#### Client dropdown shows no matches message
- **Initial state:** The Client FilterSelect dropdown is open.
- **Action:** User types "XYZNONEXISTENT" into the search input.
- **Expected:** The dropdown displays a "No matches" message indicating no clients match the search text. No selectable options are shown.

#### Client dropdown filters deals by selected client
- **Initial state:** DealsListPage is loaded with deals across multiple clients.
- **Action:** User opens the Client dropdown and selects "Acme Corp.".
- **Expected:** The table/pipeline view updates to show only deals associated with "Acme Corp.". The Client dropdown displays "Acme Corp." as the selected value. The summary cards and pagination update accordingly.

#### Status dropdown shows status options
- **Initial state:** DealsListPage is loaded.
- **Action:** User clicks the Status dropdown.
- **Expected:** A custom FilterSelect dropdown opens showing status options including: "All", "Active", "On Track", "Needs Attention", "At Risk", "Won", "Lost". The default selected value is "Active".

#### Status dropdown filters deals by selected status
- **Initial state:** DealsListPage is loaded with deals in various statuses. Status dropdown shows "Active".
- **Action:** User opens the Status dropdown and selects "At Risk".
- **Expected:** The table/pipeline view updates to show only deals with "At Risk" status. The Status dropdown displays "At Risk" as the selected value. The summary cards and pagination update accordingly.

#### Date Range picker allows selecting a date range
- **Initial state:** DealsListPage is loaded.
- **Action:** User clicks the Date Range picker control.
- **Expected:** A date range picker interface opens allowing the user to select a start date and an end date. The picker has calendar controls for navigating months. The control displays "Date - Range" as placeholder text when no range is selected.

#### Date Range picker filters deals by close date range
- **Initial state:** DealsListPage is loaded with deals with various close dates.
- **Action:** User selects a date range in the Date Range picker (e.g., from 2023-10-01 to 2023-12-31).
- **Expected:** The table/pipeline view updates to show only deals whose expected close date falls within the selected range. The Date Range picker displays the selected range. The summary cards and pagination update accordingly.

#### Sort by dropdown shows sort options
- **Initial state:** DealsListPage is loaded.
- **Action:** User clicks the Sort by dropdown.
- **Expected:** A custom FilterSelect dropdown opens showing sort options including: "Close Date (Newest)", "Close Date (Oldest)", "Value (Highest)", "Value (Lowest)", "Deal Name (A-Z)", "Deal Name (Z-A)". The default selected value is "Close Date (Newest)".

#### Sort by dropdown changes table sort order
- **Initial state:** DealsListPage is loaded with deals sorted by Close Date (Newest).
- **Action:** User opens the Sort by dropdown and selects "Value (Highest)".
- **Expected:** The table rows reorder so that deals with the highest values appear first. The Sort by dropdown displays "Value (Highest)" as the selected value. The Close Date column sort arrow indicator updates to ArrowUpDown (since the sort is no longer by close date).

#### Search input filters deals by name
- **Initial state:** DealsListPage is loaded with deals in Table View.
- **Action:** User types "Alpha" into the Search input field.
- **Expected:** The table updates to show only deals whose name contains "Alpha" (e.g., "Project Alpha Expansion"). The search is case-insensitive and uses debounced input. The summary cards and pagination update to reflect the filtered results.

#### Search input placeholder text
- **Initial state:** DealsListPage is loaded. The Search input is empty.
- **Expected:** The Search input displays placeholder text "Search deals..." with a search icon to the left of the input field.

#### Search input clears and resets results
- **Initial state:** DealsListPage is loaded with a search filter active (e.g., "Alpha" typed in the Search input, showing filtered results).
- **Action:** User clears the Search input (backspaces or clears the field).
- **Expected:** The table resets to show all deals (subject to other active filters). The summary cards and pagination update to reflect the full dataset.

#### Multiple filters combine with AND logic
- **Initial state:** DealsListPage is loaded with all deals visible.
- **Action:** User selects "Negotiation" in the Stage dropdown and "Acme Corp." in the Client dropdown.
- **Expected:** The table/pipeline view shows only deals that are both in the "Negotiation" stage AND associated with "Acme Corp.". Both filter dropdowns show their selected values. The summary cards and pagination reflect the combined filter results.

#### Filters persist when switching between Table and Pipeline views
- **Initial state:** DealsListPage is loaded in Table View with filters applied (e.g., Stage set to "Discovery").
- **Action:** User switches to Pipeline View by clicking the "Pipeline View" tab.
- **Expected:** The Pipeline View displays only deals matching the active filters. The filter bar retains the selected filter values. Switching back to Table View also retains the filters.

### CreateDealModal

#### Create New Deal button is displayed in page header
- **Initial state:** DealsListPage is loaded.
- **Expected:** A "Create New Deal" button is displayed in the upper right area of the page header, next to the "Deals List" heading. The button has a prominent style (e.g., blue/primary background with white text).

#### Clicking Create New Deal button opens the modal
- **Initial state:** DealsListPage is loaded.
- **Action:** User clicks the "Create New Deal" button.
- **Expected:** A modal dialog opens with the title "Create New Deal" (or similar). The modal overlays the page with a backdrop. The modal contains a form with all required fields for creating a deal.

#### Modal displays all form fields
- **Initial state:** The Create New Deal modal is open.
- **Expected:** The modal form contains the following fields: Deal Name (text input), Client (searchable FilterSelect dropdown), Value (number/currency input), Stage (dropdown), Owner (FilterSelect dropdown populated from users API), Probability (number input, percentage), Expected Close Date (date picker), and Status (dropdown). Each field has a label. The form also has "Create" (or "Save") and "Cancel" buttons at the bottom.

#### Client field is a searchable FilterSelect dropdown
- **Initial state:** The Create New Deal modal is open.
- **Action:** User clicks the Client field.
- **Expected:** A searchable FilterSelect dropdown opens listing all clients in the system. A search input field appears at the top of the dropdown that auto-focuses. The user can type to filter client options. The dropdown is populated from the clients API.

#### Client dropdown search filters client options
- **Initial state:** The Client FilterSelect dropdown is open in the Create New Deal modal.
- **Action:** User types "Beta" into the search field.
- **Expected:** The dropdown options filter to show only clients matching "Beta" (e.g., "Beta Industries"). Non-matching clients are hidden. Filtering is case-insensitive.

#### Owner field is a FilterSelect dropdown populated from users API
- **Initial state:** The Create New Deal modal is open.
- **Action:** User clicks the Owner field.
- **Expected:** A FilterSelect dropdown opens listing all team members/users from the users API (e.g., "Sarah K.", "Mike R.", "Emily L.", "Chris B."). The user can select a deal owner from this list.

#### Stage field shows pipeline stage options
- **Initial state:** The Create New Deal modal is open.
- **Action:** User clicks the Stage dropdown.
- **Expected:** The dropdown shows pipeline stage options: "Discovery", "Qualification", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost".

#### Status field shows status options
- **Initial state:** The Create New Deal modal is open.
- **Action:** User clicks the Status dropdown.
- **Expected:** The dropdown shows status options: "On Track", "Needs Attention", "At Risk", "Won", "Lost".

#### Probability field accepts percentage value
- **Initial state:** The Create New Deal modal is open.
- **Action:** User enters "75" in the Probability field.
- **Expected:** The field accepts the numeric value representing a percentage (0-100). The field may display a "%" suffix or label.

#### Expected Close Date field opens a date picker
- **Initial state:** The Create New Deal modal is open.
- **Action:** User clicks the Expected Close Date field.
- **Expected:** A date picker interface opens allowing the user to select a date. The selected date is displayed in the field in a standard format (e.g., YYYY-MM-DD).

#### Value field accepts currency amount
- **Initial state:** The Create New Deal modal is open.
- **Action:** User enters "250000" in the Value field.
- **Expected:** The field accepts the numeric value. The field may display a "$" prefix or format the value as currency.

#### Form validation requires deal name
- **Initial state:** The Create New Deal modal is open. The Deal Name field is empty. Other fields are filled.
- **Action:** User clicks "Create" without entering a deal name.
- **Expected:** The form does not submit. A validation error message appears near the Deal Name field (e.g., "Deal name is required"). The modal remains open.

#### Form validation requires client selection
- **Initial state:** The Create New Deal modal is open. The Client field has no selection. Other required fields are filled.
- **Action:** User clicks "Create" without selecting a client.
- **Expected:** The form does not submit. A validation error message appears near the Client field (e.g., "Client is required"). The modal remains open.

#### Successful deal creation adds deal to the list
- **Initial state:** The Create New Deal modal is open with all fields filled (e.g., name: "New Strategic Partnership", client: "Acme Corp.", value: 500000, stage: "Discovery", owner: "Sarah K.", probability: 50, expected close date: 2024-03-15, status: "On Track").
- **Action:** User clicks the "Create" button.
- **Expected:** The deal is created via an API call. The modal closes. The deals table/pipeline view refreshes and shows the newly created deal. The summary cards update (e.g., Total Active Deals count increases by 1, Pipeline Value increases). A timeline entry is created on the associated client recording that the deal was created.

#### Cancel button closes modal without creating a deal
- **Initial state:** The Create New Deal modal is open with some fields filled.
- **Action:** User clicks the "Cancel" button.
- **Expected:** The modal closes. No deal is created. The deals list remains unchanged. Any data entered in the form is discarded.

#### Closing modal via backdrop click discards form data
- **Initial state:** The Create New Deal modal is open with some fields filled.
- **Action:** User clicks the backdrop/overlay outside the modal.
- **Expected:** The modal closes. No deal is created. The deals list remains unchanged.

### DealsImportExport

### DealsListContent

## DealDetailPage (/deals/:dealId)

## TasksListPage (/tasks)

Components: TasksFilterBar, TaskCard, CreateTaskModal, TasksListContent

### TasksFilterBar

#### Search input filters tasks by title
- **Initial state:** TasksListPage is loaded with multiple tasks visible (e.g., "Finalize Q3 Marketing Plan", "Review Client Proposal Draft", "Update Team Documentation").
- **Action:** User types "Marketing" into the search input (placeholder text "Filter...").
- **Expected:** The task list updates to show only tasks whose title contains "Marketing" (e.g., "Finalize Q3 Marketing Plan"). Tasks that do not match are hidden. The search is case-insensitive and debounced.

#### Search input clears and shows all tasks
- **Initial state:** The search input contains "Marketing" and only matching tasks are shown.
- **Action:** User clears the search input.
- **Expected:** All tasks are displayed again without any title filter applied.

#### Priority filter dropdown filters by priority level
- **Initial state:** TasksListPage is loaded with tasks of varying priorities (High, Medium, Low, Normal).
- **Action:** User clicks the filter dropdown icon (filter icon with chevron) and selects "High" from the priority filter options.
- **Expected:** The task list updates to show only tasks with "High" priority. The priority filter selection is visually indicated in the filter bar. Tasks with Medium, Low, and Normal priorities are hidden.

#### Priority filter can be cleared to show all priorities
- **Initial state:** The priority filter is set to "High", showing only high-priority tasks.
- **Action:** User opens the priority filter dropdown and selects the "All" or clears the priority filter.
- **Expected:** All tasks are displayed regardless of priority. The filter bar returns to its default unfiltered state.

#### Status filter dropdown filters by task status
- **Initial state:** TasksListPage is loaded with tasks having different statuses (open, completed, cancelled).
- **Action:** User opens the filter dropdown and selects "Completed" from the status filter options.
- **Expected:** The task list updates to show only tasks with "Completed" status. Open and cancelled tasks are hidden.

#### Status filter shows open tasks by default
- **Initial state:** User navigates to /tasks.
- **Expected:** The status filter defaults to showing "Open" tasks (upcoming/active tasks). Completed and cancelled tasks are not shown unless the user changes the filter.

#### Multiple filters can be combined
- **Initial state:** TasksListPage is loaded with tasks of varying priorities and statuses.
- **Action:** User sets the priority filter to "High" and types "Plan" in the search input.
- **Expected:** Only tasks matching both criteria are shown (high priority AND title containing "Plan"). Changing either filter updates the results immediately.

### TaskCard

#### Task card displays priority badge with correct color
- **Initial state:** TasksListPage is loaded with tasks of different priorities.
- **Expected:** Each task card displays a priority badge to the left of the title. The badge shows the priority text and is color-coded: "High" has a red/coral background, "Medium" has a yellow/amber background, "Low" has a green background, and "Normal" has a teal/blue-green background.

#### Task card displays task title
- **Initial state:** TasksListPage is loaded with tasks.
- **Expected:** Each task card displays the task title as prominent text to the right of the priority badge (e.g., "Finalize Q3 Marketing Plan", "Review Client Proposal Draft"). The title is the primary readable element on the card.

#### Task card displays formatted due date
- **Initial state:** TasksListPage is loaded with tasks that have various due dates.
- **Expected:** Each task card displays the due date prefixed with "Due:" (e.g., "Due: Today, 5:00 PM", "Due: Tomorrow, 10:00 AM", "Due: Oct 25, 2024"). Dates for today and tomorrow show relative labels ("Today", "Tomorrow") with time, while other dates show the calendar date.

#### Task card displays assignee avatar and name with role
- **Initial state:** TasksListPage is loaded with tasks that have assignees.
- **Expected:** Each task card displays the assignee's circular avatar image on the right side, followed by the assignee's name abbreviated with last initial and their role in parentheses (e.g., "Sarah J. (PM)", "David L. (Sales)", "Emily C. (Dev)", "Mark R. (Lead)").

#### Clicking a task card navigates to task detail page
- **Initial state:** TasksListPage is loaded with tasks.
- **Action:** User clicks on a task card (e.g., the card for "Finalize Q3 Marketing Plan" with id 1).
- **Expected:** The browser navigates to /tasks/1 and the TaskDetailPage is displayed showing the full details for that task.

#### Task card action menu shows options on click
- **Initial state:** TasksListPage is loaded with tasks. Each task card has a three-dot menu icon ("...") on the far right.
- **Action:** User clicks the three-dot menu icon on a task card.
- **Expected:** A dropdown menu appears with options: "View Details", "Edit", "Mark Complete", "Cancel Task", and "Delete". The menu is positioned near the three-dot icon.

#### Action menu View Details navigates to task detail page
- **Initial state:** The three-dot action menu is open on a task card (e.g., task id 5).
- **Action:** User clicks "View Details" from the action menu.
- **Expected:** The browser navigates to /tasks/5 and the TaskDetailPage is displayed.

#### Action menu Mark Complete updates task status
- **Initial state:** The three-dot action menu is open on an open task card.
- **Action:** User clicks "Mark Complete" from the action menu.
- **Expected:** The task's status is updated to "completed" via the API. The task card is removed from the list (if the status filter is set to "Open") or the card visually updates to reflect the completed status. A timeline entry is created for the status change on the associated client (if any).

#### Action menu Cancel Task updates task status
- **Initial state:** The three-dot action menu is open on an open task card.
- **Action:** User clicks "Cancel Task" from the action menu.
- **Expected:** The task's status is updated to "cancelled" via the API. The task card is removed from the list (if the status filter is set to "Open") or the card visually updates to reflect the cancelled status. A timeline entry is created for the status change on the associated client (if any).

#### Action menu Delete removes the task
- **Initial state:** The three-dot action menu is open on a task card.
- **Action:** User clicks "Delete" from the action menu.
- **Expected:** A confirmation dialog appears asking the user to confirm deletion. Upon confirmation, the task is deleted via the API and the card is removed from the list. The total task count decreases by one.

### CreateTaskModal

#### Clicking New Task button opens CreateTaskModal
- **Initial state:** TasksListPage is loaded. A blue "New Task" button is visible in the top-right area of the page header.
- **Action:** User clicks the "New Task" button.
- **Expected:** A modal dialog opens with the title "Create Task" (or "New Task"). The modal contains a form with fields for: Title (text input, required), Description (textarea), Due Date (date/time picker), Priority (dropdown with options: High, Medium, Normal, Low), Client (searchable FilterSelect dropdown populated from clients API), Assignee (searchable FilterSelect dropdown populated from users API). The modal has "Cancel" and "Create" (or "Save") buttons at the bottom.

#### CreateTaskModal form validates required fields
- **Initial state:** CreateTaskModal is open with all fields empty.
- **Action:** User clicks the "Create" submit button without filling in any fields.
- **Expected:** The form displays a validation error for the Title field indicating it is required. The task is not created. The modal remains open.

#### CreateTaskModal successfully creates a task
- **Initial state:** CreateTaskModal is open.
- **Action:** User fills in: Title = "Follow up with Acme Corp", Description = "Discuss renewal terms", Due Date = tomorrow at 2:00 PM, Priority = "High", Client = "Acme Corp" (selected from dropdown), Assignee = "Sarah J." (selected from users dropdown). User clicks the "Create" button.
- **Expected:** The task is created via the API. The modal closes. The new task appears in the task list with a "High" priority badge, the title "Follow up with Acme Corp", the due date showing "Due: Tomorrow, 2:00 PM", and "Sarah J." as the assignee. A timeline entry is created on the associated client's timeline for the new task creation. If any user is following the client "Acme Corp", they receive a notification (if notification preferences allow).

#### CreateTaskModal assignee dropdown shows team members
- **Initial state:** CreateTaskModal is open.
- **Action:** User clicks the Assignee dropdown.
- **Expected:** A searchable FilterSelect dropdown appears listing team members fetched from the users API. Each option shows the user's name. The user can type to filter the list. Selecting a user populates the Assignee field.

#### CreateTaskModal client dropdown shows clients
- **Initial state:** CreateTaskModal is open.
- **Action:** User clicks the Client dropdown.
- **Expected:** A searchable FilterSelect dropdown appears listing clients fetched from the clients API. Each option shows the client's name. The user can type to filter the list. Selecting a client populates the Client field.

#### CreateTaskModal priority dropdown shows all priority levels
- **Initial state:** CreateTaskModal is open.
- **Action:** User clicks the Priority dropdown.
- **Expected:** A dropdown appears with four options: High, Medium, Normal, and Low. Selecting a priority level populates the Priority field.

#### CreateTaskModal cancel button closes modal without creating
- **Initial state:** CreateTaskModal is open with some fields filled in.
- **Action:** User clicks the "Cancel" button.
- **Expected:** The modal closes. No task is created. The task list remains unchanged.

#### CreateTaskModal closes on overlay click
- **Initial state:** CreateTaskModal is open.
- **Action:** User clicks the modal overlay (area outside the modal dialog).
- **Expected:** The modal closes. No task is created.

### TasksListContent

#### Page displays heading and New Task button
- **Initial state:** User navigates to /tasks.
- **Expected:** The page displays a heading "Upcoming Tasks" at the top. A blue "New Task" button is displayed in the top-right corner of the page header. The sidebar "Tasks" link is highlighted as active.

#### Loading state shows while tasks are being fetched
- **Initial state:** User navigates to /tasks and the API request for tasks is in progress.
- **Expected:** A loading indicator (spinner or skeleton) is displayed in the task list area while data is being fetched. The filter bar and page header are still visible.

#### Empty state shown when no tasks match filters
- **Initial state:** TasksListPage is loaded. User applies filters that match no tasks (e.g., search for "xyznonexistent").
- **Expected:** The task list area displays an empty state message (e.g., "No tasks found" or "No matching tasks") instead of task cards. The filter bar remains visible so the user can adjust filters.

#### Empty state shown when no tasks exist
- **Initial state:** User navigates to /tasks and there are no tasks in the system.
- **Expected:** The task list area displays an empty state message (e.g., "No tasks yet") with a prompt or button to create the first task. The "New Task" button remains visible in the header.

#### Pagination controls appear when tasks exceed page size
- **Initial state:** The system has more tasks than fit on a single page (e.g., more than 20 tasks).
- **Expected:** Pagination controls are displayed below the task list (e.g., "Previous" / "Next" buttons or page numbers). The current page number is indicated. The total number of tasks or pages is shown.

#### Clicking next page loads the next set of tasks
- **Initial state:** TasksListPage is loaded with pagination controls visible. User is on page 1.
- **Action:** User clicks the "Next" page button.
- **Expected:** The task list updates to show the next page of tasks. The page indicator updates to show page 2. The "Previous" button becomes enabled. If there are no more pages, the "Next" button is disabled.

#### Clicking previous page loads the previous set of tasks
- **Initial state:** User is on page 2 of the tasks list.
- **Action:** User clicks the "Previous" page button.
- **Expected:** The task list updates to show the first page of tasks. The page indicator updates to show page 1. The "Previous" button becomes disabled (since it's the first page).

#### CSV export downloads tasks as CSV file
- **Initial state:** TasksListPage is loaded with tasks.
- **Action:** User clicks the CSV export button (or selects export from a menu).
- **Expected:** A CSV file is downloaded containing the task data. The CSV includes columns: Title, Description, Due Date, Priority, Client Name, Assignee. Each row corresponds to a task in the system.

#### CSV import button opens import dialog
- **Initial state:** TasksListPage is loaded.
- **Action:** User clicks the CSV import button (or selects import from a menu).
- **Expected:** An ImportDialog modal opens. The dialog displays a CSV column format specification table listing all supported columns (Title, Description, Due Date, Priority, Client Name, Assignee) with required/optional indicators and value descriptions. A "Download CSV template" button is available. A file upload area or file picker is present for selecting a CSV file.

#### CSV import processes valid file and creates tasks
- **Initial state:** The ImportDialog is open. User has a valid CSV file with tasks data matching the expected format.
- **Action:** User uploads the CSV file and confirms the import.
- **Expected:** The tasks from the CSV are created via the bulk import API. The dialog shows a success message with the count of tasks imported. After closing the dialog, the task list refreshes and the newly imported tasks appear in the list. Client names in the CSV are matched to existing clients in the system.

#### CSV import shows validation errors for invalid data
- **Initial state:** The ImportDialog is open. User has a CSV file with invalid data (e.g., missing required Title column, invalid priority value).
- **Action:** User uploads the invalid CSV file and confirms the import.
- **Expected:** The dialog displays per-row validation errors indicating which rows failed and why (e.g., "Row 3: Title is required", "Row 5: Invalid priority 'Urgent'"). Valid rows may still be imported, or the user may be asked to fix errors and retry. The error messages are specific enough for the user to correct the CSV.

## TaskDetailPage (/tasks/:taskId)

Components: TaskDetailHeader, TaskDetailInfo, TaskNotesSection, EditTaskModal

### TaskDetailHeader

#### Header displays task title prominently
- **Initial state:** User navigates to /tasks/:taskId for a task titled "Finalize Q3 Marketing Plan".
- **Expected:** The page header displays the task title "Finalize Q3 Marketing Plan" as the primary heading text. A back navigation element (arrow or "Back" link) is visible to return to the tasks list.

#### Header displays priority badge with correct color
- **Initial state:** TaskDetailPage is loaded for a task with "High" priority.
- **Expected:** A priority badge is displayed near the task title showing the priority text. The badge is color-coded: "High" has a red/coral background, "Medium" has a yellow/amber background, "Low" has a green background, and "Normal" has a teal/blue-green background.

#### Header displays status badge
- **Initial state:** TaskDetailPage is loaded for an open task.
- **Expected:** A status badge is displayed near the task title showing the current task status (e.g., "Open"). The badge is visually distinct from the priority badge (different color scheme). Completed tasks show a "Completed" badge and cancelled tasks show a "Cancelled" badge.

#### Back button navigates to tasks list
- **Initial state:** TaskDetailPage is loaded for any task.
- **Action:** User clicks the back navigation element (back arrow or "Back" link).
- **Expected:** The browser navigates to /tasks and the TasksListPage is displayed.

#### Edit button opens EditTaskModal
- **Initial state:** TaskDetailPage is loaded for an open task.
- **Action:** User clicks the "Edit" button in the header.
- **Expected:** The EditTaskModal opens with all current task data pre-populated in the form fields (title, description, due date, priority, client, assignee).

#### Mark Complete button updates task status to completed
- **Initial state:** TaskDetailPage is loaded for an open task associated with a client.
- **Action:** User clicks the "Mark Complete" button.
- **Expected:** The task status is updated to "completed" via the API. The status badge on the page changes to "Completed". The "Mark Complete" and "Cancel Task" action buttons are no longer available (since the task is already resolved). A timeline entry is created on the associated client's timeline recording the status change to completed. If any user is following the associated client, they receive a task-completed notification (if their notification preferences allow).

#### Cancel Task button updates task status to cancelled
- **Initial state:** TaskDetailPage is loaded for an open task associated with a client.
- **Action:** User clicks the "Cancel Task" button.
- **Expected:** The task status is updated to "cancelled" via the API. The status badge on the page changes to "Cancelled". The "Mark Complete" and "Cancel Task" action buttons are no longer available. A timeline entry is created on the associated client's timeline recording the status change to cancelled.

#### Action buttons hidden when task is already completed
- **Initial state:** TaskDetailPage is loaded for a task with status "completed".
- **Expected:** The "Mark Complete" and "Cancel Task" buttons are not displayed. The "Edit" button may still be visible. The status badge shows "Completed".

#### Action buttons hidden when task is already cancelled
- **Initial state:** TaskDetailPage is loaded for a task with status "cancelled".
- **Expected:** The "Mark Complete" and "Cancel Task" buttons are not displayed. The "Edit" button may still be visible. The status badge shows "Cancelled".

### TaskDetailInfo

#### Due date displayed with formatted date and time
- **Initial state:** TaskDetailPage is loaded for a task with a due date of tomorrow at 2:00 PM.
- **Expected:** The info section displays the due date in a readable format (e.g., "Due: Tomorrow, 2:00 PM"). Dates for today and tomorrow show relative labels with time, while other dates show the calendar date (e.g., "Oct 25, 2024, 3:00 PM"). A calendar or clock icon is shown next to the due date.

#### Assignee displayed with avatar and name linking to user detail
- **Initial state:** TaskDetailPage is loaded for a task assigned to "Sarah Johnson".
- **Expected:** The info section displays the assignee's circular avatar image and full name "Sarah Johnson". The assignee name is a clickable link.
- **Action:** User clicks the assignee name.
- **Expected:** The browser navigates to /users/:userId for that user, displaying the UserDetailPage.

#### Client displayed with name linking to client detail page
- **Initial state:** TaskDetailPage is loaded for a task associated with client "Acme Corp".
- **Expected:** The info section displays the associated client name "Acme Corp". The client name is a clickable link.
- **Action:** User clicks the client name.
- **Expected:** The browser navigates to /clients/:clientId for Acme Corp, displaying the ClientDetailPage.

#### Deal displayed with name linking to deal detail page
- **Initial state:** TaskDetailPage is loaded for a task associated with a deal "Enterprise License Renewal".
- **Expected:** The info section displays the associated deal name "Enterprise License Renewal". The deal name is a clickable link.
- **Action:** User clicks the deal name.
- **Expected:** The browser navigates to /deals/:dealId for that deal, displaying the DealDetailPage.

#### Optional fields show placeholder when not set
- **Initial state:** TaskDetailPage is loaded for a task that has no associated deal and no assignee.
- **Expected:** The deal field shows a placeholder such as "No deal" or "—" instead of a link. The assignee field shows a placeholder such as "Unassigned" or "—". The layout does not break or collapse; the fields still occupy their expected positions.

#### Description text displayed
- **Initial state:** TaskDetailPage is loaded for a task with description "Discuss renewal terms and finalize pricing for next quarter".
- **Expected:** The info section displays the full description text "Discuss renewal terms and finalize pricing for next quarter" in a readable format below or alongside the metadata fields.

#### Empty description shows appropriate placeholder
- **Initial state:** TaskDetailPage is loaded for a task with no description.
- **Expected:** The description area shows a placeholder such as "No description" or is gracefully omitted. The layout does not break.

### TaskNotesSection

#### Notes section displays existing notes in chronological order
- **Initial state:** TaskDetailPage is loaded for a task that has three existing notes.
- **Expected:** The notes section displays a heading (e.g., "Notes"). All three notes are listed in chronological order (oldest first or newest first). Each note displays the note content text, the author name (or "System" if no author), and a formatted timestamp showing when the note was created.

#### Add note form with text input and submit button
- **Initial state:** TaskDetailPage is loaded for any task.
- **Expected:** The notes section includes an input area (text input or textarea) for writing a new note and a submit button (e.g., "Add Note" or a send icon). The input has placeholder text (e.g., "Add a note...").

#### Submitting a note adds it to the list
- **Initial state:** TaskDetailPage is loaded. The add note input is empty.
- **Action:** User types "Called client to discuss timeline" into the note input and clicks the submit button.
- **Expected:** The note is created via the POST API endpoint. The new note appears in the notes list with the content "Called client to discuss timeline", the current user as author (or "System" if unauthenticated), and the current timestamp. The input field is cleared after successful submission.

#### Submit button disabled when note input is empty
- **Initial state:** TaskDetailPage is loaded. The add note input is empty.
- **Expected:** The submit button is disabled or visually indicates it cannot be clicked when the note input is empty. Clicking it does nothing.

#### Delete button removes a note
- **Initial state:** TaskDetailPage is loaded for a task with existing notes. Each note has a delete button (trash icon or "Delete" text).
- **Action:** User clicks the delete button on a specific note.
- **Expected:** The note is deleted via the DELETE API endpoint. The note is removed from the notes list. The remaining notes are still displayed in their original order. The total count of notes decreases by one.

#### Empty state when no notes exist
- **Initial state:** TaskDetailPage is loaded for a task with no notes.
- **Expected:** The notes section displays an empty state message (e.g., "No notes yet" or "Add a note to get started"). The add note form is still visible and functional.

### EditTaskModal

#### Edit button opens modal with current task data pre-populated
- **Initial state:** TaskDetailPage is loaded for a task titled "Finalize Q3 Marketing Plan" with priority "High", due date of Oct 25 at 3:00 PM, client "Acme Corp", and assignee "Sarah Johnson".
- **Action:** User clicks the "Edit" button.
- **Expected:** The EditTaskModal opens. The Title field contains "Finalize Q3 Marketing Plan". The Priority dropdown shows "High". The Due Date picker shows Oct 25 at 3:00 PM. The Client dropdown shows "Acme Corp". The Assignee dropdown shows "Sarah Johnson". The Description textarea contains any existing description text.

#### EditTaskModal form fields
- **Initial state:** EditTaskModal is open.
- **Expected:** The modal contains a form with fields: Title (text input, required), Description (textarea), Due Date (date/time picker), Priority (dropdown with High, Medium, Normal, Low), Client (searchable FilterSelect dropdown populated from clients API), Assignee (searchable FilterSelect dropdown populated from users API). The modal has "Cancel" and "Save" buttons.

#### EditTaskModal validates required title field
- **Initial state:** EditTaskModal is open with task data pre-populated.
- **Action:** User clears the Title field and clicks "Save".
- **Expected:** A validation error is displayed for the Title field indicating it is required. The task is not updated. The modal remains open.

#### EditTaskModal saves changes and updates the page
- **Initial state:** EditTaskModal is open for a task with title "Finalize Q3 Marketing Plan" and priority "Medium".
- **Action:** User changes the title to "Complete Q3 Marketing Plan" and changes the priority to "High". User clicks "Save".
- **Expected:** The task is updated via the API. The modal closes. The TaskDetailPage header now shows the updated title "Complete Q3 Marketing Plan" and the priority badge shows "High" with a red/coral background. A timeline entry is created on the associated client's timeline recording the task update.

#### EditTaskModal priority dropdown shows all priority levels
- **Initial state:** EditTaskModal is open.
- **Action:** User clicks the Priority dropdown.
- **Expected:** A dropdown appears with four options: High, Medium, Normal, and Low. The current task's priority is pre-selected.

#### EditTaskModal client dropdown is searchable FilterSelect
- **Initial state:** EditTaskModal is open.
- **Action:** User clicks the Client dropdown and types "Acme" into the search field.
- **Expected:** The dropdown filters to show only clients whose names contain "Acme". The user can select a client from the filtered results to change the task's associated client.

#### EditTaskModal assignee dropdown is searchable FilterSelect
- **Initial state:** EditTaskModal is open.
- **Action:** User clicks the Assignee dropdown and types "Sarah" into the search field.
- **Expected:** The dropdown filters to show only team members whose names contain "Sarah". The user can select a team member from the filtered results to change the task's assignee.

#### EditTaskModal cancel button closes without saving
- **Initial state:** EditTaskModal is open with some fields modified.
- **Action:** User clicks the "Cancel" button.
- **Expected:** The modal closes. No changes are saved. The TaskDetailPage still shows the original task data.

#### EditTaskModal closes on overlay click
- **Initial state:** EditTaskModal is open.
- **Action:** User clicks the modal overlay (area outside the modal dialog).
- **Expected:** The modal closes. No changes are saved.

## ContactsListPage (/contacts)

Components: ContactsSearchBar, ContactsTable, CreateContactModal, ContactsListContent

### ContactsSearchBar

#### Search input filters contacts by name
- **Initial state:** ContactsListPage is loaded with multiple contacts visible (e.g., "Sarah Johnson", "David Lee", "Emily Carter").
- **Action:** User types "Sarah" into the search input (placeholder text "Search contacts...").
- **Expected:** The contacts table updates to show only contacts whose name, email, title, phone, or location contains "Sarah" (e.g., "Sarah Johnson"). Non-matching contacts are hidden. The search is case-insensitive and debounced.

#### Search input filters contacts by email
- **Initial state:** ContactsListPage is loaded with multiple contacts.
- **Action:** User types "sarah@" into the search input.
- **Expected:** The contacts table updates to show only contacts whose email contains "sarah@". Other contacts are hidden.

#### Search input filters contacts by title
- **Initial state:** ContactsListPage is loaded with contacts having various titles (e.g., "VP of Sales", "CTO", "Marketing Director").
- **Action:** User types "CTO" into the search input.
- **Expected:** The contacts table updates to show only contacts whose title contains "CTO".

#### Search input filters contacts by phone
- **Initial state:** ContactsListPage is loaded with contacts having phone numbers.
- **Action:** User types "555" into the search input.
- **Expected:** The contacts table updates to show only contacts whose phone number contains "555".

#### Search input filters contacts by location
- **Initial state:** ContactsListPage is loaded with contacts in various locations (e.g., "New York", "San Francisco", "Chicago").
- **Action:** User types "New York" into the search input.
- **Expected:** The contacts table updates to show only contacts whose location contains "New York".

#### Search input clears and shows all contacts
- **Initial state:** The search input contains "Sarah" and only matching contacts are shown.
- **Action:** User clears the search input.
- **Expected:** All contacts are displayed again without any filter applied.

### ContactsTable

#### Table displays correct column headers
- **Initial state:** ContactsListPage is loaded with contacts.
- **Expected:** The table displays six column headers in order: Name, Title, Email, Phone, Location, and Associated Clients. The headers are visible and clearly labeled.

#### Table rows display contact name
- **Initial state:** ContactsListPage is loaded with contacts.
- **Expected:** Each table row displays the contact's full name (e.g., "Sarah Johnson", "David Lee") as the primary identifier in the Name column.

#### Table rows display contact title
- **Initial state:** ContactsListPage is loaded with contacts that have titles.
- **Expected:** Each table row displays the contact's title/role in the Title column (e.g., "VP of Sales", "CTO", "Marketing Director"). Contacts without a title show an empty cell or placeholder.

#### Table rows display contact email
- **Initial state:** ContactsListPage is loaded with contacts that have email addresses.
- **Expected:** Each table row displays the contact's email address in the Email column (e.g., "sarah@acme.com"). Contacts without an email show an empty cell or placeholder.

#### Table rows display contact phone
- **Initial state:** ContactsListPage is loaded with contacts that have phone numbers.
- **Expected:** Each table row displays the contact's phone number in the Phone column (e.g., "(555) 123-4567"). Contacts without a phone number show an empty cell or placeholder.

#### Table rows display contact location
- **Initial state:** ContactsListPage is loaded with contacts that have locations.
- **Expected:** Each table row displays the contact's location in the Location column (e.g., "New York, NY"). Contacts without a location show an empty cell or placeholder.

#### Table rows display associated clients
- **Initial state:** ContactsListPage is loaded with contacts that are associated with clients.
- **Expected:** Each table row displays the names of associated clients in the Associated Clients column (e.g., "Acme Corp", "TechStart Inc"). Contacts associated with multiple clients show all client names. Contacts not associated with any client show an empty cell or placeholder.

#### Clicking a contact row navigates to PersonDetailPage
- **Initial state:** ContactsListPage is loaded with contacts.
- **Action:** User clicks on a contact row (e.g., the row for "Sarah Johnson" with individual id 5).
- **Expected:** The browser navigates to /individuals/5 and the PersonDetailPage is displayed showing the full details for that contact.

### CreateContactModal

#### Clicking Add Contact button opens CreateContactModal
- **Initial state:** ContactsListPage is loaded. An "Add Contact" button is visible in the top-right area of the page header.
- **Action:** User clicks the "Add Contact" button.
- **Expected:** A modal dialog opens with the title "Add Contact" (or "Create Contact"). The modal contains a form with fields for: Name (text input, required), Title (text input), Email (text input), Phone (text input), Location (text input), Client (searchable FilterSelect dropdown populated from clients API, optional). The modal has "Cancel" and "Create" (or "Save") buttons at the bottom.

#### CreateContactModal form validates required fields
- **Initial state:** CreateContactModal is open with all fields empty.
- **Action:** User clicks the "Create" submit button without filling in any fields.
- **Expected:** The form displays a validation error for the Name field indicating it is required. The contact is not created. The modal remains open.

#### CreateContactModal successfully creates a contact
- **Initial state:** CreateContactModal is open.
- **Action:** User fills in: Name = "Alex Turner", Title = "Director of Engineering", Email = "alex@techstart.com", Phone = "(555) 987-6543", Location = "Austin, TX", Client = "TechStart Inc" (selected from dropdown). User clicks the "Create" button.
- **Expected:** The contact is created via the API. The modal closes. The new contact appears in the contacts table with the name "Alex Turner", title "Director of Engineering", email "alex@techstart.com", phone "(555) 987-6543", location "Austin, TX", and associated client "TechStart Inc". A timeline entry is created on the associated client's timeline for the new contact being added. If any user is following the client "TechStart Inc", they receive a notification (if notification preferences allow).

#### CreateContactModal client dropdown is searchable FilterSelect
- **Initial state:** CreateContactModal is open.
- **Action:** User clicks the Client dropdown and types "Acme" into the search field.
- **Expected:** A searchable FilterSelect dropdown appears listing clients fetched from the clients API. The dropdown filters to show only clients whose names contain "Acme". The user can select a client from the filtered results. Selecting a client populates the Client field.

#### CreateContactModal cancel button closes modal without creating
- **Initial state:** CreateContactModal is open with some fields filled in.
- **Action:** User clicks the "Cancel" button.
- **Expected:** The modal closes. No contact is created. The contacts table remains unchanged.

#### CreateContactModal closes on overlay click
- **Initial state:** CreateContactModal is open.
- **Action:** User clicks the modal overlay (area outside the modal dialog).
- **Expected:** The modal closes. No contact is created.

### ContactsListContent

#### Page displays heading and Add Contact button
- **Initial state:** User navigates to /contacts.
- **Expected:** The page displays a heading "Contacts" at the top. An "Add Contact" button is displayed in the top-right corner of the page header. The sidebar "Contacts" link is highlighted as active.

#### Loading state shows while contacts are being fetched
- **Initial state:** User navigates to /contacts and the API request for contacts is in progress.
- **Expected:** A loading indicator (spinner or skeleton) is displayed in the contacts table area while data is being fetched. The search bar and page header are still visible.

#### Empty state shown when no contacts match search
- **Initial state:** ContactsListPage is loaded. User types "xyznonexistent" in the search input.
- **Expected:** The contacts table area displays an empty state message (e.g., "No contacts found" or "No matching contacts") instead of table rows. The search bar remains visible so the user can adjust the search term.

#### Empty state shown when no contacts exist
- **Initial state:** User navigates to /contacts and there are no contacts in the system.
- **Expected:** The contacts table area displays an empty state message (e.g., "No contacts yet") with a prompt or button to add the first contact. The "Add Contact" button remains visible in the header.

#### Pagination controls appear when contacts exceed page size
- **Initial state:** The system has more than 50 contacts.
- **Expected:** Pagination controls are displayed below the contacts table (e.g., "Previous" / "Next" buttons or page numbers). The current page number is indicated. The total number of contacts or pages is shown. Each page shows up to 50 contacts.

#### Clicking next page loads the next set of contacts
- **Initial state:** ContactsListPage is loaded with pagination controls visible. User is on page 1.
- **Action:** User clicks the "Next" page button.
- **Expected:** The contacts table updates to show the next page of contacts (contacts 51–100). The page indicator updates to show page 2. The "Previous" button becomes enabled. If there are no more pages, the "Next" button is disabled.

#### Clicking previous page loads the previous set of contacts
- **Initial state:** User is on page 2 of the contacts list.
- **Action:** User clicks the "Previous" page button.
- **Expected:** The contacts table updates to show the first page of contacts (contacts 1–50). The page indicator updates to show page 1. The "Previous" button becomes disabled (since it's the first page).

#### CSV export downloads contacts as CSV file
- **Initial state:** ContactsListPage is loaded with contacts.
- **Action:** User clicks the CSV export button (or selects export from a menu).
- **Expected:** A CSV file is downloaded containing the contact data. The CSV includes columns: Name, Title, Email, Phone, Location, Client Name. Each row corresponds to a contact in the system.

#### CSV import button opens import dialog
- **Initial state:** ContactsListPage is loaded.
- **Action:** User clicks the CSV import button (or selects import from a menu).
- **Expected:** An ImportDialog modal opens. The dialog displays a CSV column format specification table listing all supported columns (Name, Title, Email, Phone, Location, Client Name) with required/optional indicators and value descriptions. A "Download CSV template" button is available. A file upload area or file picker is present for selecting a CSV file.

#### CSV import processes valid file and creates contacts
- **Initial state:** The ImportDialog is open. User has a valid CSV file with contacts data matching the expected format.
- **Action:** User uploads the CSV file and confirms the import.
- **Expected:** The contacts from the CSV are created via the bulk import API. The dialog shows a success message with the count of contacts imported. After closing the dialog, the contacts table refreshes and the newly imported contacts appear in the list. Client names in the CSV are matched to existing clients in the system for association. Timeline entries are created on associated clients for newly added contacts.

#### CSV import shows validation errors for invalid data
- **Initial state:** The ImportDialog is open. User has a CSV file with invalid data (e.g., missing required Name column, malformed email).
- **Action:** User uploads the invalid CSV file and confirms the import.
- **Expected:** The dialog displays per-row validation errors indicating which rows failed and why (e.g., "Row 3: Name is required"). Valid rows may still be imported, or the user may be asked to fix errors and retry. The error messages are specific enough for the user to correct the CSV.

## SettingsPage (/settings)

Components: EmailNotificationsSection, ImportExportSection, WebhooksSection, AddEditWebhookModal

### EmailNotificationsSection

#### Email Notifications section visible only when authenticated
- **Initial state:** User is not authenticated (no active session).
- **Action:** User navigates to /settings.
- **Expected:** The Settings page loads. The Email Notifications section is not visible. The Import & Export and Webhooks sections are still displayed.

#### Email Notifications section visible when authenticated
- **Initial state:** User is authenticated with an active session.
- **Action:** User navigates to /settings.
- **Expected:** The Email Notifications section is visible with a heading (e.g., "Email Notifications"). It displays seven notification preference toggles, all enabled by default.

#### Seven notification preference toggles displayed
- **Initial state:** Authenticated user navigates to /settings. No prior preference changes have been made.
- **Expected:** The Email Notifications section displays exactly seven toggle switches with labels: "Client Updated", "Deal Created", "Deal Stage Changed", "Task Created", "Task Completed", "Contact Added", and "Note Added". All seven toggles are in the enabled (on) state by default.

#### Toggling Client Updated preference off persists the change
- **Initial state:** Authenticated user is on /settings. The "Client Updated" toggle is enabled.
- **Action:** User clicks the "Client Updated" toggle to disable it.
- **Expected:** The toggle switches to the disabled (off) state. The preference is saved via the PUT /.netlify/functions/notification-preferences API. Refreshing the page shows the toggle still in the disabled state.

#### Toggling Deal Created preference off persists the change
- **Initial state:** Authenticated user is on /settings. The "Deal Created" toggle is enabled.
- **Action:** User clicks the "Deal Created" toggle to disable it.
- **Expected:** The toggle switches to the disabled (off) state. The preference is saved via the API. Refreshing the page shows the toggle still in the disabled state.

#### Toggling Deal Stage Changed preference off persists the change
- **Initial state:** Authenticated user is on /settings. The "Deal Stage Changed" toggle is enabled.
- **Action:** User clicks the "Deal Stage Changed" toggle to disable it.
- **Expected:** The toggle switches to the disabled (off) state. The preference is saved via the API. Refreshing the page shows the toggle still in the disabled state.

#### Toggling Task Created preference off persists the change
- **Initial state:** Authenticated user is on /settings. The "Task Created" toggle is enabled.
- **Action:** User clicks the "Task Created" toggle to disable it.
- **Expected:** The toggle switches to the disabled (off) state. The preference is saved via the API. Refreshing the page shows the toggle still in the disabled state.

#### Toggling Task Completed preference off persists the change
- **Initial state:** Authenticated user is on /settings. The "Task Completed" toggle is enabled.
- **Action:** User clicks the "Task Completed" toggle to disable it.
- **Expected:** The toggle switches to the disabled (off) state. The preference is saved via the API. Refreshing the page shows the toggle still in the disabled state.

#### Toggling Contact Added preference off persists the change
- **Initial state:** Authenticated user is on /settings. The "Contact Added" toggle is enabled.
- **Action:** User clicks the "Contact Added" toggle to disable it.
- **Expected:** The toggle switches to the disabled (off) state. The preference is saved via the API. Refreshing the page shows the toggle still in the disabled state.

#### Toggling Note Added preference off persists the change
- **Initial state:** Authenticated user is on /settings. The "Note Added" toggle is enabled.
- **Action:** User clicks the "Note Added" toggle to disable it.
- **Expected:** The toggle switches to the disabled (off) state. The preference is saved via the API. Refreshing the page shows the toggle still in the disabled state.

#### Toggling a preference back on persists the change
- **Initial state:** Authenticated user is on /settings. The "Client Updated" toggle has been previously disabled.
- **Action:** User clicks the "Client Updated" toggle to enable it.
- **Expected:** The toggle switches to the enabled (on) state. The preference is saved via the API. Refreshing the page shows the toggle still in the enabled state.

#### Multiple preferences can be toggled independently
- **Initial state:** Authenticated user is on /settings. All toggles are enabled.
- **Action:** User disables "Deal Created" and "Task Completed" toggles while leaving the other five enabled.
- **Expected:** Only the "Deal Created" and "Task Completed" toggles are in the disabled state. The other five toggles remain enabled. All changes are persisted via the API. Refreshing the page shows the correct state for each toggle.

### ImportExportSection

#### Import & Export section displays heading and all buttons
- **Initial state:** User navigates to /settings.
- **Expected:** The Import & Export section is visible with a heading (e.g., "Import & Export"). The section displays import buttons for four entity types: "Import Clients", "Import Deals", "Import Tasks", and "Import Contacts". The section also displays export buttons for three entity types: "Export Clients", "Export Deals", and "Export Tasks".

#### Import Clients button opens ImportDialog for clients
- **Initial state:** User is on /settings. The Import & Export section is visible.
- **Action:** User clicks the "Import Clients" button.
- **Expected:** An ImportDialog modal opens with the title indicating clients import. The dialog displays a CSV column format specification table listing all supported columns (Name, Type, Status, Tags, Source Type, Source Detail, Campaign, Channel, Date Acquired) with required/optional indicators and value descriptions. A "Download CSV template" button is available. A file upload area or file picker is present for selecting a CSV file.

#### Import Deals button opens ImportDialog for deals
- **Initial state:** User is on /settings. The Import & Export section is visible.
- **Action:** User clicks the "Import Deals" button.
- **Expected:** An ImportDialog modal opens with the title indicating deals import. The dialog displays a CSV column format specification table listing all supported columns (Name, Client Name, Value, Stage, Owner, Probability, Expected Close Date, Status) with required/optional indicators and value descriptions. A "Download CSV template" button is available. A file upload area or file picker is present for selecting a CSV file.

#### Import Tasks button opens ImportDialog for tasks
- **Initial state:** User is on /settings. The Import & Export section is visible.
- **Action:** User clicks the "Import Tasks" button.
- **Expected:** An ImportDialog modal opens with the title indicating tasks import. The dialog displays a CSV column format specification table listing all supported columns (Title, Description, Due Date, Priority, Client Name, Assignee) with required/optional indicators and value descriptions. A "Download CSV template" button is available. A file upload area or file picker is present for selecting a CSV file.

#### Import Contacts button opens ImportDialog for contacts
- **Initial state:** User is on /settings. The Import & Export section is visible.
- **Action:** User clicks the "Import Contacts" button.
- **Expected:** An ImportDialog modal opens with the title indicating contacts import. The dialog displays a CSV column format specification table listing all supported columns (Name, Title, Email, Phone, Location, Client Name) with required/optional indicators and value descriptions. A "Download CSV template" button is available. A file upload area or file picker is present for selecting a CSV file.

#### Export Clients button downloads clients CSV
- **Initial state:** User is on /settings. The Import & Export section is visible.
- **Action:** User clicks the "Export Clients" button.
- **Expected:** A CSV file is downloaded containing the client data. The CSV includes columns: Name, Type, Status, Tags, Source Type, Source Detail, Campaign, Channel, Date Acquired. Each row corresponds to a client in the system.

#### Export Deals button downloads deals CSV
- **Initial state:** User is on /settings. The Import & Export section is visible.
- **Action:** User clicks the "Export Deals" button.
- **Expected:** A CSV file is downloaded containing the deal data. The CSV includes columns: Name, Client Name, Value, Stage, Owner, Probability, Expected Close Date, Status. Each row corresponds to a deal in the system.

#### Export Tasks button downloads tasks CSV
- **Initial state:** User is on /settings. The Import & Export section is visible.
- **Action:** User clicks the "Export Tasks" button.
- **Expected:** A CSV file is downloaded containing the task data. The CSV includes columns: Title, Description, Due Date, Priority, Client Name, Assignee. Each row corresponds to a task in the system.

#### Import dialog CSV import processes valid file and creates entities
- **Initial state:** The ImportDialog for clients is open. User has a valid CSV file with client data matching the expected format.
- **Action:** User uploads the CSV file and confirms the import.
- **Expected:** The clients from the CSV are created via the bulk import API. The dialog shows a success message with the count of clients imported. After closing the dialog, navigating to /clients shows the newly imported clients.

#### Import dialog CSV import shows validation errors for invalid data
- **Initial state:** The ImportDialog for clients is open. User has a CSV file with invalid data (e.g., missing required Name column, invalid status value).
- **Action:** User uploads the invalid CSV file and confirms the import.
- **Expected:** The dialog displays per-row validation errors indicating which rows failed and why (e.g., "Row 3: Name is required", "Row 5: Invalid status 'Unknown'"). The error messages are specific enough for the user to correct the CSV.

#### Import dialog Download CSV template button generates template
- **Initial state:** The ImportDialog for any entity type is open.
- **Action:** User clicks the "Download CSV template" button.
- **Expected:** A CSV template file is downloaded containing the correct column headers for the entity type, with no data rows. The template can be used as a starting point for populating import data.

#### Import dialog cancel button closes without importing
- **Initial state:** The ImportDialog is open with a file selected.
- **Action:** User clicks the "Cancel" button.
- **Expected:** The dialog closes. No data is imported. The system state remains unchanged.

### WebhooksSection

#### Webhooks section displays heading and Add Webhook button
- **Initial state:** User navigates to /settings.
- **Expected:** The Webhooks section is visible with a heading (e.g., "Webhooks"). An "Add Webhook" button is displayed. If no webhooks exist, an empty state message is shown (e.g., "No webhooks configured").

#### Add Webhook button opens AddEditWebhookModal
- **Initial state:** User is on /settings. The Webhooks section is visible.
- **Action:** User clicks the "Add Webhook" button.
- **Expected:** The AddEditWebhookModal opens with empty form fields and the title "Add Webhook" (or "Create Webhook"). The modal contains fields for Name, URL, platform selection, and event checkboxes.

#### Webhook list displays configured webhooks
- **Initial state:** User is on /settings. One or more webhooks have been configured (e.g., "Zapier Integration" pointing to https://hooks.zapier.com/...).
- **Expected:** The Webhooks section displays a list of configured webhooks. Each webhook entry shows the webhook name (e.g., "Zapier Integration"), the URL (or a truncated version), an enable/disable toggle, an edit button, and a delete button.

#### Clicking edit on a webhook opens AddEditWebhookModal in edit mode
- **Initial state:** User is on /settings. A webhook named "Zapier Integration" exists in the list.
- **Action:** User clicks the edit button on the "Zapier Integration" webhook entry.
- **Expected:** The AddEditWebhookModal opens with all fields pre-populated with the existing webhook data: Name = "Zapier Integration", URL = the configured URL, platform selection matching the URL pattern, and the previously selected event checkboxes checked.

#### Enable/disable toggle changes webhook active state
- **Initial state:** User is on /settings. A webhook named "Zapier Integration" exists with the toggle in the enabled (active) state.
- **Action:** User clicks the enable/disable toggle on the "Zapier Integration" webhook entry.
- **Expected:** The toggle switches to the disabled state. The webhook is updated via the API to be inactive. Disabled webhooks will not fire when events occur. The toggle visually reflects the disabled state. Clicking the toggle again re-enables the webhook.

#### Delete webhook button shows confirmation dialog
- **Initial state:** User is on /settings. A webhook named "Zapier Integration" exists in the list.
- **Action:** User clicks the delete button on the "Zapier Integration" webhook entry.
- **Expected:** A confirmation dialog appears asking the user to confirm deletion (e.g., "Are you sure you want to delete this webhook?"). The dialog has "Cancel" and "Delete" (or "Confirm") buttons.

#### Confirming webhook deletion removes the webhook
- **Initial state:** The delete confirmation dialog is open for the "Zapier Integration" webhook.
- **Action:** User clicks the "Delete" (or "Confirm") button.
- **Expected:** The webhook is deleted via the API. The webhook entry is removed from the list. If no webhooks remain, the empty state message is shown.

#### Canceling webhook deletion keeps the webhook
- **Initial state:** The delete confirmation dialog is open for the "Zapier Integration" webhook.
- **Action:** User clicks the "Cancel" button.
- **Expected:** The dialog closes. The webhook remains in the list unchanged.

#### Webhook list shows event types for each webhook
- **Initial state:** User is on /settings. A webhook exists configured to fire on "New Client Created" and "Deal Stage Changed" events.
- **Expected:** The webhook entry displays the subscribed event types (e.g., as badges or a comma-separated list showing "New Client Created", "Deal Stage Changed") so the user can see at a glance what events trigger each webhook.

### AddEditWebhookModal

#### Modal displays name, URL, platform, and event fields
- **Initial state:** The AddEditWebhookModal is open (via clicking "Add Webhook").
- **Expected:** The modal contains: a Name text input field, a platform selection control with options for Zapier, n8n, and Custom, a URL text input field, and a set of event checkboxes for subscribing to events (e.g., "New Client Created", "Deal Stage Changed", "Task Completed", etc.). The modal has "Cancel" and "Save" (or "Create") buttons at the bottom.

#### Platform selection shows Zapier setup guide
- **Initial state:** The AddEditWebhookModal is open.
- **Action:** User selects "Zapier" as the platform.
- **Expected:** A platform-specific setup guide is displayed with step-by-step instructions for obtaining the Zapier webhook URL. The guide explains where to find the webhook URL in Zapier (e.g., "Create a new Zap, add 'Webhooks by Zapier' as the trigger, select 'Catch Hook', and copy the webhook URL"). A URL format hint is shown (e.g., "https://hooks.zapier.com/hooks/catch/..."). A platform-specific tip is displayed explaining that Zapier needs the first event sent to detect the payload schema. The URL input placeholder updates to reflect the Zapier URL format.

#### Platform selection shows n8n setup guide
- **Initial state:** The AddEditWebhookModal is open.
- **Action:** User selects "n8n" as the platform.
- **Expected:** A platform-specific setup guide is displayed with step-by-step instructions for obtaining the n8n webhook URL. The guide explains where to find the webhook URL in n8n (e.g., "Add a Webhook node to your workflow, copy the webhook URL from the node settings"). A URL format hint is shown (e.g., "https://your-n8n-instance.com/webhook/..."). A platform-specific tip is displayed explaining that n8n has separate test and production URLs and to use the production URL. The URL input placeholder updates to reflect the n8n URL format.

#### Platform selection shows Custom endpoint setup guide
- **Initial state:** The AddEditWebhookModal is open.
- **Action:** User selects "Custom" as the platform.
- **Expected:** A setup guide is displayed with instructions for configuring a custom webhook endpoint. The guide explains that the endpoint must accept POST requests with a JSON payload. A URL format hint is shown (e.g., "https://your-server.com/webhook"). The URL input placeholder updates to a generic webhook URL format.

#### Payload format preview is toggleable
- **Initial state:** The AddEditWebhookModal is open with a platform selected.
- **Action:** User clicks a toggle or expandable section to show the payload format preview.
- **Expected:** A section expands or appears showing the JSON structure that webhook events will send. The preview displays example JSON with fields like event type, timestamp, and entity data. The user can toggle this section closed again to hide the preview.

#### Event checkboxes allow selecting multiple events
- **Initial state:** The AddEditWebhookModal is open. No events are selected.
- **Action:** User checks the "New Client Created" and "Deal Stage Changed" event checkboxes.
- **Expected:** Both checkboxes are visually checked. The user can check or uncheck any combination of event types independently. At least one event must be selected to save the webhook.

#### Modal validates required fields
- **Initial state:** The AddEditWebhookModal is open with all fields empty.
- **Action:** User clicks the "Save" button without filling in any fields.
- **Expected:** Validation errors are displayed for required fields: Name is required, URL is required, and at least one event must be selected. The webhook is not created. The modal remains open.

#### Modal validates URL format
- **Initial state:** The AddEditWebhookModal is open. User has entered a name and selected events.
- **Action:** User enters "not-a-valid-url" in the URL field and clicks "Save".
- **Expected:** A validation error is displayed indicating the URL is not valid (e.g., "Please enter a valid URL"). The webhook is not created. The modal remains open.

#### Successfully creating a webhook adds it to the list
- **Initial state:** The AddEditWebhookModal is open.
- **Action:** User fills in Name = "My Zapier Hook", selects platform = "Zapier", enters URL = "https://hooks.zapier.com/hooks/catch/123/abc", checks "New Client Created" and "Task Completed" events, and clicks "Save".
- **Expected:** The webhook is created via the CRUD API. The modal closes. The new webhook "My Zapier Hook" appears in the webhooks list with the URL displayed, an enabled toggle, and the selected event types shown.

#### Successfully editing a webhook updates the list
- **Initial state:** The AddEditWebhookModal is open in edit mode for a webhook named "My Zapier Hook" subscribed to "New Client Created" and "Task Completed".
- **Action:** User changes the name to "Updated Zapier Hook" and additionally checks the "Deal Stage Changed" event. User clicks "Save".
- **Expected:** The webhook is updated via the API. The modal closes. The webhook list shows the updated name "Updated Zapier Hook" and now displays three subscribed events: "New Client Created", "Task Completed", and "Deal Stage Changed".

#### Cancel button closes modal without saving
- **Initial state:** The AddEditWebhookModal is open with some fields filled in.
- **Action:** User clicks the "Cancel" button.
- **Expected:** The modal closes. No webhook is created or updated. The webhooks list remains unchanged.

#### Modal closes on overlay click without saving
- **Initial state:** The AddEditWebhookModal is open.
- **Action:** User clicks the modal overlay (area outside the modal dialog).
- **Expected:** The modal closes. No webhook is created or updated.

#### URL placeholder updates based on selected platform
- **Initial state:** The AddEditWebhookModal is open with no platform selected.
- **Action:** User selects "Zapier", then "n8n", then "Custom" as the platform.
- **Expected:** When "Zapier" is selected, the URL input placeholder shows a Zapier-style URL hint (e.g., "https://hooks.zapier.com/hooks/catch/..."). When "n8n" is selected, the placeholder changes to an n8n-style URL hint (e.g., "https://your-n8n-instance.com/webhook/..."). When "Custom" is selected, the placeholder changes to a generic URL hint (e.g., "https://your-server.com/webhook").

## UsersListPage - Team (/users)

Components: UsersGrid, UserCard

### UsersGrid

#### Page displays heading "Team"
- **Initial state:** User navigates to /users.
- **Expected:** The page displays a heading "Team" at the top. The sidebar "Team" link is highlighted as active.

#### User cards displayed in responsive grid layout
- **Initial state:** UsersListPage is loaded with multiple team members (e.g., 9 seeded users).
- **Expected:** User cards are displayed in a responsive grid layout (single column on small screens, two columns on medium screens, three columns on larger screens). Each card represents one team member. All team members in the system are shown.

#### Loading state shows while users are being fetched
- **Initial state:** User navigates to /users and the API request for users is in progress.
- **Expected:** A loading indicator (spinner or skeleton) is displayed in the grid area while data is being fetched. The page heading "Team" is still visible.

#### Empty state shown when no team members exist
- **Initial state:** User navigates to /users and there are no team members in the system.
- **Expected:** The grid area displays an empty state message (e.g., "No team members found" or "Users appear here after signing up") instead of user cards. The page heading "Team" is still visible.

### UserCard

#### User card displays avatar image
- **Initial state:** UsersListPage is loaded with team members that have avatar images.
- **Expected:** Each user card displays the user's circular avatar image. Users without an avatar image display a fallback with their first initial on an accent-colored circular background.

#### User card displays user name
- **Initial state:** UsersListPage is loaded with team members.
- **Expected:** Each user card displays the user's full name as the primary identifier text (e.g., "Sarah Johnson", "David Lee"). The name is prominent and clearly readable.

#### User card displays user email
- **Initial state:** UsersListPage is loaded with team members that have email addresses.
- **Expected:** Each user card displays the user's email address with a mail icon to its left (e.g., "sarah@example.com"). Long email addresses are truncated with ellipsis.

#### User card displays active deals count
- **Initial state:** UsersListPage is loaded with team members who have active deals.
- **Expected:** Each user card displays the number of active deals with a briefcase icon (e.g., "2 active deals", "1 active deal"). The count reflects the current number of deals in active stages owned by that user.

#### User card displays open tasks count
- **Initial state:** UsersListPage is loaded with team members who have open tasks.
- **Expected:** Each user card displays the number of open tasks with a check-square icon (e.g., "3 open tasks", "1 open task"). The count reflects the current number of tasks in open status assigned to that user.

#### Clicking a user card navigates to /users/:userId
- **Initial state:** UsersListPage is loaded with team members.
- **Action:** User clicks on a user card (e.g., the card for "Sarah Johnson" with user id 1).
- **Expected:** The browser navigates to /users/1 and the UserDetailPage is displayed showing the full details for that user.

## UserDetailPage (/users/:userId)

Components: UserDetailHeader, UserDetailStats, UserDealsList, UserTasksList, UserActivityFeed

### UserDetailHeader

#### Header displays user name prominently
- **Initial state:** User navigates to /users/:userId for a team member named "Sarah Johnson".
- **Expected:** The page header displays the user name "Sarah Johnson" as the primary heading text. A back navigation element (arrow or "Back to Team" link) is visible to return to the team list.

#### Header displays user avatar or initials
- **Initial state:** UserDetailPage is loaded for a team member with an avatar URL.
- **Expected:** The header displays the user's circular avatar image. If the user has no avatar URL, a fallback with the user's initials is displayed on an accent-colored circular background (e.g., "SJ" for "Sarah Johnson").

#### Header displays user email
- **Initial state:** UserDetailPage is loaded for a team member with email "sarah@example.com".
- **Expected:** The header displays the user's email address "sarah@example.com" with a mail icon to its left. The email is displayed below or near the user's name.

#### Header displays join date
- **Initial state:** UserDetailPage is loaded for a team member who joined on Jan 15, 2024.
- **Expected:** The header displays the join date in a readable format (e.g., "Joined Jan 15, 2024") with a calendar icon to its left.

#### Back button navigates to team list
- **Initial state:** UserDetailPage is loaded for any team member.
- **Action:** User clicks the back navigation element (back arrow or "Back to Team" link).
- **Expected:** The browser navigates to /users and the UsersListPage is displayed.

#### Loading state shows while user data is being fetched
- **Initial state:** User navigates to /users/:userId and the API request for user data is in progress.
- **Expected:** A loading indicator (spinner or skeleton) is displayed while data is being fetched.

### UserDetailStats

#### Stats section displays active deals count
- **Initial state:** UserDetailPage is loaded for a team member who owns 3 active deals.
- **Expected:** The stats section displays an "Active Deals" stat showing the number 3 with a label "Active Deals" and a briefcase icon.

#### Stats section displays open tasks count
- **Initial state:** UserDetailPage is loaded for a team member who has 5 open tasks.
- **Expected:** The stats section displays an "Open Tasks" stat showing the number 5 with a label "Open Tasks" and a check-square icon.

#### Stats section displays total deals count
- **Initial state:** UserDetailPage is loaded for a team member who owns 8 total deals (including closed).
- **Expected:** The stats section displays a "Total Deals" stat showing the number 8 with a label "Total Deals" and a bar-chart icon.

### UserDealsList

#### Owned deals section displays heading
- **Initial state:** UserDetailPage is loaded for a team member who owns deals.
- **Expected:** The deals section displays a heading (e.g., "Owned Deals"). The section lists deals owned by this user.

#### Owned deals list displays deal name, client, value, and stage
- **Initial state:** UserDetailPage is loaded for a team member who owns a deal "Enterprise License Renewal" for client "Acme Corp" valued at $50,000 in "Proposal" stage.
- **Expected:** The deals list shows a row/card with the deal name "Enterprise License Renewal", the client name "Acme Corp", the value "$50,000", and the stage "Proposal" displayed as a badge. Each deal entry is visible with all four data fields.

#### Clicking a deal navigates to deal detail page
- **Initial state:** UserDetailPage is loaded with owned deals visible.
- **Action:** User clicks on a deal entry (e.g., "Enterprise License Renewal").
- **Expected:** The browser navigates to /deals/:dealId and the DealDetailPage is displayed showing the full details for that deal.

#### Empty state when user owns no deals
- **Initial state:** UserDetailPage is loaded for a team member who owns no deals.
- **Expected:** The deals section displays an empty state message (e.g., "No deals owned" or "No owned deals yet") instead of deal entries.

### UserTasksList

#### Assigned tasks section displays heading
- **Initial state:** UserDetailPage is loaded for a team member who has assigned tasks.
- **Expected:** The tasks section displays a heading (e.g., "Assigned Tasks"). The section lists tasks assigned to this user.

#### Assigned tasks list displays task title, priority, status, and due date
- **Initial state:** UserDetailPage is loaded for a team member who has a task "Finalize Q3 Marketing Plan" with High priority, Open status, and due date of Oct 25.
- **Expected:** The tasks list shows a row/card with the task title "Finalize Q3 Marketing Plan", a priority badge showing "High" with a red/coral color, status "Open", and the formatted due date. Each task entry is visible with all data fields.

#### Clicking a task navigates to task detail page
- **Initial state:** UserDetailPage is loaded with assigned tasks visible.
- **Action:** User clicks on a task entry (e.g., "Finalize Q3 Marketing Plan").
- **Expected:** The browser navigates to /tasks/:taskId and the TaskDetailPage is displayed showing the full details for that task.

#### Empty state when user has no assigned tasks
- **Initial state:** UserDetailPage is loaded for a team member who has no assigned tasks.
- **Expected:** The tasks section displays an empty state message (e.g., "No tasks assigned" or "No assigned tasks yet") instead of task entries.

### UserActivityFeed

#### Activity feed section displays heading
- **Initial state:** UserDetailPage is loaded for a team member who has recent activity.
- **Expected:** The activity feed section displays a heading (e.g., "Recent Activity"). The section shows timeline events where this user was the actor.

#### Activity feed displays event description and timestamp
- **Initial state:** UserDetailPage is loaded for a team member with recent activity events (e.g., "Deal created: Enterprise License" at "Feb 20, 2024, 3:00 PM").
- **Expected:** Each activity entry displays the event description text and a formatted timestamp showing when the event occurred. Events are listed in reverse chronological order (most recent first).

#### Activity feed displays event type icon
- **Initial state:** UserDetailPage is loaded for a team member with activity events of different types (deal created, task completed, contact added, etc.).
- **Expected:** Each activity entry displays an icon corresponding to the event type (e.g., briefcase icon for deal events, check icon for task events, user icon for contact events). The icons help visually distinguish event types.

#### Empty state when user has no activity
- **Initial state:** UserDetailPage is loaded for a team member who has no recent activity events.
- **Expected:** The activity feed section displays an empty state message (e.g., "No recent activity") instead of activity entries.

## ForgotPasswordPage (/auth/forgot-password)

Components: ForgotPasswordPage

### ForgotPasswordPage

#### Forgot password form displays email input and submit button
- **Initial state:** User navigates to /auth/forgot-password.
- **Expected:** The page displays a heading "Forgot Password", an email input field with placeholder "Enter your email", and a "Send Reset Link" submit button.

#### Submitting email shows success message
- **Initial state:** The forgot password form is displayed with the email input and submit button visible.
- **Action:** User enters a valid email address into the email input and clicks the "Send Reset Link" button.
- **Expected:** After submission, the form is replaced by a success message: "If an account exists with that email, a password reset link has been sent." The email input and submit button are no longer visible.

#### Submit button shows loading state during submission
- **Initial state:** The forgot password form is displayed.
- **Action:** User enters an email and clicks the "Send Reset Link" button.
- **Expected:** While the request is in progress, the submit button text changes to "Sending..." and the button is disabled to prevent duplicate submissions.

#### Error message displayed on server error
- **Initial state:** The forgot password form is displayed.
- **Action:** User enters an email and clicks "Send Reset Link", but the server returns an error response.
- **Expected:** An error message is displayed below the email input (e.g., "Failed to send reset email"). The form remains visible so the user can retry. The error message disappears when the user submits again.

#### Error message displayed on network failure
- **Initial state:** The forgot password form is displayed.
- **Action:** User enters an email and clicks "Send Reset Link", but a network error occurs.
- **Expected:** An error message "Network error" is displayed below the email input. The form remains visible so the user can retry.

## ResetPasswordPage (/auth/reset-password)

Components: ResetPasswordPage

### ResetPasswordPage

#### Reset password form displays password input, confirm password input, and submit button
- **Initial state:** User navigates to /auth/reset-password?token=sometoken.
- **Expected:** The page displays a heading "Reset Password", a password input field with placeholder "New password", a confirm password input field with placeholder "Confirm password", and a "Reset Password" submit button.

#### Submitting mismatched passwords shows validation error
- **Initial state:** The reset password form is displayed with both password inputs visible.
- **Action:** User enters "password123" in the password input and "password456" in the confirm password input, then clicks "Reset Password".
- **Expected:** An error message "Passwords do not match" is displayed below the inputs. The form remains visible and the password is not reset.

#### Successful password reset navigates to /clients
- **Initial state:** The reset password form is displayed.
- **Action:** User enters "newpassword123" in both the password input and confirm password input, then clicks "Reset Password".
- **Expected:** The form submits the new password to the backend. On success, the browser navigates to /clients, displaying the ClientsListPage.

#### Submit button shows loading state during submission
- **Initial state:** The reset password form is displayed.
- **Action:** User enters matching passwords and clicks "Reset Password".
- **Expected:** While the request is in progress, the submit button text changes to "Resetting..." and the button is disabled to prevent duplicate submissions.

#### Error message displayed on server error
- **Initial state:** The reset password form is displayed.
- **Action:** User enters matching passwords and clicks "Reset Password", but the server returns an error response (e.g., invalid or expired token).
- **Expected:** An error message is displayed below the inputs (e.g., "Invalid or expired token"). The form remains visible so the user can retry.

#### Error message displayed on network failure
- **Initial state:** The reset password form is displayed.
- **Action:** User enters matching passwords and clicks "Reset Password", but a network error occurs.
- **Expected:** An error message "Network error" is displayed below the inputs. The form remains visible so the user can retry.

## ConfirmEmailPage (/auth/confirm-email)

Components: ConfirmEmailPage

### ConfirmEmailPage

#### Loading state displayed while confirming email with token
- **Initial state:** User navigates to /auth/confirm-email?token=somevalidtoken. The API request to confirm the email is in progress.
- **Expected:** The page displays a loading message "Confirming your email..." in muted text while the confirmation request is being processed.

#### Successful confirmation shows success message and redirects to /clients
- **Initial state:** User navigates to /auth/confirm-email?token=somevalidtoken.
- **Expected:** After the API returns a successful response, the loading message is replaced by a success message "Email confirmed! Redirecting..." in primary text. After a brief delay (approximately 2 seconds), the browser automatically navigates to /clients, displaying the ClientsListPage.

#### Missing token shows error message
- **Initial state:** User navigates to /auth/confirm-email without a token query parameter (no ?token=...).
- **Expected:** The page immediately displays an error message "No confirmation token provided" in red text. No API request is made. The page does not redirect.

#### Invalid or expired token shows error message
- **Initial state:** User navigates to /auth/confirm-email?token=invalidtoken where the token does not exist, has already been used, or has expired.
- **Expected:** After the API returns an error response, the page displays an error message "Invalid or expired token" in red text. The page does not redirect.

#### Network error shows error message
- **Initial state:** User navigates to /auth/confirm-email?token=sometoken but a network error occurs during the API request.
- **Expected:** The page displays an error message "Network error" in red text. The page does not redirect.

#### Auto-login after successful confirmation stores auth token
- **Initial state:** User navigates to /auth/confirm-email?token=somevalidtoken and the API returns a successful response that includes an auth token.
- **Expected:** The auth token from the response is stored in localStorage. The user is automatically logged in — after redirecting to /clients, the sidebar user area shows the user's avatar, display name, and sign-out button instead of the "Sign In" button.
