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

#### ClientHeader

**Client name is displayed prominently**
Given the user navigates to /clients/:clientId for a client named "Acme Corp", the page displays "Acme Corp" as a large heading at the top of the content area.

**Type badge displays "Organization" for organization clients**
Given the user is viewing an organization client (e.g., "Acme Corp"), a badge labeled "Organization" is displayed next to the client name in the header.

**Type badge displays "Individual" for individual clients**
Given the user is viewing an individual client (e.g., "Jane Doe"), a badge labeled "Individual" is displayed next to the client name in the header.

**Status badge displays "Active" in green**
Given the user is viewing a client with status "Active", the header displays an "Active" badge with green styling next to the type badge.

**Status badge displays "Inactive" in gray**
Given the user is viewing a client with status "Inactive", the header displays an "Inactive" badge with gray styling.

**Status badge displays "Prospect" in yellow/amber**
Given the user is viewing a client with status "Prospect", the header displays a "Prospect" badge with yellow/amber styling.

**Status badge displays "Churned" in red**
Given the user is viewing a client with status "Churned", the header displays a "Churned" badge with red/orange styling.

**Tags are displayed as badges below the client name**
Given the user is viewing a client with tags "Enterprise", "Software", and "High Priority", each tag is rendered as a separate badge below the client name row. A client with no tags shows no tag badges.

**Edit pencil icon is visible in the header**
Given the user is viewing a client detail page, a pencil/edit icon is displayed in the header area (near the tags), allowing the user to edit client information.

**Clicking edit pencil opens edit mode for client details**
Given the user is on a client detail page, when they click the edit pencil icon, an edit modal or inline edit mode opens allowing changes to the client's name, type, status, and tags.

**Saving edited client details persists changes**
Given the edit mode is open and the user changes the client name from "Acme Corp" to "Acme Corporation", updates the status from "Active" to "Prospect", and adds a new tag "VIP", when they save, the header updates to reflect the new name "Acme Corporation", the status badge changes to "Prospect" with yellow/amber styling, and the "VIP" tag badge appears. The changes are persisted to the database.

**Editing client details creates a timeline entry**
Given the user edits client details (e.g., changes the status from "Active" to "Inactive") and saves, a new timeline entry is created recording the change (e.g., "Client Updated" with details of what changed), attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created per save action.

**Edit cancel discards unsaved changes**
Given the edit mode is open and the user has modified some fields, when they click cancel or close the edit mode, the changes are discarded and the header reverts to the previous values.

#### FollowButton

**FollowButton displays "Follow" when user is not following the client**
Given the user is authenticated and is not currently following this client, the FollowButton in the header area displays "Follow" (or an unfilled star/heart icon) indicating the client is not followed.

**Clicking FollowButton toggles to "Following" state**
Given the user is authenticated and not following the client, when they click the FollowButton, it toggles to a "Following" state (filled icon or "Following" text), and the follow relationship is persisted in the database. The user will now receive email notifications for changes on this client.

**Clicking FollowButton again unfollows the client**
Given the user is authenticated and currently following the client (FollowButton shows "Following"), when they click the FollowButton, it toggles back to "Follow" (unfollowed state), the follow relationship is removed from the database, and the user will no longer receive email notifications for this client.

**FollowButton is hidden or disabled when not authenticated**
Given the user is not logged in, the FollowButton is either not displayed or is disabled with a tooltip indicating sign-in is required.

#### QuickActions

**Add Task button is visible with icon and label**
Given the user is on a client detail page, the quick actions area (top right of the page) displays an "Add Task" button with a list/task icon and the text "Add Task".

**Add Deal button is visible with icon and label**
Given the user is on a client detail page, the quick actions area displays an "Add Deal" button with a clock/deal icon and the text "Add Deal".

**Add Attachment button is visible with icon and label**
Given the user is on a client detail page, the quick actions area displays an "Add Attachment" button with a paperclip/attachment icon and the text "Add Attachment".

**Add Person button is visible with icon and label**
Given the user is on a client detail page, the quick actions area displays an "Add Person" button with a person icon and the text "Add Person".

**Add Task button opens AddTaskModal**
Given the user is on a client detail page, when they click the "Add Task" button, the AddTaskModal dialog opens.

**Add Deal button opens AddDealModal**
Given the user is on a client detail page, when they click the "Add Deal" button, the AddDealModal dialog opens.

**Add Attachment button opens AddAttachmentModal**
Given the user is on a client detail page, when they click the "Add Attachment" button, the AddAttachmentModal dialog opens.

**Add Person button opens AddPersonModal**
Given the user is on a client detail page, when they click the "Add Person" button, the AddPersonModal dialog opens.

#### SourceInfoSection

**Section displays "Source Info" title**
Given the user is on a client detail page, the Source Info section displays the heading "Source Info".

**Acquisition Source field displays source type and detail**
Given the user is viewing a client whose acquisition source is "Referral (John Smith)", the Source Info section displays a field labeled "Acquisition Source" with value "Referral (John Smith)".

**Campaign field displays campaign name or "None"**
Given the user is viewing a client with campaign set to "None", the Source Info section displays a "Campaign" field with the value "None". If the client has a campaign (e.g., "Q3 Outreach"), that value is shown instead.

**Channel field displays channel name**
Given the user is viewing a client with channel "Direct Sales", the Source Info section displays a "Channel" field with the value "Direct Sales".

**Date Acquired field displays the acquisition date**
Given the user is viewing a client acquired on "2023-01-15", the Source Info section displays a "Date Acquired" field with the value "2023-01-15".

**Edit button is visible in Source Info section**
Given the user is on a client detail page, the Source Info section displays an "Edit" button (pencil icon with "Edit" text) in the top-right corner of the section.

**Clicking Edit opens edit mode for source info fields**
Given the user is on a client detail page, when they click the "Edit" button in the Source Info section, the section switches to an editable mode (inline editing or a modal) where the user can modify Acquisition Source, Campaign, Channel, and Date Acquired fields.

**Saving edited source info persists changes**
Given the source info edit mode is active and the user changes the Campaign from "None" to "Q4 Campaign" and the Channel from "Direct Sales" to "Partner Referral", when they save, the Source Info section updates to reflect the new values and the changes are persisted to the database.

**Editing source info creates a timeline entry**
Given the user edits source info and saves, a timeline entry is created recording that the client's source info was updated, attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created per save.

**Edit cancel discards unsaved source info changes**
Given the source info edit mode is active and the user has modified fields, when they click cancel, the changes are discarded and the section reverts to the previous values.

#### TasksSection

**Section displays "Tasks" title with "Unresolved tasks" label**
Given the user is on a client detail page, the Tasks section displays the heading "Tasks" and a subtitle or label "Unresolved tasks" indicating it shows only unresolved tasks.

**Unresolved tasks are listed with checkboxes**
Given the client has unresolved tasks, each task is displayed as a row with an unchecked checkbox on the left side.

**Each task displays its title**
Given the client has a task titled "Follow up on proposal", the task row displays the text "Follow up on proposal".

**Each task displays its due date**
Given a task has a due date, the task row displays the due date (e.g., "Due: Today", "Due: Tomorrow", "Due: Next Week") next to or below the title.

**Tasks with linked deals display the deal name**
Given a task is associated with a deal named "Acme Software License", the task row displays "Deal: 'Acme Software License'" next to the due date. Tasks not linked to a deal do not show a deal reference.

**Checking a task checkbox marks it as complete**
Given an unresolved task is displayed with an unchecked checkbox, when the user clicks the checkbox, the task is marked as complete in the database, and the task is removed from the unresolved tasks list.

**Completing a task creates a timeline entry**
Given the user checks a task's checkbox to mark it complete, a timeline entry "Task Completed" is created with the task name and attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Completing a task triggers follower notifications**
Given the user marks a task complete on a client that has followers, email notifications are sent to followers who have "task completed" notifications enabled (excluding the actor who completed it).

**Clicking a task navigates to task detail page**
Given an unresolved task is displayed, when the user clicks on the task title (not the checkbox), the app navigates to /tasks/:taskId and the TaskDetailPage is displayed for that task.

**Empty state when no unresolved tasks exist**
Given the client has no unresolved tasks, the Tasks section displays an empty state message (e.g., "No unresolved tasks").

#### DealsSection

**Section displays "Deals" title**
Given the user is on a client detail page, the Deals section displays the heading "Deals".

**Deal cards display deal name**
Given the client has a deal named "Acme Software License", the Deals section displays a card/row showing the text "Acme Software License".

**Deal cards display current stage**
Given a deal is at stage "Proposal Sent", the deal card displays "Stage: Proposal Sent".

**Deal cards display monetary value**
Given a deal has a value of $50,000, the deal card displays "Value: $50,000" (formatted as currency).

**Multiple deals are displayed as separate cards**
Given the client has two deals ("Acme Software License" and "Additional Services"), both are displayed as separate cards/rows in the Deals section.

**Clicking a deal navigates to deal detail page**
Given the user is viewing a deal card for "Acme Software License", when they click on the deal card, the app navigates to /deals/:dealId and the DealDetailPage is displayed for that deal.

**Empty state when no deals exist**
Given the client has no deals, the Deals section displays an empty state message (e.g., "No deals").

#### AttachmentsSection

**Section displays "Attachments" title**
Given the user is on a client detail page, the Attachments section displays the heading "Attachments".

**Document attachments display document icon**
Given an attachment is a document file (e.g., "Service Agreement.pdf"), the attachment row displays a document-type icon to the left of the filename.

**Image attachments display image icon and thumbnail preview**
Given an attachment is an image file (e.g., "screenshot.png"), the attachment row displays an image-type icon and renders a thumbnail preview of the image.

**Spreadsheet attachments display spreadsheet icon**
Given an attachment is a spreadsheet file (e.g., "budget.xlsx"), the attachment row displays a spreadsheet-type icon.

**Link attachments display link icon**
Given an attachment is a URL link (e.g., "Client Website Link"), the attachment row displays a link icon.

**Each attachment displays filename**
Given an attachment named "Service Agreement.pdf", the attachment row displays the text "Service Agreement.pdf".

**Each attachment displays file type**
Given an attachment of type "Document", the row displays the type label "Document". For links, it displays "Link".

**Each attachment displays created date**
Given an attachment created on "2023-02-01", the row displays "Created: 2023-02-01".

**Each attachment displays linked deal or "None"**
Given an attachment linked to deal "Acme Software License", the row displays "Linked Deal: Acme Software License". If not linked to any deal, it displays "Linked Deal: None".

**Document attachments have a download button**
Given a document attachment (e.g., "Service Agreement.pdf"), a download icon button is visible in the row. When clicked, the file is downloaded.

**Link attachments have a view button**
Given a link attachment (e.g., "Client Website Link"), an eye/view icon button is visible in the row. When clicked, the link URL is opened in a new tab.

**All attachments have a delete button**
Given any attachment is displayed, a trash/delete icon button is visible in the row.

**Clicking delete removes the attachment after confirmation**
Given the user clicks the delete button on an attachment, a confirmation dialog appears. When the user confirms, the attachment is deleted from the database and removed from the list. If the user cancels, the attachment remains.

**Empty state when no attachments exist**
Given the client has no attachments, the Attachments section displays an empty state message (e.g., "No attachments").

#### PeopleSection

**Section displays "People" title**
Given the user is on a client detail page, the People section displays the heading "People".

**Each person displays an avatar**
Given a person "Sarah Johnson" is associated with the client, the People section shows an avatar (photo or initials fallback) for that person.

**Each person displays their name**
Given a person named "Sarah Johnson" is associated with the client, the person row displays the text "Sarah Johnson".

**Each person displays their role or title**
Given a person "Sarah Johnson" has the role "CEO", the person row displays "CEO" next to or below the name (e.g., "Sarah Johnson - CEO").

**Multiple people are displayed as separate rows**
Given the client has three associated people ("Sarah Johnson - CEO", "Michael Chen - CTO", "Emily Davis - Project Manager"), all three are displayed as separate rows in the People section.

**Clicking a person navigates to person detail page**
Given the user is viewing a person entry for "Sarah Johnson", when they click on the person row, the app navigates to /individuals/:individualId and the PersonDetailPage is displayed for that person.

**Empty state when no people are associated**
Given the client has no associated people, the People section displays an empty state message (e.g., "No people associated").

#### TimelineSection

**Section displays "Timeline" title**
Given the user is on a client detail page, the Timeline section displays the heading "Timeline".

**Events are displayed in reverse chronological order**
Given the client has multiple timeline events, they are displayed with the most recent event at the top and oldest at the bottom.

**Events display relative date labels**
Given timeline events occurred at various times, each event group shows a relative date label (e.g., "Today", "Yesterday", "2 days ago", "Last Week", "Last Month").

**Task Created events display task name and user link**
Given a "Task Created" timeline event for task "Follow up on proposal" by "User A", the event displays "Task Created: 'Follow up on proposal' by User A" where "User A" is a clickable link.

**Note Added events display note excerpt and user link**
Given a "Note Added" timeline event with excerpt "Client mentioned interest in new features." by "User B", the event displays "Note Added: 'Client mentioned interest in new features.' by User B" where "User B" is a clickable link.

**Deal Stage Changed events display deal name, stages, and user link**
Given a "Deal Stage Changed" event for deal "Acme Software License" from "Qualification" to "Proposal Sent" by "User A", the event displays "Deal Stage Changed: 'Acme Software License' from 'Qualification' to 'Proposal Sent' by User A" where "User A" is a clickable link.

**Email Sent events display subject and recipient**
Given an "Email Sent" event with subject "Meeting Confirmation" sent to "Sarah Johnson", the event displays "Email Sent: 'Meeting Confirmation' to Sarah Johnson" where "Sarah Johnson" is a clickable link navigating to the person's detail page.

**Contact Added events display contact name and user link**
Given a "Contact Added" event for "Michael Chen" by "User C", the event displays "Contact Added: 'Michael Chen' by User C" where "User C" is a clickable link.

**User links in events navigate to user detail page**
Given a timeline event showing "by User A" as a clickable link, when the user clicks on "User A", the app navigates to /users/:userId for that user.

**Person links in events navigate to person detail page**
Given a timeline event showing a person name like "Sarah Johnson" as a clickable link, when the user clicks on "Sarah Johnson", the app navigates to /individuals/:individualId for that person.

**Timeline updates when new actions are performed**
Given the user performs an action that creates a timeline event (e.g., completes a task), the Timeline section updates to show the new event at the top without requiring a page refresh.

**Empty state when no timeline events exist**
Given the client has no timeline events, the Timeline section displays an empty state message (e.g., "No activity yet").

#### AddTaskModal

**Modal opens when Add Task quick action is clicked**
Given the user is on a client detail page, when they click the "Add Task" quick action button, the AddTaskModal dialog opens with a form title "Add Task".

**Modal contains title field (required)**
Given the AddTaskModal is open, the form contains a "Title" text input field that is required.

**Modal contains due date picker**
Given the AddTaskModal is open, the form contains a "Due Date" date picker field.

**Modal contains priority selector**
Given the AddTaskModal is open, the form contains a "Priority" selector with priority level options.

**Modal contains assignee selector populated from users API**
Given the AddTaskModal is open, the form contains an "Assignee" FilterSelect dropdown populated with team members from the users API, instead of a free-form text field.

**Modal contains optional deal selector**
Given the AddTaskModal is open, the form contains an optional "Deal" selector allowing the user to associate the task with one of the client's existing deals.

**Submit creates a task associated with the client**
Given the AddTaskModal is open and the user fills in title "Follow up on proposal", selects due date "Tomorrow", assigns to a team member, and clicks submit, the task is created in the database associated with the current client, the modal closes, and the new task appears in the TasksSection.

**Task creation generates a timeline entry**
Given the user creates a new task via AddTaskModal, a "Task Created" timeline entry is added to the TimelineSection attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Task creation triggers follower notifications**
Given the user creates a new task on a client that has followers, email notifications are sent to followers who have "task created" notifications enabled (excluding the actor).

**Modal validates required fields**
Given the AddTaskModal is open, when the user clicks submit without filling in the required title field, a validation error is displayed and the form is not submitted.

**Modal cancel closes without saving**
Given the AddTaskModal is open and the user has entered data, when they click cancel or the close icon, the modal closes and no task is created.

#### AddDealModal

**Modal opens when Add Deal quick action is clicked**
Given the user is on a client detail page, when they click the "Add Deal" quick action button, the AddDealModal dialog opens with a form title "Add Deal".

**Modal contains deal name field (required)**
Given the AddDealModal is open, the form contains a "Deal Name" text input field that is required.

**Modal contains stage selector**
Given the AddDealModal is open, the form contains a "Stage" selector with deal pipeline stage options.

**Modal contains value input**
Given the AddDealModal is open, the form contains a "Value" numeric input field for the deal's monetary value.

**Modal contains owner selector populated from users API**
Given the AddDealModal is open, the form contains an "Owner" FilterSelect dropdown populated with team members from the users API, instead of a free-form text field.

**Modal contains probability field**
Given the AddDealModal is open, the form contains a "Probability" field for the deal's win probability.

**Modal contains expected close date picker**
Given the AddDealModal is open, the form contains an "Expected Close Date" date picker field.

**Submit creates a deal associated with the client**
Given the AddDealModal is open and the user fills in deal name "New Service Package", stage "Qualification", value "$25,000", and selects an owner, when they click submit, the deal is created in the database associated with the current client, the modal closes, and the new deal appears in the DealsSection.

**Deal creation generates a timeline entry**
Given the user creates a new deal via AddDealModal, a "Deal Created" timeline entry is added to the TimelineSection attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Deal creation triggers follower notifications**
Given the user creates a new deal on a client that has followers, email notifications are sent to followers who have "deal created" notifications enabled (excluding the actor).

**Modal validates required fields**
Given the AddDealModal is open, when the user clicks submit without filling in the required deal name field, a validation error is displayed and the form is not submitted.

**Modal cancel closes without saving**
Given the AddDealModal is open and the user has entered data, when they click cancel or the close icon, the modal closes and no deal is created.

#### AddAttachmentModal

**Modal opens when Add Attachment quick action is clicked**
Given the user is on a client detail page, when they click the "Add Attachment" quick action button, the AddAttachmentModal dialog opens.

**Modal has toggle between file upload and link URL modes**
Given the AddAttachmentModal is open, it displays a toggle or tab control allowing the user to switch between "File Upload" mode and "Link URL" mode.

**File upload mode displays a file picker**
Given the AddAttachmentModal is open in file upload mode, the form contains a file picker (browse button and/or drag-and-drop area) for selecting a file to upload.

**Link URL mode displays a URL input field**
Given the AddAttachmentModal is open in link URL mode, the form contains a "URL" text input field and a "Name" text input field for the link display name.

**Modal contains optional deal link selector**
Given the AddAttachmentModal is open (in either mode), the form contains an optional "Link to Deal" selector allowing the user to associate the attachment with one of the client's existing deals.

**Submit in file upload mode uploads the file**
Given the AddAttachmentModal is in file upload mode, the user selects a file (e.g., "contract.pdf") and optionally links a deal, when they click submit, the file is uploaded, the attachment is created in the database associated with the current client, the modal closes, and the new attachment appears in the AttachmentsSection with a document icon, the filename, type, and created date.

**Submit in link URL mode creates a link attachment**
Given the AddAttachmentModal is in link URL mode, the user enters a URL and display name (e.g., "Client Portal" / "https://portal.example.com") and optionally links a deal, when they click submit, the link attachment is created in the database associated with the current client, the modal closes, and the new attachment appears in the AttachmentsSection with a link icon.

**Modal validates required fields in file upload mode**
Given the AddAttachmentModal is in file upload mode, when the user clicks submit without selecting a file, a validation error is displayed and the form is not submitted.

**Modal validates required fields in link URL mode**
Given the AddAttachmentModal is in link URL mode, when the user clicks submit without entering a URL, a validation error is displayed and the form is not submitted.

**Modal cancel closes without saving**
Given the AddAttachmentModal is open and the user has entered data or selected a file, when they click cancel or the close icon, the modal closes and no attachment is created.

#### AddPersonModal

**Modal opens when Add Person quick action is clicked**
Given the user is on a client detail page, when they click the "Add Person" quick action button, the AddPersonModal dialog opens with a form title "Add Person".

**Modal contains name field (required)**
Given the AddPersonModal is open, the form contains a "Name" text input field that is required.

**Modal contains role/title field**
Given the AddPersonModal is open, the form contains a "Role" or "Title" text input field.

**Modal contains contact information fields**
Given the AddPersonModal is open, the form contains fields for contact information such as email, phone, and location.

**Submit creates a person associated with the client**
Given the AddPersonModal is open and the user fills in name "Alex Rivera", role "VP of Engineering", and email "alex@acme.com", when they click submit, the person/individual is created in the database and associated with the current client, the modal closes, and the new person appears in the PeopleSection with their avatar, name, and role.

**Person creation generates a timeline entry**
Given the user adds a new person via AddPersonModal, a "Contact Added" timeline entry is added to the TimelineSection with the person's name, attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Person creation triggers follower notifications**
Given the user adds a new person on a client that has followers, email notifications are sent to followers who have "contact added" notifications enabled (excluding the actor).

**Modal validates required fields**
Given the AddPersonModal is open, when the user clicks submit without filling in the required name field, a validation error is displayed and the form is not submitted.

**Modal cancel closes without saving**
Given the AddPersonModal is open and the user has entered data, when they click cancel or the close icon, the modal closes and no person is created.

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
