// Camada de PLAYER (playerService). Fonte: Anivexa API.
// GET /watch/:provider/:anilistId/sub|dub/:provider-:ep
// Resposta: { anilistId, episode, audio, streams: [{url,type,server,subtitles,headers,...}] }
import { PROVIDER_PRIORITY } from '../../../config/providers.js';
import { anivexaFetch } from './config.js';
import { buildSugoiSlug, isSugoiEnabled, sugoiService } from '../sugoi/sugoiService.js';

const WATCH_TTL = 60 * 1000;

function rankStream(s, i) {
  const typeRank = s.type === 'hls' ? 0 : s.type === 'mp4' ? 1 : s.type === 'dash' ? 2 : 3;
  return [s.isActive ? 0 : 1, -(s.priority ?? 0), typeRank, i];
}

export function normalizeStreams(json) {
  const list = Array.isArray(json?.streams) ? json.streams : [];
  return list
    .filter((s) => s?.url)
    .map((s, i) => ({
      url: s.url,
      type: String(s.type || 'hls').toLowerCase(),
      server: s.server || 'Servidor',
      subtitles: Array.isArray(s.subtitles) ? s.subtitles.filter((t) => t?.url) : [],
      headers: s.headers || null,
      referer: s.referer || s.headers?.Referer || null,
      quality: s.quality || s.label || null,
      priority: s.priority ?? 0,
      isActive: s.isActive !== false,
      _i: i,
    }))
    .sort((a, b) => {
      const ra = rankStream(a, a._i);
      const rb = rankStream(b, b._i);
      for (let k = 0; k < ra.length; k++) if (ra[k] !== rb[k]) return ra[k] - rb[k];
      return 0;
    });
}

export const playerService = {
  watchPath(provider, anilistId, audio, ep) {
    return `/watch/${provider}/${anilistId}/${audio}/${provider}-${ep}`;
  },

  async getSource(provider, anilistId, audio, ep) {
    const json = await anivexaFetch(this.watchPath(provider, anilistId, audio, ep), {
      cacheKey: `watch:${provider}:${anilistId}:${audio}:${ep}`,
      ttlMs: WATCH_TTL,
    });
    return {
      anilistId: json.anilistId ?? Number(anilistId),
      episode: json.episode ?? Number(ep),
      audio: json.audio ?? audio,
      provider,
      streams: normalizeStreams(json),
      intro: json.intro || null,
      outro: json.outro || null,
      downloads: json.downloads || [],
    };
  },

  // Tenta provedores em ordem até achar um stream reproduzível (hls/mp4).
  async getBestAvailable(anilistId, ep, audio, providers = PROVIDER_PRIORITY) {
    let lastErr = null;
    for (const p of providers) {
      try {
        const src = await this.getSource(p, anilistId, audio, ep);
        const playable = src.streams.find((s) => s.type === 'hls' || s.type === 'mp4');
        if (playable) return { ...src, activeProvider: p };
        if (src.streams.length) return { ...src, activeProvider: p };
        lastErr = new Error(`Servidor ${p} sem fontes.`);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error('Nenhum servidor disponível para este episódio.');
  },

  // Anivexa primeiro; se tudo falhar, tenta a SugoiAPI (fonte reserva por slug).
  // Retorna { ..., fallback: true, activeProvider: 'sugoi' } quando vier da reserva.
  async getWithFallback(anilistId, ep, audio, providers = PROVIDER_PRIORITY, { title, temporada = 1 } = {}) {
    try {
      const src = await this.getBestAvailable(anilistId, ep, audio, providers);
      return { ...src, fallback: false };
    } catch (anivexaErr) {
      if (!isSugoiEnabled()) throw anivexaErr;
      try {
        const slug = buildSugoiSlug(title);
        const res = await sugoiService.getEpisode(slug, temporada, ep);
        return {
          anilistId: Number(anilistId),
          episode: Number(ep),
          audio,
          provider: 'sugoi',
          activeProvider: 'sugoi',
          streams: res.streams,
          intro: null,
          outro: null,
          downloads: [],
          fallback: true,
        };
      } catch {
        throw anivexaErr; // mantém o erro original (mais informativo)
      }
    }
  },
};
