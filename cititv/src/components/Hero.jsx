import { Link } from 'react-router-dom';
import { animeSlug, formatScore, stripHtml, truncate } from '../utils/format.js';

export default function Hero({ anime, loading }) {
  if (loading || !anime) {
    return (
      <div className="wrap">
        <div className="hero"><div className="skel" style={{ height: 380, border: 0 }} /></div>
      </div>
    );
  }
  const to = `/anime/${animeSlug(anime.title, anime.anilistId)}`;
  return (
    <div className="wrap">
      <div className="hero">
        <div className="hero-bg">
          <img src={anime.banner || anime.coverXl} alt="" loading="eager" />
        </div>
        <div className="hero-content">
          <div className="hero-kicker">
            <span className="chip accent">✦ Em destaque</span>
            {anime.score != null && <span className="chip">★ {formatScore(anime.score)}</span>}
            {anime.seasonYear && <span className="chip">{anime.seasonYear}</span>}
          </div>
          <h1>{anime.title}</h1>
          <p className="desc">{truncate(stripHtml(anime.description), 200) || 'Sinopse em breve.'}</p>
          <div className="hero-meta">
            {(anime.genres || []).slice(0, 4).map((g) => <span key={g} className="chip">{g}</span>)}
            {anime.episodes && <span className="chip">{anime.episodes} episódios</span>}
          </div>
          <div className="hero-actions">
            <Link className="btn btn-primary" to={`/assistir/${animeSlug(anime.title, anime.anilistId)}/1`}>
              ▶ Assistir agora
            </Link>
            <Link className="btn btn-ghost" to={to}>Ver detalhes</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
