import { useEffect, useState } from 'react';
import Hero from '../components/Hero.jsx';
import Row from '../components/Row.jsx';
import Meta from '../components/Meta.jsx';
import AdSlot from '../components/ads/AdSlot.jsx';
import { adsConfig } from '../config/ads.js';
import { animeService } from '../services/api.js';
import { useReveal } from '../hooks/hooks.js';

export default function Home() {
  const [data, setData] = useState({ trending: [], popular: [], movies: [], comedy: [], action: [], romance: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useReveal();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [trending, popular, movies, comedy, action, romance] = await Promise.all([
          animeService.trending(1, 12),
          animeService.popular(1, 12),
          animeService.movies(1, 12),
          animeService.byGenre('Comedy', 1, 12),
          animeService.byGenre('Action', 1, 12),
          animeService.byGenre('Romance', 1, 12),
        ]);
        if (alive) {
          setData({ trending, popular, movies, comedy, action, romance });
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
  }, []);

  const hero = data.trending[0];

  return (
    <>
      <Meta title="" description="CityTV: descubra animes populares, filmes, lançamentos e coleções por gênero." />
      <Hero anime={hero} loading={loading} />
      <div className="wrap">
        {error && (
          <div className="state" role="alert" style={{ marginTop: 22 }}>
            <h3>Catálogo indisponível</h3>
            <p>{error.message}</p>
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Recarregar</button>
          </div>
        )}
        <Row title="Em alta" subtitle="O que todo mundo está vendo" items={data.trending} loading={loading} link="/animes" />
        <AdSlot id={adsConfig.slots.homeBelowHero} />
        <Row title="Comédia sem lógica" subtitle="Não tente entender" items={data.comedy} loading={loading} link="/animes?genero=Comedy" />
        <Row title="Pancadaria garantida" subtitle="Ação do começo ao fim" items={data.action} loading={loading} link="/animes?genero=Action" />
        <Row title="Filmes" subtitle="Para maratonar num sábado" items={data.movies} loading={loading} link="/filmes" />
        <Row title="Romance" subtitle="Para aquecer o coração" items={data.romance} loading={loading} link="/animes?genero=Romance" />
        <Row title="Populares" subtitle="Os queridinhos da comunidade" items={data.popular} loading={loading} link="/populares" />
      </div>
    </>
  );
}
