// Camada de CATÁLOGO (animeService).
// Fonte: AniList GraphQL — a Anivexa não expõe trending/popular/busca/catálogo,
// apenas episódios e streams por AniList ID. Centralizado aqui para troca futura.
import { anilistQuery } from '../anilist/client.js';
import { Q_DETAILS, Q_GENRES, Q_MOVIES, Q_POPULAR, Q_SEARCH, Q_SEASON, Q_TOP, Q_TRENDING } from '../anilist/queries.js';

export function pickTitle(t = {}) {
  return t.english || t.romaji || t.native || 'Título desconhecido';
}

function normalizeMedia(m) {
  if (!m) return null;
  return {
    anilistId: m.id,
    title: pickTitle(m.title),
    titleRomaji: m.title?.romaji || null,
    titleNative: m.title?.native || null,
    cover: m.coverImage?.large || m.coverImage?.extraLarge || null,
    coverXl: m.coverImage?.extraLarge || m.coverImage?.large || null,
    banner: m.bannerImage || m.coverImage?.extraLarge || null,
    color: m.coverImage?.color || null,
    genres: m.genres || [],
    score: m.averageScore ?? null,
    popularity: m.popularity ?? null,
    favourites: m.favourites ?? null,
    episodes: m.episodes ?? null,
    status: m.status || null,
    format: m.format || null,
    seasonYear: m.seasonYear || null,
    description: m.description || '',
    raw: m,
  };
}

async function page(query, cacheKey, pageNum = 1, perPage = 18) {
  const data = await anilistQuery(query, { page: pageNum, perPage }, { cacheKey: `${cacheKey}-p${pageNum}` });
  return (data?.Page?.media || []).map(normalizeMedia).filter(Boolean);
}

export const animeService = {
  trending: (p = 1, n = 18) => page(Q_TRENDING, 'trending', p, n),
  popular: (p = 1, n = 18) => page(Q_POPULAR, 'popular', p, n),
  topRated: (p = 1, n = 18) => page(Q_TOP, 'top', p, n),
  seasonal: (p = 1, n = 18) => page(Q_SEASON, 'season', p, n),
  movies: (p = 1, n = 18) => page(Q_MOVIES, 'movies', p, n),

  async details(anilistId) {
    const data = await anilistQuery(Q_DETAILS, { id: Number(anilistId) }, { cacheKey: `details-${anilistId}`, ttlMs: 30 * 60 * 1000 });
    const m = data?.Media;
    if (!m) throw new Error('Anime não encontrado.');
    const base = normalizeMedia(m);
    return {
      ...base,
      synonyms: m.synonyms || [],
      studios: (m.studios?.nodes || []).map((s) => s.name),
      duration: m.duration ?? null,
      startDate: m.startDate || null,
      nextAiring: m.nextAiringEpisode || null,
      trailer: m.trailer || null,
    };
  },

  async genres() {
    const data = await anilistQuery(Q_GENRES, {}, { cacheKey: 'genres', ttlMs: 24 * 60 * 60 * 1000 });
    return data?.GenreCollection || [];
  },

  async byGenre(genre, pageNum = 1, perPage = 24) {
    const data = await anilistQuery(
      Q_SEARCH,
      { search: undefined, genre, page: pageNum, perPage },
      { cacheKey: `genre-${genre}-p${pageNum}` },
    );
    return (data?.Page?.media || []).map(normalizeMedia).filter(Boolean);
  },
};
