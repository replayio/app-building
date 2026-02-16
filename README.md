# app-building

An agent loop that iteratively builds applications using the Claude Code CLI. Point it at an app directory with an `AppSpec.md` and a set of strategy files, and it will plan, implement, and review your project across multiple iterations — running in a Docker container.

## How It Works

In **detached mode**, the agent runs in a loop inside a Docker container:

1. **Runs Claude** via the CLI (`claude -p`) with your prompt
2. **Logs output** to `logs/iteration-<timestamp>.log`
3. **Commits changes** to git
4. **Continues** with `claude -c -p "Continue."` for subsequent iterations
5. **Stops** when Claude includes `<DONE/>` in its response or the max iteration count is reached

In **interactive mode**, you chat with Claude one message at a time from your terminal, with output streamed and formatted in real-time.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated

## Setup

```bash
npm install
```

Create a `.env` file in the project root with your API keys (see `.env.example` for the full list):

```
ANTHROPIC_API_KEY=sk-ant-...
NETLIFY_AUTH_TOKEN=...
NEON_API_KEY=...
```

All variables in `.env.example` must be set in `.env`.

## Usage

### Creating an app

Apps live under `apps/<name>/`. Create one with a git repo and an `AppSpec.md`:

```bash
mkdir -p apps/my-app && cd apps/my-app && git init
# Add AppSpec.md describing what the app should do
```

### Detached mode (background agent loop)

```bash
npm run agent -- "<prompt>" [-n <max-iterations>]
```

Starts a detached Docker container that runs Claude in a loop. Each iteration runs `claude -p`, logs output, commits changes, and continues until `<DONE/>` or the iteration limit.

**Examples:**

```bash
# Run with a strategy file, unlimited iterations
npm run agent -- "Read strategies/performTasks.md and follow the instructions exactly."

# Limit to 5 iterations
npm run agent -- "Build the app according to AppSpec.md" -n 5
```

Follow the container output with the `docker logs -f` command printed at startup.

### Interactive mode

```bash
npm run agent
```

Starts a Docker container and drops you into a prompt. Each message you type is sent to Claude via `claude -p`. Subsequent messages use `claude -c -p` to continue the conversation. Output is streamed and formatted in real-time.

### Testing the container environment

Start a container with the same setup (volumes, env vars, network) but drop into a bash shell instead of running the agent:

```bash
npm run test-container
```

### Building the Docker image manually

```bash
npm run docker:build
```

### Checking status

```bash
npm run status              # Show status for all apps
npm run status -- my-app    # Show status for one app
```

### Resetting an app

Remove all generated files, keeping only `AppSpec.md`, `AppStyle.md`, and `.git`:

```bash
npm run reset-app -- my-app
```

### Reading Logs

Log files contain raw JSON stream events. Use `read-log` to render them as readable output:

```bash
npm run read-log -- logs/iteration-2026-02-13T00-00-00-000Z.log
```

## Strategies

Strategy files are Markdown documents in `strategies/` that tell Claude what to do each iteration. You can write your own strategy files to customize the agent's behavior.

## App Directory Structure

The agent expects the app directory to have:

- `AppSpec.md` — Describes what the application should do
- `AppStyle.md` — Describes the styling of the app
- `docs/plan.md` — Created/updated by the strategy
