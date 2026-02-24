# Skill

You are preparing the current branch for merging to `main` via PR.
The goal is to land only skills, scripts, and task-system changes — **not** app code
or logs.

The server will push this branch automatically after you finish. Do NOT push to `main`
or checkout `main`. Just prepare the current branch.

## Process

1. **Merge `main` into the current branch** so that conflicts are resolved here
   (never force-push to `main`):

   ```bash
   git fetch origin main
   git merge FETCH_HEAD --no-edit
   ```

   If there are merge conflicts, resolve them, then `git add` the resolved files and
   `git commit --no-edit`.

2. **Delete all files under `apps/` and `logs/`** so the eventual merge to `main`
   does not carry app source code or log artifacts:

   ```bash
   git rm -rf apps/ logs/
   git commit -m "Remove apps/ and logs/ before merging to main"
   ```

   If these directories don't exist or have no tracked files, skip this step.

## What gets merged

- `skills/` — message skills, task skills, script design docs
- `scripts/` (repo-root) — task queue tooling, worker scripts
- `tasks/` — task queue state
- Any other top-level files outside `apps/` and `logs/`

## What does NOT get merged

- `apps/` — all application source code, tests, configs, deployment artifacts
- `logs/` — worker logs and analysis outputs

## Tips

- Always merge FROM `main` first (step 1) to avoid conflicts on `main`.
- The deletion in step 2 is permanent on this branch. The app branch still has
  those files — they are not lost.
- If the user only wants to merge a subset of skills, they should say so
  explicitly. By default this skill merges everything outside `apps/` and `logs/`.
- Never force-push to `main`.
- Do NOT checkout `main` or push to `main`. The server handles pushing this branch.
