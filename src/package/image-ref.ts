const DEFAULT_IMAGE_REF = "ghcr.io/replayio/app-building:latest";

export function getImageRef(): string {
  return process.env.CONTAINER_IMAGE_REF ?? DEFAULT_IMAGE_REF;
}
