import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard.jsx';
import Meta from '../components/Meta.jsx';
import { SkeletonGrid } from '../components/Row.jsx';
import { EmptyState, ErrorState } from '../components/States.jsx';
import { useDebounce } from '../hooks/hooks.js';
import { searchService } from '../services/api.js';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('q') || '';
  const [input, setInput] = useState(raw);
  const debounced = useDebounce(input, 450);
  const [state, setState] = useState({ results: [], loading: false, error: null, searched: false });

  useEffect(() => setInput(raw), [raw]);

  useEffect(() => {
    if (debounced.trim() !== raw.trim()) {
      setParams(debounced.trim() ? { q: debounced.trim() } : {}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    const q = raw.trim();
    if (q.length < 2) {
      setState({ results: [], loading: false, error: null, searched: false });
      return;
    }
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null, searched: true }));
    searchService
      .search(q, 1, 24)
      .then((r) => alive && setState({ results: r.results, loading: false, error: null, searched: true }))
      .catch((e) => alive && setState({ results: [], loading: false, error: e, searched: true }));
    return () => {
      alive = false;
    };
  }, [raw]);

  return (
    <>
      <Meta title={raw ? `Buscar: ${raw}` : 'Buscar'} description={`Resultados para ${raw} no CityTV.`} />
      <div className="wrap page" style={{ paddingTop: 'calc(var(--header-h) + 24px)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: '0 0 12px' }}>Buscar</h1>
        <div className="toolbar">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite ao menos 2 letras… ex: Naruto"
            aria-label="Buscar anime"
            style={{ flex: '1 1 280px' }}
          />
        </div>
        {state.loading ? <SkeletonGrid />
          : state.error ? <ErrorState error={state.error} onRetry={() => setInput((v) => `${v} `)} />
          : !state.searched ? <EmptyState title="Pesquise um anime" text="Digite o nome para ver resultados do catálogo." />
          : !state.results.length ? <EmptyState title="Nenhum anime encontrado" text={`Não achamos nada para “${raw}”. Tente outro nome ou grafia.`} />
          : (
            <>
              <p style={{ color: 'var(--muted)' }}>{state.results.length} resultado(s) para “{raw}”</p>
              <div className="grid">{state.results.map((a) => <AnimeCard key={a.anilistId} anime={a} />)}</div>
            </>
          )}
      </div>
    </>
  );
}
