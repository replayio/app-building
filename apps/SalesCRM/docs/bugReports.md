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

### SignInFormSubmits — Sign In form submits with email and password

- **Bug file**: [docs/bugs/SignInFormSubmits.md](bugs/SignInFormSubmits.md)
- **Git revision before fix**: 4c4337a
- **Git revision after fix**: 8847111
- **Summary**: Test `beforeEach` had unnecessary localStorage cleanup, assertion timeouts were too tight for Replay browser + Neon DB, and multi-step test exceeded 60s timeout. Additionally, `SidebarUserArea.tsx` didn't reset `isSignUp` state when clicking Sign In.
- **Determination**: TEST + APP

## Finished

(none)
