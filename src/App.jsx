import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import AnimeDetails from './pages/AnimeDetails.jsx';
import Animes from './pages/Animes.jsx';
import Filmes from './pages/Filmes.jsx';
import Generos from './pages/Generos.jsx';
import Home from './pages/Home.jsx';
import Populares from './pages/Populares.jsx';
import Search from './pages/Search.jsx';
import Watch from './pages/Watch.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/animes" element={<Animes />} />
          <Route path="/filmes" element={<Filmes />} />
          <Route path="/generos" element={<Generos />} />
          <Route path="/populares" element={<Populares />} />
          <Route path="/busca" element={<Search />} />
          <Route path="/anime/:slug" element={<AnimeDetails />} />
          <Route path="/assistir/:slug/:ep" element={<Watch />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
