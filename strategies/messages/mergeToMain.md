# Strategy

You are merging strategy/script changes from the current app branch back to `main`.
The goal is to land only strategies, scripts, and job-system changes — **not** app code
or logs.

## Process

1. **Merge `main` into the current branch** so that conflicts are resolved here
   (never force-push to `main`):

   ```bash
   git fetch origin main
   git merge origin/main --no-edit
   ```

   If there are merge conflicts, resolve them, then `git add` the resolved files and
   `git commit --no-edit`.

2. **Delete all files under `apps/` and `logs/`** so the merge to `main` does not
   carry app source code or log artifacts:

   ```bash
   git rm -rf apps/ logs/
   git commit -m "Remove apps/ and logs/ before merging to main"
   ```

   This is safe because the app branch retains those files in its own history.

3. **Merge the current branch into `main`**:

   ```bash
   git checkout main
   git merge <current-branch> --no-edit
   git checkout <current-branch>
   ```

   Replace `<current-branch>` with the branch name (e.g. `sales-crm`). Always
   check out back to the app branch afterward so subsequent work continues there.

4. **Push `main`**:

   ```bash
   git push origin main
   ```

5. **Restore the app branch to its pre-deletion state** so `apps/` and `logs/`
   are back for continued development:

   ```bash
   git revert HEAD~2 --no-edit
   ```

   This reverts the "Remove apps/ and logs/" commit on the app branch, bringing
   those directories back. If the revert doesn't apply cleanly (e.g. because the
   merge commit is in the way), use:

   ```bash
   git checkout HEAD~3 -- apps/ logs/
   git commit -m "Restore apps/ and logs/ after merge to main"
   ```

## What gets merged

- `strategies/` — message strategies, job strategies, script design docs
- `scripts/` (repo-root) — job queue tooling, worker scripts
- `jobs/` — job queue state
- Any other top-level files outside `apps/` and `logs/`

## What does NOT get merged

- `apps/` — all application source code, tests, configs, deployment artifacts
- `logs/` — worker logs and analysis outputs

## Tips

- Always merge FROM `main` first (step 1) to avoid conflicts on `main`.
- The deletion in step 2 is committed on the app branch temporarily. Step 5
  restores it immediately after the merge lands.
- If the user only wants to merge a subset of strategies, they should say so
  explicitly. By default this strategy merges everything outside `apps/` and `logs/`.
- Never force-push to `main`.
