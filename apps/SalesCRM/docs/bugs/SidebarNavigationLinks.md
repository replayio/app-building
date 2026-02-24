# Bug: Sidebar navigation links route to correct pages

## Step 1: Evidence

Evidence the app is broken: The PlaceholderPage component in App.tsx does not include
the Sidebar. Only ClientsListPage has a sidebar. This means the sidebar navigation is
not available on Dashboard, Deals, Tasks, Reports, or Settings pages, breaking the expected
navigation flow. The test works around this by calling `page.goto('/clients')` to navigate
back, but the full page reload through Netlify dev fails to re-mount React (no JS module
requests after the second navigation, empty #root).

Evidence the test is broken: None found - the test correctly exercises the navigation flow
described in tests.md.

## Step 2: Determination

Which is broken: APP

## Step 3: Root Cause

In `src/App.tsx`, each route renders its own page component. `ClientsListPage` includes
`<Sidebar />` in its JSX, but all other pages use `PlaceholderPage` which only renders a
centered heading with no sidebar. The test spec says "When the user clicks 'Deals' in the
sidebar" after being on Dashboard, implying the sidebar should be visible on all pages.

Fix: Create a layout component in App.tsx that wraps all pages (except login) with the
Sidebar, so the sidebar is always present for navigation between pages.
