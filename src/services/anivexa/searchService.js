// Camada de BUSCA (searchService). Fonte: AniList (a Anivexa não tem busca).
// Fluxo: usuário -> CityTV -> AniList -> resultados.
import { anilistQuery } from '../anilist/client.js';
import { Q_SEARCH } from '../anilist/queries.js';
import { pickTitle } from './animeService.js';

export const searchService = {
  async search(term, pageNum = 1, perPage = 24) {
    const q = String(term || '').trim();
    if (q.length < 2) return { results: [], total: 0, hasNext: false };
    const data = await anilistQuery(Q_SEARCH, { search: q, page: pageNum, perPage }, { cacheKey: `search` });
    const list = (data?.Page?.media || []).map((m) => ({
      anilistId: m.id,
      title: pickTitle(m.title),
      cover: m.coverImage?.large || null,
      banner: m.bannerImage || null,
      genres: m.genres || [],
      score: m.averageScore ?? null,
      episodes: m.episodes ?? null,
      seasonYear: m.seasonYear || null,
      format: m.format || null,
    }));
    return { results: list, total: data?.Page?.pageInfo?.total || 0, hasNext: Boolean(data?.Page?.pageInfo?.hasNextPage) };
  },
};
