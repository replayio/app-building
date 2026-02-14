# Strategy

During this stage you will deploy the app to production and test it to make sure it works.

## Unpack Subtasks

Unpack the initial deployment task into the following subtasks:

- SupportDeploy: Add deployment support to the app.
- DoDeploy: Deploy the app to production.
- TestDeploy: Test the app as described above.

## Deployment

The app must support `npm run deploy` which creates or reuses an existing netlify site (name doesn't matter) and the Neon database you set up earlier that is backing the supabase calls. This should read NETLIFY_ACCOUNT_SLUG, NETLIFY_AUTH_TOKEN, and NEON_API_KEY from the environment.

Make sure to update all URLs etc to match the deployed resources.

Write information about the deployment to deployment.txt

## Testing

Use playwright to load the app and test it after deploying to make sure it works.
Record the app with the Replay browser, which is already installed via the Replay CLI,
and debug problems using Replay MCP.

Read these skills to learn how to use these:

https://raw.githubusercontent.com/replayio/skills/refs/heads/main/skills/replay-cli/SKILL.md
https://raw.githubusercontent.com/replayio/skills/refs/heads/main/skills/replay-mcp/SKILL.md
