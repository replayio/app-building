# @replayio/app-building

Library for managing agentic app-building containers. Start and stop containers locally (Docker) or remotely (Fly.io), communicate with the in-container HTTP server, and track container state via a local registry.

## Install

```bash
npm install @replayio/app-building
```

## Usage

```ts
import {
  loadDotEnv,
  ContainerRegistry,
  type ContainerConfig,
  type RepoOptions,
  startContainer,
  startRemoteContainer,
  stopRemoteContainer,
  httpGet,
  httpPost,
  httpOptsFor,
} from "@replayio/app-building";

// Assemble config once at startup
const envVars = loadDotEnv("/path/to/project");
const config: ContainerConfig = {
  projectRoot: "/path/to/project",
  envVars,
  registry: new ContainerRegistry("/path/to/.container-registry.jsonl"),
  flyToken: envVars.FLY_API_TOKEN,
  flyApp: envVars.FLY_APP_NAME,
};

// Start a remote container
const repo: RepoOptions = { repoUrl: "https://github.com/...", cloneBranch: "main", pushBranch: "main" };
const state = await startRemoteContainer(config, repo);

// Send a prompt and wait for completion
const httpOpts = httpOptsFor(state);
const { id } = await httpPost(`${state.baseUrl}/message`, { prompt: "Build the app" }, httpOpts);

// Check status
const status = await httpGet(`${state.baseUrl}/status`, httpOpts);

// Query the registry
const alive = await config.registry.findAlive();

// Clean up
await stopRemoteContainer(config, state);
```

## Exported API

### Domain objects

| Export | Description |
|---|---|
| `ContainerConfig` | Interface bundling all external state: `projectRoot`, `envVars`, `registry`, optional `flyToken`/`flyApp`/`imageRef`. |
| `RepoOptions` | Per-invocation git settings: `repoUrl`, `cloneBranch`, `pushBranch`. |
| `ContainerRegistry` | Class encapsulating `.container-registry.jsonl` persistence. Methods: `log`, `markStopped`, `clearStopped`, `getRecent`, `find`, `findAlive`. |

### Container lifecycle

| Export | Description |
|---|---|
| `startContainer(config, repo)` | Build the Docker image locally and start a container with `--network host`. Returns `AgentState`. |
| `startRemoteContainer(config, repo)` | Create a Fly.io machine using the GHCR image. Requires `config.flyToken` and `config.flyApp`. Returns `AgentState`. |
| `stopContainer(config, containerName)` | Stop a local Docker container by name. |
| `stopRemoteContainer(config, state)` | Destroy the Fly.io machine for a remote container. Requires `config.flyToken`. |
| `buildImage(config)` | Build the Docker image locally (called automatically by `startContainer`). |
| `spawnTestContainer(config)` | Start an interactive (`-it`) container with the repo mounted at `/repo`. |
| `loadDotEnv(projectRoot)` | Parse a `.env` file and return key-value pairs. |

**Types:** `AgentState`, `ContainerConfig`, `RepoOptions`

### Container registry (`ContainerRegistry` class)

| Method | Description |
|---|---|
| `log(state)` | Append a new entry to the registry. |
| `markStopped(name?)` | Mark a container as stopped. |
| `clearStopped(name)` | Clear the stopped flag (container came back alive). |
| `getRecent(limit?)` | Read the most recent registry entries. |
| `find(name)` | Find a specific container by name. |
| `findAlive()` | Probe recent entries and return those that are alive. Reconciles stopped flags. |

**Types:** `RegistryEntry`

### HTTP client

| Export | Description |
|---|---|
| `httpGet(url, opts?)` | GET with retries and timeout. Returns parsed JSON. |
| `httpPost(url, body?, opts?)` | POST with retries and timeout. Returns parsed JSON. |

**Types:** `HttpOptions`

### Container utilities

| Export | Description |
|---|---|
| `httpOptsFor(state)` | Return `HttpOptions` for a container (adds `fly-force-instance-id` header for remote containers). |
| `probeAlive(entry)` | Check if a container is responding to `/status`. |

### Fly.io machines

| Export | Description |
|---|---|
| `createApp(token, name, org?)` | Create a Fly app and allocate IPs. |
| `createMachine(app, token, image, env, name)` | Create a Fly machine. Returns machine ID. |
| `waitForMachine(app, token, machineId, timeout?)` | Wait for a machine to reach `started` state. |
| `destroyMachine(app, token, machineId)` | Force-destroy a machine. |
| `listMachines(app, token)` | List all machines for an app. |

**Types:** `FlyMachineInfo`

### Image ref

| Export | Description |
|---|---|
| `getImageRef()` | Returns `CONTAINER_IMAGE_REF` env var, or `ghcr.io/replayio/app-building:latest` by default. Used by `startRemoteContainer`. |
