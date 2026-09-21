// Provedores da Anivexa API (v2.2.1) — espelha a documentação oficial.
// Rotas válidas: /watch/<provider>/<anilistId>/sub|dub/<provider>-<ep>
// NÃO adicionar nomes fora desta lista sem atualizar a API.
export const PROVIDERS = [
  'anizone',
  'aniwaves',
  'reanime',
  'anikoto',
  'animegg',
  'anineko',
  'anidbapp',
  'anibd',
  'senshi',
  'kaa',
  'animedunya',
  'animeonsen',
  '2dhive',
  'animenosub',
  'mkissa',
];

// Ordem de tentativa: HLS estável + legendas primeiro.
export const PROVIDER_PRIORITY = [
  'anizone',
  'aniwaves',
  'reanime',
  'anikoto',
  'animegg',
  'anineko',
  'anidbapp',
  'animedunya',
  'kaa',
  'anibd',
  'senshi',
  'animeonsen',
  '2dhive',
  'animenosub',
  'mkissa',
];

export const PROVIDER_LABELS = {
  anizone: 'AniZone',
  aniwaves: 'AniWaves',
  reanime: 'Reanime',
  anikoto: 'AniKoto',
  animegg: 'AnimeGG',
  anineko: 'AniNeko',
  anidbapp: 'AniDB App',
  anibd: 'AniBD',
  senshi: 'Senshi',
  kaa: 'KickAssAnime',
  animedunya: 'AnimeDunya',
  animeonsen: 'AnimeOnsen',
  '2dhive': '2DHive',
  animenosub: 'AnimeNoSub',
  mkissa: 'MKissa',
};
