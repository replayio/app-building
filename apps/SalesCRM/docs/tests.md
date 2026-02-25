# Sales CRM — Test Specification

## Sidebar Navigation & Authentication

### Components: SidebarNavigation, SidebarAuth

<!-- Tests for sidebar navigation links, inline auth form, sign in/sign up toggle, sign out -->

---

## ClientsListPage (/clients)

### Components: ClientsListHeader, ClientsSearchAndFilters, ClientsTable, ClientsPagination, AddClientModal, ImportDialog

<!-- Tests for search, filtering, sorting, pagination, add/import/export, table columns, row actions -->

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
