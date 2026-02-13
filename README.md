# app-building

An agent loop that iteratively builds applications using the Claude Code CLI. Point it at an app directory with an `AppSpec.md` and a set of strategy files, and it will plan, implement, and review your project across multiple iterations — running in a Docker container.

## How It Works

Each iteration of the loop:

1. **Gathers context** from the app directory (AppSpec.md, docs/, git history, file tree)
2. **Builds a prompt** combining the strategy instructions with the current repo context
3. **Runs Claude** via the CLI (`claude -p`) in the app directory
4. **Logs output** to `apps/<name>/logs/iteration-<timestamp>.log`
5. **Commits changes** to git

The loop stops when Claude includes `<DONE/>` in its response or the max iteration count is reached.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated

## Setup

```bash
npm install
```

Create a `.env` file in the project root with your API keys:

```
ANTHROPIC_API_KEY=sk-ant-...
NETLIFY_AUTH_TOKEN=...
NEON_API_KEY=...
```

Required environment variables declared in strategy files (plus `ANTHROPIC_API_KEY`) are checked at startup.

## Usage

### Creating an app

Apps live under `apps/<name>/`. Create one with a git repo and an `AppSpec.md`:

```bash
mkdir -p apps/my-app && cd apps/my-app && git init
# Add AppSpec.md describing what the app should do
```

### Running with Docker containers (recommended)

```bash
npm run agent -- <appName> --load <strategies...> [--max-iterations <n>]
```

**Arguments:**
- `<appName>` — Name of the app (must exist under `apps/<appName>/`)
- `--load <strategies...>` — Strategy file basenames from `strategies/`
- `--max-iterations <n>` — Stop after N iterations (default: unlimited)

**Example:**

```bash
npm run agent -- my-app --load buildInitialApp.md --max-iterations 10
```

This will:
1. Build the Docker image if it doesn't exist
2. Start a container mounting the project at `/repo`
3. Pass env vars from `.env` into the container
4. Pipe container stdout/stderr to the host console
5. Report exit status when the container finishes

#### Building the Docker image manually

```bash
npm run docker:build
```

### Running the loop directly (without Docker)

For debugging or running outside containers, use `loop.ts` directly:

```bash
npm run loop -- --app <name> --repo-root <path> --load <basenames...> [--max-iterations N]
```

**Options:**
- `--app <name>` — App name (under `apps/<name>/`)
- `--repo-root <path>` — Repo root directory
- `--load <basenames...>` — Strategy file basenames from `strategies/`
- `--max-iterations N` — Stop after N iterations (default: unlimited)

### Checking status

```bash
npm run status              # Show status for all apps
npm run status -- my-app    # Show status for one app
```

### Reading Logs

Log files contain raw JSON stream events. Use `read-log` to render them as readable output:

```bash
npm run read-log -- apps/my-app/logs/iteration-2026-02-13T00-00-00-000Z.log
```

## Strategies

Strategy files are Markdown documents in `strategies/` that tell Claude what to do each iteration. You can write your own strategy files to customize the agent's behavior.

Strategy files can declare required environment variables under a `## Required Environment Variables` heading with a code block. The loop checks these at startup and exits if any are missing.

## App Directory Structure

The agent expects the app directory to have:

- `AppSpec.md` — Describes what the application should do
- `AppStyle.md` — Describes the styling of the app
- `docs/plan.md` — Created/updated by the strategy
