# Resolve Merge Conflicts

After an automatic merge resolved conflicts using `--theirs` (accepting the remote version),
the codebase may have lost local changes. Your job is to review and fix any issues.

## Steps

1. Search the entire repo for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) and resolve
   any that remain.
2. Review recent git history (`git log --oneline -10` and `git diff HEAD~2`) to understand
   what local changes may have been overwritten by the auto-resolution.
3. Re-apply any lost local changes that are still relevant, using your judgment.
4. Run `npm run check` in each affected app directory to verify the codebase is healthy.
5. Fix any typecheck or lint errors introduced by the merge.

When all conflicts are resolved and checks pass, output `<DONE>`.
