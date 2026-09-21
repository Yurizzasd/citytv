// Cliente GraphQL do AniList (catálogo: busca, trending, detalhes).
// A Anivexa NÃO possui catálogo/busca — ela só resolve episódios/streams
// a partir de um AniList ID. Por isso o catálogo vem do AniList (público, sem chave).
import { apiConfig } from '../../config/site.js';
import { cached } from '../../utils/cache.js';

const ANILIST_TTL = 10 * 60 * 1000;

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN' } = {}) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function anilistQuery(query, variables = {}, { cacheKey = '', ttlMs = ANILIST_TTL } = {}) {
  const run = async () => {
    let res;
    try {
      res = await fetchWithTimeout(
        apiConfig.anilistUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ query, variables }),
        },
        apiConfig.timeoutMs,
      );
    } catch (e) {
      throw new ApiError('Falha de conexão com o catálogo. Verifique sua internet.', { code: 'NETWORK' });
    }
    if (res.status === 429) throw new ApiError('Muitas requisições. Aguarde alguns segundos.', { status: 429, code: 'RATE_LIMIT' });
    if (!res.ok) throw new ApiError(`Catálogo indisponível (HTTP ${res.status}).`, { status: res.status, code: 'HTTP' });
    const json = await res.json().catch(() => null);
    if (json?.errors?.length) {
      const msg = json.errors[0]?.message || 'Erro no catálogo.';
      throw new ApiError(msg, { code: 'GRAPHQL' });
    }
    return json?.data;
  };

  if (!cacheKey) return run();
  return cached(`al:${cacheKey}:${JSON.stringify(variables)}`, run, ttlMs);
}
