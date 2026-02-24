# Bug: AccountCard strict mode violations (6 tests)

## Step 1: Evidence

Evidence the app is broken: None found

Evidence the test is broken: The test locator `[data-testid^='account-card-']` matches both the card container element (`data-testid="account-card-{uuid}"`) and its child `data-testid="account-card-name"`. Both elements contain the card name text, so `.filter({ hasText: ... })` returns 2 elements, causing Playwright strict mode violations. The error messages consistently show "resolved to 2 elements" — the parent card div and the account-card-name child div.

## Step 2: Determination

Which is broken: TEST

## Step 3: Root Cause

In `tests/accounts-page.spec.ts`, multiple tests use the locator pattern:
```js
assetsContent.locator("[data-testid^='account-card-']").filter({ hasText: "..." })
```
This CSS attribute selector `[data-testid^='account-card-']` matches ALL elements whose `data-testid` starts with `account-card-`. Inside each `AccountCard` component, the name element has `data-testid="account-card-name"` which also starts with `account-card-`. Both the parent card (`account-card-{uuid}`) and the name child (`account-card-name`) contain the account name text, so the filter returns 2 elements. The fix is to use the `.account-card` CSS class selector instead, which only matches the card container elements (this pattern is already used successfully in passing tests at lines 236 and 254).
