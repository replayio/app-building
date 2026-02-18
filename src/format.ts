export const RESET = "\x1b[0m";
export const DIM = "\x1b[2m";
export const BOLD = "\x1b[1m";
export const CYAN = "\x1b[36m";
export const GREEN = "\x1b[32m";
export const YELLOW = "\x1b[33m";
export const RED = "\x1b[31m";
const MAGENTA = "\x1b[35m";

/**
 * Format a single raw log line (timestamp already stripped) for display.
 * Returns null if the line should be hidden.
 */
export function formatLogLine(line: string): string | null {
  if (!line.trim()) return null;

  if (line.startsWith("=== Iteration")) {
    return `\n${BOLD}${CYAN}${line}${RESET}`;
  }
  if (line.startsWith("Initial revision:") || line.startsWith("Final revision:")) {
    return `${BOLD}${line}${RESET}`;
  }
  if (
    line.startsWith("Container:") ||
    line.startsWith("Target:") ||
    line.startsWith("Strategy:") ||
    line.startsWith("Strategies:") ||
    line.startsWith("Max iterations:") ||
    line.startsWith("Log file:")
  ) {
    return `${DIM}${line}${RESET}`;
  }
  if (line.startsWith("Running Claude")) {
    return `${DIM}${line}${RESET}`;
  }
  if (line.startsWith("Completed in")) {
    return `${GREEN}${line}${RESET}`;
  }
  if (line.startsWith("Cost:")) {
    return `${YELLOW}${line}${RESET}`;
  }
  if (line.startsWith("Turns:")) {
    return `${DIM}${line}${RESET}`;
  }
  if (line.startsWith("Committed iteration")) {
    return `${DIM}${line}${RESET}`;
  }
  if (
    line.startsWith("Reached max iterations") ||
    line.startsWith("Finished after") ||
    line.includes("Agent signaled <DONE/>")
  ) {
    return `${BOLD}${GREEN}${line}${RESET}`;
  }
  if (line.startsWith("Error running") || line.startsWith("Warning:") || line.startsWith("[claude:err]")) {
    return `${RED}${line}${RESET}`;
  }
  if (line === "--- Prompt ---" || line === "--- End prompt ---") {
    return null;
  }

  // Try parsing as JSON stream event
  try {
    const event = JSON.parse(line);
    return formatEvent(event);
  } catch {
    return line;
  }
}

export function formatEvent(event: any): string | null {
  if (event.type === "system" && event.subtype === "init") {
    return `${DIM}Session: ${event.session_id} | Model: ${event.model}${RESET}`;
  }

  if (event.type === "assistant") {
    const content = event.message?.content;
    if (!Array.isArray(content)) return null;

    const parts: string[] = [];
    for (const block of content) {
      if (block.type === "text" && block.text) {
        parts.push(block.text);
      } else if (block.type === "tool_use") {
        const input = block.input;
        if (block.name === "Bash" && input?.command) {
          parts.push(`${MAGENTA}$ ${input.command}${RESET}`);
        } else if (block.name === "Edit" && input?.file_path) {
          parts.push(`${MAGENTA}[edit] ${input.file_path}${RESET}`);
        } else if (block.name === "Write" && input?.file_path) {
          parts.push(`${MAGENTA}[write] ${input.file_path}${RESET}`);
        } else if (block.name === "Read" && input?.file_path) {
          parts.push(`${MAGENTA}[read] ${input.file_path}${RESET}`);
        } else if (block.name === "Glob" && input?.pattern) {
          parts.push(`${MAGENTA}[glob] ${input.pattern}${RESET}`);
        } else if (block.name === "Grep" && input?.pattern) {
          parts.push(`${MAGENTA}[grep] ${input.pattern}${RESET}`);
        } else {
          parts.push(`${MAGENTA}[${block.name}]${RESET}`);
        }
      }
    }
    return parts.length > 0 ? parts.join("\n") : null;
  }

  if (event.type === "user" && event.tool_use_result) {
    const result = event.tool_use_result;
    const stdout = result.stdout ?? "";
    const stderr = result.stderr ?? "";
    const parts: string[] = [];
    if (stdout) {
      const lines = stdout.split("\n");
      const display = lines.length > 20
        ? [...lines.slice(0, 20), `${DIM}... (${lines.length - 20} more lines)${RESET}`]
        : lines;
      parts.push(`${DIM}${display.join("\n")}${RESET}`);
    }
    if (stderr) {
      parts.push(`${RED}${stderr}${RESET}`);
    }
    return parts.length > 0 ? parts.join("\n") : null;
  }

  if (event.type === "result") {
    return `\n${BOLD}${GREEN}--- Result ---${RESET}\n${DIM}Duration: ${event.duration_ms}ms | Turns: ${event.num_turns} | Cost: $${event.total_cost_usd?.toFixed(4)}${RESET}`;
  }

  return null;
}
