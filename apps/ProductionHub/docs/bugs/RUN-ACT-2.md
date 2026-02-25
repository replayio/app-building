# Bug: RUN-ACT-2: Adjust Quantities button opens an edit form

## Step 1: Evidence

Evidence the app is broken: The app displays "500.00 Units" instead of "500 Units". The database stores `planned_quantity` as NUMERIC(15,2), so the API returns the value as "500.00". The RunHeader component renders `{run.planned_quantity} {run.unit}` without formatting, resulting in "500.00 Units" instead of "500 Units".

Evidence the test is broken: None found. The test correctly expects "500 Units" per the test specification.

## Step 2: Determination

Which is broken: APP

## Step 3: Root Cause

The `RunHeader` component at `src/components/RunHeader.tsx:117` renders `{run.planned_quantity} {run.unit}` directly. Since `planned_quantity` is a NUMERIC(15,2) column in PostgreSQL, the Neon driver returns it as "500.00" (a string with two decimal places). The component does not parse or format this value, resulting in "500.00 Units" instead of "500 Units".

The fix is to wrap the value with `parseFloat(String(run.planned_quantity))` to strip trailing zeros.
