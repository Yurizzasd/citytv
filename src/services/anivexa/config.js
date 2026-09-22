// Base + fetch helper da Anivexa — ÚNICO lugar com URLs da Anivexa no frontend.
// Endpoints oficiais (v2.2.1): /map/:id, /episodes/:id,
// /episodes/:provider/.../:id, /watch/:provider/:id/sub|dub/:provider-:ep
import { anivexaBaseUrl, apiConfig } from '../../config/site.js';
import { cached, deduped } from '../../utils/cache.js';

export class AnivexaError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN' } = {}) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function anivexaFetch(path, { ttlMs = 0, cacheKey = '', timeoutMs = apiConfig.timeoutMs } = {}) {
  const url = `${anivexaBaseUrl()}${path}`;
  const run = async () => {
    let res;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      res = await fetch(url, { headers: { Accept: 'application/json' }, signal: ctrl.signal }).finally(() =>
        clearTimeout(t),
      );
    } catch {
      throw new AnivexaError('Servidor de episódios indisponível. Tente outro servidor.', { code: 'NETWORK' });
    }
    if (res.status === 404) throw new AnivexaError('Episódio não encontrado neste servidor.', { status: 404, code: 'NOT_FOUND' });
    if (res.status === 429) throw new AnivexaError('Muitas requisições ao servidor. Aguarde.', { status: 429, code: 'RATE_LIMIT' });
    if (!res.ok) throw new AnivexaError(`Servidor indisponível (HTTP ${res.status}).`, { status: res.status, code: 'HTTP' });
    const json = await res.json().catch(() => null);
    if (!json || json.error) throw new AnivexaError(json?.error || 'Resposta vazia do servidor.', { code: 'EMPTY' });
    return json;
  };

  if (cacheKey && ttlMs > 0) return cached(cacheKey, () => deduped(cacheKey, run), ttlMs);
  if (cacheKey) return deduped(cacheKey, run);
  return run();
}
