# app-building

An agent loop that iteratively builds applications using the Claude Code CLI. Point it at a git repository with an `AppSpec.md` and a set of strategy files, and it will plan, implement, and review your project across multiple iterations.

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
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated

## Setup

```bash
npm install
```

## Usage

```bash
npm run loop -- --dir <target-dir> [<target-dir2> ...] --load <strategy.md> [<strategy2.md> ...] [--max-iterations N] [--prompt "extra instructions"]
```

The loop starts as a detached background process and returns immediately. Logs are written to `<target-dir>/logs/loop-N.log`.

**Options:**
- `--dir <paths...>` — One or more target git repository directories (required)
- `--load <files...>` — One or more strategy files to guide the agent (required)
- `--max-iterations N` — Stop after N iterations (default: unlimited)
- `--prompt <text>` — Additional prompt text to include in each iteration

Multiple directories run in parallel, each with their own log file and independent loop.

### Example

```bash
# Single app
npm run loop -- --dir ../my-app --load strategies/buildInitialApp.md --max-iterations 10

# Multiple apps in parallel
npm run loop -- --dir ../app1 ../app2 ../app3 --load strategies/buildInitialApp.md
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
- `docs/plan.md` — Created/updated by the strategy
