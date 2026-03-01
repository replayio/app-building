# App Revisions

## Backend: Container Management

The backend must use the `@replayio/app-building` npm package to manage app-building containers.
This package provides the full lifecycle for starting, stopping, and monitoring containers that
autonomously build apps.

### Key Integration Points

Install `@replayio/app-building` as a dependency. Use its exports in Netlify Functions to:

1. **Start containers** when a new app request is accepted: use `startRemoteContainer(config, repo)`
   to launch a Fly.io machine that builds the app.

2. **Track container state** via `ContainerRegistry`: use the registry to persist which containers
   are alive, stopped, or recently finished. The registry file (`.container-registry.jsonl`) is the
   source of truth for container status.

3. **Communicate with containers** via `httpGet`/`httpPost` with `httpOptsFor(state)`:
   - Send prompts to containers via `POST /message`
   - Poll container status via `GET /status`

4. **Map app states to the UI filters**:
   - "Currently being built" = containers that `findAlive()` returns
   - "Recently finished" = registry entries that are stopped/completed
   - "Queued" = database entries for accepted requests that have not yet had a container started

5. **Stop containers** when builds complete or are cancelled: use `stopRemoteContainer(config, state)`.

### Configuration

The `ContainerConfig` requires:
- `projectRoot`: path to the project
- `envVars`: loaded via `loadDotEnv()` — must include `FLY_API_TOKEN` and `FLY_APP_NAME`
- `registry`: a `ContainerRegistry` instance pointing to the registry file
- `flyToken` and `flyApp`: from env vars

### Database

The database stores app requests, their assessment results, and metadata. Container state
comes from the `ContainerRegistry` and is joined with database records at query time.

### Real-time Feed

The AppPage feed for in-progress apps should poll the container's status/output endpoint
at regular intervals to show live AI output during development.

## Webhook Documentation

The webhook help panel (WebhookHelpButton) displays interactive documentation for all API endpoints. Curl command examples automatically substitute the current site URL in place of placeholder values. Each endpoint has a "Copy URL" button in the header that copies the full endpoint URL to the clipboard, and each curl example section has a "Copy" button that copies the resolved curl command to the clipboard.
