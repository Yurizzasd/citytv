import { useEffect, useState } from 'react';
import Hero from '../components/Hero.jsx';
import Row from '../components/Row.jsx';
import Meta from '../components/Meta.jsx';
import AdSlot from '../components/ads/AdSlot.jsx';
import { adsConfig } from '../config/ads.js';
import { animeService } from '../services/api.js';
import { useReveal } from '../hooks/hooks.js';

export default function Home() {
  const [data, setData] = useState({ trending: [], popular: [], top: [], seasonal: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useReveal();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [trending, popular, top, seasonal] = await Promise.all([
          animeService.trending(1, 12),
          animeService.popular(1, 12),
          animeService.topRated(1, 12),
          animeService.seasonal(1, 12),
        ]);
        if (alive) {
          setData({ trending, popular, top, seasonal });
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
      <Meta title="" description="CityTV: descubra animes populares, lançamentos e mais assistidos. Assista com qualidade." />
      <Hero anime={hero} loading={loading} />
      <div className="wrap">
        {error && (
          <div className="state" role="alert" style={{ marginTop: 22 }}>
            <h3>Catálogo indisponível</h3>
            <p>{error.message}</p>
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Recarregar</button>
          </div>
        )}
        <Row title="🔥 Populares" items={data.popular} loading={loading} link="/populares" />
        <AdSlot id={adsConfig.slots.homeBelowHero} />
        <Row title="✨ Lançamentos" items={data.seasonal} loading={loading} link="/animes" />
        <Row title="👁 Mais assistidos" items={data.top} loading={loading} link="/populares" />
        <Row title="🎬 Animes em destaque" items={data.trending} loading={loading} link="/animes" />
      </div>
    </>
  );
}
