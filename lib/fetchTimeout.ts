/**
 * fetch() with a hard timeout. Several free-tier providers (or networks that
 * block them) don't fail fast — they just hang until the platform's own
 * function timeout kills the connection, which then surfaces to the client
 * as a bare "couldn't reach the server" with none of our fix instructions
 * attached. Aborting after `timeoutMs` turns that into a normal, classifiable
 * error instead.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function isAbortError(e: any): boolean {
  return e?.name === "AbortError" || String(e?.message ?? e).toLowerCase().includes("abort");
}
