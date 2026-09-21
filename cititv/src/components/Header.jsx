import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useScrolled } from '../hooks/hooks.js';

export default function Header({ onSearch }) {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e?.preventDefault();
    const term = q.trim();
    if (onSearch) onSearch(term);
    if (term.length >= 2) {
      navigate(`/busca?q=${encodeURIComponent(term)}`);
      setOpen(false);
    }
  };

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="CityTV início">
            <span className="brand-mark">C</span>
            <span>
              CityTV
              <small>Animes</small>
            </span>
          </Link>
          <nav className="nav" aria-label="Principal">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Início</NavLink>
            <NavLink to="/animes" className={({ isActive }) => (isActive ? 'active' : '')}>Animes</NavLink>
            <NavLink to="/generos" className={({ isActive }) => (isActive ? 'active' : '')}>Gêneros</NavLink>
            <NavLink to="/populares" className={({ isActive }) => (isActive ? 'active' : '')}>Populares</NavLink>
          </nav>
          <div className="header-right">
            <form className="searchbox" onSubmit={submit} role="search">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar anime…"
                aria-label="Buscar anime"
              />
              <button type="submit">Buscar</button>
            </form>
            <button className="icon-btn" onClick={() => setOpen((v) => !v)} aria-label="Menu">☰</button>
          </div>
        </div>
      </header>
      {open && (
        <nav className="mobile-nav" aria-label="Menu móvel">
          <NavLink to="/" end onClick={() => setOpen(false)}>Início</NavLink>
          <NavLink to="/animes" onClick={() => setOpen(false)}>Animes</NavLink>
          <NavLink to="/generos" onClick={() => setOpen(false)}>Gêneros</NavLink>
          <NavLink to="/populares" onClick={() => setOpen(false)}>Populares</NavLink>
        </nav>
      )}
    </>
  );
}
