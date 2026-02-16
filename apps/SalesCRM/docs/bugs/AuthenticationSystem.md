# Bug: Add Authentication System

## Report

The app has no authentication — all pages and API endpoints are accessible without logging in. Add a Supabase-based auth system that authenticates against the same auth service used by `~/record[REDACTED]/builder-assets/appTemplate/` (i.e. `https://auth.nut.new`). All app data stays in Neon via `DATABASE_URL`; the only new table is a `users` table in Neon for mapping auth identities to local user records.

## Analysis

### Current State

- **No auth**: no login page, no session management, no token handling, no protected routes
- **10 unprotected Netlify functions** using the Netlify v2 pattern (`(req: Request) => Response`) with Neon via `@neondatabase/serverless`
- **Free-form author fields** that should use the authenticated user's name:
  - `task_notes.author` (default `'User'`)
  - `writeups.author` / `writeup_versions.author`
  - `timeline_events.user_name` (default `'System'`)
  - `contact_history.team_member`
  - `deal_history.changed_by`

### How the Template Auth Works

The template at `~/record[REDACTED]/builder-assets/appTemplate/` authenticates against `https://auth.nut.new` (a Supabase instance). Key pieces:

1. **Frontend** (`src/lib/auth.ts`): Creates a Supabase client using `VITE_AUTH_SUPABASE_URL` + `VITE_AUTH_SUPABASE_ANON_KEY`. Patches `window.fetch` so every request to `/.netlify/functions/` automatically gets an `Authorization: Bearer <token>` header from the current Supabase session. This means existing frontend fetch calls need zero changes to start sending tokens.

2. **Backend** (`netlify/utils/jwt.ts`): Verifies the JWT from the `Authorization` header against the JWKS at `https://auth.nut.new/auth/v1/.well-known/jwks.json` using the `jose` library. On success, extracts user info from the JWT claims (`sub`, `email`, `user_metadata.full_name`, `app_metadata.provider`, `user_metadata.avatar_url`).

3. **User sync**: The template syncs verified JWT claims to a `users` table via Supabase RPC. For the CRM, this should instead be a plain Neon SQL upsert into a `users` table in the existing Neon database.

4. **Auth UI**: Login/Register pages using `@supabase/supabase-js` methods: `auth.signInWithPassword()`, `auth.signUp()`, `auth.signInWithOtp()`, `auth.resetPasswordForEmail()`. OAuth via redirect to `https://auth.nut.new/functions/v1/oauth/start`. Callback page at `/auth/callback` that extracts tokens from the URL hash.

5. **React context** (`AuthProvider`): Exposes `useAuth()` with `{ isLoggedIn, user, loading, signOut, getUserId }`. Uses RTK Query to fetch session/user info.

---

## Implementation Plan

### 1. Install Dependencies

Add to `package.json` (check first which are already present):

```
@supabase/supabase-js   — frontend Supabase auth client
jose                     — backend JWT verification
react-hook-form          — login/register forms
@hookform/resolvers      — zod resolver for react-hook-form
zod                      — form validation schemas
sonner                   — toast notifications for auth errors
```

### 2. Environment Variables

Only two new env vars are needed:

```bash
VITE_AUTH_SUPABASE_URL=https://auth.nut.new
VITE_AUTH_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpia2NhdnhpZGp5c2xxbW5iZnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDU0MjAsImV4cCI6MjA1NTU4MTQyMH0.xHKTareBFW0LW0AmYXH0vOvU3mLB3jkQGwhoNWqpnTw
```

`DATABASE_URL` (Neon) stays the same. No Supabase service role key, no app ID, no auth-required flag needed.

### 3. Add `users` Table to Neon

Add to `scripts/init-db.ts`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  provider TEXT DEFAULT 'unknown',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Frontend Auth Client

Create `src/lib/auth.ts` based on the template's version. This file:
- Creates a Supabase client with `VITE_AUTH_SUPABASE_URL` / `VITE_AUTH_SUPABASE_ANON_KEY`
- Overrides `window.fetch` to attach `Authorization: Bearer <token>` on all `/.netlify/functions/` calls
- Exports `auth` (the `supabase.auth` object)

Reference: `~/record[REDACTED]/builder-assets/appTemplate/src/lib/auth.ts`

### 5. Backend Auth Middleware

Create `netlify/utils/auth.ts` — a simplified version of the template's `jwt.ts`, adapted for Neon and the v2 handler pattern. It should:

- At module load, fetch JWKS from `https://auth.nut.new/auth/v1/.well-known/jwks.json` and build a key resolver using `jose`
- Export a `requiresAuth(handler)` wrapper that:
  1. Reads the `Authorization: Bearer <token>` header from the request
  2. Returns 401 if missing or invalid
  3. Verifies the JWT signature using the cached JWKS keys
  4. Extracts user info from the JWT payload: `sub` (auth_user_id), `email`, `user_metadata.full_name`, `app_metadata.provider`, `user_metadata.avatar_url`
  5. Upserts into the Neon `users` table using the existing `getDb()` / `neon()` pattern:
     ```sql
     INSERT INTO users (auth_user_id, email, name, provider, avatar_url)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (auth_user_id) DO UPDATE SET
       email = EXCLUDED.email, name = EXCLUDED.name,
       provider = EXCLUDED.provider, avatar_url = EXCLUDED.avatar_url,
       updated_at = NOW()
     RETURNING *
     ```
  6. Attaches the user record to the request (e.g. as a property or via a wrapper object) and calls the inner handler
- Keep the template's test-mode support (`IS_TEST` env var with a local test key) for Playwright tests

**Key difference from template**: No Supabase service-role client on the backend at all. The user upsert is plain Neon SQL. No anonymous user fallback, no email allowlist, no app-ID check.

Since the CRM uses the Netlify v2 handler pattern (`(req: Request) => Response`), the middleware should match that. A simple approach:

```ts
interface AuthenticatedRequest extends Request {
  user: { id: string; auth_user_id: string; email: string; name: string; avatar_url: string; provider: string }
}

export function requiresAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    // verify JWT, upsert user, attach to request, call handler
  }
}
```

Reference: `~/record[REDACTED]/builder-assets/appTemplate/netlify/utils/jwt.ts` (for JWKS fetching, JWT verification, and JWT claim extraction logic)

### 6. Create `getUserInfo` Endpoint

Create `netlify/functions/getUserInfo.ts`:
- Wrapped with `requiresAuth`
- Returns the authenticated user's `{ id, email, name, avatar_url }` as JSON

### 7. Wrap Existing Netlify Functions

Each of the 10 functions changes from:

```ts
export default async function handler(req: Request) { ... }
```

To:

```ts
import { requiresAuth, type AuthenticatedRequest } from '../utils/auth'

async function handlerImpl(req: AuthenticatedRequest) {
  // existing logic unchanged, plus req.user is now available
}

export default requiresAuth(handlerImpl)
```

For functions that write author/user fields, use `req.user.name` instead of hardcoded strings or request body values.

### 8. RTK Query Base + Auth Slice

Create `src/store/appApi.ts`:

```ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const appApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "/.netlify/functions/" }),
  tagTypes: ["Session", "UserInfo"],
  endpoints: () => ({}),
});
```

Register `appApi.reducer` and `appApi.middleware` in `src/store/index.ts`.

Create `src/store/authSlice.ts` based on the template's version. This provides `useGetSessionQuery()` and `useSignOutMutation()` hooks, and a `getUserInfo` endpoint that calls the new Netlify function.

Reference: `~/record[REDACTED]/builder-assets/appTemplate/src/store/slices/authSlice.ts`

### 9. AuthProvider Context

Create `src/contexts/AuthProvider.tsx` based on the template's version. Provides `useAuth()` hook with `{ isLoggedIn, user, loading, signOut, getUserId }`.

Reference: `~/record[REDACTED]/builder-assets/appTemplate/src/contexts/AuthProvider.tsx`

### 10. Auth Pages

Create these pages based on the template, styled to match the CRM's Linear-inspired design:

| Page | Purpose | Reference |
|---|---|---|
| `src/pages/Login.tsx` | Login landing (Google OAuth button + email login option), email/password form, forgot password, magic link | Template `src/pages/Login.tsx` + `src/components/LoginForm.tsx` + `src/components/AuthUtils.tsx` |
| `src/pages/Register.tsx` | Registration landing (Google OAuth + email), email/password form, email confirmation | Template `src/pages/Register.tsx` + `src/components/RegistrationForm.tsx` |
| `src/pages/AuthCallback.tsx` | Handles OAuth redirect — extracts tokens from URL hash, stores in localStorage, redirects to `/` | Template `src/pages/AuthCallback.tsx` |

Also create `src/hooks/useOAuthPopup.ts` based on the template — handles OAuth by redirecting to `https://auth.nut.new/functions/v1/oauth/start` with the app's callback URL.

Reference: `~/record[REDACTED]/builder-assets/appTemplate/src/hooks/useOAuthPopup.ts`

### 11. Update Routing and Entry Point

Modify `src/App.tsx`:
- Add routes: `/login` → Login, `/register` → Register, `/auth/callback` → AuthCallback (outside `AppLayout`)
- Redirect unauthenticated users to `/login` on all other routes

Modify `src/main.tsx`:
- Import `src/lib/auth.ts` before anything else (activates the fetch interceptor)
- Wrap app in `<AuthProvider>`

### 12. User Display in Sidebar

Update the sidebar/layout component to show the authenticated user's name and avatar (from `useAuth()`) and a sign-out button.

### 13. Replace Author Fields

Backend functions that write author-related fields should use `req.user.name` from the authenticated request instead of accepting it from the request body or defaulting to `'System'`/`'User'`:

| Function | Field | Current | After |
|---|---|---|---|
| `tasks.ts` | `task_notes.author` | `body.author ?? 'User'` | `req.user.name` |
| `tasks.ts` | `timeline_events.user_name` | `'System'` | `req.user.name` |
| `deal-detail.ts` | `writeups.author` | `body.author` | `req.user.name` |
| `deal-detail.ts` | `deal_history.changed_by` | `body.changed_by` | `req.user.name` |
| `clients.ts` | `timeline_events.user_name` | `'System'` or body | `req.user.name` |

### 14. Update Tests

The template's `jwt.ts` supports `IS_TEST` mode with a local EC test key. Port this into the CRM's auth middleware so Playwright tests can generate valid JWTs without hitting the real auth service.

---

## Files to Create

| File | Based on |
|---|---|
| `src/lib/auth.ts` | Template `src/lib/auth.ts` |
| `src/contexts/AuthProvider.tsx` | Template `src/contexts/AuthProvider.tsx` |
| `src/store/appApi.ts` | Template `src/store/slices/appApi.ts` |
| `src/store/authSlice.ts` | Template `src/store/slices/authSlice.ts` |
| `src/pages/Login.tsx` | Template `src/pages/Login.tsx` + `src/components/LoginForm.tsx` + `src/components/AuthUtils.tsx` |
| `src/pages/Register.tsx` | Template `src/pages/Register.tsx` + `src/components/RegistrationForm.tsx` |
| `src/pages/AuthCallback.tsx` | Template `src/pages/AuthCallback.tsx` |
| `src/hooks/useOAuthPopup.ts` | Template `src/hooks/useOAuthPopup.ts` |
| `netlify/utils/auth.ts` | Simplified from template `netlify/utils/jwt.ts` — uses Neon instead of Supabase for user sync |
| `netlify/functions/getUserInfo.ts` | Template `netlify/functions/getUserInfo.ts` |

## Files to Modify

| File | Change |
|---|---|
| `package.json` | Add `@supabase/supabase-js`, `jose`, `react-hook-form`, `@hookform/resolvers`, `zod`, `sonner` |
| `scripts/init-db.ts` | Add `users` table |
| `src/main.tsx` | Import `auth.ts` early, wrap app in `AuthProvider` |
| `src/App.tsx` | Add `/login`, `/register`, `/auth/callback` routes; redirect unauthenticated users |
| `src/store/index.ts` | Register `appApi.reducer` and `appApi.middleware` |
| `netlify/functions/clients.ts` | Wrap with `requiresAuth`, use `req.user.name` for timeline events |
| `netlify/functions/deals.ts` | Wrap with `requiresAuth` |
| `netlify/functions/tasks.ts` | Wrap with `requiresAuth`, use `req.user.name` for notes and timeline events |
| `netlify/functions/individuals.ts` | Wrap with `requiresAuth` |
| `netlify/functions/client-timeline.ts` | Wrap with `requiresAuth` |
| `netlify/functions/client-deals.ts` | Wrap with `requiresAuth` |
| `netlify/functions/client-tasks.ts` | Wrap with `requiresAuth` |
| `netlify/functions/client-people.ts` | Wrap with `requiresAuth` |
| `netlify/functions/client-attachments.ts` | Wrap with `requiresAuth` |
| `netlify/functions/deal-detail.ts` | Wrap with `requiresAuth`, use `req.user.name` for writeups/deal_history |
| Sidebar/layout component | Add user avatar, name, and sign-out button |
