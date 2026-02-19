# analyze-test-failure

## Purpose

Launches a dedicated Claude instance with Replay MCP to analyze a Replay recording and explain
why a test failed. The script fetches the Replay MCP skill instructions from GitHub, configures
the Replay MCP HTTP transport, and runs Claude in print mode to produce a failure analysis.

## Usage

- `package.json` entry: `"analyze-test-failure": "tsx scripts/analyze-test-failure.ts"`
- Required argument: a Replay recording ID (e.g., `npm run analyze-test-failure abc123-def456`).
- Example: `npm run analyze-test-failure 9a0866e3-4e1d-441c-9fbb-3419c28c8cef`

## Behavior

1. **Validate input**: Require exactly one argument (the recording ID). Exit with usage message
   if missing.

2. **Fetch SKILL.md**: Download the Replay MCP skill instructions from
   `https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-mcp/SKILL.md`.
   This document tells Claude how to use the Replay MCP tools effectively.
   The content is fetched and embedded directly in the system prompt (the nested Claude
   cannot fetch URLs on its own).

3. **Write MCP config**: Write a temporary JSON file with the Replay MCP server configuration:
   ```json
   {
     "mcpServers": {
       "[REDACTED]": {
         "type": "http",
         "url": "https://dispatch.[REDACTED].io/nut/mcp",
         "headers": {
           "Authorization": "<RECORD_REPLAY_API_KEY>"
         }
       }
     }
   }
   ```

4. **Launch Claude**: Run `claude` in print mode with:
   - `--print` for non-interactive output
   - `--mcp-config <tempConfigFile>` for the Replay MCP server
   - `--allowedTools "mcp__[REDACTED]__*"` to restrict to Replay MCP tools
   - `--append-system-prompt` with the SKILL.md content
   - `--strict-mcp-config` to use only the Replay MCP server
   - `--dangerously-skip-permissions` to bypass permission prompts
   - `--model sonnet` for fast analysis
   - A prompt asking Claude to analyze the recording and explain why the test failed

5. **Stream output**: Pipe Claude's stdout/stderr to the parent process so the analysis
   is visible in real time.

6. **Clean up**: Delete the temporary MCP config file.

7. **Exit** with Claude's exit code.

## Inputs

- **Required argument**: Recording ID (the Replay recording to analyze).
- **Environment variables**:
  - `RECORD_REPLAY_API_KEY` (required): API key for the Replay MCP server.
  - `ANTHROPIC_API_KEY` (required): API key for Claude (already set in container).

## Outputs

- **stdout**: Claude's analysis of why the test failed, including evidence from the recording.
- **Exit codes**:
  - 0: Analysis completed successfully.
  - Non-zero: Failed to fetch SKILL.md, Claude errored, or missing inputs.

## Implementation Tips

- Use `curl -sfL` via `execSync` to download SKILL.md (simple, handles redirects).
- Write the MCP config to a temp file using `os.tmpdir()` and clean it up in a finally block.
- Use `child_process.execFileSync` (not `execSync`) to run Claude — avoids shell quoting
  issues with the large system prompt.
- Delete the `CLAUDECODE` env var before spawning so nested Claude can launch.
- The SKILL.md instructs Claude to use a systematic investigation methodology:
  frame a question, explore with timeline/error tools, explain with detail tools,
  form an evidence-backed hypothesis.
- The 10-minute timeout (600,000 ms) gives Claude enough time for thorough analysis.
