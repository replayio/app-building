# ProductionHub Test Specification

## RecipesPage (/recipes)

<!-- Tests for RecipesPage will be added by PlanPage tasks -->

## CalendarPage (/calendar)

<!-- Tests for CalendarPage will be added by PlanPage tasks -->

## RunDetailsPage (/runs/:runId)

<!-- Tests for RunDetailsPage will be added by PlanPage tasks -->

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
