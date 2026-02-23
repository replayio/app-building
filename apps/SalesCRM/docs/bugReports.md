# Bug Reports

## Open

(none)

## Unreviewed

### SidebarNavLinks — Multiple test timeouts

- **Bug file**: [docs/bugs/SidebarNavLinks.md](bugs/SidebarNavLinks.md)
- **Git revision before fix**: 4c4337a
- **Git revision after fix**: 8847111
- **Summary**: Playwright config used `devices['Desktop Chrome']` instead of `replayDevices['Replay Chromium']`, and timeouts were too tight for Replay browser under parallel test load.
- **Determination**: TEST (configuration)

## Finished

### SignInFormSubmits — Sign In form submits with email and password

- **Bug file**: [docs/bugs/SignInFormSubmits.md](bugs/SignInFormSubmits.md)
- **Git revision before fix**: 4c4337a
- **Git revision after fix**: 8847111
- **Summary**: Test `beforeEach` had unnecessary localStorage cleanup, assertion timeouts were too tight for Replay browser + Neon DB, and multi-step test exceeded 60s timeout. Additionally, `SidebarUserArea.tsx` didn't reset `isSignUp` state when clicking Sign In.
- **Determination**: TEST + APP
- **Problem stage**: `writeTests.md` — The test entries correctly specify that clicking "Sign In" should show the form in Sign In mode, but the tests had timing/configuration issues that prevented reliable coverage. The app bug (isSignUp not reset) should have been caught earlier by properly configured tests.
- **Directives updated**: Added three new directives to `writeTests.md`: (1) avoid unnecessary state cleanup in `beforeEach` when Playwright provides fresh contexts, (2) use generous assertion timeouts for recording/cold-DB environments, (3) use `test.slow()` for multi-step chained flows.
