# Bug: Dashboard/Clients Duplicate Highlight

## Problem
On the clients page, both "Dashboard" and "Clients" sidebar items are highlighted because they both link to `/clients`.

## Root Cause
In `src/components/layout/Sidebar.tsx`, the `navItems` array has both `{ to: '/clients', label: 'Dashboard' }` and `{ to: '/clients', label: 'Clients' }`. Since both use `NavLink` with the same `to` path, React Router marks both as active.

## Fix
Remove the "Dashboard" entry from the sidebar navigation. The bug report says "no point having duplicates, just remove the dashboard here."
