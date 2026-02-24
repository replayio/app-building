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

## ClientDetailPage (/clients/:clientId)

## PersonDetailPage (/individuals/:individualId)

## DealsListPage (/deals)

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

## SettingsPage (/settings)

## UsersListPage - Team (/users)

## UserDetailPage (/users/:userId)

## ForgotPasswordPage (/auth/forgot-password)

## ResetPasswordPage (/auth/reset-password)

## ConfirmEmailPage (/auth/confirm-email)
