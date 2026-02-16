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

Runs Claude in a loop inside a detached container. Each iteration logs output, commits changes, and re-runs with a fresh context. Stops on `<DONE/>` or the iteration limit. Follow output with the `docker logs -f` command printed at startup.

## Other Commands

| Command | Description |
|---------|-------------|
| `npm run test-container` | Start a container with bash (no agent) |
| `npm run docker:build` | Rebuild the Docker image |
| `npm run status` | Show detached agent status |
| `npm run reset-app -- <app>` | Reset an app to spec files only |
| `npm run read-log -- <file>` | Render a log file as readable output |
