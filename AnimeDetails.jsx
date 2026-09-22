import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Meta from '../components/Meta.jsx';
import { PROVIDER_LABELS } from '../config/providers.js';
import { animeService, episodeService } from '../services/api.js';
import { episodeCap } from '../services/anivexa/episodeService.js';
import { animeSlug, formatScore, parseAnimeSlug, stripHtml } from '../utils/format.js';

export default function AnimeDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const anilistId = parseAnimeSlug(slug);
  const [anime, setAnime] = useState(null);
  const [eps, setEps] = useState({ episodes: [], providers: [], loading: true, error: null });

  useEffect(() => {
    if (!anilistId) return;
    let alive = true;
    (async () => {
      let details = null;
      try {
        details = await animeService.details(anilistId);
        if (alive) setAnime(details);
      } catch {
        if (alive) setAnime(null);
      }
      try {
        const r = await episodeService.list(anilistId, { cap: episodeCap(details) });
        if (alive) setEps({ episodes: r.episodes, providers: r.providers, loading: false, error: null });
      } catch (e) {
        if (alive) setEps({ episodes: [], providers: [], loading: false, error: e });
      }
    })();
    return () => {
      alive = false;
    };
  }, [anilistId]);

  if (!anilistId) {
    return (
      <div className="wrap page" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}>
        <div className="state"><h3>Anime inválido</h3><p>URL não reconhecida.</p></div>
      </div>
    );
  }

  const watchHref = (ep) => `/assistir/${anime ? animeSlug(anime.title, anime.anilistId) : `anime-${anilistId}`}/${ep}`;

  return (
    <>
      <Meta
        title={anime?.title || 'Anime'}
        description={anime ? stripHtml(anime.description).slice(0, 155) : 'Detalhes do anime no CityTV.'}
        image={anime?.banner || anime?.coverXl}
      />
      {!anime ? (
        <div className="wrap page" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}>
          <div className="skel" style={{ height: 300 }} />
        </div>
      ) : (
        <>
          <div className="anime-hero">
            <div className="anime-banner"><img src={anime.banner} alt="" loading="eager" /></div>
            <div className="wrap">
              <div className="anime-main reveal in">
                <div className="poster"><img src={anime.coverXl} alt={anime.title} loading="eager" /></div>
                <div className="anime-info">
                  <h1>{anime.title}</h1>
                  {(anime.titleRomaji && anime.titleRomaji !== anime.title) && (
                    <div className="alt-title">{anime.titleRomaji}{anime.titleNative ? ` • ${anime.titleNative}` : ''}</div>
                  )}
                  <div className="info-grid">
                    {anime.score != null && <span className="chip accent">★ {formatScore(anime.score)}</span>}
                    {anime.seasonYear && <span className="chip">{anime.seasonYear}</span>}
                    {anime.format && <span className="chip">{anime.format}</span>}
                    {anime.status && <span className="chip">{anime.status}</span>}
                    {(anime.genres || []).slice(0, 5).map((g) => <span key={g} className="chip">{g}</span>)}
                  </div>
                  <p className="synopsis">{stripHtml(anime.description) || 'Sinopse em breve.'}</p>
                  <div className="facts">
                    <div className="fact"><span>Episódios</span><strong>{anime.episodes || eps.episodes.length || '—'}</strong></div>
                    <div className="fact"><span>Duração</span><strong>{anime.duration ? `${anime.duration} min` : '—'}</strong></div>
                    <div className="fact"><span>Estúdio</span><strong>{anime.studios?.[0] || '—'}</strong></div>
                    <div className="fact"><span>Popularidade</span><strong>{anime.popularity?.toLocaleString('pt-BR') || '—'}</strong></div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => eps.episodes.length && navigate(watchHref(eps.episodes[0].number))}>
                      ▶ Assistir EP 1
                    </button>
                    <Link className="btn btn-ghost" to="/animes">← Voltar</Link>
                  </div>
                  {!!eps.providers.length && (
                    <p style={{ color: 'var(--faint)', fontSize: 12.5, marginTop: 10 }}>
                      Servidores: {eps.providers.map((p) => PROVIDER_LABELS[p] || p).join(' • ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="wrap">
            <section className="section">
              <div className="section-head"><h2>Episódios</h2></div>
              {eps.loading ? (
                <div className="eps">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="skel" style={{ height: 44 }} />)}</div>
              ) : eps.error ? (
                <div className="state" role="alert">
                  <h3>Episódios indisponíveis</h3>
                  <p>{eps.error.message}</p>
                  <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Tentar novamente</button>
                </div>
              ) : !eps.episodes.length ? (
                <div className="state"><h3>Sem episódios</h3><p>Ainda não há fontes para este anime.</p></div>
              ) : (
                <div className="eps">
                  {eps.episodes.map((e) => (
                    <button key={e.number} className="ep-btn" onClick={() => navigate(watchHref(e.number))} title={e.title}>
                      {String(e.number).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
