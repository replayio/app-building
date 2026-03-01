# Test Specification: Todo App

## Page: Todo List (Home Page) — `/`

The main and only page of the application. Displays all todos and provides controls for managing them.

**Components:** Header, TodoList, Filters

---

### Component: Header

#### Test: Header displays app title
- **Initial state:** Page loads at `/`
- **Action:** None (observe)
- **Expected:** The header displays the title text "Todo App"

#### Test: Header shows input field with placeholder
- **Initial state:** Page loads at `/`
- **Action:** None (observe)
- **Expected:** An input field is visible with placeholder text "What needs to be done?"

#### Test: Add a todo by clicking the add button
- **Initial state:** Page loads at `/` with no todos
- **Action:** User types "Buy groceries" into the input field, then clicks the add button
- **Expected:** The todo "Buy groceries" appears in the todo list below. The input field is cleared. The todo is persisted to the database.

#### Test: Add a todo by pressing Enter
- **Initial state:** Page loads at `/` with no todos
- **Action:** User types "Walk the dog" into the input field, then presses the Enter key
- **Expected:** The todo "Walk the dog" appears in the todo list below. The input field is cleared. The todo is persisted to the database.

#### Test: Cannot add an empty todo
- **Initial state:** Page loads at `/`
- **Action:** User leaves the input field empty and clicks the add button
- **Expected:** No todo is added to the list. The todo list remains unchanged.

#### Test: Cannot add a whitespace-only todo
- **Initial state:** Page loads at `/`
- **Action:** User types "   " (only spaces) into the input field and clicks the add button
- **Expected:** No todo is added to the list. The input field remains as-is or is cleared.

#### Test: Add button is visible and styled
- **Initial state:** Page loads at `/`
- **Action:** None (observe)
- **Expected:** A submit/add button is visible next to the input field for adding new todos

---

### Component: TodoList

#### Test: Empty state message when no todos exist
- **Initial state:** Page loads at `/` with no todos in the database
- **Action:** None (observe)
- **Expected:** The message "No todos yet. Add one above!" is displayed in the todo list area

#### Test: Todos are displayed in a vertical list
- **Initial state:** Database contains todos "Buy groceries", "Walk the dog", "Read a book"
- **Action:** Page loads at `/`
- **Expected:** All three todos are displayed in a vertical list, ordered by creation date descending (newest first)

#### Test: Each todo shows a checkbox and text
- **Initial state:** Database contains a todo "Buy groceries" that is not completed
- **Action:** Page loads at `/`
- **Expected:** The todo "Buy groceries" is displayed with an unchecked checkbox to its left and the todo text to its right

#### Test: Completed todo shows checked checkbox and strikethrough text
- **Initial state:** Database contains a todo "Buy groceries" that is completed
- **Action:** Page loads at `/`
- **Expected:** The todo "Buy groceries" is displayed with a checked checkbox and the text has strikethrough styling

#### Test: Toggle todo completion by clicking checkbox
- **Initial state:** Database contains a todo "Buy groceries" that is not completed
- **Action:** User clicks the checkbox next to "Buy groceries"
- **Expected:** The checkbox becomes checked, the todo text gets strikethrough styling, and the completed status is persisted to the database

#### Test: Toggle completed todo back to active
- **Initial state:** Database contains a todo "Buy groceries" that is completed
- **Action:** User clicks the checkbox next to "Buy groceries"
- **Expected:** The checkbox becomes unchecked, the strikethrough styling is removed from the todo text, and the active status is persisted to the database

#### Test: Delete button appears on hover
- **Initial state:** Database contains a todo "Buy groceries"
- **Action:** User hovers over the "Buy groceries" todo item
- **Expected:** A delete button with a trash icon appears on the todo item

#### Test: Delete a todo by clicking the delete button
- **Initial state:** Database contains todos "Buy groceries" and "Walk the dog"
- **Action:** User hovers over "Buy groceries" and clicks the delete button (trash icon)
- **Expected:** The todo "Buy groceries" is immediately removed from the list. Only "Walk the dog" remains. The deletion is persisted to the database.

#### Test: Deleting the last todo shows empty state
- **Initial state:** Database contains only one todo "Buy groceries"
- **Action:** User hovers over "Buy groceries" and clicks the delete button
- **Expected:** The todo is removed and the empty state message "No todos yet. Add one above!" is displayed

#### Test: Todos persist across page reloads
- **Initial state:** User has added a todo "Buy groceries"
- **Action:** User reloads the page
- **Expected:** The todo "Buy groceries" is still displayed after the page reload, loaded from the database

---

### Component: Filters

#### Test: Filter buttons are displayed
- **Initial state:** Page loads at `/` with at least one todo
- **Action:** None (observe)
- **Expected:** Three filter buttons are visible: "All", "Active", and "Completed"

#### Test: "All" filter is active by default
- **Initial state:** Page loads at `/`
- **Action:** None (observe)
- **Expected:** The "All" filter button is visually highlighted as the active filter

#### Test: Clicking "Active" filter shows only active todos
- **Initial state:** Database contains todos: "Buy groceries" (active), "Walk the dog" (completed)
- **Action:** User clicks the "Active" filter button
- **Expected:** Only "Buy groceries" is displayed. "Walk the dog" is hidden. The "Active" button is visually highlighted.

#### Test: Clicking "Completed" filter shows only completed todos
- **Initial state:** Database contains todos: "Buy groceries" (active), "Walk the dog" (completed)
- **Action:** User clicks the "Completed" filter button
- **Expected:** Only "Walk the dog" is displayed. "Buy groceries" is hidden. The "Completed" button is visually highlighted.

#### Test: Clicking "All" filter shows all todos
- **Initial state:** Database contains todos: "Buy groceries" (active), "Walk the dog" (completed). User has the "Completed" filter active.
- **Action:** User clicks the "All" filter button
- **Expected:** Both "Buy groceries" and "Walk the dog" are displayed. The "All" button is visually highlighted.

#### Test: Active filter is visually highlighted
- **Initial state:** Page loads at `/`
- **Action:** User clicks the "Completed" filter button
- **Expected:** The "Completed" button is visually highlighted (distinct styling from the other buttons). The "All" and "Active" buttons are not highlighted.

#### Test: Remaining active todo count is displayed
- **Initial state:** Database contains 3 active todos and 1 completed todo
- **Action:** Page loads at `/`
- **Expected:** The text "3 items left" is displayed in the filters area

#### Test: Remaining count updates when todo is toggled
- **Initial state:** Database contains 3 active todos and 1 completed todo ("3 items left" displayed)
- **Action:** User clicks the checkbox on one of the active todos to mark it completed
- **Expected:** The count updates to "2 items left"

#### Test: Remaining count shows singular form for one item
- **Initial state:** Database contains 1 active todo and 2 completed todos
- **Action:** Page loads at `/`
- **Expected:** The text "1 item left" is displayed (singular "item", not "items")

#### Test: "Clear completed" button visible when completed todos exist
- **Initial state:** Database contains at least one completed todo
- **Action:** Page loads at `/`
- **Expected:** A "Clear completed" button is visible in the filters area

#### Test: "Clear completed" button hidden when no completed todos exist
- **Initial state:** Database contains only active (not completed) todos
- **Action:** Page loads at `/`
- **Expected:** The "Clear completed" button is not visible

#### Test: Clicking "Clear completed" removes all completed todos
- **Initial state:** Database contains todos: "Buy groceries" (active), "Walk the dog" (completed), "Read a book" (completed)
- **Action:** User clicks the "Clear completed" button
- **Expected:** "Walk the dog" and "Read a book" are removed from the list. Only "Buy groceries" remains. The completed todos are deleted from the database. The "Clear completed" button disappears since no completed todos remain.

#### Test: Clear completed updates the displayed list under active filter
- **Initial state:** Database contains "Buy groceries" (active), "Walk the dog" (completed). User has "All" filter selected.
- **Action:** User clicks "Clear completed"
- **Expected:** "Walk the dog" is removed. Only "Buy groceries" remains visible. The items left count remains unchanged (it was already counting only active items).
