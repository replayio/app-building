const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 2000;

export interface HttpOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

async function fetchWithRetry(url: string, init: RequestInit, timeout: number): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeout) });
      if (!res.ok) throw new Error(`${init.method ?? "GET"} ${url}: ${res.status} ${res.statusText}`);
      return res;
    } catch (err) {
      if (attempt >= MAX_RETRIES) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}

export async function httpGet(url: string, opts: HttpOptions = {}): Promise<any> {
  const res = await fetchWithRetry(url, { headers: opts.headers }, opts.timeout ?? DEFAULT_TIMEOUT);
  return res.json();
}

export async function httpPost(url: string, body?: unknown, opts: HttpOptions = {}): Promise<any> {
  const res = await fetchWithRetry(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...opts.headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    opts.timeout ?? DEFAULT_TIMEOUT,
  );
  return res.json();
}
