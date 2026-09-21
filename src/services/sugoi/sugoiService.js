// Camada da SugoiAPI (fonte RESERVA / fallback).
// Docs: https://github.com/yzPeedro/SugoiAPI
// Endpoint: GET /episode/:anime-slug/:temporada/:numero-episodio
// Resposta: { error, status, data: [{ name, slug, has_ads, is_embed, episodes: [{ error, searched_endpoint, episode }] }] }
//
// Diferenças para a Anivexa: busca por SLUG de nome (imprecisa para continuações/
// títulos em japonês) e exige número da temporada (AniList não fornece — usa 1).
// Por isso ela só entra quando todos os provedores Anivexa falharem.
import { apiConfig } from '../../config/site.js';
import { slugify } from '../../utils/format.js';
import { cached, deduped } from '../../utils/cache.js';

export function sugoiBaseUrl() {
  if (apiConfig.useProxy) return '/api/sugoi';
  return apiConfig.sugoiBase;
}

export function isSugoiEnabled() {
  return apiConfig.sugoiEnabled && (apiConfig.useProxy || !!apiConfig.sugoiBase);
}

// Slug no padrão da SugoiAPI: minúsculo, sem acento, com hífens (ex: "one-piece").
export function buildSugoiSlug(title) {
  return slugify(title);
}

function detectType(url) {
  const u = String(url || '').toLowerCase();
  if (u.includes('.m3u8')) return 'hls';
  if (/\.(mp4|webm|mkv)(\?|#|$)/.test(u)) return 'mp4';
  return 'mp4'; // links diretos de vídeo na Sugoi costumam ser MP4
}

function normalize(json) {
  const out = [];
  const list = Array.isArray(json?.data) ? json.data : [];
  for (const entry of list) {
    const server = entry?.name || entry?.slug || 'Sugoi';
    for (const ep of entry?.episodes || []) {
      if (ep?.error || !ep?.episode) continue;
      out.push({
        url: ep.episode,
        type: entry?.is_embed ? 'embed' : detectType(ep.episode),
        server: `${server}${entry?.has_ads ? ' (ads)' : ''}`,
        subtitles: [],
        priority: 0,
        isActive: true,
      });
    }
  }
  // Diretos primeiro; embeds por último (precisam de iframe, não tocam no <video>).
  return out.sort((a, b) => (a.type === 'embed' ? 1 : 0) - (b.type === 'embed' ? 1 : 0));
}

export const sugoiService = {
  async getEpisode(slug, temporada = 1, ep) {
    const s = encodeURIComponent(String(slug || '').trim());
    if (!s) throw new Error('Título inválido para busca reserva.');
    const key = `sugoi:${s}:${temporada}:${ep}`;
    const run = async () => {
      let res;
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), apiConfig.timeoutMs);
        res = await fetch(`${sugoiBaseUrl()}/episode/${s}/${temporada}/${ep}`, {
          headers: { Accept: 'application/json' },
          signal: ctrl.signal,
        }).finally(() => clearTimeout(t));
      } catch {
        throw new Error('Fonte reserva indisponível.');
      }
      if (res.status === 404) throw new Error('Episódio não encontrado na fonte reserva.');
      if (!res.ok) throw new Error(`Fonte reserva indisponível (HTTP ${res.status}).`);
      const json = await res.json().catch(() => null);
      if (!json || json.error) throw new Error(json?.message || 'Fonte reserva sem resultados.');
      const streams = normalize(json);
      if (!streams.length) throw new Error('Fonte reserva sem links para este episódio.');
      return { streams, raw: json };
    };
    return cached(key, () => deduped(key, run), 5 * 60 * 1000);
  },
};
