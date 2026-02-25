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
