# CityTV

Plataforma de descoberta e streaming de animes. Catálogo via **AniList GraphQL** (público, sem chave),
episódios e fontes via **Anivexa API** (self-hosted).

> A Anivexa **não** possui catálogo/busca/trending — apenas `GET /map/:id`, `GET /episodes/:id`,
> `GET /episodes/:provider/:id` e `GET /watch/:provider/:id/sub|dub/:provider-:ep` (v2.2.1).
> Por isso o catálogo/busca vem do AniList e os episódios/player vêm da Anivexa.
> Toda comunicação com a Anivexa está isolada em `src/services/anivexa/`.

## Requisitos

- Node.js 18+ (instale em https://nodejs.org — o ambiente atual não tem Node no PATH)

## Rodar

```bash
npm install
cp .env.example .env   # ajuste VITE_ANIVEXA_BASE_URL para sua Anivexa local (ex: http://localhost:4000)
npm run dev            # http://localhost:5173
```

Suba a Anivexa separada (`Anivexa-API-main`: `npm install && node server.js` → porta 4000).

## Build / Cloudflare Pages

```bash
npm run build           # gera dist/
npm run sitemap         # gera public/sitemap.xml (defina SITE_URL)
```

- Conecte o repo no Cloudflare Pages (build: `npm run build`, output: `dist`).
- Secrets da Function (`functions/api/anivexa/[[path]].js`): `wrangler secret put ANIVEXA_BASE_URL`
- No `.env` de produção: `VITE_USE_PROXY=true` (frontend usa `/api/anivexa`, escondendo a URL real).
- `public/_redirects` faz fallback SPA; `public/_headers` com headers de segurança; `public/robots.txt` + sitemap para SEO.

## Estrutura

```
src/
  components/ (Header, Hero, AnimeCard, Row, VideoPlayer, ads/AdSlot, States, Meta, Footer)
  pages/ (Home, Animes, Generos, Populares, Search, AnimeDetails, Watch)
  services/
    anilist/ (client, queries)
    anivexa/ (config, animeService, searchService, episodeService, playerService)
  hooks/ utils/ config/ styles (index.css) data/mocks.js (só dev)
functions/api/anivexa/[[path]].js  # proxy server-side Cloudflare
```

## Anúncios (AdCash)

Desligados por padrão. Slots prontos (máx. 1 por página, nunca sobre o player):
`homeBelowHero`, `browseMid`, `animeBelowInfo`, `watchBelowPlayer` — ver `src/config/ads.js`
e `src/components/ads/AdSlot.jsx`. Para ativar: `VITE_ADCASH_ENABLED=true` +
`VITE_ADCASH_SCRIPT_URL` + colar o snippet oficial no `AdSlot`.

## URLs amigáveis

- `/anime/naruto-20` (slug + AniList ID — o ID é extraído do final)
- `/assistir/naruto-20/1?provider=anizone&audio=sub`

## Fonte reserva (SugoiAPI, opcional)

Quando todos os provedores Anivexa falham, o player tenta a
[SugoiAPI](https://github.com/yzPeedro/SugoiAPI) por slug (`/episode/:slug/:temporada/:ep`).
Desligada por padrão. Para ativar:

1. Hospede sua instância (a Railway aceita o Dockerfile do repo)
2. No `.env`/Cloudflare: `VITE_SUGOI_ENABLED=true` + `VITE_SUGOI_BASE_URL=<sua-url>`
3. Com proxy (`VITE_USE_PROXY=true`), defina o secret `SUGOI_BASE_URL` da Function

Limitação conhecida: busca por nome (imprecisa em continuações) e temporada fixa em 1.
