import { execFileSync } from "child_process";
import type { Logger } from "./log";

const REPO_DIR = "/repo";

/**
 * Convert a git remote URL to HTTPS with an embedded token.
 * Handles SSH (git@github.com:org/repo.git) and plain HTTPS URLs.
 * If no token is provided, returns the URL unchanged.
 */
export function toTokenUrl(url: string, token?: string): string {
  if (!token) return url;

  // SSH format: git@github.com:org/repo.git -> https://TOKEN@github.com/org/repo.git
  const sshMatch = url.match(/^git@([^:]+):(.+)$/);
  if (sshMatch) {
    return `https://${token}@${sshMatch[1]}/${sshMatch[2]}`;
  }

  // HTTPS without token: https://github.com/org/repo.git -> https://TOKEN@github.com/org/repo.git
  const httpsMatch = url.match(/^https:\/\/([^@]+@)?(.+)$/);
  if (httpsMatch) {
    return `https://${token}@${httpsMatch[2]}`;
  }

  return url;
}

/** Get the remote URL of the current repo (defaults to "origin"). */
export function getLocalRemoteUrl(cwd: string = "."): string {
  return execFileSync("git", ["remote", "get-url", "origin"], {
    cwd,
    encoding: "utf-8",
    timeout: 5000,
  }).trim();
}

/** Get the current branch name. */
export function getLocalBranch(cwd: string = "."): string {
  return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd,
    encoding: "utf-8",
    timeout: 5000,
  }).trim();
}

export function cloneRepo(url: string, branch: string, dir: string = REPO_DIR): void {
  const args = ["clone", "--branch", branch, "--single-branch", url, dir];
  execFileSync("git", args, { encoding: "utf-8", timeout: 120000, stdio: "pipe" });
}

export function checkoutPushBranch(branch: string, dir: string = REPO_DIR): void {
  execFileSync("git", ["checkout", "-b", branch], {
    cwd: dir,
    encoding: "utf-8",
    timeout: 10000,
    stdio: "pipe",
  });
}

export function commitAndPush(label: string, pushBranch: string, log: Logger, dir: string = REPO_DIR): void {
  try {
    execFileSync("git", ["add", "-A"], { cwd: dir, encoding: "utf-8", timeout: 30000 });
    execFileSync("git", ["commit", "-m", label, "--allow-empty"], {
      cwd: dir,
      encoding: "utf-8",
      timeout: 30000,
    });
  } catch (e: any) {
    log(`Warning: git commit failed: ${e.message}${e.stderr ? `\nstderr: ${e.stderr}` : ""}`);
    return;
  }

  try {
    execFileSync("git", ["fetch", "origin", pushBranch], {
      cwd: dir,
      encoding: "utf-8",
      timeout: 60000,
      stdio: "pipe",
    });
    // Try to merge remote changes (may fail if branch doesn't exist remotely yet)
    try {
      execFileSync("git", ["merge", `origin/${pushBranch}`, "--no-edit"], {
        cwd: dir,
        encoding: "utf-8",
        timeout: 30000,
        stdio: "pipe",
      });
    } catch {
      // Branch may not exist remotely yet — that's fine
    }
  } catch {
    // fetch failed — branch may not exist remotely yet
  }

  try {
    execFileSync("git", ["push", "origin", `HEAD:${pushBranch}`], {
      cwd: dir,
      encoding: "utf-8",
      timeout: 120000,
      stdio: "pipe",
    });
    log(`Pushed to ${pushBranch}`);
  } catch (e: any) {
    log(`Warning: git push failed: ${e.message}${e.stderr ? `\nstderr: ${e.stderr}` : ""}`);
  }
}

export function getRevision(dir: string = REPO_DIR): string {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: dir,
      encoding: "utf-8",
      timeout: 10000,
    }).trim();
  } catch {
    return "(unknown)";
  }
}
