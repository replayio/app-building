# Bug: Reports Link Goes to 404

## Problem
The "Reports" link in the sidebar navigates to `/reports`, which has no corresponding route and renders the NotFoundPage.

## Root Cause
In `src/components/layout/Sidebar.tsx`, the navItems include `{ to: '/reports', label: 'Reports' }`, but `App.tsx` has no route for `/reports`. There is no ReportsPage component.

## Fix
Remove the "Reports" entry from the sidebar navigation since there is no reports page in the app. The bug report says "all links must go to valid locations."
