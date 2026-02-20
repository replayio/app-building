# Strategy

You are implementing a package script based on its design doc in `strategies/scripts/`.

## Process

1. **Read the design doc**: Read `strategies/scripts/<script-name>.md` to understand the
   script's purpose, usage, behavior, inputs, outputs, and implementation tips.

2. **Read related code**: Before writing, read existing scripts and modules referenced in
   the design doc's implementation tips. Understand the patterns already in use.

3. **Implement the script**: Write the script as a TypeScript file at `scripts/<script-name>.ts`.
   Scripts MUST be TypeScript run via `tsx`. Do not write shell scripts.

4. **Add the package.json entry**: Add the script to the app's `package.json` under `"scripts"`,
   matching the usage section of the design doc.

5. **Test the script**: Run the script to verify it works. If it modifies state (database,
   files, processes), verify the state changes are correct.

6. **Typecheck and lint**: Run `npx tsc --noEmit` and `npx eslint .` to verify no errors.

7. Verify the script works end-to-end.

## Guidelines

- Follow the design doc's contract exactly. The design doc defines the expected inputs, outputs,
  and behavior — do not deviate from it without updating the design doc.
- Reuse existing infrastructure. If the design doc says to use `initSchema` or other shared
  modules, import them rather than duplicating logic.
- Handle errors clearly. Scripts should fail with descriptive error messages when required
  environment variables are missing or external calls fail.
- Scripts must work from the app directory (`apps/<AppName>/`). Use relative paths for local
  files and respect the monorepo structure.
- Scripts MUST be TypeScript. Use Node.js APIs (`child_process`, `fs`, `path`, etc.) for
  any process management, file I/O, or CLI invocations. Do not write shell scripts.
