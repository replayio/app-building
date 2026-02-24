# ProductionHub Test Specification

## RecipesPage (/recipes)

<!-- Tests for RecipesPage will be added by PlanPage tasks -->

## CalendarPage (/calendar)

Components: CalendarHeader, CalendarGrid, RunDetailsPopup

### CalendarHeader

#### CAL-HDR-1: Page title displays "Production Calendar"
- **Components:** CalendarHeader
- **Given** the user navigates to /calendar
- **Then** the page title "Production Calendar" is displayed as a large heading

#### CAL-HDR-2: Prev button is displayed
- **Components:** CalendarHeader
- **Given** the user navigates to /calendar
- **Then** a "Prev" button is displayed in the calendar controls area

#### CAL-HDR-3: Today button is displayed
- **Components:** CalendarHeader
- **Given** the user navigates to /calendar
- **Then** a "Today" button is displayed between the "Prev" and "Next" buttons

#### CAL-HDR-4: Next button is displayed
- **Components:** CalendarHeader
- **Given** the user navigates to /calendar
- **Then** a "Next" button is displayed to the right of the "Today" button

#### CAL-HDR-5: Month and year display shows the current calendar period
- **Components:** CalendarHeader
- **Given** the user navigates to /calendar and the current date is in July 2024
- **Then** the text "July 2024" is displayed to the right of the navigation buttons

#### CAL-HDR-6: Prev button navigates to the previous month
- **Components:** CalendarHeader
- **Given** the user is on /calendar viewing "July 2024" in Monthly view
- **When** the user clicks the "Prev" button
- **Then** the calendar updates to display "June 2024" and shows the day grid for June 2024

#### CAL-HDR-7: Next button navigates to the next month
- **Components:** CalendarHeader
- **Given** the user is on /calendar viewing "July 2024" in Monthly view
- **When** the user clicks the "Next" button
- **Then** the calendar updates to display "August 2024" and shows the day grid for August 2024

#### CAL-HDR-8: Today button navigates to the current month
- **Components:** CalendarHeader
- **Given** the user is on /calendar viewing a month other than the current month (e.g., "March 2024" when the current date is in July 2024)
- **When** the user clicks the "Today" button
- **Then** the calendar updates to display the current month (e.g., "July 2024")

#### CAL-HDR-9: Daily/Weekly/Monthly view toggle is displayed
- **Components:** CalendarHeader
- **Given** the user navigates to /calendar
- **Then** three toggle buttons labeled "Daily", "Weekly", and "Monthly" are displayed in the top-right area of the calendar controls

#### CAL-HDR-10: Monthly view is selected by default
- **Components:** CalendarHeader
- **Given** the user navigates to /calendar
- **Then** the "Monthly" toggle button is visually active/selected and the calendar displays a monthly grid

#### CAL-HDR-11: Clicking Daily toggle switches to daily view
- **Components:** CalendarHeader, CalendarGrid
- **Given** the user is on /calendar in Monthly view
- **When** the user clicks the "Daily" toggle button
- **Then** the "Daily" button becomes visually active/selected
- **And** the calendar grid updates to show a single-day view with time slots
- **And** the month/year display updates to show the current date (e.g., "July 15, 2024")
- **And** the Prev/Next buttons now navigate by day

#### CAL-HDR-12: Clicking Weekly toggle switches to weekly view
- **Components:** CalendarHeader, CalendarGrid
- **Given** the user is on /calendar in Monthly view
- **When** the user clicks the "Weekly" toggle button
- **Then** the "Weekly" button becomes visually active/selected
- **And** the calendar grid updates to show a single-week view with day columns
- **And** the month/year display updates to show the week range (e.g., "Jul 14 - Jul 20, 2024")
- **And** the Prev/Next buttons now navigate by week

#### CAL-HDR-13: Clicking Monthly toggle returns to monthly view
- **Components:** CalendarHeader, CalendarGrid
- **Given** the user is on /calendar in Daily or Weekly view
- **When** the user clicks the "Monthly" toggle button
- **Then** the "Monthly" button becomes visually active/selected
- **And** the calendar grid updates to show the full monthly grid
- **And** the Prev/Next buttons navigate by month

#### CAL-HDR-14: New Production Run button is displayed
- **Components:** CalendarHeader
- **Given** the user navigates to /calendar
- **Then** a blue "+ New Production Run" button is displayed in the top-right area of the calendar controls, to the right of the view toggle buttons

#### CAL-HDR-15: New Production Run button opens a creation form
- **Components:** CalendarHeader
- **Given** the user is on /calendar
- **When** the user clicks the "+ New Production Run" button
- **Then** a modal or form is displayed with fields for selecting a recipe, setting start date/time, end date/time, planned quantity, and optional notes
- **When** the user selects recipe "Recipe v2.1 (Widget-A)", sets start date "July 5, 2024 08:00 AM", end date "July 5, 2024 05:00 PM", quantity "500 Units", and submits
- **Then** the modal closes and a new production run event card appears on July 5 in the calendar grid
- **And** the new run persists after navigating away and returning to /calendar

#### CAL-HDR-16: Filter by Status dropdown is displayed
- **Components:** CalendarHeader
- **Given** the user navigates to /calendar
- **Then** a "Filter by Status" dropdown is displayed below the navigation buttons on the left side

#### CAL-HDR-17: Filter by Status dropdown shows status options
- **Components:** CalendarHeader
- **Given** the user is on /calendar
- **When** the user clicks the "Filter by Status" dropdown
- **Then** a dropdown menu appears with status options including "All", "On Track", "Material Shortage", "Scheduled", "In Progress", and "Pending Approval"

#### CAL-HDR-18: Selecting a status filter hides non-matching runs
- **Components:** CalendarHeader, CalendarGrid
- **Given** the user is on /calendar viewing multiple production run events with different statuses
- **When** the user selects "Material Shortage" from the "Filter by Status" dropdown
- **Then** only production run event cards with status "Material Shortage" are displayed in the calendar grid
- **And** event cards with other statuses are hidden

#### CAL-HDR-19: Selecting "All" in the filter shows all runs
- **Components:** CalendarHeader, CalendarGrid
- **Given** the user is on /calendar with the filter set to "Material Shortage"
- **When** the user selects "All" from the "Filter by Status" dropdown
- **Then** all production run event cards are displayed in the calendar grid regardless of status

#### CAL-HDR-20: Legend displays color coding for statuses
- **Components:** CalendarHeader
- **Given** the user navigates to /calendar
- **Then** a legend is displayed showing "Legend:" followed by "On Track" in green text, "Material Shortage" in red text, and "Scheduled" in yellow text

### CalendarGrid

#### CAL-GRID-1: Monthly grid displays day-of-week column headers
- **Components:** CalendarGrid
- **Given** the user navigates to /calendar in Monthly view
- **Then** the calendar grid displays seven column headers: "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"

#### CAL-GRID-2: Monthly grid displays day cells with date numbers
- **Components:** CalendarGrid
- **Given** the user navigates to /calendar in Monthly view viewing July 2024
- **Then** the calendar grid displays a grid of day cells with date numbers 1 through 31 for July
- **And** cells for trailing days of the previous month (e.g., June 28-30) and leading days of the next month (e.g., Aug 1-3) are shown in a dimmed style

#### CAL-GRID-3: Production run event cards are displayed on the correct dates
- **Components:** CalendarGrid
- **Given** the user navigates to /calendar and a production run for "Widget-A (Recipe v2.1) | 500 Units" is scheduled on July 1, 2024
- **Then** an event card labeled "Widget-A (Recipe v2.1) | 500 Units | Status: Scheduled" appears in the July 1 cell

#### CAL-GRID-4: Event cards display product name, recipe, quantity, and status
- **Components:** CalendarGrid
- **Given** the user navigates to /calendar and production runs exist
- **Then** each event card displays the format "[Product Name] (Recipe [version]) | [Quantity] Units | Status: [Status]"

#### CAL-GRID-5: On Track events are displayed with green background
- **Components:** CalendarGrid
- **Given** the user navigates to /calendar and a production run has status "On Track"
- **Then** the event card for that run is displayed with a green background color
- **And** a green checkmark icon is displayed on the event card

#### CAL-GRID-6: Material Shortage events are displayed with red/pink background
- **Components:** CalendarGrid
- **Given** the user navigates to /calendar and a production run has status "Material Shortage"
- **Then** the event card for that run is displayed with a red/pink background color
- **And** a red warning triangle icon is displayed on the event card

#### CAL-GRID-7: Scheduled events are displayed with yellow background
- **Components:** CalendarGrid
- **Given** the user navigates to /calendar and a production run has status "Scheduled"
- **Then** the event card for that run is displayed with a yellow background color

#### CAL-GRID-8: In Progress events are displayed with a distinct color
- **Components:** CalendarGrid
- **Given** the user navigates to /calendar and a production run has status "In Progress"
- **Then** the event card for that run is displayed with a teal/cyan background color distinguishing it from other statuses

#### CAL-GRID-9: Pending Approval events are displayed with a distinct color
- **Components:** CalendarGrid
- **Given** the user navigates to /calendar and a production run has status "Pending Approval"
- **Then** the event card for that run is displayed with an amber/orange background color distinguishing it from other statuses

#### CAL-GRID-10: Multi-day events span across multiple day cells
- **Components:** CalendarGrid
- **Given** the user navigates to /calendar and a production run for "Super-Widget (Recipe v3.5)" is scheduled from Monday July 8 to Friday July 12
- **Then** the event card spans horizontally across the Mon, Tue, Wed, Thu, and Fri cells of that week row

#### CAL-GRID-11: Clicking an event card opens the RunDetailsPopup
- **Components:** CalendarGrid, RunDetailsPopup
- **Given** the user is on /calendar and an event card for "Mega-Unit (Recipe v1.2) | 300 Units | Status: Scheduled" is displayed on July 19
- **When** the user clicks on that event card
- **Then** the RunDetailsPopup opens showing details for that production run including the run title, start/end times, quantity, status, materials, and notes

#### CAL-GRID-12: Multiple events on the same day are stacked within the cell
- **Components:** CalendarGrid
- **Given** the user navigates to /calendar and two or more production runs are scheduled on the same day
- **Then** the event cards are stacked vertically within that day cell so all events are visible

#### CAL-GRID-13: Empty day cells show no event cards
- **Components:** CalendarGrid
- **Given** the user navigates to /calendar and July 3 has no scheduled production runs
- **Then** the July 3 cell is empty with no event cards displayed

#### CAL-GRID-14: Drag-and-drop an event card to reschedule a run
- **Components:** CalendarGrid
- **Given** the user is on /calendar in Monthly view and a production run event card is displayed on July 16
- **When** the user drags the event card from July 16 and drops it onto July 15
- **Then** a tooltip or confirmation appears indicating the proposed reschedule (e.g., "Reschedule to July 15-16?")
- **When** the user confirms the reschedule
- **Then** the event card moves to the new date(s) in the calendar grid
- **And** the run's start and end dates are updated and the change persists after refreshing

#### CAL-GRID-15: Drag-and-drop reschedule can be cancelled
- **Components:** CalendarGrid
- **Given** the user is on /calendar and starts dragging an event card to a new date
- **When** the reschedule confirmation tooltip appears and the user cancels or drops the card back to the original position
- **Then** the event card remains on its original date and no changes are made to the run

#### CAL-GRID-16: Weekly view displays single week with day columns
- **Components:** CalendarGrid
- **Given** the user is on /calendar in Weekly view
- **Then** the grid shows seven day columns (Sun through Sat) for the selected week with time slots, and production run events are shown within their scheduled time ranges

#### CAL-GRID-17: Daily view displays a single day with time slots
- **Components:** CalendarGrid
- **Given** the user is on /calendar in Daily view
- **Then** the grid shows a single day layout with time slots along the vertical axis, and production run events are displayed as blocks spanning their scheduled time ranges

### RunDetailsPopup

#### CAL-POP-1: RunDetailsPopup displays the run title with recipe name
- **Components:** RunDetailsPopup
- **Given** the user is on /calendar and clicks on a production run event card for "Mega-Unit (Recipe v1.2)"
- **Then** the RunDetailsPopup opens and displays the heading "Run Details: Mega-Unit (Recipe v1.2)"

#### CAL-POP-2: Start date/time is displayed
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open for a run starting Jul 22, 2024 at 08:00 AM
- **Then** the popup displays "Start:" with value "Jul 22, 2024 08:00 AM"

#### CAL-POP-3: End date/time is displayed
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open for a run ending Jul 22, 2024 at 05:00 PM
- **Then** the popup displays "End:" with value "Jul 22, 2024 05:00 PM"

#### CAL-POP-4: Quantity is displayed
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open for a run with quantity 300 Units
- **Then** the popup displays "Quantity:" with value "300 Units"

#### CAL-POP-5: Status is displayed
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open for a run with status "Scheduled"
- **Then** the popup displays "Status:" with value "Scheduled"

#### CAL-POP-6: Materials list with stock levels is displayed
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open for a run that requires materials
- **Then** the popup displays "Materials:" followed by a list of materials with their stock levels, each showing an availability indicator (e.g., "OK for all")

#### CAL-POP-7: Notes field is displayed
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open for a run with notes "Priority order."
- **Then** the popup displays "Notes:" with value "Priority order."

#### CAL-POP-8: Edit Run button is displayed
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open
- **Then** a blue "Edit Run" button is displayed at the bottom of the popup

#### CAL-POP-9: Edit Run button navigates to the run details page
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open for a production run with ID "RUN-12345"
- **When** the user clicks the "Edit Run" button
- **Then** the app navigates to /runs/RUN-12345 (the RunDetailsPage for that specific run)

#### CAL-POP-10: Close button is displayed
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open
- **Then** a "Close" button is displayed at the bottom of the popup, to the right of the "Edit Run" button

#### CAL-POP-11: Close button closes the popup
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open
- **When** the user clicks the "Close" button
- **Then** the RunDetailsPopup closes and the calendar grid is fully visible again

#### CAL-POP-12: Popup displays empty notes when run has no notes
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open for a run that has no notes
- **Then** the "Notes:" field is empty or displays a placeholder indicating no notes

#### CAL-POP-13: Popup materials show shortage indicators when materials are insufficient
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open for a run with material shortages
- **Then** the "Materials:" list displays the affected materials with a shortage indicator instead of "OK"

#### CAL-POP-14: Clicking outside the popup closes it
- **Components:** RunDetailsPopup
- **Given** the RunDetailsPopup is open
- **When** the user clicks outside the popup area on the calendar grid
- **Then** the RunDetailsPopup closes

## RunDetailsPage (/runs/:runId)

Components: RunHeader, RunActions, RawMaterialsTable, ForecastTable, RunEquipmentTable, ExternalAppLinks

### RunHeader

#### RUN-HDR-1: Breadcrumb displays Home > Runs > Run ID
- **Components:** RunHeader
- **Given** the user navigates to /runs/RUN-12345
- **Then** a breadcrumb is displayed showing "Home" as a clickable link, followed by a ">" separator, "Runs" as a clickable link, followed by a ">" separator, and "RUN-12345"

#### RUN-HDR-2: Breadcrumb Home link navigates to home/dashboard
- **Components:** RunHeader
- **Given** the user is on /runs/RUN-12345
- **When** the user clicks the "Home" link in the breadcrumb
- **Then** the app navigates to / (the home/dashboard page)

#### RUN-HDR-3: Breadcrumb Runs link navigates to CalendarPage
- **Components:** RunHeader
- **Given** the user is on /runs/RUN-12345
- **When** the user clicks the "Runs" link in the breadcrumb
- **Then** the app navigates to /calendar (the calendar page where runs are scheduled)

#### RUN-HDR-4: Page title displays "Run Details: RUN-ID"
- **Components:** RunHeader
- **Given** the user navigates to /runs/RUN-12345
- **Then** the page title "Run Details: RUN-12345" is displayed as a large heading

#### RUN-HDR-5: High-Level Information section heading is displayed
- **Components:** RunHeader
- **Given** the user navigates to /runs/RUN-12345
- **Then** a card is displayed with the heading "High-Level Information"

#### RUN-HDR-6: Run ID field displays the run identifier
- **Components:** RunHeader
- **Given** the user navigates to /runs/RUN-12345
- **Then** the High-Level Information card displays a "Run ID:" label with value "RUN-12345"

#### RUN-HDR-7: Date/Time field displays the scheduled date and time
- **Components:** RunHeader
- **Given** the user navigates to /runs/RUN-12345 for a run scheduled on 2023-10-27 at 08:00 AM
- **Then** the High-Level Information card displays a "Date/Time:" label with value "2023-10-27 08:00 AM"

#### RUN-HDR-8: Product field displays the product name
- **Components:** RunHeader
- **Given** the user navigates to /runs/RUN-12345 for a run producing "Widget A"
- **Then** the High-Level Information card displays a "Product:" label with value "Widget A"

#### RUN-HDR-9: Associated Recipe field displays the recipe name
- **Components:** RunHeader
- **Given** the user navigates to /runs/RUN-12345 for a run using "Recipe V3 (Widget A)"
- **Then** the High-Level Information card displays an "Associated Recipe:" label with value "Recipe V3 (Widget A)"

#### RUN-HDR-10: Planned Quantity field displays the quantity with units
- **Components:** RunHeader
- **Given** the user navigates to /runs/RUN-12345 for a run with planned quantity of 500 units
- **Then** the High-Level Information card displays a "Planned Quantity:" label with value "500 Units"

#### RUN-HDR-11: Status field displays a "Scheduled" badge
- **Components:** RunHeader
- **Given** the user navigates to /runs/RUN-12345 for a run with status "Scheduled"
- **Then** the High-Level Information card displays a "Status:" label with a blue badge labeled "Scheduled"

#### RUN-HDR-12: Status badge shows "Confirmed" styling when run is confirmed
- **Components:** RunHeader
- **Given** the user navigates to a run details page for a run with status "Confirmed"
- **Then** the Status field displays a green badge labeled "Confirmed"

#### RUN-HDR-13: Status badge shows "Cancelled" styling when run is cancelled
- **Components:** RunHeader
- **Given** the user navigates to a run details page for a run with status "Cancelled"
- **Then** the Status field displays a red badge labeled "Cancelled"

### RunActions

#### RUN-ACT-1: Adjust Quantities button is displayed
- **Components:** RunActions
- **Given** the user navigates to /runs/RUN-12345 for a run with status "Scheduled"
- **Then** a blue "Adjust Quantities" button is displayed in the actions area to the right of the High-Level Information card

#### RUN-ACT-2: Adjust Quantities button opens an edit form
- **Components:** RunActions
- **Given** the user is on /runs/RUN-12345 for a run with Planned Quantity "500 Units"
- **When** the user clicks the "Adjust Quantities" button
- **Then** a modal or form is displayed allowing the user to edit the planned quantity
- **When** the user changes the planned quantity from "500" to "600" and saves
- **Then** the Planned Quantity field in the High-Level Information card updates to "600 Units"
- **And** the raw materials amounts in the RawMaterialsTable update to reflect the new quantity
- **And** the change persists after navigating away and returning to /runs/RUN-12345

#### RUN-ACT-3: Confirm Run button is displayed
- **Components:** RunActions
- **Given** the user navigates to /runs/RUN-12345 for a run with status "Scheduled"
- **Then** a blue "Confirm Run" button is displayed below the "Adjust Quantities" button

#### RUN-ACT-4: Confirm Run button changes status to Confirmed
- **Components:** RunActions, RunHeader
- **Given** the user is on /runs/RUN-12345 for a run with status "Scheduled"
- **When** the user clicks the "Confirm Run" button
- **Then** the Status badge in the High-Level Information card changes from blue "Scheduled" to green "Confirmed"
- **And** the status change persists after navigating away and returning to /runs/RUN-12345
- **And** the run appears as "Confirmed" on the CalendarPage

#### RUN-ACT-5: Cancel Run button is displayed
- **Components:** RunActions
- **Given** the user navigates to /runs/RUN-12345 for a run with status "Scheduled"
- **Then** a blue "Cancel Run" button is displayed below the "Confirm Run" button

#### RUN-ACT-6: Cancel Run button changes status to Cancelled
- **Components:** RunActions, RunHeader
- **Given** the user is on /runs/RUN-12345 for a run with status "Scheduled"
- **When** the user clicks the "Cancel Run" button
- **Then** a confirmation dialog is displayed asking the user to confirm the cancellation
- **When** the user confirms the cancellation
- **Then** the Status badge in the High-Level Information card changes from blue "Scheduled" to red "Cancelled"
- **And** the status change persists after navigating away and returning to /runs/RUN-12345
- **And** the run appears as "Cancelled" on the CalendarPage

#### RUN-ACT-7: Cancel Run confirmation can be dismissed
- **Components:** RunActions
- **Given** the user is on /runs/RUN-12345 for a run with status "Scheduled"
- **When** the user clicks the "Cancel Run" button
- **Then** a confirmation dialog is displayed
- **When** the user dismisses or cancels the dialog
- **Then** the run status remains "Scheduled" and no changes are made

#### RUN-ACT-8: Action buttons are hidden or disabled for a Cancelled run
- **Components:** RunActions
- **Given** the user navigates to a run details page for a run with status "Cancelled"
- **Then** the "Adjust Quantities", "Confirm Run", and "Cancel Run" buttons are hidden or disabled

#### RUN-ACT-9: Action buttons are hidden or disabled for a Confirmed run except Cancel
- **Components:** RunActions
- **Given** the user navigates to a run details page for a run with status "Confirmed"
- **Then** the "Adjust Quantities" button is hidden or disabled
- **And** the "Confirm Run" button is hidden or disabled
- **And** the "Cancel Run" button remains visible and enabled to allow cancelling a confirmed run

### RawMaterialsTable

#### RUN-MAT-1: Recipe and Raw Materials section heading is displayed
- **Components:** RawMaterialsTable
- **Given** the user navigates to /runs/RUN-12345
- **Then** a section heading "Recipe and Raw Materials" is displayed below the High-Level Information card

#### RUN-MAT-2: Table displays Material, Amount Needed, and Units column headers
- **Components:** RawMaterialsTable
- **Given** the user navigates to /runs/RUN-12345
- **Then** a table in the Recipe and Raw Materials section displays column headers "Material", "Amount Needed", and "Units"

#### RUN-MAT-3: Table rows display raw material data for the run
- **Components:** RawMaterialsTable
- **Given** the user navigates to /runs/RUN-12345 for a run that requires "Material X" at 100 kg and "Material Y" at 50 liters
- **Then** the table displays a row with Material "Material X", Amount Needed "100", and Units "kg"
- **And** the table displays a row with Material "Material Y", Amount Needed "50", and Units "liters"

#### RUN-MAT-4: Material amounts reflect the planned quantity
- **Components:** RawMaterialsTable
- **Given** the user navigates to /runs/RUN-12345 where the planned quantity is 500 Units and the recipe specifies material amounts per batch
- **Then** the Amount Needed column values are calculated based on the planned quantity multiplied by the recipe's per-batch amounts

#### RUN-MAT-5: Material amounts update when quantity is adjusted
- **Components:** RawMaterialsTable, RunActions
- **Given** the user is on /runs/RUN-12345 with Material X showing Amount Needed "100"
- **When** the user clicks "Adjust Quantities" and changes the planned quantity
- **Then** the Amount Needed values in the Raw Materials table update proportionally to the new planned quantity

#### RUN-MAT-6: Empty materials table shows placeholder when run has no recipe materials
- **Components:** RawMaterialsTable
- **Given** the user navigates to the details page for a run whose associated recipe has no raw materials defined
- **Then** the Recipe and Raw Materials section displays a placeholder message or empty table state

### ForecastTable

#### RUN-FCST-1: Forecast/Availability section heading is displayed
- **Components:** ForecastTable
- **Given** the user navigates to /runs/RUN-12345
- **Then** a section heading "Forecast/Availability" is displayed below the Recipe and Raw Materials section

#### RUN-FCST-2: Table displays Material, Required Amount, Forecast Available, Shortage/Excess, and Pending Deliveries column headers
- **Components:** ForecastTable
- **Given** the user navigates to /runs/RUN-12345
- **Then** a table in the Forecast/Availability section displays column headers "Material", "Required Amount", "Forecast Available", "Shortage/Excess", and "Pending Deliveries"

#### RUN-FCST-3: Table rows display forecast data for each material
- **Components:** ForecastTable
- **Given** the user navigates to /runs/RUN-12345 for a run requiring Material X (100 kg, forecast 120 kg available) and Material Y (50 liters, forecast 40 liters available)
- **Then** the table displays a row with Material "Material X", Required Amount "100 kg", Forecast Available "120 kg", Shortage/Excess "+20 kg", and Pending Deliveries "Delivery #DLV-987 (Arriving Today)"
- **And** the table displays a row with Material "Material Y", Required Amount "50 liters", Forecast Available "40 liters", Shortage/Excess "-10 liters", and Pending Deliveries "Delivery #DLV-988 (Pending Approval)"

#### RUN-FCST-4: Shortage/Excess column shows green background for surplus
- **Components:** ForecastTable
- **Given** the user navigates to /runs/RUN-12345 and Material X has a surplus of +20 kg
- **Then** the Shortage/Excess cell for Material X displays "+20 kg" with a green background color indicating a surplus

#### RUN-FCST-5: Shortage/Excess column shows red background for shortage
- **Components:** ForecastTable
- **Given** the user navigates to /runs/RUN-12345 and Material Y has a shortage of -10 liters
- **Then** the Shortage/Excess cell for Material Y displays "-10 liters" with a red background color indicating a shortage

#### RUN-FCST-6: Shortage/Excess values are computed from Required Amount and Forecast Available
- **Components:** ForecastTable
- **Given** the user navigates to /runs/RUN-12345 where Material X requires 100 kg and forecast available is 120 kg
- **Then** the Shortage/Excess column shows "+20 kg" (Forecast Available minus Required Amount)
- **And** for Material Y requiring 50 liters with forecast available 40 liters, Shortage/Excess shows "-10 liters"

#### RUN-FCST-7: Pending Deliveries column displays delivery references with status
- **Components:** ForecastTable
- **Given** the user navigates to /runs/RUN-12345 and there are pending deliveries for the materials
- **Then** the Pending Deliveries column for Material X shows "Delivery #DLV-987 (Arriving Today)"
- **And** the Pending Deliveries column for Material Y shows "Delivery #DLV-988 (Pending Approval)"

#### RUN-FCST-8: Forecast data reflects external inventory and delivery app data
- **Components:** ForecastTable
- **Given** the user navigates to /runs/RUN-12345
- **Then** the Forecast Available values are sourced from the external inventory tracking app
- **And** the Pending Deliveries values are sourced from the external delivery scheduling app

#### RUN-FCST-9: Empty forecast table shows placeholder when no materials exist
- **Components:** ForecastTable
- **Given** the user navigates to the details page for a run whose recipe has no raw materials
- **Then** the Forecast/Availability section displays a placeholder message or empty table state

### RunEquipmentTable

#### RUN-EQP-1: Equipment and Availability section heading is displayed
- **Components:** RunEquipmentTable
- **Given** the user navigates to /runs/RUN-12345
- **Then** a section heading "Equipment and Availability" is displayed below the Forecast/Availability section

#### RUN-EQP-2: Table displays Equipment, Status, and Notes column headers
- **Components:** RunEquipmentTable
- **Given** the user navigates to /runs/RUN-12345
- **Then** a table in the Equipment and Availability section displays column headers "Equipment", "Status", and "Notes"

#### RUN-EQP-3: Table rows display equipment data for the run
- **Components:** RunEquipmentTable
- **Given** the user navigates to /runs/RUN-12345 for a run requiring "Mixer A" (Available) and "Oven B" (Scheduled Maintenance, Oct 28)
- **Then** the table displays a row with Equipment "Mixer A", Status "Available", and Notes empty
- **And** the table displays a row with Equipment "Oven B", Status "Scheduled Maintenance (Oct 28)", and Notes "Scheduled Maintenance (Oct 28)"

#### RUN-EQP-4: Equipment status reflects current availability from the equipment system
- **Components:** RunEquipmentTable
- **Given** the user navigates to /runs/RUN-12345 and the equipment "Mixer A" is marked as available in the equipment system
- **Then** the Status column for "Mixer A" displays "Available"

#### RUN-EQP-5: Equipment with maintenance shows maintenance details in Status and Notes
- **Components:** RunEquipmentTable
- **Given** the user navigates to /runs/RUN-12345 and "Oven B" has a scheduled maintenance event on Oct 28
- **Then** the Status column for "Oven B" displays "Scheduled Maintenance (Oct 28)"
- **And** the Notes column for "Oven B" displays "Scheduled Maintenance (Oct 28)"

#### RUN-EQP-6: Empty equipment table shows placeholder when run requires no equipment
- **Components:** RunEquipmentTable
- **Given** the user navigates to the details page for a run whose recipe requires no equipment
- **Then** the Equipment and Availability section displays a placeholder message or empty table state

### ExternalAppLinks

#### RUN-EXT-1: "View in Inventory App" link is displayed
- **Components:** ExternalAppLinks
- **Given** the user navigates to /runs/RUN-12345
- **Then** a blue "View in Inventory App" link is displayed below the Equipment and Availability section

#### RUN-EXT-2: "View in Delivery App" link is displayed
- **Components:** ExternalAppLinks
- **Given** the user navigates to /runs/RUN-12345
- **Then** a blue "View in Delivery App" link is displayed next to the "View in Inventory App" link, separated by a vertical divider

#### RUN-EXT-3: "View in Inventory App" link opens the external inventory app
- **Components:** ExternalAppLinks
- **Given** the user is on /runs/RUN-12345
- **When** the user clicks the "View in Inventory App" link
- **Then** the external inventory tracking app opens in a new browser tab, showing data relevant to the materials in this run

#### RUN-EXT-4: "View in Delivery App" link opens the external delivery app
- **Components:** ExternalAppLinks
- **Given** the user is on /runs/RUN-12345
- **When** the user clicks the "View in Delivery App" link
- **Then** the external delivery scheduling app opens in a new browser tab, showing delivery data relevant to this run

## RecipeDetailsPage (/recipe/:recipeId)

Components: RecipeDetailHeader, DescriptionCard, ProductsOutputTable, RawMaterialsCard, EquipmentRequiredList

### RecipeDetailHeader

#### RD-HDR-1: Breadcrumb displays Recipes > recipe name with ID
- **Components:** RecipeDetailHeader
- **Given** the user navigates to /recipe/HPP-B1 for a recipe named "High-Performance Polymer Blend" with ID "HPP-B1"
- **Then** a breadcrumb is displayed showing "Recipes" as a clickable link followed by a ">" separator and "High-Performance Polymer Blend (HPP-B1)"

#### RD-HDR-2: Breadcrumb Recipes link navigates to RecipesPage
- **Components:** RecipeDetailHeader
- **Given** the user is on /recipe/HPP-B1
- **When** the user clicks the "Recipes" link in the breadcrumb
- **Then** the app navigates to /recipes (the recipes list page)

#### RD-HDR-3: Page title displays recipe name with ID
- **Components:** RecipeDetailHeader
- **Given** the user navigates to /recipe/HPP-B1 for a recipe named "High-Performance Polymer Blend" with ID "HPP-B1"
- **Then** the page title "High-Performance Polymer Blend (HPP-B1)" is displayed as a large heading

#### RD-HDR-4: Edit Recipe button is displayed
- **Components:** RecipeDetailHeader
- **Given** the user navigates to /recipe/HPP-B1
- **Then** a blue "Edit Recipe" button is displayed to the right of the page title

#### RD-HDR-5: Edit Recipe button opens an edit form for the recipe
- **Components:** RecipeDetailHeader
- **Given** the user is on /recipe/HPP-B1 for recipe "High-Performance Polymer Blend"
- **When** the user clicks the "Edit Recipe" button
- **Then** a modal or form is displayed pre-filled with the recipe's current name, description, products output, raw materials, and equipment
- **When** the user changes the recipe name from "High-Performance Polymer Blend" to "High-Performance Polymer Blend v2" and saves
- **Then** the page title updates to "High-Performance Polymer Blend v2 (HPP-B1)"
- **And** the breadcrumb updates to show the new recipe name
- **And** the change persists after navigating away and returning to /recipe/HPP-B1

### DescriptionCard

#### RD-DESC-1: Description card heading is displayed
- **Components:** DescriptionCard
- **Given** the user navigates to /recipe/HPP-B1
- **Then** a card is displayed with the heading "Description"

#### RD-DESC-2: Recipe description text is displayed
- **Components:** DescriptionCard
- **Given** the user navigates to /recipe/HPP-B1 for a recipe with description "A proprietary blend for creating durable, heat-resistant components. Requires precise temperature control during mixing and extrusion phases to ensure uniform properties."
- **Then** the description text is displayed inside the Description card below the heading

#### RD-DESC-3: Empty description shows placeholder
- **Components:** DescriptionCard
- **Given** the user navigates to the recipe details page for a recipe with no description
- **Then** the Description card displays a placeholder message indicating no description is available

### ProductsOutputTable

#### RD-PROD-1: Products (Output) card heading is displayed
- **Components:** ProductsOutputTable
- **Given** the user navigates to /recipe/HPP-B1
- **Then** a card is displayed with the heading "Products (Output)"

#### RD-PROD-2: Table displays Product Name and Amount column headers
- **Components:** ProductsOutputTable
- **Given** the user navigates to /recipe/HPP-B1
- **Then** a table inside the Products (Output) card displays column headers "Product Name" and "Amount"

#### RD-PROD-3: Table rows display product output data
- **Components:** ProductsOutputTable
- **Given** the user navigates to /recipe/HPP-B1 for a recipe that produces "Finished HPP-B1 Granules" at "528 kg" and "Waste / Scrap (Recyclable)" at "12 kg"
- **Then** the table displays a row with Product Name "Finished HPP-B1 Granules" and Amount "528 kg"
- **And** the table displays a row with Product Name "Waste / Scrap (Recyclable)" and Amount "12 kg"

#### RD-PROD-4: Empty products table shows placeholder
- **Components:** ProductsOutputTable
- **Given** the user navigates to the recipe details page for a recipe with no products defined
- **Then** the Products (Output) card displays a placeholder message or empty table state

### RawMaterialsCard

#### RD-MAT-1: Raw Materials (per batch) card heading is displayed
- **Components:** RawMaterialsCard
- **Given** the user navigates to /recipe/HPP-B1
- **Then** a card is displayed with the heading "Raw Materials (per batch)"

#### RD-MAT-2: Table displays Material Name and Amount column headers
- **Components:** RawMaterialsCard
- **Given** the user navigates to /recipe/HPP-B1
- **Then** a table inside the Raw Materials card displays column headers "Material Name" and "Amount"

#### RD-MAT-3: Table rows display raw material data
- **Components:** RawMaterialsCard
- **Given** the user navigates to /recipe/HPP-B1 for a recipe requiring "Polymer Resin A" at "500 kg", "Stabilizer Additive X" at "25 kg", "Pigment Concentrate (Blue)" at "5 kg", and "Process Aid Z" at "10 kg"
- **Then** the table displays a row with Material Name "Polymer Resin A" and Amount "500 kg"
- **And** the table displays a row with Material Name "Stabilizer Additive X" and Amount "25 kg"
- **And** the table displays a row with Material Name "Pigment Concentrate (Blue)" and Amount "5 kg"
- **And** the table displays a row with Material Name "Process Aid Z" and Amount "10 kg"

#### RD-MAT-4: Empty materials table shows placeholder
- **Components:** RawMaterialsCard
- **Given** the user navigates to the recipe details page for a recipe with no raw materials defined
- **Then** the Raw Materials card displays a placeholder message or empty table state

### EquipmentRequiredList

#### RD-EQUIP-1: Equipment Required card heading is displayed
- **Components:** EquipmentRequiredList
- **Given** the user navigates to /recipe/HPP-B1
- **Then** a card is displayed with the heading "Equipment Required"

#### RD-EQUIP-2: Equipment items are displayed with link icons, names, and IDs
- **Components:** EquipmentRequiredList
- **Given** the user navigates to /recipe/HPP-B1 for a recipe requiring "Twin-Screw Extruder (E-101)", "Industrial Chiller (C-205)", "High-Shear Mixer (M-310)", and "Vacuum Dryer (D-402)"
- **Then** the Equipment Required card displays a list of four items
- **And** each item shows a link icon, the equipment name as a clickable link, and the equipment ID in parentheses
- **And** the items displayed are "Twin-Screw Extruder (E-101)", "Industrial Chiller (C-205)", "High-Shear Mixer (M-310)", and "Vacuum Dryer (D-402)"

#### RD-EQUIP-3: Clicking an equipment link navigates to the EquipmentDetailsPage
- **Components:** EquipmentRequiredList
- **Given** the user is on /recipe/HPP-B1 and the Equipment Required list shows "Twin-Screw Extruder (E-101)"
- **When** the user clicks the "Twin-Screw Extruder" link
- **Then** the app navigates to /equipment/E-101 (the equipment details page for that equipment)

#### RD-EQUIP-4: Each equipment link navigates to its respective details page
- **Components:** EquipmentRequiredList
- **Given** the user is on /recipe/HPP-B1 and the Equipment Required list shows multiple items
- **When** the user clicks the "Industrial Chiller" link
- **Then** the app navigates to /equipment/C-205
- **When** the user navigates back and clicks the "Vacuum Dryer" link
- **Then** the app navigates to /equipment/D-402

#### RD-EQUIP-5: Empty equipment list shows placeholder
- **Components:** EquipmentRequiredList
- **Given** the user navigates to the recipe details page for a recipe with no equipment required
- **Then** the Equipment Required card displays a placeholder message indicating no equipment is required

## EquipmentPage (/equipment)

Components: EquipmentHeader, EquipmentTable

### EquipmentHeader

#### EQ-HDR-1: Page title displays "Equipment Inventory"
- **Components:** EquipmentHeader
- **Given** the user navigates to /equipment
- **Then** the page title "Equipment Inventory" is displayed as a large heading

#### EQ-HDR-2: Page subtitle describes the equipment listing
- **Components:** EquipmentHeader
- **Given** the user navigates to /equipment
- **Then** the subtitle "Describes all the equipment available for production runs." is displayed below the page title

#### EQ-HDR-3: Add Equipment button is displayed
- **Components:** EquipmentHeader
- **Given** the user navigates to /equipment
- **Then** a blue "+ Add Equipment" button is displayed in the top-right area of the header

#### EQ-HDR-4: Add Equipment button opens a form to create new equipment
- **Components:** EquipmentHeader
- **Given** the user is on /equipment
- **When** the user clicks the "+ Add Equipment" button
- **Then** a modal or form is displayed with fields for Title, Description, and Available Units
- **When** the user fills in Title "Test Equipment", Description "A test item", Available Units "2" and submits
- **Then** the new equipment appears in the equipment table with the entered values
- **And** the data persists after navigating away and returning to /equipment

### EquipmentTable

#### EQ-TBL-1: Table displays Title, Description, Available Units, and Actions column headers
- **Components:** EquipmentTable
- **Given** the user navigates to /equipment
- **Then** a table is displayed with column headers "Title", "Description", "Available Units", and "Actions"

#### EQ-TBL-2: Table rows display equipment data in the correct columns
- **Components:** EquipmentTable
- **Given** the user navigates to /equipment and equipment records exist
- **Then** each table row displays the equipment's title in the Title column, its description in the Description column, and its available unit count in the Available Units column

#### EQ-TBL-3: Edit pencil icon is displayed in the Actions column
- **Components:** EquipmentTable
- **Given** the user navigates to /equipment and equipment records exist
- **Then** each row displays a pencil icon button in the Actions column

#### EQ-TBL-4: Clicking the edit pencil icon opens an edit form for the equipment
- **Components:** EquipmentTable
- **Given** the user is on /equipment and a row shows equipment "High-Speed Mixer (HSM-2000)"
- **When** the user clicks the pencil icon in that row's Actions column
- **Then** a modal or form is displayed pre-filled with the equipment's current Title, Description, and Available Units
- **When** the user changes the Available Units from "3" to "4" and saves
- **Then** the table row updates to show Available Units as "4"
- **And** the change persists after navigating away and returning to /equipment

#### EQ-TBL-5: Delete trash icon is displayed in the Actions column
- **Components:** EquipmentTable
- **Given** the user navigates to /equipment and equipment records exist
- **Then** each row displays a trash icon button in the Actions column, to the right of the pencil icon

#### EQ-TBL-6: Clicking the delete trash icon removes the equipment after confirmation
- **Components:** EquipmentTable
- **Given** the user is on /equipment and a row shows equipment "Heavy-Duty Forklift (HDF-5T)"
- **When** the user clicks the trash icon in that row's Actions column
- **Then** a confirmation dialog is displayed asking the user to confirm deletion
- **When** the user confirms the deletion
- **Then** the equipment row "Heavy-Duty Forklift (HDF-5T)" is removed from the table
- **And** the equipment no longer appears after navigating away and returning to /equipment

#### EQ-TBL-7: Cancelling delete confirmation does not remove the equipment
- **Components:** EquipmentTable
- **Given** the user is on /equipment and a row shows equipment "Heavy-Duty Forklift (HDF-5T)"
- **When** the user clicks the trash icon in that row's Actions column
- **Then** a confirmation dialog is displayed
- **When** the user cancels the deletion
- **Then** the equipment row "Heavy-Duty Forklift (HDF-5T)" remains in the table

#### EQ-TBL-8: Clicking a table row navigates to the equipment details page
- **Components:** EquipmentTable
- **Given** the user is on /equipment and a row shows equipment with ID "E-4021"
- **When** the user clicks on the row (not on the action icons)
- **Then** the app navigates to /equipment/E-4021 (the equipment details page)

#### EQ-TBL-9: Pagination displays page count text
- **Components:** EquipmentTable
- **Given** the user navigates to /equipment and there are enough equipment records to span multiple pages
- **Then** pagination text "Page 1 of N" is displayed below the table (where N is the total number of pages)

#### EQ-TBL-10: Pagination next button advances to the next page
- **Components:** EquipmentTable
- **Given** the user is on /equipment viewing page 1 of 3
- **When** the user clicks the ">" (next page) button
- **Then** the table updates to show the next set of equipment records
- **And** the pagination text updates to "Page 2 of 3"

#### EQ-TBL-11: Pagination previous button goes to the previous page
- **Components:** EquipmentTable
- **Given** the user is on /equipment viewing page 2 of 3
- **When** the user clicks the "<" (previous page) button
- **Then** the table updates to show the previous set of equipment records
- **And** the pagination text updates to "Page 1 of 3"

#### EQ-TBL-12: Pagination previous button is disabled on the first page
- **Components:** EquipmentTable
- **Given** the user is on /equipment viewing page 1
- **Then** the "<" (previous page) button is disabled or visually inactive

#### EQ-TBL-13: Pagination next button is disabled on the last page
- **Components:** EquipmentTable
- **Given** the user is on /equipment viewing the last page (e.g., page 3 of 3)
- **Then** the ">" (next page) button is disabled or visually inactive

## EquipmentDetailsPage (/equipment/:id)

Components: EquipmentDetailHeader, EquipmentInfo, MaintenanceNotes

### EquipmentDetailHeader

#### ED-HDR-1: Breadcrumb displays Equipment > Details link
- **Components:** EquipmentDetailHeader
- **Given** the user navigates to /equipment/E-4021
- **Then** a breadcrumb is displayed showing "Equipment" as a clickable link followed by a ">" separator and "Details: E-4021"
- **When** the user clicks the "Equipment" link in the breadcrumb
- **Then** the app navigates to /equipment (the equipment list page)

#### ED-HDR-2: Page title shows equipment name and ID
- **Components:** EquipmentDetailHeader
- **Given** the user navigates to /equipment/E-4021 for equipment named "CNC Mill" with ID "E-4021"
- **Then** the page title displays "CNC Mill E-4021" as a large heading

#### ED-HDR-3: Operational status badge is displayed
- **Components:** EquipmentDetailHeader
- **Given** the user navigates to the details page for equipment with status "Operational"
- **Then** a green badge labeled "Operational" is displayed next to the equipment title

#### ED-HDR-4: Maintenance status badge is displayed
- **Components:** EquipmentDetailHeader
- **Given** the user navigates to the details page for equipment with status "Maintenance"
- **Then** a yellow/orange badge labeled "Maintenance" is displayed next to the equipment title

### EquipmentInfo

#### ED-INFO-1: Equipment photo is displayed
- **Components:** EquipmentInfo
- **Given** the user navigates to the details page for equipment that has an uploaded photo
- **Then** the equipment photo is displayed as a large image on the left side of the page

#### ED-INFO-2: Upload a new equipment photo
- **Components:** EquipmentInfo
- **Given** the user is on the equipment details page
- **When** the user clicks on the image area or an upload control to upload a new photo
- **Then** a file upload dialog opens accepting image files
- **When** the user selects an image file and confirms
- **Then** the new photo is uploaded and displayed in the image area, replacing any previous photo
- **And** the new photo persists after navigating away and returning to the page

#### ED-INFO-3: Placeholder shown when no photo exists
- **Components:** EquipmentInfo
- **Given** the user navigates to the details page for equipment that has no uploaded photo
- **Then** a placeholder image or upload prompt is displayed in the image area

#### ED-INFO-4: Details panel displays all equipment fields
- **Components:** EquipmentInfo
- **Given** the user navigates to /equipment/E-4021 for equipment with Model "Haas VF-4", Serial No. "12345-ABC", Location "Zone B, Bay 3", Manufacturer "Haas Automation", Installation Date "2022-05-15"
- **Then** a "Details" section is displayed on the right side with the following labeled fields:
  - Model: "Haas VF-4"
  - Serial No.: "12345-ABC"
  - Location: "Zone B, Bay 3"
  - Manufacturer: "Haas Automation"
  - Installation Date: "2022-05-15"

#### ED-INFO-5: Edit equipment details
- **Components:** EquipmentInfo
- **Given** the user is on the equipment details page viewing the Details panel
- **When** the user clicks an edit button/icon on the details panel
- **Then** the detail fields (Model, Serial No., Location, Manufacturer, Installation Date) become editable
- **When** the user changes the Location from "Zone B, Bay 3" to "Zone A, Bay 1" and saves
- **Then** the Location field displays "Zone A, Bay 1"
- **And** the change is persisted (navigating away and returning shows the updated value)

#### ED-INFO-6: Description text is displayed
- **Components:** EquipmentInfo
- **Given** the user navigates to the details page for equipment with a description
- **Then** a "Description" subsection is displayed below the detail fields containing the equipment's description text

#### ED-INFO-7: Edit equipment description
- **Components:** EquipmentInfo
- **Given** the user is on the equipment details page viewing the Description section
- **When** the user clicks an edit button/icon on the description section
- **Then** the description text becomes editable in a text area
- **When** the user modifies the description text and saves
- **Then** the updated description is displayed
- **And** the change is persisted after navigating away and returning

### MaintenanceNotes

#### ED-NOTES-1: Maintenance Notes & Comments heading is displayed
- **Components:** MaintenanceNotes
- **Given** the user navigates to the equipment details page
- **Then** a "Maintenance Notes & Comments" section heading is visible below the equipment info area

#### ED-NOTES-2: Add a note text input and Post Note button are displayed
- **Components:** MaintenanceNotes
- **Given** the user is on the equipment details page
- **Then** a text input area with placeholder text "Add a note..." is displayed
- **And** a "Post Note" button is displayed to the right of the text input

#### ED-NOTES-3: Post a new maintenance note
- **Components:** MaintenanceNotes
- **Given** the user is on the equipment details page and the notes text input is empty
- **When** the user types "Replaced worn drive belt. Machine back online." into the text input
- **And** clicks the "Post Note" button
- **Then** the text input is cleared
- **And** a new note appears at the top of the comments list showing the current user's name, their role, the current date/time, and the note text "Replaced worn drive belt. Machine back online."
- **And** the note persists after refreshing the page

#### ED-NOTES-4: Post Note button is disabled when text input is empty
- **Components:** MaintenanceNotes
- **Given** the user is on the equipment details page and the notes text input is empty
- **Then** the "Post Note" button is disabled or visually inactive
- **When** the user types any text into the input
- **Then** the "Post Note" button becomes enabled

#### ED-NOTES-5: Comments list displays author name, role, date, and text
- **Components:** MaintenanceNotes
- **Given** the equipment has existing maintenance notes
- **Then** each note in the comments list displays:
  - The author's name (e.g., "Sarah J.")
  - The author's role in parentheses (e.g., "(Maintenance Mgr)")
  - A date and time (e.g., "Oct 26, 2023, 10:15 AM")
  - The note text (e.g., "Replaced coolant pump seals. Machine running smoothly.")

#### ED-NOTES-6: Comments are displayed in reverse chronological order
- **Components:** MaintenanceNotes
- **Given** the equipment has multiple maintenance notes posted at different times
- **Then** the notes are displayed in reverse chronological order with the most recent note at the top

#### ED-NOTES-7: System-generated notes are displayed with System author
- **Components:** MaintenanceNotes
- **Given** the equipment has a system-generated maintenance note (e.g., from automated preventative maintenance tracking)
- **Then** the note displays "System" as the author name with "(Auto)" as the role, the date/time, and the note text
