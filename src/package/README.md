# app-building package

Reusable container management library for the app-building agent. External websites can import this package to start/stop containers and communicate with the in-container HTTP server.

## Usage

```ts
import {
  startContainer,
  startRemoteContainer,
  stopRemoteContainer,
  httpGet,
  httpPost,
} from "<path-to>/src/package";
```

## Exported API

### Container lifecycle

| Export | Description |
|---|---|
| `startContainer(opts)` | Build the Docker image locally and start a container with `--network host`. Returns `AgentState`. |
| `startRemoteContainer(opts)` | Create a Fly.io machine using the GHCR image. Requires `FLY_API_TOKEN` in `.env` or environment. Returns `AgentState`. |
| `stopContainer(name)` | Stop a local Docker container by name. |
| `stopRemoteContainer(state)` | Destroy the Fly.io machine for a remote container. |
| `buildImage()` | Build the Docker image locally (called automatically by `startContainer`). |
| `spawnTestContainer()` | Start an interactive (`-it`) container with the repo mounted at `/repo`. |
| `loadDotEnv(projectRoot)` | Parse a `.env` file and return key-value pairs. |

**Types:** `AgentState`, `StartContainerOptions`

### HTTP client

| Export | Description |
|---|---|
| `httpGet(url, opts?)` | GET with retries and timeout. Returns parsed JSON. |
| `httpPost(url, body?, opts?)` | POST with retries and timeout. Returns parsed JSON. |

**Types:** `HttpOptions`

### Container registry

Tracks started/stopped containers in a `.container-registry.jsonl` file at the project root.

| Export | Description |
|---|---|
| `logContainer(state)` | Append a new entry to the registry. |
| `markStopped(name?)` | Mark a container as stopped. |
| `clearStopped(name)` | Clear the stopped flag (container came back alive). |
| `getRecentContainers(limit?)` | Read the most recent registry entries. |
| `findContainer(name)` | Find a specific container by name. |

**Types:** `RegistryEntry`

### Container utilities

| Export | Description |
|---|---|
| `httpOptsFor(state)` | Return `HttpOptions` for a container (adds `fly-force-instance-id` header for remote containers). |
| `probeAlive(entry)` | Check if a container is responding to `/status`. |
| `findAliveContainers()` | Scan recent registry entries and return those that are alive. |

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
