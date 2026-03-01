# Loop Builder — Test Specification

## MainPage (/)

<!-- Components: StatusFilter, RequestAppCTA, AppCard, AppCardGrid -->

### StatusFilter

**StatusFilter: Default tab is Building**
Given the user navigates to MainPage (/),
the StatusFilter is visible at the top of the page as a segmented control with three tabs labeled "Building", "Finished", and "Queued".
The "Building" tab is selected by default with a blue highlighted background, while "Finished" and "Queued" tabs appear unselected.
The AppCardGrid below shows only apps with status "Building" (in-progress apps).

**StatusFilter: Switch to Finished tab**
Given the user is on MainPage with the "Building" tab selected,
when the user clicks the "Finished" tab,
the "Finished" tab becomes selected (blue highlighted background) and "Building" becomes unselected.
The AppCardGrid updates to show only apps with status "Finished" (recently completed apps).
Apps that were visible under "Building" are no longer shown.

**StatusFilter: Switch to Queued tab**
Given the user is on MainPage with the "Building" tab selected,
when the user clicks the "Queued" tab,
the "Queued" tab becomes selected (blue highlighted background) and "Building" becomes unselected.
The AppCardGrid updates to show only apps with status "Queued" (apps waiting to be built).
Apps that were visible under "Building" are no longer shown.

**StatusFilter: Switch between all tabs preserves correct filter**
Given the user is on MainPage,
when the user clicks "Finished", then clicks "Queued", then clicks "Building",
each tab click updates the selected tab styling and the AppCardGrid shows only apps matching the selected status.
Only one tab is active at a time.

**StatusFilter: Empty state when no apps match filter**
Given the user is on MainPage and there are no apps with status "Queued",
when the user clicks the "Queued" tab,
the tab becomes selected and the AppCardGrid area displays an empty state (no app cards shown).
The StatusFilter remains functional and the user can switch to other tabs.

### RequestAppCTA

**RequestAppCTA: Visible below StatusFilter**
Given the user navigates to MainPage (/),
the "Request an app" CTA is visible as a prominent full-width button with a blue gradient background, positioned between the StatusFilter and the AppCardGrid.
The button text reads "Request an app".

**RequestAppCTA: Navigates to RequestPage on click**
Given the user is on MainPage,
when the user clicks the "Request an app" button,
the app navigates to the RequestPage (/request).
The RequestPage wizard is displayed.

**RequestAppCTA: Remains visible across all filter tabs**
Given the user is on MainPage with the "Building" tab selected,
when the user switches to the "Finished" tab or the "Queued" tab,
the "Request an app" CTA button remains visible and in the same position between the StatusFilter and the AppCardGrid.
It does not disappear or move when the filter changes.

### AppCard

**AppCard: Displays title and description**
Given there is an app with title "Inventory Management System" and description "Autonomous system to track and order stock in real-time, integrating with suppliers and sales data.",
when the MainPage loads and the app matches the selected filter,
the AppCard displays the app title in bold and the description text below it.

**AppCard: Shows progress bar with percentage for Building apps**
Given there is an app with status "Building" and build progress at 65%,
when the MainPage loads with the "Building" filter selected,
the AppCard displays a horizontal progress bar at the top of the card.
The progress bar shows a blue filled portion proportional to 65% on a gray track.
Next to the progress bar, the text "65% Building" is displayed.

**AppCard: Shows progress bar at 100% for Finished apps**
Given there is an app with status "Finished",
when the MainPage loads with the "Finished" filter selected,
the AppCard displays a progress bar filled to 100% and the status text indicates "Finished" (e.g., "100% Finished").

**AppCard: Shows progress bar at 0% for Queued apps**
Given there is an app with status "Queued",
when the MainPage loads with the "Queued" filter selected,
the AppCard displays a progress bar with 0% fill and the status text indicates "Queued" (e.g., "0% Queued").

**AppCard: View App button navigates to AppPage**
Given the user is on MainPage and an AppCard is visible for an app with id "inventory-management",
when the user clicks the blue "View App" button on that card,
the app navigates to the AppPage at /apps/inventory-management.

**AppCard: Displays app route path next to View App button**
Given an AppCard is displayed for an app with id "inventory-management",
the card shows the route path "/apps/inventory-management" as text next to the "View App" button, indicating where the link leads.

**AppCard: View App button styling**
Given an AppCard is displayed,
the "View App" button appears as a blue rounded button with white text, matching the mockup styling.

### AppCardGrid

**AppCardGrid: Displays cards in 2-column grid layout**
Given there are multiple apps matching the selected filter,
when the MainPage loads,
the AppCardGrid displays AppCards in a 2-column grid layout.
Cards fill left-to-right, top-to-bottom (first card top-left, second card top-right, third card bottom-left, etc.).

**AppCardGrid: Filters cards based on StatusFilter selection**
Given there are apps in all three states (Building, Finished, Queued),
when the user selects "Building" in the StatusFilter,
the AppCardGrid shows only apps with status "Building".
When the user switches to "Finished", only finished apps are shown.
When the user switches to "Queued", only queued apps are shown.

**AppCardGrid: Empty state when no apps match filter**
Given there are no apps with status "Queued",
when the user selects the "Queued" tab in the StatusFilter,
the AppCardGrid displays an empty state message or placeholder indicating no apps are available in this category.

**AppCardGrid: Updates when new apps are added**
Given the user is on MainPage with the "Queued" filter selected,
when a new app request is accepted and queued (e.g., by another user or after the current user submits a request and returns to MainPage),
the AppCardGrid includes the newly queued app as an AppCard on page refresh or next data fetch.

**AppCardGrid: Responsive layout**
Given the user is on MainPage on a standard desktop viewport,
the AppCardGrid displays cards in a 2-column layout as shown in the mockup, with consistent spacing between cards.

## AppPage (/apps/:id)

<!-- Components: AppHeader, AppActions, ActivityLog, ActivityLogEntry -->

### AppHeader

**AppHeader: Displays app title**
Given the user navigates to AppPage (/apps/:id) for an app titled "My Saas Platform (Customer Portal MVP)",
the AppHeader displays the app title as a large bold heading at the top of the page.

**AppHeader: Displays status badge for Building app**
Given the user navigates to AppPage for an app with status "Building",
the AppHeader displays a status badge next to the title reading "STATUS: Building" with a yellow/amber background color to indicate in-progress state.

**AppHeader: Displays status badge for Completed app**
Given the user navigates to AppPage for an app with status "Completed" that has been successfully deployed,
the AppHeader displays a status badge next to the title reading "STATUS: Completed (Successfully Deployed)" with a green background color to indicate successful completion.

**AppHeader: Displays status badge for Queued app**
Given the user navigates to AppPage for an app with status "Queued",
the AppHeader displays a status badge next to the title reading "STATUS: Queued" with a gray background color to indicate the app is waiting to be built.

**AppHeader: Displays app description**
Given the user navigates to AppPage for an app with a description "An autonomously generated web application. Features user authentication, dashboard, and reporting module. Built with React and Node.js.",
the AppHeader displays the full description text below the title, wrapping across multiple lines as needed.

**AppHeader: Displays metadata line with Created date, Model, and Deployment**
Given the user navigates to AppPage for an app created on "Oct 26, 2023" using model "gpt-4 Turbo" deployed to "Vercel",
the AppHeader displays a metadata line below the description reading "Created: Oct 26, 2023 | Model: gpt-4 Turbo | Deployment: Vercel".
The metadata fields are separated by pipe (|) characters.

**AppHeader: Metadata line shows correct values from app data**
Given two different apps exist — one created on "Nov 1, 2023" with model "Claude 3" deployed to "Netlify", and another created on "Dec 5, 2023" with model "gpt-4o" deployed to "AWS",
when the user navigates to each app's AppPage,
the metadata line on each page reflects that specific app's created date, model, and deployment platform.

### AppActions

**AppActions: Open Live App button visible for completed app**
Given the user navigates to AppPage for an app with status "Completed" that has a deployed URL (e.g., "https://my-saas-platform.vercel.app"),
the AppActions section displays an "Open Live App" button styled as a blue primary button with a rocket/launch icon to the left of the button text.

**AppActions: Open Live App button opens deployed URL in new tab**
Given the user is on AppPage for a completed app with deployed URL "https://my-saas-platform.vercel.app",
when the user clicks the "Open Live App" button,
a new browser tab opens navigating to "https://my-saas-platform.vercel.app".
The current AppPage remains open in the original tab.

**AppActions: Open Live App button disabled for Building app**
Given the user navigates to AppPage for an app with status "Building" (no deployed URL available yet),
the "Open Live App" button is visible but disabled (grayed out or visually indicating it cannot be clicked).
Clicking the disabled button has no effect.

**AppActions: Open Live App button disabled for Queued app**
Given the user navigates to AppPage for an app with status "Queued",
the "Open Live App" button is visible but disabled (grayed out or visually indicating it cannot be clicked).
Clicking the disabled button has no effect.

**AppActions: Download Source Code button visible for completed app**
Given the user navigates to AppPage for an app with status "Completed",
the AppActions section displays a "Download Source Code" button styled as a dark/secondary button with a download icon to the left of the button text, positioned to the right of the "Open Live App" button.

**AppActions: Download Source Code button triggers file download**
Given the user is on AppPage for a completed app,
when the user clicks the "Download Source Code" button,
a file download is initiated for the app's source code archive (e.g., a .zip file).
The browser's download dialog or automatic download behavior is triggered.

**AppActions: Download Source Code button disabled for Building app**
Given the user navigates to AppPage for an app with status "Building",
the "Download Source Code" button is visible but disabled (grayed out or visually indicating it cannot be clicked).
Clicking the disabled button has no effect.

**AppActions: Download Source Code button disabled for Queued app**
Given the user navigates to AppPage for an app with status "Queued",
the "Download Source Code" button is visible but disabled (grayed out or visually indicating it cannot be clicked).
Clicking the disabled button has no effect.

**AppActions: Both buttons positioned below description and above activity log**
Given the user navigates to AppPage for any app,
the "Open Live App" and "Download Source Code" buttons are displayed in a horizontal row, positioned below the AppHeader metadata line and above the ActivityLog section.
The "Open Live App" button is on the left and the "Download Source Code" button is on the right.

### ActivityLog

**ActivityLog: Section title and layout**
Given the user navigates to AppPage (/apps/:id),
the ActivityLog section is visible below the AppActions area.
It displays the heading "AI Development Activity Log" in bold text at the top-left of the section.
The section has a bordered container around the log entries.

**ActivityLog: Live Feed indicator for Building app**
Given the user navigates to AppPage for an app with status "Building",
the ActivityLog displays a "Live Feed" badge/label next to the section title with a green dot indicator to the left of the text, signaling that updates are streaming in real time.
The text reads "Live Feed - Historical View" with the green dot next to "Live Feed".

**ActivityLog: Historical View indicator for Completed app**
Given the user navigates to AppPage for an app with status "Completed",
the ActivityLog displays a "Live Feed - Historical View" badge/label next to the section title.
The indicator shows "Historical View" is active (the green dot may be absent or gray), indicating that the feed is showing past development output and is no longer updating in real time.

**ActivityLog: Refresh button visible and functional**
Given the user is on AppPage and the ActivityLog section is visible,
a refresh button (circular arrow icon) is displayed in the top-right corner of the ActivityLog section.
When the user clicks the refresh button, the activity log entries reload with the latest data from the server.

**ActivityLog: Auto-updates for in-progress Building app**
Given the user is on AppPage for an app with status "Building",
the ActivityLog periodically polls the container's status/output endpoint and appends new log entries to the feed as they arrive.
New entries appear at the top of the list (most recent first) without requiring a manual page refresh.

**ActivityLog: Displays entries in reverse chronological order**
Given the user navigates to AppPage for an app with multiple activity log entries,
the entries are displayed in reverse chronological order — the most recent entry appears at the top and the oldest entry at the bottom.
Each entry shows a timestamp that decreases as the user scrolls down.

**ActivityLog: Empty state for Queued app**
Given the user navigates to AppPage for an app with status "Queued" (development has not yet started),
the ActivityLog section is visible but displays an empty state message indicating that development has not started yet (e.g., "No activity yet. Development will begin when this app is picked up from the queue.").
The section title and refresh button remain visible.

**ActivityLog: Shows historical entries for Completed app**
Given the user navigates to AppPage for a completed app that went through multiple development stages (INIT, PLAN, REASONING, TEST, DEPLOY),
the ActivityLog displays the full historical feed of all development output entries from start to finish.
All entries are visible and scrollable within the section.

### ActivityLogEntry

**ActivityLogEntry: Displays timestamp**
Given the ActivityLog contains an entry with timestamp "Oct 26, 14:35:22",
the ActivityLogEntry displays the timestamp at the beginning of the entry in the format "MMM DD, HH:MM:SS" (e.g., "Oct 26, 14:35:22").

**ActivityLogEntry: Displays type tag in bold brackets**
Given the ActivityLog contains an entry of type "DEPLOY",
the ActivityLogEntry displays the type tag in bold uppercase text within square brackets (e.g., "[DEPLOY]") after the timestamp, separated by a pipe character.

**ActivityLogEntry: DEPLOY type tag with checkmark icon and green styling**
Given the ActivityLog contains a DEPLOY entry (e.g., "Deployment successful. App is live at https://my-saas-platform.vercel.app. Final verification complete."),
the entry displays a green checkmark circle icon on the left side of the entry.
The type tag reads "[DEPLOY]" in bold.
The entry has a green-tinted or success-styled background.

**ActivityLogEntry: TEST type tag with info icon and blue styling**
Given the ActivityLog contains a TEST entry (e.g., "Running automated integration tests for the Reporting Module. 15/15 tests passed. Generating test report."),
the entry displays a blue info circle icon on the left side of the entry.
The type tag reads "[TEST]" in bold.
The entry has a blue-tinted or info-styled background.

**ActivityLogEntry: REASONING type tag with gear icon**
Given the ActivityLog contains a REASONING entry (e.g., "Designing the database schema for the 'Reporting Module'. Considering relational versus document structure..."),
the entry displays a gear/cog icon on the left side of the entry.
The type tag reads "[REASONING]" in bold.

**ActivityLogEntry: PLAN type tag with info icon**
Given the ActivityLog contains a PLAN entry (e.g., "Initial project plan generated. Key feature modules identified: Authentication, User Dashboard, Reporting, and Settings."),
the entry displays a blue info circle icon on the left side of the entry.
The type tag reads "[PLAN]" in bold.
The entry has a blue-tinted or info-styled background.

**ActivityLogEntry: INIT type tag with gear icon**
Given the ActivityLog contains an INIT entry (e.g., "App creation initiated from prompt: 'Create a SaaS customer portal MVP with auth, dashboard, and reporting.' Project structure initialized."),
the entry displays a gear/cog icon on the left side of the entry.
The type tag reads "[INIT]" in bold.

**ActivityLogEntry: Displays message text after type tag**
Given the ActivityLog contains an entry with message "Deployment successful. App is live at https://my-saas-platform.vercel.app. Final verification complete.",
the full message text is displayed after the type tag, separated by a pipe character.
The message wraps across multiple lines as needed within the entry container.

**ActivityLogEntry: Expandable section collapsed by default**
Given the ActivityLog contains a REASONING entry that includes an expandable code snippet section labeled "View Schema Snippet",
the expandable section is collapsed by default, showing only the toggle text "View Schema Snippet" with a collapsed chevron/arrow indicator (pointing right or down-right).
The code content is not visible until the section is expanded.

**ActivityLogEntry: Expand section on click**
Given the ActivityLog contains a REASONING entry with a collapsed "View Schema Snippet" section,
when the user clicks the "View Schema Snippet" toggle,
the section expands to reveal a code block below the toggle.
The chevron/arrow indicator rotates to point downward, indicating the section is expanded.
The code block displays the schema content in a monospace font with a distinct background (e.g., dark or gray code block).

**ActivityLogEntry: Collapse expanded section on click**
Given the ActivityLog contains a REASONING entry with an expanded "View Schema Snippet" section,
when the user clicks the "View Schema Snippet" toggle again,
the section collapses, hiding the code block content.
The chevron/arrow indicator returns to its collapsed orientation.

**ActivityLogEntry: Code block displays with monospace formatting**
Given a REASONING entry has its expandable section expanded showing a schema snippet,
the code block displays content in a monospace/code font.
The code block has a distinct background color (darker or gray) that visually separates it from the surrounding entry text.
Code indentation and line breaks are preserved exactly as in the source data.

**ActivityLogEntry: Clickable links in message text**
Given the ActivityLog contains a DEPLOY entry with a URL in the message (e.g., "https://my-saas-platform.vercel.app"),
the URL is rendered as a clickable hyperlink within the message text.
When the user clicks the link, it opens the URL in a new browser tab.
The link is visually distinct from surrounding text (e.g., underlined or colored differently).

**ActivityLogEntry: Multiple entries displayed in sequence**
Given the ActivityLog contains five entries (DEPLOY, TEST, REASONING, PLAN, INIT) in reverse chronological order,
all five entries are displayed as separate, visually distinct blocks within the ActivityLog section.
Each entry has its own icon, timestamp, type tag, and message.
Entries are separated by visible spacing or borders.

## RequestPage (/request)

<!-- Components: WizardStepper, DescribeAppForm, AssessmentScreen, RejectionResult, AcceptanceResult -->

### WizardStepper

**WizardStepper: Displays three labeled steps**
Given the user navigates to RequestPage (/request),
the WizardStepper is visible at the top of the page showing three steps in a horizontal progress indicator:
"1. Describe App", "2. Assessment", and "3. Confirmation".
The steps are connected by a horizontal progress line.

**WizardStepper: Step 1 active on initial load**
Given the user navigates to RequestPage (/request),
the WizardStepper shows "1. Describe App" as the active step (highlighted dot/circle).
"2. Assessment" and "3. Confirmation" appear as upcoming steps (empty/unfilled circles).
The progress line between steps is not filled beyond step 1.

**WizardStepper: Step 1 completed and Step 2 active during assessment**
Given the user has submitted the DescribeAppForm and the system is assessing the request,
the WizardStepper shows "1. Describe App" with a completed checkmark icon,
"2. Assessment" as the active step (highlighted dot/circle),
and "3. Confirmation" as upcoming (empty/unfilled circle).
The progress line is filled between step 1 and step 2.

**WizardStepper: Steps 1 and 2 completed and Step 3 active on confirmation**
Given the assessment is complete (either accepted or rejected),
the WizardStepper shows "1. Describe App" and "2. Assessment" both with completed checkmark icons,
and "3. Confirmation" as the active step (highlighted dot/circle).
The progress line is filled across all three steps.

**WizardStepper: Steps are not clickable for navigation**
Given the user is on step 2 (Assessment) of the wizard,
when the user clicks on "1. Describe App" in the stepper,
the wizard does not navigate back to step 1.
The stepper is a read-only progress indicator, not a navigation control.

### DescribeAppForm

**DescribeAppForm: Displays form fields on step 1**
Given the user navigates to RequestPage (/request) and the wizard is on step 1,
the DescribeAppForm is visible with three input fields:
an "App Name" text input field,
a "Description" multi-line textarea field,
and a "Requirements" multi-line textarea field.
Each field has a visible label above it.

**DescribeAppForm: User can type into App Name field**
Given the user is on step 1 of the RequestPage wizard,
when the user clicks the "App Name" field and types "Inventory Tracker Pro",
the text "Inventory Tracker Pro" appears in the App Name input field.

**DescribeAppForm: User can type into Description field**
Given the user is on step 1 of the RequestPage wizard,
when the user clicks the "Description" field and types "A mobile-friendly app to manage warehouse stock, track shipments, and generate reports. Must integrate with existing ERP.",
the full text appears in the Description textarea, wrapping to multiple lines as needed.

**DescribeAppForm: User can type into Requirements field**
Given the user is on step 1 of the RequestPage wizard,
when the user clicks the "Requirements" field and types "User authentication, barcode scanning, real-time data sync.",
the text appears in the Requirements textarea.

**DescribeAppForm: Submit button visible and labeled**
Given the user is on step 1 of the RequestPage wizard,
a submit button is visible below the form fields with text such as "Submit Request" or "Next".
The button is styled as a primary blue button.

**DescribeAppForm: Validation requires App Name**
Given the user is on step 1 with the App Name field empty,
when the user clicks the submit button,
the form does not advance to step 2.
A validation error message is displayed near the App Name field indicating it is required.

**DescribeAppForm: Validation requires Description**
Given the user is on step 1 with the App Name filled but the Description field empty,
when the user clicks the submit button,
the form does not advance to step 2.
A validation error message is displayed near the Description field indicating it is required.

**DescribeAppForm: Successful submission advances to Assessment step**
Given the user has filled in App Name as "Inventory Tracker Pro", Description as "A mobile-friendly app to manage warehouse stock", and Requirements as "User authentication, barcode scanning",
when the user clicks the submit button,
the wizard advances to step 2 (Assessment).
The WizardStepper updates to show step 1 as completed and step 2 as active.
The DescribeAppForm is replaced by the AssessmentScreen.

**DescribeAppForm: Submitted data persists in request summary during assessment**
Given the user submitted the form with App Name "Inventory Tracker Pro", Description "A mobile-friendly app to manage warehouse stock, track shipments, and generate reports. Must integrate with existing ERP.", and Requirements "User authentication, barcode scanning, real-time data sync.",
when the wizard advances to step 2,
a "Request Summary" panel is displayed on the left side showing the submitted App Name, Description, and Requirements exactly as entered.

### AssessmentScreen

**AssessmentScreen: Displays loading state during assessment**
Given the user has submitted the DescribeAppForm and the wizard is on step 2,
the AssessmentScreen is displayed with the text "Assessing Request against Policy & Technical Criteria..." as a heading or prominent label.
A progress bar is visible below the heading, showing assessment progress with colored segments (green for passing checks, red for failing checks).
Below the progress bar, the text "Please wait while we review your request. This typically takes a few moments." is displayed.
A loading spinner animation is visible below the waiting text.

**AssessmentScreen: Request summary visible alongside assessment**
Given the wizard is on step 2 (Assessment),
a "Request Summary" panel is displayed on the left side of the screen showing the submitted App Name, Description, and Requirements.
The assessment loading UI is displayed on the right side.

**AssessmentScreen: Progress bar animates during assessment**
Given the AssessmentScreen is displayed and the backend is processing the request,
the progress bar updates to reflect assessment progress (e.g., green segments growing as checks pass).
The progress bar provides visual feedback that the assessment is actively running.

**AssessmentScreen: Transitions to rejection on policy failure**
Given the system has finished assessing the request and determined it violates policy (e.g., contains personal information requirements),
the wizard automatically advances to step 3 (Confirmation).
The AssessmentScreen is replaced by the RejectionResult.
The WizardStepper updates to show steps 1 and 2 as completed and step 3 as active.

**AssessmentScreen: Transitions to acceptance on policy pass**
Given the system has finished assessing the request and determined it passes all policy and technical checks,
the wizard automatically advances to step 3 (Confirmation).
The AssessmentScreen is replaced by the AcceptanceResult.
The WizardStepper updates to show steps 1 and 2 as completed and step 3 as active.

### RejectionResult

**RejectionResult: Displays rejection heading with warning icon**
Given the request has been rejected after assessment,
the RejectionResult screen displays a yellow/amber warning triangle icon at the top,
followed by a large bold heading reading "Request Rejected".

**RejectionResult: Displays rejection context message**
Given the request for app "Inventory Tracker Pro" has been rejected,
the RejectionResult displays a message below the heading reading "Your request for 'Inventory Tracker Pro' cannot be processed at this time."
The app name in the message matches the name submitted in the DescribeAppForm.

**RejectionResult: Displays reason for rejection box**
Given the request has been rejected with a policy violation reason,
the RejectionResult displays a bordered box with the heading "Reason for Rejection" in bold.
Below the heading, a "Policy Violation:" label is shown in bold, followed by the specific reason text (e.g., "The request contains specifications for handling sensitive personal information without adequate security protocols. Please revise your request to comply with data privacy guidelines.").
The reason box has a distinct background or border to visually separate it from the rest of the content.

**RejectionResult: Edit Request button visible and styled**
Given the request has been rejected,
an "Edit Request" button is displayed below the rejection reason box.
The button is styled as a full-width primary blue button with the text "Edit Request".

**RejectionResult: Edit Request button navigates back to step 1**
Given the user is on the RejectionResult screen,
when the user clicks the "Edit Request" button,
the wizard navigates back to step 1 (Describe App).
The WizardStepper updates to show step 1 as active.
The DescribeAppForm is displayed with the previously submitted values pre-filled in the App Name, Description, and Requirements fields, allowing the user to edit and resubmit.

### AcceptanceResult

**AcceptanceResult: Displays success heading with checkmark icon**
Given the request has been accepted after assessment,
the AcceptanceResult screen displays a green checkmark circle icon at the top,
followed by a large bold heading reading "App Queued for Building!".

**AcceptanceResult: Displays success context message**
Given the request for app "Inventory Tracker Pro" has been accepted,
the AcceptanceResult displays a message below the heading reading "Great news! Your request for 'Inventory Tracker Pro' has been accepted and is now queued for autonomous building."
The app name in the message matches the name submitted in the DescribeAppForm.

**AcceptanceResult: Displays Next Steps section**
Given the request has been accepted,
the AcceptanceResult displays a "Next Steps" section with the text "Your app is being generated. You can monitor its progress on the AppPage."
This section provides the user with context about what happens next.

**AcceptanceResult: Go to AppPage button visible and styled**
Given the request has been accepted and the app has been created with an id,
the AcceptanceResult displays a "Go to AppPage to Monitor Progress" button styled as a primary blue button.

**AcceptanceResult: Go to AppPage button navigates to new app's AppPage**
Given the request has been accepted and an app with id "inventory-tracker-pro" has been created,
when the user clicks the "Go to AppPage to Monitor Progress" button,
the app navigates to the AppPage at /apps/inventory-tracker-pro.
The AppPage displays the newly queued app with status "Queued".

**AcceptanceResult: View all My Apps link visible**
Given the request has been accepted,
below the "Go to AppPage to Monitor Progress" button, a "View all My Apps" text link is displayed.
The link is styled as a text hyperlink (not a button), visually distinct from the primary button above.

**AcceptanceResult: View all My Apps link navigates to MainPage**
Given the user is on the AcceptanceResult screen,
when the user clicks the "View all My Apps" link,
the app navigates to the MainPage (/).
The MainPage loads with the default StatusFilter tab selected.

**AcceptanceResult: Accepted app appears in MainPage Queued tab**
Given the user's request for "Inventory Tracker Pro" has been accepted and queued,
when the user navigates to the MainPage (/) and selects the "Queued" tab in the StatusFilter,
an AppCard for "Inventory Tracker Pro" is visible in the AppCardGrid with status "Queued" and a 0% progress bar.

## StatusPage (/status)

<!-- Components: DefaultPromptDisplay, ActiveContainers, WebhookEventFeed, WebhookHelpButton, BackLink -->

### BackLink

**BackLink: Visible in header**
Given the user navigates to StatusPage (/status),
the page header contains a back link labeled "← Back" on the left side of the header, next to the "System Status" title.

**BackLink: Navigates to MainPage on click**
Given the user is on StatusPage (/status),
when the user clicks the "← Back" link,
the app navigates to the MainPage (/).

### DefaultPromptDisplay

**DefaultPromptDisplay: Displays section title**
Given the user navigates to StatusPage (/status) and the status data has loaded,
the DefaultPromptDisplay section is visible with the heading "Default Prompt".

**DefaultPromptDisplay: Shows configured prompt text**
Given the system has a default prompt configured as "Build a todo app with authentication",
when the user navigates to StatusPage (/status),
the DefaultPromptDisplay shows the text "Build a todo app with authentication" below the heading.

**DefaultPromptDisplay: Shows placeholder when no prompt configured**
Given the system has no default prompt configured,
when the user navigates to StatusPage (/status),
the DefaultPromptDisplay shows the text "No default prompt configured".

### ActiveContainers

**ActiveContainers: Displays section title**
Given the user navigates to StatusPage (/status) and the status data has loaded,
the ActiveContainers section is visible with the heading "Active Containers".

**ActiveContainers: Shows table with columns when containers exist**
Given there are active containers in the system,
when the user navigates to StatusPage (/status),
the ActiveContainers section displays a table with column headers "Name", "Status", "Prompt", and "Last Event".
Each container is shown as a row in the table.

**ActiveContainers: Shows container name in table row**
Given there is a container named "app-building-abc123",
when the user navigates to StatusPage (/status),
a table row displays "app-building-abc123" in the Name column.

**ActiveContainers: Shows container status with styling**
Given there is a container with status "started",
when the user navigates to StatusPage (/status),
the Status column for that row displays "started" with a styled status badge.

**ActiveContainers: Shows container prompt**
Given there is a container with prompt "Build a dashboard app",
when the user navigates to StatusPage (/status),
the Prompt column for that row displays "Build a dashboard app".

**ActiveContainers: Shows dash for missing prompt**
Given there is a container with no prompt set,
when the user navigates to StatusPage (/status),
the Prompt column for that row displays "—".

**ActiveContainers: Shows last event timestamp**
Given there is a container with last event at "2026-02-28T12:00:00Z",
when the user navigates to StatusPage (/status),
the Last Event column for that row displays the formatted timestamp.

**ActiveContainers: Shows empty state when no containers**
Given there are no active containers in the system,
when the user navigates to StatusPage (/status),
the ActiveContainers section displays the message "No active containers" instead of a table.

**ActiveContainers: Shows pending container after spawn**
Given there are no active containers in the system,
when a container is spawned via the POST /.netlify/functions/spawn-container endpoint with a prompt,
and the user navigates to StatusPage (/status),
the ActiveContainers table includes a row for the newly created container with status "pending" and the supplied prompt.

### WebhookEventFeed

**WebhookEventFeed: Displays section title**
Given the user navigates to StatusPage (/status) and the status data has loaded,
the WebhookEventFeed section is visible with the heading "Recent Webhook Events".

**WebhookEventFeed: Shows event items with timestamp, container ID, and event type**
Given there are webhook events in the system,
when the user navigates to StatusPage (/status),
each event item displays the timestamp, container ID, and event type in a header row.

**WebhookEventFeed: Shows event payload summary**
Given there is a webhook event with payload containing keys "status" and "message",
when the user navigates to StatusPage (/status),
the event item displays a payload summary showing the key-value pairs, truncating long values.

**WebhookEventFeed: Shows empty state when no events**
Given there are no webhook events in the system,
when the user navigates to StatusPage (/status),
the WebhookEventFeed section displays the message "No webhook events received".

### WebhookHelpButton

**WebhookHelpButton: Visible on StatusPage**
Given the user navigates to StatusPage (/status) and the status data has loaded,
a clearly labeled "Webhook Documentation" button is visible on the page, allowing the user to access webhook help information.

**WebhookHelpButton: Opens help panel on click**
Given the user is on StatusPage (/status),
when the user clicks the "Webhook Documentation" button,
a help panel or modal opens displaying documentation for all webhook endpoints.

**WebhookHelpButton: Closes help panel**
Given the webhook help panel is open,
when the user clicks the close button on the panel,
the panel closes and the StatusPage content is fully visible again.

**WebhookHelpButton: Shows app-builder-event endpoint documentation**
Given the webhook help panel is open,
the panel displays documentation for the POST /.netlify/functions/app-builder-event endpoint including:
- URL path: /.netlify/functions/app-builder-event
- HTTP method: POST
- Authentication: Bearer token via Authorization header, or secret query parameter
- Required payload fields: container_id (string), event_type (string)
- Optional payload fields: payload (object), status (string)
- An example curl command demonstrating how to call the endpoint

**WebhookHelpButton: Shows spawn-container endpoint documentation**
Given the webhook help panel is open,
the panel displays documentation for the POST /.netlify/functions/spawn-container endpoint including:
- URL path: /.netlify/functions/spawn-container
- HTTP method: POST
- Authentication: Bearer token via Authorization header, or secret query parameter
- Required payload fields: none (prompt is optional, falls back to default_prompt)
- Optional payload fields: prompt (string)
- An example curl command demonstrating how to call the endpoint

**WebhookHelpButton: Shows set-default-prompt endpoint documentation**
Given the webhook help panel is open,
the panel displays documentation for the POST /.netlify/functions/set-default-prompt endpoint including:
- URL path: /.netlify/functions/set-default-prompt
- HTTP method: POST
- Authentication: Bearer token via Authorization header, or secret query parameter
- Required payload fields: prompt (string)
- Optional payload fields: none
- An example curl command demonstrating how to call the endpoint

**WebhookHelpButton: Example curl commands are accurate**
Given the webhook help panel is open,
each endpoint's example curl command includes the correct URL path, Content-Type header, Authorization header with a placeholder Bearer token, and a valid JSON body with the required fields for that endpoint.
