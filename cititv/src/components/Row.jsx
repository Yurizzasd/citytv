import { Link } from 'react-router-dom';
import AnimeCard from './AnimeCard.jsx';

export function SkeletonRow({ count = 8 }) {
  return (
    <div className="row" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skel" style={{ width: 160, height: 260 }} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 12 }) {
  return (
    <div className="grid" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skel" style={{ height: 270 }} />
      ))}
    </div>
  );
}

export default function Row({ title, items, loading, link }) {
  return (
    <section className="section reveal">
      <div className="section-head">
        <h2>{title}</h2>
        {link && <Link to={link}>Ver tudo →</Link>}
      </div>
      {loading ? (
        <SkeletonRow />
      ) : (
        <div className="row">{items.map((a) => <AnimeCard key={a.anilistId} anime={a} />)}</div>
      )}
    </section>
  );
}
