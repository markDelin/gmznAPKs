import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';
import Developer from './pages/Developer.tsx';
import Anime from './pages/Anime.tsx';
import AnimeInfo from './pages/AnimeInfo.tsx';
import WatchAnime from './pages/WatchAnime.tsx';

function AppContent() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-[#ff6b44]/30">
      <ScrollToTop />
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Anime />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/anime/:animeId" element={<AnimeInfo />} />
          <Route path="/watch/:animeId" element={<WatchAnime />} />
          <Route path="/login" element={<Login />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App(): JSX.Element {
  return <AppContent />;
}

export default App;
