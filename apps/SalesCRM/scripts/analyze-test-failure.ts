/**
 * analyze-test-failure script: Launches a dedicated Claude instance with Replay MCP
 * to analyze a recording and explain why a test failed.
 *
 * Usage: npm run analyze-test-failure <recordingId>
 *
 * The recording must already be uploaded to Replay. The script:
 * 1. Fetches the Replay MCP SKILL.md instructions
 * 2. Writes a temp MCP config pointing at the Replay MCP server
 * 3. Launches claude in print mode with SKILL.md as the system prompt
 * 4. Prints the analysis to stdout
 */

import { execFileSync, execSync } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const APP_DIR = resolve(__dirname, '..')

const REPLAY_MCP_URL = 'https://dispatch.[REDACTED].io/nut/mcp'
const SKILL_URL =
  'https://raw.githubusercontent.com/[REDACTED]io/skills/refs/heads/main/skills/[REDACTED]-mcp/SKILL.md'

function fetchSkillMd(): string {
  const result = execSync(`curl -sfL ${SKILL_URL}`, {
    encoding: 'utf-8',
    timeout: 30_000,
  })
  if (!result.trim()) {
    throw new Error('Fetched SKILL.md was empty')
  }
  return result
}

function main() {
  const recordingId = process.argv[2]
  if (!recordingId) {
    console.error('Usage: npm run analyze-test-failure <recordingId>')
    console.error('Example: npm run analyze-test-failure abc123-def456')
    process.exit(1)
  }

  const apiKey = process.env.RECORD_REPLAY_API_KEY
  if (!apiKey) {
    console.error('RECORD_REPLAY_API_KEY not set. Cannot connect to Replay MCP.')
    process.exit(1)
  }

  // Fetch the SKILL.md instructions to embed in the system prompt
  console.log('Fetching Replay MCP skill instructions...')
  let skillMd: string
  try {
    skillMd = fetchSkillMd()
  } catch (err) {
    console.error('Failed to fetch SKILL.md:', err)
    process.exit(1)
  }

  // Write MCP config to a temp file
  const mcpConfigPath = resolve(tmpdir(), `[REDACTED]-mcp-config-${Date.now()}.json`)
  writeFileSync(
    mcpConfigPath,
    JSON.stringify(
      {
        mcpServers: {
          [REDACTED]: {
            type: 'http',
            url: REPLAY_MCP_URL,
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          },
        },
      },
      null,
      2,
    ),
  )

  // Build system prompt with the SKILL.md embedded
  const systemPrompt = [
    'You are a test failure analyst. You have access to Replay MCP tools to inspect browser recordings.',
    'Follow the instructions below precisely when investigating recordings.',
    '',
    '--- BEGIN REPLAY MCP SKILL INSTRUCTIONS ---',
    skillMd,
    '--- END REPLAY MCP SKILL INSTRUCTIONS ---',
  ].join('\n')

  // Build user prompt
  const userPrompt = [
    `Analyze recording ${recordingId} and explain why the test failed.`,
    '',
    'Follow the investigation methodology from the skill instructions:',
    '1. Frame your task: "Why did this test fail?"',
    '2. Use exploratory tools (UncaughtException, ReactException, ConsoleMessages, NetworkRequest, PlaywrightSteps) to identify errors and anomalies.',
    '3. Use explanatory tools (DescribePoint, GetStack, ControlDependency, Logpoint, Evaluate) to understand root causes.',
    '4. Form a hypothesis backed by evidence from the recording.',
    '5. Explain the failure with specific references to code, errors, and events in the recording.',
    '',
    'Be thorough but concise. Include specific error messages, line numbers, and network request details where relevant.',
  ].join('\n')

  console.log(`Analyzing recording: ${recordingId}`)
  console.log(`Connecting to Replay MCP at ${REPLAY_MCP_URL}...`)
  console.log('')

  // Build env without CLAUDECODE so nested claude can launch cleanly
  const env = { ...process.env }
  delete env.CLAUDECODE

  try {
    execFileSync(
      'claude',
      [
        '--print',
        '--mcp-config',
        mcpConfigPath,
        '--strict-mcp-config',
        '--append-system-prompt',
        systemPrompt,
        '--allowedTools',
        'mcp__[REDACTED]__*',
        '--dangerously-skip-permissions',
        '--model',
        'sonnet',
        userPrompt,
      ],
      {
        stdio: 'inherit',
        cwd: APP_DIR,
        env,
        timeout: 600_000, // 10 minutes
      },
    )
  } catch (err: unknown) {
    const exitErr = err as { status?: number }
    if (exitErr.status) {
      console.error(`\nClaude exited with code ${exitErr.status}`)
      process.exit(exitErr.status)
    }
    throw err
  } finally {
    try {
      unlinkSync(mcpConfigPath)
    } catch {
      /* ignore */
    }
  }
}

main()
