import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Meta from '../components/Meta.jsx';
import VideoPlayer from '../components/VideoPlayer.jsx';
import AdSlot from '../components/ads/AdSlot.jsx';
import { adsConfig } from '../config/ads.js';
import { PROVIDER_LABELS, PROVIDER_PRIORITY } from '../config/providers.js';
import { animeService, episodeService, playerService } from '../services/api.js';
import { animeSlug, parseAnimeSlug } from '../utils/format.js';

export default function Watch() {
  const { slug, ep } = useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const anilistId = parseAnimeSlug(slug);
  const epNum = Number(ep);
  const audio = search.get('audio') === 'dub' ? 'dub' : 'sub';

  const [anime, setAnime] = useState(null);
  const [epList, setEpList] = useState([]);
  const urlProvider = search.get('provider') || '';
  const [provider, setProvider] = useState(urlProvider);

  // Mantém o servidor sincronizado com a URL (?provider=...)
  useEffect(() => {
    if (urlProvider && urlProvider !== provider) setProvider(urlProvider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlProvider]);
  const [source, setSource] = useState(null);
  const [streamIdx, setStreamIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Catálogo + lista de episódios (para prev/next e destaque do atual)
  useEffect(() => {
    if (!anilistId) return;
    animeService.details(anilistId).then(setAnime).catch(() => {});
    episodeService
      .list(anilistId)
      .then((r) => {
        setEpList(r.episodes);
        if (!provider && r.providers.length) setProvider(r.providers[0]);
      })
      .catch(() => {});
  }, [anilistId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fonte do episódio atual
  useEffect(() => {
    if (!anilistId || !Number.isFinite(epNum) || epNum < 1) {
      setError(new Error('Episódio inválido.'));
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    setSource(null);
    (async () => {
      try {
        // Provedores candidatos: o escolhido primeiro, depois a ordem padrão.
        const current = epList.find((e) => e.number === epNum);
        const ordered = [
          ...(provider ? [provider] : []),
          ...PROVIDER_PRIORITY.filter((p) => p !== provider),
        ].filter((p) => (current ? current.providers.includes(p) : true));
        const best = await playerService.getBestAvailable(anilistId, epNum, audio, ordered.length ? ordered : PROVIDER_PRIORITY);
        if (!alive) return;
        setProvider(best.activeProvider);
        setSource(best);
        setStreamIdx(Math.max(0, best.streams.findIndex((s) => s.type === 'hls' || s.type === 'mp4')));
        setSearch({ provider: best.activeProvider, audio }, { replace: true });
        setLoading(false);
      } catch (e) {
        if (alive) {
          setError(e);
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [anilistId, epNum, audio, provider]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeStream = source?.streams?.[streamIdx] || source?.streams?.[0] || null;
  const maxEp = useMemo(() => (epList.length ? Math.max(...epList.map((e) => e.number)) : null), [epList]);
  const goEp = (n) => {
    if (!Number.isFinite(n) || n < 1 || (maxEp && n > maxEp)) return;
    navigate(`/assistir/${slug}/${n}?provider=${provider}&audio=${audio}`);
  };
  const baseSlug = anime ? animeSlug(anime.title, anime.anilistId) : slug;

  return (
    <>
      <Meta title={anime ? `${anime.title} EP ${epNum}` : `Episódio ${epNum}`} description={anime ? `Assistir ${anime.title} episódio ${epNum} legendado no CityTV.` : 'Assistir episódio no CityTV.'} image={anime?.banner} />
      <div className="wrap">
        <div className="watch-layout">
          <div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <Link className="btn btn-ghost btn-sm" to={`/anime/${baseSlug}`}>← {anime?.title || 'Detalhes'}</Link>
              <span className="chip accent">EP {epNum}</span>
              <span className="chip">{audio === 'dub' ? 'Dublado' : 'Legendado'}</span>
            </div>
            <div className="player-shell">
              {loading ? (
                <div className="skel" style={{ aspectRatio: '16/9', border: 0, borderRadius: 0 }} />
              ) : error ? (
                <div className="state" role="alert" style={{ border: 0, borderRadius: 0 }}>
                  <h3>Fonte indisponível</h3>
                  <p>{error.message}</p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Tentar novamente</button>
                    {maxEp && epNum < maxEp && <button className="btn btn-primary btn-sm" onClick={() => goEp(epNum + 1)}>Próximo episódio →</button>}
                  </div>
                </div>
              ) : activeStream?.type === 'dash' ? (
                <div className="state" role="alert" style={{ border: 0, borderRadius: 0 }}>
                  <h3>Formato DASH</h3>
                  <p>Este servidor retornou DASH (AnimeOnsen). Troque de servidor para HLS/MP4.</p>
                </div>
              ) : activeStream ? (
                <VideoPlayer src={activeStream} title={`${anime?.title} EP ${epNum}`} onEnded={() => maxEp && epNum < maxEp && goEp(epNum + 1)} />
              ) : null}
            </div>
            {!!source && (
              <div className="player-bar" style={{ borderRadius: 12, marginTop: 10, border: '1px solid var(--line)' }}>
                <button onClick={() => goEp(epNum - 1)} disabled={epNum <= 1}>← Anterior</button>
                <button className="primary" onClick={() => maxEp && goEp(epNum + 1)} disabled={maxEp ? epNum >= maxEp : false}>Próximo →</button>
                <select value={audio} onChange={(e) => navigate(`/assistir/${slug}/${epNum}?provider=${provider}&audio=${e.target.value}`)} aria-label="Áudio">
                  <option value="sub">Legendado</option>
                  <option value="dub">Dublado</option>
                </select>
                <select value={provider} onChange={(e) => navigate(`/assistir/${slug}/${epNum}?provider=${e.target.value}&audio=${audio}`)} aria-label="Servidor">
                  {PROVIDER_PRIORITY.map((p) => <option key={p} value={p}>{PROVIDER_LABELS[p] || p}</option>)}
                </select>
                {source.streams.length > 1 && (
                  <select value={streamIdx} onChange={(e) => setStreamIdx(Number(e.target.value))} aria-label="Fonte">
                    {source.streams.map((s, i) => <option key={i} value={i}>{s.server} — {s.type.toUpperCase()}</option>)}
                  </select>
                )}
              </div>
            )}
            <AdSlot id={adsConfig.slots.watchBelowPlayer} />
          </div>
          <aside className="side" aria-label="Episódios">
            <h3>Episódios</h3>
            {!epList.length ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>Carregando…</p> : (
              <div className="eps" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))' }}>
                {epList.map((e) => (
                  <button key={e.number} className={`ep-btn ${e.number === epNum ? 'current' : ''}`} onClick={() => goEp(e.number)}>
                    {String(e.number).padStart(2, '0')}
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
