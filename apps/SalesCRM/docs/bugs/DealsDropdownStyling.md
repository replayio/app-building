# Bug: Deals Page Dropdown Styling

## Problem
On the deals page, the filter dropdowns look good in their closed/resting state but when clicked, they revert to the browser's default native select styling, which looks inconsistent with the app's design system.

## Root Cause
The `DealsFilterControls` component uses native HTML `<select>` elements styled with `appearance-none` and Tailwind CSS classes. While `appearance-none` hides the native arrow and allows custom styling of the closed state, clicking the element renders the browser's native dropdown menu which cannot be styled with CSS.

## Affected Component
- `src/components/deals/DealsFilterControls.tsx` — `FilterSelect` internal component wraps native `<select>` elements

## Fix
Replace the native `<select>` elements in `FilterSelect` with a custom dropdown component that renders a styled menu on click, using React state for open/close and styled option list. This ensures both the trigger and the dropdown menu follow the app's design system.
