const DEFAULT_TIMEOUT = 30000;

export async function httpGet(url: string, timeout = DEFAULT_TIMEOUT): Promise<any> {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`GET ${url}: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function httpPost(url: string, body?: unknown, timeout = DEFAULT_TIMEOUT): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`POST ${url}: ${res.status} ${res.statusText}`);
  return res.json();
}
