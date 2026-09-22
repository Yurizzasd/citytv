// Camada de EPISÓDIOS (episodeService). Fonte: Anivexa API.
// GET /episodes/:anilistId  (todos os provedores em paralelo)
// GET /episodes/:provider/:anilistId (filtrado — mais rápido quando há preferência)
import { PROVIDER_PRIORITY } from '../../config/providers.js';
import { anivexaFetch, AnivexaError } from './config.js';
import { apiConfig } from '../../config/site.js';

const EP_TTL = 10 * 60 * 1000;

// Provedores consultados por padrão: os mais rápidos/estáveis.
// Buscar os 15 de uma vez deixa animes gigantes (ex: One Piece, 1100+ eps)
// lentos — o mais lerdo dita o tempo da resposta. A rota filtrada
// /episodes/:provider/.../:id da Anivexa existe exatamente para isso.
export const DEFAULT_PROVIDERS = ['anizone', 'aniwaves', 'reanime', 'anikoto', 'animegg', 'anineko'];

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

// Teto de episódios a partir dos dados reais do AniList.
// Evita exibir episódios de obras homônimas que algum provedor casou errado
// (ex: OVA de 1 ep com 26 eps de outra obra no mesmo ID).
export function episodeCap(details) {
  if (!details) return null;
  if (details.status === 'FINISHED' && Number.isFinite(details.episodes) && details.episodes > 0) {
    return details.episodes;
  }
  const next = details.nextAiring?.episode;
  if (Number.isFinite(next) && next > 1) return next - 1;
  return null;
}

export const episodeService = {
  // Payload bruto (por provedor) — útil para a tela de detalhes + picker de servidor.
  // Sem filtro (= []) busca os 15 provedores (lento em animes gigantes).
  async fetchRaw(anilistId, providers = [], { timeoutMs = apiConfig.timeoutMs } = {}) {
    const id = Number(anilistId);
    if (!Number.isFinite(id)) throw new AnivexaError('Anime inválido.', { code: 'BAD_ID' });
    const path = providers.length ? `/episodes/${providers.join('/')}/${id}` : `/episodes/${id}`;
    return anivexaFetch(path, { cacheKey: `ep:${id}:${providers.join(',') || 'all'}`, ttlMs: EP_TTL, timeoutMs });
  },

  // Lista padrão: só os 6 mais rápidos + 60s de tolerância.
  // `cap` corta números acima do total real (AniList) — ver episodeCap().
  async list(anilistId, { cap = null } = {}) {
    const raw = await this.fetchRaw(anilistId, DEFAULT_PROVIDERS, { timeoutMs: 60000 });
    let episodes = aggregateEpisodes(raw);
    if (Number.isFinite(cap) && cap > 0) episodes = episodes.filter((e) => e.number <= cap);
    return { raw, episodes, providers: availableProviders(raw) };
  },

  episodeId(provider, anilistId, audio, number) {
    // Formato exigido pela Anivexa: watch/<provider>/<id>/<audio>/<provider>-<ep>
    return `watch/${provider}/${anilistId}/${audio}/${provider}-${number}`;
  },
};
