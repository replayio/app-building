# Strategy

Use this strategy when you need to search through logs to find specific information,
such as how a tool was used, whether a particular action was taken, or what happened
during a specific phase of work.

## Reading logs

**You MUST use `npm run read-log /path/to/log` from the repo root to read any log file.**
Do NOT use the Read tool, cat, head, tail, or grep on raw log files. The raw content is
either too large (exceeding the 256KB read limit) or full of ANSI escape codes that make
it unreadable. The `read-log` script parses the raw JSON events and terminal recordings
into a readable conversation showing assistant text, tool calls, and results.

This applies to ALL log files: iteration logs, worker logs, and app-specific logs.

## Finding relevant logs

Log files live in two places:
- `/repo/logs/` — worker and iteration logs for the overall system.
- `apps/<AppName>/logs/` — logs specific to an app, including test runs. Some may be
  in a `reviewed/` subdirectory.

List all log files first, then work through them systematically.

## Analyzing logs

For each log file, run `npm run read-log /path/to/log` via Bash and read the output.
The formatted output includes:
- Assistant reasoning and text
- Tool calls (`$ command`, `[edit] path`, `[read] path`, `[glob]`, `[grep]`, `[ToolName]`)
- Truncated tool results (first 20 lines of stdout, stderr in red)
- Session metadata (model, duration, turns, cost)

When searching for something specific across many logs, process each file individually.
Do not skip files or assume their contents from filenames or timestamps alone.
