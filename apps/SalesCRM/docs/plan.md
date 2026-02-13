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
- [ ] UnpackWritePagePersonDetailPage: Plan and create subtasks for implementing the PersonDetailPage (/individuals/:individualId) components
- [ ] UnpackWritePageDealsListPage: Plan and create subtasks for implementing the DealsListPage (/deals) components
- [ ] UnpackWritePageDealDetailPage: Plan and create subtasks for implementing the DealDetailPage (/deals/:dealId) components
- [ ] UnpackWritePageTasksListPage: Plan and create subtasks for implementing the TasksListPage (/tasks) components

### Stage 3: Write Tests (writeTests.md)
- [ ] UnpackWriteTests: Unpack the write tests stage into subtasks

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
