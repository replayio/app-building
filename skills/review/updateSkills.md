# Skill

Apply report recommendations to update skill files.

## Subtask Format

`UpdateSkills: <report-name>`

## Procedure

1. Read the report at `reports/<report-name>.md`.

2. Find the Recommendations section. It will list specific files to update and what
   changes to make.

3. For each recommendation:
   a. Read the target file.
   b. Apply the recommended change. Be conservative — only change what the report
      specifically recommends. Do not rewrite sections that are working well.
   c. Preserve the existing structure and style of each file.

4. If a recommendation targets a file that does not exist (e.g. a new debugging guide),
   create it following the patterns of existing files in that directory.

5. If a recommendation is unclear or contradicts existing content, skip it and note
   why in a brief comment at the end of the report file.

6. After applying all recommendations, run `npm run check` from any app directory
   to verify no TypeScript or lint errors were introduced (if any .ts files were changed).
