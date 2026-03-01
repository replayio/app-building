# Bug: Container Spawn Endpoint Does Not Work

## Summary

Curling the `POST /.netlify/functions/spawn-container` endpoint creates a pending database record and returns success, but the container is never actually created on Fly.io. The background function that performs the actual machine creation is never triggered.

## Root Cause

The `spawn-container.ts` function triggers the background function via a fire-and-forget `fetch()` call (line 84–93) that is **not awaited**:

```typescript
fetch(`${siteUrl}/.netlify/functions/spawn-container-background`, { ... })
  .catch((err) => { console.error(...) })
```

In Netlify's serverless environment (backed by AWS Lambda), the execution context is frozen once the handler returns its Response. Since the fetch is not awaited, the HTTP request to the background function may not be sent before the context freezes. The result is that:

1. The pending database record is created successfully
2. The success response is returned to the caller
3. The background function is never invoked
4. The container stays in "pending" status forever

## Contributing Factor

The `spawn-container-background.ts` function calls `createMachine()` without retry logic. The library's own `startRemoteContainer()` retries up to 5 times for `MANIFEST_UNKNOWN` errors (when the container image hasn't propagated to the registry yet). Without this retry logic, even if the background function is triggered, it can fail transiently.

## Fix

1. **Await the fetch** in `spawn-container.ts` — since the background function returns 202 immediately, the await resolves quickly and ensures the request is actually sent.
2. **Add retry logic** in `spawn-container-background.ts` for `createMachine()` to handle `MANIFEST_UNKNOWN` errors, matching the pattern used by the library's `startRemoteContainer()`.
