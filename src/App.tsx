import { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home.tsx';
import Store from './pages/Store.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';
import Softwares from './pages/Softwares.tsx';
import Tutorials from './pages/Tutorials.tsx';
import Developer from './pages/Developer.tsx';
import SellerLogin from './pages/SellerLogin.tsx';
import SellerDashboard from './pages/SellerDashboard.tsx';
import Anime from './pages/Anime.tsx';
import WatchAnime from './pages/WatchAnime.tsx';

// --- Settings Context ---
interface SettingsContextType {
  homepageLayout: 'apps' | 'store' | 'anime';
  setHomepageLayout: (layout: 'apps' | 'store' | 'anime') => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  homepageLayout: 'apps',
  setHomepageLayout: () => {},
  loading: true
});

export const useSettings = () => useContext(SettingsContext);

function AppContent() {
  const { homepageLayout } = useSettings();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <ScrollToTop />
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={homepageLayout === 'store' ? <Store /> : homepageLayout === 'anime' ? <Anime /> : <Home />} />
          <Route path="/apps" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/watch/:animeId" element={<WatchAnime />} />
          <Route path="/softwares" element={<Softwares />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/login" element={<Login />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App(): JSX.Element {
  const [homepageLayout, setHomepageLayout] = useState<'apps' | 'store' | 'anime'>('apps');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/get-settings')
      .then(res => res.json())
      .then(data => {
        if (data.homepage_layout === 'store' || data.homepage_layout === 'apps' || data.homepage_layout === 'anime') {
           setHomepageLayout(data.homepage_layout);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ homepageLayout, setHomepageLayout, loading }}>
        <AppContent />
    </SettingsContext.Provider>
  );
}

export default App;
