# Bug: All sidebar tests fail - sidebar not rendering

## Step 1: Evidence

Evidence the app is broken: The catch-all SPA redirect `/* -> /index.html` in netlify.toml
was intercepting Vite dev server module requests (e.g., `/src/main.tsx`, `/@vite/client`,
`/@react-refresh`), causing them to return `index.html` content instead of JavaScript modules.
The browser rejected these with "Expected a JavaScript module script but the server responded
with a MIME type of ''" and React never mounted, leaving `#root` empty.

Evidence the test is broken: None found

## Step 2: Determination

Which is broken: APP

## Step 3: Root Cause

In `netlify.toml`, the `[[redirects]]` rule `from = "/*" to = "/index.html" status = 200`
acts as a rewrite that catches ALL incoming requests, including Vite dev server module paths
like `/src/main.tsx`, `/@vite/client`, and `/@react-refresh`. When `netlify dev` proxies
these requests, the redirect rule rewrites them to `/index.html` before Vite can serve the
actual JavaScript modules. Vite then tries to process `index.html` as JS and fails with
"Failed to parse source for import analysis because the content contains invalid JS syntax".
The browser receives HTML instead of JS modules and refuses to execute them due to strict
MIME type checking, so React never mounts.

Fix: Add explicit passthrough redirect rules for Vite dev paths (`/src/*`, `/@vite/*`,
`/@react-refresh`, `/node_modules/*`) before the catch-all SPA redirect, so these requests
reach Vite's dev server unmodified.
