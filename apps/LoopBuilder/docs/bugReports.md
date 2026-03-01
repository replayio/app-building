# Bug Reports

## Open

(none)

## Fixed

(none)

## Unreviewed

(none)

## Finished

3/1/2026: Webhook docs are not user-friendly — they need a working copy button for curl commands with YOUR_SITE replaced by the actual site URL. See [analysis](bugs/webhook-docs-copy-button.md).
- Before: 9928096
- After: (current)
- Problem stage: testSpec.md — the test specification did not specify that curl command examples should use the actual deployed site URL instead of a placeholder like YOUR_SITE, and had no entries requiring copy-to-clipboard functionality for curl commands or endpoint URLs.
- Directive update: Updated testSpec.md webhook help directive to require that example curl commands use the actual deployed site URL (not placeholders) and that copy-to-clipboard buttons are provided for curl commands and endpoint URLs.

3/1/2026: The endpoint to spawn a container does not work — after redeploying the app, testing and curling the webhook fails to create a container with the supplied or default prompt. See [analysis](bugs/container-spawn-endpoint.md).
- Before: 1fe1ad9
- After: (current)
- Problem stage: testSpec.md — the test specification had no entries verifying that calling the spawn-container endpoint actually results in a container being created. Only the webhook help UI documentation was tested.
- Directive update: Added directive to testSpec.md requiring test entries that verify backend API endpoints actually function correctly, not just that their documentation UI is accurate.
