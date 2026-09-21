// Config central do CityTV. Nada privado aqui — secrets ficam na Cloudflare (Functions).
export const siteConfig = {
  name: 'CityTV',
  tagline: 'Seu cinema de animes',
  description: 'Descubra e assista animes: populares, lançamentos e episódios legendados.',
  locale: 'pt-BR',
  themeColor: '#0b0e17',
};

export const apiConfig = {
  // Quando true, o frontend chama /api/anivexa (Cloudflare Function proxy)
  // em vez da URL direta. Recomendado em produção.
  useProxy: import.meta.env.VITE_USE_PROXY === 'true',
  anivexaBase: (import.meta.env.VITE_ANIVEXA_BASE_URL || 'http://localhost:4000').replace(/\/$/, ''),
  anilistUrl: import.meta.env.VITE_ANILIST_URL || 'https://graphql.anilist.co',
  timeoutMs: 15000,
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
  // SugoiAPI (fonte reserva). Desligada por padrão — exige instância própria hospedada.
  sugoiBase: (import.meta.env.VITE_SUGOI_BASE_URL || '').replace(/\/$/, ''),
  sugoiEnabled: import.meta.env.VITE_SUGOI_ENABLED === 'true',
};

export function anivexaBaseUrl() {
  if (apiConfig.useProxy) return '/api/anivexa';
  return apiConfig.anivexaBase;
}
