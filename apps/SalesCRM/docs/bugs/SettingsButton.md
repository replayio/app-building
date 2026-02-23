# Bug: Settings Button Does Nothing

## Problem
The "Settings" button in the sidebar lower left navigates to `/settings`, which has no corresponding route and renders the NotFoundPage.

## Root Cause
In `src/components/layout/Sidebar.tsx`, the Settings NavLink points to `/settings`, but `App.tsx` has no route for `/settings`. There is no SettingsPage component.

## Fix
Remove the Settings link from the sidebar since there is no settings page in the app. The bug report says "all enabled buttons must do something."
