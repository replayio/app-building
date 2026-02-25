# check

## Purpose

Runs typecheck and lint with autofix as a single command. This is the quality gate that must
pass before every commit.

## Usage

- `package.json` entry: `"check": "tsx scripts/check.ts"`
- No command-line arguments.
- No environment variables.
- Example: `npm run check`

## Behavior

1. Run `npx tsc --noEmit` to typecheck. Capture output to a log file.
2. Run `npx eslint . --fix` to lint with autofix. Capture output to the same log file.
3. Print a one-line summary to stdout:
   - Success: `check passed`
   - Failure: `check failed (typecheck|lint) — see logs/check.log`
4. Exit with code 0 if both pass, 1 otherwise.

## Inputs

None.

## Outputs

- **stdout**: One-line summary only.
- **`logs/check.log`**: Full typecheck and lint output. Overwritten each run.
- **Exit code 0**: both typecheck and lint passed.
- **Exit code 1**: typecheck or lint failed.
- Lint autofix may modify source files in place.

## Implementation Tips

- Use `child_process.execSync` for each step. Do NOT inherit stdio — pipe output to the log file.
- Run typecheck first — no point linting if types are broken.
- Overwrite `logs/check.log` each run (not append).
