# Bug: CAL-GRID-4: Event cards display product name, recipe, quantity, and status

## Step 1: Evidence

Evidence the app is broken: The CalendarGrid `formatEventLabel` function at `src/components/CalendarGrid.tsx:63` formats the quantity as `${run.planned_quantity}` without parsing, resulting in "500.00 kg" instead of "500 kg". The database returns NUMERIC(15,2) values as strings with two decimal places.

Evidence the test is broken: None found. The test regex `/.+ \(.+\) \| \d+ \w+ \| Status: .+/` correctly expects integer quantities per the test specification format "[Quantity] Units".

## Step 2: Determination

Which is broken: APP

## Step 3: Root Cause

The `formatEventLabel` function in `src/components/CalendarGrid.tsx:63` uses `${run.planned_quantity}` directly in the template string. Since `planned_quantity` is NUMERIC(15,2) in the database, it arrives as "500.00", making the event label "Granola (Organic Granola Mix) | 500.00 kg | Status: Completed". The regex `\d+ \w+` in the test fails because `\d+` cannot match "500.00" (the dot is not a digit).

The fix is to wrap with `parseFloat(String(run.planned_quantity))` to strip trailing zeros, same as the RunHeader fix.
