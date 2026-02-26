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

**Actions menu Edit option navigates to client detail page**
Given the user is on /clients and clicks the actions menu on a client row, when they select "Edit", the app navigates to /clients/:clientId for that client and the ClientDetailPage is displayed.

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

**Deleting an attachment creates a timeline entry**
Given the user deletes an attachment via the delete button and confirms, an "Attachment Deleted" timeline entry is created recording the attachment name, attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Deleting an attachment triggers follower notifications**
Given the user deletes an attachment on a client that has followers, email notifications are sent to followers who have "attachment deleted" notifications enabled (excluding the actor).

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

**Attachment creation generates a timeline entry**
Given the user creates a new attachment via AddAttachmentModal (either file upload or link URL mode), an "Attachment Added" timeline entry is added to the TimelineSection with the attachment name, attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Attachment creation triggers follower notifications**
Given the user creates a new attachment on a client that has followers, email notifications are sent to followers who have "attachment added" notifications enabled (excluding the actor).

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

#### PersonHeader

**Person name is displayed as a large heading**
Given the user navigates to /individuals/:individualId for a person named "Dr. Anya Sharma", the page displays "Dr. Anya Sharma" as a large heading at the top of the content area.

**Title and organization are displayed below the name**
Given the user is viewing a person with title "Chief Technology Officer (CTO)" associated with "Innovate Solutions Inc." and "FutureTech Corp.", the header displays "Chief Technology Officer (CTO) | Innovate Solutions Inc. & FutureTech Corp." below the name.

**Email is displayed with mail icon**
Given the user is viewing a person with email "anya.sharma@example.com", the header displays a mail icon followed by "anya.sharma@example.com".

**Phone number is displayed with phone icon**
Given the user is viewing a person with phone "+1 (555) 123-4567", the header displays a phone icon followed by "+1 (555) 123-4567".

**Location is displayed with pin icon**
Given the user is viewing a person with location "San Francisco, CA", the header displays a location/pin icon followed by "San Francisco, CA".

**Associated clients are displayed as clickable links**
Given the user is viewing a person associated with clients "Innovate Solutions Inc." and "FutureTech Corp.", the header displays "Associated Clients:" followed by "Innovate Solutions Inc." and "FutureTech Corp." as clickable links separated by a comma.

**Clicking an associated client link navigates to client detail page**
Given the user is viewing a person associated with "Innovate Solutions Inc.", when they click the "Innovate Solutions Inc." link in the Associated Clients row, the app navigates to /clients/:clientId for that client and the ClientDetailPage is displayed.

**Header displays correctly when optional fields are missing**
Given the user is viewing a person with no phone number and no location set, the header displays the name, title/organization, and email, and the phone and location rows are either hidden or show placeholder text. The layout does not break.

#### RelationshipsSection

**Section displays "Relationships with Other Individuals" title with icon**
Given the user is on a person detail page, the Relationships section displays the heading "Relationships with Other Individuals" with a relationship/connection icon.

**Graph View and List View tabs are displayed**
Given the user is on a person detail page, the Relationships section displays two tab buttons: "Graph View" and "List View".

**List View tab is selected by default**
Given the user navigates to a person detail page, the "List View" tab is selected/active by default and the relationship entries are displayed in list format.

**Clicking Graph View tab switches to graph view**
Given the user is on a person detail page with List View active, when they click the "Graph View" tab, the view switches to a visual graph/network representation of the person's relationships. The "Graph View" tab becomes active and "List View" becomes inactive.

**Clicking List View tab switches back to list view**
Given the user is on a person detail page with Graph View active, when they click the "List View" tab, the view switches back to the list format. The "List View" tab becomes active and "Graph View" becomes inactive.

**Filter button is visible with icon and label**
Given the user is on a person detail page, the Relationships section displays a "Filter" button with a filter icon and the text "Filter".

**Filter button opens filter controls**
Given the user is on a person detail page, when they click the "Filter" button in the Relationships section, filter controls appear allowing the user to filter relationships by type (e.g., Colleague, Decision Maker, Influencer).

**Filtering by relationship type shows only matching entries**
Given the user is on a person detail page with relationships of types Colleague, Decision Maker, and Influencer, when they apply a filter for "Colleague", only relationships with type "Colleague" are displayed in the list.

**Add Entry button is visible with plus icon**
Given the user is on a person detail page, the Relationships section displays a "+ Add Entry" button with a plus icon.

**Add Entry button opens add relationship modal**
Given the user is on a person detail page, when they click the "+ Add Entry" button in the Relationships section, a modal or form opens allowing the user to add a new relationship with fields for the related person (searchable dropdown), relationship type (Colleague, Decision Maker, Influencer), and optionally organization.

**Submitting add relationship form creates a new relationship entry**
Given the add relationship modal is open and the user selects a related person from the searchable dropdown and selects relationship type "Decision Maker", when they click "Add Relationship", the modal closes and the new relationship entry appears in the relationships list with the correct person name and relationship type.

**Relationship entries display person name in bold**
Given a person has a relationship with "David Chen", the relationship entry displays "David Chen" in bold text.

**Relationship entries display relationship type in parentheses**
Given a person has a "Colleague" relationship with "David Chen", the entry displays "(Colleague)" after the person name.

**Relationship entries display role and organization**
Given a relationship entry for "David Chen (Colleague)" who is "V.P. Engineering" at "Innovate Solutions Inc.", the entry displays "V.P. Engineering, Innovate Solutions Inc." after the relationship type.

**Relationship entries display Link to person detail page**
Given a relationship entry for "David Chen", a "[Link]" clickable element is displayed at the end of the entry row.

**Clicking Link navigates to related person's detail page**
Given a relationship entry for "David Chen" with a [Link], when the user clicks [Link], the app navigates to /individuals/:individualId for David Chen and displays their PersonDetailPage.

**Multiple relationship types are displayed correctly**
Given a person has relationships with "David Chen (Colleague)", "Maria Rodriguez (Decision Maker)", "Kenji Tanaka (Influencer)", and "Sarah Lee (Colleague)", all four entries are displayed in the list view with their respective types.

**Creating a relationship creates reciprocal entry on the other person**
Given the user adds a new "Colleague" relationship between the current person and "Alex Rivera", the relationship is created on both sides: Alex Rivera appears in the current person's relationships, and the current person appears in Alex Rivera's relationships. Both sides show the same relationship type.

**Deleting a relationship removes both sides**
Given a reciprocal relationship exists between the current person and "David Chen", when the user deletes the relationship entry for David Chen, the relationship is removed from both the current person's list and from David Chen's list.

**Empty state when no relationships exist**
Given the person has no relationships with other individuals, the Relationships section displays an empty state message (e.g., "No relationships") and the "+ Add Entry" button remains available.

#### ContactHistorySection

**Section displays "History of Contact" title with icon**
Given the user is on a person detail page, the Contact History section displays the heading "History of Contact" with a clock/history icon.

**Filter button is visible with icon and label**
Given the user is on a person detail page, the Contact History section displays a "Filter" button with a filter icon and the text "Filter".

**Filter button opens filter controls for contact type**
Given the user is on a person detail page, when they click the "Filter" button in the Contact History section, filter controls appear allowing the user to filter entries by contact type (Video Call, Email, Meeting, Note).

**Filtering by contact type shows only matching entries**
Given the contact history has entries of types Video Call, Email, Meeting, and Note, when the user applies a filter for "Email", only contact history entries of type "Email" are displayed.

**Add Entry button is visible with plus icon**
Given the user is on a person detail page, the Contact History section displays a "+ Add Entry" button with a plus icon.

**Add Entry button opens add contact history modal**
Given the user is on a person detail page, when they click the "+ Add Entry" button in the Contact History section, a modal or form opens allowing the user to add a new contact history entry with fields for date/time, type (Video Call, Email, Meeting, Note), summary text, and team member(s).

**Submitting add entry form creates a new contact history entry**
Given the add contact history modal is open and the user fills in date "Oct 28, 2023, 3:00 PM", type "Email", summary "Sent updated pricing proposal", and team member "Emily R.", when they click submit, the modal closes and the new entry appears in the contact history list with the correct date, type, summary, and team member.

**Contact history entries display date and time**
Given a contact history entry occurred on "Oct 26, 2023, 2:30 PM", the entry row displays "Oct 26, 2023, 2:30 PM" as the date/time.

**Contact history entries display interaction type**
Given a contact history entry of type "Video Call", the entry row displays the text "Video Call" as the interaction type. Similarly for "Email", "Meeting (In-person)", and "Note".

**Contact history entries display summary**
Given a contact history entry with summary "Discussed Q4 roadmap integration. Action items assigned.", the entry row displays "Summary: Discussed Q4 roadmap integration. Action items assigned."

**Contact history entries display team member name and role**
Given a contact history entry with team member "Michael B. (Sales Lead)", the entry row displays "Team Member: Michael B. (Sales Lead)".

**Contact history entries display multiple team members**
Given a contact history entry performed by multiple team members "Michael B., Emily R.", the entry row displays "Team Member: Michael B., Emily R." showing all participants.

**Contact history entries display System for auto-logged entries**
Given a contact history entry auto-logged by the system, the entry row displays "Team Member: System (Auto-logged)".

**Edit icon is visible on each contact history entry**
Given a contact history entry is displayed, a pencil/edit icon is visible on the right side of the entry row.

**Clicking edit icon opens edit mode for that entry**
Given the user clicks the pencil/edit icon on a contact history entry, an edit modal or inline edit mode opens allowing the user to modify the date/time, type, summary, and team member fields for that entry.

**Saving edited contact history entry persists changes**
Given the edit mode is open for a contact history entry and the user changes the summary from "Discussed Q4 roadmap integration." to "Discussed Q4 roadmap and budget review.", when they save, the entry updates to reflect the new summary and the changes are persisted to the database.

**Contact history entries are displayed in reverse chronological order**
Given multiple contact history entries exist with different dates, they are displayed with the most recent entry at the top and oldest at the bottom.

**Empty state when no contact history exists**
Given the person has no contact history entries, the section displays an empty state message (e.g., "No contact history") and the "+ Add Entry" button remains available.

#### AssociatedClientsSection

**Section displays "Associated Clients" title with icon**
Given the user is on a person detail page, the Associated Clients section displays the heading "Associated Clients" with a building/client icon.

**Client cards display client name with icon**
Given the person is associated with a client "Innovate Solutions Inc.", the Associated Clients section displays a card with an icon and the text "Innovate Solutions Inc.".

**Client cards display status**
Given the person is associated with a client with status "Active Client", the client card displays "Status: Active Client". For a prospect, it displays "Status: Prospect".

**Client cards display industry**
Given the person is associated with a client in the "Software" industry, the client card displays "Industry: Software".

**Client cards display "View Client Detail Page" button with external link icon**
Given the person is associated with a client, the client card displays a "View Client Detail Page" button with an external link icon.

**Clicking "View Client Detail Page" navigates to client detail page**
Given the person is associated with "Innovate Solutions Inc.", when the user clicks the "View Client Detail Page" button on that client's card, the app navigates to /clients/:clientId for Innovate Solutions Inc. and the ClientDetailPage is displayed.

**Multiple associated clients display as separate cards**
Given the person is associated with two clients "Innovate Solutions Inc." and "FutureTech Corp.", both are displayed as separate cards in the Associated Clients section with their respective status and industry information.

**Empty state when no associated clients exist**
Given the person has no associated clients, the section displays an empty state message (e.g., "No associated clients").

---

## DealsListPage (/deals)

### Components: DealsListHeader, DealsSummaryCards, ViewToggle, DealsFilters, DealsTable, PipelineView, DealsPagination, CreateDealModal, ImportDialog

#### DealsListHeader

**Page title displays "Deals List"**
Given the user navigates to /deals, the page displays the heading "Deals List" at the top left of the content area.

**Breadcrumb displays "/deals"**
Given the user is on /deals, a breadcrumb path "/deals" is displayed above the page title.

**Create New Deal button is visible with label**
Given the user is on /deals, the header area displays a primary-styled (blue) "Create New Deal" button at the top right.

**Create New Deal button opens CreateDealModal**
Given the user is on /deals, when they click the "Create New Deal" button, the CreateDealModal dialog opens with a form to create a new deal.

**Import button is visible with icon and label**
Given the user is on /deals, the header area displays an "Import" button with an import icon and the text "Import".

**Import button opens ImportDialog**
Given the user is on /deals, when they click the "Import" button, an ImportDialog modal opens for importing deals from CSV.

**Export button is visible with icon and label**
Given the user is on /deals, the header area displays an "Export" button with an export icon and the text "Export".

**Export button triggers CSV download**
Given the user is on /deals, when they click the "Export" button, a CSV file containing the current deals data is downloaded. The file includes columns matching the deal data fields (Name, Client Name, Value, Stage, Owner, Probability, Expected Close Date, Status).

#### DealsSummaryCards

**Total Active Deals card displays count with icon**
Given the user is on /deals, the summary cards area displays a "Total Active Deals" card with a document/clipboard icon, the label "Total Active Deals:", and a numeric count of all deals with active status (e.g., "124").

**Pipeline Value card displays total monetary value with icon**
Given the user is on /deals, the summary cards area displays a "Pipeline Value" card with a briefcase/document icon, the label "Pipeline Value:", and a formatted currency total of all active deal values (e.g., "$4.5M").

**Won (Q3) card displays count and value with icon**
Given the user is on /deals, the summary cards area displays a "Won (Q3)" card with a trophy/award icon, the label "Won (Q3):", a count of deals won in Q3 (e.g., "32"), and their total value in parentheses (e.g., "($1.2M)").

**Lost (Q3) card displays count and value with icon**
Given the user is on /deals, the summary cards area displays a "Lost (Q3)" card with a loss/X icon, the label "Lost (Q3):", a count of deals lost in Q3 (e.g., "18"), and their total value in parentheses (e.g., "($0.6M)").

**Summary cards update when deals are created or modified**
Given the user is on /deals and creates a new deal via CreateDealModal, the summary cards update to reflect the new counts and totals without requiring a page refresh.

#### ViewToggle

**Table View and Pipeline View tabs are displayed**
Given the user is on /deals, the view toggle area displays two tab buttons: "Table View" and "Pipeline View".

**Table View tab is selected by default**
Given the user navigates to /deals, the "Table View" tab is selected/active by default, and the deals are displayed in a table format below.

**Clicking Pipeline View tab switches to pipeline/kanban view**
Given the user is on /deals with Table View active, when they click the "Pipeline View" tab, the view switches to a kanban/pipeline board layout with columns for each deal stage. The "Pipeline View" tab becomes active and "Table View" becomes inactive.

**Clicking Table View tab switches back to table view**
Given the user is on /deals with Pipeline View active, when they click the "Table View" tab, the view switches back to the table format. The "Table View" tab becomes active and "Pipeline View" becomes inactive.

**Active tab has visually distinct styling**
Given the user is on /deals with Table View active, the "Table View" tab has a visually distinct active state (e.g., underline, bold, or highlighted background) while "Pipeline View" appears inactive. The styling reverses when Pipeline View is selected.

#### DealsFilters

**Stage dropdown displays "All Stages" by default**
Given the user is on /deals, the Stage filter dropdown displays "All Stages" as its default selected value.

**Stage dropdown is searchable**
Given the user is on /deals, when they open the Stage dropdown, a search input appears at the top of the dropdown that filters stage options as the user types. The search auto-focuses when the dropdown opens and shows "No matches" when no options match.

**Stage dropdown filters by a specific stage**
Given the user is on /deals, when they open the Stage dropdown and select a stage (e.g., "Proposal Sent"), only deals at the "Proposal Sent" stage are shown in the table/pipeline view. The dropdown label updates to reflect the selection.

**Stage dropdown resets to All Stages**
Given the user has filtered by a specific stage, when they select "All Stages" from the Stage dropdown, all deals are displayed regardless of stage.

**Client dropdown displays "All Clients" by default**
Given the user is on /deals, the Client filter dropdown displays "All Clients" as its default selected value.

**Client dropdown is searchable**
Given the user is on /deals, when they open the Client dropdown, a search input appears at the top of the dropdown that filters client options as the user types. The search auto-focuses when the dropdown opens and shows "No matches" when no options match.

**Client dropdown filters by a specific client**
Given the user is on /deals, when they open the Client dropdown and select a client (e.g., "Acme Corp."), only deals associated with "Acme Corp." are shown in the table.

**Client dropdown resets to All Clients**
Given the user has filtered by a specific client, when they select "All Clients" from the Client dropdown, all deals are displayed regardless of client.

**Status dropdown displays "Active" by default**
Given the user is on /deals, the Status filter dropdown displays "Active" as its default selected value.

**Status dropdown filters by On Track**
Given the user is on /deals, when they open the Status dropdown and select "On Track", only deals with status "On Track" are shown.

**Status dropdown filters by Needs Attention**
Given the user is on /deals, when they select "Needs Attention" from the Status dropdown, only deals with that status are shown.

**Status dropdown filters by At Risk**
Given the user is on /deals, when they select "At Risk" from the Status dropdown, only deals with that status are shown.

**Status dropdown filters by Won**
Given the user is on /deals, when they select "Won" from the Status dropdown, only deals with status "Won" are shown.

**Status dropdown filters by Lost**
Given the user is on /deals, when they select "Lost" from the Status dropdown, only deals with status "Lost" are shown.

**Status dropdown resets to All**
Given the user has filtered by a specific status, when they select "All" from the Status dropdown, all deals are displayed regardless of status.

**Date Range picker is displayed with calendar icon**
Given the user is on /deals, a "Date - Range" picker is displayed with a calendar icon, allowing the user to select a date range to filter deals by close date.

**Date Range picker filters deals within selected range**
Given the user is on /deals, when they select a start date and end date in the Date Range picker, only deals whose close date falls within the selected range are shown in the table.

**Date Range picker clears filter when range is cleared**
Given the user has applied a date range filter, when they clear the date range selection, all deals are displayed regardless of close date (subject to other active filters).

**Sort by dropdown displays "Close Date (Newest)" by default**
Given the user is on /deals, the Sort by dropdown displays "Close Date (Newest)" as its default selected value, preceded by the label "Sort by:".

**Sort by dropdown changes sort order**
Given the user is on /deals, when they open the Sort by dropdown and select a different option (e.g., "Close Date (Oldest)", "Value (High to Low)", "Value (Low to High)", "Deal Name (A-Z)"), the table reorders deals according to the selected sort criteria.

**Close Date column header shows sort direction arrow**
Given the user is on /deals with sort set to "Close Date (Newest)", the Close Date column header displays a downward arrow (ArrowDown) indicating descending sort. When sort is "Close Date (Oldest)", an upward arrow (ArrowUp) is shown. When sorting by a non-close-date field, a neutral arrow (ArrowUpDown) is shown.

**Search input is displayed with magnifying glass icon**
Given the user is on /deals, a search input is displayed with a magnifying glass icon and placeholder text "Search deals...".

**Search filters deals by name**
Given the user is on /deals with multiple deals displayed, when the user types "Alpha" into the search input, the table filters to show only deals whose name contains "Alpha" (e.g., "Project Alpha Expansion"). The filtering applies with debounced input.

**Search filters deals by client name**
Given the user is on /deals, when the user types "Acme" into the search input, the table filters to show deals associated with clients matching "Acme".

**Search clears results when input is cleared**
Given the user has typed a search term and the table is filtered, when the user clears the search input, all deals are displayed again (unfiltered, subject to other active filters).

**Multiple filters combine together**
Given the user is on /deals, when they set Stage to "Proposal Sent", Client to "Acme Corp.", Status to "On Track", and type "Alpha" in the search input, the table shows only deals that match all four criteria simultaneously (AND logic).

**Filters apply to both Table View and Pipeline View**
Given the user is on /deals with filters applied (e.g., Stage: "Discovery"), when they switch from Table View to Pipeline View, the same filter is applied and only "Discovery" deals are shown in the pipeline.

#### DealsTable

**Table displays correct column headers**
Given the user is on /deals with Table View active, the deals table displays column headers in this order: Deal Name, Client, Stage, Owner, Value, Close Date, Status. An actions column (no header text) is present as the last column.

**Deal Name column displays deal names**
Given the user is on /deals with deal data, each row shows the deal's name in the Deal Name column (e.g., "Project Alpha Expansion", "Q4 Marketing Campaign").

**Client column displays associated client name**
Given the user is on /deals, each row shows the associated client's name in the Client column (e.g., "Acme Corp.", "Beta Industries").

**Stage column displays current deal stage**
Given the user is on /deals, each row shows the deal's current stage in the Stage column (e.g., "Proposal Sent", "Qualification", "Negotiation", "Discovery", "Closed Won").

**Owner column displays deal owner name**
Given the user is on /deals, each row shows the deal owner's name in the Owner column (e.g., "Sarah K.", "Mike R.", "Emily L.", "Chris B.").

**Value column displays monetary value**
Given the user is on /deals, each row shows the deal's monetary value formatted as currency in the Value column (e.g., "$250,000", "$75,000", "$450,000").

**Close Date column displays date with sort arrow**
Given the user is on /deals, each row shows the deal's expected close date in the Close Date column (e.g., "2023-11-15", "2023-12-01"). The column header displays a directional arrow icon reflecting the current sort direction.

**Clicking Close Date header toggles sort direction**
Given the user is on /deals with Close Date sorted descending (newest first, ArrowDown icon), when they click the Close Date column header, the sort direction toggles to ascending (oldest first, ArrowUp icon) and the table rows reorder accordingly. Clicking again toggles back to descending.

**Close Date header has data-sort-direction attribute**
Given the user is on /deals, the Close Date column header's sort button exposes a `data-sort-direction` attribute with value "desc" when sorted descending, "asc" when sorted ascending, and "none" when not sorted by close date.

**Status column displays color-coded badges**
Given the user is on /deals, each row shows the deal's status as a color-coded badge in the Status column: "On Track" in green, "Needs Attention" in yellow/amber, "At Risk" in red, "Won" in green (distinct from On Track).

**Actions menu button visible on each row**
Given the user is on /deals, each row has a three-dot actions menu button ("...") in the last column.

**Actions menu opens on click**
Given the user is on /deals, when they click the three-dot actions menu on a deal row, a dropdown menu appears with action options (e.g., Edit, Delete, View Details).

**Actions menu Edit option opens edit deal modal**
Given the user is on /deals and clicks the actions menu on a deal row, when they select "Edit", an edit modal opens pre-populated with the deal's current data allowing the user to modify deal fields.

**Actions menu Delete option removes deal after confirmation**
Given the user is on /deals and clicks the actions menu on a deal row, when they select "Delete", a confirmation dialog appears. When the user confirms, the deal is deleted from the database and the row is removed from the table. If the user cancels, the deal remains.

**Row click navigates to DealDetailPage**
Given the user is on /deals, when they click on a deal row (anywhere except the actions menu), the app navigates to /deals/:dealId for that deal and the DealDetailPage is displayed.

**Table displays empty state when no deals match filters**
Given the user is on /deals and applies filters that match no deals, the table displays an empty state message indicating no deals were found.

**New deal appears in table after creation**
Given the user is on /deals and creates a new deal via the CreateDealModal, when the modal closes, the newly created deal appears in the table without requiring a page refresh.

**Deleted deal is removed from table**
Given the user is on /deals and deletes a deal via the actions menu, when the deletion is confirmed, the deal row is removed from the table without requiring a page refresh.

#### PipelineView

**Pipeline displays columns for each deal stage**
Given the user is on /deals with Pipeline View active, the pipeline view displays kanban-style columns for each deal stage (e.g., Discovery, Qualification, Proposal Sent, Negotiation, Closed Won, Closed Lost). Each column has a header showing the stage name.

**Deal cards are displayed in their respective stage columns**
Given deals exist at various stages, each deal card is displayed in the column corresponding to its current stage. A deal at "Proposal Sent" appears in the Proposal Sent column.

**Deal cards display deal name**
Given a deal card is displayed in the pipeline view, the card shows the deal's name (e.g., "Project Alpha Expansion").

**Deal cards display client name**
Given a deal card is displayed in the pipeline view, the card shows the associated client's name (e.g., "Acme Corp.").

**Deal cards display value**
Given a deal card is displayed in the pipeline view, the card shows the deal's monetary value (e.g., "$250,000").

**Deal cards display owner**
Given a deal card is displayed in the pipeline view, the card shows the deal owner's name.

**Deal cards are draggable**
Given a deal card is displayed in the pipeline view, the card is draggable — the user can click and hold the card to initiate a drag operation. The card visually indicates it is being dragged.

**Dropping a deal card on a different stage column updates the deal stage**
Given the user drags a deal card from the "Discovery" column and drops it on the "Qualification" column, the deal's stage is updated to "Qualification" via the API, the card moves to the Qualification column, and the change is persisted to the database.

**Drag-and-drop stage change creates a timeline entry on the deal's client**
Given the user drops a deal card to a new stage column, a "Deal Stage Changed" timeline entry is created on the associated client recording the old stage and new stage, attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Drag-and-drop stage change triggers follower notifications**
Given the user drops a deal card to a new stage on a deal whose associated client has followers, email notifications are sent to followers who have "deal stage changed" notifications enabled (excluding the actor).

**Deal card click navigates to DealDetailPage**
Given a deal card is displayed in the pipeline view, when the user clicks on the card (not during a drag), the app navigates to /deals/:dealId for that deal and the DealDetailPage is displayed.

**Pipeline columns show deal count**
Given the pipeline view is active, each stage column header displays the count of deals in that column (e.g., "Discovery (3)").

**Empty columns display empty state**
Given no deals exist at a particular stage, that stage column in the pipeline view displays an empty state (e.g., empty area or "No deals" message) but the column remains visible as a drop target.

#### DealsPagination

**Pagination shows current page and total pages**
Given the user is on /deals with Table View active and more deals than fit on one page, the pagination area displays text like "Page 1 of 9" indicating the current page and total pages.

**Clicking next page navigates to the next page**
Given the user is on /deals viewing page 1 with multiple pages, when they click the next page control, the table updates to show page 2 data and the pagination text updates to "Page 2 of 9".

**Clicking previous page navigates to the prior page**
Given the user is on /deals viewing page 2, when they click the previous page control, the table updates to show page 1 data.

**Previous control is disabled on first page**
Given the user is on /deals viewing page 1, the previous page control is disabled or visually inactive, indicating there is no previous page.

**Next control is disabled on last page**
Given the user is on /deals viewing the last page, the next page control is disabled or visually inactive, indicating there is no next page.

**Pagination updates when filters reduce results**
Given the user is on /deals with pagination showing multiple pages, when they apply a filter that reduces the results to fit within one page, the pagination updates accordingly.

#### CreateDealModal

**Modal opens when Create New Deal is clicked**
Given the user is on /deals, when they click "Create New Deal", a modal dialog appears with a form title (e.g., "Create New Deal").

**Modal contains deal name input field (required)**
Given the CreateDealModal is open, the form contains a "Deal Name" or "Name" text input field that is required.

**Modal contains client dropdown populated from clients**
Given the CreateDealModal is open, the form contains a "Client" FilterSelect dropdown populated with existing clients from the API, with searchable functionality. It is not a free-form text field.

**Modal contains value input field**
Given the CreateDealModal is open, the form contains a "Value" numeric input field for the deal's monetary value.

**Modal contains stage selector**
Given the CreateDealModal is open, the form contains a "Stage" selector with deal pipeline stage options (e.g., Discovery, Qualification, Proposal Sent, Negotiation, Closed Won, Closed Lost).

**Modal contains owner dropdown populated from users API**
Given the CreateDealModal is open, the form contains an "Owner" FilterSelect dropdown populated with team members from the users API, instead of a free-form text field.

**Modal contains probability field**
Given the CreateDealModal is open, the form contains a "Probability" field for the deal's win probability (e.g., percentage input).

**Modal contains expected close date picker**
Given the CreateDealModal is open, the form contains an "Expected Close Date" date picker field.

**Modal contains status selector**
Given the CreateDealModal is open, the form contains a "Status" selector with options such as On Track, Needs Attention, At Risk.

**Submit creates a new deal**
Given the CreateDealModal is open and the user fills in deal name "New Service Package", selects client "Acme Corp.", enters value "$50,000", stage "Qualification", selects an owner, and clicks submit, the deal is created in the database, the modal closes, and the new deal appears in the deals table.

**Deal creation generates a timeline entry on the client**
Given the user creates a new deal via CreateDealModal associated with a client, a "Deal Created" timeline entry is added to the client's TimelineSection attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Deal creation triggers follower notifications on the client**
Given the user creates a new deal associated with a client that has followers, email notifications are sent to followers who have "deal created" notifications enabled (excluding the actor).

**Deal creation updates summary cards**
Given the user creates a new deal via CreateDealModal, the DealsSummaryCards (Total Active Deals, Pipeline Value) update to reflect the new totals without requiring a page refresh.

**Modal validates required fields**
Given the CreateDealModal is open, when the user clicks submit without filling in the required deal name field, a validation error message is displayed and the form is not submitted.

**Modal cancel closes without saving**
Given the CreateDealModal is open and the user has entered some data, when they click the cancel button or close icon, the modal closes and no new deal is created.

#### ImportDialog

**ImportDialog opens when Import button is clicked**
Given the user is on /deals, when they click the "Import" button, the ImportDialog modal opens.

**ImportDialog displays CSV format specification table**
Given the ImportDialog is open for deals, it shows a table of expected CSV columns: Name (required), Client Name (required — must match an existing client), Value (optional — numeric), Stage (optional — valid stage name), Owner (optional — team member name), Probability (optional — numeric 0-100), Expected Close Date (optional — date format), Status (optional — On Track/Needs Attention/At Risk/Won/Lost). Each column shows whether it is required or optional and describes valid values.

**ImportDialog has Download CSV template button**
Given the ImportDialog is open, a "Download CSV template" button is visible. When clicked, it downloads a CSV file with the correct column headers pre-filled and no data rows, serving as a template for the user.

**ImportDialog has file upload area**
Given the ImportDialog is open, the dialog contains a file picker or drag-and-drop area for selecting a CSV file to upload.

**ImportDialog validates uploaded CSV**
Given the ImportDialog is open, when the user uploads a CSV file with missing required columns (e.g., no Name column), the dialog displays validation error messages indicating which required columns are missing.

**ImportDialog shows per-row validation errors**
Given the ImportDialog is open, when the user uploads a CSV file where some rows have invalid data (e.g., a Client Name that does not match any existing client, an invalid Stage value, or a missing Name), the dialog displays per-row error messages indicating which rows failed and why, allowing the user to fix the file and re-upload.

**ImportDialog successfully imports valid CSV**
Given the ImportDialog is open and the user uploads a valid CSV file with properly formatted deal data (including client names matching existing clients), the import processes successfully, the dialog shows a success message with the count of imported deals, and the deals table updates to include the newly imported deals.

**ImportDialog cancel closes without importing**
Given the ImportDialog is open, when the user clicks the cancel button or close icon, the dialog closes and no data is imported.

---

## DealDetailPage (/deals/:dealId)

### Components: DealHeader, DealStagePipeline, DealHistorySection, DealMetricsSection, WriteupsSection, LinkedTasksSection, DealAttachmentsSection, ContactsIndividualsSection

#### DealHeader

**Deal title displays deal name with client name and value**
Given the user navigates to /deals/:dealId for a deal named "Expansion Deal" associated with client "Acme Corp" valued at $250k, the page displays a heading "DEAL DETAILS: Acme Corp - $250k Expansion Deal" at the top of the content area showing the client name, formatted value, and deal name.

**Client field displays associated client name**
Given the user is viewing a deal associated with client "Acme Corporation", the header displays a "Client:" label followed by the client name "Acme Corporation" in an editable text field.

**Client field is clickable and navigates to client detail page**
Given the user is viewing a deal associated with "Acme Corporation", when they click on the client name field, the app navigates to /clients/:clientId for that client and the ClientDetailPage is displayed.

**Value field displays deal monetary value**
Given the user is viewing a deal with value $250,000, the header displays a "Value:" label followed by "$250,000" in an editable text field.

**Value field can be edited inline**
Given the user is viewing a deal with value "$250,000", when they click the Value field and change it to "$300,000" and confirm, the value is updated in the database and the header reflects "$300,000". The deal title also updates to reflect the new value.

**Owner field displays deal owner as user dropdown**
Given the user is viewing a deal owned by "Sarah Lee", the header displays an "Owner:" label followed by a FilterSelect dropdown showing "Sarah Lee", populated with team members from the users API.

**Owner field can be changed via dropdown**
Given the user is viewing a deal owned by "Sarah Lee", when they open the Owner dropdown and select "Mike R.", the deal owner is updated to "Mike R." in the database and the header reflects the new owner.

**Changing owner creates a timeline entry on the client**
Given the user changes the deal owner from "Sarah Lee" to "Mike R." and saves, a timeline entry is created on the associated client recording the owner change, attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Stage dropdown displays current deal stage**
Given the user is viewing a deal at stage "Discovery", the header displays a "Stage:" label followed by a dropdown showing "Discovery" with the available stage options (Lead, Qualification, Discovery, Proposal, Negotiation, Closed Won).

**Stage dropdown allows selecting a different stage**
Given the user is viewing a deal at stage "Discovery", when they open the Stage dropdown and select "Proposal", the dropdown updates to show "Proposal".

**Change Stage button is visible with label**
Given the user is on a deal detail page, the header displays a "Change Stage" button styled as a primary action button to the right of the Stage dropdown.

**Clicking Change Stage updates the deal stage**
Given the user has selected a new stage "Proposal" from the Stage dropdown, when they click the "Change Stage" button, the deal's stage is updated to "Proposal" in the database, the DealStagePipeline updates to reflect the new current stage, and a stage change entry is added to the DealHistorySection.

**Change Stage creates a timeline entry on the client**
Given the user changes the deal stage from "Discovery" to "Proposal" via the Change Stage button, a "Deal Stage Changed" timeline entry is created on the associated client recording the old stage "Discovery" and new stage "Proposal", attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Change Stage triggers follower notifications**
Given the user changes the deal stage on a deal whose associated client has followers, email notifications are sent to followers who have "deal stage changed" notifications enabled (excluding the actor who changed the stage).

**Editing value creates a timeline entry on the client**
Given the user edits the deal value from "$250,000" to "$300,000" and saves, a timeline entry is created on the associated client recording the value change, attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

#### DealStagePipeline

**Pipeline displays all six stage labels in order**
Given the user is on a deal detail page, the DealStagePipeline displays six stage labels in this order from left to right: Lead, Qualification, Discovery, Proposal, Negotiation, Closed Won.

**Current stage is labeled with "(Current)" suffix**
Given a deal is at stage "Discovery", the DealStagePipeline shows the label "Discovery (Current)" for that stage, distinguishing it from the other stages which show only their name.

**Completed stages display filled checkmark icons**
Given a deal is at stage "Discovery", the stages that have been passed through (Lead, Qualification) display filled/blue checkmark icons indicating they are completed stages.

**Current stage displays filled checkmark icon**
Given a deal is at stage "Discovery", the current stage (Discovery) also displays a filled/blue checkmark icon, matching the styling of completed stages.

**Future stages display unfilled/gray checkmark icons**
Given a deal is at stage "Discovery", the stages that have not yet been reached (Proposal, Negotiation, Closed Won) display unfilled/gray checkmark icons indicating they are future stages.

**Progress bar shows colored segments for completed and current stages**
Given a deal is at stage "Discovery" (the third of six stages), the progress bar below the stage labels is filled/colored for the first three segments (Lead, Qualification, Discovery) and unfilled/gray for the remaining three segments (Proposal, Negotiation, Closed Won).

**Pipeline updates when stage is changed**
Given the user changes the deal stage from "Discovery" to "Proposal" via the Change Stage button in the header, the DealStagePipeline updates: "Proposal" now shows "(Current)" with a filled checkmark, "Discovery" loses the "(Current)" label but retains its filled checkmark, and the progress bar extends to cover the Proposal segment.

**Pipeline reflects Closed Won as final stage**
Given a deal is at stage "Closed Won", all six stage labels show filled/blue checkmark icons, the progress bar is fully filled, and "Closed Won" displays the "(Current)" suffix.

**Pipeline reflects Lead as initial stage**
Given a deal is at stage "Lead", only the Lead stage shows a filled checkmark with "(Current)" suffix, the remaining five stages show unfilled/gray checkmarks, and the progress bar fills only the first segment.

#### DealHistorySection

**Section displays "Deal History" title**
Given the user is on a deal detail page, the Deal History section displays the heading "Deal History".

**Stage change entries display date, time, old stage, new stage, and user**
Given a deal has a stage change history entry where on Oct 25, 2023 at 2:30 PM the stage changed from "Qualification" to "Discovery" by "Sarah Lee", the entry displays "Oct 25, 2023, 2:30 PM: Changed Stage from Qualification to Discovery (Sarah Lee)" showing the full date/time, old stage, new stage, and the user who made the change in parentheses.

**Multiple history entries are displayed in reverse chronological order**
Given a deal has two stage changes — "Qualification to Discovery on Oct 25, 2023" and "Lead to Qualification on Oct 18, 2023" — the entries are displayed with the most recent change (Oct 25) at the top and the older change (Oct 18) below it.

**New stage change appears in history after Change Stage action**
Given the user changes the deal stage from "Discovery" to "Proposal" via the Change Stage button, a new entry immediately appears at the top of the Deal History section showing the date/time, "Changed Stage from Discovery to Proposal", and the current user's name (or "System" if unauthenticated).

**History entries attribute changes to the correct user**
Given user "Sarah Lee" changes the deal stage from "Qualification" to "Discovery", the history entry shows "(Sarah Lee)" as the user who made the change. When no user is authenticated, the entry shows "(System)".

**Empty state when no stage changes exist**
Given a newly created deal with no stage change history, the Deal History section displays an empty state message (e.g., "No stage changes yet").

#### DealMetricsSection

**Section displays "Deal Metrics" title**
Given the user is on a deal detail page, the Deal Metrics section displays the heading "Deal Metrics".

**Probability displays as percentage**
Given a deal has a probability of 40%, the Deal Metrics section displays "Probability: 40%" showing the win probability as a percentage value.

**Expected Close displays formatted date**
Given a deal has an expected close date of December 15, 2023, the Deal Metrics section displays "Expected Close: Dec 15, 2023" showing the expected close date in a readable format.

**Probability and Expected Close are editable**
Given the user is on a deal detail page, when they click on the Probability value or Expected Close date, they can edit the values inline. Changing the probability from "40%" to "60%" and saving persists the change to the database and updates the display.

**Editing metrics creates a timeline entry on the client**
Given the user edits the deal probability from "40%" to "60%" and saves, a timeline entry is created on the associated client recording the metrics change, attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created per save action.

**Probability displays "N/A" when not set**
Given a deal has no probability set, the Deal Metrics section displays "Probability: N/A" or "Probability: —".

**Expected Close displays "N/A" when not set**
Given a deal has no expected close date set, the Deal Metrics section displays "Expected Close: N/A" or "Expected Close: —".

#### WriteupsSection

**Section displays "Writeups" title**
Given the user is on a deal detail page, the Writeups section displays the heading "Writeups".

**New Entry button is visible with plus icon**
Given the user is on a deal detail page, the Writeups section displays a "+ New Entry" button with a plus icon in the top-right corner of the section header.

**Writeup entries display title in bold**
Given a writeup entry titled "Strategy Update", the entry displays "Strategy Update" in bold text as the entry heading.

**Writeup entries display date and author**
Given a writeup entry created on Oct 20 by "Sarah Lee", the entry displays "- Oct 20 (Sarah Lee)" after the title, showing the creation date and author name in parentheses.

**Writeup entries display content text**
Given a writeup entry with content "Emphasizing our cloud integration capabilities. Client seems receptive...", the entry displays the content text below the title/date/author line.

**Multiple writeup entries are displayed as separate cards**
Given a deal has two writeup entries ("Strategy Update" by Sarah Lee and "Needs Analysis" by John Doe), both are displayed as separate cards/entries in the Writeups section with their respective titles, dates, authors, and content.

**Edit button is visible on each writeup entry with pencil icon**
Given a writeup entry is displayed, an "Edit" button with a pencil icon is visible at the bottom-left of the entry card.

**Clicking Edit opens edit mode for the writeup**
Given the user clicks the "Edit" button on a writeup entry, an edit modal or inline editor opens allowing the user to modify the writeup title and content text.

**Saving edited writeup persists changes**
Given the edit mode is open for a writeup and the user changes the content from "Emphasizing our cloud integration capabilities." to "Updated strategy focuses on API integrations.", when they save, the writeup content updates to reflect the new text and the changes are persisted to the database.

**Editing a writeup creates a new version in version history**
Given the user edits a writeup and saves, a new version is created in the writeup's version history, preserving the previous content. The version history tracks the date, author, and content of each version.

**Version History button is visible on each writeup entry with icon**
Given a writeup entry is displayed, a "Version History" button with an eye/clock icon is visible at the bottom-right of the entry card, next to the Edit button.

**Clicking Version History opens version history view**
Given the user clicks the "Version History" button on a writeup entry, a modal or panel opens showing a chronological list of all versions of that writeup, each displaying the date, author, and content of that version.

**New Entry button opens create writeup form**
Given the user clicks the "+ New Entry" button, a modal or inline form opens with fields for the writeup title and content text.

**Submitting new writeup creates entry associated with the deal**
Given the create writeup form is open and the user enters title "Competitive Analysis" and content "Key differentiators include...", when they click submit, the writeup is created in the database associated with the current deal, the form closes, and the new entry appears in the Writeups section with the title, current date, current user (or "System"), and content.

**Creating a writeup creates a timeline entry on the client**
Given the user creates a new writeup entry, a "Note Added" timeline entry is created on the associated client with the writeup title, attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Creating a writeup triggers follower notifications**
Given the user creates a new writeup on a deal whose associated client has followers, email notifications are sent to followers who have "note added" notifications enabled (excluding the actor).

**Writeup form validates required fields**
Given the create writeup form is open, when the user clicks submit without filling in the title field, a validation error is displayed and the form is not submitted.

**Writeup form cancel closes without saving**
Given the create writeup form is open and the user has entered data, when they click cancel or the close icon, the form closes and no writeup is created.

**Empty state when no writeups exist**
Given a deal has no writeup entries, the Writeups section displays an empty state message (e.g., "No writeups") and the "+ New Entry" button remains available.

#### LinkedTasksSection

**Section displays "Linked Tasks" title**
Given the user is on a deal detail page, the Linked Tasks section displays the heading "Linked Tasks".

**Add Task button is visible with label**
Given the user is on a deal detail page, the Linked Tasks section displays an "Add Task" button in the top-right corner of the section header.

**Uncompleted tasks display unchecked checkbox with title and due date**
Given a task "Prepare Proposal Draft" with due date Oct 30 is linked to the deal and is not completed, it displays as a row with an unchecked checkbox, the title "Prepare Proposal Draft", and the text "(Due: Oct 30)".

**Completed tasks display checked checkbox with title and completion date**
Given a task "Schedule Follow-up Meeting" completed on Oct 22 is linked to the deal, it displays as a row with a checked/crossed checkbox, the title "Schedule Follow-up Meeting", and the text "(Completed: Oct 22)".

**Checking a task checkbox marks it as complete**
Given an uncompleted linked task "Prepare Proposal Draft" with an unchecked checkbox, when the user clicks the checkbox, the task is marked as complete in the database, the checkbox changes to checked, and the due date text changes to show the completion date (e.g., "(Completed: Oct 30)").

**Completing a linked task creates a timeline entry on the client**
Given the user checks a task's checkbox to mark it complete, a "Task Completed" timeline entry is created on the associated client with the task name, attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Completing a linked task triggers follower notifications**
Given the user marks a linked task complete on a deal whose associated client has followers, email notifications are sent to followers who have "task completed" notifications enabled (excluding the actor).

**Clicking a task title navigates to task detail page**
Given a linked task "Prepare Proposal Draft" is displayed, when the user clicks on the task title (not the checkbox), the app navigates to /tasks/:taskId and the TaskDetailPage is displayed for that task.

**Add Task button opens add task form**
Given the user clicks the "Add Task" button, a modal or form opens allowing the user to create a new task linked to the current deal, with fields for title (required), due date, priority, and assignee (FilterSelect dropdown populated from users API).

**Submitting add task creates task linked to the deal and client**
Given the add task form is open and the user enters title "Send final contract", selects due date "Nov 5", and clicks submit, the task is created in the database linked to both the current deal and its associated client, the form closes, and the new task appears in the Linked Tasks section with an unchecked checkbox and due date.

**Task creation creates a timeline entry on the client**
Given the user creates a new linked task via Add Task, a "Task Created" timeline entry is created on the associated client with the task name, attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created.

**Task creation triggers follower notifications**
Given the user creates a new task on a deal whose associated client has followers, email notifications are sent to followers who have "task created" notifications enabled (excluding the actor).

**Add task form validates required fields**
Given the add task form is open, when the user clicks submit without filling in the required title field, a validation error is displayed and the form is not submitted.

**Add task form cancel closes without saving**
Given the add task form is open and the user has entered data, when they click cancel or the close icon, the form closes and no task is created.

**Empty state when no linked tasks exist**
Given a deal has no linked tasks, the Linked Tasks section displays an empty state message (e.g., "No linked tasks") and the "Add Task" button remains available.

#### DealAttachmentsSection

**Section displays "Attachments" title**
Given the user is on a deal detail page, the Attachments section displays the heading "Attachments".

**Upload icon is visible in section header**
Given the user is on a deal detail page, the Attachments section displays a cloud upload icon button in the top-right corner of the section header for adding new attachments.

**Clicking upload icon opens attachment upload modal**
Given the user clicks the upload icon in the Attachments section header, a file upload modal opens with a file picker (browse button and/or drag-and-drop area) for selecting a file to upload and associate with the deal.

**Attachment entries display filename**
Given an attachment named "Acme_Requirements.pdf", the entry displays "Acme_Requirements.pdf" as the filename text.

**Attachment entries display file size**
Given an attachment "Acme_Requirements.pdf" with size 2.4 MB, the entry displays "(2.4 MB)" next to the filename, showing the file size in a human-readable format.

**Multiple attachments are displayed as separate rows**
Given a deal has two attachments ("Acme_Requirements.pdf" at 2.4 MB and "Meeting_Notes_Oct18.docx" at 50 KB), both are displayed as separate rows in the Attachments section with their respective filenames and sizes.

**Download link is visible on each attachment**
Given an attachment "Acme_Requirements.pdf" is displayed, a "Download" link/button is visible in the row. When clicked, the file is downloaded to the user's device.

**Delete link is visible on each attachment**
Given an attachment "Acme_Requirements.pdf" is displayed, a "Delete" link/button is visible in the row, separated from the Download link by a pipe character ("|").

**Clicking Delete removes attachment after confirmation**
Given the user clicks the "Delete" link on an attachment, a confirmation dialog appears. When the user confirms, the attachment is deleted from the database and removed from the list. If the user cancels, the attachment remains.

**Uploading a file creates a new attachment entry**
Given the upload modal is open and the user selects a file "Proposal_v2.pdf" (1.2 MB) and submits, the file is uploaded, the attachment is created in the database associated with the current deal, the modal closes, and the new attachment appears in the Attachments section showing "Proposal_v2.pdf (1.2 MB)" with Download and Delete links.

**Uploaded attachment is also visible in the client's attachments section**
Given the user uploads an attachment to a deal associated with "Acme Corp", the attachment also appears in the Attachments section of the Acme Corp client detail page, showing the linked deal name.

**Empty state when no attachments exist**
Given a deal has no attachments, the Attachments section displays an empty state message (e.g., "No attachments") and the upload icon button remains available.

#### ContactsIndividualsSection

**Section displays "Contacts/Individuals" title**
Given the user is on a deal detail page, the Contacts/Individuals section displays the heading "Contacts/Individuals".

**Contact entries display avatar**
Given a contact "Jane Smith" is associated with the deal, the entry displays an avatar (photo or initials fallback) on the left side of the row.

**Contact entries display name in bold**
Given a contact "Jane Smith" is associated with the deal, the entry displays "Jane Smith" in bold text next to the avatar.

**Contact entries display role and organization in parentheses**
Given a contact "Jane Smith" with role "Decision Maker" at "Acme Corp", the entry displays "(Decision Maker, Acme Corp)" after the name, showing both the individual's role in the deal and their organization.

**Contact entries display "View Profile" link**
Given a contact "Jane Smith" is associated with the deal, the entry displays a "View Profile" link at the end of the row.

**Clicking "View Profile" navigates to person detail page**
Given a contact "Jane Smith" is displayed with a "View Profile" link, when the user clicks "View Profile", the app navigates to /individuals/:individualId for Jane Smith and the PersonDetailPage is displayed.

**Multiple contacts are displayed as separate rows**
Given a deal has two associated contacts ("Jane Smith - Decision Maker, Acme Corp" and "Bob Johnson - Influencer, Acme Corp"), both are displayed as separate rows with their respective avatars, names, roles, organizations, and View Profile links.

**Empty state when no contacts are associated**
Given a deal has no associated contacts/individuals, the Contacts/Individuals section displays an empty state message (e.g., "No contacts associated").

---

## TasksListPage (/tasks)

### Components: TasksListHeader, TasksFilter, TaskCardList, CreateTaskModal, ImportDialog

#### TasksListHeader

**Page title displays "Upcoming Tasks"**
Given the user navigates to /tasks, the page displays the heading "Upcoming Tasks" at the top left of the content area.

**Import button is visible with icon and label**
Given the user is on /tasks, the header area displays an "Import" button with a download/import icon and the text "Import".

**Import button opens ImportDialog**
Given the user is on /tasks, when they click the "Import" button, an ImportDialog modal opens for importing tasks from CSV.

**Export button is visible with icon and label**
Given the user is on /tasks, the header area displays an "Export" button with an export icon and the text "Export".

**Export button triggers CSV download**
Given the user is on /tasks, when they click the "Export" button, a CSV file containing the current tasks data is downloaded. The file includes columns matching the task data fields (Title, Description, Due Date, Priority, Status, Client, Assignee).

**New Task button is visible with primary styling**
Given the user is on /tasks, the header area displays a primary-styled (blue) "New Task" button at the top right of the content area.

**New Task button opens CreateTaskModal**
Given the user is on /tasks, when they click the "New Task" button, the CreateTaskModal dialog opens with a form to create a new task.

#### TasksFilter

**Filter control is visible with filter icon, chevron, and search input**
Given the user is on /tasks, a filter control is displayed with a filter icon, a dropdown chevron, and a text input with placeholder text "Filter...".

**Filter dropdown opens on chevron click**
Given the user is on /tasks, when they click the filter dropdown chevron, a dropdown menu appears with filter category options (e.g., Priority, Status, Assignee, Client).

**Filter search input filters tasks by title text**
Given the user is on /tasks with multiple task cards displayed, when the user types text into the "Filter..." search input, the task cards filter to show only tasks whose title contains the typed text. The filtering applies with debounced input.

**Filter by priority High shows only High priority tasks**
Given the user is on /tasks, when they open the filter dropdown and select "High" priority, only task cards with the "High" priority badge are displayed.

**Filter by priority Medium shows only Medium priority tasks**
Given the user is on /tasks, when they open the filter dropdown and select "Medium" priority, only task cards with the "Medium" priority badge are displayed.

**Filter by priority Low shows only Low priority tasks**
Given the user is on /tasks, when they open the filter dropdown and select "Low" priority, only task cards with the "Low" priority badge are displayed.

**Filter by priority Normal shows only Normal priority tasks**
Given the user is on /tasks, when they open the filter dropdown and select "Normal" priority, only task cards with the "Normal" priority badge are displayed.

**Filter search input within dropdown filters available options**
Given the user is on /tasks and the filter dropdown is open with many options, when the user types in the searchable search input at the top of the dropdown, the options filter as they type, and "No matches" is shown when nothing matches.

**Filter clears when search input is cleared**
Given the user has typed a filter term and the task cards are filtered, when the user clears the search input, all task cards are displayed again (subject to any active dropdown filter).

**Filter resets to show all tasks**
Given the user has selected a filter from the dropdown, when they select "All" or clear all filter criteria, all task cards are displayed again.

**Multiple filters combine together**
Given the user is on /tasks, when they select a priority filter from the dropdown and type text in the search input, only task cards matching both the priority filter and the search text are displayed (AND logic).

#### TaskCardList

**Task cards display priority badge with color coding**
Given the user is on /tasks with tasks of various priorities, each task card displays a priority badge: "High" with a red/orange background, "Medium" with a yellow background, "Low" with a green background, and "Normal" with a blue background.

**Task cards display task title**
Given the user is on /tasks, each task card displays the task's title text prominently (e.g., "Finalize Q3 Marketing Plan", "Review Client Proposal Draft").

**Task cards display due date**
Given the user is on /tasks, each task card displays the due date in the format "Due: <date>" (e.g., "Due: Today, 5:00 PM", "Due: Tomorrow, 10:00 AM", "Due: Oct 25, 2024").

**Task cards display assignee avatar and name with role**
Given the user is on /tasks, each task card displays the assignee's avatar image (or initials fallback) and their name followed by role in parentheses (e.g., "Sarah J. (PM)", "David L. (Sales)", "Emily C. (Dev)", "Mark R. (Lead)").

**Task cards display actions menu button**
Given the user is on /tasks, each task card has a three-dot actions menu button ("...") on the right side.

**Actions menu opens on click with task action options**
Given the user is on /tasks, when they click the three-dot actions menu ("...") on a task card, a dropdown menu appears with action options including Edit, Mark Complete, Cancel, and Delete.

**Actions menu Mark Complete marks task as completed**
Given the user is on /tasks, when they click the "..." menu on a task card and select "Mark Complete", the task is marked as completed via the API, the task card is removed from the upcoming tasks list (since it is no longer upcoming), and a "Task Completed" timeline entry is created on the associated client attributed to the current user. Exactly one timeline entry is created — not duplicates from re-renders.

**Actions menu Cancel marks task as canceled**
Given the user is on /tasks, when they click the "..." menu on a task card and select "Cancel", the task is marked as canceled via the API, and the task card is removed from the upcoming tasks list.

**Actions menu Delete removes the task**
Given the user is on /tasks, when they click the "..." menu on a task card and select "Delete", a confirmation prompt appears. Upon confirmation, the task is deleted from the database and the task card is removed from the list.

**Clicking a task card navigates to TaskDetailPage**
Given the user is on /tasks, when they click on a task card (anywhere except the actions menu), the app navigates to /tasks/:taskId for that task and the TaskDetailPage is displayed.

**Task cards are ordered by due date (soonest first)**
Given the user is on /tasks with multiple tasks, the task cards are ordered by due date with the soonest-due tasks appearing first.

**Task list displays empty state when no tasks exist**
Given the user is on /tasks with no upcoming tasks in the system, the page displays an empty state message (e.g., "No tasks found") encouraging the user to create a new task.

**Task list displays empty state when filter matches nothing**
Given the user is on /tasks and applies a filter that matches no tasks, the task card list displays an empty state message indicating no tasks were found matching the filter criteria.

**New task appears in list after creation**
Given the user is on /tasks and creates a new task via the CreateTaskModal, when the modal closes, the newly created task card appears in the list without requiring a page refresh.

**Completed or canceled tasks are not shown in the list**
Given the user is on /tasks, only tasks with an open/pending status are displayed. Tasks that have been marked complete or canceled do not appear in the upcoming tasks list.

#### CreateTaskModal

**Modal opens when New Task is clicked**
Given the user is on /tasks, when they click "New Task", a modal dialog appears with a form title (e.g., "Create Task" or "New Task").

**Modal contains title input field (required)**
Given the CreateTaskModal is open, the form contains a "Title" text input field that is required.

**Modal contains description text area**
Given the CreateTaskModal is open, the form contains a "Description" text area field for entering task details. This field is optional.

**Modal contains due date picker**
Given the CreateTaskModal is open, the form contains a "Due Date" date picker field for selecting when the task is due.

**Modal contains priority dropdown with four options**
Given the CreateTaskModal is open, the form contains a "Priority" dropdown with options: High, Medium, Low, Normal.

**Modal contains client dropdown populated from clients API**
Given the CreateTaskModal is open, the form contains a "Client" FilterSelect dropdown populated with existing clients from the API, with searchable functionality. It is not a free-form text field.

**Modal contains assignee dropdown populated from users API**
Given the CreateTaskModal is open, the form contains an "Assignee" FilterSelect dropdown populated with team members from the users API, with searchable functionality. It is not a free-form text field.

**Modal contains deal dropdown (optional, filtered by selected client)**
Given the CreateTaskModal is open, the form contains a "Deal" FilterSelect dropdown that is optional. When a client is selected, the dropdown is populated with deals associated with that client. If no client is selected, the deal dropdown is empty or disabled.

**Deal dropdown updates when client selection changes**
Given the CreateTaskModal is open and a client is selected with associated deals populating the deal dropdown, when the user changes the client selection to a different client, the deal dropdown updates to show deals for the newly selected client and clears any previously selected deal.

**Submit creates a new task**
Given the CreateTaskModal is open and the user fills in title "Follow up on proposal", enters a description, selects priority "High", picks a due date, selects client "Acme Corp", selects an assignee from the users dropdown, and clicks submit, the task is created in the database, the modal closes, and the new task card appears in the task list.

**Task creation generates a timeline entry on the associated client**
Given the user creates a new task via CreateTaskModal associated with a client, a "Task Created" timeline entry is added to the client's TimelineSection attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created — not duplicates from re-renders.

**Task creation triggers follower notifications on the client**
Given the user creates a new task associated with a client that has followers, email notifications are sent to followers who have "task created" notifications enabled (excluding the actor who created the task).

**Modal validates required fields**
Given the CreateTaskModal is open, when the user clicks submit without filling in the required title field, a validation error message is displayed next to the title field and the form is not submitted.

**Modal cancel closes without saving**
Given the CreateTaskModal is open and the user has entered some data, when they click the cancel button or close icon, the modal closes and no new task is created. The entered data is discarded.

#### ImportDialog

**ImportDialog opens when Import button is clicked**
Given the user is on /tasks, when they click the "Import" button, the ImportDialog modal opens.

**ImportDialog displays CSV format specification table**
Given the ImportDialog is open for tasks, it shows a table of expected CSV columns: Title (required), Description (optional), Due Date (optional — date format YYYY-MM-DD), Priority (optional — High, Medium, Low, or Normal), Client Name (optional — must match an existing client), Assignee (optional — team member name). Each column shows whether it is required or optional and describes valid values.

**ImportDialog has Download CSV template button**
Given the ImportDialog is open, a "Download CSV template" button is visible. When clicked, it downloads a CSV file with the correct column headers pre-filled and no data rows, serving as a template for the user.

**ImportDialog has file upload area**
Given the ImportDialog is open, the dialog contains a file picker or drag-and-drop area for selecting a CSV file to upload.

**ImportDialog validates uploaded CSV**
Given the ImportDialog is open, when the user uploads a CSV file with missing required columns (e.g., no Title column), the dialog displays validation error messages indicating which required columns are missing.

**ImportDialog shows per-row validation errors**
Given the ImportDialog is open, when the user uploads a CSV file where some rows have invalid data (e.g., missing Title or an unrecognized Priority value), the dialog displays per-row error messages indicating which rows failed and why, allowing the user to fix the file and re-upload.

**ImportDialog successfully imports valid CSV**
Given the ImportDialog is open and the user uploads a valid CSV file with properly formatted task data, the import processes successfully, the dialog shows a success message with the count of imported tasks, and the task list updates to include the newly imported tasks.

**ImportDialog cancel closes without importing**
Given the ImportDialog is open, when the user clicks the cancel button or close icon, the dialog closes and no data is imported.

---

## TaskDetailPage (/tasks/:taskId)

### Components: TaskDetailHeader, TaskNotesSection, TaskActions

#### TaskDetailHeader

**Page heading displays task title**
Given the user navigates to /tasks/:taskId for a task titled "Finalize Q3 Marketing Plan", the page displays the heading "Finalize Q3 Marketing Plan" at the top of the content area.

**Priority badge displays with correct color coding**
Given the user is viewing a task with priority "High", a priority badge is displayed near the title showing "High" with a red/orange background. For "Medium" priority the badge has a yellow background, for "Low" a green background, and for "Normal" a blue background — matching the color scheme used on TasksListPage task cards.

**Status displays current task status**
Given the user is viewing a task with status "Open", the header displays the current status as "Open". If the task has been marked complete, the status displays "Completed". If canceled, the status displays "Canceled".

**Due date displays formatted date**
Given the user is viewing a task with a due date of October 25, 2024 at 5:00 PM, the header displays the due date in a readable format (e.g., "Due: Oct 25, 2024, 5:00 PM"). If no due date is set, a placeholder such as "No due date" is shown.

**Assignee displays user name**
Given the user is viewing a task assigned to "Sarah J.", the header displays the assignee's name (e.g., "Assignee: Sarah J."). The assignee is shown as a FilterSelect dropdown populated from the users API, allowing the assignee to be changed.

**Changing assignee persists the update**
Given the user is viewing a task assigned to "Sarah J.", when they open the Assignee dropdown and select "David L.", the task's assignee is updated in the database and the header reflects "David L." as the new assignee.

**Associated client link displays client name**
Given the user is viewing a task associated with client "Acme Corp", the header displays a "Client:" label followed by the client name "Acme Corp" as a clickable link.

**Clicking associated client link navigates to ClientDetailPage**
Given the user is viewing a task associated with client "Acme Corp", when they click on the client name link, the app navigates to /clients/:clientId for that client and the ClientDetailPage is displayed.

**Associated client displays "None" when no client is linked**
Given the user is viewing a task that is not associated with any client, the Client field displays "None" or "—" indicating no client association.

**Associated deal link displays deal name**
Given the user is viewing a task associated with deal "Expansion Deal", the header displays a "Deal:" label followed by the deal name "Expansion Deal" as a clickable link.

**Clicking associated deal link navigates to DealDetailPage**
Given the user is viewing a task associated with deal "Expansion Deal", when they click on the deal name link, the app navigates to /deals/:dealId for that deal and the DealDetailPage is displayed.

**Associated deal displays "None" when no deal is linked**
Given the user is viewing a task that is not associated with any deal, the Deal field displays "None" or "—" indicating no deal association.

**Description displays task description text**
Given the user is viewing a task with a description "Review the proposal draft and provide feedback by end of week", the header or detail area displays the description text below the title.

#### TaskNotesSection

**Section displays "Notes" title**
Given the user is on a task detail page, the Notes section displays the heading "Notes".

**Notes list displays existing notes in reverse chronological order**
Given a task has three notes added at different times, the notes are displayed in the Notes section with the most recent note at the top and the oldest at the bottom. Each note shows the note text, the author name (or "System" if unauthenticated), and the creation date/time.

**Add note input is visible with placeholder text**
Given the user is on a task detail page, the Notes section contains a text input or text area with placeholder text (e.g., "Add a note...") and a submit button (e.g., "Add Note") for adding new notes.

**Adding a note appends it to the notes list**
Given the user is on a task detail page, when they type "Follow up with client about the proposal" into the note input and click the "Add Note" button, the note is saved to the database via the POST API endpoint, the input is cleared, and the new note immediately appears at the top of the notes list showing the note text, the current user's name (or "System" if unauthenticated), and the current date/time.

**Adding a note with empty text is prevented**
Given the user is on a task detail page, when they click the "Add Note" button without entering any text, the note is not submitted and no API call is made. The input may show a validation hint or the button may be disabled when the input is empty.

**Delete note button is visible on each note**
Given a task has notes displayed in the Notes section, each note entry has a delete button (e.g., a trash icon or "Delete" text) visible to allow removal of the note.

**Clicking delete note removes the note from the list**
Given a task has a note "Follow up with client" displayed, when the user clicks the delete button on that note, the note is deleted from the database via the DELETE API endpoint and the note immediately disappears from the notes list without requiring a page refresh.

**Notes section displays empty state when no notes exist**
Given a task has no notes, the Notes section displays an empty state message (e.g., "No notes yet") below the add note input.

**Adding a note creates a timeline entry on the associated client**
Given the user adds a note to a task that is associated with a client, a "Note Added" timeline entry is created on the associated client attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created — not duplicates from re-renders.

**Adding a note triggers follower notifications on the associated client**
Given the user adds a note to a task associated with a client that has followers, email notifications are sent to followers who have "note added" notifications enabled (excluding the actor who added the note).

#### TaskActions

**Mark Complete button is visible with label and styling**
Given the user is on a task detail page for a task with status "Open", a "Mark Complete" button is displayed with primary/success styling (e.g., green or blue) to indicate it is the positive action.

**Clicking Mark Complete updates task status to Completed**
Given the user is on a task detail page for a task with status "Open", when they click the "Mark Complete" button, the task's status is updated to "Completed" in the database, the status display in the TaskDetailHeader updates to "Completed", and the "Mark Complete" button is disabled or hidden since the task is already completed.

**Mark Complete creates a timeline entry on the associated client**
Given the user marks a task associated with a client as complete, a "Task Completed" timeline entry is created on the associated client attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created — not duplicates from re-renders.

**Mark Complete triggers follower notifications on the associated client**
Given the user marks a task complete on a task whose associated client has followers, email notifications are sent to followers who have "task completed" notifications enabled (excluding the actor who completed the task).

**Cancel button is visible with label and styling**
Given the user is on a task detail page for a task with status "Open", a "Cancel" button is displayed with secondary/destructive styling (e.g., outlined or red-tinted) to indicate it is the negative action.

**Clicking Cancel updates task status to Canceled**
Given the user is on a task detail page for a task with status "Open", when they click the "Cancel" button, the task's status is updated to "Canceled" in the database, the status display in the TaskDetailHeader updates to "Canceled", and both "Mark Complete" and "Cancel" buttons are disabled or hidden since the task is no longer open.

**Cancel creates a timeline entry on the associated client**
Given the user cancels a task associated with a client, a "Task Canceled" timeline entry is created on the associated client attributed to the current user (or "System" if unauthenticated). Exactly one timeline entry is created — not duplicates from re-renders.

**Cancel triggers follower notifications on the associated client**
Given the user cancels a task associated with a client that has followers, email notifications are sent to followers who have "task canceled" notifications enabled (excluding the actor who canceled the task).

**Completed task hides action buttons**
Given the user navigates to /tasks/:taskId for a task that has already been marked "Completed", the "Mark Complete" and "Cancel" buttons are not displayed or are disabled, since the task status can no longer be changed.

**Canceled task hides action buttons**
Given the user navigates to /tasks/:taskId for a task that has already been marked "Canceled", the "Mark Complete" and "Cancel" buttons are not displayed or are disabled, since the task status can no longer be changed.

**Status change persists across page navigation**
Given the user marks a task as "Completed" and then navigates away to /tasks, when they navigate back to /tasks/:taskId for the same task, the status still shows "Completed" and the action buttons remain hidden/disabled, confirming the status change was persisted to the database.

**Completing a task removes it from the TasksListPage upcoming list**
Given the user marks a task as complete from the TaskDetailPage, when they navigate to /tasks, the completed task no longer appears in the upcoming tasks list (since TasksListPage only shows open/pending tasks).

**Canceling a task removes it from the TasksListPage upcoming list**
Given the user cancels a task from the TaskDetailPage, when they navigate to /tasks, the canceled task no longer appears in the upcoming tasks list (since TasksListPage only shows open/pending tasks).

---

## ContactsListPage (/contacts)

### Components: ContactsListHeader, ContactsSearch, ContactsTable, ContactsPagination, AddContactModal, ImportDialog

#### ContactsListHeader

**Page title displays "Contacts"**
Given the user navigates to /contacts, the page displays the heading "Contacts" at the top left of the content area.

**Import button is visible with icon and label**
Given the user is on /contacts, the header area displays an "Import" button with a download/import icon and the text "Import".

**Import button opens ImportDialog**
Given the user is on /contacts, when they click the "Import" button, an ImportDialog modal opens for importing contacts from CSV.

**Export CSV button is visible with icon and label**
Given the user is on /contacts, the header area displays an "Export CSV" button with an export icon and the text "Export CSV".

**Export CSV button triggers CSV download**
Given the user is on /contacts, when they click the "Export CSV" button, a CSV file containing the current contacts data is downloaded. The file includes columns matching the contact data fields (Name, Title, Email, Phone, Location, Client Name).

**Add Contact button is visible with plus icon**
Given the user is on /contacts, the header area displays a primary-styled "+ Add Contact" button with a plus icon and the text "Add Contact".

**Add Contact button opens AddContactModal**
Given the user is on /contacts, when they click the "+ Add Contact" button, the AddContactModal dialog opens with a form to create a new contact.

#### ContactsSearch

**Search input is visible with placeholder text**
Given the user is on /contacts, a search input is displayed with placeholder text indicating search capability (e.g., "Search contacts...") and a search icon.

**Search filters contacts by name**
Given the user is on /contacts with multiple contacts displayed, when the user types "Sarah" into the search bar, the table filters to show only contacts whose name contains "Sarah". The filtering applies with debounced input.

**Search filters contacts by email**
Given the user is on /contacts, when the user types "sarah@" into the search bar, the table filters to show only contacts whose email contains "sarah@". The filtering applies with debounced input.

**Search filters contacts by title**
Given the user is on /contacts, when the user types "CEO" into the search bar, the table filters to show only contacts whose title contains "CEO". The filtering applies with debounced input.

**Search filters contacts by phone**
Given the user is on /contacts, when the user types "555" into the search bar, the table filters to show only contacts whose phone number contains "555". The filtering applies with debounced input.

**Search filters contacts by location**
Given the user is on /contacts, when the user types "New York" into the search bar, the table filters to show only contacts whose location contains "New York". The filtering applies with debounced input.

**Search uses debounced input**
Given the user is on /contacts, when the user types rapidly into the search bar, the table does not re-filter on every keystroke. Instead, the filtering is debounced so it only triggers after a short delay once the user stops typing.

**Search clears results when input is cleared**
Given the user has typed a search term and the table is filtered, when the user clears the search input, all contacts are displayed again (unfiltered).

#### ContactsTable

**Table displays correct column headers**
Given the user is on /contacts, the contacts table displays column headers in this order: Name, Title, Email, Phone, Location, Associated Clients.

**Name column displays contact names**
Given the user is on /contacts with contact data, each row shows the contact's full name in the Name column.

**Title column displays contact titles**
Given the user is on /contacts, each row shows the contact's job title in the Title column (e.g., "CEO", "CTO", "VP of Sales"). If a contact has no title, the cell is empty.

**Email column displays contact emails**
Given the user is on /contacts, each row shows the contact's email address in the Email column. If a contact has no email, the cell is empty.

**Phone column displays contact phone numbers**
Given the user is on /contacts, each row shows the contact's phone number in the Phone column. If a contact has no phone, the cell is empty.

**Location column displays contact locations**
Given the user is on /contacts, each row shows the contact's location in the Location column (e.g., "New York, NY", "San Francisco, CA"). If a contact has no location, the cell is empty.

**Associated Clients column displays linked client names**
Given the user is on /contacts, each row shows the names of clients the contact is associated with in the Associated Clients column. If a contact is associated with multiple clients, all client names are displayed. If a contact has no associated clients, the cell is empty.

**Row click navigates to PersonDetailPage**
Given the user is on /contacts, when they click on a contact row, the app navigates to /individuals/:id for that contact and the PersonDetailPage is displayed.

**Table displays empty state when no contacts match search**
Given the user is on /contacts and types a search term that matches no contacts, the table displays an empty state message indicating no contacts were found.

**New contact appears in table after creation**
Given the user is on /contacts and creates a new contact via the AddContactModal, when the modal closes, the newly created contact appears in the table without requiring a page refresh.

#### ContactsPagination

**Pagination shows current range and total count**
Given the user is on /contacts with more than 50 contacts, the pagination area displays text like "Showing 1-50 of N contacts" indicating the current range and total count.

**Page number buttons are displayed**
Given the user is on /contacts with multiple pages of contacts (more than 50), numbered page buttons (1, 2, 3, ...) are displayed in the pagination area, with the current page highlighted.

**Clicking a page number navigates to that page**
Given the user is on /contacts viewing page 1, when they click page number "2", the table updates to show the next set of contacts (e.g., rows 51-100) and the page 2 button becomes highlighted.

**Previous button is disabled on first page**
Given the user is on /contacts viewing page 1, the "Previous" button is disabled or visually inactive, indicating there is no previous page.

**Previous button navigates to the prior page**
Given the user is on /contacts viewing page 2, when they click "Previous", the table updates to show page 1 data and the page 1 button becomes highlighted.

**Next button navigates to the next page**
Given the user is on /contacts viewing page 1 with multiple pages, when they click "Next", the table updates to show page 2 data and the page 2 button becomes highlighted.

**Next button is disabled on last page**
Given the user is on /contacts viewing the last page, the "Next" button is disabled or visually inactive, indicating there is no next page.

**Pagination resets to page 1 when search filter changes**
Given the user is on /contacts viewing page 2, when they type a new search term in the search bar, the pagination resets to page 1 and the table shows the first page of filtered results.

**50 contacts per page**
Given the user is on /contacts with more than 50 contacts and no search filter applied, the table displays exactly 50 contacts on page 1, and the remaining contacts on subsequent pages.

#### AddContactModal

**Modal opens when Add Contact is clicked**
Given the user is on /contacts, when they click "+ Add Contact", a modal dialog appears with a form title (e.g., "Add Contact").

**Modal contains name input field**
Given the AddContactModal is open, the form contains a "Name" text input field that is required.

**Modal contains title input field**
Given the AddContactModal is open, the form contains a "Title" text input field for the contact's job title.

**Modal contains email input field**
Given the AddContactModal is open, the form contains an "Email" text input field for the contact's email address.

**Modal contains phone input field**
Given the AddContactModal is open, the form contains a "Phone" text input field for the contact's phone number.

**Modal contains location input field**
Given the AddContactModal is open, the form contains a "Location" text input field for the contact's location.

**Modal contains client association field**
Given the AddContactModal is open, the form contains a client selector or input field that allows optionally associating the new contact with an existing client by name.

**Modal submit creates a new contact**
Given the AddContactModal is open and the user fills in the required name field and optionally other fields, when they click the submit/save button, the modal closes, the new contact is created in the database, and the contact appears in the contacts table.

**Modal validates required fields**
Given the AddContactModal is open, when the user clicks the submit button without filling in the required Name field, a validation error message is displayed and the form is not submitted.

**Modal cancel closes without saving**
Given the AddContactModal is open and the user has entered some data, when they click the cancel button or close icon, the modal closes and no new contact is created.

**Created contact appears in table with correct data**
Given the user creates a new contact via AddContactModal with name "John Smith", title "VP Sales", email "john@example.com", phone "555-1234", and location "Chicago, IL", after the modal closes the contacts table includes a row for "John Smith" with the correct title, email, phone, and location.

**Created contact with client association shows associated client**
Given the user creates a new contact via AddContactModal with name "Jane Doe" and associates it with client "Acme Corp", after the modal closes the contacts table includes a row for "Jane Doe" with "Acme Corp" displayed in the Associated Clients column.

#### ImportDialog

**ImportDialog opens when Import button is clicked**
Given the user is on /contacts, when they click the "Import" button, the ImportDialog modal opens.

**ImportDialog displays CSV format specification table**
Given the ImportDialog is open for contacts, it shows a table of expected CSV columns: Name (required), Title (optional), Email (optional), Phone (optional), Location (optional), Client Name (optional — associates the contact with an existing client by name). Each column shows whether it is required or optional and describes valid values.

**ImportDialog has Download CSV template button**
Given the ImportDialog is open, a "Download CSV template" button is visible. When clicked, it downloads a CSV file with the correct column headers pre-filled (Name, Title, Email, Phone, Location, Client Name) and no data rows, serving as a template for the user.

**ImportDialog has file upload area**
Given the ImportDialog is open, the dialog contains a file picker or drag-and-drop area for selecting a CSV file to upload.

**ImportDialog validates uploaded CSV**
Given the ImportDialog is open, when the user uploads a CSV file with missing required columns (e.g., no Name column), the dialog displays validation error messages indicating which required columns are missing.

**ImportDialog shows per-row validation errors**
Given the ImportDialog is open, when the user uploads a CSV file where some rows have invalid data (e.g., missing Name or a Client Name that does not match any existing client), the dialog displays per-row error messages indicating which rows failed and why, allowing the user to fix the file and re-upload.

**ImportDialog successfully imports valid CSV**
Given the ImportDialog is open and the user uploads a valid CSV file with properly formatted contact data (including optional Client Name values matching existing clients), the import processes successfully, the dialog shows a success message with the count of imported contacts, and the contacts table updates to include the newly imported contacts.

**ImportDialog cancel closes without importing**
Given the ImportDialog is open, when the user clicks the cancel button or close icon, the dialog closes and no data is imported.

---

## SettingsPage (/settings)

### Components: EmailNotificationsSection, ImportExportSection, WebhooksSection, WebhookModal

**Page title displays "Settings"**
Given the user navigates to /settings, the page displays the heading "Settings" at the top of the content area.

**Page displays three sections**
Given the user navigates to /settings, the page displays three distinct sections: Email Notifications, Import & Export, and Webhooks, each with a visible section heading.

#### EmailNotificationsSection

**Section is hidden when not authenticated**
Given the user is not logged in, when they navigate to /settings, the Email Notifications section is not visible on the page. The Import & Export and Webhooks sections are still displayed.

**Section is visible when authenticated**
Given the user is logged in, when they navigate to /settings, the Email Notifications section is visible with the heading "Email Notifications" and a description indicating these are email alert preferences for followed clients.

**All seven toggle preferences are displayed**
Given the user is logged in and on /settings, the Email Notifications section displays exactly seven labeled toggles: "Client Updated", "Deal Created", "Deal Stage Changed", "Task Created", "Task Completed", "Contact Added", and "Note Added".

**All toggles default to enabled**
Given the user is logged in and navigates to /settings for the first time (no prior preference changes), all seven notification toggles are in the enabled/on state.

**Toggle Client Updated preference off**
Given the user is logged in and on /settings with all toggles enabled, when they click the "Client Updated" toggle, it switches to the disabled/off state. The preference is persisted via the /.netlify/functions/notification-preferences API, and when the user refreshes the page, the "Client Updated" toggle remains off while the other six remain on.

**Toggle Deal Created preference off**
Given the user is logged in and on /settings with all toggles enabled, when they click the "Deal Created" toggle, it switches to the disabled/off state. The preference is persisted and survives a page refresh.

**Toggle Deal Stage Changed preference off**
Given the user is logged in and on /settings with all toggles enabled, when they click the "Deal Stage Changed" toggle, it switches to the disabled/off state. The preference is persisted and survives a page refresh.

**Toggle Task Created preference off**
Given the user is logged in and on /settings with all toggles enabled, when they click the "Task Created" toggle, it switches to the disabled/off state. The preference is persisted and survives a page refresh.

**Toggle Task Completed preference off**
Given the user is logged in and on /settings with all toggles enabled, when they click the "Task Completed" toggle, it switches to the disabled/off state. The preference is persisted and survives a page refresh.

**Toggle Contact Added preference off**
Given the user is logged in and on /settings with all toggles enabled, when they click the "Contact Added" toggle, it switches to the disabled/off state. The preference is persisted and survives a page refresh.

**Toggle Note Added preference off**
Given the user is logged in and on /settings with all toggles enabled, when they click the "Note Added" toggle, it switches to the disabled/off state. The preference is persisted and survives a page refresh.

**Toggle preference back on after disabling**
Given the user is logged in and on /settings and has previously disabled the "Deal Created" toggle, when they click the "Deal Created" toggle again, it switches back to the enabled/on state. The preference is persisted and survives a page refresh.

**Multiple toggles can be independently configured**
Given the user is logged in and on /settings, when they disable "Client Updated" and "Task Completed" while leaving the other five enabled, then refresh the page, only "Client Updated" and "Task Completed" are off and the other five remain on. Each toggle operates independently.

**Preferences load from API on page visit**
Given the user is logged in and has previously saved preferences (e.g., "Deal Stage Changed" off), when they navigate to /settings, the toggles reflect the saved state from the /.netlify/functions/notification-preferences API — "Deal Stage Changed" is off and all others are on.

#### ImportExportSection

**Section heading displays "Import & Export"**
Given the user navigates to /settings, the Import & Export section is visible with the heading "Import & Export".

**Import Clients button is displayed**
Given the user is on /settings, the Import & Export section displays an "Import Clients" button.

**Import Clients button opens ImportDialog for clients**
Given the user is on /settings, when they click the "Import Clients" button, the ImportDialog modal opens configured for importing clients from CSV. The dialog displays the client CSV format specification table with columns: Name, Type, Status, Tags, Source Type, Source Detail, Campaign, Channel, Date Acquired.

**Import Deals button is displayed**
Given the user is on /settings, the Import & Export section displays an "Import Deals" button.

**Import Deals button opens ImportDialog for deals**
Given the user is on /settings, when they click the "Import Deals" button, the ImportDialog modal opens configured for importing deals from CSV. The dialog displays the deals CSV format specification table with columns: Name, Client Name, Value, Stage, Owner, Probability, Expected Close Date, Status.

**Import Tasks button is displayed**
Given the user is on /settings, the Import & Export section displays an "Import Tasks" button.

**Import Tasks button opens ImportDialog for tasks**
Given the user is on /settings, when they click the "Import Tasks" button, the ImportDialog modal opens configured for importing tasks from CSV. The dialog displays the tasks CSV format specification table with columns: Title, Description, Due Date, Priority, Client Name, Assignee.

**Import Contacts button is displayed**
Given the user is on /settings, the Import & Export section displays an "Import Contacts" button.

**Import Contacts button opens ImportDialog for contacts**
Given the user is on /settings, when they click the "Import Contacts" button, the ImportDialog modal opens configured for importing contacts from CSV. The dialog displays the contacts CSV format specification table with columns: Name, Title, Email, Phone, Location, Client Name.

**Export Clients button is displayed**
Given the user is on /settings, the Import & Export section displays an "Export Clients" button.

**Export Clients button triggers CSV download**
Given the user is on /settings, when they click the "Export Clients" button, a CSV file containing all client data is downloaded with columns matching the client data fields (Name, Type, Status, Tags, Source Type, Source Detail, Campaign, Channel, Date Acquired).

**Export Deals button is displayed**
Given the user is on /settings, the Import & Export section displays an "Export Deals" button.

**Export Deals button triggers CSV download**
Given the user is on /settings, when they click the "Export Deals" button, a CSV file containing all deals data is downloaded with columns matching the deal data fields.

**Export Tasks button is displayed**
Given the user is on /settings, the Import & Export section displays an "Export Tasks" button.

**Export Tasks button triggers CSV download**
Given the user is on /settings, when they click the "Export Tasks" button, a CSV file containing all tasks data is downloaded with columns matching the task data fields.

**ImportDialog shows Download CSV template button**
Given an ImportDialog is opened from the Import & Export section (for any entity type), a "Download CSV template" button is visible. When clicked, it downloads a CSV file with the correct column headers for the selected entity type pre-filled and no data rows.

**ImportDialog validates uploaded CSV**
Given an ImportDialog is opened from the Import & Export section, when the user uploads a CSV file with missing required columns, the dialog displays validation error messages indicating which required columns are missing.

**ImportDialog shows per-row validation errors**
Given an ImportDialog is opened from the Import & Export section, when the user uploads a CSV file where some rows have invalid data, the dialog displays per-row error messages indicating which rows failed and why.

**ImportDialog successfully imports valid CSV**
Given an ImportDialog is opened from the Import & Export section, when the user uploads a valid CSV file, the import processes successfully and the dialog shows a success message with the count of imported records.

**ImportDialog cancel closes without importing**
Given an ImportDialog is opened from the Import & Export section, when the user clicks the cancel button or close icon, the dialog closes and no data is imported.

#### WebhooksSection

**Section heading displays "Webhooks"**
Given the user navigates to /settings, the Webhooks section is visible with the heading "Webhooks".

**Empty state when no webhooks configured**
Given the user is on /settings and no webhooks have been created, the Webhooks section displays an empty state message (e.g., "No webhooks configured") and an "Add Webhook" button.

**Add Webhook button is displayed**
Given the user is on /settings, the Webhooks section displays an "Add Webhook" button.

**Add Webhook button opens WebhookModal**
Given the user is on /settings, when they click the "Add Webhook" button, the WebhookModal dialog opens in create mode with empty fields.

**Webhook list displays webhook entries**
Given the user is on /settings and one or more webhooks have been created, the Webhooks section displays a list of webhook entries. Each entry shows the webhook name, URL, subscribed events, an enable/disable toggle, and a delete button.

**Webhook entry displays name**
Given the user is on /settings with existing webhooks, each webhook entry in the list displays the webhook's name (e.g., "Zapier Deal Notifications").

**Webhook entry displays URL**
Given the user is on /settings with existing webhooks, each webhook entry in the list displays the webhook's URL (e.g., "https://hooks.zapier.com/...").

**Webhook entry displays subscribed events**
Given the user is on /settings with existing webhooks, each webhook entry in the list displays the events the webhook is subscribed to (e.g., "Deal Created", "Task Completed").

**Webhook enable/disable toggle works**
Given the user is on /settings with an existing enabled webhook, when they click the enable/disable toggle on the webhook entry, the webhook is disabled and the toggle reflects the disabled state. The change is persisted via the API, and when the page is refreshed, the webhook remains disabled. Clicking the toggle again re-enables it.

**Webhook entry click opens WebhookModal for editing**
Given the user is on /settings with existing webhooks, when they click on a webhook entry's name or an edit action, the WebhookModal opens pre-populated with that webhook's current name, URL, and selected events for editing.

**Webhook delete button shows confirmation**
Given the user is on /settings with existing webhooks, when they click the delete button on a webhook entry, a confirmation dialog or prompt appears asking the user to confirm deletion (e.g., "Are you sure you want to delete this webhook?").

**Webhook delete confirmation removes webhook**
Given the delete confirmation is displayed for a webhook, when the user confirms the deletion, the webhook is removed from the list and deleted from the database via the API. The webhook no longer appears in the list after deletion.

**Webhook delete cancel preserves webhook**
Given the delete confirmation is displayed for a webhook, when the user cancels the deletion, the confirmation closes and the webhook remains in the list unchanged.

**Multiple webhooks display in list**
Given the user is on /settings and has created multiple webhooks, all webhooks appear in the list, each with their own name, URL, events, toggle, and delete button.

#### WebhookModal

**Modal opens in create mode with empty fields**
Given the user clicks "Add Webhook" on /settings, the WebhookModal opens with a title indicating creation (e.g., "Add Webhook"), empty name input, empty URL input, no event checkboxes selected, and the platform selector available.

**Modal contains name input field**
Given the WebhookModal is open, the form contains a "Name" text input field for the webhook name (e.g., "My Zapier Hook").

**Modal contains URL input field**
Given the WebhookModal is open, the form contains a "URL" text input field for the webhook endpoint URL.

**Modal contains event checkboxes**
Given the WebhookModal is open, the form contains a set of 8 event checkboxes that the user can select to subscribe the webhook to: "Client Created", "Client Updated", "Deal Created", "Deal Stage Changed", "Task Created", "Task Completed", "Contact Added", and "Note Added". Each event has a labeled checkbox.

**Modal contains platform selector**
Given the WebhookModal is open, the form contains a platform selector with options: Zapier, n8n, and Custom. The selector allows the user to choose which platform the webhook is for.

**Selecting Zapier platform shows Zapier setup guide**
Given the WebhookModal is open, when the user selects "Zapier" from the platform selector, a platform-specific setup guide appears with step-by-step instructions for setting up a Zapier webhook. The guide explains where to find the webhook URL in Zapier and includes a tip that Zapier needs the first event sent to detect the payload schema.

**Selecting n8n platform shows n8n setup guide**
Given the WebhookModal is open, when the user selects "n8n" from the platform selector, a platform-specific setup guide appears with step-by-step instructions for setting up an n8n webhook. The guide explains where to find the webhook URL in n8n and includes a tip about separate test vs production URLs in n8n.

**Selecting Custom platform shows custom endpoint guide**
Given the WebhookModal is open, when the user selects "Custom" from the platform selector, a setup guide appears with generic instructions for configuring a custom webhook endpoint, including the expected payload format and how to receive events.

**URL placeholder updates based on selected platform**
Given the WebhookModal is open, when the user selects "Zapier", the URL input placeholder text updates to show a Zapier-style URL hint (e.g., "https://hooks.zapier.com/hooks/catch/..."). When they switch to "n8n", the placeholder updates to an n8n-style URL hint (e.g., "https://your-n8n-instance.com/webhook/..."). When they switch to "Custom", the placeholder shows a generic URL hint (e.g., "https://your-endpoint.com/webhook").

**Payload format toggle shows JSON structure**
Given the WebhookModal is open, the modal includes a toggleable payload format section. When the user expands/toggles it, a JSON structure preview is displayed showing the format of webhook event payloads that will be sent (including fields like event type, timestamp, and entity data).

**Modal submit creates new webhook**
Given the WebhookModal is open in create mode, the user enters a name ("My Zapier Hook"), pastes a URL ("https://hooks.zapier.com/hooks/catch/123/abc"), selects events "Deal Stage Changed" and "Task Completed", and selects the "Zapier" platform, when they click the save/submit button, the modal closes, the webhook is created via the API, and the new webhook appears in the Webhooks section list with the correct name, URL, and events.

**Modal submit updates existing webhook**
Given the WebhookModal is open in edit mode for an existing webhook named "Old Hook", the user changes the name to "Updated Hook" and adds another event, when they click save, the modal closes and the webhook entry in the list reflects the updated name and events. The changes are persisted via the API.

**Modal validates required fields**
Given the WebhookModal is open, when the user clicks save without filling in the name or URL fields, validation error messages are displayed for the missing required fields and the form is not submitted.

**Modal cancel closes without saving**
Given the WebhookModal is open and the user has entered data, when they click the cancel button or close icon, the modal closes and no webhook is created or modified.

**Modal pre-populates fields in edit mode**
Given the user opens the WebhookModal for editing an existing webhook with name "Zapier Hook", URL "https://hooks.zapier.com/123", events "Deal Created" and "Task Completed", and platform "Zapier", the modal opens with all fields pre-filled with these values and the Zapier setup guide visible.

**Setup guide step-by-step instructions are numbered**
Given the WebhookModal is open and a platform is selected, the setup guide displays numbered step-by-step instructions (e.g., "1. Open Zapier and create a new Zap", "2. Choose 'Webhooks by Zapier' as the trigger", etc.), making it easy for the user to follow along.

---

## UsersListPage (/users)

### Components: TeamHeader, UserCardGrid

#### TeamHeader

**Page title displays "Team"**
Given the user navigates to /users, the page displays the heading "Team" at the top of the content area.

#### UserCardGrid

**User cards are displayed in a grid layout**
Given the user navigates to /users with seeded team members in the database, a grid of user cards is displayed showing all team members. The grid contains one card per user (9 seeded team members).

**Each user card displays avatar**
Given the user is on /users with team members, each user card displays the user's avatar image. If no avatar is available, an initials fallback is shown derived from the user's name.

**Each user card displays name**
Given the user is on /users with team members, each user card displays the user's full name prominently.

**Each user card displays email**
Given the user is on /users with team members, each user card displays the user's email address below their name.

**Each user card displays active deals count**
Given the user is on /users with team members who own deals, each user card displays the count of active deals owned by that user (e.g., "3 Active Deals"). The count reflects only deals that are currently active/open.

**Each user card displays open tasks count**
Given the user is on /users with team members who have assigned tasks, each user card displays the count of open tasks assigned to that user (e.g., "5 Open Tasks"). The count reflects only tasks that are not yet completed or canceled.

**Clicking a user card navigates to /users/:userId**
Given the user is on /users with team members displayed, when they click on a user card, the app navigates to /users/:userId where :userId is the ID of the clicked user, and the UserDetailPage is displayed for that user.

---

## UserDetailPage (/users/:userId)

### Components: UserHeader, UserStats, OwnedDealsList, AssignedTasksList, RecentActivityFeed

#### UserHeader

**User name is displayed prominently**
Given the user navigates to /users/:userId for a user named "Alice Johnson", the UserHeader displays the full name "Alice Johnson" as the primary heading.

**User email is displayed**
Given the user navigates to /users/:userId for a user with email "alice@example.com", the UserHeader displays the email address "alice@example.com" below or alongside the name.

**User join date is displayed**
Given the user navigates to /users/:userId for a user who joined on "2024-03-15", the UserHeader displays a formatted join date (e.g., "Joined March 15, 2024" or "Member since Mar 2024").

**User avatar is displayed**
Given the user navigates to /users/:userId for a user with an avatar, the UserHeader displays the user's avatar image. If no avatar is available, an initials fallback is shown derived from the user's name (e.g., "AJ" for "Alice Johnson").

**Back navigation to team page**
Given the user is on /users/:userId, a back link or button is visible (e.g., "← Back to Team" or a back arrow). When clicked, the app navigates to /users and the UsersListPage is displayed.

#### UserStats

**Active deals count is displayed**
Given the user navigates to /users/:userId for a user who owns 3 active deals, the UserStats section displays "3" with the label "Active Deals".

**Open tasks count is displayed**
Given the user navigates to /users/:userId for a user who has 5 open (not completed or canceled) tasks assigned, the UserStats section displays "5" with the label "Open Tasks".

**Total deals count is displayed**
Given the user navigates to /users/:userId for a user who owns 7 total deals (active and closed), the UserStats section displays "7" with the label "Total Deals".

**Stats show zero when user has no deals or tasks**
Given the user navigates to /users/:userId for a user who owns no deals and has no tasks, the UserStats section displays "0" for Active Deals, "0" for Open Tasks, and "0" for Total Deals.

**Stats reflect current data accurately**
Given the user navigates to /users/:userId for a user who owns 2 active deals and 1 closed deal (3 total), with 4 open tasks, the UserStats section shows Active Deals: 2, Open Tasks: 4, Total Deals: 3.

#### OwnedDealsList

**Section displays "Owned Deals" heading**
Given the user is on /users/:userId, the OwnedDealsList section displays a heading such as "Owned Deals".

**Each deal entry displays the deal name**
Given the user owns a deal named "Acme Software License", the OwnedDealsList shows an entry with the text "Acme Software License".

**Each deal entry displays the deal stage**
Given the user owns a deal in the "Proposal Sent" stage, the deal entry displays the stage "Proposal Sent" (e.g., as a badge or label).

**Each deal entry displays the deal value**
Given the user owns a deal with a value of $50,000, the deal entry displays the formatted value "$50,000".

**Each deal entry displays the associated client name**
Given the user owns a deal associated with client "Acme Corp", the deal entry displays the client name "Acme Corp".

**Multiple owned deals are listed**
Given the user owns 3 deals ("Acme Software License", "Beta Services Contract", "Gamma Upgrade"), all three are displayed as separate entries in the OwnedDealsList.

**Clicking a deal navigates to deal detail page**
Given the user is viewing a deal entry "Acme Software License" in the OwnedDealsList, when they click on that entry, the app navigates to /deals/:dealId and the DealDetailPage is displayed for that deal.

**Empty state when user owns no deals**
Given the user has no owned deals, the OwnedDealsList section displays an empty state message (e.g., "No owned deals").

#### AssignedTasksList

**Section displays "Assigned Tasks" heading**
Given the user is on /users/:userId, the AssignedTasksList section displays a heading such as "Assigned Tasks".

**Each task entry displays the task title**
Given the user is assigned a task titled "Follow up on proposal", the AssignedTasksList shows an entry with the text "Follow up on proposal".

**Each task entry displays the task due date**
Given the user is assigned a task with a due date of "2025-04-10", the task entry displays the formatted due date (e.g., "Apr 10, 2025" or "Due Apr 10").

**Each task entry displays the task priority**
Given the user is assigned a task with priority "High", the task entry displays the priority "High" (e.g., as a colored badge or label).

**Each task entry displays the task status**
Given the user is assigned a task with status "In Progress", the task entry displays the status "In Progress".

**Each task entry displays the associated client name**
Given the user is assigned a task associated with client "Acme Corp", the task entry displays the client name "Acme Corp".

**Multiple assigned tasks are listed**
Given the user has 4 assigned tasks, all four are displayed as separate entries in the AssignedTasksList.

**Clicking a task navigates to task detail page**
Given the user is viewing a task entry "Follow up on proposal" in the AssignedTasksList, when they click on that entry, the app navigates to /tasks/:taskId and the TaskDetailPage is displayed for that task.

**Empty state when user has no assigned tasks**
Given the user has no assigned tasks, the AssignedTasksList section displays an empty state message (e.g., "No assigned tasks").

#### RecentActivityFeed

**Section displays "Recent Activity" heading**
Given the user is on /users/:userId, the RecentActivityFeed section displays a heading such as "Recent Activity".

**Activity entries are displayed in reverse chronological order**
Given the user has multiple recent activity entries, they are displayed with the most recent entry at the top and oldest at the bottom.

**Each activity entry displays a timestamp**
Given a recent activity entry occurred on "2025-03-20 at 2:30 PM", the entry displays a formatted timestamp or relative time (e.g., "Mar 20, 2025" or "2 hours ago").

**Each activity entry displays a description of the action**
Given an activity entry for creating a deal "Acme Software License", the entry displays a description such as "Created deal 'Acme Software License'" or "Deal Created: Acme Software License".

**Activity entries include deal-related actions**
Given the user changed a deal stage from "Qualification" to "Proposal Sent" for deal "Acme Software License", an activity entry displays this action (e.g., "Changed deal 'Acme Software License' stage from 'Qualification' to 'Proposal Sent'").

**Activity entries include task-related actions**
Given the user completed a task titled "Send follow-up email", an activity entry displays this action (e.g., "Completed task 'Send follow-up email'").

**Activity entries include client-related actions**
Given the user added a note on client "Acme Corp", an activity entry displays this action (e.g., "Added note on 'Acme Corp'").

**Multiple activity entries are displayed**
Given the user has 5 recent activity entries, all five are displayed as separate items in the RecentActivityFeed.

**Empty state when user has no recent activity**
Given the user has no recent activity entries, the RecentActivityFeed section displays an empty state message (e.g., "No recent activity").

---

## ForgotPasswordPage (/auth/forgot-password)

### Components: ForgotPasswordForm

#### ForgotPasswordForm

**Page displays heading and instructions**
Given the user navigates to /auth/forgot-password, the page displays a heading such as "Forgot Password" and instructional text explaining that a password reset link will be sent to their email address.

**Email input field is displayed**
Given the user is on /auth/forgot-password, an email input field is visible with a label such as "Email" and a placeholder like "Enter your email address".

**Submit button is displayed with label**
Given the user is on /auth/forgot-password, a submit button is visible with text such as "Send Reset Link".

**Submit with valid email shows success message**
Given the user is on /auth/forgot-password, when they enter a valid email address (e.g., "user@example.com") into the email input and click the "Send Reset Link" button, a success message is displayed (e.g., "If an account exists with that email, a password reset link has been sent.") and the email input is cleared or the form is replaced by the success message. The reset link is sent via the Resend API.

**Submit with empty email shows validation error**
Given the user is on /auth/forgot-password, when they click the "Send Reset Link" button without entering an email address, a validation error message is displayed (e.g., "Email is required") and no API request is made.

**Submit with invalid email format shows validation error**
Given the user is on /auth/forgot-password, when they enter an invalid email format (e.g., "notanemail") and click the "Send Reset Link" button, a validation error message is displayed (e.g., "Please enter a valid email address") and no API request is made.

**Back to sign in link is displayed and navigates correctly**
Given the user is on /auth/forgot-password, a link such as "Back to Sign In" or "← Back" is visible. When clicked, the app navigates back to the main app (e.g., /clients) where the user can use the sidebar sign-in form.

**Submit button shows loading state during request**
Given the user has entered a valid email and clicked "Send Reset Link", the button shows a loading state (e.g., disabled with a spinner or "Sending..." text) while the request is in progress, preventing duplicate submissions.

---

## ResetPasswordPage (/auth/reset-password)

### Components: ResetPasswordForm

#### ResetPasswordForm

**Page displays heading and instructions**
Given the user navigates to /auth/reset-password?token=valid-token, the page displays a heading such as "Reset Password" and instructional text explaining that they should enter a new password.

**New password input field is displayed**
Given the user is on /auth/reset-password?token=valid-token, a password input field is visible with a label such as "New Password" and appropriate placeholder text.

**Confirm password input field is displayed**
Given the user is on /auth/reset-password?token=valid-token, a confirm password input field is visible with a label such as "Confirm Password" and appropriate placeholder text.

**Submit button is displayed with label**
Given the user is on /auth/reset-password?token=valid-token, a submit button is visible with text such as "Reset Password".

**Submit with matching passwords succeeds and auto-logs in**
Given the user is on /auth/reset-password?token=valid-token, when they enter a new password in both the "New Password" and "Confirm Password" fields (e.g., "NewSecure123!") and click "Reset Password", the password is updated successfully, the user is automatically logged in, and the app redirects to /clients (or the main page) with the sidebar showing the user's avatar, name, and sign-out button.

**Submit with mismatched passwords shows validation error**
Given the user is on /auth/reset-password?token=valid-token, when they enter "Password1!" in the "New Password" field and "Password2!" in the "Confirm Password" field and click "Reset Password", a validation error message is displayed (e.g., "Passwords do not match") and the form remains visible for correction.

**Submit with empty password fields shows validation error**
Given the user is on /auth/reset-password?token=valid-token, when they click "Reset Password" without entering any password, a validation error message is displayed (e.g., "Password is required") and no API request is made.

**Invalid token shows error message**
Given the user navigates to /auth/reset-password?token=invalid-or-expired-token, or the token has already been used, the page displays an error message (e.g., "This reset link is invalid or has expired.") and a link to request a new reset (navigating to /auth/forgot-password).

**Missing token shows error message**
Given the user navigates to /auth/reset-password without a token query parameter, the page displays an error message (e.g., "No reset token provided.") and a link to request a password reset (navigating to /auth/forgot-password).

**Submit button shows loading state during request**
Given the user has entered matching passwords and clicked "Reset Password", the button shows a loading state (e.g., disabled with a spinner or "Resetting..." text) while the request is in progress, preventing duplicate submissions.

**Link to forgot password page is available on error**
Given the user sees an invalid or expired token error on /auth/reset-password, a link such as "Request a new reset link" is visible. When clicked, the app navigates to /auth/forgot-password.

---

## ConfirmEmailPage (/auth/confirm-email)

### Components: ConfirmEmailHandler

#### ConfirmEmailHandler

**Valid token confirms email and auto-logs in**
Given the user navigates to /auth/confirm-email?token=valid-confirmation-token, the page automatically verifies the token, confirms the email address, logs the user in, and redirects to /clients (or the main page) with the sidebar showing the user's avatar, name, and sign-out button. A brief success message (e.g., "Email confirmed! Redirecting...") may be shown during the process.

**Loading state is displayed during token verification**
Given the user navigates to /auth/confirm-email?token=valid-token, while the token is being verified, the page displays a loading indicator (e.g., a spinner with text such as "Confirming your email...").

**Invalid token shows error message**
Given the user navigates to /auth/confirm-email?token=invalid-token, where the token does not exist in the database, the page displays an error message (e.g., "This confirmation link is invalid.") and does not log the user in.

**Expired token shows error message**
Given the user navigates to /auth/confirm-email?token=expired-token, where the token exists but has passed its expiry time, the page displays an error message (e.g., "This confirmation link has expired.") and does not log the user in.

**Already-used token shows error message**
Given the user navigates to /auth/confirm-email?token=used-token, where the token has already been used (used_at is set), the page displays an error message (e.g., "This confirmation link has already been used.") and does not log the user in.

**Missing token shows error message**
Given the user navigates to /auth/confirm-email without a token query parameter, the page displays an error message (e.g., "No confirmation token provided.").

**Error state shows link to sign in**
Given the user sees an error on /auth/confirm-email (invalid, expired, or used token), a link such as "Go to Sign In" or "Back to app" is visible. When clicked, the app navigates to /clients (or the main page) where the user can use the sidebar sign-in form.
