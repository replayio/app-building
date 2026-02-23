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

## TaskDetailPage (/tasks/:taskId)

## ContactsListPage (/contacts)

## SettingsPage (/settings)

## UsersListPage - Team (/users)

## UserDetailPage (/users/:userId)

## ForgotPasswordPage (/auth/forgot-password)

## ResetPasswordPage (/auth/reset-password)

## ConfirmEmailPage (/auth/confirm-email)
