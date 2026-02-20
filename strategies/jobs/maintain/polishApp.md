# Strategy

During this stage you will polish the app to improve its quality, identifying and fixing
issues around the app's appearance, performance, code structure, and so on.

## Progress Tracking

Polish work is tracked in `docs/plan.md`. Each polish stage has a section in the file with
a checklist of completed work. Before unpacking sub-groups, read `docs/plan.md` (create it
if it doesn't exist) and check which stages have already been completed.

The format is:

```markdown
## Polish

### Responsive UI
- [x] ClientsListPage
- [x] ClientDetailPage
- [ ] DealsListPage
```

When a polish stage is fully complete, mark it done:

```markdown
### Responsive UI ✓
```

A stage with `✓` in its heading is skipped during unpacking — no groups are added for it.

## Unpack Sub-Groups

Read `docs/plan.md` and check which polish stages still need work. For each incomplete stage,
add the appropriate groups as described below. After adding groups, update `docs/plan.md` with
the planned items (unchecked). As each job completes, check off its entry.

### Responsive UI

If the `Responsive UI` section in `docs/plan.md` is missing or not marked `✓`, the app needs
responsive work. Read `docs/tests.md` to identify all pages, then add one group per page:

```
npx tsx /repo/scripts/add-next-group.ts --strategy "strategies/jobs/maintain/polishApp.md" \
  --job "MakeResponsive<PageName>: Make <PageName> responsive"
```

Add or update the `Responsive UI` section in `docs/plan.md` with an unchecked entry for each page.

## Making a Page Responsive

When working on a `MakeResponsive` job, update the page and its components so the layout adapts
cleanly as the viewport shrinks from desktop down to mobile widths. The goal is that all content
remains usable and readable — no horizontal scrolling, no overlapping elements, no truncated
controls.

After completing the work, check off the page in `docs/plan.md`. If all pages are done, mark the
section heading with `✓`.

### Layout adjustments

- Multi-column layouts (sidebars, grid panels) must stack vertically on narrow viewports.
- Horizontal button rows and action bars must wrap or collapse into a menu.
- Modals and dialogs must not overflow the screen — constrain max-width and add vertical scroll
  when content is tall.
- Form layouts with side-by-side fields must stack to single-column.

### Data density in lists and tables

Lists and tables are the most important thing to get right. On wide viewports they can show many
columns, but on narrow viewports they must progressively hide less-important columns to avoid
clutter.

- Identify which columns are essential (e.g., name, status) vs secondary (e.g., created date,
  assigned user, tags).
- Use CSS media queries or container queries to hide secondary columns at smaller breakpoints.
- On the narrowest viewports, consider switching from a table layout to a card/list layout where
  each row becomes a stacked card showing only the key fields.
- Ensure sort/filter controls remain accessible — move them into a collapsible panel or dropdown
  if horizontal space is tight.

### Implementation approach

- Use CSS media queries (`@media (max-width: ...)`) with breakpoints at roughly 1024px, 768px,
  and 480px.
- Prefer responsive CSS over JavaScript-based layout switching.
- Test at each breakpoint to make sure nothing is broken.
- Do not add a hamburger menu or mobile navigation unless the app already has one — focus on
  content layout, not navigation chrome.
