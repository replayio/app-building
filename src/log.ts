import { mkdirSync, writeFileSync, appendFileSync, existsSync, statSync, renameSync } from "fs";
import { join } from "path";

export type Logger = (message: string) => void;

/**
 * Rotate any existing worker-current.log to a timestamped name,
 * create a fresh one, and return a logger that appends to it.
 */
export function createLogFile(logsDir: string): Logger {
  mkdirSync(logsDir, { recursive: true });
  const currentLogFile = join(logsDir, "worker-current.log");

  if (existsSync(currentLogFile) && statSync(currentLogFile).size > 0) {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    renameSync(currentLogFile, join(logsDir, `worker-${ts}.log`));
  }
  writeFileSync(currentLogFile, "");

  return (message: string): void => {
    const line = `[${new Date().toISOString()}] ${message}\n`;
    appendFileSync(currentLogFile, line);
  };
}

/**
 * Rename worker-current.log to a timestamped file.
 */
export function archiveCurrentLog(logsDir: string): void {
  const currentLogFile = join(logsDir, "worker-current.log");
  if (existsSync(currentLogFile)) {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    renameSync(currentLogFile, join(logsDir, `worker-${ts}.log`));
  }
}
