// Cloudflare Pages Function — proxy server-side para a Anivexa API.
// Por que: esconde a URL real da API, evita CORS, permite timeout/cache/rate-limit
// centralizados e mantém secrets fora do bundle público.
//
// Cloudflare: defina o secret ANIVEXA_BASE_URL (wrangler secret put ANIVEXA_BASE_URL).
// Local: crie .dev.vars com ANIVEXA_BASE_URL=http://localhost:4000
//
// Rotas oficiais repassadas (Anivexa v2.2.1):
//   /map/:id  /episodes/...  /watch/...  /stream/...
const ALLOWED = /^\/(map|episodes|watch|stream|captcha)(\/|$)/;

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const base = (env.ANIVEXA_BASE_URL || '').replace(/\/$/, '');
  if (!base) {
    return Response.json({ error: 'ANIVEXA_BASE_URL não configurado na Function.' }, { status: 500 });
  }

  const suffix = url.pathname.replace(/^\/api\/anivexa/, '') || '/';
  if (!ALLOWED.test(suffix)) {
    return Response.json({ error: 'Rota não permitida no proxy.' }, { status: 404 });
  }

  const target = `${base}${suffix}${url.search}`;
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 20000);
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
    });
    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (e) {
    return Response.json({ error: 'Falha ao contatar a Anivexa API.', detail: String(e?.message || e) }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
