# Webhook Docs Copy Button Bug

## Bug Report
Webhook docs are not user-friendly — they need a working copy button for curl commands with YOUR_SITE replaced by the actual site URL.

## Analysis

The `WebhookHelpButton` component (`src/components/WebhookHelpButton.tsx`) displays webhook endpoint documentation in a modal. Two usability issues exist:

1. **No copy buttons**: The curl command examples are displayed in `<code>` blocks with no way to copy them. Users must manually select and copy the text.

2. **Placeholder URLs not replaced**: The curl examples use the literal string `YOUR_SITE` instead of substituting the actual deployed site URL (`window.location.origin`). Users must manually replace this placeholder before using the commands.

## Root Cause

The component was built as a static documentation display without interactive copy functionality. The curl command strings in the `ENDPOINTS` array are static template literals with hardcoded `YOUR_SITE` placeholders instead of dynamically inserting the current origin.

## Fix

1. Replace `YOUR_SITE` in curl commands with `window.location.origin` at render time.
2. Add a copy button to each curl command block that copies the resolved command to the clipboard.
3. Add copy buttons to other info fields worth copying (endpoint paths).
