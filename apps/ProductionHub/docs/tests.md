# ProductionHub Test Specification

## RecipesPage (/recipes)

<!-- Tests for RecipesPage will be added by PlanPage tasks -->

## CalendarPage (/calendar)

<!-- Tests for CalendarPage will be added by PlanPage tasks -->

## RunDetailsPage (/runs/:runId)

<!-- Tests for RunDetailsPage will be added by PlanPage tasks -->

## RecipeDetailsPage (/recipe/:recipeId)

<!-- Tests for RecipeDetailsPage will be added by PlanPage tasks -->

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
