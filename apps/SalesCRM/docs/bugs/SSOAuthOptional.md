# Bug Analysis: SSO Auth Optional

## Bug Report
Can't login to the app — the SSO popup opens in the same window as the app instead of a new window, breaking the login flow. Authentication should be optional — the app should load and be usable without logging in, with database access not requiring auth. There should be a current user info area in the upper left that shows the logged-in user and allows for logging in.

## Root Cause Analysis

### 1. SSO popup opens in same window
In `src/pages/Login.tsx` line 33, the Google OAuth handler uses `window.location.href = ...` which navigates the current window to the OAuth provider URL. This replaces the app entirely. The fix is to open the OAuth flow in a new popup window using `window.open()`.

### 2. Authentication is required (should be optional)
Three components enforce mandatory authentication:

- **Frontend route guard** (`src/components/auth/RequireAuth.tsx`): The `RequireAuth` component wraps all app routes in `App.tsx`. If not logged in, it redirects to `/login`.
- **Backend middleware** (`netlify/utils/auth.ts`): All 11 Netlify Functions are wrapped with `requiresAuth()` which returns 401 if no Authorization header is present.
- **Fetch interceptor** (`src/lib/auth.ts`): Automatically injects auth tokens — this is fine as-is since it only adds tokens when available.

### 3. User info area needed in upper left
The sidebar (`src/components/layout/Sidebar.tsx`) currently shows user info at the bottom (lines 46-74). The bug requests it be in the upper left, and it should show a "Sign in" option when not logged in.

## Required Changes

### Frontend
1. **Remove RequireAuth guard** from App.tsx — app pages should load without authentication.
2. **Remove Login/Register pages** — they are no longer needed since auth is optional and SSO-based.
3. **Fix SSO to use popup window** — Google OAuth should open in a new window via `window.open()`, with a message listener to detect completion.
4. **Move user info to upper left of sidebar** — show current user or "Sign in" button.
5. **Update AuthCallback** — post a message to the opener window instead of just redirecting.

### Backend
1. **Change `requiresAuth` to `optionalAuth`** — extract user info from JWT if present, but allow requests without tokens. Functions that use `req.user.name` should fall back to "System" when no user is authenticated.

## Impact
- All 11 Netlify Functions use `requiresAuth` and reference `req.user.name` for timeline entries, writeup authors, etc.
- 5 auth tests (AUTH-LGN-01, AUTH-LGN-02, AUTH-REG-01, AUTH-REG-02, AUTH-USR-01) will need to be replaced.
- The Login and Register pages can be removed entirely.
