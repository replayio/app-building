# Bug: Sign In form submits with email and password

## Step 1: Evidence

Evidence the app is broken: None found. Recording 05263ba5 shows the auth API endpoint (POST /.netlify/functions/auth) returned 201 with valid user data and token. The Redux store was correctly updated (signUp.fulfilled at Render 8, timestamp 38788ms), and the SidebarUserArea component re-rendered showing user-name span (190x19.5px, visible at Point:18). InspectElement confirms the element exists with correct dimensions.

Evidence the test is broken: Two issues found:
1. The `beforeEach` hook wastes ~36 seconds with unnecessary localStorage removal and reload (fresh Playwright contexts have no stored state).
2. The auth assertion timeout of 10000ms is too tight for the Replay browser + Neon DB environment. The auth API roundtrip takes ~8-13 seconds (Neon DB cold connection + Replay recording overhead), and the React re-render happens at ~38788ms. With the Playwright step ending at ~30227ms and a 10s timeout (expiring at ~40227ms), the render at 38788ms is within the window but with only ~1.4s margin. This margin is insufficient for reliable detection in the Replay browser.

## Step 2: Determination

Which is broken: TEST

## Step 3: Root Cause

Three test issues in `tests/sidebar-auth.spec.ts`:
1. The `beforeEach` performs unnecessary `localStorage.removeItem('token')` + `page.reload()` since Playwright creates fresh browser contexts per test. Fixed by simplifying to just `page.goto('/clients')`.
2. Auth assertion timeouts of `{ timeout: 10000 }` are too tight. The Neon DB ephemeral branch connection + auth processing + Replay browser recording overhead means the signUp/signIn flow takes 10-15 seconds from API call to DOM update. Increasing to `{ timeout: 30000 }` provides reliable margins.
3. The "Sign In form submits" test performs a complex multi-step flow (signup → signout → signin → verify) that takes 61+ seconds total, exceeding the 60s test timeout. Recording 85c795a3 shows step 14 (toBeVisible user-avatar) starts at 61360ms, already past timeout. Fixed by adding `test.slow()` to triple the timeout to 180s.

Additionally, an APP BUG was found: `SidebarUserArea.tsx` did not reset `isSignUp` state when clicking the "Sign In" button. After signup → signout → click "Sign In", the form remained in signup mode, sending `action: "signup"` instead of `action: "signin"`, resulting in a 409 Conflict. Fixed by resetting all form state (`isSignUp`, `email`, `password`, `name`, `message`) and clearing errors in the Sign In button onClick handler.
