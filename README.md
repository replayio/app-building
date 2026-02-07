# app-building

An agent loop that iteratively builds applications using the Claude Code CLI. Point it at a git repository with an `AppSpec.md` and a set of strategy files, and it will plan, implement, and review your project across multiple iterations.

## How It Works

Each iteration of the loop:

1. **Gathers context** from the target repository (AppSpec.md, docs/, git history, file tree)
2. **Builds a prompt** combining the strategy instructions with the current repo context
3. **Runs Claude** via the CLI (`claude -p`) in the target directory
4. **Saves output** to `docs/iterations/iteration-N.json`
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
npm run loop -- <target-dir> <strategy1.md> [strategy2.md ...] [--max-iterations N]
```

**Arguments:**
- `target-dir` — Path to the target git repository (must contain an `AppSpec.md`)
- `strategy.md` — One or more strategy files to guide the agent

**Options:**
- `--max-iterations N` — Stop after N iterations (default: unlimited)

### Example

```bash
# Plan, then implement
npm run loop -- ../my-app strategies/plan.md --max-iterations 1
npm run loop -- ../my-app strategies/implement.md --max-iterations 10

# Or combine strategies in one run
npm run loop -- ../my-app strategies/plan.md strategies/implement.md strategies/review.md
```

## Strategies

Strategy files are Markdown documents that tell Claude what to do each iteration. You can write your own strategy files to customize the agent's behavior.

## Target Repository Structure

The agent expects the target repository to have:

- `AppSpec.md` — Describes what the application should do
- `docs/plan.md` — Created/updated by the planning strategy
- `docs/iterations/` — Iteration output is saved here automatically
