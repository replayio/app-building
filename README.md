# app-building

An agent loop that iteratively builds applications using the Claude Code CLI. Point it at a git repository with an `AppSpec.md` and a set of strategy files, and it will plan, implement, and review your project across multiple iterations — each target running in its own Docker container.

## How It Works

Each iteration of the loop:

1. **Gathers context** from the target repository (AppSpec.md, docs/, git history, file tree)
2. **Builds a prompt** combining the strategy instructions with the current repo context
3. **Runs Claude** via the CLI (`claude -p`) in the target directory
4. **Logs output** to `<target-dir>/logs/loop-N.log`
5. **Commits changes** to git

The loop stops when Claude includes `<DONE/>` in its response or the max iteration count is reached.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated
- `ANTHROPIC_API_KEY` environment variable set

## Setup

```bash
npm install
```

## Usage

### Running with Docker containers (recommended)

Create a JSON config file (see `config.example.json`):

```json
{
  "maxIterations": 10,
  "targets": [
    {
      "dir": "../app1",
      "strategies": ["strategies/buildInitialApp.md"]
    },
    {
      "dir": "../app2",
      "strategies": ["strategies/buildInitialApp.md"]
    }
  ]
}
```

Paths are resolved relative to the config file's directory.

Then run the agent:

```bash
npm run agent -- config.json
```

This will:
1. Build the Docker image if it doesn't exist
2. Start a container for each target in parallel
3. Each container mounts the target directory at `/workspace` and strategies at `/strategies`
4. Pipe container stdout/stderr to the host console
5. Report exit status when all containers finish

Required environment variables declared in strategy files (plus `ANTHROPIC_API_KEY`) are checked at startup and passed into each container.

#### Building the Docker image manually

```bash
npm run docker:build
```

### Running the loop directly (without Docker)

For debugging or running outside containers, use `loop.ts` directly:

```bash
npm run loop -- --dir <target-dir> --load <strategy.md> [<strategy2.md> ...] [--max-iterations N]
```

**Options:**
- `--dir <path>` — Target git repository directory (required)
- `--load <files...>` — One or more strategy files to guide the agent (required)
- `--max-iterations N` — Stop after N iterations (default: unlimited)

#### Example

```bash
npm run loop -- --dir ../my-app --load strategies/buildInitialApp.md --max-iterations 10
```

### Reading Logs

Log files contain raw JSON stream events. Use `read-log` to render them as readable output:

```bash
npm run read-log -- ../my-app/logs/loop-1.log
```

## Strategies

Strategy files are Markdown documents that tell Claude what to do each iteration. You can write your own strategy files to customize the agent's behavior.

Strategy files can declare required environment variables under a `## Required Environment Variables` heading with a code block. The loop checks these at startup and exits if any are missing.

## Target Repository Structure

The agent expects the target repository to have:

- `AppSpec.md` — Describes what the application should do
- `AppStyle.md` - Describes the styling of the app
- `docs/plan.md` — Created/updated by the strategy
