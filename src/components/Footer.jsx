import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <strong style={{ color: 'var(--text)' }}>CityTV</strong>
          <p style={{ maxWidth: 420 }}>
            Descubra e assista animes. Catálogo via AniList, episódios e fontes via Anivexa API.
            O CityTV não hospeda vídeos — apenas organiza a descoberta e reprodução.
          </p>
        </div>
        <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/animes">Animes</Link>
          <Link to="/filmes">Filmes</Link>
          <Link to="/generos">Gêneros</Link>
          <Link to="/populares">Populares</Link>
        </nav>
      </div>
    </footer>
  );
}
