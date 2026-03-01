# Skill

You are writing a complete, detailed test specification for an app based on an initial app specification
in `AppSpec.md`. If `AppRevisions.md` exists, it describes new functionality and spec changes
organized by topic section, and must also be followed.

## Unpack Subtasks

Unpack the initial test specification task into subtasks using `add-task`:

First, add a task for planning pages:
```
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/build/testSpec.md" --app "<AppName>" \
  --subtask "PlanPages: Read the spec, decide on pages, and add PlanPage tasks for each page"
```

Then during PlanPages, add one task per page containing the page plan and all its component plans:
```
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/build/testSpec.md" --app "<AppName>" \
  --subtask "PlanPage<Name>: Decide on components, add sections to docs/tests.md" \
  --subtask "PlanComponent<Component1>: Add test entries for <Component1>" \
  --subtask "PlanComponent<Component2>: Add test entries for <Component2>"
```

## Requirements

The test spec must be written in docs/tests.md. This file is organized by page, with one or more test entries for the page.

- The test entries must match the app spec as closely as possible.
- If there are image URLs in the app spec, you MUST download them, read them from disk, and follow them carefully.
- Use behavior driven development to formulate test entries: describe the initial conditions of the app's state, the action the user takes, and the changes to the app that should occur afterwards.
- Test entries must all have titles.
- Test entries must be grouped by page in the app.
- Test entries must indicate the components on that page they are exercising.
- Every interactive element (buttons etc) in the component must be tested. There must be a comment in the JSX next to every interactive element with the titles of the tests that exercise it.
- The test must verify that the interactive element actually works and does what the user expects. For example, clicking a button must do something, and text added to forms must be reflected in the app state afterwards.
- Adding extra necessary features beyond the app spec may be needed for a complete, functional app (e.g. create/delete buttons, navigation, form validation).

## Directives

- Images of different pages in the app spec might not have consistent styling or navigation elements with each other. Prioritize a consistent navigation / styling over exact adherence to the images.

- Systematically inventory every visible element in each mockup — every column header, filter control, button, icon, badge, and section. Write a test entry for each one. It is easy to gloss over elements that seem minor or to only test the most prominent features.

- Do not substitute easier-to-implement elements for what the mockup shows. If a table has columns that require joins or computed values, test for all those columns — do not replace them with simpler alternatives. If a mockup shows four filter controls, test for all four — not just the two easiest ones.

- For every clickable element, the test entry must specify the exact navigation target or action result. Do not leave navigation destinations ambiguous. For buttons that trigger external flows (OAuth, SSO, payment, etc.), specify how the flow opens (popup window, redirect, etc.) and what happens when it completes.

- For any user action that mutates data, write test entries verifying that the change is persisted correctly and that exactly the right side effects occur (e.g. history/timeline entries are created, and only one per action — not duplicates).

- Button and control appearance matters: if a mockup shows specific text, icons, or styling for a button, the test entry should verify that appearance — not just that some button exists.

- Completely test that modal dialogs work properly.

- Attachment functionality should support file uploads unless the mockup specifically indicates something else.

- Import/upload dialogs must specify the expected data format (e.g., required columns, accepted values, file type). Test entries should verify that format documentation is visible to the user before they attempt the import.

- Backend integrations that the user can configure (webhooks, API connections, OAuth apps, etc.) must include
  complete setup instructions visible in the configuration UI. The instructions must be specific to each
  supported external service (e.g., Zapier, n8n, Slack, Discord) — not just a generic URL field. Show the
  user where to find the webhook/endpoint URL in the external service, what payload format they will receive,
  and any required configuration on the external side. Test entries should verify that these instructions are
  visible and accurate for each supported platform.

- Apps that receive webhooks from external services must include a webhook help/documentation UI
  accessible from the app's status or admin page. The help UI must list each webhook endpoint with its
  URL path, HTTP method, authentication requirements (e.g., Bearer token, query parameter), required
  and optional payload fields, and an example curl command. Example curl commands must use the actual
  deployed site URL (derived from the current page origin) rather than placeholder values — commands
  should be ready to use as-is. Each curl command and endpoint URL should have a copy-to-clipboard
  button so users can quickly use them. Test entries should verify that the help UI is accessible via a
  clearly labeled button, displays accurate documentation for each webhook endpoint, uses the actual
  site URL in examples, and provides working copy buttons.

- For apps that expose backend API endpoints (webhooks, serverless functions, etc.), the test specification
  must include entries that verify the endpoints actually function correctly — not just that their
  documentation or help UI is accurate. Test entries should cover calling each endpoint with valid inputs
  and verifying the expected side effects (e.g., database records created or updated, status transitions
  completed, downstream processes triggered).

- State-changing actions must have tests that when performed other parts of the app update appropriately. For example:
* If the app has a timeline or history feature, every mutation that the timeline tracks must write a history entry. Ensure this happens atomically to avoid duplicates from re-renders. Think through every field that can change and whether it needs history tracking.
* If the app has symmetrical or reciprocal relationships (e.g., contact relationships, mutual links between entities), creating/updating/deleting one side must automatically update the other side. Test entries must verify both sides of the relationship are in sync.

## Tips

- Mockup images hosted on utfs.io cannot be fetched via WebFetch. Download them with
  `curl -L -o <local-path> <url>` and then use the Read tool to view the downloaded image files.
- When starting from scratch with no existing docs/plan.md, create and commit it before moving on
  to PlanPage subtasks. This avoids losing the architecture docs if the iteration runs out of turns.
- The PlanPages subtask must produce output quickly. Do NOT spend excessive turns reading files
  through Task/Explore agents or re-reading files you have already seen. Read AppSpec.md and the
  mockup images directly, decide on pages/components, write docs/tests.md scaffolding, update
  Prioritize writing output over exhaustive exploration.
- Download all mockup images in a single curl command, then read them all in parallel. Do not
  interleave downloads and reads.
