import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard.jsx';
import Meta from '../components/Meta.jsx';
import { SkeletonGrid } from '../components/Row.jsx';
import { EmptyState, ErrorState } from '../components/States.jsx';
import { animeService } from '../services/api.js';

export default function Animes() {
  const [params, setParams] = useSearchParams();
  const genre = params.get('genero') || '';
  const [genres, setGenres] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    animeService.genres().then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const list = genre
          ? await animeService.byGenre(genre, 1, 24)
          : await animeService.trending(1, 24);
        if (alive) {
          setItems(list);
          setLoading(false);
        }
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
  }, [genre]);

  return (
    <>
      <Meta title="Animes" description="Explore o catálogo de animes do CityTV por gênero e temporada." />
      <div className="wrap page" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: '0 0 6px' }}>Animes</h1>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>Explore por gênero ou descubra os lançamentos.</p>
        <div className="toolbar">
          <select value={genre} onChange={(e) => setParams(e.target.value ? { genero: e.target.value } : {})} aria-label="Filtrar por gênero">
            <option value="">Todos os gêneros</option>
            {genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        {loading ? <SkeletonGrid /> : error ? <ErrorState error={error} onRetry={() => window.location.reload()} />
          : !items.length ? <EmptyState title="Nada por aqui" text="Nenhum anime encontrado para este filtro." />
          : <div className="grid">{items.map((a) => <AnimeCard key={a.anilistId} anime={a} />)}</div>}
      </div>
    </>
  );
}
