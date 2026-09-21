import { useEffect, useState } from 'react';
import AnimeCard from '../components/AnimeCard.jsx';
import Meta from '../components/Meta.jsx';
import { SkeletonGrid } from '../components/Row.jsx';
import { ErrorState } from '../components/States.jsx';
import { animeService } from '../services/api.js';

export default function Filmes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    animeService
      .movies(1, 24)
      .then((list) => alive && (setItems(list), setLoading(false)))
      .catch((e) => alive && (setError(e), setLoading(false)));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Meta title="Filmes" description="Filmes de anime no CityTV." />
      <div className="wrap page" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: '0 0 6px' }}>Filmes</h1>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>Longas para maratonar.</p>
        {loading ? <SkeletonGrid /> : error ? <ErrorState error={error} />
          : <div className="grid">{items.map((a) => <AnimeCard key={a.anilistId} anime={a} />)}</div>}
      </div>
    </>
  );
}
