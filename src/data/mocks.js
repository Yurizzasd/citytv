// MOCKS — APENAS desenvolvimento de layout (VITE_USE_MOCKS=true).
// NUNCA usados em produção. A integração real usa AniList (catálogo)
// + Anivexa (episódios/streams). Mantidos isolados neste arquivo.
export const mockAnimes = [
  {
    anilistId: 20,
    title: 'Naruto (mock)',
    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-YJvLBGvZTQpn.png',
    coverXl: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-YJvLBGvZTQpn.png',
    banner: null,
    genres: ['Ação', 'Aventura'],
    score: 79,
    episodes: 220,
    seasonYear: 2002,
    description: 'Mock local para layout — não é dado real da API.',
  },
];
