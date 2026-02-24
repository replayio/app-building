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

<!-- Tests for EquipmentPage will be added by PlanPage tasks -->

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
