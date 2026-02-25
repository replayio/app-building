# Bug: Sign In form submission with valid credentials

## Step 1: Evidence

Evidence the app is broken: The NavigationSidebar component does not reset `authMode` state when the Sign In button is clicked to re-open the auth form. After a user signs up (which sets `authMode` to "signup"), signs out, and clicks "Sign In" again, the form still has `authMode="signup"`. The second form submission sends `action: "signup"` to the backend instead of `action: "signin"`, which returns a 409 Conflict ("An account with this email already exists"). Confirmed via Replay network analysis: request 18762.42 shows `{"action":"signup",...}` in the request body, returning 409. The first request (18762.41) was the successful signup with `{"action":"signup",...}` returning 200.

Evidence the test is broken: None found. The test correctly signs up, signs out, then attempts to sign back in — this is a valid user flow.

## Step 2: Determination

Which is broken: APP

## Step 3: Root Cause

In `src/components/NavigationSidebar.tsx`, the Sign In button's `onClick` handler at line 187 only calls `setShowAuthForm(true)`. It does not reset `authMode` back to `"signin"`. The `authMode` state persists across form open/close cycles because the component is never unmounted (it's the persistent sidebar). When a user previously toggled to "signup" mode, that state lingers even after the form is hidden (via `setShowAuthForm(false)` in the submit handler or via the user becoming authenticated). The fix is to reset `authMode` to `"signin"` (and clear other form state) when the Sign In button is clicked.
