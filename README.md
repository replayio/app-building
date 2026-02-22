# app-building

Simple and extensible platform for dark factory agentic app building: creating apps
according to a spec without human involvement along the way. Example use cases:

* `npm run agent -- -p "Build me an app XYZ based on this spec: ..."`
* `npm run agent -- -p "Continue maintaining app XYZ and fix these bugs: ..."`
* `npm run agent -- -i` for interactive access to the agent.

Core ideas:

* The agent runs within a docker container that clones the target repo and exposes an HTTP server for control.
* The host communicates with the container via HTTP — sending prompts, polling events/logs, and managing lifecycle.
* The agent builds by following a set of strategy documents with guides and directives
  for breaking its work down into tasks and performing those tasks.
* The agent reviews its own changes and improves the strategies based on this.
* All code changes are committed and pushed back to the remote from inside the container.

## Strategies

The provided strategy documents emphasize a structured approach for autonomously building
high quality, well tested apps from the initial spec. During the initial app build
it does the following:

1. Designs a comprehensive test specification based on the initial spec.
2. Builds the app and writes tests to match the spec.
3. Gets all the tests to pass, deploys to production, and does further testing.

The initial build will not come out perfect. The agent can followup with maintenance passes
where it checks to make sure it closely followed the spec and strategy directives and fixes
any issues it finds. It will also fix reported bugs and update the strategies to avoid
similar problems in the future.

As long as each individual step the agent takes is within its capabilities (it can usually
do it but not always) the agent will converge on an app that follows the initial spec
and strategy directives.

Key things to watch out for:

* Best suited for CRUD and API-calling apps up to a medium level of complexity.
  Overly complicated or specialized apps will not work as well yet.
* Make sure to get a Replay API key and configure it. The agent will use Replay to identify
  and debug problems it encounters in tests or the deployed app.

## Setup

```bash
npm install
npm run docker:build
```

Copy `.env.example` to `.env` and fill in all API keys.

## Architecture

The Docker container runs an HTTP server (`src/server.ts`) that manages the full agent lifecycle:

1. On startup, the container clones the target repo and starts listening on a port.
2. The host sends prompts via `POST /message` and polls for events/logs.
3. After each message, the server processes any pending job groups from `jobs/jobs.json`.
4. Commits and pushes happen inside the container after each iteration.

Container state is tracked locally in `.agent-state.json` so that `npm run status` and `npm run stop` can find the running container.

## Running the Agent

`--repo` defaults to the current git remote (`origin`). `--branch` defaults to the current branch. Use `--push-branch` to push to a different branch than the one cloned.

### Detached mode (default)

```bash
npm run agent
npm run agent -- -p "<prompt>"
npm run agent -- --branch dev --push-branch feature/xyz -p "<prompt>"
```

Starts a container, optionally queues a prompt, then detaches. The container processes the prompt followed by any pending job groups, commits and pushes results, then exits. Monitor with `npm run status`, stop with `npm run stop`.

### Interactive mode

```bash
npm run agent -- -i
```

Chat with Claude inside a container. Output is streamed via event polling. Press ESC to interrupt the current message. On exit, the container is detached and finishes any remaining work.

### Checking status

```bash
npm run status
```

Connects to the running container's HTTP API and shows state, revision, queue depth, cost, and recent log output. Tails logs in real-time (Ctrl+C to stop). Errors if no agent is running.

### Stopping the agent

```bash
npm run stop
```

Sends an HTTP stop signal to the container. Errors if the container is unreachable.

### Remote mode (Fly.io)

Set `FLY_API_TOKEN` in your `.env`, then add `--remote`:

```bash
npm run agent -- --remote -p "build a todo app"
```

On first use, a Fly app is automatically created and saved to `.env` as `FLY_APP_NAME`. Subsequent runs reuse the same app. No `fly` CLI needed.
