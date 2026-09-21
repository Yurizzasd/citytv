// Cloudflare Pages Function — proxy server-side para a SugoiAPI (fonte reserva).
// Encaminha GET /episode/:slug/:temporada/:ep para a instância própria do usuário.
// Secret: SUGOI_BASE_URL (wrangler secret put SUGOI_BASE_URL).
const ALLOWED = /^\/episode\/[^/]+\/\d+\/\d+\/?$/;

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const base = (env.SUGOI_BASE_URL || '').replace(/\/$/, '');
  if (!base) {
    return Response.json({ error: 'SUGOI_BASE_URL não configurado na Function.' }, { status: 500 });
  }

  const suffix = url.pathname.replace(/^\/api\/sugoi/, '') || '/';
  if (request.method !== 'GET' || !ALLOWED.test(suffix)) {
    return Response.json({ error: 'Rota não permitida no proxy.' }, { status: 404 });
  }

  const target = `${base}${suffix}${url.search}`;
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 20000);
  try {
    const upstream = await fetch(target, {
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
    return Response.json({ error: 'Falha ao contatar a SugoiAPI.', detail: String(e?.message || e) }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
