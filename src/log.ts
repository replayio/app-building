import { mkdirSync, writeFileSync, appendFileSync, existsSync, statSync, renameSync, readFileSync } from "fs";
import { join, resolve } from "path";

export type Logger = (message: string) => void;

/** Load secret values from .env */
function loadSecrets(): string[] {
  const envPath = resolve(__dirname, "..", ".env");
  if (!existsSync(envPath)) return [];
  const secrets: string[] = [];
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value) secrets.push(value);
  }
  return secrets;
}

let _secrets: string[] | null = null;

/** Replace .env secret values with [REDACTED] */
export function redactSecrets(text: string): string {
  if (!_secrets) _secrets = loadSecrets();
  let result = text;
  for (const secret of _secrets) {
    if (result.includes(secret)) {
      result = result.replaceAll(secret, "[REDACTED]");
    }
  }
  return result;
}

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
    const line = `[${new Date().toISOString()}] ${redactSecrets(message)}\n`;
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
