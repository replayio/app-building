# Fix: DROP TABLE IF EXISTS directive violation in initSchema

## Violation

`scripts/schema.ts` contained `DROP TABLE IF EXISTS ... CASCADE` statements for all 14 tables
at the top of `initSchema`, executed before the `CREATE TABLE IF NOT EXISTS` statements.

## Directive

From `writeApp.md`: "Must use `CREATE TABLE IF NOT EXISTS` for all tables, making it idempotent
and safe to re-run."

## Impact

The DROP statements made `initSchema` destructive rather than idempotent:
- **Deployment**: Running `initSchema` on production would destroy all existing data.
- **Testing**: Not harmful since tests use ephemeral Neon branches, but unnecessary.

## Fix

Removed all 14 `DROP TABLE IF EXISTS` statements (lines 7-20) from `scripts/schema.ts`.
The existing `CREATE TABLE IF NOT EXISTS` statements already provide idempotent behavior.
