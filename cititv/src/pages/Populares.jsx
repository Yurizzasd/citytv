import { useEffect, useState } from 'react';
import AnimeCard from '../components/AnimeCard.jsx';
import Meta from '../components/Meta.jsx';
import { SkeletonGrid } from '../components/Row.jsx';
import { ErrorState } from '../components/States.jsx';
import { animeService } from '../services/api.js';

export default function Populares() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([animeService.popular(1, 18), animeService.topRated(1, 6)])
      .then(([pop, top]) => {
        if (!alive) return;
        const seen = new Set();
        setItems([...pop, ...top].filter((a) => (seen.has(a.anilistId) ? false : (seen.add(a.anilistId), true))));
        setLoading(false);
      })
      .catch((e) => alive && (setError(e), setLoading(false)));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Meta title="Populares" description="Os animes mais populares e mais bem avaliados no CityTV." />
      <div className="wrap page" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: '0 0 6px' }}>Populares</h1>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>Os queridinhos da comunidade.</p>
        {loading ? <SkeletonGrid /> : error ? <ErrorState error={error} />
          : <div className="grid">{items.map((a) => <AnimeCard key={a.anilistId} anime={a} />)}</div>}
      </div>
    </>
  );
}
