# Sales CRM — Development Plan

## Architecture Overview

- **Frontend**: React 18 SPA with Redux state management, built with Vite + TypeScript (strict)
- **UI Components**: shadcn/ui, styled following Linear-inspired design (AppStyle.md)
- **Backend**: Netlify Functions (serverless), connecting to Neon Postgres database
- **File Storage**: UploadThing
- **Routing**: React Router with pages: /clients, /clients/:clientId, /individuals/:individualId, /deals, /deals/:dealId, /tasks

## Pages

1. ClientsListPage (/clients) — tabular list with search, filter, sort
2. ClientDetailPage (/clients/:clientId) — multi-section detail view
3. PersonDetailPage (/individuals/:individualId) — individual detail with relationships, contact history
4. DealsListPage (/deals) — pipeline/board + table view of deals
5. DealDetailPage (/deals/:dealId) — deal detail with stages, writeups, tasks, attachments
6. TasksListPage (/tasks) — list of all upcoming tasks

## Stages & Tasks

### Stage 1: Test Specification (testSpec.md)
- [x] UnpackTestSpec: Unpack the test specification stage into subtasks
- [x] PlanPages: Read the spec, decide on pages, add PlanPage subtasks
- [x] PlanPageClientsListPage: Define components and test entries for ClientsListPage (/clients)
- [x] PlanPageClientDetailPage: Define components and test entries for ClientDetailPage (/clients/:clientId)
- [x] PlanPagePersonDetailPage: Define components and test entries for PersonDetailPage (/individuals/:individualId)
- [x] PlanPageDealsListPage: Define components and test entries for DealsListPage (/deals)
- [x] PlanPageDealDetailPage: Define components and test entries for DealDetailPage (/deals/:dealId)
- [x] PlanPageTasksListPage: Define components and test entries for TasksListPage (/tasks)
- **Stage 1 COMPLETE**: All test specifications written in docs/tests.md (100+ test entries across 6 pages + cross-cutting tests)

### Stage 2: Write App (writeApp.md)
- [x] UnpackWriteApp: Unpack the write app stage into subtasks
- [x] SetupApp: Initialize the Vite + React + TypeScript project with all dependencies (Redux, React Router, shadcn/ui, etc.), configure ESLint, tsconfig strict mode, Netlify Functions structure, and the init-db script
- [x] DesignDatabase: Design the Postgres schema for all entities (clients, individuals, deals, tasks, attachments, timeline events, relationships, contact history, writeups) and implement the init-db script
- [x] UnpackWritePageClientsListPage: Plan and create subtasks for implementing the ClientsListPage (/clients) components
  - [x] WriteComponentClientsPageHeader: Page header with title, Import, Export, Add New Client buttons
  - [x] WriteComponentClientsSearchBar: Search input for filtering clients by name/tag/contact
  - [x] WriteComponentClientsFilterControls: Status, Tags, Source, Sort filter dropdowns
  - [x] WriteComponentClientsTable: Table with columns: Client Name, Type, Status, Tags, Primary Contact, Open Deals, Next Task
  - [x] WriteComponentClientRowActionMenu: Three-dot action menu with View, Edit, Delete options
  - [x] WriteComponentClientsPagination: Page navigation with count display and Previous/Next buttons
  - [x] WriteComponentAddClientModal: Modal form for creating a new client
  - [x] WritePageClientsListPage: Assemble all components into the final page
- [x] UnpackWritePageClientDetailPage: Plan and create subtasks for implementing the ClientDetailPage (/clients/:clientId) components
  - [x] WriteComponentClientDetailBackend: Create Netlify functions for client detail data (tasks, deals, attachments, people, timeline) and update clients function with PUT for editing
  - [x] WriteComponentClientHeader: Client name, type badge, status badge, tags with inline edit capability
  - [x] WriteComponentQuickActions: Row of action buttons — Add Task, Add Deal, Add Attachment, Add Person
  - [x] WriteComponentSourceInfoSection: Source info fields (Acquisition Source, Campaign, Channel, Date Acquired) with edit mode
  - [x] WriteComponentTasksSection: Unresolved tasks list with checkboxes, due dates, deal associations
  - [x] WriteComponentDealsSection: Deals list with name, stage, value, clickable to deal detail
  - [x] WriteComponentAttachmentsSection: File/link attachments list with download/view/delete actions
  - [x] WriteComponentPeopleSection: Associated individuals list with avatars, names, roles
  - [x] WriteComponentTimelineSection: Chronological feed of events with type, description, user attribution
  - [x] WriteComponentClientDetailModals: Add Task, Add Deal, Add Attachment, Add Person modals
  - [x] WritePageClientDetailPage: Assemble all components into the final page
- [x] UnpackWritePagePersonDetailPage: Plan and create subtasks for implementing the PersonDetailPage (/individuals/:individualId) components
  - [x] WriteComponentPersonDetailBackend: Create Netlify function for individual detail data (GET individual with associations/relationships/contact history, PUT to update, POST/PUT/DELETE for relationships and contact history)
  - [x] WriteComponentPersonHeader: Person name, title/role, client associations, contact info (email, phone, location) with inline edit
  - [x] WriteComponentRelationshipsSection: Relationships with other individuals — List View/Graph View tabs, filter, add entry
  - [x] WriteComponentContactHistorySection: Chronological log of interactions — filter, add/edit entries with type, summary, team member
  - [x] WriteComponentAssociatedClientsSection: Card-based display of associated clients with status, industry, and View Client Detail Page button
  - [x] WriteComponentPersonDetailModals: Add Relationship modal, Add Contact History Entry modal, Edit Contact History Entry modal
  - [x] WritePagePersonDetailPage: Assemble all components into the final page, then commit and exit
- [x] UnpackWritePageDealsListPage: Plan and create subtasks for implementing the DealsListPage (/deals) components
  - [x] WriteComponentDealsBackend: Create Netlify function for global deals listing with search, filter, sort, pagination, CRUD, metrics, and stage change history
  - [x] WriteComponentDealsPageHeader: Page header with breadcrumb, title "Deals List", "Create New Deal" button, and search input
  - [x] WriteComponentDealsSummaryCards: Four metric cards (Total Active Deals, Pipeline Value, Won, Lost) with icons and formatted values
  - [x] WriteComponentDealsViewToggle: Table View / Pipeline View tab toggle
  - [x] WriteComponentDealsFilterControls: Stage, Client, Status, Sort, and Date Range filter dropdowns
  - [x] WriteComponentDealsTable: Table with Deal Name, Client, Stage, Owner, Value, Close Date (sortable), Status columns
  - [x] WriteComponentDealStageBadge: Colored badge for deal stages (Lead, Qualification, Discovery, etc.)
  - [x] WriteComponentDealStatusBadge: Colored badge for deal status (Active, On Track, At Risk, etc.)
  - [x] WriteComponentDealRowActionMenu: Three-dot action menu with View, Edit, Delete options
  - [x] WriteComponentDealsPipelineView: Kanban-style pipeline board with columns per stage, deal cards with name/client/value/status
  - [x] WriteComponentDealsPagination: Page indicator with Previous/Next navigation
  - [x] WriteComponentCreateDealModal: Modal form with deal name, client, value, stage, owner, close date fields
  - [x] WritePageDealsListPage: Assemble all components into the final page with Redux state management
- [x] UnpackWritePageDealDetailPage: Plan and create subtasks for implementing the DealDetailPage (/deals/:dealId) components
  - [x] WriteComponentDealDetailBackend: Create Netlify function for deal detail data (history, writeups, tasks, attachments, contacts CRUD)
  - [x] WriteComponentDealDetailHeader: Deal title, client, value, owner, stage dropdown with change stage button
  - [x] WriteComponentStagePipeline: Visual horizontal pipeline showing stages with current stage highlighted, checkmarks on completed, progress bar
  - [x] WriteComponentDealHistorySection: Chronological list of stage changes with date, time, old→new stage, user
  - [x] WriteComponentDealMetricsSection: Probability percentage and expected close date, editable
  - [x] WriteComponentWriteupsSection: Writeups list with add/edit/version history
  - [x] WriteComponentLinkedTasksSection: Deal-specific tasks with checkboxes, add task button
  - [x] WriteComponentDealAttachmentsSection: Deal attachments with upload/download/delete
  - [x] WriteComponentDealContactsSection: Deal contacts with avatar, name, role, company, view profile link
  - [x] WriteComponentDealDetailModals: Add Writeup, Add Task, Upload Attachment, Version History modals
  - [x] WritePageDealDetailPage: Assemble all components into the final page
- [x] UnpackWritePageTasksListPage: Plan and create subtasks for implementing the TasksListPage (/tasks) components
  - [x] WriteComponentTasksBackend: Create Netlify function for global tasks listing with search, filter, CRUD, and related data (assignees, clients)
  - [x] WriteComponentTasksPageHeader: Page header with "Upcoming Tasks" title and "New Task" button
  - [x] WriteComponentTasksFilterBar: Filter dropdown (priority, assignee, client) and text filter input
  - [x] WriteComponentTaskPriorityBadge: Colored priority badge (High=red, Medium=amber, Low=green, Normal=blue)
  - [x] WriteComponentTaskCard: Card with priority badge, title, due date, assignee avatar/name, and action menu (Edit, Mark Complete, Delete)
  - [x] WriteComponentCreateTaskModal: Modal form with title, description, due date, priority, assignee, client, deal fields
  - [x] WriteComponentEditTaskModal: Modal form pre-filled with existing task data for editing
  - [x] WritePageTasksListPage: Assemble all components into the final page with Redux state management

### Stage 3: Write Tests (writeTests.md)
- [x] UnpackWriteTests: Unpack the write tests stage into subtasks
- [x] SetupPlaywright: Install Playwright, configure test infrastructure, create test helpers and fixtures
- [x] WriteTestCLP_NAV: Write tests for ClientsListPage SidebarNavigation (CLP-NAV-01, CLP-NAV-02)
- [x] WriteTestCLP_HDR: Write tests for ClientsListPage PageHeader (CLP-HDR-01 through CLP-HDR-05)
- [x] WriteTestCLP_SRCH: Write tests for ClientsListPage SearchBar (CLP-SRCH-01 through CLP-SRCH-05)
- [x] WriteTestCLP_FLT: Write tests for ClientsListPage FilterControls (CLP-FLT-01 through CLP-FLT-09)
- [x] WriteTestCLP_TBL: Write tests for ClientsListPage ClientsTable (CLP-TBL-01 through CLP-TBL-08)
- [x] WriteTestCLP_ACT: Write tests for ClientsListPage RowActionMenu (CLP-ACT-01 through CLP-ACT-04)
- [x] WriteTestCLP_PGN: Write tests for ClientsListPage Pagination (CLP-PGN-01 through CLP-PGN-04), then commit and exit
- [ ] WriteTestCDP_HDR: Write tests for ClientDetailPage ClientHeader (CDP-HDR-01 through CDP-HDR-05)
- [ ] WriteTestCDP_QA: Write tests for ClientDetailPage QuickActions (CDP-QA-01 through CDP-QA-09)
- [ ] WriteTestCDP_SRC: Write tests for ClientDetailPage SourceInfoSection (CDP-SRC-01 through CDP-SRC-03)
- [ ] WriteTestCDP_TSK: Write tests for ClientDetailPage TasksSection (CDP-TSK-01 through CDP-TSK-04)
- [ ] WriteTestCDP_DL: Write tests for ClientDetailPage DealsSection (CDP-DL-01, CDP-DL-02)
- [ ] WriteTestCDP_ATT: Write tests for ClientDetailPage AttachmentsSection (CDP-ATT-01 through CDP-ATT-04)
- [ ] WriteTestCDP_PPL: Write tests for ClientDetailPage PeopleSection (CDP-PPL-01, CDP-PPL-02)
- [ ] WriteTestCDP_TL: Write tests for ClientDetailPage TimelineSection (CDP-TL-01 through CDP-TL-08), then commit and exit
- [ ] WriteTestPDP_HDR: Write tests for PersonDetailPage PersonHeader (PDP-HDR-01 through PDP-HDR-04)
- [ ] WriteTestPDP_REL: Write tests for PersonDetailPage RelationshipsSection (PDP-REL-01 through PDP-REL-07)
- [ ] WriteTestPDP_CH: Write tests for PersonDetailPage ContactHistorySection (PDP-CH-01 through PDP-CH-07)
- [ ] WriteTestPDP_AC: Write tests for PersonDetailPage AssociatedClientsSection (PDP-AC-01, PDP-AC-02), then commit and exit
- [ ] WriteTestDLP_HDR: Write tests for DealsListPage PageHeader (DLP-HDR-01 through DLP-HDR-03)
- [ ] WriteTestDLP_SUM: Write tests for DealsListPage SummaryCards (DLP-SUM-01, DLP-SUM-02)
- [ ] WriteTestDLP_VW: Write tests for DealsListPage ViewToggle (DLP-VW-01 through DLP-VW-03)
- [ ] WriteTestDLP_FLT: Write tests for DealsListPage FilterControls (DLP-FLT-01 through DLP-FLT-08)
- [ ] WriteTestDLP_TBL: Write tests for DealsListPage DealsTable (DLP-TBL-01 through DLP-TBL-05)
- [ ] WriteTestDLP_ACT: Write tests for DealsListPage RowActionMenu (DLP-ACT-01, DLP-ACT-02)
- [ ] WriteTestDLP_PGN: Write tests for DealsListPage Pagination (DLP-PGN-01, DLP-PGN-02), then commit and exit
- [ ] WriteTestDDP_HDR: Write tests for DealDetailPage DealHeader (DDP-HDR-01 through DDP-HDR-04)
- [ ] WriteTestDDP_PIP: Write tests for DealDetailPage StagePipeline (DDP-PIP-01, DDP-PIP-02)
- [ ] WriteTestDDP_HIS: Write tests for DealDetailPage DealHistorySection (DDP-HIS-01, DDP-HIS-02)
- [ ] WriteTestDDP_MET: Write tests for DealDetailPage DealMetricsSection (DDP-MET-01, DDP-MET-02)
- [ ] WriteTestDDP_WRT: Write tests for DealDetailPage WriteupsSection (DDP-WRT-01 through DDP-WRT-06)
- [ ] WriteTestDDP_LTK: Write tests for DealDetailPage LinkedTasksSection (DDP-LTK-01 through DDP-LTK-04)
- [ ] WriteTestDDP_ATT: Write tests for DealDetailPage AttachmentsSection (DDP-ATT-01 through DDP-ATT-05)
- [ ] WriteTestDDP_CON: Write tests for DealDetailPage ContactsSection (DDP-CON-01, DDP-CON-02), then commit and exit
- [ ] WriteTestTLP_HDR: Write tests for TasksListPage PageHeader (TLP-HDR-01 through TLP-HDR-03)
- [ ] WriteTestTLP_FLT: Write tests for TasksListPage FilterBar (TLP-FLT-01 through TLP-FLT-06)
- [ ] WriteTestTLP_CRD: Write tests for TasksListPage TaskCards (TLP-CRD-01 through TLP-CRD-09), then commit and exit
- [ ] WriteTestNAV: Write cross-cutting navigation tests (NAV-01 through NAV-03)
- [ ] WriteTestDATA: Write cross-cutting data consistency tests (DATA-01 through DATA-05)
- [ ] WriteTestATOM: Write cross-cutting timeline atomicity tests (ATOM-01 through ATOM-03), then commit and exit

### Stage 4: Testing (testing.md)
- [ ] UnpackTesting: Unpack the testing stage into subtasks

### Stage 5: Deployment (deployment.md)
- [ ] UnpackDeployment: Unpack the deployment stage into subtasks

## Decisions

- Following Linear-inspired design system from AppStyle.md (Inter Variable font, neutral palette with purple accent, compact density)
- Database accessed only through Netlify Functions
- `npm run init-db` creates and configures Neon database

## Blockers

None currently.
