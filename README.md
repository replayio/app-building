# app-building

Agentic app building platform using Claude Code CLI inside Docker containers. Apps are defined by spec files and built/maintained by strategy-driven agent iterations.

## Setup

```bash
npm install
npm run docker:build
```

Copy `.env.example` to `.env` and fill in all API keys.

## Running the Agent

### Interactive mode

```bash
npm run agent
npm run agent -- --resume <session-id>   # resume a previous session
```

Chat with Claude inside a container. Output is streamed in real-time. Press ESC to interrupt. Subsequent messages continue the conversation.

### Detached mode

```bash
npm run agent -- "<prompt>"
npm run agent -- "<prompt>" -n 10   # limit iterations
```

Runs Claude in a loop inside a detached container. The first iteration runs the provided prompt; subsequent iterations run `performTasks.md` to process tasks from `docs/plan.md`. Each iteration commits changes and re-runs with a fresh context. Stops on `<DONE/>` or the iteration limit. All output is logged to a single `logs/worker-current.log` file.

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
