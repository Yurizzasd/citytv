import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Meta from '../components/Meta.jsx';
import { SkeletonGrid } from '../components/Row.jsx';
import { ErrorState } from '../components/States.jsx';
import { animeService } from '../services/api.js';

export default function Generos() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    animeService
      .genres()
      .then((g) => alive && (setGenres(g), setLoading(false)))
      .catch((e) => alive && (setError(e), setLoading(false)));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Meta title="Gêneros" description="Navegue por gêneros: ação, aventura, romance, fantasia e mais." />
      <div className="wrap page" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: '0 0 6px' }}>Gêneros</h1>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>Escolha um gênero para explorar.</p>
        {loading ? <SkeletonGrid count={10} /> : error ? <ErrorState error={error} />
          : (
            <div className="genre-cloud">
              {genres.map((g) => <Link key={g} to={`/animes?genero=${encodeURIComponent(g)}`}>{g}</Link>)}
            </div>
          )}
      </div>
    </>
  );
}
