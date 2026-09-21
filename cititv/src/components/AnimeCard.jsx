import { Link } from 'react-router-dom';
import { animeSlug, formatScore } from '../utils/format.js';

export default function AnimeCard({ anime }) {
  const to = `/anime/${animeSlug(anime.title, anime.anilistId)}`;
  return (
    <Link to={to} className="card" aria-label={anime.title}>
      <div className="card-poster">
        <img src={anime.cover} alt={anime.title} loading="lazy" />
        {anime.score != null && <span className="card-score">★ {formatScore(anime.score)}</span>}
      </div>
      <div className="card-body">
        <p className="card-title">{anime.title}</p>
        <div className="card-sub">
          <span>{anime.seasonYear || '—'}</span>
          <span>•</span>
          <span>{anime.episodes ? `${anime.episodes} ep` : 'TV'}</span>
        </div>
      </div>
    </Link>
  );
}
