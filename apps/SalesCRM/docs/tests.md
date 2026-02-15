# Sales CRM — Test Specification

This document defines behavior-driven test entries for the Sales CRM application, organized by page. Each test entry describes initial conditions, user actions, and expected outcomes.

---

## 1. ClientsListPage (/clients)

### Components
- **SidebarNavigation**: Left sidebar with nav links (Dashboard, Clients, Deals, Tasks, Reports, Settings) and bottom Settings link
- **PageHeader**: "Clients" title with Import, Export, and "+ Add New Client" buttons
- **SearchBar**: Text input for searching clients by name, tag, or contact
- **FilterControls**: Dropdown filters for Status (All/Active/Inactive/Prospect/Churned), Tags (All/specific tags), Source (All/specific sources), and Sort (Recently Updated, Name A-Z, etc.)
- **ClientsTable**: Tabular list with columns: Client Name, Type, Status (colored badge), Tags (badges), Primary Contact, Open Deals (count + value), Next Task
- **RowActionMenu**: "..." menu on each row with actions (Edit, Delete, View)
- **Pagination**: "Showing X-Y of Z clients" text with Previous/Next buttons and page number links

### Test Entries

#### SidebarNavigation

**CLP-NAV-01: Sidebar displays all navigation items**
- Initial: User navigates to /clients
- Action: Observe the sidebar
- Expected: Sidebar shows navigation links: Dashboard, Clients, Deals, Tasks, Reports, Settings. The "Clients" link is visually highlighted as active.

**CLP-NAV-02: Sidebar navigation links route correctly**
- Initial: User is on /clients
- Action: Click "Deals" in sidebar
- Expected: App navigates to /deals. Click "Tasks" → navigates to /tasks. Click "Clients" → navigates to /clients.

#### PageHeader

**CLP-HDR-01: Page header displays title and action buttons**
- Initial: User navigates to /clients
- Action: Observe the page header area
- Expected: "Clients" is displayed as the page title. Three buttons are visible: "Import" (with download icon), "Export" (with upload icon), and "+ Add New Client" (primary/accent styled button).

**CLP-HDR-02: Add New Client button opens create client modal**
- Initial: User is on /clients
- Action: Click "+ Add New Client" button
- Expected: A modal/dialog opens with a form to create a new client. Form includes fields for: client name, type (Organization/Individual), status, tags, source info. Form has Save/Cancel buttons.

**CLP-HDR-03: Creating a new client persists and appears in list**
- Initial: User has opened the Add New Client modal
- Action: Fill in client name "Test Corp", select type "Organization", select status "Prospect", add tag "Enterprise", fill source info, click Save
- Expected: Modal closes. The new client "Test Corp" appears in the clients table with the correct type, status badge, and tags. The client is persisted to the database (page reload still shows it).

**CLP-HDR-04: Import button opens import dialog**
- Initial: User is on /clients
- Action: Click "Import" button
- Expected: An import dialog/modal opens allowing the user to upload client data (e.g., CSV file upload).

**CLP-HDR-05: Export button triggers data export**
- Initial: User is on /clients with existing clients
- Action: Click "Export" button
- Expected: A file download is initiated (or export dialog appears) containing the client data.

#### SearchBar

**CLP-SRCH-01: Search bar is displayed with placeholder text**
- Initial: User navigates to /clients
- Action: Observe the search bar
- Expected: A text input is displayed with placeholder "Search clients by name, tag, or contact..." and a search icon.

**CLP-SRCH-02: Search filters clients by name**
- Initial: Clients list contains "Acme Corp" and "Globex Solutions"
- Action: Type "Acme" in the search bar
- Expected: Only "Acme Corp" is visible in the table. "Globex Solutions" is filtered out.

**CLP-SRCH-03: Search filters clients by tag**
- Initial: Clients list contains clients with tags "SaaS" and "Legacy"
- Action: Type "SaaS" in the search bar
- Expected: Only clients with the "SaaS" tag are displayed.

**CLP-SRCH-04: Search filters clients by contact name**
- Initial: Clients list contains a client with primary contact "Sarah Jenkins"
- Action: Type "Sarah" in the search bar
- Expected: Clients with "Sarah" in their primary contact name are displayed.

**CLP-SRCH-05: Clearing search restores full client list**
- Initial: Search bar has "Acme" typed and list is filtered
- Action: Clear the search bar (delete text or click clear button)
- Expected: Full unfiltered client list is displayed again.

#### FilterControls

**CLP-FLT-01: Status filter dropdown shows all status options**
- Initial: User is on /clients
- Action: Click the Status filter dropdown
- Expected: Dropdown shows options: All, Active, Inactive, Prospect, Churned.

**CLP-FLT-02: Filtering by status shows only matching clients**
- Initial: Clients list has clients with different statuses
- Action: Select "Active" from Status filter
- Expected: Only clients with "Active" status badge are displayed. Pagination updates to reflect filtered count.

**CLP-FLT-03: Tags filter dropdown shows available tags**
- Initial: User is on /clients
- Action: Click the Tags filter dropdown
- Expected: Dropdown shows "All" plus all unique tags from the client database (e.g., SaaS, Enterprise, Legacy, Partner, etc.).

**CLP-FLT-04: Filtering by tag shows only matching clients**
- Initial: Clients list has clients with different tags
- Action: Select "Enterprise" from Tags filter
- Expected: Only clients tagged with "Enterprise" are displayed.

**CLP-FLT-05: Source filter dropdown shows available sources**
- Initial: User is on /clients
- Action: Click the Source filter dropdown
- Expected: Dropdown shows "All" plus all unique source values (e.g., Referral, Direct Sales, Campaign, etc.).

**CLP-FLT-06: Filtering by source shows only matching clients**
- Initial: Clients list has clients from different sources
- Action: Select "Referral" from Source filter
- Expected: Only clients with "Referral" as acquisition source are displayed.

**CLP-FLT-07: Sort dropdown shows sort options**
- Initial: User is on /clients
- Action: Click the Sort dropdown
- Expected: Dropdown shows options including: Recently Updated, Name A-Z, Name Z-A, Status, Most Deals.

**CLP-FLT-08: Sorting by name A-Z orders clients alphabetically**
- Initial: Clients list has multiple clients
- Action: Select "Name A-Z" from Sort dropdown
- Expected: Clients are reordered alphabetically by name (A first).

**CLP-FLT-09: Multiple filters can be combined**
- Initial: Clients list has various clients
- Action: Select Status "Active" AND Tags "Enterprise"
- Expected: Only clients that are both Active and tagged Enterprise are shown.

#### ClientsTable

**CLP-TBL-01: Table displays correct column headers**
- Initial: User navigates to /clients
- Action: Observe the table header row
- Expected: Column headers are: Client Name, Type, Status, Tags, Primary Contact, Open Deals, Next Task.

**CLP-TBL-02: Client rows display all required fields**
- Initial: A client "Acme Corp" exists as Organization, Active, with tags [SaaS, Enterprise, Q3-Target], primary contact "Sarah Jenkins (CEO)", 3 open deals worth $150k, next task "Follow-up call - Today, 2pm"
- Action: Observe the Acme Corp row
- Expected: Row shows: "Acme Corp" | "Organization" | green "Active" badge | "SaaS", "Enterprise", "Q3-Target" tag badges | "Sarah Jenkins (CEO)" | "3 (Value: $150k)" | "Follow-up call - Today, 2pm"

**CLP-TBL-03: Status badges have correct colors**
- Initial: Clients with different statuses exist
- Action: Observe status badges
- Expected: "Active" badge is green, "Inactive" badge is gray, "Prospect" badge is blue/yellow, "Churned" badge is red/orange.

**CLP-TBL-04: Clicking a client name navigates to client detail page**
- Initial: Client "Acme Corp" exists with ID "acme-corp-451"
- Action: Click on the "Acme Corp" row
- Expected: App navigates to /clients/acme-corp-451 (the ClientDetailPage for that client).

**CLP-TBL-05: Individual type clients show self as primary contact**
- Initial: An individual client "Jane Doe" exists
- Action: Observe the row for Jane Doe
- Expected: Primary Contact column shows "Jane Doe (Self)".

**CLP-TBL-06: Clients with no open deals show 0**
- Initial: Client "Globex Solutions" has no active deals
- Action: Observe the row
- Expected: Open Deals column shows "0".

**CLP-TBL-07: Clients with no next task show appropriate text**
- Initial: Client "Globex Solutions" has no upcoming tasks
- Action: Observe the row
- Expected: Next Task column shows "No task scheduled".

**CLP-TBL-08: Clients with churned status show N/A for deals**
- Initial: Client "Wayne Enterprises" has Churned status
- Action: Observe the row
- Expected: Open Deals shows "0" and Next Task shows "N/A".

#### RowActionMenu

**CLP-ACT-01: Row action menu button is visible on each row**
- Initial: User is on /clients with clients listed
- Action: Observe the rightmost column of each row
- Expected: Each row has a "..." (three dots/ellipsis) button.

**CLP-ACT-02: Clicking row action menu shows options**
- Initial: User is on /clients
- Action: Click the "..." button on a client row
- Expected: A dropdown menu appears with options: View, Edit, Delete.

**CLP-ACT-03: Row action View navigates to client detail**
- Initial: Row action menu is open for "Acme Corp"
- Action: Click "View"
- Expected: App navigates to the ClientDetailPage for Acme Corp.

**CLP-ACT-04: Row action Delete removes client after confirmation**
- Initial: Row action menu is open for a client
- Action: Click "Delete"
- Expected: A confirmation dialog appears. Clicking "Confirm" deletes the client, which disappears from the list. The deletion is persisted (page reload confirms it).

#### Pagination

**CLP-PGN-01: Pagination shows correct count**
- Initial: 324 clients exist in the database
- Action: Observe pagination area
- Expected: Text shows "Showing 1-50 of 324 clients". Page buttons 1, 2, 3, ... and Previous/Next are visible.

**CLP-PGN-02: Clicking next page loads next set of clients**
- Initial: On page 1 of clients
- Action: Click "Next" or page "2"
- Expected: Table shows clients 51-100. Pagination text updates to "Showing 51-100 of 324 clients". Page 2 button is highlighted.

**CLP-PGN-03: Previous button is disabled on first page**
- Initial: On page 1
- Action: Observe Previous button
- Expected: Previous button is disabled/grayed out.

**CLP-PGN-04: Next button is disabled on last page**
- Initial: On the last page of results
- Action: Observe Next button
- Expected: Next button is disabled/grayed out.

---

## 2. ClientDetailPage (/clients/:clientId)

### Components
- **ClientHeader**: Client name, type badge (Organization/Individual), status badge, tags, and edit icon/pencil for inline editing
- **QuickActions**: Row of action buttons — Add Task, Add Deal, Add Attachment, Add Person — each with icon and label
- **SourceInfoSection**: Displays acquisition source, campaign, channel, date acquired, with Edit button
- **TasksSection**: "Tasks" heading with "Unresolved tasks" label, list of tasks with checkboxes, due dates, and optional deal associations
- **DealsSection**: "Deals" heading, list of deals with name, stage, and value
- **AttachmentsSection**: "Attachments" heading, list of files/links with name, type (Document/Link), created date, linked deal, download/view and delete icons
- **PeopleSection**: "People" heading, list of individuals with avatar, name, and role/title
- **TimelineSection**: "Timeline" heading, chronological feed of events (task created, note added, deal stage changed, email sent, contact added) with dates, descriptions, and user attribution

### Test Entries

#### ClientHeader

**CDP-HDR-01: Header displays client name, type, status, and tags**
- Initial: Navigate to /clients/acme-corp-451 where Acme Corp is an Organization, Active, with tags [Enterprise, Software, High Priority]
- Action: Observe the header
- Expected: "Acme Corp" displayed as large heading. "Organization" badge. "Active" status badge. Tags: "Enterprise", "Software", "High Priority" displayed as clickable badges. "Referral" source badge with edit icon.

**CDP-HDR-02: Clicking edit on header allows editing client name**
- Initial: User is on ClientDetailPage for Acme Corp
- Action: Click the edit icon/pencil on the header area
- Expected: Client name becomes editable (inline text field). User can type a new name.

**CDP-HDR-03: Editing client status persists the change**
- Initial: Client "Acme Corp" has status "Active"
- Action: Click on the status badge, select "Inactive" from dropdown
- Expected: Status badge changes to "Inactive" (gray). Change is persisted to database. A timeline entry is created: "Status changed from Active to Inactive".

**CDP-HDR-04: Editing tags persists the change**
- Initial: Client has tags [Enterprise, Software]
- Action: Click to edit tags, add "VIP" tag, remove "Software" tag, save
- Expected: Tags now show [Enterprise, VIP]. Change is persisted. A timeline entry is created for the tag change.

**CDP-HDR-05: Editing client type persists the change**
- Initial: Client is "Organization"
- Action: Edit type to "Individual"
- Expected: Type badge changes to "Individual". Change is persisted.

#### QuickActions

**CDP-QA-01: Quick action buttons are all displayed**
- Initial: Navigate to ClientDetailPage
- Action: Observe the quick actions row
- Expected: Four buttons visible with icons and labels: "Add Task" (checklist icon), "Add Deal" (clock/deal icon), "Add Attachment" (paperclip icon), "Add Person" (person+ icon).

**CDP-QA-02: Add Task opens task creation modal**
- Initial: User is on ClientDetailPage
- Action: Click "Add Task"
- Expected: A modal opens with fields: task title, description, due date, priority, optional deal association. Has Save/Cancel buttons.

**CDP-QA-03: Creating a task via quick action persists and shows in Tasks section**
- Initial: Add Task modal is open for Acme Corp
- Action: Fill title "Prepare Q3 Review", due date "Next Week", click Save
- Expected: Modal closes. New task appears in Tasks section with title "Prepare Q3 Review" and due date. Task is persisted. A timeline entry is created: "Task Created: 'Prepare Q3 Review'".

**CDP-QA-04: Add Deal opens deal creation modal**
- Initial: User is on ClientDetailPage
- Action: Click "Add Deal"
- Expected: A modal opens with fields: deal name, value ($), stage (dropdown: Lead, Qualification, Discovery, Proposal, Negotiation, Closed Won), owner. Has Save/Cancel buttons.

**CDP-QA-05: Creating a deal via quick action persists and shows in Deals section**
- Initial: Add Deal modal is open
- Action: Fill name "Enterprise License", value "$50,000", stage "Proposal Sent", click Save
- Expected: Modal closes. Deal appears in Deals section showing "Enterprise License - Stage: Proposal Sent, Value: $50,000". Deal is persisted. A timeline entry is created.

**CDP-QA-06: Add Attachment opens attachment upload dialog**
- Initial: User is on ClientDetailPage
- Action: Click "Add Attachment"
- Expected: A dialog opens allowing file upload (drag & drop or file picker) or link URL entry. Includes optional deal association dropdown and Save/Cancel buttons.

**CDP-QA-07: Uploading an attachment persists and shows in Attachments section**
- Initial: Attachment dialog is open
- Action: Upload a file "Report.pdf", optionally link to deal, click Save
- Expected: Dialog closes. "Report.pdf" appears in Attachments section with type "Document", today's date, and linked deal (if any). Attachment is persisted via UploadThing.

**CDP-QA-08: Add Person opens person creation/association modal**
- Initial: User is on ClientDetailPage
- Action: Click "Add Person"
- Expected: A modal opens with options to create a new person or associate an existing person. Fields include: name, role/title, email, phone. Has Save/Cancel buttons.

**CDP-QA-09: Adding a person persists and shows in People section**
- Initial: Add Person modal is open
- Action: Fill name "Emily Davis", role "Project Manager", save
- Expected: Modal closes. "Emily Davis - Project Manager" appears in People section with avatar. Person is persisted. A timeline entry "Contact Added: 'Emily Davis'" is created.

#### SourceInfoSection

**CDP-SRC-01: Source info section displays acquisition details**
- Initial: Client has source info: Acquisition Source "Referral (John Smith)", Campaign "None", Channel "Direct Sales", Date Acquired "2023-01-15"
- Action: Observe Source Info section
- Expected: Section titled "Source Info" shows: Acquisition Source: "Referral (John Smith)", Campaign: "None", Channel: "Direct Sales", Date Acquired: "2023-01-15". An "Edit" button/icon is visible.

**CDP-SRC-02: Edit button allows editing source info**
- Initial: User is on ClientDetailPage
- Action: Click "Edit" on Source Info section
- Expected: Fields become editable. User can modify acquisition source, campaign, channel, date acquired. Save/Cancel buttons appear.

**CDP-SRC-03: Saving source info changes persists them**
- Initial: Source info is in edit mode
- Action: Change Channel from "Direct Sales" to "Partner Referral", click Save
- Expected: Channel now displays "Partner Referral". Change is persisted to database.

#### TasksSection

**CDP-TSK-01: Tasks section displays unresolved tasks**
- Initial: Client has 3 unresolved tasks: "Follow up on proposal" (Due: Today, Deal: Acme Software License), "Schedule onboarding call" (Due: Tomorrow), "Prepare Q3 Review" (Due: Next Week)
- Action: Observe Tasks section
- Expected: Section headed "Tasks" with "Unresolved tasks" label. Three tasks listed with checkboxes (unchecked), task titles, due dates, and deal associations where applicable.

**CDP-TSK-02: Checking a task checkbox marks it complete**
- Initial: Task "Follow up on proposal" is unchecked
- Action: Click the checkbox next to the task
- Expected: Task is marked complete (checkbox filled, text may strike through). Task disappears from unresolved list or moves to a completed section. Change is persisted. A timeline entry "Task Completed: 'Follow up on proposal'" is created.

**CDP-TSK-03: Clicking a task navigates to task context**
- Initial: Tasks are listed in the section
- Action: Click on task title "Follow up on proposal"
- Expected: If the task is associated with a deal, navigates to the deal detail page. Otherwise shows task detail inline or in a modal.

**CDP-TSK-04: Tasks show deal association when applicable**
- Initial: Task "Follow up on proposal" is linked to deal "Acme Software License"
- Action: Observe the task row
- Expected: Text shows "Deal: 'Acme Software License'" next to the task.

#### DealsSection

**CDP-DL-01: Deals section displays current deals**
- Initial: Client has 2 deals: "Acme Software License" (Stage: Proposal Sent, Value: $50,000) and "Additional Services" (Stage: Qualification, Value: $10,000)
- Action: Observe Deals section
- Expected: Section headed "Deals". Each deal row shows: deal name, stage, and dollar value.

**CDP-DL-02: Clicking a deal navigates to DealDetailPage**
- Initial: Deals section shows "Acme Software License"
- Action: Click on "Acme Software License"
- Expected: App navigates to /deals/<dealId> for that deal.

#### AttachmentsSection

**CDP-ATT-01: Attachments section lists files and links**
- Initial: Client has attachments: "Service Agreement.pdf" (Document, 2023-02-01, linked to Acme Software License), "Project Scope.docx" (Document, 2023-02-10, no deal), "Client Website Link" (Link, 2023-01-15, no deal)
- Action: Observe Attachments section
- Expected: Section headed "Attachments". Each row shows: a file-type-specific preview (icon matching the file extension, or a thumbnail for image files), filename, file type label (e.g. "Document", "Image", "Spreadsheet", "Link"), created date, linked deal name (or "None"), and action icons (download/view, delete).

**CDP-ATT-02: Download button downloads a document attachment**
- Initial: "Service Agreement.pdf" is listed
- Action: Click the download icon
- Expected: File download initiates for "Service Agreement.pdf".

**CDP-ATT-03: View button opens a link attachment**
- Initial: "Client Website Link" (type Link) is listed
- Action: Click the view/eye icon
- Expected: The link opens in a new tab.

**CDP-ATT-04: Delete button removes an attachment after confirmation**
- Initial: "Project Scope.docx" is listed
- Action: Click the delete (trash) icon
- Expected: A confirmation dialog appears. Confirming deletes the attachment from the list and from storage. Change is persisted.

#### PeopleSection

**CDP-PPL-01: People section lists associated individuals**
- Initial: Client "Acme Corp" has people: Sarah Johnson (CEO), Michael Chen (CTO), Emily Davis (Project Manager)
- Action: Observe People section
- Expected: Section headed "People". Each entry shows avatar, name, and role (e.g., "Sarah Johnson - CEO"). Entries are clickable.

**CDP-PPL-02: Clicking a person navigates to PersonDetailPage**
- Initial: People section shows "Sarah Johnson - CEO"
- Action: Click on "Sarah Johnson"
- Expected: App navigates to /individuals/<individualId> for Sarah Johnson.

#### TimelineSection

**CDP-TL-01: Timeline shows chronological events**
- Initial: Client has recent events: task created today, note added yesterday, deal stage changed 2 days ago, email sent last week, contact added last month
- Action: Observe Timeline section
- Expected: Section headed "Timeline". Events shown in reverse chronological order. Each event shows: date/time group, event type and description, user attribution with link.

**CDP-TL-02: Timeline entries for task creation are accurate**
- Initial: A task "Follow up on proposal" was created today by User A
- Action: Observe timeline
- Expected: Entry shows "Today - Task Created: 'Follow up on proposal' by User A". "User A" is a clickable link.

**CDP-TL-03: Timeline entries for deal stage changes are accurate**
- Initial: Deal "Acme Software License" changed from Qualification to Proposal Sent 2 days ago by User A
- Action: Observe timeline
- Expected: Entry shows "2 days ago - Deal Stage Changed: 'Acme Software License' from 'Qualification' to 'Proposal Sent' by User A".

**CDP-TL-04: Timeline entries for notes are accurate**
- Initial: A note was added yesterday by User B
- Action: Observe timeline
- Expected: Entry shows "Yesterday - Note Added: 'Client mentioned interest in new features.' by User B".

**CDP-TL-05: Timeline entries for email sent are accurate**
- Initial: Email was sent last week to Sarah Johnson
- Action: Observe timeline
- Expected: Entry shows "Last Week - Email Sent: 'Meeting Confirmation' to Sarah Johnson".

**CDP-TL-06: Timeline entries for contact added are accurate**
- Initial: Michael Chen was added last month by User C
- Action: Observe timeline
- Expected: Entry shows "Last Month - Contact Added: 'Michael Chen' by User C".

**CDP-TL-07: Creating a task adds a timeline entry atomically**
- Initial: User is on ClientDetailPage, timeline has N entries
- Action: Create a new task via Add Task quick action
- Expected: Exactly one new timeline entry is created for the task creation. No duplicates from re-renders.

**CDP-TL-08: Changing deal stage adds a timeline entry atomically**
- Initial: Deal exists for the client
- Action: Change the deal's stage (via DealDetailPage or inline)
- Expected: Exactly one timeline entry is created for the stage change on the client's timeline.

---

## 3. PersonDetailPage (/individuals/:individualId)

### Components
- **PersonHeader**: Name, title/role, client associations, contact info (email, phone, location)
- **RelationshipsSection**: "Relationships with Other Individuals" heading, Graph View/List View tabs, list of related individuals with relationship type, company, and Link action. Filter and "+ Add Entry" buttons.
- **ContactHistorySection**: "History of Contact" heading, chronological log of interactions with date/time, type (Video Call, Email, Meeting, Note), summary, and team member attribution. Filter and "+ Add Entry" buttons. Edit (pencil) icon on each entry.
- **AssociatedClientsSection**: "Associated Clients" heading, card-based display of associated clients with client name, status, industry, and "View Client Detail Page" button.

### Test Entries

#### PersonHeader

**PDP-HDR-01: Header displays person name, title, and contact info**
- Initial: Navigate to /individuals/anya-sharma where Dr. Anya Sharma is CTO at Innovate Solutions Inc. & FutureTech Corp.
- Action: Observe the header
- Expected: Name "Dr. Anya Sharma" displayed prominently. Title "Chief Technology Officer (CTO) | Innovate Solutions Inc. & FutureTech Corp." shown below. Contact info: email icon + "anya.sharma@example.com", phone icon + "+1 (555) 123-4567", location icon + "San Francisco, CA". "Associated Clients: Innovate Solutions Inc., FutureTech Corp." with clickable links.

**PDP-HDR-02: Clicking associated client link navigates to ClientDetailPage**
- Initial: Header shows "Innovate Solutions Inc." as associated client
- Action: Click "Innovate Solutions Inc." link
- Expected: App navigates to /clients/<clientId> for Innovate Solutions Inc.

**PDP-HDR-03: Person header info is editable**
- Initial: User is on PersonDetailPage
- Action: Click edit/pencil icon on header
- Expected: Fields become editable: name, title, email, phone, location. Save/Cancel buttons appear.

**PDP-HDR-04: Saving edited person info persists the change**
- Initial: Edit mode is active on header
- Action: Change phone to "+1 (555) 999-8888", click Save
- Expected: Phone updates to new value. Change persisted to database.

#### RelationshipsSection

**PDP-REL-01: Relationships section displays with view toggle**
- Initial: Person has relationships: David Chen (Colleague), Maria Rodriguez (Decision Maker), Kenji Tanaka (Influencer), Sarah Lee (Colleague)
- Action: Observe Relationships section
- Expected: Section headed "Relationships with Other Individuals" with relationship icon. Two tabs: "Graph View" and "List View". Filter button and "+ Add Entry" button visible.

**PDP-REL-02: List View shows relationship entries**
- Initial: "List View" tab is active
- Action: Observe the list
- Expected: Each entry shows: person name, relationship type in parentheses, role/title, company, and "[Link]" action. E.g., "David Chen (Colleague) - V.P. Engineering, Innovate Solutions Inc. [Link]"

**PDP-REL-03: Clicking Link on a relationship navigates to that person**
- Initial: Relationship "David Chen" with [Link] is shown
- Action: Click "[Link]"
- Expected: App navigates to /individuals/<individualId> for David Chen.

**PDP-REL-04: Add Entry button opens relationship creation form**
- Initial: User is on PersonDetailPage
- Action: Click "+ Add Entry" in Relationships section
- Expected: A modal/form opens with fields: person (select/search existing or create new), relationship type (dropdown: Colleague, Decision Maker, Influencer, Manager, Report, etc.). Save/Cancel buttons.

**PDP-REL-05: Adding a relationship persists and shows in list**
- Initial: Add relationship form is open
- Action: Select person "John Smith", relationship type "Manager", click Save
- Expected: "John Smith (Manager)" appears in the relationships list. Change is persisted.

**PDP-REL-06: Filter button filters relationships**
- Initial: Multiple relationships exist with different types
- Action: Click Filter, select "Decision Maker"
- Expected: Only relationships with type "Decision Maker" are shown.

**PDP-REL-07: Graph View displays visual relationship graph**
- Initial: Person has relationships
- Action: Click "Graph View" tab
- Expected: A visual graph/network diagram shows the person at center with connected individuals. Relationship types are labeled on connections.

#### ContactHistorySection

**PDP-CH-01: Contact history displays chronological log**
- Initial: Person has contact history entries: Video Call (Oct 26, 2:30 PM), Email (Oct 24, 10:15 AM), Meeting (Oct 20, 11:00 AM), Note (Oct 18, 4:45 PM)
- Action: Observe History of Contact section
- Expected: Section headed "History of Contact" with clock icon. Filter and "+ Add Entry" buttons. Each entry row shows: date/time, interaction type, summary, team member. Edit pencil icon on each entry.

**PDP-CH-02: Contact history entries show correct details**
- Initial: Video Call entry exists for Oct 26, 2:30 PM
- Action: Observe that entry
- Expected: Shows "Oct 26, 2023, 2:30 PM | Video Call | Summary: Discussed Q4 roadmap integration. Action items assigned. | Team Member: Michael B. (Sales Lead)". Edit icon visible.

**PDP-CH-03: Add Entry button opens contact history creation form**
- Initial: User is on PersonDetailPage
- Action: Click "+ Add Entry" in contact history section
- Expected: A form/modal opens with fields: date/time, type (dropdown: Email, Phone Call, Video Call, Meeting (In-person), Note), summary/notes, team member. Save/Cancel buttons.

**PDP-CH-04: Adding a contact history entry persists and shows in log**
- Initial: Contact history form is open
- Action: Fill date "Oct 28, 3:00 PM", type "Phone Call", summary "Discussed pricing options", team member "Sarah K.", click Save
- Expected: New entry appears in the chronological log at the correct position. Entry is persisted.

**PDP-CH-05: Edit icon opens edit form for existing entry**
- Initial: Contact history entry exists
- Action: Click the pencil/edit icon on an entry
- Expected: Entry becomes editable or a modal opens with pre-filled fields. User can modify summary, type, etc.

**PDP-CH-06: Editing a contact history entry persists the change**
- Initial: Edit mode for a contact history entry
- Action: Change summary text, click Save
- Expected: Updated summary is displayed. Change is persisted.

**PDP-CH-07: Filter button filters contact history by type**
- Initial: Multiple contact history entries of different types exist
- Action: Click Filter, select "Email"
- Expected: Only entries with type "Email" are shown.

#### AssociatedClientsSection

**PDP-AC-01: Associated clients section shows client cards**
- Initial: Person is associated with Innovate Solutions Inc. (Active, Software) and FutureTech Corp. (Prospect, Hardware)
- Action: Observe Associated Clients section
- Expected: Section headed "Associated Clients". Cards for each client showing: client icon/logo, name, "Status: Active Client" / "Status: Prospect", "Industry: Software" / "Industry: Hardware", "View Client Detail Page" button.

**PDP-AC-02: View Client Detail Page button navigates to client**
- Initial: Associated Clients shows "Innovate Solutions Inc." card
- Action: Click "View Client Detail Page" button
- Expected: App navigates to /clients/<clientId> for Innovate Solutions Inc.

---

## 4. DealsListPage (/deals)

### Components
- **SidebarNavigation**: Left sidebar (same as ClientsListPage, "Deals" highlighted)
- **PageHeader**: Breadcrumb "/deals", title "Deals List", "Create New Deal" button, search bar
- **SummaryCards**: Four metric cards: Total Active Deals (count), Pipeline Value (total $), Won (quarter) (count + value), Lost (quarter) (count + value)
- **ViewToggle**: Tabs for "Table View" and "Pipeline View"
- **FilterControls**: Dropdowns for Stage (All Stages), Client (All Clients), Status (Active), Date Range picker, Sort by (Close Date Newest), and a search input
- **DealsTable**: Table with columns: Deal Name, Client, Stage, Owner, Value, Close Date (sortable arrow), Status (colored badge)
- **RowActionMenu**: "..." menu per row
- **Pagination**: Page indicator "Page 1 of 9"

### Test Entries

#### PageHeader

**DLP-HDR-01: Page header shows title, breadcrumb, and create button**
- Initial: Navigate to /deals
- Action: Observe header area
- Expected: Breadcrumb shows "/deals". Title "Deals List". "Create New Deal" button (accent/primary styled) visible in top-right. Search input with "Search deals..." placeholder.

**DLP-HDR-02: Create New Deal button opens deal creation modal**
- Initial: User is on /deals
- Action: Click "Create New Deal"
- Expected: A modal opens with fields: deal name, client (dropdown/search), value, owner, stage (dropdown: Lead, Qualification, Discovery, Proposal, Negotiation, Closed Won), expected close date. Save/Cancel buttons.

**DLP-HDR-03: Creating a deal persists and appears in table**
- Initial: Create deal modal is open
- Action: Fill deal name "New Platform Migration", client "Delta Systems", value "$180,000", owner "Chris B.", stage "Discovery", close date "2024-01-10", click Save
- Expected: Modal closes. Deal appears in the table with correct values. Deal is persisted.

#### SummaryCards

**DLP-SUM-01: Summary cards display correct metrics**
- Initial: Navigate to /deals with existing deals data
- Action: Observe the four summary cards
- Expected: Four cards visible: "Total Active Deals: 124", "Pipeline Value: $4.5M", "Won (Q3): 32 ($1.2M)", "Lost (Q3): 18 ($0.6M)". Each card has an icon and formatted values.

**DLP-SUM-02: Summary cards update when deals are added/changed**
- Initial: Total Active Deals is 124
- Action: Create a new deal
- Expected: Total Active Deals updates to 125. Pipeline Value updates to reflect the new deal value.

#### ViewToggle

**DLP-VW-01: Table View is the default view**
- Initial: Navigate to /deals
- Action: Observe the view toggle
- Expected: "Table View" tab is active/highlighted. A table of deals is displayed.

**DLP-VW-02: Pipeline View shows deals organized by stage**
- Initial: User is on /deals
- Action: Click "Pipeline View" tab
- Expected: Deals are displayed in a Kanban/board layout with columns for each stage (Lead, Qualification, Discovery, Proposal, Negotiation, Closed Won). Deal cards are shown in appropriate columns.

**DLP-VW-03: Switching between views preserves data**
- Initial: User is in Table View
- Action: Switch to Pipeline View, then back to Table View
- Expected: Same deals are shown. No data loss or reloading issues.

#### FilterControls

**DLP-FLT-01: Stage filter shows all stage options**
- Initial: User is on /deals
- Action: Click Stage filter dropdown
- Expected: Options: All Stages, Lead, Qualification, Discovery, Proposal Sent, Negotiation, Closed Won, Closed Lost.

**DLP-FLT-02: Filtering by stage shows only matching deals**
- Initial: Deals table has deals at various stages
- Action: Select "Proposal Sent" from Stage filter
- Expected: Only deals with "Proposal Sent" stage are displayed.

**DLP-FLT-03: Client filter shows all client options**
- Initial: User is on /deals
- Action: Click Client filter dropdown
- Expected: Options: "All Clients" plus all clients that have deals.

**DLP-FLT-04: Filtering by client shows only that client's deals**
- Initial: Multiple clients have deals
- Action: Select "Acme Corp." from Client filter
- Expected: Only Acme Corp.'s deals are displayed.

**DLP-FLT-05: Status filter shows status options**
- Initial: User is on /deals
- Action: Click Status filter dropdown
- Expected: Options include: Active, Won, Lost, On Hold, etc.

**DLP-FLT-06: Date range filter limits deals by close date**
- Initial: Deals have various close dates
- Action: Set date range to "2023-10-01" to "2023-12-31"
- Expected: Only deals with close dates in that range are displayed.

**DLP-FLT-07: Sort by Close Date orders deals correctly**
- Initial: Sort is set to "Close Date (Newest)"
- Action: Observe deal order
- Expected: Deals are ordered by close date, newest first. The Close Date column header has a sort arrow indicator.

**DLP-FLT-08: Search filters deals by name**
- Initial: Deals table has various deals
- Action: Type "Alpha" in search input
- Expected: Only deals with "Alpha" in the name are shown (e.g., "Project Alpha Expansion").

#### DealsTable

**DLP-TBL-01: Table displays correct column headers**
- Initial: Navigate to /deals in Table View
- Action: Observe table headers
- Expected: Columns: Deal Name, Client, Stage, Owner, Value, Close Date (with sort arrow), Status.

**DLP-TBL-02: Deal rows display all required fields**
- Initial: Deal "Project Alpha Expansion" exists for Acme Corp., stage Proposal Sent, owner Sarah K., value $250,000, close date 2023-11-15, status On Track
- Action: Observe the row
- Expected: Row shows all values correctly. Status "On Track" shown as colored badge (blue/green). Value formatted as "$250,000".

**DLP-TBL-03: Status badges have correct colors**
- Initial: Deals with different statuses exist
- Action: Observe status badges
- Expected: "On Track" is blue/green, "Needs Attention" is yellow/orange, "At Risk" is red, "Won" is green.

**DLP-TBL-04: Clicking a deal row navigates to DealDetailPage**
- Initial: Deal "Project Alpha Expansion" is in the table
- Action: Click on the row
- Expected: App navigates to /deals/<dealId> for that deal.

**DLP-TBL-05: Close Date column is sortable**
- Initial: Deals are shown
- Action: Click Close Date column header
- Expected: Deals reorder by close date. Arrow indicator toggles direction (ascending/descending).

#### RowActionMenu

**DLP-ACT-01: Row action menu shows deal actions**
- Initial: User is on deals list
- Action: Click "..." on a deal row
- Expected: Dropdown with options: View, Edit, Delete.

**DLP-ACT-02: Delete deal removes it after confirmation**
- Initial: Action menu open for a deal
- Action: Click Delete, confirm
- Expected: Deal is removed from the table. Summary cards update. Deletion persisted.

#### Pagination

**DLP-PGN-01: Pagination shows page count**
- Initial: Many deals exist
- Action: Observe pagination area
- Expected: "Page 1 of 9" displayed. Navigation controls to go to next/previous pages.

**DLP-PGN-02: Navigating pages loads correct deals**
- Initial: On page 1
- Action: Go to page 2
- Expected: Different set of deals shown. "Page 2 of 9" displayed.

---

## 5. DealDetailPage (/deals/:dealId)

### Components
- **DealHeader**: Deal title (e.g., "DEAL DETAILS: Acme Corp - $250k Expansion Deal"), editable fields for Client, Value, Owner, Stage dropdown, and "Change Stage" button
- **StagePipeline**: Visual horizontal pipeline showing stages (Lead → Qualification → Discovery → Proposal → Negotiation → Closed Won) with current stage highlighted and completed stages marked with checkmarks. Progress bar underneath.
- **DealHistorySection**: "Deal History" heading with chronological list of stage changes (date, time, old stage → new stage, user)
- **DealMetricsSection**: "Deal Metrics" showing Probability percentage and Expected Close date
- **WriteupsSection**: "Writeups" heading with "+ New Entry" button. Each writeup shows title, author, date, content preview, "Edit" and "Version History" buttons
- **LinkedTasksSection**: "Linked Tasks" heading with "Add Task" button. Tasks with checkboxes, names, due dates, and completion status
- **AttachmentsSection**: "Attachments" heading with upload icon. Each file shows name, size, Download and Delete links
- **ContactsSection**: "Contacts/Individuals" heading with avatar, name, role (Decision Maker/Influencer), company, and "View Profile" link

### Test Entries

#### DealHeader

**DDP-HDR-01: Header displays deal info with editable fields**
- Initial: Navigate to /deals/12345 where deal is "Acme Corp - $250k Expansion Deal"
- Action: Observe the header
- Expected: Title "DEAL DETAILS: Acme Corp - $250k Expansion Deal". Fields shown: Client (Acme Corporation), Value ($250,000), Owner (Sarah Lee), Stage dropdown showing "Discovery". "Change Stage" button visible.

**DDP-HDR-02: Editing client field updates the deal**
- Initial: Deal client is "Acme Corporation"
- Action: Edit client field to "Beta Industries", save
- Expected: Client updates to "Beta Industries". Change persisted.

**DDP-HDR-03: Editing value field updates the deal**
- Initial: Deal value is "$250,000"
- Action: Edit value to "$300,000", save
- Expected: Value updates. Header title updates if it includes the value. Change persisted.

**DDP-HDR-04: Changing stage via dropdown and Change Stage button**
- Initial: Deal stage is "Discovery"
- Action: Select "Proposal" from stage dropdown, click "Change Stage"
- Expected: Stage updates to "Proposal". Pipeline visual updates (Proposal now highlighted as current). A deal history entry is created: "Changed Stage from Discovery to Proposal (User)". Deal metrics probability may update. Change persisted. Client timeline entry also created.

#### StagePipeline

**DDP-PIP-01: Stage pipeline displays all stages with visual progress**
- Initial: Deal is at "Discovery" stage
- Action: Observe the pipeline section
- Expected: Horizontal pipeline shows stages: Lead, Qualification, Discovery (Current), Proposal, Negotiation, Closed Won. Lead and Qualification have checkmarks (completed). Discovery is highlighted as "(Current)". Remaining stages are grayed/unfilled. A progress bar underneath shows progress proportional to current stage.

**DDP-PIP-02: Pipeline updates when stage changes**
- Initial: Deal is at Discovery
- Action: Change stage to Proposal
- Expected: Discovery now shows a checkmark. Proposal is highlighted as current. Progress bar advances.

#### DealHistorySection

**DDP-HIS-01: Deal history shows stage change log**
- Initial: Deal has had stage changes: Lead → Qualification (Oct 18 by John Doe), Qualification → Discovery (Oct 25 by Sarah Lee)
- Action: Observe Deal History section
- Expected: Section headed "Deal History". Entries in reverse chronological order: "Oct 25, 2023, 2:30 PM: Changed Stage from Qualification to Discovery (Sarah Lee)" and "Oct 18, 2023, 10:15 AM: Changed Stage from Lead to Qualification (John Doe)".

**DDP-HIS-02: New stage change adds history entry**
- Initial: History has 2 entries
- Action: Change stage from Discovery to Proposal
- Expected: A third entry appears at the top: "Changed Stage from Discovery to Proposal" with current date/time and current user.

#### DealMetricsSection

**DDP-MET-01: Deal metrics displays probability and expected close**
- Initial: Deal has probability 40% and expected close Dec 15, 2023
- Action: Observe Deal Metrics section
- Expected: "Deal Metrics" section shows "Probability: 40%" and "Expected Close: Dec 15, 2023".

**DDP-MET-02: Metrics are editable**
- Initial: Probability is 40%
- Action: Edit probability to 60%, save
- Expected: Probability updates to 60%. Change persisted.

#### WriteupsSection

**DDP-WRT-01: Writeups section shows existing writeups**
- Initial: Deal has writeups: "Strategy Update" (Oct 20, Sarah Lee, "Emphasizing our cloud integration capabilities..."), "Needs Analysis" (Oct 15, John Doe, "Client requires scalability and enhanced security features.")
- Action: Observe Writeups section
- Expected: Section headed "Writeups" with "+ New Entry" button. Each writeup card shows: title (bold), date and author, content preview. "Edit" (pencil icon) and "Version History" (clock icon) buttons on each.

**DDP-WRT-02: New Entry button opens writeup creation form**
- Initial: User is on DealDetailPage
- Action: Click "+ New Entry"
- Expected: A form/modal opens with fields: title, content (rich text or plain text area). Save/Cancel buttons.

**DDP-WRT-03: Creating a writeup persists and shows in list**
- Initial: Writeup creation form is open
- Action: Fill title "Competitor Analysis", content "Main competitor is...", click Save
- Expected: New writeup "Competitor Analysis" appears in the list with today's date and current user. Persisted.

**DDP-WRT-04: Edit button allows editing a writeup**
- Initial: Writeup "Strategy Update" exists
- Action: Click "Edit" on that writeup
- Expected: Writeup content becomes editable. Save/Cancel buttons appear.

**DDP-WRT-05: Editing a writeup creates a version history entry**
- Initial: Writeup "Strategy Update" has original content
- Action: Edit content, save
- Expected: Updated content shown. "Version History" button now shows at least 2 versions.

**DDP-WRT-06: Version History button shows previous versions**
- Initial: Writeup has been edited at least once
- Action: Click "Version History"
- Expected: A modal/panel shows a list of versions with dates, authors, and ability to view previous content.

#### LinkedTasksSection

**DDP-LTK-01: Linked tasks section shows deal-specific tasks**
- Initial: Deal has tasks: "Prepare Proposal Draft" (Due: Oct 30, uncompleted), "Schedule Follow-up Meeting" (Completed: Oct 22)
- Action: Observe Linked Tasks section
- Expected: Section headed "Linked Tasks" with "Add Task" button. Tasks listed with checkboxes: "Prepare Proposal Draft" (unchecked, Due: Oct 30), "Schedule Follow-up Meeting" (checked/crossed, Completed: Oct 22).

**DDP-LTK-02: Add Task button opens task creation form**
- Initial: User is on DealDetailPage
- Action: Click "Add Task"
- Expected: Form/modal opens with fields: task title, due date, priority, description. The deal is automatically pre-associated. Save/Cancel buttons.

**DDP-LTK-03: Creating a task adds it to linked tasks and client tasks**
- Initial: Task form is open
- Action: Fill title "Review Contract Terms", due date Nov 5, click Save
- Expected: Task appears in Linked Tasks section. Task also appears in the associated client's Tasks section on ClientDetailPage. A timeline entry is created on both the deal and client.

**DDP-LTK-04: Checking a task marks it complete**
- Initial: Task "Prepare Proposal Draft" is unchecked
- Action: Click the checkbox
- Expected: Task shows as completed (checked, text may have strikethrough). Status change persisted. Timeline entry created.

#### AttachmentsSection

**DDP-ATT-01: Attachments section lists deal-specific files**
- Initial: Deal has attachments: "Acme_Requirements.pdf" (2.4 MB), "Meeting_Notes_Oct18.docx" (50 KB)
- Action: Observe Attachments section
- Expected: Section headed "Attachments" with upload icon button. Each file shows: a file-type-specific preview (icon matching the file extension, or a thumbnail for image files), filename, file type label, size in parentheses, "Download" link, and "Delete" link.

**DDP-ATT-02: Upload icon opens file upload dialog**
- Initial: User is on DealDetailPage
- Action: Click the upload icon
- Expected: File picker/upload dialog opens. User can select a file to upload.

**DDP-ATT-03: Uploading a file adds it to attachments list**
- Initial: Upload dialog is open
- Action: Select and upload "Pricing_Sheet.xlsx"
- Expected: File appears in attachments list with name and size. File stored via UploadThing. Also appears in client's Attachments section linked to this deal.

**DDP-ATT-04: Download link downloads the file**
- Initial: "Acme_Requirements.pdf" is listed
- Action: Click "Download"
- Expected: File download initiates.

**DDP-ATT-05: Delete link removes attachment after confirmation**
- Initial: "Meeting_Notes_Oct18.docx" is listed
- Action: Click "Delete"
- Expected: Confirmation dialog appears. Confirming removes the file from the list and deletes from storage. Change persisted.

#### ContactsSection

**DDP-CON-01: Contacts section lists deal-related individuals**
- Initial: Deal has contacts: Jane Smith (Decision Maker, Acme Corp), Bob Johnson (Influencer, Acme Corp)
- Action: Observe Contacts/Individuals section
- Expected: Section headed "Contacts/Individuals". Each entry shows: avatar, name, role in parentheses (Decision Maker/Influencer), company, and "View Profile" link.

**DDP-CON-02: View Profile link navigates to PersonDetailPage**
- Initial: "Jane Smith" is listed
- Action: Click "View Profile"
- Expected: App navigates to /individuals/<individualId> for Jane Smith.

---

## 6. TasksListPage (/tasks)

### Components
- **PageHeader**: "Upcoming Tasks" title with "New Task" button (accent/primary styled)
- **FilterBar**: Filter dropdown/icon and text filter input with "Filter..." placeholder
- **TaskCards**: Card-based layout. Each card shows: priority badge (High/Medium/Low/Normal with color), task title, due date/time, assignee avatar + name + role, and "..." action menu
- **Navigation**: Top navigation bar (consistent with app sidebar or horizontal nav)

### Test Entries

#### PageHeader

**TLP-HDR-01: Page header shows title and New Task button**
- Initial: Navigate to /tasks
- Action: Observe header
- Expected: "Upcoming Tasks" title displayed. "New Task" button (blue/accent colored) visible on the right.

**TLP-HDR-02: New Task button opens task creation modal**
- Initial: User is on /tasks
- Action: Click "New Task"
- Expected: A modal opens with fields: title, description, due date/time, priority (High/Medium/Low/Normal), assignee (dropdown), associated client (dropdown), associated deal (optional dropdown). Save/Cancel buttons.

**TLP-HDR-03: Creating a task persists and appears in list**
- Initial: Task creation modal is open
- Action: Fill title "Finalize Q3 Marketing Plan", due "Today, 5:00 PM", priority "High", assignee "Sarah J. (PM)", client "Acme Corp", click Save
- Expected: Modal closes. New task card appears in the list at appropriate position. Task persisted. Shows correct priority badge, title, due date, and assignee.

#### FilterBar

**TLP-FLT-01: Filter controls are displayed**
- Initial: Navigate to /tasks
- Action: Observe filter area
- Expected: Filter icon/dropdown and text input with "Filter..." placeholder are visible.

**TLP-FLT-02: Filter by priority shows matching tasks**
- Initial: Tasks with different priorities exist
- Action: Select "High" priority filter
- Expected: Only tasks with "High" priority badge are displayed.

**TLP-FLT-03: Text filter searches task titles**
- Initial: Tasks list has various tasks
- Action: Type "Marketing" in filter input
- Expected: Only tasks with "Marketing" in the title are shown.

**TLP-FLT-04: Filter by assignee shows matching tasks**
- Initial: Tasks assigned to different people exist
- Action: Filter by assignee "Sarah J."
- Expected: Only Sarah J.'s tasks are displayed.

**TLP-FLT-05: Filter by client shows matching tasks**
- Initial: Tasks for different clients exist
- Action: Filter by client
- Expected: Only tasks for the selected client are displayed.

**TLP-FLT-06: Clearing filters restores full task list**
- Initial: Filters are active
- Action: Clear all filters
- Expected: All tasks are shown again.

#### TaskCards

**TLP-CRD-01: Task cards display all required information**
- Initial: Task "Finalize Q3 Marketing Plan" exists with priority High, due Today 5:00 PM, assignee Sarah J. (PM)
- Action: Observe the task card
- Expected: Card shows: red "High" priority badge on left, "Finalize Q3 Marketing Plan" title, "Due: Today, 5:00 PM" date, assignee avatar + "Sarah J. (PM)" on right, "..." menu button.

**TLP-CRD-02: Priority badges have correct colors**
- Initial: Tasks with different priorities exist
- Action: Observe priority badges
- Expected: "High" badge is red, "Medium" badge is yellow/amber, "Low" badge is green, "Normal" badge is blue/gray.

**TLP-CRD-03: Task cards are ordered by due date (soonest first)**
- Initial: Multiple tasks with different due dates
- Action: Observe card order
- Expected: Tasks are ordered with the soonest due date first (Today before Tomorrow before future dates).

**TLP-CRD-04: Clicking a task card navigates to task context**
- Initial: Task "Finalize Q3 Marketing Plan" is shown
- Action: Click on the card (not the ... menu)
- Expected: Navigates to the associated client's detail page or shows task detail. If task is associated with a deal, may navigate to deal detail.

**TLP-CRD-05: Action menu on task card shows options**
- Initial: User is on /tasks
- Action: Click "..." on a task card
- Expected: Dropdown shows options: Edit, Mark Complete, Delete.

**TLP-CRD-06: Mark Complete removes task from upcoming list**
- Initial: Task "Review Client Proposal Draft" is shown
- Action: Click "..." → "Mark Complete"
- Expected: Task is marked as completed and disappears from the upcoming tasks list (or moves to a completed section). Change persisted. Timeline entry created on associated client.

**TLP-CRD-07: Edit opens task edit form**
- Initial: Action menu open for a task
- Action: Click "Edit"
- Expected: Edit modal opens with pre-filled task details. User can modify title, due date, priority, assignee.

**TLP-CRD-08: Editing a task persists changes**
- Initial: Edit modal for "Finalize Q3 Marketing Plan"
- Action: Change due date to tomorrow, click Save
- Expected: Card updates with new due date. Change persisted.

**TLP-CRD-09: Delete task removes it after confirmation**
- Initial: Action menu open for a task
- Action: Click "Delete"
- Expected: Confirmation dialog appears. Confirming removes the task card. Deletion persisted. No longer appears on associated client or deal.

---

## Cross-Cutting Test Entries

### Navigation

**NAV-01: Default route redirects to /clients**
- Initial: User navigates to / (root)
- Action: Observe
- Expected: App redirects to /clients (ClientsListPage).

**NAV-02: Unknown routes show 404 or redirect**
- Initial: User navigates to /nonexistent
- Action: Observe
- Expected: A 404 page is shown or user is redirected to /clients.

**NAV-03: Browser back/forward navigation works correctly**
- Initial: User navigates /clients → /deals → /tasks
- Action: Click browser back button twice, then forward once
- Expected: Back goes to /deals, back again to /clients, forward goes to /deals. State is preserved.

### Data Consistency

**DATA-01: Creating a deal on ClientDetailPage shows on DealsListPage**
- Initial: New deal created for "Acme Corp" on ClientDetailPage
- Action: Navigate to /deals
- Expected: The new deal appears in the deals table for Acme Corp.

**DATA-02: Completing a task on DealDetailPage reflects on ClientDetailPage and TasksListPage**
- Initial: Task linked to a deal is completed on DealDetailPage
- Action: Navigate to the client's detail page and /tasks
- Expected: Task shows as completed on client page. Task disappears from upcoming tasks on TasksListPage.

**DATA-03: Adding a person on ClientDetailPage creates accessible PersonDetailPage**
- Initial: New person "Emily Davis" added to Acme Corp
- Action: Click on Emily Davis in the People section
- Expected: Navigates to /individuals/<id> showing Emily Davis's PersonDetailPage with Acme Corp listed in Associated Clients.

**DATA-04: Deleting a client removes associated data from other pages**
- Initial: Client "Test Corp" exists with deals and tasks
- Action: Delete "Test Corp" from ClientsListPage
- Expected: Client's deals no longer appear on DealsListPage. Client's tasks no longer appear on TasksListPage. Associated persons still exist but no longer show this client in their Associated Clients section.

**DATA-05: Uploading an attachment on DealDetailPage shows on ClientDetailPage**
- Initial: Attachment uploaded to a deal
- Action: Navigate to the associated client's detail page
- Expected: Attachment appears in the client's Attachments section with the deal linked.

### Timeline Atomicity

**ATOM-01: Single task creation produces exactly one timeline entry**
- Initial: Client timeline has N entries
- Action: Create one task via Add Task
- Expected: Timeline has N+1 entries. No duplicates.

**ATOM-02: Single deal stage change produces exactly one timeline entry**
- Initial: Client timeline has N entries
- Action: Change deal stage once
- Expected: Timeline has N+1 entries. No duplicates.

**ATOM-03: Single status change produces exactly one timeline entry**
- Initial: Client timeline has N entries
- Action: Change client status once
- Expected: Timeline has N+1 entries. No duplicates.
