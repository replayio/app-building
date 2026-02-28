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

_(Tests to be added by PlanPageAppPage task)_

## RequestPage (/request)

<!-- Components: WizardStepper, DescribeAppForm, AssessmentScreen, RejectionResult, AcceptanceResult -->

_(Tests to be added by PlanPageRequestPage task)_
