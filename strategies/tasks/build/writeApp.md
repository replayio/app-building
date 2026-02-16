# Strategy

You are writing the database and code for the app to match the specs in AppSpec.md and docs/tests.md, and to match an optional style guide in AppStyle.md. If `AppRevisions.md` exists, it contains subsequent changes to the spec from bug reports and must also be followed.

## Unpack Subtasks

Unpack the initial write app task into the following:

- SetupApp: Setup the app.
- DesignDatabase: Design the database.
- (For each page) UnpackWritePage<Name>: Setup the tasks to implement each page.

Unpack the task for implementing a page into the following:

- (For each component) WriteComponent<Name>: Write the specified page component.
- WritePage<Name>: Write the page itself, then commit changes and exit.

## Guidelines

- Write clean, working code. No TODOs, placeholder implementations, or mock data. All features must be real and fully functional end-to-end, backed by the database.
- All JSX rendered on a page must be abstracted into other React components with their own files.
- If AppStyle.md is present, use it to style the pages and components appropriately. Prefer using CSS files with style variables instead of hardcoded styles.

## Directives

- When working on a component, identify the test entries in the spec relevant to that component, and make sure that the entry requirements are satisfied by the app code.

- Match the visual appearance of elements to the mockup: button variants, icon presence, badge/tag styling, section layouts (horizontal vs vertical), and field sets. Do not simplify the visual design.

- All components must include `data-testid` attributes on interactive elements, containers, list items,
  and anything that E2E tests will need to target. Add testids during initial component development,
  not retroactively. Reference docs/tests.md to identify which elements need testids.

- In a monorepo where the app is in a subdirectory (e.g., `apps/SalesCRM`), add `base = "apps/SalesCRM"`
  to `netlify.toml` so that Netlify CLI resolves the functions directory relative to the app root,
  not the git repository root.

- When using the neon serverless driver (`@neondatabase/serverless`), ONLY use tagged template literal
  syntax for queries: `` sql`SELECT * FROM table WHERE id = ${id}` ``. NEVER use `sql(queryString, paramsArray)`.
  For dynamic WHERE clausess, build composable query fragments and conditionally include them in the tagged template.

- For database columns with DATE, TIMESTAMP, or UUID types, always convert empty strings to null
  before inserting or updating. Use `value || null` instead of `value ?? null`, because the nullish
  coalescing operator (`??`) does not convert empty strings.

- Netlify Functions accessed at `/.netlify/functions/<name>/<resourceId>` have the function name at
  path index 2 and the resource ID at index 3 (after splitting on `/` and filtering empty segments).
  Common off-by-one error: using index 2 for the resource ID when it contains the function name.

- When building modals that reference other entities (e.g., adding a relationship to a person), use a
  searchable select/dropdown component, not a plain text input for IDs.

- Navigation sidebars and menus must not contain duplicate links pointing to the same URL. Each
  navigation item must have a unique route. Remove or consolidate any entries that would navigate
  to the same destination.

- Never use native HTML `<select>` elements for filter controls or dropdowns when the app has a
  custom design system or style guide. Native form elements cannot be fully styled and will revert
  to browser defaults on interaction. Always use custom dropdown components with React state.

- Attachment displays should show file-type-specific icons or thumbnails (e.g., image preview for
  images, document icon for PDFs, spreadsheet icon for CSVs). Do not use a single generic file
  icon for all attachment types.

- Attachment functionality must support actual file uploads. Any UI that allows adding attachments
  must include a working file upload mechanism (e.g., file picker, drag-and-drop), not just link entry.

## Tips

- When scaffolding a new Vite project, the target directory must be empty. Scaffold in a temp directory
  (`/tmp/<name>`) and copy the needed files to the app directory.
- Plan the complete data flow before writing code: what the backend endpoint returns, what the Redux
  slice state shape looks like, and what props each component needs. Write backend → Redux → sections → modals → page.
- When significantly modifying an existing file (>50% of lines), use Write to replace the entire file
  rather than multiple sequential Edits. Avoid chains of 4-5 Edits to the same file.
- When a React component uses `useState` with a prop as the initial value, the state will NOT update
  when the prop changes. Add a `useEffect` to sync local state with prop changes, or use the prop
  directly for display and only use local state during editing.
- For Redux slices, avoid setting `loading = true` during refetches when data already exists. Only show
  loading indicators on initial load (`state.items.length === 0`). This prevents "Loading..." flashes
  that cause tests to see empty content during refetches.
- When an async operation (like saving) should visually complete before closing edit mode, make the
  `onUpdate`/`onSave` callback return a Promise, and await it before calling `setEditing(false)`.
- If the backend supports DELETE operations for a resource, the UI must include delete buttons/actions.
  Check all backend endpoints and ensure the frontend exposes every CRUD operation.
- When adding domain-specific colors (e.g., status badge colors), always define them as CSS variables
  in `index.css` under the `@theme` block rather than hardcoding `rgba()`/`rgb()` values in component
  files. This keeps all colors centralized and easy to theme.
- Components should be layout-agnostic: do NOT include outer padding (`px-*`) or margin in component
  root elements. Let the parent page/layout control spacing. When components embed their own padding,
  composing them in flex rows causes double-padding conflicts that require rework.
