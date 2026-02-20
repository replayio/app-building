# app-building

Agentic app building platform using Claude Code CLI inside Docker containers. Apps are defined by spec files and built/maintained by strategy-driven agent iterations.

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

## Other Commands

| Command | Description |
|---------|-------------|
| `npm run test-container` | Start a container with bash (no agent) |
| `npm run docker:build` | Rebuild the Docker image |
| `npm run status` | Show agent status, recent output, and tail if running |
| `npm run reset-app -- <app>` | Reset an app to spec files only |
| `npm run read-log -- <file>` | Render a log file as readable output |
