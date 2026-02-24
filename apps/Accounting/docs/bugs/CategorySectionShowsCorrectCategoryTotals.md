# Bug: CategorySection shows correct category totals

## Step 1: Evidence

Evidence the app is broken: The API at `/.netlify/functions/accounts` returns numeric fields (balance, budget_amount, budget_actual, etc.) as strings (e.g., `"12500.00"` instead of `12500.00`). This is because the Neon database driver returns PostgreSQL `numeric` column values as strings. When `AccountsPage.tsx` computes category totals with `items.reduce((sum, a) => sum + a.balance, 0)`, JavaScript performs string concatenation instead of numeric addition (`0 + "12500.00"` = `"012500.00"`), producing a garbled string that `formatCurrency()` renders as `$NaN`.

Evidence the test is broken: None found

## Step 2: Determination

Which is broken: APP

## Step 3: Root Cause

The `netlify/functions/accounts.ts` handler (line 18) returns raw database rows without parsing numeric string fields to JavaScript numbers. The Neon `@neondatabase/serverless` driver returns PostgreSQL `numeric`/`decimal` columns as strings to preserve precision. The `AccountsPage.tsx` (line 29) `items.reduce((sum: number, a: Account) => sum + a.balance, 0)` performs string concatenation because `a.balance` is a string. The fix is to parse numeric fields to actual numbers in the API response before returning to the frontend.
