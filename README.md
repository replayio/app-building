# app-building

Simple and extensible platform for dark factory agentic app building: creating apps
according to a spec without human involvement along the way. Example use cases:

* `npm run agent -- "Build me an app XYZ based on this spec: ..."`
* `npm run agent -- "Continue maintaining app XYZ and fix these bugs: ..."`
* `npm run agent` for interactive access to the agent.

Core ideas:

* The agent runs within a docker container and has access to the repo and the internet.
* The agent builds by following a set of strategy documents with guides and directives
  for breaking its work down into tasks and performing those tasks.
* The agent reviews its own changes and improves the strategies based on this.
* All code changes and agent trajectories are tracked in git for later automated review.

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

## Running the Agent

### Consume pending jobs (default)

```bash
npm run agent
npm run agent -- -n 10   # limit iterations
```

Consumes pending job groups from `jobs/jobs.json`. Errors if no groups are queued. Each iteration handles one group — all jobs in the group are passed to Claude, which signals `<DONE>` on completion. Groups that don't get `<DONE>` are retried (up to 3 times). All output is logged to `logs/worker-current.log`.

### Prompt mode

```bash
npm run agent -- -p "<prompt>"
npm run agent -- -p "<prompt>" -n 10
```

Handles the prompt first, then consumes any pending job groups.

### Interactive mode

```bash
npm run agent -- -i
npm run agent -- -i --resume <session-id>
```

Chat with Claude inside a container. Output is streamed in real-time. Press ESC to interrupt. Subsequent messages continue the conversation.

### Checking status

```bash
npm run status
```

Shows the container name, iteration progress, cost, and the last 20 lines of formatted log output. If the agent is still running, it tails the log in real-time (Ctrl+C to stop).
