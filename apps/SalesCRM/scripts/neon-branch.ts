/**
 * Neon branch management utilities for test isolation.
 *
 * Creates and deletes ephemeral Neon database branches for parallel test workers.
 * Each branch is a copy-on-write fork of the main branch — fast to create, free to delete.
 *
 * Requires NEON_API_KEY and NEON_PROJECT_ID (env var or in .env file).
 */

import { readFileSync } from 'fs'

const NEON_API_BASE = 'https://console.neon.tech/api/v2'

interface NeonBranch {
  id: string
  name: string
}

interface NeonEndpoint {
  id: string
  host: string
}

interface NeonBranchResponse {
  branch: NeonBranch
  endpoints: NeonEndpoint[]
  connection_uris: Array<{ connection_uri: string }>
}

function getNeonConfig() {
  const apiKey = process.env.NEON_API_KEY
  let projectId = process.env.NEON_PROJECT_ID

  if (!apiKey) throw new Error('NEON_API_KEY environment variable is required for branch management')

  // If NEON_PROJECT_ID isn't in the environment, try reading from .env
  if (!projectId) {
    try {
      const envContent = readFileSync('.env', 'utf-8')
      const match = envContent.match(/^NEON_PROJECT_ID=(.+)$/m)
      if (match) projectId = match[1].trim()
    } catch {
      // .env file not found or not readable
    }
  }

  if (!projectId) throw new Error('NEON_PROJECT_ID environment variable is required for branch management. Run "npm run deploy" first to create the project and write it to .env.')
  return { apiKey, projectId }
}

function neonHeaders(apiKey: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Create a new Neon branch for a test worker.
 * Returns the connection URI for the new branch.
 */
export async function createTestBranch(branchName: string): Promise<{ branchId: string; connectionUri: string }> {
  const { apiKey, projectId } = getNeonConfig()

  const res = await fetch(`${NEON_API_BASE}/projects/${projectId}/branches`, {
    method: 'POST',
    headers: neonHeaders(apiKey),
    body: JSON.stringify({
      branch: {
        name: branchName,
      },
      endpoints: [
        {
          type: 'read_write',
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create Neon branch "${branchName}": ${res.status} ${err}`)
  }

  const data = await res.json() as NeonBranchResponse
  const connectionUri = data.connection_uris[0]?.connection_uri

  if (!connectionUri) {
    throw new Error(`Neon branch "${branchName}" created but no connection URI returned`)
  }

  return {
    branchId: data.branch.id,
    connectionUri,
  }
}

/**
 * Delete a Neon branch by ID.
 */
export async function deleteBranch(branchId: string): Promise<void> {
  const { apiKey, projectId } = getNeonConfig()

  const res = await fetch(`${NEON_API_BASE}/projects/${projectId}/branches/${branchId}`, {
    method: 'DELETE',
    headers: neonHeaders(apiKey),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`Failed to delete Neon branch ${branchId}: ${res.status} ${err}`)
  }
}

/**
 * List all branches in the project.
 */
export async function listBranches(): Promise<NeonBranch[]> {
  const { apiKey, projectId } = getNeonConfig()

  const res = await fetch(`${NEON_API_BASE}/projects/${projectId}/branches`, {
    headers: neonHeaders(apiKey),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to list Neon branches: ${res.status} ${err}`)
  }

  const data = await res.json() as { branches: NeonBranch[] }
  return data.branches
}

/**
 * Clean up stale test branches from interrupted test runs.
 * Deletes any branches matching the test branch naming prefix.
 */
export async function cleanupStaleBranches(prefix: string): Promise<void> {
  const branches = await listBranches()
  const staleBranches = branches.filter(b => b.name.startsWith(prefix))

  if (staleBranches.length > 0) {
    console.log(`Cleaning up ${staleBranches.length} stale test branch(es)...`)
    await Promise.all(staleBranches.map(b => deleteBranch(b.id)))
  }
}
