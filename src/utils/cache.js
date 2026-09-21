// Cache em memória com TTL + dedupe de requisições em voo.
// Evita requisições duplicadas e respeita rate limit do AniList/Anivexa.
const store = new Map();
const inflight = new Map();

export function cacheGet(key) {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    store.delete(key);
    return null;
  }
  return e.value;
}

export function cacheSet(key, value, ttlMs = 5 * 60 * 1000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  // Limite simples anti-vazamento
  if (store.size > 400) {
    const first = store.keys().next().value;
    store.delete(first);
  }
}

export async function deduped(key, fn) {
  if (inflight.has(key)) return inflight.get(key);
  const p = Promise.resolve()
    .then(fn)
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

export async function cached(key, fn, ttlMs) {
  const hit = cacheGet(key);
  if (hit != null) return hit;
  const value = await deduped(key, fn);
  cacheSet(key, value, ttlMs);
  return value;
}
