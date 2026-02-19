# test

## Purpose

Runs Playwright tests for a single test file using the Replay browser, with automatic database
branch setup, seeding, and failed-recording upload. This is the single entry point for running
tests during development and debugging.

## Usage

- `package.json` entry: `"test": "tsx scripts/test.ts"`
- Required argument: a test file path (e.g., `npm run test tests/clients-list-page.spec.ts`).
- Example: `npm run test tests/auth.spec.ts`

## Behavior

1. **Kill stale processes**: Kill any leftover `netlify` or `vite` dev server processes from
   previous runs.

2. **Clean up stale Neon branches**: List existing Neon branches and delete any that match the
   test branch naming convention (e.g., `test-worker-*`) from interrupted previous runs.

3. **Create ephemeral Neon branch**: Create a fresh branch from the project's main branch for
   this test run. Name it with a convention like `test-worker-{run-id}`.

4. **Initialize and seed**: Run `initSchema` on the new branch, then run migrations, then seed
   test data.

5. **Remove stale recordings**: Run `npx [REDACTED]io remove --all` to clear local recordings from
   prior runs.

6. **Run Playwright**: Run `npx playwright test <testFile>` with `--retries 0` against the
   specified test file. The Playwright config handles starting the dev server with the branch's
   `DATABASE_URL`. Capture the exit code.

7. **On failure** (non-zero exit code):
   a. Parse `~/.[REDACTED]/recordings.log` with a built-in parser (NOT `npx [REDACTED]io list --json`,
      which crashes on large suites). The log is newline-delimited JSON with `kind` field:
      `createRecording`, `addMetadata`, `writeStarted`, `writeFinished`, etc.
   b. Log full metadata for every recording that has test metadata in a delimited block:
      ```
      === REPLAY RECORDINGS METADATA ===
      {"id":"...","testResult":"failed","testTitle":"...","specFile":"..."}
      ...
      === END REPLAY RECORDINGS METADATA ===
      ```
   c. Upload exactly ONE recording: among all finished recordings where
      `metadata.test.result` is `"failed"` or `"timedOut"`, pick the one with the longest
      duration (the real recording, not zero-duration stubs). Upload with
      `npx [REDACTED]io upload <id>`. On success, log `REPLAY UPLOADED: <recordingId>`.
      On failure, log the exit code.

8. **Clean up**: Delete the ephemeral Neon branch. Remove local recordings with
   `npx [REDACTED]io remove --all`.

9. **Exit** with the original Playwright exit code.

## Inputs

- **Required argument**: Test file path (e.g., `tests/auth.spec.ts`).
- **Environment variables**:
  - `NEON_API_KEY` (required): For Neon branch management.
  - `RECORD_REPLAY_API_KEY` (required): For Replay recording uploads.
  - `NEON_PROJECT_ID` (required): Read from `.env`. The Neon project to branch from.
  - `DATABASE_URL` (required): Read from `.env`. The main branch connection string used as
    template for ephemeral branches.
  - `REPLAY_CLI` (optional): Override the Replay CLI command (default: `[REDACTED]io`, assumed
    globally installed). Useful for pointing at a local build or alternate installation.
- **Files**:
  - `.env`: Project configuration (Neon project ID, database URL, etc.).
  - `~/.[REDACTED]/recordings.log`: Replay recording metadata (read after test run).

## Outputs

- **stdout**: Playwright test output, recording metadata block, upload confirmations.
- **Side effects**:
  - Creates and deletes ephemeral Neon branches.
  - Uploads failed Replay recordings.
  - Removes local recording files.
- **Exit codes**:
  - 0: All tests passed.
  - Non-zero: Test failures (matches Playwright's exit code).

## Implementation Tips

- Reuse `initSchema` from `scripts/schema.ts` and the seed logic from `scripts/seed-db.ts`.
- Use the Neon API directly (`fetch` to `https://console.neon.tech/api/v2/...`) for branch
  creation and deletion. The API key is `NEON_API_KEY`.
- Parse `~/.[REDACTED]/recordings.log` in TypeScript — it's newline-delimited JSON. The
  `addMetadata` entries contain `metadata.test.result` which indicates pass/fail.
- The Playwright config must use the Replay browser via `[REDACTED]Devices['Replay Chromium']`
  from `@[REDACTED]io/playwright` and include `[REDACTED]Reporter` with `upload: false`.
- The HTML reporter must use `open: 'never'` to suppress the interactive "Serving HTML report"
  prompt that blocks the script from exiting.
- Run Playwright with `--retries 0` — no retries. Failures must be analyzed via Replay.
- Use `child_process.execSync` or `execFileSync` for subprocess calls, inheriting stdio for
  Playwright output.
- The `RECORD_REPLAY_API_KEY` env var is already set in the container.
