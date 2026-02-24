# Debugging Timeouts with Replay

Test timeouts are the most common failure type. The test hangs waiting for an element or
assertion that never resolves. Error messages alone rarely reveal the root cause — you need
to see which step got stuck and what the page looked like at that moment.

## Tool Sequence

1. **`PlaywrightSteps`** — Always start here. Shows the exact sequence of Playwright actions
   with timestamps. Look for the last step that completed and the step that is stuck. Common
   stuck patterns:
   - A `click` targeting an element that doesn't exist or is hidden
   - A `fill` on an input with the wrong type (e.g., `type="date"` rejecting `YYYY-MM-DDTHH:MM`)
   - A `waitForSelector` on a wrong `data-testid`
   - A step inside `.toPass()` that triggers Playwright's internal auto-wait

2. **`Screenshot`** — Take a screenshot at the point of the stuck step. This shows:
   - Whether the page rendered at all (empty `#root` = app didn't mount)
   - Whether the target element is visible but has a different selector
   - Whether a modal/dialog is blocking the expected element
   - Whether the page is showing an error state

3. **`ConsoleMessages`** — Check for JavaScript errors that prevented rendering or interaction.

## Common Root Causes (from observed failures)

### Wrong locator / data-testid
A step tries to click `data-testid="client-row"` but the actual attribute is
`data-testid="client-row-123"`. PlaywrightSteps shows the step stuck at "click", and
Screenshot shows the element exists with a different testid.

**Fix**: Update the locator to match the actual testid. Use `getByTestId` with a pattern
or the exact value.

*Example*: `worker-2026-02-20T12-51-54-645Z.log` — TDP-HDR-02 timed out clicking a client
row. PlaywrightSteps showed step 31 stuck. Screenshot showed rows existed with
`data-testid="client-row-*"` not plain `tr`.

### `.toPass()` deadlock (nested auto-wait)
A `.toPass()` retry block contains `count()`, `textContent()`, or other auto-waiting locator
calls. When the DOM changes between iterations, the inner call waits for its own timeout,
which blocks `.toPass()` from retrying.

**Fix**: Replace loops inside `.toPass()` with single atomic assertions:
- `count()` → `toHaveCount()`
- `textContent()` → `toContainText()`
- `isVisible()` → `toBeVisible()`

*Example*: `worker-2026-02-19T23-29-46-713Z.log` — DATA-02 timed out because
`taskCards.nth(4).textContent()` auto-waited inside `.toPass()`.

### Wrong input format
A `fill()` call provides a value in the wrong format for the input type. For example,
`type="date"` expects `YYYY-MM-DD` but the test provides `YYYY-MM-DDTHH:MM`.

**Fix**: Match the format to the HTML input type.

*Example*: `worker-2026-02-20T13-00-10-123Z.log` — TDP-HDR-01 failed with "Malformed value"
on date input. PlaywrightSteps showed the fill step, Replay confirmed the input type.

### Browser-native validation blocking form submission
A form has `<input type="email">` and the test fills an intentionally invalid email to test
app-level validation. But the browser's native validation fires first, preventing
`handleSubmit` from ever running.

**Fix**: Add `noValidate` to the `<form>` element so app-level validation handles it.

*Example*: `worker-2026-02-21T04-24-50-090Z.log` — "Submit with Invalid Email Format" test.
PlaywrightSteps confirmed the click happened but no validation error appeared.
