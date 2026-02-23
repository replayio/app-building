# Bug: SidebarNavLinks — Multiple test timeouts

## Step 1: Evidence

Evidence the app is broken: None found. The SettingsPage component renders correctly at Point:SettingsPage:1 (timestamp 25698ms). The DOM contains all expected data-testid attributes. InspectElement confirmed `settings-page` div exists with 1036x28px dimensions. All 6 nav links render as Link components with correct test IDs. Network requests all returned 200. React component tree shows full hierarchy: App > Sidebar > SidebarNavLinks > 6 Link components.

Evidence the test is broken: The Playwright config was using `devices['Desktop Chrome']` instead of `replayDevices['Replay Chromium']`, meaning tests ran without the Replay browser. After fixing this, the Replay browser is slower due to recording overhead, and the 30000ms test timeout was too short. The SettingsPage first rendered at 25698ms — only 4.3 seconds before the 30s test timeout. Multiple parallel tests hitting the dev server simultaneously caused slow page loads. Tests that happened to receive faster responses passed (4 of 10), while those that loaded slower timed out (6 of 10).

## Step 2: Determination

Which is broken: TEST (configuration)

## Step 3: Root Cause

The Playwright config (`playwright.config.ts`) had two issues:
1. It was not using `replayDevices['Replay Chromium']` — instead it used standard `devices['Desktop Chrome']`, so recordings weren't happening properly.
2. The test timeout (30000ms) and webServer timeout (30000ms) were too tight for the Replay browser under parallel test load. The Replay browser has recording overhead that makes it slower than standard Chrome. With `fullyParallel: true` and multiple workers, all tests hit the Vite dev server simultaneously, causing compilation delays. Pages took 25+ seconds to render, leaving insufficient time for test assertions.

Fix: Updated `playwright.config.ts` to use `replayDevices['Replay Chromium']`, increased test timeout to 60000ms, and increased webServer timeout to 60000ms.
