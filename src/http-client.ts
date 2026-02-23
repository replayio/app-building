const DEFAULT_TIMEOUT = 30000;

export interface HttpOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

export async function httpGet(url: string, opts: HttpOptions = {}): Promise<any> {
  const res = await fetch(url, {
    headers: opts.headers,
    signal: AbortSignal.timeout(opts.timeout ?? DEFAULT_TIMEOUT),
  });
  if (!res.ok) throw new Error(`GET ${url}: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function httpPost(url: string, body?: unknown, opts: HttpOptions = {}): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...opts.headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(opts.timeout ?? DEFAULT_TIMEOUT),
  });
  if (!res.ok) throw new Error(`POST ${url}: ${res.status} ${res.statusText}`);
  return res.json();
}
