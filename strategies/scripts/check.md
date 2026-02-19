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

1. Run `npx tsc --noEmit` to typecheck. If it fails, print the errors and exit with code 1.
2. Run `npx eslint . --fix` to lint with autofix. If it fails after autofix, print the errors and exit with code 1.
3. Exit with code 0 if both pass.

## Inputs

None.

## Outputs

- Exit code 0: both typecheck and lint passed.
- Exit code 1: typecheck or lint failed (errors printed to stdout/stderr).
- Lint autofix may modify source files in place.

## Implementation Tips

- Use `child_process.execSync` for each step, inheriting stdio so output streams to the terminal.
- Run typecheck first — no point linting if types are broken.
