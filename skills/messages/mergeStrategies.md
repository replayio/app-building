# Skill

You are merging code and skill changes from an app branch back to `main` without
merging the apps themselves. This lets improvements to `src/`, `skills/`, and
root config files flow back to `main` so that new app branches benefit from them.

## Prerequisites

- You must be on a `*-merge` branch (e.g. `<app>-merge`).
  If not, create one from the current app branch: `git checkout -b <app>-merge`.
- The app branch must have diverged from `origin/main`. All infrastructure changes
  since that divergence will be extracted.

## Procedure

### 1. Identify the merge base

```bash
MERGE_BASE=$(git merge-base origin/main HEAD)
```

### 2. Determine which paths to include

Only paths that belong to the shared infrastructure should be merged.
Include these paths:

```
src/
skills/
AGENTS.md
CLAUDE.md
Dockerfile
.dockerignore
.gitignore
.rgignore
.env.example
package.json
package-lock.json
tsconfig.json
README.md
```

Exclude these paths (they are app-specific or ephemeral):

```
apps/
logs/
docs/
*.txt (at app level, e.g. deployment.txt)
```

### 3. Create a clean merge branch from main

```bash
git checkout -b merge-to-main origin/main
```

### 4. Apply infrastructure changes

For each included path, check out the version from the `*-merge` branch:

```bash
git checkout <merge-branch> -- src/ skills/ AGENTS.md CLAUDE.md \
  Dockerfile .dockerignore .gitignore .rgignore .env.example \
  package.json package-lock.json tsconfig.json README.md
```

If a file was deleted on the app branch (e.g. an old skill file that was
reorganized), remove it on this branch too. Use the diff to identify deletions:

```bash
git diff --name-status $MERGE_BASE HEAD -- <included-paths>
```

Files with status `D` should be `git rm`'d on `merge-to-main`.

### 5. Verify no app content leaked

Run a quick check to make sure no app-specific content is staged:

```bash
git diff --cached --name-only | grep -E '^(apps/|logs/|docs/)' && echo "ERROR: app content leaked" || echo "Clean"
```

If any app paths appear, unstage them with `git reset HEAD -- apps/ logs/ docs/`.

### 6. Commit and verify

```bash
git commit -m "Merge infrastructure changes from <app-branch>"
```

### 7. Test the merge

Verify the branch merges cleanly into main:

```bash
git checkout main
git merge --no-commit --no-ff merge-to-main
git diff --stat
git merge --abort   # don't actually merge yet
git checkout merge-to-main
```

If there are conflicts, resolve them on the `merge-to-main` branch, favoring the
app branch's version (since it represents the latest evolution of the infrastructure).

### 8. Final state

The `merge-to-main` branch is now ready. It contains only shared infrastructure
changes and can be merged to `main` via PR or direct merge. The apps, logs, and
docs directories are untouched on `main`.

## Notes

- If `package-lock.json` has conflicts, regenerate it: delete it, run `npm install`,
  and commit the result.
- Skill file reorganizations (moves/renames) are handled naturally since we check
  out the full `skills/` tree from the app branch and delete removed files.
- After the merge to main is complete, new app branches created from main will
  automatically inherit the updated infrastructure.
