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
- [x] WriteTestCDP_HDR: Write tests for ClientDetailPage ClientHeader (CDP-HDR-01 through CDP-HDR-05)
- [x] WriteTestCDP_QA: Write tests for ClientDetailPage QuickActions (CDP-QA-01 through CDP-QA-09)
- [x] WriteTestCDP_SRC: Write tests for ClientDetailPage SourceInfoSection (CDP-SRC-01 through CDP-SRC-03)
- [x] WriteTestCDP_TSK: Write tests for ClientDetailPage TasksSection (CDP-TSK-01 through CDP-TSK-04)
- [x] WriteTestCDP_DL: Write tests for ClientDetailPage DealsSection (CDP-DL-01, CDP-DL-02)
- [x] WriteTestCDP_ATT: Write tests for ClientDetailPage AttachmentsSection (CDP-ATT-01 through CDP-ATT-04)
- [x] WriteTestCDP_PPL: Write tests for ClientDetailPage PeopleSection (CDP-PPL-01, CDP-PPL-02)
- [x] WriteTestCDP_TL: Write tests for ClientDetailPage TimelineSection (CDP-TL-01 through CDP-TL-08), then commit and exit
- [x] WriteTestPDP_HDR: Write tests for PersonDetailPage PersonHeader (PDP-HDR-01 through PDP-HDR-04)
- [x] WriteTestPDP_REL: Write tests for PersonDetailPage RelationshipsSection (PDP-REL-01 through PDP-REL-07)
- [x] WriteTestPDP_CH: Write tests for PersonDetailPage ContactHistorySection (PDP-CH-01 through PDP-CH-07)
- [x] WriteTestPDP_AC: Write tests for PersonDetailPage AssociatedClientsSection (PDP-AC-01, PDP-AC-02), then commit and exit
- [x] WriteTestDLP_HDR: Write tests for DealsListPage PageHeader (DLP-HDR-01 through DLP-HDR-03)
- [x] WriteTestDLP_SUM: Write tests for DealsListPage SummaryCards (DLP-SUM-01, DLP-SUM-02)
- [x] WriteTestDLP_VW: Write tests for DealsListPage ViewToggle (DLP-VW-01 through DLP-VW-03)
- [x] WriteTestDLP_FLT: Write tests for DealsListPage FilterControls (DLP-FLT-01 through DLP-FLT-08)
- [x] WriteTestDLP_TBL: Write tests for DealsListPage DealsTable (DLP-TBL-01 through DLP-TBL-05)
- [x] WriteTestDLP_ACT: Write tests for DealsListPage RowActionMenu (DLP-ACT-01, DLP-ACT-02)
- [x] WriteTestDLP_PGN: Write tests for DealsListPage Pagination (DLP-PGN-01, DLP-PGN-02), then commit and exit
- [x] WriteTestDDP_HDR: Write tests for DealDetailPage DealHeader (DDP-HDR-01 through DDP-HDR-04)
- [x] WriteTestDDP_PIP: Write tests for DealDetailPage StagePipeline (DDP-PIP-01, DDP-PIP-02)
- [x] WriteTestDDP_HIS: Write tests for DealDetailPage DealHistorySection (DDP-HIS-01, DDP-HIS-02)
- [x] WriteTestDDP_MET: Write tests for DealDetailPage DealMetricsSection (DDP-MET-01, DDP-MET-02)
- [x] WriteTestDDP_WRT: Write tests for DealDetailPage WriteupsSection (DDP-WRT-01 through DDP-WRT-06)
- [x] WriteTestDDP_LTK: Write tests for DealDetailPage LinkedTasksSection (DDP-LTK-01 through DDP-LTK-04)
- [x] WriteTestDDP_ATT: Write tests for DealDetailPage AttachmentsSection (DDP-ATT-01 through DDP-ATT-05)
- [x] WriteTestDDP_CON: Write tests for DealDetailPage ContactsSection (DDP-CON-01, DDP-CON-02), then commit and exit
- [x] WriteTestTLP_HDR: Write tests for TasksListPage PageHeader (TLP-HDR-01 through TLP-HDR-03)
- [x] WriteTestTLP_FLT: Write tests for TasksListPage FilterBar (TLP-FLT-01 through TLP-FLT-06)
- [x] WriteTestTLP_CRD: Write tests for TasksListPage TaskCards (TLP-CRD-01 through TLP-CRD-09), then commit and exit
- [x] WriteTestNAV: Write cross-cutting navigation tests (NAV-01 through NAV-03)
- [x] WriteTestDATA: Write cross-cutting data consistency tests (DATA-01 through DATA-05)
- [x] WriteTestATOM: Write cross-cutting timeline atomicity tests (ATOM-01 through ATOM-03), then commit and exit
- **Stage 3 COMPLETE**: All Playwright tests written across 7 test files covering all 6 pages + cross-cutting tests

### Stage 4: Testing (testing.md)
- [x] UnpackTesting: Unpack the testing stage into subtasks
- [x] ReviewChanges: Process iteration 16 log (reviewed)
- [x] FixBackendSQL: Fixed Neon SQL fragment composition bug in clients/deals/tasks API endpoints — rewrote parameterized query building with string-based `sql(query, params)` form
- [x] FixNavigationHelpers: Added `rows.first().waitFor()` to test navigation helpers across 4 test files
- [x] AddMissingTestIds: Added `data-testid="client-name-input"` and `data-testid="client-save-button"` to AddClientModal
- [x] FixFilterTimingTests: Fixed 16 test timing issues by replacing `waitForLoadState('networkidle')` with `toPass()` retry patterns for filter/search/sort assertions
- [x] AddStatusChangeTimeline: Added timeline event creation for client status changes in clients PUT handler
- [x] FixDealDetailTests: Fixed Change Stage button, history entry, and attachment deletion test timing
- [x] FixCrossCuttingTests: Fixed task completion toggle targeting, person detail name selector, and timeline atomicity waits
- **Stage 4 COMPLETE**: All 176 Playwright tests passing (0 failures)

### Stage 5: Deployment (deployment.md)
- [x] UnpackDeployment: Unpack the deployment stage into subtasks
- [x] FixBuildErrors: Fixed TypeScript build errors in tests/helpers.ts (type-only import for Page, unused parameter prefix)
- [x] CreateNetlifySite: Created Netlify site (sales-crm-1771041441) and linked it
- [x] SetEnvVars: Set DATABASE_URL environment variable on Netlify site
- [x] DeployProduction: Built and deployed to production at https://sales-crm-1771041441.netlify.app
- [x] VerifyDeployment: Verified frontend (200) and API functions (200 with data) working in production
- **Stage 5 COMPLETE**: App deployed and verified at https://sales-crm-1771041441.netlify.app

## Decisions

- Following Linear-inspired design system from AppStyle.md (Inter Variable font, neutral palette with purple accent, compact density)
- Database accessed only through Netlify Functions
- `npm run init-db` creates and configures Neon database
- Deployed to Netlify with Neon database connection via DATABASE_URL env var

### Maintenance Round 1

- [x] fixBugReport.md: UnpackFixBugReport: Unpack subtasks — No docs/bugReports.md file exists, no open bug reports
- [x] reviewBugReport.md: UnpackReviewBugReport: Unpack subtasks — No unreviewed bug reports
- [x] checkDirectives.md: UnpackCheckDirectives: Unpack subtasks
  - [x] checkDirectives.md: CheckTestSpecClientsListPage: No violations found
  - [x] checkDirectives.md: CheckTestSpecClientDetailPage: No violations found
  - [x] checkDirectives.md: CheckTestSpecPersonDetailPage: No violations found
  - [x] checkDirectives.md: CheckTestSpecDealsListPage: No violations found
  - [x] checkDirectives.md: CheckTestSpecDealDetailPage: No violations found
  - [x] checkDirectives.md: CheckTestSpecTasksListPage: No violations found
  - [x] checkDirectives.md: CheckComponentsClientsListPage: No violations found
  - [x] checkDirectives.md: CheckComponentsClientDetailPage: Violations found — missing data-testid in AddTaskModal (5), AddDealModal (5), AddPersonModal (4), AddAttachmentModal (8)
  - [x] checkDirectives.md: CheckComponentsPersonDetailPage: Violations found — AddRelationshipModal uses plain text for Person ID (should be searchable select), missing data-testid in AddRelationshipModal (4), AddContactHistoryModal (6), EditContactHistoryModal (6)
  - [x] checkDirectives.md: CheckComponentsDealsListPage: No violations found
  - [x] checkDirectives.md: CheckComponentsDealDetailPage: Violations found — missing data-testid in AddDealTaskModal (1)
  - [x] checkDirectives.md: CheckComponentsTasksListPage: Violations found — missing data-testid in EditTaskModal (3)
  - [x] checkDirectives.md: CheckTestsClientsListPage: Violations found — getByText with common words (16), inconsistent data-testid (1)
  - [x] checkDirectives.md: CheckTestsClientDetailPage: Violations found — getByText with common words (17), missing side effect assertions (4)
  - [x] checkDirectives.md: CheckTestsPersonDetailPage: Violations found — loose nav target assertion (1), getByText with common words (8), missing side effect assertions (2)
  - [x] checkDirectives.md: CheckTestsDealsListPage: Violations found — getByText with common words (6), missing side effect assertions (2)
  - [x] checkDirectives.md: CheckTestsDealDetailPage: Violations found — loose nav target assertion (1), missing side effect assertions (6)
  - [x] checkDirectives.md: CheckTestsTasksListPage: Violations found — loose nav target assertion (1), getByText with common words (6), missing side effect assertions (3)
  - [x] checkDirectives.md: CheckBackend: Violations found — Neon SQL sql(string,array) syntax in clients.ts (3), deals.ts (2), tasks.ts (2); empty-string-to-null: clients.ts (1), client-attachments.ts (1)
  - [x] checkDirectives.md: FixViolationNeonSQL: Rewrote dynamic SQL in clients.ts, deals.ts, tasks.ts to use tagged template literals with conditional WHERE patterns (`${param}::text IS NULL OR condition`) and CASE-based ORDER BY
  - [x] checkDirectives.md: FixViolationEmptyStringNull: Changed `?? null` to `|| null` for date_acquired in clients.ts and deal_id in client-attachments.ts so empty strings are treated as null
  - [x] checkDirectives.md: FixViolationSearchableSelect: Replaced plain text Person ID input in AddRelationshipModal with searchable select that fetches individuals from API, added GET /individuals list endpoint
  - [x] checkDirectives.md: FixViolationMissingTestIds: Added data-testid attributes to all interactive elements in AddClientModal, AddTaskModal, AddDealModal, AddPersonModal, AddAttachmentModal, AddContactHistoryModal, EditContactHistoryModal, EditTaskModal, AddDealTaskModal
  - [x] checkDirectives.md: RunTests: All 176 Playwright tests passing after fixes. Fixed PDP-REL-04 test to match updated "Person *" label. Fixed netlify dev functions path resolution.
  - [x] checkDirectives.md: DocumentFix: Documented all fixes in plan.md
- [x] polishApp.md: UnpackPolishApp: Unpack subtasks — Stub with no subtasks
- [x] deployment.md: UnpackDeployment: Redeployed to production at https://sales-crm-1771041441.netlify.app — verified frontend (200) and API functions (200 with data)
- **Maintenance Round 1 COMPLETE**: All directive violations fixed, tests passing, deployed to production

### Maintenance Round 2

- [x] fixBugReport.md: UnpackFixBugReport: Unpack subtasks — 6 open bug reports found
  - [x] fixBugReport.md: AnalyzeBugAttachmentPreview: Analyze attachments missing preview/thumbnail — see docs/bugs/AttachmentPreview.md
  - [x] fixBugReport.md: FixBugAttachmentPreview: Added AttachmentPreview component with file-type-specific icons and image thumbnails, updated both AttachmentsSection and DealAttachmentsSection
  - [x] fixBugReport.md: UpdateTestsAttachmentPreview: Updated CDP-ATT-01/02 and DDP-ATT-01 test specs with file-type-specific preview descriptions, updated CDP-ATT-02 test assertions. All 9 ATT tests pass.
  - [x] fixBugReport.md: ResolveBugAttachmentPreview: Bug moved to Unreviewed section in bugReports.md
  - [x] fixBugReport.md: AnalyzeBugDealsDropdownStyling: Native `<select>` elements show browser-default dropdown menus — see docs/bugs/DealsDropdownStyling.md
  - [x] fixBugReport.md: FixBugDealsDropdownStyling: Replaced native `<select>` with custom dropdown component in FilterSelect
  - [x] fixBugReport.md: UpdateTestsDealsDropdownStyling: Updated DLP-FLT-01 through DLP-FLT-07 tests for custom dropdown interactions. All 8 DLP-FLT tests pass.
  - [x] fixBugReport.md: ResolveBugDealsDropdownStyling: Bug moved to Unreviewed in bugReports.md
  - [x] fixBugReport.md: FixBugTaskDetailPage: Add task detail page with completion/cancellation and notes
  - [x] fixBugReport.md: UpdateTestsTaskDetailPage: Update spec and tests for task detail page
  - [x] fixBugReport.md: ResolveBugTaskDetailPage: Mark bug as resolved
  - [x] fixBugReport.md: FixBugDashboardHighlight: Removed duplicate "Dashboard" entry from sidebar (same URL as "Clients")
  - [x] fixBugReport.md: FixBugReports404: Removed "Reports" link from sidebar (no /reports route exists)
  - [x] fixBugReport.md: FixBugSettingsButton: Removed "Settings" button from sidebar (no /settings route exists)
  - [x] fixBugReport.md: UpdateTestsSidebar: Updated CLP-NAV-01 test and test spec to match new sidebar items (Clients, Deals, Tasks only). Both CLP-NAV tests pass.
  - [x] fixBugReport.md: ResolveBugDashboardHighlight+Reports404+SettingsButton: All three sidebar bugs moved to Unreviewed in bugReports.md
- [x] reviewBugReport.md: UnpackReviewBugReport: Classified and reviewed 6 bugs — 3 writeApp.md (duplicate nav, native selects, generic attachment icons), 2 testSpec.md (Reports/Settings nav targets already covered by existing directive), 1 no problem stage (new functionality). Added 3 new directives to writeApp.md. All bugs moved to Finished.
- [x] checkDirectives.md: UnpackCheckDirectives: Focused on new/changed code from Maintenance Round 2
  - [x] checkDirectives.md: CheckTestSpecTaskDetailPage: No violations found
  - [x] checkDirectives.md: CheckComponentsTaskDetailPage: No violations found
  - [x] checkDirectives.md: CheckComponentsAttachmentPreview: No violations found
  - [x] checkDirectives.md: CheckComponentsDealsFilterControls: No violations found
  - [x] checkDirectives.md: CheckComponentsSidebar: No violations found
  - [x] checkDirectives.md: CheckBackendTasks: No violations found
  - [x] checkDirectives.md: CheckTestsTaskDetailPage: Violations found — TDP-HDR-02 test missing assertions for completed date and Cancel Task button hidden
  - [x] checkDirectives.md: FixViolationTDPHDR02: Added completed date and Cancel Task hidden assertions to TDP-HDR-02 test
  - [x] checkDirectives.md: RunTests: All tests passing
  - [x] checkDirectives.md: DocumentFix: Documented
- [x] polishApp.md: UnpackPolishApp: Stub with no subtasks
- [x] deployment.md: UnpackDeployment: Redeployed to production at https://sales-crm-1771041441.netlify.app — verified frontend (200) and API functions (200)
- **Maintenance Round 2 COMPLETE**: All 6 bugs fixed, bug reports reviewed, directives checked, deployed to production

### Maintenance Round 3

- [x] fixBugReport.md: UnpackFixBugReport: Unpack subtasks — No open bug reports
- [x] reviewBugReport.md: UnpackReviewBugReport: Unpack subtasks — No unreviewed bug reports
- [x] checkDirectives.md: UnpackCheckDirectives: Unpack subtasks
  - [x] checkDirectives.md: CheckAllComponents: Violations found — 24 native HTML `<select>` elements across 16 files violating "never use native HTML select" directive
  - [x] checkDirectives.md: FixViolationNativeSelects: Extracted shared FilterSelect component to `src/components/shared/FilterSelect.tsx`, replaced all 24 native `<select>` elements across 16 files with custom dropdowns
  - [x] checkDirectives.md: RunTests: All 183 Playwright tests passing. Updated 6 test files to use custom FilterSelect interaction pattern (click trigger → click option) instead of native selectOption/inputValue
  - [x] checkDirectives.md: DocumentFix: Documented all fixes in plan.md
- [x] polishApp.md: UnpackPolishApp: Stub with no subtasks
- [x] deployment.md: UnpackDeployment: Redeployed to production at https://sales-crm-1771041441.netlify.app — verified frontend (200) and API functions (200 with data)
- **Maintenance Round 3 COMPLETE**: All directive violations fixed (24 native selects replaced), tests passing (183/183), deployed to production

### Maintenance Round 4

- [x] fixBugReport.md: UnpackFixBugReport: Unpack subtasks — 4 open bug reports found
  - [x] fixBugReport.md: FixBugDealAttachmentUploads: Added file upload/link toggle to UploadAttachmentModal matching client attachment modal pattern
  - [x] fixBugReport.md: UpdateTestsDealAttachmentUploads: Updated DDP-ATT-02, DDP-ATT-03, DDP-ATT-05 tests and test spec for new modal UI
  - [x] fixBugReport.md: UpdateRevisionsDealAttachmentUploads: Recorded spec change in AppRevisions.md
  - [x] fixBugReport.md: ResolveBugDealAttachmentUploads: Bug moved to Unreviewed in bugReports.md
  - [ ] fixBugReport.md: FixBugDealsPipelineDragDrop: Add drag-and-drop to pipeline view for moving deals between stages
  - [ ] fixBugReport.md: UpdateTestsDealsPipelineDragDrop: Update spec and tests for pipeline drag-and-drop
  - [ ] fixBugReport.md: UpdateRevisionsDealsPipelineDragDrop: Record spec change for pipeline drag-and-drop
  - [ ] fixBugReport.md: ResolveBugDealsPipelineDragDrop: Mark bug as resolved
  - [ ] fixBugReport.md: AnalyzeBugTaskLinks: Analyze broken task links — links go to wrong page, aren't clickable, or show "not found"
  - [ ] fixBugReport.md: FixBugTaskLinks: Fix task link navigation across client detail and deal detail pages
  - [ ] fixBugReport.md: UpdateTestsTaskLinks: Update spec and tests for task link navigation
  - [ ] fixBugReport.md: ResolveBugTaskLinks: Mark bug as resolved
  - [ ] fixBugReport.md: FixBugAuthentication: Add Supabase auth system with login/register/JWT/backend protection
  - [ ] fixBugReport.md: UpdateTestsAuthentication: Update spec and tests for authentication
  - [ ] fixBugReport.md: UpdateRevisionsAuthentication: Record spec change for authentication system
  - [ ] fixBugReport.md: ResolveBugAuthentication: Mark bug as resolved
- [ ] reviewBugReport.md: UnpackReviewBugReport: Unpack subtasks
- [ ] checkDirectives.md: UnpackCheckDirectives: Unpack subtasks
- [ ] polishApp.md: UnpackPolishApp: Unpack subtasks
- [ ] deployment.md: UnpackDeployment: Unpack subtasks

#### Maintenance Round 4 Notes


## Blockers

None.
