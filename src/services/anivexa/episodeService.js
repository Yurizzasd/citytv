// Camada de EPISÓDIOS (episodeService). Fonte: Anivexa API.
// GET /episodes/:anilistId  (todos os provedores em paralelo)
// GET /episodes/:provider/:anilistId (filtrado — mais rápido quando há preferência)
import { PROVIDER_PRIORITY } from '../../../config/providers.js';
import { anivexaFetch, AnivexaError } from './config.js';

const EP_TTL = 10 * 60 * 1000;

function providerEpisodes(payload, provider) {
  const node = payload?.[provider];
  if (!node || node.error) return { sub: [], dub: [] };
  return {
    sub: Array.isArray(node?.episodes?.sub) ? node.episodes.sub : [],
    dub: Array.isArray(node?.episodes?.dub) ? node.episodes.dub : [],
  };
}

// Une episódios de todos os provedores por número: { number, title, image, providers[], audios[] }
export function aggregateEpisodes(payload, providers = PROVIDER_PRIORITY) {
  const map = new Map();
  for (const p of providers) {
    const { sub, dub } = providerEpisodes(payload, p);
    for (const list of [sub, dub]) {
      for (const ep of list) {
        const n = Number(ep?.number);
        if (!Number.isFinite(n) || n < 1) continue;
        if (!map.has(n)) {
          map.set(n, {
            number: n,
            title: ep.title || `Episódio ${n}`,
            image: ep.image || null,
            description: ep.description || null,
            duration: ep.duration ?? null,
            providers: [],
            audios: new Set(),
          });
        }
        const entry = map.get(n);
        if (!entry.providers.includes(p)) entry.providers.push(p);
        if (ep.audio) entry.audios.add(ep.audio);
        if (!entry.image && ep.image) entry.image = ep.image;
        if ((!entry.title || entry.title.startsWith('Episódio')) && ep.title) entry.title = ep.title;
      }
    }
  }
  return [...map.values()]
    .sort((a, b) => a.number - b.number)
    .map((e) => ({ ...e, audios: [...e.audios] }));
}

export function availableProviders(payload) {
  return PROVIDER_PRIORITY.filter((p) => {
    const { sub, dub } = providerEpisodes(payload, p);
    return sub.length + dub.length > 0;
  });
}

export const episodeService = {
  // Payload bruto (por provedor) — útil para a tela de detalhes + picker de servidor.
  async fetchRaw(anilistId, providers = []) {
    const id = Number(anilistId);
    if (!Number.isFinite(id)) throw new AnivexaError('Anime inválido.', { code: 'BAD_ID' });
    const path = providers.length ? `/episodes/${providers.join('/')}/${id}` : `/episodes/${id}`;
    return anivexaFetch(path, { cacheKey: `ep:${id}:${providers.join(',') || 'all'}`, ttlMs: EP_TTL });
  },

  async list(anilistId) {
    const raw = await this.fetchRaw(anilistId);
    const episodes = aggregateEpisodes(raw);
    return { raw, episodes, providers: availableProviders(raw) };
  },

  episodeId(provider, anilistId, audio, number) {
    // Formato exigido pela Anivexa: watch/<provider>/<id>/<audio>/<provider>-<ep>
    return `watch/${provider}/${anilistId}/${audio}/${provider}-${number}`;
  },
};
