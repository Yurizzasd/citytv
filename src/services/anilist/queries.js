// Queries AniList — apenas campos usados pela UI (payload enxuto).
export const MEDIA_CARD = `
  id
  title { romaji english native }
  coverImage { large extraLarge color }
  bannerImage
  genres
  averageScore
  popularity
  favourites
  episodes
  status
  format
  seasonYear
`;

export const Q_TRENDING = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { ${MEDIA_CARD} description(asHtml: false) }
    }
  }`;

export const Q_POPULAR = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_CARD} description(asHtml: false) }
    }
  }`;

export const Q_TOP = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: SCORE_DESC, isAdult: false) { ${MEDIA_CARD} description(asHtml: false) }
    }
  }`;

export const Q_SEASON = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: START_DATE_DESC, status_in: [RELEASING, NOT_YET_RELEASED], isAdult: false) {
        ${MEDIA_CARD} description(asHtml: false)
      }
    }
  }`;

export const Q_SEARCH = `
  query ($search: String, $page: Int, $perPage: Int, $genre: String) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total hasNextPage }
      media(type: ANIME, search: $search, genre: $genre, isAdult: false, sort: SEARCH_MATCH) {
        ${MEDIA_CARD}
      }
    }
  }`;

export const Q_DETAILS = `
  query ($id: Int) {
    Media(id: $id, type: ANIME, isAdult: false) {
      id
      title { romaji english native }
      synonyms
      coverImage { large extraLarge color }
      bannerImage
      description(asHtml: false)
      genres
      averageScore
      popularity
      favourites
      episodes
      duration
      status
      format
      seasonYear
      startDate { year month day }
      endDate { year month day }
      studios(isMain: true) { nodes { name } }
      nextAiringEpisode { episode airingAt }
      trailer { id site thumbnail }
    }
  }`;

export const Q_GENRES = `
  query { GenreCollection }`;

export const Q_MOVIES = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, format_in: [MOVIE], sort: POPULARITY_DESC, isAdult: false) {
        ${MEDIA_CARD} description(asHtml: false)
      }
    }
  }`;
