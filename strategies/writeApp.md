# Strategy

You are writing the database and code for the app to match the specs in AppSpec.md and docs/tests.md, and to match an optional style guide in AppStyle.md

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

## Tips
