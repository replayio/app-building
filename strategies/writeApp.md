# Strategy

You are writing the database and code for the app to match the specs in AppSpec.md and docs/tests.md

## Guidelines

- Write clean, working code. No TODOs, placeholder implementations, or mock data. All features must be real and fully functional end-to-end, backed by the database.
- All JSX rendered on a page must be abstracted into other React components with their own files.

## Tasks

Make sure there are the following toplevel tasks:
- Setup the app.
- Design the database.
- Write the pages for each app.

When working on the page for an app, add subtasks to write out each component in the app.

When working on a component, identify the test entries in the spec relevant to that component, and add subtasks to check that the entry's requirements are satisfied by the app code.

## Tips

- Before implementing a page, inventory every element visible in the mockup: columns, filters, buttons (text + icons + styling), section layouts, and display formats. After implementation, cross-reference this inventory to catch anything that was skipped or simplified.

- Do not substitute easier-to-implement elements for what the mockup shows. If a table has columns that require joins or computed values, implement those columns — do not replace them with simpler alternatives. If a mockup shows four filter controls, implement all four — not just the two easiest ones.

- Match the visual appearance of elements to the mockup: button variants, icon presence, badge/tag styling, section layouts (horizontal vs vertical), and field sets. Do not simplify the visual design.

- Every clickable sub-item on a detail page (tasks, deals, people, etc.) must link to that specific item's detail view — not to a generic list page.

- State-changing actions must create exactly the right side effects. If the app has a timeline or history feature, every mutation that the timeline tracks must write a history entry. Ensure this happens atomically to avoid duplicates from re-renders. Think through every field that can change and whether it needs history tracking.

- Match the interaction model shown in the mockup for features like attachments. If the mockup shows file icons and download actions, support actual file handling — not just URL text fields.
